<?php

namespace Database\Seeders;

use App\Models\PageSection;
use Illuminate\Database\Seeder;

/**
 * Seeds editable sections for the Headary SPA page (page_key = 'headary-spa').
 * Texts taken from frontend/src/app/services/translation.service.ts (faq.*),
 * mapped onto generic section types so admins can edit them via the panel.
 *
 * Most FAQ answers stay as `rich-text` because they are markdown-style bullet
 * blocks; hero & CTA use dedicated types with structured meta (CTA buttons).
 */
class HeadarySpaPageSeeder extends Seeder
{
    public function run(): void
    {
        $page = 'headary-spa';

        $sections = [
            [
                'section_key' => 'hero',
                'type' => 'hero',
                'order' => 10,
                'image_url' => 'assets/images/_MG_0453.jpg',
                'title' => ['pl' => 'Head SPA', 'en' => 'Head SPA', 'fi' => 'Head SPA'],
                'subtitle' => [
                    'pl' => 'Baza wiedzy',
                    'en' => 'Knowledge base',
                    'fi' => 'Tietopankki',
                ],
                'body' => [
                    'pl' => 'Wszystko, co warto wiedzieć o rytuale Head Spa w Headary SPA — przebieg zabiegu, efekty i jak się przygotować.',
                    'en' => 'Everything you want to know about a Head Spa ritual at Headary SPA — the experience, benefits and how to prepare.',
                    'fi' => 'Kaikki mitä haluat tietää Headary SPA:n Head Spa -rituaalista — hoidon kulku, vaikutukset ja valmistautuminen.',
                ],
                'meta' => [
                    'cta_label_pl' => 'Zarezerwuj wizytę',
                    'cta_label_en' => 'Book Appointment',
                    'cta_label_fi' => 'Varaa aika',
                    'cta_url' => 'https://timma.no/salong/headary-spa',
                ],
            ],

            [
                'section_key' => 'what-is-it',
                'type' => 'rich-text',
                'order' => 20,
                'title' => [
                    'pl' => 'Na czym polega zabieg Head Spa?',
                    'en' => 'What does the Head Spa treatment involve?',
                    'fi' => 'Mitä Head Spa -hoito sisältää?',
                ],
                'body' => [
                    'pl' => "Zabieg Head Spa polega na połączeniu pielęgnacji włosów i skóry głowy oraz głębokiego masażu relaksacyjnego. W Headary Spa rytuał obejmuje kilka etapów:\n• oczyszczanie skóry głowy z nadmiernego sebum, naskórka czy resztek kosmetyków\n• mycie i pielęgnacja włosów z indywidualnie dobranymi kosmetykami\n• masaż głowy — kluczowy element rytuału: jego zadaniem jest poprawić krążenie krwi, dotlenić cebulki włosów, a przede wszystkim rozluźnić i uspokoić układ nerwowy\n• sauna parowa — pomaga lepiej wniknąć kosmetykom w strukturę włosa\n• aromaterapia — naturalny olej eteryczny wybierany indywidualnie przez klienta\n• suszenie włosów oraz serwis wyciszającej herbaty",
                    'en' => "A Head Spa treatment combines hair and scalp care with a deep relaxation massage. At Headary Spa the ritual includes several stages:\n• scalp cleansing — removing excess sebum, dead skin and cosmetic residues\n• hair washing and care with individually selected cosmetics\n• head massage — the key element: improves blood circulation, oxygenates hair follicles and calms the nervous system\n• steam sauna — helps the cosmetics penetrate deeper into the hair structure\n• aromatherapy — natural essential oil chosen individually by the client\n• hair drying and a soothing herbal tea service",
                    'fi' => "Head Spa -hoito yhdistää hiusten ja päänahan hoidon sekä syvärentouttavan hieronnan. Headary Spassa rituaali sisältää useita vaiheita:\n• päänahan puhdistus — liiallinen talo, ihokarsta ja kosmetiikkajäämät\n• hiusten pesu ja hoito yksilöllisesti valituilla tuotteilla\n• päähieronta — rituaalin avainkohta: parantaa verenkiertoa, hapettaa hiusjuuria ja rauhoittaa hermostoa\n• höyrysauna — auttaa tuotteiden imeytymistä hiuksen rakenteeseen\n• aromaterapia — asiakkaalle yksilöllisesti valittu luonnollinen eteerinen öljy\n• hiusten kuivaus ja rauhoittava yrttitee-elämys",
                ],
            ],

            [
                'section_key' => 'effects',
                'type' => 'rich-text',
                'order' => 30,
                'title' => [
                    'pl' => 'Jakie są efekty po zabiegu Head Spa?',
                    'en' => 'What are the effects of a Head Spa treatment?',
                    'fi' => 'Mitkä ovat Head Spa -hoidon vaikutukset?',
                ],
                'body' => [
                    'pl' => "Efekty po zabiegu head spa widać i czuć właściwie od razu — zarówno na poziomie wyglądu włosów, jak i samopoczucia.\nTwoja skóra głowy będzie dokładnie oczyszczona, cebulki pobudzone i dotlenione do wzrostu, a włosy nawilżone i odżywione. Zaznasz głębokiego relaksu, układ nerwowy uspokoi się i zredukuje stres.\nPrzy regularnych zabiegach włosy staną się zdrowsze i mocniejsze, zauważysz szybszy i zdrowszy wzrost włosów, a także zmniejszenie problemu z przetłuszczaniem czy łupieżem.",
                    'en' => "The effects are visible and felt almost immediately — both in how your hair looks and how you feel.\nYour scalp will be thoroughly cleansed, hair follicles stimulated and oxygenated, and hair hydrated and nourished. You will experience deep relaxation — your nervous system calms down and stress is reduced.\nWith regular treatments, hair becomes healthier and stronger, you will notice faster and healthier growth, as well as a reduction in oiliness and dandruff.",
                    'fi' => "Vaikutukset näkyvät ja tuntuvat lähes heti — sekä hiusten ulkonäössä että hyvinvoinnissa.\nPäänahkasi on perusteellisesti puhdistettu, hiusjuuret stimuloituneet ja hapettuneet, hiukset kosteutetut ja ravitut. Koet syvää rentoutumista, hermostosi rauhoittuu ja stressi vähenee.\nSäännöllisillä hoidoilla hiukset muuttuvat terveemmiksi ja vahvemmiksi, huomaat nopeamman ja terveemmän kasvun sekä rasvoittumisen ja hilseen vähenemisen.",
                ],
                'meta' => ['variant' => 'highlight'],
            ],

            [
                'section_key' => 'for-whom',
                'type' => 'rich-text',
                'order' => 40,
                'title' => [
                    'pl' => 'Kto może skorzystać z zabiegu Head Spa?',
                    'en' => 'Who can benefit from a Head Spa treatment?',
                    'fi' => 'Kuka voi hyötyä Head Spa -hoidosta?',
                ],
                'body' => [
                    'pl' => "W Headary Spa z zabiegu może skorzystać każda kobieta, która ukończyła 16 rok życia.\nHead spa to rytuał stworzony z myślą o osobach potrzebujących zarówno skutecznej pielęgnacji, jak i chwili prawdziwego odprężenia. Jest idealny dla tych, którzy żyją intensywnie i odczuwają napięcie, ponieważ zabieg pozwala wyciszyć umysł i rozluźnić ciało poprzez głęboko relaksujący masaż skóry głowy.\nZabieg szczególnie docenią także osoby, których włosy są osłabione, matowe lub pozbawione objętości — regularne rytuały mogą poprawić ich kondycję, dodać blasku i wspomóc naturalny wzrost.\nHead spa jest skierowane do każdego, kto chce zadbać o siebie w sposób holistyczny — połączyć pielęgnację z relaksem i na chwilę zatrzymać się w codziennym biegu.",
                    'en' => "At Headary Spa the treatment is available for every woman aged 16 or older.\nHead Spa is a ritual created for those who need both effective care and a moment of true relaxation. It is ideal for people living intensively and feeling tension — the treatment calms the mind and relaxes the body through a deeply relaxing scalp massage.\nPeople with weakened, dull or flat hair will also appreciate it — regular rituals improve condition, add shine and support natural growth.\nHead Spa is for everyone who wants to take care of themselves holistically — combining care with relaxation and pausing for a moment in everyday life.",
                    'fi' => "Headary Spassa hoito on saatavilla jokaiselle naiselle, joka on täyttänyt 16 vuotta.\nHead Spa on rituaali, joka on luotu niille, jotka tarvitsevat sekä tehokasta hoitoa että hetken todellista rentoutumista. Se sopii täydellisesti intensiivisesti eläville ja jännitystä tuntemaan, sillä hoito rauhoittaa mielen ja rentouttaa kehon syvän päänahkahieronnan kautta.\nSen arvostavat erityisesti ne, joiden hiukset ovat heikentyneet, sameat tai ilman volyymiä — säännölliset rituaalit parantavat kuntoa, lisäävät kiiltoa ja tukevat luonnollista kasvua.\nHead Spa on jokaiselle, joka haluaa huolehtia itsestään kokonaisvaltaisesti — yhdistää hoidon rentoutumiseen ja pysähtyä hetkeksi arjen kiireessä.",
                ],
            ],

            [
                'section_key' => 'contraindications',
                'type' => 'rich-text',
                'order' => 50,
                'title' => [
                    'pl' => 'Jakie są przeciwwskazania do zabiegu Head Spa?',
                    'en' => 'What are the contraindications?',
                    'fi' => 'Mitkä ovat hoidon vasta-aiheet?',
                ],
                'body' => [
                    'pl' => "W Headary Spa Twoje zdrowie jest najważniejsze, dlatego przed każdym zabiegiem klient dostaje do wypełnienia kwestionariusz z pytaniami dotyczącymi zdrowia oraz kondycji skóry głowy i włosów.\n\n**Przeciwwskazania zdrowotne:**\n• choroby skóry głowy (zakażenia grzybicze, łuszczyca, egzema, zmiany ropne, otwarte rany) — masaż i produkty mogą nasilać stany zapalne lub rozprzestrzeniać infekcje\n• zakażenia bakteryjne, wirusowe lub pasożytnicze (np. wszy, aktywna opryszczka) — niesie ryzyko przeniesienia zakażenia\n• zabiegi dermatologiczne/estetyczne (np. mezoterapia skóry głowy, przeszczep włosów, laser) — skóra musi się całkowicie wygoić\n• świeże blizny, rany, szwy na głowie — masaż może ponownie otworzyć rany\n• nieleczone choroby układu krążenia (niekontrolowane wysokie ciśnienie, problemy kardiologiczne) — masaż i ciepło zwiększają przepływ krwi\n• ciąża — w tym okresie trzeba zachować szczególną ostrożność\n• silne alergie lub nadwrażliwość skóry\n• migrena w trakcie ostrego ataku\n• gorączka, przeziębienie lub ogólne infekcje\n\n**Przeciwwskazania ogólne:**\n• dredy, warkocze afrykańskie, bardzo splątane włosy — nie ma możliwości prawidłowego oczyszczenia włosa i wykonania masażu\n• przedłużane włosy (wiązania keratynowe, taśmy, mikroringi) — masaż i mycie mogą uszkodzić wiązania\n• świeżo farbowane/rozjaśniane włosy — skóra głowy może być podrażniona (lepiej odczekać około 1 tygodnia)\n• świeżo wystylizowane fryzury (upięcie, trwała) — zabieg zniszczy uzyskany efekt\n\nJeśli nie jesteś przekonana czy możesz skorzystać z zabiegu head spa, zapraszam do kontaktu w którym przeanalizujemy Twoje wątpliwości.",
                    'en' => "At Headary Spa your health is the priority, so before each treatment the client fills in a questionnaire about health and the condition of scalp and hair.\n\n**Health contraindications:**\n• scalp diseases (fungal infections, psoriasis, eczema, open wounds) — massage and products may worsen inflammation or spread infection\n• bacterial, viral or parasitic infections (e.g. lice, active herpes) — risk of transmission\n• recent dermatological/aesthetic treatments (scalp mesotherapy, hair transplant, laser) — skin must fully heal\n• fresh scars, wounds or stitches on the head — massage may reopen wounds\n• untreated cardiovascular diseases (uncontrolled high blood pressure, heart problems) — massage and heat increase blood flow\n• pregnancy — special caution is required\n• strong allergies or skin hypersensitivity\n• migraine during an acute attack\n• fever, cold or general infection\n\n**General contraindications:**\n• dreadlocks, African braids, heavily tangled hair — cannot be properly cleansed or massaged\n• hair extensions (keratin bonds, tapes, microrings) — massage and washing may damage bonds\n• freshly dyed/bleached hair — may cause irritation (better to wait about 1 week)\n• freshly styled hairstyles (updos, perms) — the treatment will undo the effect\n\nIf you are not sure whether you can benefit from the treatment, please contact me — we will discuss your concerns.",
                    'fi' => "Headary Spassa terveytesi on etusijalla, siksi ennen jokaista hoitoa asiakas täyttää kyselylomakkeen, jossa kysytään terveydestä ja päänahan sekä hiusten kunnosta.\n\n**Terveydelliset vasta-aiheet:**\n• päänahan sairaudet (sieni-infektiot, psoriasis, ihottuma, avoimet haavat) — hieronta ja tuotteet voivat pahentaa tulehdusta tai levittää infektiota\n• bakteeri-, virus- tai loistartunnat (esim. täit, aktiivinen herpes) — tartuntariski\n• äskettäiset dermatologiset/esteettiset toimenpiteet (päänahan mesoterapia, hiustensiirto, laser) — iho on parannuttava täysin\n• tuoreet arvet, haavat tai ompeleet päässä\n• hoitamattomat sydän- ja verisuonisairaudet (hallitsematon korkea verenpaine, sydänongelmat)\n• raskaus — erityistä varovaisuutta vaaditaan\n• voimakkaat allergiat tai ihon yliherkkyys\n• migreeni akuutin kohtauksen aikana\n• kuume, flunssa tai yleinen infektio\n\n**Yleiset vasta-aiheet:**\n• dreadit, afropalmikot, pahasti sotkeutuneet hiukset — ei voida kunnolla puhdistaa eikä hieroa\n• pidennetyt hiukset (keratiinisidokset, teipit, mikrorenkaat) — hieronta ja pesu voivat vaurioittaa sidoksia\n• juuri värjätyt/vaalennetut hiukset — voi aiheuttaa ärsytystä (parempi odottaa noin viikko)\n• juuri muotoillut kampaukset (nutturat, permanentit) — hoito poistaa saavutetun efektin\n\nJos et ole varma voitko hyötyä hoidosta, ota yhteyttä — käymme yhdessä läpi huolenaiheesi.",
                ],
            ],

            [
                'section_key' => 'preparation',
                'type' => 'rich-text',
                'order' => 60,
                'title' => [
                    'pl' => 'Jak przygotować się do zabiegu Head Spa?',
                    'en' => 'How to prepare for a Head Spa treatment?',
                    'fi' => 'Miten valmistautua Head Spa -hoitoon?',
                ],
                'body' => [
                    'pl' => "Przygotowanie do zabiegu jest bardzo proste, wystarczy kilka kroków:\n• ubierz się wygodnie, aby móc w pełni się zrelaksować\n• nie musisz specjalnie myć włosów przed zabiegiem — lepiej jeśli skóra głowy jest w naturalnym stanie\n• w dniu zabiegu staraj się unikać silnych środków stylizujących (suchy szampon, lakier, żel) — pomoże to skuteczniej oczyścić skórę głowy i zapewni lepszą absorpcję produktów\n• jeśli możesz, przyjdź bez makijażu i biżuterii — jeśli to niemożliwe, usunę Twój makijaż, a biżuterię przechowam na czas masażu w bezpiecznym miejscu\n• wycisz telefon i smartwatch, aby w pełni się zrelaksować\n• postaraj się, aby cały dzień był dla Ciebie — nie spiesz się, daj sobie więcej czasu niż trwa sam zabieg, abyś w spokoju mogła cieszyć się chwilą i spokojnie dokończyć herbatę\n• najważniejsze: zabierz ze sobą dobre nastawienie i pozwól sobie na relaks.",
                    'en' => "Preparation is very simple, just a few steps:\n• dress comfortably so you can fully relax\n• you don't need to wash your hair specially — it is better if the scalp is in its natural state\n• on the day of the treatment avoid strong styling products (dry shampoo, hairspray, gel) — this helps clean the scalp better and improves product absorption\n• if possible, come without makeup and jewellery — if not, I will remove your makeup and store jewellery safely during the massage\n• silence your mobile phone and smartwatch to fully disconnect\n• plan the whole day for yourself — don't rush, give yourself more time than the treatment itself so you can enjoy the moment and finish your tea peacefully\n• most important — bring a good mindset and allow yourself to relax.",
                    'fi' => "Valmistautuminen on hyvin yksinkertaista, tarvitset vain muutaman askeleen:\n• pukeudu mukavasti, jotta voit täysin rentoutua\n• sinun ei tarvitse pestä hiuksia erikseen — on parempi, jos päänahka on luonnollisessa tilassa\n• hoitopäivänä vältä voimakkaita muotoilutuotteita (kuivashampoo, hiuslakka, geeli) — tämä auttaa puhdistamaan päänahan tehokkaammin\n• jos mahdollista, tule ilman meikkiä ja koruja — jos ei, poistan meikkisi ja säilytän korut turvallisesti hieronnan ajaksi\n• hiljennä puhelin ja älykello irrottautuaksesi täysin arjesta\n• varaa koko päivä itsellesi — älä kiirehdi, anna itsellesi enemmän aikaa kuin hoito kestää, jotta voit nauttia hetkestä ja juoda teesi rauhassa\n• tärkeintä: tuo mukanasi hyvä asenne ja anna itsesi rentoutua.",
                ],
                'meta' => ['variant' => 'prep'],
            ],

            [
                'section_key' => 'cta',
                'type' => 'cta',
                'order' => 70,
                'title' => [
                    'pl' => 'Gotowa na chwilę tylko dla Ciebie?',
                    'en' => 'Ready for a moment just for you?',
                    'fi' => 'Valmis omaan hetkeesi?',
                ],
                'body' => [
                    'pl' => 'Zarezerwuj swój rytuał Head Spa lub napisz, jeśli masz dodatkowe pytania — chętnie pomogę Ci wybrać idealny zabieg.',
                    'en' => 'Book your Head Spa ritual or reach out if you still have questions — I would love to help you choose the perfect treatment.',
                    'fi' => 'Varaa Head Spa -rituaalisi tai ota yhteyttä, jos sinulla on vielä kysyttävää — autan mielelläni valitsemaan sopivan hoidon.',
                ],
                'meta' => [
                    'primary_label_pl' => 'Zarezerwuj',
                    'primary_label_en' => 'Book now',
                    'primary_label_fi' => 'Varaa nyt',
                    'primary_url' => 'https://timma.no/salong/headary-spa',
                    'secondary_label_pl' => 'Kontakt',
                    'secondary_label_en' => 'Contact',
                    'secondary_label_fi' => 'Yhteys',
                    'secondary_url' => '/#contact',
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

