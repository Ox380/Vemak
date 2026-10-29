// ask.mjs — „Paklausk mentoriaus" atsakymai.
//
// Atsakymai sudaromi TIK iš mokinio šios savaitės skaičių ir žaidimo taisyklių.
// Jokio išgalvoto fakto, jokio finansinio patarimo: kiekvienas sakinys remiasi
// perduotu kontekstu (žingsniai, sumos, paskirstymas, rinkos pokytis).

const eur = (n) => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const num = (n) => Math.round(Number(n) || 0);

export const BUCKETS = {
  sav: ['santaupos', 'Saugiausia dalis. Santaupos nejuda su rinka, todėl jos gelbsti, kai ateina netikėta išlaida.'],
  inv: ['investicijos', 'Dalis, kuri seka rinkos prognozes. Ji gali augti greičiausiai, bet ir kristi greičiausiai.'],
  bus: ['verslas', 'Tavo kavos baras. Pelnas priklauso nuo to, kaip pasirinkai plėtrą, o ne nuo rinkos.'],
  res: ['rezervas', 'Apsauginis sluoksnis. Jis pirmas padengia netikėtas išlaidas, todėl nereikia skolintis.'],
};

const TOPIC_HINTS = [
  ['praradimas', /nuostol|prarad|praradau|krito|krenta|sumažėjo|sumazejo|minus|blogai|nesisek|skol/i],
  ['pelnas', /peln|uždirb|uzdirb|augo|padidėjo|padidejo|plius|sekėsi|sekesi|gerai/i],
  ['rezervas', /rezerv/i],
  ['santaupos', /santaup|taup/i],
  ['investicijos', /investic|akcij|fond|rinkos prognoz|birž|birz/i],
  ['verslas', /versl|kavos bar|baras|plėtr|pletr/i],
  ['taskai', /tašk|task|reiting|lyder|vietą|vieta|konkurs/i],
  ['patarimas', /ką daryt|ka daryt|patark|patarim|kitą kart|kita kart|pagerint|išmok|ismok/i],
  ['saugumas', /tikri pinig|realūs pinig|realus pinig|saugu|duomen|privatum|nulauž|nulauz/i],
  ['skaiciavimas', /kaip skaičiuo|kaip skaiciuo|formul|taisykle|kaip veikia|kaip žaidžiam|kaip zaidziam/i],
];

function pick(question) {
  for (const [topic, re] of TOPIC_HINTS) if (re.test(question)) return topic;
  return 'santrauka';
}

function listSteps(items) {
  return items.map((s, i) => `${i + 1}) ${String(s.text || '').trim()} — ${eur(s.amount)}`).join('; ');
}

export function askAnswer(input = {}) {
  const question = String(input.question || '').trim().slice(0, 240);
  const c = input.context && typeof input.context === 'object' ? input.context : {};
  const steps = (Array.isArray(c.steps) ? c.steps : [])
    .filter((s) => s && typeof s === 'object')
    .slice(0, 24)
    .map((s) => ({ text: String(s.text || '').slice(0, 160), amount: Number(s.amount) || 0 }));
  const neg = steps.filter((s) => s.amount < 0);
  const pos = steps.filter((s) => s.amount > 0);
  const week = num(c.week) || 0;
  const delta = num(c.delta);
  const net = num(c.net);
  const alloc = c.alloc && typeof c.alloc === 'object' ? c.alloc : {};
  const weekLabel = week ? `${week} savaitės` : 'šios savaitės';

  if (!question) {
    return {
      topic: 'empty',
      answer: 'Įrašyk klausimą – atsakysiu pagal tavo šios savaitės skaičius. Pavyzdžiui: „Kodėl praradau pinigų?“ arba „Ką reiškia rezervas?“',
    };
  }

  const topic = pick(question);
  const biggestNeg = neg.slice().sort((a, b) => a.amount - b.amount)[0];
  const biggestPos = pos.slice().sort((a, b) => b.amount - a.amount)[0];
  const negSum = neg.reduce((t, s) => t + s.amount, 0);
  const posSum = pos.reduce((t, s) => t + s.amount, 0);

  let answer = '';

  if (topic === 'praradimas') {
    if (!neg.length) {
      answer = `Šią savaitę nė vienas tavo žingsnis nebuvo neigiamas, tad ${weekLabel} rezultatas yra ${eur(delta)}. Jei nori, paklausk, kuris sprendimas davė didžiausią naudą.`;
    } else {
      answer = `Tavo ${weekLabel} neigiami žingsniai: ${listSteps(neg)}. Iš viso jie sudaro ${eur(negSum)}.`
        + (biggestNeg ? ` Didžiausią įtaką padarė „${biggestNeg.text}“ (${eur(biggestNeg.amount)}) – tai ta vieta, kurią keisdamas gautum didžiausią skirtumą.` : '')
        + (c.expense ? ` Dalį to paaiškina netikėta išlaida (${eur(-num(c.expense))}); ją pirmiausia dengia rezervas.` : '')
        + (c.forced ? ' Kadangi rezervo nepakako, žaidimas priverstinai pardavė dalį turto su −15 % nuolaida. Tai brangiausias įmanomas sprendimas – būtent jo ir mokomasi.' : '');
    }
  } else if (topic === 'pelnas') {
    if (!pos.length) {
      answer = `Šią savaitę teigiamų žingsnių nebuvo, todėl pokytis ${eur(delta)}. Tai nėra pralaimėjimas: žaidime svarbu pamatyti, kuris sprendimas atnešė nuostolį, ir pakeisti jį kitą savaitę.`;
    } else {
      answer = `Tavo ${weekLabel} teigiami žingsniai: ${listSteps(pos)}. Iš viso jie pridėjo ${eur(posSum)}.`
        + (biggestPos ? ` Didžiausią dalį atnešė „${biggestPos.text}“ (${eur(biggestPos.amount)}).` : '')
        + ` Bendras savaitės pokytis: ${eur(delta)}.`;
    }
  } else if (topic === 'rezervas' || topic === 'santaupos' || topic === 'investicijos' || topic === 'verslas') {
    const key = { rezervas: 'res', santaupos: 'sav', investicijos: 'inv', verslas: 'bus' }[topic];
    const [name, what] = BUCKETS[key];
    const share = num(alloc[key]);
    const shareTxt = share ? ` Šią savaitę į ${name} paskyrei ${share} % kapitalo.` : ` Šią savaitę į ${name} nieko nepaskyrei.`;
    answer = `${name[0].toUpperCase() + name.slice(1)}: ${what}${shareTxt}`;
    if (topic === 'investicijos' && c.market && typeof c.market === 'object') {
      const parts = Object.entries(c.market)
        .filter(([, v]) => Number.isFinite(Number(v)))
        .map(([k, v]) => `${k} ${num(v) > 0 ? '+' : ''}${num(v)} %`);
      if (parts.length) answer += ` Šios savaitės rinkos pokytis: ${parts.join(', ')}.`;
    }
    if (topic === 'verslas' && Number.isFinite(Number(c.bizReturn))) {
      answer += ` Tavo kavos baro rezultatas šią savaitę: ${num(c.bizReturn) > 0 ? '+' : ''}${num(c.bizReturn)} %.`;
    }
  } else if (topic === 'taskai') {
    answer = 'Strategijos taškai skiriasi nuo eurų. Eurų pokytis rodo, kiek tavo turto pasikeitė šią savaitę, o taškai – ar paskirstymas buvo subalansuotas: jie skaičiuojami pagal tai, kaip paskirstei kapitalą ir kaip pasirinkimai atlaikė rinkos svyravimą. Todėl vieną savaitę gali uždirbti mažiau eurų, bet gauti daugiau taškų.'
      + (delta ? ` Tavo šios savaitės eurų pokytis: ${eur(delta)}.` : '');
  } else if (topic === 'patarimas') {
    answer = (biggestNeg
      ? `Didžiausią nuostolį atnešė „${biggestNeg.text}“ (${eur(biggestNeg.amount)}). Kitą savaitę pabandyk jį pakeisti ir likusią dalį laikyti paskirstytą, o ne viską viename krepšelyje.`
      : 'Šią savaitę nuostolio nebuvo. Kitą savaitę stenkis neišleisti rezervo: jis ir yra ta dalis, kuri apsaugo nuo priverstinio turto pardavimo.')
      + (num(alloc.res) === 0 ? ' Rezervas šią savaitę buvo 0 %, todėl netikėta išlaida būtų tekusi skolai.' : ` Rezervas sudarė ${num(alloc.res)} % – tai gera apsauga.`)
      + ' Tai mokymosi žaidimas, ne finansinė rekomendacija.';
  } else if (topic === 'saugumas') {
    answer = 'Žaidime naudojami tik virtualūs eurai: nėra mokėjimų, brokerio ar prizų, todėl prarasti tikrų pinigų negalima. Mokinio el. paštas nerenkamas – pakanka slapyvardžio ir klasės kodo, o klasės duomenis mokytojas gali ištrinti vienu paspaudimu.';
  } else if (topic === 'skaiciavimas') {
    answer = 'Sistema veikia pagal taisykles, ne pagal spėjimą: savaitės įvykis vienodas visai klasei, rinkos pokytis priskirtas iš anksto, o tavo rezultatas susideda iš tavo paties paskirstymo ir pasirinkimų. Atsakymus čia taip pat sudaro taisyklės iš tavo skaičių – jie nėra sugalvoti.';
  } else {
    const head = `Šios savaitės santrauka: pokytis ${eur(delta)}${net ? `, grynoji vertė ${eur(net)}` : ''}.`;
    const detail = [
      pos.length ? `Teigiami žingsniai: ${listSteps(pos)}.` : '',
      neg.length ? `Neigiami žingsniai: ${listSteps(neg)}.` : '',
    ].filter(Boolean).join(' ');
    answer = head + ' ' + (detail || 'Žingsnių duomenų šiai savaitei nėra.')
      + ' Klausk konkrečiau – pavyzdžiui: „Kodėl praradau pinigų?“, „Ką reiškia rezervas?“, „Kaip skaičiuojami taškai?“';
  }

  return {
    topic,
    answer,
    grounded: 'Atsakymas sudarytas iš tavo žaidimo skaičių ir žaidimo taisyklių.',
  };
}

export const SUGGESTED = [
  'Kodėl praradau pinigų?',
  'Kuris sprendimas davė daugiausiai?',
  'Ką reiškia rezervas?',
  'Kaip skaičiuojami taškai?',
];
