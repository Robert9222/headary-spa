<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $reviews = [
            [
                'client_name' => 'Annette J.',
                'client_email' => 'annette@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Uudenlainen erilainen kokemus minulle, omavalintainen tuoksu maailma ja hellävarainen hieronta🥰 rauhallinen ilmapiiri.'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Leena V.',
                'client_email' => 'leena@example.com',
                'service_id' => 2,
                'rating' => 5,
                'content' => ['fi' => 'Hieno kokemus ja palvelu todella hyvää'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Maria V.',
                'client_email' => 'mariav@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['en' => 'Absolutely a mindblowing experience! There\'s not enough words to describe how amazing it was. Beautiful space, amazing smells, relaxing massage and so much more. Truly an unique experience, would highly recommend to everyone 😍 Feeling so relaxed and peaceful after ❤️ Amazing customer service ❤️'],
                'language' => 'en',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Hanna-maija A.',
                'client_email' => 'hanna@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Oli mielenkiintoinen ja erilainen kokemus. Jännittyneenä odotin seuraavaa mitä tulee tapahtumaan ja tämä oli todella hyvää jännitystä. Seuraavaa kertaa odotellessa 😊'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Marjo L.',
                'client_email' => 'marjo@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Ihanan rentouttava työpäivän päätteeksi, on kiva aloittaa viikonloppu❤️ Suosittelen kokeilemaan. Hyvin pärjäsi myös ei niin kielitaitoisena👍'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Maija A.',
                'client_email' => 'maija@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Tämän rentouttavampaa hoitoa et löydä mistään. Suosittelen lämpimästi <3'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Jenna K.',
                'client_email' => 'jenna@example.com',
                'service_id' => 1,
                'rating' => 5,
                'content' => ['fi' => 'Ihan super ihana kokemus. Palaan varmasti.'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Elina T.',
                'client_email' => 'elina@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Aivan mielettömän ihana hoito. Suosittelen!'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Jenni M.',
                'client_email' => 'jenni@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['en' => 'Lovely, calming and the most relaxing experience!❤️'],
                'language' => 'en',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Marja T.',
                'client_email' => 'marja@example.com',
                'service_id' => 2,
                'rating' => 5,
                'content' => ['fi' => 'Ihanan rentouttava ja samalla virkistävä hoito👍'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
            [
                'client_name' => 'Maija A.',
                'client_email' => 'maija2@example.com',
                'service_id' => 3,
                'rating' => 5,
                'content' => ['fi' => 'Valitsin VIP Head Spa Ritualin: Rinnan, kaulan ja niskan hieronta, hellävarainen kasvohieronta (+ rauhoittava kangasnaamio), jade-silmämaskilla tai silmälaastareilla, syvä päähieronta, hiuspohjan puhdistus kuorinta-aineella ja ravitsevalla shampoolla, hiusnaamio tai hoitoainekäsittely, virkistävä hydrohieronta, hiusten höyryhoito (sauna), rauhoittava aromaterapia, hiusten kuivaus ja rentouttava yrttitee-elämys. Todellinen viiden tähden hemmottelukokemus, suosittelen lämpimästi kokeilemaan <3 <3'],
                'language' => 'fi',
                'is_approved' => true,
                'is_featured' => true,
            ],
        ];

        foreach ($reviews as $review) {
            Review::create($review);
        }
    }
}

