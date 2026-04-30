<?php

namespace Database\Seeders;

use App\Models\PageSection;
use Illuminate\Database\Seeder;

class KobidoPageSeeder extends Seeder
{
    public function run(): void
    {
        $page = 'kobido';

        $sections = [
            // 1. Hero
            [
                'section_key' => 'hero',
                'type' => 'hero',
                'order' => 10,
                'image_url' => 'assets/images/_MG_1327.jpg',
                'title' => ['pl' => 'KOBIDO', 'en' => 'KOBIDO', 'fi' => 'KOBIDO'],
                'subtitle' => ['pl' => 'Japoński masaż liftingujący', 'en' => 'Japanese facelifting massage', 'fi' => 'Japanilainen kasvohieronta'],
                'body' => [
                    'pl' => 'Naturalny lifting, głęboki relaks i harmonia ciała i umysłu',
                    'en' => 'Natural lifting, deep relaxation and harmony of body and mind',
                    'fi' => 'Luonnollinen kohotus, syvä rentoutuminen ja kehon ja mielen harmonia',
                ],
                'meta' => [
                    'cta_label_pl' => 'Zarezerwuj wizytę',
                    'cta_label_en' => 'Book Appointment',
                    'cta_label_fi' => 'Varaa aika',
                    'cta_url' => 'https://timma.no/salong/headary-spa',
                ],
            ],

            // 2. Na czym polega
            [
                'section_key' => 'what-is-it',
                'type' => 'rich-text',
                'order' => 20,
                'title' => [
                    'pl' => 'Na czym polega masaż Kobido?',
                    'en' => 'What is the Kobido massage?',
                    'fi' => 'Mitä Kobido-hieronta tarkoittaa?',
                ],
                'body' => [
                    'pl' => "Kobido to unikalny japoński masaż twarzy, uznawany za jeden z najbardziej zaawansowanych manualnych zabiegów kosmetycznych na świecie. Łącząc intensywne techniki liftingu, głęboki relaks i precyzyjną pracę mięśni, Kobido naturalnie odmładza rysy twarzy, poprawia jędrność skóry i przywraca zdrowy blask.\n\nTa wielopoziomowa terapia nie tylko wygładza zmarszczki i modeluje kontur twarzy, ale także uwalnia głębokie napięcie mięśniowe, zmniejsza stres i wspomaga drenaż limfatyczny, łącząc efekty estetyczne z regeneracją całego ciała.",
                    'en' => '',
                    'fi' => '',
                ],
            ],

            // 3. Efekty
            [
                'section_key' => 'effects',
                'type' => 'two-column-lists',
                'order' => 30,
                'title' => [
                    'pl' => 'Jakie są efekty po masażu Kobido?',
                    'en' => 'What are the effects of Kobido massage?',
                    'fi' => 'Mitä vaikutuksia Kobido-hieronnalla on?',
                ],
                'body' => [
                    'pl' => 'Efekty można zauważyć już po jednej sesji, ale największe korzyści pojawiają się przy regularnym wykonywaniu zabiegu.',
                    'en' => '',
                    'fi' => '',
                ],
                'content' => [
                    'pl' => [
                        'leftHeading' => 'Efekty po jednym zabiegu',
                        'leftItems' => [
                            'wyraźne rozświetlenie i poprawa kolorytu skóry',
                            'uczucie napięcia i lekkiego liftingu twarzy',
                            'zmniejszenie opuchlizny',
                            'wygładzenie drobnych zmarszczek mimicznych',
                            'lepsze ukrwienie i dotlenienie skóry',
                            'głębokie odprężenie i redukcja napięć mięśniowych',
                        ],
                        'rightHeading' => 'Efekty przy regularnych zabiegach',
                        'rightItems' => [
                            'widoczna poprawa owalu twarzy i efekt naturalnego liftingu',
                            'spłycenie zmarszczek i zapobieganie powstawaniu nowych',
                            'zwiększenie elastyczności i jędrności skóry',
                            'poprawa napięcia mięśni twarzy',
                            'długotrwała redukcja obrzęków i cieni pod oczami',
                            'pobudzenie produkcji kolagenu i elastyny',
                            'ogólna poprawa kondycji skóry i młodszy wygląd',
                        ],
                        'note' => "**Proszę pamiętać:** Efekty masażu twarzy zależą od wieku klienta, jego stanu zdrowia, stylu życia i stanu skóry. Każdy z nas jest inny, więc efekty masażu mogą być różne i nie są identyczne u każdego klienta. Aby uzyskać optymalne, długotrwałe i widoczne efekty, zaleca się powtarzanie masażu co 3–4 tygodnie, w zależności od indywidualnych potrzeb.",
                    ],
                    'en' => null,
                    'fi' => null,
                ],
                'meta' => ['right_highlight' => true],
            ],

            // 4. Dla kogo
            [
                'section_key' => 'for-whom',
                'type' => 'list',
                'order' => 40,
                'title' => [
                    'pl' => 'Kto może skorzystać z masażu Kobido?',
                    'en' => 'Who can benefit from Kobido massage?',
                    'fi' => 'Kuka voi hyötyä Kobido-hieronnasta?',
                ],
                'body' => [
                    'pl' => "W Headary Spa z zabiegu może skorzystać każda kobieta, która ukończyła 16. rok życia. Masaż Kobido jest zabiegiem uniwersalnym, dobieranym do potrzeb klienta po uprzedniej konsultacji przed masażem. Wykonuje się go zarówno w celach estetycznych, jak i relaksacyjnych.\n\n**Dla kogo jest masaż Kobido:**",
                    'en' => '',
                    'fi' => '',
                ],
                'content' => [
                    'pl' => [
                        'items' => [
                            'dla osób, które chcą poprawić owal twarzy i uzyskać efekt naturalnego liftingu',
                            'dla osób z oznakami starzenia (zmarszczki, utrata jędrności, opadająca skóra)',
                            'dla osób zestresowanych, z napięciem w obrębie twarzy, karku i szczęki',
                            'dla osób z tendencją do obrzęków i „ciężkiej" twarzy',
                            'dla osób pracujących przy komputerze (napięcia mięśniowe, zaciśnięta szczęka)',
                            'dla tych, którzy szukają naturalnej alternatywy dla zabiegów medycyny estetycznej',
                            'dla osób, które chcą poprawić krążenie i kondycję skóry',
                        ],
                        'footer' => '*Zabieg sprawdzi się praktycznie w każdym wieku.*',
                    ],
                    'en' => null,
                    'fi' => null,
                ],
                'meta' => ['variant' => 'check'],
            ],

            // 5. Przeciwwskazania
            [
                'section_key' => 'contraindications',
                'type' => 'warning-list',
                'order' => 50,
                'title' => [
                    'pl' => 'Jakie są przeciwwskazania do masażu Kobido?',
                    'en' => 'What are the contraindications for Kobido massage?',
                    'fi' => 'Mitä vasta-aiheita Kobido-hieronnalla on?',
                ],
                'content' => [
                    'pl' => [
                        'items' => [
                            ['text' => 'ostre stany zapalne (np. gorączka)'],
                            ['text' => 'zapalenie skóry (alergiczne, wirusowe, bakteryjne, grzybicze)'],
                            ['text' => 'uszkodzona lub zniszczona skóra twarzy'],
                            ['text' => 'nieleczone nadciśnienie tętnicze'],
                            [
                                'text' => 'zabiegi medycyny estetycznej:',
                                'children' => [
                                    'kwas hialuronowy (ok. 3 miesiące)',
                                    'botoks, mezoterapia, peelingi chemiczne, ekstrakcja zęba, makijaż permanentny (ok. 2 tygodnie)',
                                    'radiofrekwencja laserowa mikroigłowa (ok. 4 tygodnie)',
                                    'implant zęba (ok. 2 miesiące)',
                                    'zabiegi chirurgiczne w obszarze zabiegowym (ok. 6 miesięcy, po konsultacji lekarskiej)',
                                ],
                            ],
                            ['text' => 'ciąża'],
                            ['text' => 'ciężka cera naczyniowa'],
                            ['text' => 'obrzęk lub bóle głowy o nieznanej przyczynie'],
                            ['text' => 'ból zęba'],
                        ],
                        'footer' => 'Jeśli nie jesteś przekonana, czy możesz skorzystać z masażu, zapraszam do kontaktu — wspólnie przeanalizujemy Twoje wątpliwości.',
                    ],
                    'en' => null,
                    'fi' => null,
                ],
            ],

            // 6. Przygotowanie
            [
                'section_key' => 'preparation',
                'type' => 'list',
                'order' => 60,
                'title' => [
                    'pl' => 'Jak przygotować się do masażu Kobido?',
                    'en' => 'How to prepare for the Kobido massage?',
                    'fi' => 'Miten valmistautua Kobido-hierontaan?',
                ],
                'content' => [
                    'pl' => [
                        'items' => [
                            'jeśli masz taką możliwość, oczyść skórę przed masażem — jeśli to niemożliwe, nie martw się, przygotuję i oczyszczę twarz za Ciebie',
                            'unikaj alkoholu i ciężkich potraw, które mogą zepsuć Twój komfort podczas zabiegu',
                            'postaraj się nawodnić organizm — to pobudza krążenie i układ limfatyczny, a co za tym idzie, szybsze pozbycie się toksyn',
                            'nie wykonuj intensywnych zabiegów wcześniej (peelingi, kwasy itp.), ponieważ skóra może być zbyt wrażliwa',
                            'sprawdź przeciwwskazania i upewnij się, że możesz skorzystać z masażu Kobido',
                            'ubierz się wygodnie, najlepiej w top/bluzkę na ramiączkach, którą można zsunąć, aby móc masować szyję, kark i górną część ramion',
                            'przyjdź maksymalnie 10 minut wcześniej, aby na spokojnie wypełnić ankietę i porozmawiać o Twoich potrzebach',
                        ],
                        'tip' => '💡 Włosy po zabiegu mogą być nieco tłuste u nasady — nie ma zatem potrzeby, abyś specjalnie myła głowę przed przyjściem na zabieg.',
                    ],
                    'en' => null,
                    'fi' => null,
                ],
                'meta' => ['variant' => 'prep'],
            ],

            // 7. CTA
            [
                'section_key' => 'cta',
                'type' => 'cta',
                'order' => 70,
                'title' => [
                    'pl' => 'Gotowa na swój rytuał Kobido?',
                    'en' => 'Ready for your Kobido ritual?',
                    'fi' => 'Valmis Kobido-rituaaliisi?',
                ],
                'body' => [
                    'pl' => 'Podaruj sobie moment prawdziwego relaksu i naturalnego piękna.',
                    'en' => 'Give yourself a moment of true relaxation and natural beauty.',
                    'fi' => '',
                ],
                'meta' => [
                    'primary_label_pl' => 'Zarezerwuj wizytę',
                    'primary_label_en' => 'Book Appointment',
                    'primary_label_fi' => 'Varaa aika',
                    'primary_url' => 'https://timma.no/salong/headary-spa',
                    'secondary_label_pl' => '← Wróć do wszystkich zabiegów',
                    'secondary_label_en' => '← Back to all treatments',
                    'secondary_label_fi' => '← Takaisin hoitoihin',
                    'secondary_url' => '/services',
                ],
            ],
        ];

        foreach ($sections as $data) {
            PageSection::updateOrCreate(
                ['page_key' => $page, 'section_key' => $data['section_key']],
                array_merge(['page_key' => $page, 'is_active' => true], $data)
            );
        }
    }
}

