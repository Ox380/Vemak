// Server-only teaching content (quiz answers must never be sent to students).
export const LESSONS = [
  { week: 1, title: 'Poreikiai, norai ir pirmas pasirinkimas', minutes: 20,
    goal: 'Mokiniai skiria poreikius nuo norų ir supranta, kad kiekvienas pasirinkimas turi kainą.',
    activity: 'Mokiniai žaidžia 1 savaitę (10 min.), tada lygina strategijas klasėje.',
    questions: ['Kuo skiriasi poreikis nuo noro?', 'Kodėl vienas pasirinkimas pakeitė, kiek lieka verslui?', 'Ką darytum kitaip, jei galėtum pakartoti savaitę?'] },
  { week: 2, title: 'Rezervas ir netikėtos išlaidos', minutes: 20,
    goal: 'Mokiniai supranta, kodėl reikalingas atsarginis fondas.',
    activity: 'Palyginkite, kas turėjo rezervą, o kam teko parduoti investicijas su nuostoliu.',
    questions: ['Kam teko parduoti investicijas ir kodėl?', 'Kiek rezervo pakanka?', 'Kuo skiriasi rezervas nuo santaupų?'] },
  { week: 3, title: 'Infliacija ir kainų kilimas', minutes: 20,
    goal: 'Mokiniai supranta, kaip kylančios kainos mažina perkamąją galią.',
    activity: 'Aptarkite 4 reakcijas į kainų kilimą ir jų kainą per visą sezoną.',
    questions: ['Kodėl atsargos atsipirko (arba ne)?', 'Kuo skiriasi kainų kėlimas nuo išlaidų mažinimo?', 'Kaip infliacija veikia santaupas?'] },
  { week: 4, title: 'Rinkos svyravimai ir panika', minutes: 25,
    goal: 'Mokiniai supranta rizikos ir grąžos ryšį ir emocijų poveikį.',
    activity: 'Palyginkite tuos, kurie pardavė, laikė ir papildė investicijas.',
    questions: ['Kodėl žmonės parduoda po kritimo?', 'Kaip diversifikacija sumažino nuostolį?', 'Kokį planą turėtum prieš investuodamas?'] },
  { week: 5, title: 'Pajamos, laikas ir verslas', minutes: 20,
    goal: 'Mokiniai supranta pajamų, išlaidų ir pelno skirtumą.',
    activity: 'Mokiniai analizuoja verslo pajamas, išlaidas ir pelną.',
    questions: ['Kuo skiriasi pajamos nuo pelno?', 'Kada verta plėsti verslą?', 'Kodėl auga rizika, kai verslas didėja?']},
  { week: 6, title: 'Sezono apžvalga ir išvados', minutes: 30,
    goal: 'Mokiniai apibendrina, ką išmoko, ir palygina rezultatus prieš ir po žaidimo.',
    activity: 'Visi atlieka baigiamąjį testą ir aptaria geriausias strategijas.',
    questions: ['Kuri strategija buvo pati tvirčiausia ir kodėl?', 'Ką pakeistum savo tikrame biudžete?', 'Kas dar nesuprantama?'] },
];


// Quiz: 2 questions per topic. Set A = pre-test, set B = post-test. answer = index of the correct option.
export const QUIZ = {
  pre: [
    { topic: 'budget', q: 'Tavo mėnesio pajamos yra 100 €. Ką verta padaryti pirmiausia?', o: ['Išleisti viską, kol dar turi', 'Atskirti būtinus poreikius ir suplanuoti likutį', 'Pirkti tai, kam taikoma didžiausia nuolaida', 'Pasiskolinti dar 100 €'], a: 1 },
    { topic: 'budget', q: 'Turi 60 €, o iki savaitės pabaigos reikia 25 € transportui. Kiek gali skirti pramogai nepalikdamas skolos?', o: ['35 €', '60 €', '85 €', '0 €, nes pramogos visada blogos'], a: 0 },
    { topic: 'saving', q: 'Kam labiausiai skirtas atsarginis fondas?', o: ['Netikėtoms išlaidoms', 'Atostogoms', 'Brangiems pirkiniams su nuolaida', 'Kasdieniams saldumynams'], a: 0 },
    { topic: 'saving', q: 'Telefonui netikėtai sugedus, kuris sprendimas paprastai saugiausias?', o: ['Panaudoti rezervą, jei jis tam skirtas', 'Parduoti visą ilgalaikį turtą iš karto', 'Ignoruoti išlaidą', 'Skolintis didžiausią įmanomą sumą'], a: 0 },
    { topic: 'invest', q: 'Kas yra diversifikacija?', o: ['Visi pinigai vienoje akcijoje', 'Investicijų paskirstymas į skirtingus turtus', 'Pinigų laikymas tik grynaisiais', 'Investavimas be jokio plano'], a: 1 },
    { topic: 'invest', q: 'Kodėl verta prieš investuojant pasilikti dalį pinigų rezerve?', o: ['Kad nereikėtų parduoti investicijų per netikėtą išlaidą', 'Kad investicijos niekada nekristų', 'Kad gautum garantuotą pelną', 'Kad nereikėtų sekti savo biudžeto'], a: 0 },
    { topic: 'risk', q: 'Kuo didesnė galima grąža, tuo paprastai…', o: ['Mažesnė rizika', 'Nėra rizikos', 'Didesnė rizika', 'Pelno garantija didesnė'], a: 2 },
    { topic: 'risk', q: 'Rinka nukrito 10 %. Koks klausimas padeda priimti ramų sprendimą?', o: ['Ar mano ilgalaikis planas pasikeitė?', 'Ką visi kiti parduoda?', 'Kaip greitai galiu pasiskolinti?', 'Ar galiu susigrąžinti nuostolį per dieną?'], a: 0 },
  ],
  post: [
    { topic: 'budget', q: 'Kuri taisyklė geriausiai padeda planuoti biudžetą?', o: ['Pirmiausia išleisti, tada žiūrėti, kiek liko', 'Pirmiausia suplanuoti poreikius ir taupymą, tada išleisti likutį', 'Pirkti viską, kas atrodo pigu', 'Neskaičiuoti mažų pirkinių'], a: 1 },
    { topic: 'budget', q: 'Produktas su 20 % nuolaida nėra automatiškai geriausias, nes verta palyginti…', o: ['Vieneto kainą ir tikrą poreikį', 'Tik pakuotės spalvą', 'Kiek draugų jį perka', 'Ar reklama garsiai skamba'], a: 0 },
    { topic: 'saving', q: 'Kainos kyla 10 % per metus, o santaupos auga 2 %. Santaupų perkamoji galia…', o: ['Didėja', 'Nesikeičia', 'Mažėja', 'Tampa garantuota'], a: 2 },
    { topic: 'saving', q: 'Kodėl rezervas nėra tas pats, kas pinigai pramogoms?', o: ['Rezervas skirtas neplanuotoms būtinosioms išlaidoms', 'Rezervas visada uždirba daugiausia', 'Rezervą reikia išleisti iki mėnesio pabaigos', 'Pramogoms negalima planuoti biudžeto'], a: 0 },
    { topic: 'invest', q: 'Kodėl investuoti vienai savaitei rizikingiau nei ilgam laikui?', o: ['Nes trumpuoju laikotarpiu kainos gali smarkiai svyruoti', 'Nes trumpalaikės investicijos visada nuostolingos', 'Nes ilgas laikotarpis garantuoja pelną', 'Nes investicijos neturi jokios rizikos'], a: 0 },
    { topic: 'invest', q: 'Jei vienas turtas krenta, diversifikuotas portfelis gali būti atsparesnis, nes…', o: ['Kitas turtas gali kristi mažiau arba augti', 'Nuostolis automatiškai išnyksta', 'Visi turtai tampa be rizikos', 'Pelnas tampa garantuotas'], a: 0 },
    { topic: 'risk', q: 'Rinka nukrito 10 %, o tu investavai ilgam laikui. Kas atsakingiausia?', o: ['Peržiūrėti planą ir nepriimti sprendimo iš panikos', 'Parduoti viską vien todėl, kad krito', 'Pasiskolinti ir pirkti dar daugiau', 'Nustoti sekti visas išlaidas'], a: 0 },
    { topic: 'risk', q: 'Kuris teiginys apie riziką teisingas?', o: ['Didesnė galima grąža dažnai reiškia ir didesnę galimo nuostolio riziką', 'Didelė grąža visada garantuota', 'Riziką galima panaikinti reklama', 'Jei draugas uždirbo, uždirbsi ir tu'], a: 0 },
  ],
};
