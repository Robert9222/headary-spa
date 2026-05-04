<?php

namespace Database\Seeders;

use App\Models\PageSection;
use Illuminate\Database\Seeder;

/**
 * Seeds editable sections for the home page (page_key = 'home').
 * Texts copied from frontend/src/app/services/translation.service.ts so that
 * the admin panel can edit the same content the page used to render statically.
 *
 * Dynamic widgets (hero slider images, services grid, reviews, voucher modal,
 * Google map, footer links) remain rendered by the component itself; only
 * surrounding texts (titles, intros, descriptions, CTA labels) live here.
 */
class HomePageSeeder extends Seeder
{
    public function run(): void
    {
        $page = 'home';

        $sections = [
            // 1. Hero (slider tła + tytuł + CTA)
            [
                'section_key' => 'hero',
                'type' => 'hero',
                'order' => 10,
                'image_url' => 'assets/images/_MG_0013.jpg',
                'title' => [
                    'pl' => 'Zanurz się w czystą relaksację i odmłodzenie skóry głowy',
                    'en' => 'Indulge in Pure Relaxation and Scalp Rejuvenation',
                    'fi' => 'Nauti puhtaasta rentoutumisesta ja päänahkan uudistuksesta',
                ],
                'body' => [
                    'pl' => 'Doświadcz ostatecznych zabiegów head spa do głębokiej relaksacji i odmłodzenia skóry głowy',
                    'en' => 'Experience the ultimate head spa treatments for deep relaxation and scalp rejuvenation',
                    'fi' => 'Koe lopulliset head spa -hoitot syvään rentoutumiseen ja päänahkan uudistukseen',
                ],
                'meta' => [
                    'cta_label_pl' => 'Zarezerwuj wizytę',
                    'cta_label_en' => 'Book an Appointment',
                    'cta_label_fi' => 'Varaa aika',
                    'cta_url' => 'https://timma.no/salon/headary-spa',
                    'slides' => [
                        'assets/images/_MG_0013.jpg',
                        'assets/images/_MG_0124.jpg',
                        'assets/images/_MG_0183.jpg',
                        'assets/images/_MG_1327.jpg',
                        'assets/images/_MG_0453.jpg',
                    ],
                ],
            ],

            // 2. Welcome (powitanie)
            [
                'section_key' => 'welcome',
                'type' => 'rich-text',
                'order' => 20,
                'title' => [
                    'pl' => 'Witaj w Headary SPA',
                    'en' => 'Welcome to Headary SPA',
                    'fi' => 'Tervetuloa Headary SPA:han',
                ],
                'body' => [
                    'pl' => 'Head Spa — to luksusowy zabieg na skórę głowy i włosy, wywodzący się z Japonii, stworzony aby głęboko oczyścić, stymulować i odmłodzić zarówno skórę głowy, jak i umysł ✨',
                    'en' => 'Head Spa — is a luxurious scalp and hair treatment originating from Japan, designed to deeply cleanse, stimulate, and rejuvenate both the scalp and the mind ✨',
                    'fi' => 'Head Spa — on ylellinen päänahka- ja hiushoito, joka on peräisin Japanista ja joka on suunniteltu puhdistamaan, stimuloimaan ja uudistamaan sekä päänahkaa että mieltä ✨',
                ],
            ],

            // 3. About me (zdjęcie + bio)
            [
                'section_key' => 'about',
                'type' => 'image-text',
                'order' => 30,
                'image_url' => 'assets/images/me.jpg',
                'title' => [
                    'pl' => 'O mnie',
                    'en' => 'About Me',
                    'fi' => 'Tietoa minusta',
                ],
                'body' => [
                    'pl' => "Moi! Nazywam się Eliza, mam 31 lat i pochodzę z Polski. Od 2017 roku mieszkam w Finlandii, gdzie z uważnością i zaangażowaniem rozwijam swoją pasję do masażu, którą odkryłam na nowo jako drogę do harmonii ciała i umysłu.\n\nTworzę przestrzeń, w której każda kobieta może zatrzymać się na chwilę, odetchnąć i doświadczyć głębokiego relaksu oraz świadomej troski o siebie. Wierzę, że prawdziwe piękno zaczyna się od wewnętrznej równowagi i spokoju.\n\nPrywatnie jestem mamą dwójki dzieci, a w wolnych chwilach odnajduję inspirację w fotografii, dostrzegając piękno w subtelnych detalach codzienności.\n\n**Jeśli szukasz holistycznego i naturalnego podejścia do masażu — trafiłaś w idealne miejsce.**",
                    'en' => "Hi! My name is Eliza, I'm 31 years old and I come from Poland. I've been living in Finland since 2017, where with mindfulness and dedication I develop my passion for massage, which I rediscovered as a path to harmony of body and mind.\n\nI create a space where every woman can stop for a moment, breathe out, and experience deep relaxation and conscious self-care. I believe that true beauty begins with inner balance and peace.\n\nPrivately, I am a mother of two children, and in my free time I find inspiration in photography, noticing beauty in the subtle details of everyday life.\n\n**If you are looking for a holistic and natural approach to massage — you have come to the perfect place.**",
                    'fi' => "Moi! Nimeni on Eliza, olen 31-vuotias ja kotoisin Puolasta. Olen asunut Suomessa vuodesta 2017, ja kehitän täällä intohimoani hierontaan tietoisesti ja omistautuneesti — löysin sen uudelleen polkuna kehon ja mielen harmoniaan.\n\nLuon tilan, jossa jokainen nainen voi pysähtyä hetkeksi, hengittää ja kokea syvää rentoutumista sekä tietoista itsestä huolenpitoa. Uskon, että todellinen kauneus alkaa sisäisestä tasapainosta ja rauhasta.\n\nYksityiselämässä olen kahden lapsen äiti, ja vapaa-ajalla löydän inspiraationi valokuvauksesta, huomaamalla kauneutta arjen hienovaraisissa yksityiskohdissa.\n\n**Jos etsit kokonaisvaltaista ja luonnollista lähestymistapaa hierontaan — olet tullut juuri oikeaan paikkaan.**",
                ],
            ],

            // 4. Services intro (nad listą zabiegów)
            [
                'section_key' => 'services-intro',
                'type' => 'rich-text',
                'order' => 40,
                'title' => [
                    'pl' => 'Nasze popularne zabiegi Head Spa',
                    'en' => 'Our Popular Head Spa Services',
                    'fi' => 'Suosituimmat Head Spa -palvelumme',
                ],
                'body' => [
                    'pl' => '',
                    'en' => '',
                    'fi' => '',
                ],
            ],

            // 5. How it works (4 kroki)
            [
                'section_key' => 'how-it-works',
                'type' => 'steps',
                'order' => 50,
                'title' => [
                    'pl' => 'Jak wygląda wizyta?',
                    'en' => 'How Does a Visit Look?',
                    'fi' => 'Miten käynti etenee?',
                ],
                'content' => [
                    'pl' => [
                        'items' => [
                            ['icon' => '📅', 'title' => 'Rezerwacja', 'desc' => 'Wybierz zabieg i zarezerwuj wygodny termin online'],
                            ['icon' => '💬', 'title' => 'Konsultacja', 'desc' => 'Omawiamy Twoje potrzeby i dobieramy idealne aromaty'],
                            ['icon' => '✨', 'title' => 'Zabieg', 'desc' => 'Relaksuj się podczas luksusowego rytuału head spa dopasowanego do Ciebie'],
                            ['icon' => '🍵', 'title' => 'Relaks', 'desc' => 'Zakończ herbatą ziołową i ciesz się długotrwałym spokojem i odmłodzeniem'],
                        ],
                    ],
                    'en' => [
                        'items' => [
                            ['icon' => '📅', 'title' => 'Booking', 'desc' => 'Choose your treatment and book a convenient time online'],
                            ['icon' => '💬', 'title' => 'Consultation', 'desc' => 'We discuss your needs and select the perfect aromas'],
                            ['icon' => '✨', 'title' => 'Treatment', 'desc' => 'Relax during a luxurious head spa ritual tailored to you'],
                            ['icon' => '🍵', 'title' => 'Relaxation', 'desc' => 'Finish with herbal tea and enjoy lasting calm and rejuvenation'],
                        ],
                    ],
                    'fi' => [
                        'items' => [
                            ['icon' => '📅', 'title' => 'Varaus', 'desc' => 'Valitse hoito ja varaa sopiva aika verkossa'],
                            ['icon' => '💬', 'title' => 'Konsultaatio', 'desc' => 'Keskustelemme tarpeistasi ja valitsemme täydelliset tuoksut'],
                            ['icon' => '✨', 'title' => 'Hoito', 'desc' => 'Rentoudu ylellisen, sinulle räätälöidyn head spa -rituaalin aikana'],
                            ['icon' => '🍵', 'title' => 'Rentoutuminen', 'desc' => 'Päätä yrttiteehen ja nauti pitkäkestoisesta rauhasta ja uudistumisesta'],
                        ],
                    ],
                ],
            ],

            // 6. Voucher (główny blok)
            [
                'section_key' => 'voucher',
                'type' => 'rich-text',
                'order' => 60,
                'image_url' => 'assets/images/_MG_0183.jpg',
                'title' => [
                    'pl' => 'Zamów voucher prezentowy',
                    'en' => 'Order a Gift Voucher',
                    'fi' => 'Tilaa lahjakortti',
                ],
                'subtitle' => [
                    'pl' => 'Voucher na dowolny zabieg Head Spa to idealny pomysł dla wszystkich, którzy szukają wyjątkowego prezentu i cenią sobie prawdziwy relaks.',
                    'en' => 'A voucher for any Head Spa treatment is the perfect gift idea for anyone who loves true relaxation.',
                    'fi' => 'Lahjakortti mihin tahansa Head Spa -hoitoon on täydellinen lahjaidea kaikille, jotka etsivät erityistä lahjaa ja arvostavat aitoa rentoutumista.',
                ],
                'body' => [
                    'pl' => 'Nie musisz decydować teraz — osoba obdarowana może wybrać dowolny zabieg z naszej oferty Head Spa i zrealizować go w Headary SPA w dogodnym dla siebie terminie. Dzięki temu masz pewność, że Twój prezent będzie zawsze trafiony i idealnie dopasowany do indywidualnych preferencji obdarowanej osoby.',
                    'en' => "You don't have to decide now — the recipient can choose any treatment from our Head Spa menu and redeem it at Headary SPA at a time that suits them best. This way you can be sure your gift will always be a hit and perfectly tailored to the recipient's individual preferences.",
                    'fi' => 'Sinun ei tarvitse päättää nyt — lahjan saaja voi valita minkä tahansa Head Spa -hoidon valikoimastamme ja käyttää sen Headary SPA:ssa hänelle sopivana ajankohtana. Näin voit olla varma, että lahjasi osuu aina oikeaan ja on räätälöity lahjan saajan yksilöllisten mieltymysten mukaan.',
                ],
                'meta' => [
                    'cta_label_pl' => 'Zamów voucher',
                    'cta_label_en' => 'Order a Voucher',
                    'cta_label_fi' => 'Tilaa lahjakortti',
                ],
            ],

            // 7. Voucher terms (regulamin)
            [
                'section_key' => 'voucher-terms',
                'type' => 'rich-text',
                'order' => 65,
                'title' => [
                    'pl' => 'Regulamin karty podarunkowej',
                    'en' => 'Gift Card Terms',
                    'fi' => 'Lahjakortin ehdot',
                ],
                'body' => [
                    'pl' => "1. Sprawdź datę ważności swojej karty i wybierz idealny moment na chwilę relaksu.\n2. Umów się na wizytę poprzez aplikację Timma, wiadomość na Instagramie lub drogą SMS na numer podany w karcie.\n3. Przynieś ze sobą swój voucher lub jego numer. Akceptujemy wersję cyfrową, możesz ją okazać wydrukowaną lub w telefonie.\n4. Karty podarunkowe nie podlegają zwrotowi ani wymianie na gotówkę, należy wykorzystać całą wartość karty — reszta nie jest wydawana. Jeśli wybrana usługa kosztuje więcej niż wartość karty, można dokupić dodatkowe zabiegi lub dopłacić różnicę w salonie.\n5. Przed zakupem lub realizacją karty należy zapoznać się z przeciwwskazaniami do wybranego zabiegu. Jeśli u osoby obdarowanej występują którekolwiek z wymienionych przeciwwskazań, zastrzegamy sobie prawo do odmowy wykonania zabiegu. W takich przypadkach karta zachowuje swoją ważność i nie przyjmujemy zwrotów pieniędzy.\n6. Kartę podarunkową można przekazać innej osobie niż pierwotnie obdarowana — należy jednak okazać kartę i poinformować o tym przed rozpoczęciem zabiegu.\n7. Ciesz się swoim czasem i bądź tu i teraz. To Twoja chwila na odprężenie, regenerację i poczucie zaopiekowania.",
                    'en' => "1. Check the expiry date of your card and choose the perfect moment to relax.\n2. Book your appointment via the Timma app, Instagram message or SMS to the number on the card.\n3. Bring your voucher or its number with you. We accept the digital version — show it printed or on your phone.\n4. Gift cards cannot be refunded or exchanged for cash; the full value must be used — change is not given. If the chosen service costs more than the card value, you can add extra treatments or pay the difference at the salon.\n5. Before purchasing or redeeming the card, please review the contraindications for the selected treatment. If the recipient has any of the listed contraindications, we reserve the right to refuse the treatment. In such cases the card retains its validity and refunds are not issued.\n6. The gift card may be passed to a person other than the original recipient — please present the card and inform us before the treatment begins.\n7. Enjoy your time and be here and now. This is your moment to relax, regenerate and feel cared for.",
                    'fi' => "1. Tarkista lahjakortin voimassaoloaika ja valitse täydellinen hetki rentoutumiselle.\n2. Varaa aika Timma-sovelluksen kautta, Instagram-viestillä tai tekstiviestillä kortissa olevaan numeroon.\n3. Ota lahjakortti tai sen numero mukaan. Hyväksymme digitaalisen version — voit näyttää sen tulostettuna tai puhelimesta.\n4. Lahjakortteja ei palauteta eikä vaihdeta rahaksi; kortin koko arvo tulee käyttää — takaisin ei anneta vaihtorahaa. Jos valittu palvelu maksaa enemmän kuin kortin arvo, voit lisätä hoitoja tai maksaa erotuksen salongissa.\n5. Ennen kortin ostoa tai käyttöä tutustu valitun hoidon vasta-aiheisiin. Jos saajalla on jokin mainituista vasta-aiheista, pidätämme oikeuden kieltäytyä hoidosta. Tällöin kortti säilyttää voimassaolonsa eikä rahaa palauteta.\n6. Lahjakortin voi luovuttaa muulle kuin alkuperäiselle saajalle — näytä kuitenkin kortti ja ilmoita siitä ennen hoidon alkua.\n7. Nauti ajastasi ja ole tässä ja nyt. Tämä on sinun hetkesi rentoutua, palautua ja kokea olevasi hoidettu.",
                ],
            ],

            // 8. Reviews intro
            [
                'section_key' => 'reviews-intro',
                'type' => 'rich-text',
                'order' => 70,
                'title' => [
                    'pl' => 'Opinie klientów',
                    'en' => 'Client Reviews',
                    'fi' => 'Asiakaspalautteet',
                ],
                'body' => [
                    'pl' => '',
                    'en' => '',
                    'fi' => '',
                ],
            ],

            // 9. Footer disclaimer
            [
                'section_key' => 'footer-disclaimer',
                'type' => 'rich-text',
                'order' => 90,
                'title' => [
                    'pl' => '',
                    'en' => '',
                    'fi' => '',
                ],
                'body' => [
                    'pl' => 'Zastrzegam sobie prawo do odmowy wykonania zabiegu w przypadku występowania przeciwwskazań zdrowotnych u klientki lub w sytuacji spóźnienia przekraczającego 15 minut bez uprzedniego poinformowania.',
                    'en' => 'I reserve the right to refuse a treatment in case of health contraindications or if a client is more than 15 minutes late without prior notice.',
                    'fi' => 'Pidätän oikeuden kieltäytyä hoidon suorittamisesta, jos asiakkaalla on terveydellisiä vasta-aiheita tai jos hän myöhästyy yli 15 minuuttia ilman ennakkoilmoitusta.',
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

