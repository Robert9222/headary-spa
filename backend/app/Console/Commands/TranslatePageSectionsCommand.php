<?php

namespace App\Console\Commands;

use App\Models\PageSection;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class TranslatePageSectionsCommand extends Command
{
    protected $signature = 'page-sections:translate
        {pageKey : The page key to translate (e.g. kobido)}
        {--source=pl : Source language (default pl)}
        {--targets=en,fi : Comma-separated target languages}
        {--force : Overwrite existing translations even if they differ from source}';

    protected $description = 'Auto-translate title/subtitle/body/content fields of a page\'s sections using MyMemory free API.';

    public function handle(): int
    {
        $pageKey = $this->argument('pageKey');
        $source = $this->option('source');
        $targets = array_filter(array_map('trim', explode(',', $this->option('targets'))));
        $force = (bool) $this->option('force');

        $sections = PageSection::forPage($pageKey)->get();
        if ($sections->isEmpty()) {
            $this->error("No sections found for page key '{$pageKey}'.");
            return self::FAILURE;
        }

        $this->info("Translating " . $sections->count() . " section(s) of page '{$pageKey}' from {$source} → " . implode(', ', $targets));

        foreach ($sections as $s) {
            $this->line("\n→ Section: <info>{$s->section_key}</info> ({$s->type})");

            foreach (['title', 'subtitle', 'body'] as $field) {
                $sourceText = $s->getTranslation($field, $source, false);
                if (!$sourceText) continue;
                foreach ($targets as $tgt) {
                    $existing = $s->getTranslation($field, $tgt, false);
                    if (!$force && $existing && $existing !== $sourceText) {
                        $this->line("   · {$field} [{$tgt}] — zachowane (już przetłumaczone)");
                        continue;
                    }
                    $translated = $this->translate($sourceText, $source, $tgt);
                    $s->setTranslation($field, $tgt, $translated);
                    $this->line("   ✓ {$field} [{$tgt}]: " . mb_substr($translated, 0, 70));
                }
            }

            // Deep content translation
            $content = $s->getTranslations('content');
            $sourceContent = $content[$source] ?? null;
            if (is_array($sourceContent)) {
                foreach ($targets as $tgt) {
                    $existing = $content[$tgt] ?? null;
                    $hasMeaningfulExisting = is_array($existing) && !$force && json_encode($existing) !== json_encode($sourceContent);
                    if ($hasMeaningfulExisting) {
                        $this->line("   · content [{$tgt}] — zachowane (już przetłumaczone)");
                        continue;
                    }
                    $translatedContent = $this->translateDeep($sourceContent, $source, $tgt);
                    $s->setTranslation('content', $tgt, $translatedContent);
                    $this->line("   ✓ content [{$tgt}] (pola: " . $this->countStrings($translatedContent) . ")");
                }
            }

            // Meta labels (cta_label_pl, primary_label_pl, secondary_label_pl)
            $meta = $s->meta ?? [];
            $touched = false;
            foreach (['cta_label', 'primary_label', 'secondary_label'] as $prefix) {
                $srcKey = "{$prefix}_{$source}";
                if (empty($meta[$srcKey]) || !is_string($meta[$srcKey])) continue;
                foreach ($targets as $tgt) {
                    $tgtKey = "{$prefix}_{$tgt}";
                    $existing = $meta[$tgtKey] ?? null;
                    if (!$force && $existing && $existing !== $meta[$srcKey]) continue;
                    $meta[$tgtKey] = $this->translate($meta[$srcKey], $source, $tgt);
                    $touched = true;
                    $this->line("   ✓ meta.{$tgtKey}: " . $meta[$tgtKey]);
                }
            }
            if ($touched) $s->meta = $meta;

            $s->save();
        }

        $this->info("\n✔ Done.");
        return self::SUCCESS;
    }

    private function translateDeep($value, string $source, string $target)
    {
        if (is_string($value)) {
            return trim($value) === '' ? $value : $this->translate($value, $source, $target);
        }
        if (is_array($value)) {
            // assoc or list? treat both the same - map through
            $out = [];
            foreach ($value as $k => $v) {
                $out[$k] = $this->translateDeep($v, $source, $target);
            }
            return $out;
        }
        return $value;
    }

    private function translate(string $text, string $source, string $target): string
    {
        if ($source === $target || trim($text) === '') return $text;
        try {
            $response = Http::timeout(20)->get('https://api.mymemory.translated.net/get', [
                'q'        => $text,
                'langpair' => "{$source}|{$target}",
                'de'       => config('mail.from.address', 'admin@headary-spa.local'),
            ]);
            if (!$response->ok()) return $text;
            $translated = $response->json('responseData.translatedText');
            // Small pause to be gentle on free API
            usleep(200000); // 200ms
            return is_string($translated) && $translated !== '' ? $translated : $text;
        } catch (\Throwable $e) {
            $this->warn('   (błąd tłumaczenia: ' . $e->getMessage() . ')');
            return $text;
        }
    }

    private function countStrings($value): int
    {
        if (is_string($value)) return 1;
        if (is_array($value)) {
            $n = 0;
            foreach ($value as $v) $n += $this->countStrings($v);
            return $n;
        }
        return 0;
    }
}

