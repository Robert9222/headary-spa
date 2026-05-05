<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Konwerter obrazów JPG/PNG -> WebP.
 *
 * PHP w tym środowisku nie ma rozszerzenia GD ani Imagick,
 * więc używamy zewnętrznego skryptu Node + sharp
 * (`tools/convert-images/convert-one.mjs`).
 *
 * Po udanej konwersji oryginał jest usuwany, a metoda zwraca
 * RELATYWNĄ ścieżkę do pliku .webp wewnątrz dysku 'public'
 * (np. "services/abc.webp").
 *
 * Jeśli konwersja się nie powiedzie (brak Node, brak sharp,
 * uszkodzony plik) — metoda zwraca oryginalną ścieżkę bez zmian.
 */
class WebpConverter
{
    /**
     * @param string $relativePath Ścieżka względna na dysku 'public', np. "services/abc.jpg".
     * @return string Nowa ścieżka względna (".webp" gdy się udało, oryginalna gdy nie).
     */
    public static function convert(string $relativePath): string
    {
        $ext = strtolower(pathinfo($relativePath, PATHINFO_EXTENSION));
        if (!in_array($ext, ['jpg', 'jpeg', 'png'], true)) {
            return $relativePath;
        }

        // Bierzemy realny root dysku 'public' (po zmianie konfiguracji to
        // jest `public_path('storage')`, więc nie hardkodujemy ścieżki).
        $publicRoot = rtrim(Storage::disk('public')->path(''), DIRECTORY_SEPARATOR);
        $absolute = $publicRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
        if (!is_file($absolute)) {
            return $relativePath;
        }

        $script = base_path('../tools/convert-images/convert-one.mjs');
        if (!is_file($script)) {
            $script = realpath(base_path() . '/../tools/convert-images/convert-one.mjs') ?: $script;
        }
        if (!is_file($script)) {
            Log::warning('WebpConverter: convert-one.mjs not found', ['expected' => $script]);
            return $relativePath;
        }

        try {
            $process = new Process(['node', $script, $absolute]);
            $process->setTimeout(60);
            $process->run();

            if (!$process->isSuccessful()) {
                Log::warning('WebpConverter: node failed', [
                    'file' => $relativePath,
                    'stderr' => $process->getErrorOutput(),
                    'stdout' => $process->getOutput(),
                ]);
                return $relativePath;
            }

            $payload = json_decode(trim($process->getOutput()), true);
            if (!is_array($payload) || empty($payload['ok'])) {
                return $relativePath;
            }
        } catch (ProcessFailedException $e) {
            Log::warning('WebpConverter: process exception', ['err' => $e->getMessage()]);
            return $relativePath;
        }

        // Sukces — pochodna ścieżka .webp
        $dir = dirname($relativePath);
        $base = pathinfo($relativePath, PATHINFO_FILENAME);
        $newRel = ($dir === '.' || $dir === '') ? $base . '.webp' : $dir . '/' . $base . '.webp';

        return $newRel;
    }
}

