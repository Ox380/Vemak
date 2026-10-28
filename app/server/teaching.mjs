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
    { topic: 'budget', q: 'Kuris iš šių dalykų yra poreikis, o ne noras?', o: ['Naujas žaidimas', 'Mėnesinis transporto bilietas į mokyklą', 'Vakarienė restorane'], a: 1 },
    { topic: 'saving', q: 'Kam labiausiai skirtas atsarginis fondas (rezervas)?', o: ['Netikėtoms išlaidoms', 'Atostogoms', 'Brangiems pirkiniams su nuolaida'], a: 0 },
    { topic: 'invest', q: 'Kas yra diversifikacija?', o: ['Visi pinigai vienoje geriausioje akcijoje', 'Investicijų paskirstymas į skirtingus turtus', 'Pinigų laikymas tik grynaisiais'], a: 1 },
    { topic: 'risk',   q: 'Kuo didesnė galima grąža, tuo paprastai…', o: ['Mažesnė rizika', 'Nėra rizikos', 'Didesnė rizika'], a: 2 },
  ],
  post: [
    { topic: 'budget', q: 'Kuri taisyklė padeda geriausiai planuoti biudžetą?', o: ['Pirmiausia išleisti, tada žiūrėti, kiek liko', 'Pirmiausia suplanuoti poreikius ir taupymą, tada išleisti likusius pinigus', 'Pirkti viską, kas atrodo pigu'], a: 1 },
    { topic: 'saving', q: 'Kainos kyla 10 % per metus, o santaupos auga 2 %. Santaupų perkamoji galia…', o: ['Didėja', 'Nesikeičia', 'Mažėja'], a: 2 },
    { topic: 'invest', q: 'Kodėl investuoti vienai savaitei yra rizikingiau nei ilgam laikui?', o: ['Nes trumpuoju laikotarpiu kainos svyruoja labiau', 'Nes trumpalaikės investicijos visada nuostolingos', 'Nes mokesčiai didesni'], a: 0 },
    { topic: 'risk',   q: 'Rinka nukrito 10 %, o tu investavai ilgam laikui. Kas geriausia?', o: ['Panikuoti ir parduoti viską', 'Pasiskolinti ir pirkti dar daugiau', 'Peržiūrėti planą ir nepriimti sprendimų iš panikos'], a: 2 },
  ],
};
