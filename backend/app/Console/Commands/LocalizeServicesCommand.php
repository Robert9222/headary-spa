<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;

/**
 * One-off helper that ensures the four default head spa services exist in the
 * database with full PL/EN/FI translations. Use it after upgrading the
 * application so the admin panel shows Polish content (instead of seed-time
 * English only) without having to wipe and re-seed the whole database.
 *
 * Matching strategy: we look up each service by any existing translation of
 * its English name. If found, we overwrite name/description/category with the
 * translated arrays. If not found, we create a new row.
 *
 * Usage:
 *   php artisan services:localize-pl           # update / insert defaults
 *   php artisan services:localize-pl --force   # overwrite even if PL already set
 */
class LocalizeServicesCommand extends Command
{
    protected $signature = 'services:localize-pl {--force : Overwrite even if a Polish translation is already present}';

    protected $description = 'Backfill PL/EN/FI translations for the default head spa services.';

    public function handle(): int
    {
        $force = (bool) $this->option('force');
        $defaults = $this->defaults();

        foreach ($defaults as $def) {
            $service = $this->findExisting($def['match']);

            if ($service) {
                $hasPl = trim((string) $service->getTranslation('name', 'pl', false)) !== '';
                if ($hasPl && !$force) {
                    $this->line("• Pomijam (PL już istnieje): " . $def['name']['pl']);
                    continue;
                }
                $service->setTranslations('name', $def['name']);
                $service->setTranslations('description', $def['description']);
                $service->category = $def['category'];
                $service->save();
                $this->info("✓ Zaktualizowano: " . $def['name']['pl']);
            } else {
                Service::create([
                    'name' => $def['name'],
                    'description' => $def['description'],
                    'category' => $def['category'],
                    'price' => $def['price'],
                    'duration_minutes' => $def['duration_minutes'],
                    'image_url' => $def['image_url'],
                    'is_active' => true,
                    'order' => $def['order'],
                ]);
                $this->info("+ Utworzono: " . $def['name']['pl']);
            }
        }

        return self::SUCCESS;
    }

    private function findExisting(array $matchNames): ?Service
    {
        foreach (Service::all() as $s) {
            foreach (['pl', 'en', 'fi'] as $lang) {
                $val = trim((string) $s->getTranslation('name', $lang, false));
                if ($val !== '' && in_array($val, $matchNames, true)) {
                    return $s;
                }
            }
        }
        return null;
    }

    private function defaults(): array
    {
        return [
            [
                'match' => ['Head Spa Classic Ritual', 'Head Spa Classic – Rytuał Klasyczny'],
                'name' => [
                    'pl' => 'Head Spa Classic – Rytuał Klasyczny',
                    'en' => 'Head Spa Classic Ritual',
                    'fi' => 'Head Spa Classic -rituaali',
                ],
                'category' => 'Head Spa',
                'description' => [
                    'pl' => 'Jadeitowa maska na oczy lub płatki pod oczy, głęboki masaż głowy (techniki na sucho i mokro z użyciem specjalistycznych masażerów), oczyszczanie skóry głowy peelingiem złuszczającym i odżywczym szamponem, maska lub odżywka do włosów, rewitalizujący hydromasaż, terapia parowa włosów (sauna), kojąca aromaterapia, suszenie włosów oraz relaksujące zioła w filiżance herbaty. ⏰ 90 min.',
                    'en' => 'Jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰ 90 min.',
                    'fi' => 'Jadekasvonaamio tai silmälaput, syvä päähieronta (kuivat ja märät tekniikat erikoismassagereilla), päänahan puhdistus kuorinnalla ja ravitsevalla shampoolla, hiusnaamio tai hoitoaine, virkistävä hydrohieronta, hiusten höyryhoito (sauna), rauhoittava aromaterapia, hiusten kuivaus ja rentouttava yrttitee. ⏰ 90 min.',
                ],
                'price' => 99.00,
                'duration_minutes' => 90,
                'image_url' => 'assets/images/_MG_0275.jpg',
                'order' => 1,
            ],
            [
                'match' => ['Head Spa Classic & Face', 'Head Spa Classic & Twarz', 'Head Spa Classic z masażem twarzy'],
                'name' => [
                    'pl' => 'Head Spa Classic z masażem twarzy',
                    'en' => 'Head Spa Classic with Facial',
                    'fi' => 'Head Spa Classic ja kasvohoito',
                ],
                'category' => 'Head Spa',
                'description' => [
                    'pl' => 'Delikatny masaż twarzy zakończony kojącą maską w płachcie, jadeitowa maska na oczy lub płatki pod oczy, głęboki masaż głowy (techniki na sucho i mokro z użyciem specjalistycznych masażerów), oczyszczanie skóry głowy peelingiem i odżywczym szamponem, maska lub odżywka do włosów, rewitalizujący hydromasaż, terapia parowa włosów (sauna), kojąca aromaterapia, suszenie włosów oraz relaksująca herbata ziołowa. ⏰ 105 min.',
                    'en' => 'Gentle facial massage finished with a calming sheet mask, jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰ 105 min.',
                    'fi' => 'Lempeä kasvohieronta päättyy rauhoittavaan kangasnaamioon, jadekasvonaamio tai silmälaput, syvä päähieronta (kuivat ja märät tekniikat), päänahan puhdistus kuorinnalla ja ravitsevalla shampoolla, hiusnaamio tai hoitoaine, virkistävä hydrohieronta, hiusten höyryhoito (sauna), rauhoittava aromaterapia, hiusten kuivaus ja yrttitee. ⏰ 105 min.',
                ],
                'price' => 109.00,
                'duration_minutes' => 105,
                'image_url' => 'assets/images/_MG_1387.jpg',
                'order' => 2,
            ],
            [
                'match' => ['VIP Head Spa Ritual', 'VIP Head Spa – Rytuał Premium'],
                'name' => [
                    'pl' => 'VIP Head Spa – Rytuał Premium',
                    'en' => 'VIP Head Spa Ritual',
                    'fi' => 'VIP Head Spa -rituaali',
                ],
                'category' => 'Head Spa',
                'description' => [
                    'pl' => 'Masaż klatki piersiowej, szyi i karku, delikatny masaż twarzy zakończony kojącą maską w płachcie, jadeitowa maska na oczy lub płatki pod oczy, głęboki masaż głowy (techniki na sucho i mokro z użyciem specjalistycznych masażerów), oczyszczanie skóry głowy peelingiem i odżywczym szamponem, maska lub odżywka do włosów, rewitalizujący hydromasaż, terapia parowa włosów (sauna), kojąca aromaterapia, suszenie włosów oraz relaksująca herbata ziołowa. ⏰ 120 min.',
                    'en' => 'Massage of chest, neck and nape, gentle facial massage finished with a calming sheet mask, jade eye mask or eye patches, deep head massage (dry & wet techniques using specialized massagers), scalp cleansing with exfoliating scrub and nourishing shampoo, hair mask or conditioner treatment, revitalizing hydromassage, hair steaming therapy (sauna), soothing aromatherapy, hair drying & relaxing herbal tea experience. ⏰ 120 min.',
                    'fi' => 'Rinnan, kaulan ja niskan hieronta, lempeä kasvohieronta rauhoittavalla kangasnaamiolla, jadekasvonaamio tai silmälaput, syvä päähieronta, päänahan puhdistus kuorinnalla ja ravitsevalla shampoolla, hiusnaamio tai hoitoaine, virkistävä hydrohieronta, hiusten höyryhoito (sauna), rauhoittava aromaterapia, hiusten kuivaus ja yrttitee. ⏰ 120 min.',
                ],
                'price' => 129.00,
                'duration_minutes' => 120,
                'image_url' => 'assets/images/_MG_0453.jpg',
                'order' => 3,
            ],
            [
                'match' => ['Kobido Facelifting Massage', 'Kobido – Japoński masaż liftingujący twarzy'],
                'name' => [
                    'pl' => 'Kobido – Japoński masaż liftingujący twarzy',
                    'en' => 'Kobido Facelifting Massage',
                    'fi' => 'Kobido-kasvojenkohotushieronta',
                ],
                'category' => 'Inne masaże',
                'description' => [
                    'pl' => 'Kobido to wyjątkowy japoński masaż twarzy uznawany za jeden z najbardziej zaawansowanych manualnych zabiegów na świecie. Łączy intensywne techniki liftingujące, głęboki relaks oraz precyzyjną pracę na mięśniach, dzięki czemu naturalnie odmładza rysy twarzy, poprawia jędrność skóry i przywraca zdrowy blask. Ta wielopoziomowa terapia nie tylko wygładza zmarszczki i modeluje owal twarzy, ale także uwalnia głębokie napięcia mięśniowe, redukuje stres i wspiera drenaż limfatyczny – łącząc efekty estetyczne z pełną regeneracją organizmu. Każda sesja Kobido jest indywidualnie dopasowana do potrzeb skóry i mięśni. Sesja Kobido obejmuje: ➡️ Uwolnienie głębokich napięć mięśniowych ➡️ Manualny drenaż limfatyczny wspomagający detoks i krążenie ➡️ Intensywny masaż liftingujący modelujący i ujędrniający twarz ➡️ Elementy relaksacyjne redukujące stres i napięcie emocjonalne. 🕛 Każda sesja trwa od 60 do 90 minut.',
                    'en' => 'Kobido is a unique Japanese facial massage, considered one of the most advanced manual facial treatments in the world. By combining intensive lifting techniques, deep relaxation, and precise muscle work, Kobido naturally rejuvenates facial features, improves skin firmness, and restores a healthy glow. This multi-level therapy not only smooths wrinkles and defines the facial contour, but also releases deep muscular tension, reduces stress, and supports lymphatic drainage - combining aesthetic results with full-body regeneration. Each Kobido session is individually tailored to your skin and muscle needs. A Kobido session includes: ➡️ Deep muscle tension release ➡️ Manual lymphatic drainage to support detoxification and circulation ➡️ Intensive lifting massage to sculpt and firm the face ➡️ Relaxation elements to reduce stress and emotional tension. 🕛 Each session lasts approximately 60 to 90 minutes.',
                    'fi' => 'Kobido on ainutlaatuinen japanilainen kasvohieronta, jota pidetään yhtenä maailman edistyneimmistä manuaalisista kasvohoidoista. Yhdistämällä intensiivisiä kohotustekniikoita, syvää rentoutusta ja tarkkaa lihastyötä Kobido nuorentaa kasvonpiirteitä luonnollisesti, parantaa ihon kiinteyttä ja palauttaa terveen hehkun. 🕛 Kesto noin 60–90 minuuttia.',
                ],
                'price' => 69.00,
                'duration_minutes' => 75,
                'image_url' => 'assets/images/_MG_1327.jpg',
                'order' => 4,
            ],
        ];
    }
}

