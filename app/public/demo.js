// demo.js — deterministic, one-week anonymous VEMAK demonstration.
export const DEMO_CAPITAL = 1000;
export const DEMO_SCENARIOS = Object.freeze([
  { id: 'ai-model-launch', title: 'Naujo DI modelio pristatymas', body: 'Vietos DI laboratorija kitą savaitę pristatys naują modelį. Serverių tiekėjai praneša apie augančius užsakymus.', signals: { shares: 'positive', technology: 'strong-positive', business: 'positive', savings: 'steady' } },
  { id: 'inflation-report', title: 'Aukštesnės maisto ir energijos kainos', body: 'Infliacijos ataskaita vėl viršijo lūkesčius. Šeimos mažina nebūtinus pirkinius, o taupomųjų sąskaitų pasiūlymai šiek tiek pagerėjo.', signals: { shares: 'negative', technology: 'negative', business: 'strong-negative', savings: 'positive' } },
  { id: 'school-tech-contract', title: 'Technologijų bendrovė laimėjo mokyklų sutartį', body: 'Viena technologijų bendrovė pasirašė sutartį su mokyklų tinklu. IT tiekėjai tikisi naujų užsakymų.', signals: { shares: 'steady', technology: 'positive', business: 'steady', savings: 'steady' } },
  { id: 'interest-rate-hike', title: 'Centrinis bankas pakėlė palūkanas', body: 'Kova su infliacija pabrangino paskolas. Taupytojai gali gauti daugiau palūkanų.', signals: { shares: 'negative', technology: 'strong-negative', business: 'negative', savings: 'strong-positive' } },
  { id: 'export-deal', title: 'Atveriamas eksporto kelias', body: 'Prekybos partneriai sumažino muitus vietos gaminiams. Eksporto užsakymai auga.', signals: { shares: 'positive', technology: 'steady', business: 'strong-positive', savings: 'steady' } },
  { id: 'fuel-prices', title: 'Kuras pabrango', body: 'Degalų kainos pasiekė šių metų aukštumas. Vežėjai kelia kainas, o smulkus verslas mažina maržas.', signals: { shares: 'negative', technology: 'steady', business: 'negative', savings: 'positive' } },
  { id: 'school-season', title: 'Prasideda mokslo metai', body: 'Rugsėjį šeimos daugiau išleidžia mokyklos reikmenims, drabužiams ir būreliams.', signals: { shares: 'steady', technology: 'positive', business: 'strong-positive', savings: 'negative' } },
  { id: 'jobs-report', title: 'Nedarbo ataskaita pagerėjo', body: 'Įmonės vėl samdo daugiau žmonių, o atlyginimai auga lėčiau nei kainos.', signals: { shares: 'positive', technology: 'positive', business: 'positive', savings: 'steady' } },
  { id: 'energy-winter', title: 'Žiema ir šildymo sąskaitos', body: 'Šaltis padidino energijos vartojimą, o šildymo sąskaitos auga. Namų biudžetai mažina kitas išlaidas.', signals: { shares: 'negative', technology: 'steady', business: 'strong-negative', savings: 'positive' } },
  { id: 'local-festival', title: 'Miesto festivalis', body: 'Savaitgalį vyksta miesto šventė. Maistas, prekyba ir paslaugos sulaukia daugiau klientų.', signals: { shares: 'steady', technology: 'steady', business: 'strong-positive', savings: 'negative' } },
  { id: 'rate-cut', title: 'Palūkanos mažinamos', body: 'Centrinis bankas sumažino palūkanas. Paskolos pinga, bet taupymas duoda mažiau.', signals: { shares: 'strong-positive', technology: 'positive', business: 'positive', savings: 'negative' } },
  { id: 'supply-delay', title: 'Tiekimo grandinės vėlavimas', body: 'Uoste stringa kroviniai. Prekių pristatymas vėluoja, o kai kurios kainos kyla.', signals: { shares: 'negative', technology: 'negative', business: 'negative', savings: 'steady' } },
]);

// Demo pradeda nuo dar nematyto scenarijaus, kad pasikartojimų nebūtų.
let scenarioOffset = 0;
export function setDemoScenarioOffset(n) {
  const total = DEMO_SCENARIOS.length;
  scenarioOffset = ((Math.floor(Number(n) || 0) % total) + total) % total;
}
export const DEMO_MARKET_STORIES = Object.freeze([
  { id: "sales-fraud-scandal", title: "Skandalas: dingo pardavimų pinigai", body: "Rinkos rytą paaiškėja, kad populiari prekybos platforma galimai slėpė dalį pardavimų. Trūksta pinigų, prekyba sustabdyta, o tyrėjai tikrina įrašus. Kitos įmonės skuba paaiškinti, ar jų sąskaitos tvarkingos.", signals: {"shares": "negative", "technology": "negative", "business": "positive", "savings": "steady"}, outcome: "Tyrėjai randa dalį dingusių pinigų. Platformos akcijos krenta, o patikimesni vietos verslai sulaukia klientų." },
  { id: "investor-demo", title: "Investuotojai išbando naują technologiją", body: "Į uždarą vietos startuolio demonstraciją atvyksta keli stambūs investuotojai. Jie patys išbando prototipą ir paprašo antro susitikimo. Internete jau kyla spėlionės, bet sandorio dar nėra.", signals: {"shares": "positive", "technology": "strong-positive", "business": "negative", "savings": "steady"}, outcome: "Investuotojai pasirašo ketinimų protokolą po sėkmingo prototipo bandymo. Technologijų įmonės laimi labiausiai." },
  { id: "credit-crunch", title: "Krizė: bankai pristabdo paskolas", body: "Po netikėtų bankų nuostolių skolintojai pristabdo paskolas. Įmonės atideda plėtrą, šeimos atšaukia didesnius pirkinius, o santaupas norinčių apsaugoti žmonių eilės ilgėja.", signals: {"shares": "negative", "technology": "strong-negative", "business": "negative", "savings": "positive"}, outcome: "Bankai pristabdo paskolas, o įmonės atideda plėtrą. Santaupos išlaiko vertę geriausiai." },
  { id: "battery-breakthrough", title: "Naujas baterijos bandymas sustabdomas", body: "Vietos laboratorija atšaukia svarbų baterijos bandymą po netikėto perkaitimo. Bendrovė sako, kad niekas nenukentėjo, bet partneriai laukia atsakymų, o konkurentai skelbia savo bandymų rezultatus.", signals: {"shares": "negative", "technology": "positive", "business": "positive", "savings": "steady"}, outcome: "Paaiškėja, kad sugedo jutiklis, o ne baterija. Technologijų bendrovės atgauna pasitikėjimą." },
  { id: "market-fair-orders", title: "Vietos mugė sulaukia didelio užsakymo", body: "Savaitgalio mugėje keli vietos gamintojai sulaukia bendro užsakymo iš didelio pardavėjo. Komandos skaičiuoja, ar pajėgs laiku pagaminti prekes; kiti prekybininkai stebi, ar pirkėjų entuziazmas išsilaikys.", signals: {"shares": "positive", "technology": "positive", "business": "strong-positive", "savings": "steady"}, outcome: "Didelis pirkėjas patvirtina mugės užsakymą. Vietos verslai ir technologijų tiekėjai gauna postūmį." },
]);
export const DEMO_MARKET_ASSETS = Object.freeze([
  { key: 'shares', label: 'Akcijų fondas' }, { key: 'technology', label: 'Technologijų fondas' },
  { key: 'business', label: 'Vietos verslas' }, { key: 'savings', label: 'Santaupos' },
]);
const MARKET_RETURNS = Object.freeze([
  { shares: -0.10, technology: -0.07, business: 0.045, savings: 0.02 },
  { shares: 0.12, technology: 0.24, business: -0.025, savings: 0.012 },
  { shares: -0.13, technology: -0.16, business: -0.12, savings: 0.045 },
  { shares: -0.055, technology: 0.18, business: 0.055, savings: 0.014 },
  { shares: 0.085, technology: 0.055, business: 0.08, savings: 0.014 },
]);
export function getDemoMarketStory(weekNo = 1) {
  const index = Math.max(0, Math.min(DEMO_MARKET_STORIES.length - 1, (Number(weekNo) || 1) - 1));
  return { ...DEMO_MARKET_STORIES[index], returns: MARKET_RETURNS[index] };
}
export function getDemoMarketWinner(weekNo = 1) {
  const story = getDemoMarketStory(weekNo);
  return DEMO_MARKET_ASSETS.reduce((best, asset) => story.returns[asset.key] > story.returns[best.key] ? asset : best, DEMO_MARKET_ASSETS[0]);
}
export function scoreDemoMarketGuess(weekNo, predictedAsset) {
  const winner = getDemoMarketWinner(weekNo);
  return { correct: predictedAsset === winner.key, winner: winner.key, winnerLabel: winner.label, bonus: predictedAsset === winner.key ? 25 : 0 };
}

export const DEMO_SCENARIO_EVENTS = Object.freeze([
  { title: 'Pasirink savaitės rinkos scenarijų', body: 'Perskaityk naujieną ir įvertink, kurioms rinkoms ji gali padėti ar pakenkti.' },
  ...DEMO_SCENARIOS.map(({ title, body }) => ({ title, body })),
]);
export const DEMO_EVENTS = Object.freeze(DEMO_SCENARIO_EVENTS);
export const DEMO_EVENT = { title: 'Kainos kyla: kaip paskirstysi 1 000 €?', body: 'Ekonomikoje kyla kainos. Turi 1 000 €. Pasirink kryptį, o tada paskirstyk visus pinigus tarp santaupų, investicijų, verslo ir avarinio rezervo.', emergency: 120 };
export function getDemoEvent(weekNo = 1) {
  const total = DEMO_SCENARIOS.length;
  const start = Math.max(1, Math.min(total, Number(weekNo) || 1)) - 1;
  const index = (start + scenarioOffset) % total;
  const scenario = DEMO_SCENARIOS[index];
  const emergency = [120, 140, 100, 80, 90, 110, 130, 90, 100, 120][index] ?? 120;
  return { title: scenario.title, body: scenario.body, emergency, scenario, outlook: { signals: scenario.signals, body: scenario.body } };
}

export const DEMO_CHOICES = [
  { key: 'business', label: 'Paleidžiu mugės verslą', desc: 'Verslo dalis gauna didesnį postūmį, bet avarija lieka tavo rizika.', icon: '☕' },
  { key: 'invest', label: 'Investuoju į augimą', desc: 'Investicijos auga greičiau, bet rinkos rezultatas nėra garantuotas.', icon: '📈' },
  { key: 'protect', label: 'Perku apsaugą', desc: 'Sumoku 40 €, o netikėta išlaida sumažėja iki 40 €.', icon: '🛡️' },
  { key: 'scholarship', label: 'Pildau stipendijos paraišką (+120 €)', desc: 'Skiriu laiko paraiškai; rezultatas nėra garantuotas, bet šiame scenarijuje stipendija skiriama.', icon: '🎓' },
  { key: 'freelance', label: 'Pasiimu freelance užduotį (+180 €)', desc: 'Didesnis atlygis už skaitmeninį darbą, bet lieka mažiau laiko.', icon: '💻' },
  { key: 'course', label: 'Moku už įgūdžių kursą (−80 €)', desc: 'Mažiau pinigų dabar, bet įgyji įgūdžių būsimoms galimybėms.', icon: '📚' },
  { key: 'marketplace', label: 'Parduodu nenaudojamą daiktą (+90 €)', desc: 'Pinigai gaunami pardavus turimą daiktą — tai nėra naujos pajamos.', icon: '🛍️' },
];

// The public demo uses ten real decisions, not ten decorative progress labels.
export const DEMO_STEPS = [
  { title: 'Kišenpinigiai', prompt: 'Gavai 100 €. Kaip pradėsi mėnesį?', choices: [
    { key: 'save', label: 'Atidedu 70 €', delta: 70, lesson: 'Atidėjai didžiąją dalį pajamų ir sustiprinai savo finansinį rezervą.' },
    { key: 'spend', label: 'Išleidžiu 70 € pramogoms', delta: 0, lesson: 'Pramogos gali būti vertingos, bet visų pajamų išleidimas nepalieka saugumo pagalvės.' },
  ] },
  { title: 'Maistas ir poreikiai', prompt: 'Kaip sutaupysi kasdienėms būtinosioms išlaidoms?', choices: [
    { key: 'plan', label: 'Suplanuoju pirkinius', delta: 45, lesson: 'Pirkinių planas padeda atskirti poreikius nuo impulsyvių pirkinių.' },
    { key: 'impulse', label: 'Perku spontaniškai', delta: -25, lesson: 'Spontaniški pirkiniai dažnai padidina išlaidas, nors poreikiai nepasikeičia.' },
  ] },
  { title: 'Taupyti ar išleisti', prompt: 'Nori naujo daikto, bet turi ilgalaikį tikslą.', choices: [
    { key: 'goal', label: 'Taupau ilgalaikiam tikslui', delta: 60, lesson: 'Atidėtas pirkinys priartino tave prie tikslo ir išlaikė pasirinkimo laisvę.' },
    { key: 'want', label: 'Perku dabar', delta: -40, lesson: 'Pirkimas suteikia naudą dabar, tačiau tavo taupymo tikslas nutolsta.' },
  ] },
  { title: 'Pigesnis pasirinkimas', prompt: 'Randi du vienodos paskirties produktus.', choices: [
    { key: 'compare', label: 'Palyginu kainą ir kokybę', delta: 35, lesson: 'Palyginai ne tik nuolaidą, bet ir vieneto kainą — sutaupei neatsisakydamas poreikio.' },
    { key: 'brand', label: 'Perku pirmą patikusį', delta: -20, lesson: 'Patogus pasirinkimas nebūtinai yra geriausias tavo biudžetui.' },
  ] },
  { title: 'Mėnesio biudžetas', prompt: 'Sudaryk planą prieš gaudamas kitas pajamas.', choices: [
    { key: 'budget', label: 'Paskirstau pinigus į kategorijas', delta: 55, lesson: 'Biudžetas leidžia iš anksto numatyti poreikius, taupymą ir pramogas.' },
    { key: 'guess', label: 'Sprendžiu pagal nuojautą', delta: -30, lesson: 'Be plano sunkiau pastebėti, kur dingsta pinigai ir kada artėja trūkumas.' },
  ] },
  { title: 'Netikėta išlaida', prompt: 'Sugedo telefonas. Reikia 80 €.', choices: [
    { key: 'reserve', label: 'Moku iš rezervo', delta: -80, lesson: 'Rezervas skirtas būtent netikėtoms išlaidoms, todėl nereikia skolintis ar parduoti turto.' },
    { key: 'debt', label: 'Skolinuosi', delta: -100, lesson: 'Skola išsprendžia šiandienos problemą, bet vėliau kainuos daugiau dėl grąžinimo.' },
  ] },
  { title: 'Mokymasis uždirbti', prompt: 'Gali investuoti laiką į naudingą įgūdį.', choices: [
    { key: 'skill', label: 'Moku 25 € už kursą', delta: 90, lesson: 'Įgūdis kainuoja dabar, bet gali padidinti būsimas pajamas ir pasirinkimus.' },
    { key: 'free', label: 'Nieko nekeičiu', delta: 10, lesson: 'Pinigų neišleidai, tačiau praleidai galimybę sustiprinti savo uždarbio potencialą.' },
  ] },
  { title: 'Papildomas uždarbis', prompt: 'Savaitgalį gali atlikti mokamą užduotį.', choices: [
    { key: 'work', label: 'Priimu užduotį (+120 €)', delta: 120, lesson: 'Papildomos pajamos padidino tavo galimybes taupyti ir pasiekė tikslą greičiau.' },
    { key: 'rest', label: 'Renkuosi poilsį', delta: 0, lesson: 'Poilsis taip pat turi vertę, bet šį kartą papildomų pajamų negavai.' },
  ] },
  { title: 'Mažas verslas', prompt: 'Mokyklos mugėje gali pardavinėti savo gaminį.', choices: [
    { key: 'biz', label: 'Pradedu mažą verslą (+150 €)', delta: 150, lesson: 'Pelnas atsiranda tik įvertinus kainą, išlaidas ir paklausą — pajamos nėra tas pats, kas pelnas.' },
    { key: 'safe', label: 'Nerizikuoju', delta: 15, lesson: 'Saugus pasirinkimas išsaugo pinigus, tačiau neleidžia patikrinti verslo idėjos.' },
  ] },
  { title: 'Ilgalaikis tikslas', prompt: 'Pasiekęs tikslą turi nuspręsti, ką daryti toliau.', choices: [
    { key: 'invest', label: 'Dalį atidedu kitam tikslui', delta: 75, lesson: 'Ilgalaikis planas padeda pinigams dirbti tavo tikslams, o ne trumpalaikiams norams.' },
    { key: 'celebrate', label: 'Išleidžiu viską šventei', delta: 20, lesson: 'Švęsti galima, tačiau visų santaupų išleidimas panaikina pasiektą saugumą.' },
  ] },
];

const DEMO_RNG = (seed) => {
  let state = typeof seed === 'number' ? seed >>> 0 : Array.from(String(seed), (ch) => ch.charCodeAt(0)).reduce((h, c) => Math.imul(h ^ c, 16777619) >>> 0, 2166136261);
  return () => { state = (Math.imul(state ^ (state >>> 16), 2246822507) + 3266489909) >>> 0; return state / 4294967296; };
};
function shuffled(items, random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; }
  return copy;
}

export function createDemoSession(seed = Date.now()) {
  const random = DEMO_RNG(seed);
  return { seed, marketWeek: Math.floor(random() * 5) + 1, legacyChoices: shuffled(DEMO_CHOICES, random), steps: shuffled(DEMO_STEPS.map((step, sourceIndex) => ({
    ...step,
    id: `${step.title.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${sourceIndex}`,
    sourceIndex,
    choices: shuffled(getDemoStepChoices(sourceIndex), random),
  })), random), randomization: 'seeded-fisher-yates' };
}

export const DEMO_FLOW = ['legacy-event', 'legacy-strategy', 'legacy-lock', 'expanded-steps', 'analytics'];

export function getDemoStepChoices(index) {
  const step = DEMO_STEPS[index];
  if (!step) return [];
  const legacy = DEMO_CHOICES[index % DEMO_CHOICES.length];
  const legacyChoice = {
    key: legacy.key,
    label: `Senas pasirinkimas: ${legacy.label}`,
    delta: legacy.key === 'freelance' ? 180 : legacy.key === 'scholarship' ? 120 : legacy.key === 'marketplace' ? 90 : legacy.key === 'course' ? -80 : legacy.key === 'protect' ? -40 : legacy.key === 'business' ? 100 : 70,
    lesson: legacy.desc,
    legacyKey: legacy.key,
  };
  const extra = [
    { key: 'extra-budget', label: 'Atidedu 30 € rezervui', delta: 30, lesson: 'Mažas, reguliarus atidėjimas sustiprina rezervą ir padeda pasiruošti netikėtumams.' },
    { key: 'extra-list', label: 'Sudarysiu pirkinių sąrašą', delta: 20, lesson: 'Sąrašas padeda kontroliuoti kasdienes išlaidas ir mažina impulsyvių pirkinių riziką.' },
    { key: 'extra-wait', label: 'Palauksiu 24 valandas', delta: 25, lesson: 'Trumpa pauzė padeda atskirti tikrą poreikį nuo spontaniško noro.' },
    { key: 'extra-unit', label: 'Palyginu vieneto kainą', delta: 30, lesson: 'Vieneto kaina leidžia sąžiningai palyginti skirtingo dydžio pakuotes ir nuolaidas.' },
    { key: 'extra-plan', label: 'Pirmiausia sudarau planą', delta: 40, lesson: 'Aiškus planas padeda pinigus paskirstyti pagal prioritetus, o ne pagal nuotaiką.' },
    { key: 'extra-reserve', label: 'Naudoju sukauptą rezervą', delta: -80, lesson: 'Rezervas sumažina poreikį skolintis, kai atsiranda netikėta išlaida.' },
    { key: 'extra-learn', label: 'Mokomės nemokamai internete', delta: 35, lesson: 'Nemokami ištekliai taip pat gali padėti ugdyti įgūdžius neviršijant biudžeto.' },
    { key: 'extra-negotiate', label: 'Deruosi dėl atlygio', delta: 70, lesson: 'Gebėjimas pagrįsti savo darbo vertę gali padidinti pajamas.' },
    { key: 'extra-test', label: 'Išbandau mažą verslo partiją', delta: 65, lesson: 'Mažas bandymas sumažina riziką ir leidžia patikrinti paklausą prieš investuojant daugiau.' },
    { key: 'extra-goal', label: 'Pasitikrinu savo tikslą', delta: 50, lesson: 'Reguliariai peržiūrimas tikslas padeda išlaikyti kryptį ir koreguoti planą.' },
  ][index];
  return [...step.choices, extra, legacyChoice];
}

export function simulateDemoStep(index, choiceKey, capital = DEMO_CAPITAL, session = null) {
  const sessionStep = session?.steps?.[index];
  const sourceIndex = sessionStep?.sourceIndex ?? index;
  const step = DEMO_STEPS[sourceIndex];
  if (!step) throw new Error('Nežinomas demo žingsnis.');
  const choices = sessionStep?.choices || getDemoStepChoices(sourceIndex);
  const selected = choices.find((item) => item.key === choiceKey) || (choiceKey === 'balanced' ? choices[0] : null);
  if (!selected) throw new Error('Nežinomas demo pasirinkimas.');
  const nextCapital = Math.max(0, Math.round((capital + selected.delta) * 100) / 100);
  return { step: index + 1, totalSteps: session?.steps?.length || DEMO_STEPS.length, progress: `${index + 1}/${session?.steps?.length || DEMO_STEPS.length} · Ekonominis įvykis`, title: sessionStep?.title || step.title, prompt: sessionStep?.prompt || step.prompt, choices, choice: selected.key, legacyKey: selected.legacyKey || null, delta: selected.delta, capital, nextCapital, complete: index === (session?.steps?.length || DEMO_STEPS.length) - 1 };
}

const PEERS = [
  { name: 'Austėja', choice: 'protect', alloc: { sav: 25, inv: 20, bus: 20, res: 35 } },
  { name: 'Mantas', choice: 'business', alloc: { sav: 10, inv: 15, bus: 65, res: 10 } },
  { name: 'Ieva', choice: 'invest', alloc: { sav: 20, inv: 60, bus: 10, res: 10 } },
];

export function validateDemoAllocation(alloc) {
  if (!alloc || typeof alloc !== 'object') return 'Pasirink paskirstymą.';
  const keys = ['sav', 'inv', 'bus', 'res'];
  if (keys.some((key) => !Number.isInteger(alloc[key]) || alloc[key] < 0 || alloc[key] > 100)) return 'Kiekvienas paskirstymas turi būti sveikas skaičius nuo 0 iki 100.';
  if (keys.reduce((sum, key) => sum + alloc[key], 0) !== 100) return 'Paskirstymas turi sudaryti tiksliai 100 %.';
  return null;
}

function round(value) { return Math.round(value * 100) / 100; }
function choiceFor(key) { return DEMO_CHOICES.find((choice) => choice.key === key); }

// „Pamoka" žingsniams — tie patys formatai kaip ekonomikos variklyje.
const money = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const signed = (n) => { const v = Math.round(Number(n) || 0); return (v > 0 ? '+' : v < 0 ? '−' : '') + money(Math.abs(v)); };

export function simulateDemo(choiceKey, alloc, startingCapital = DEMO_CAPITAL, weekNo = 1) {
  const error = validateDemoAllocation(alloc);
  if (error) throw new Error(error);
  const choice = choiceFor(choiceKey);
  if (!choice) throw new Error('Pasirink strategiją.');

  const savings = startingCapital * alloc.sav / 100 * (weekNo === 1 ? 1.01 : 1.012);
  const investing = startingCapital * alloc.inv / 100 * (choiceKey === 'invest' ? 1.10 : 1.03);
  const business = startingCapital * alloc.bus / 100 * (choiceKey === 'business' ? 1.18 : 1.04);
  const earned = choiceKey === 'scholarship' ? 120 : choiceKey === 'freelance' ? 180 : 0;
  const assetSale = choiceKey === 'marketplace' ? 90 : 0;
  const courseCost = choiceKey === 'course' ? 80 : 0;
  const reserve = startingCapital * alloc.res / 100;
  const repairCost = choiceKey === 'protect' ? 40 : DEMO_EVENT.emergency + (weekNo > 1 ? 20 : 0);
  const reserveUsed = Math.min(reserve, repairCost);
  const shortfall = repairCost - reserveUsed;
  const forcedSalePenalty = shortfall * 0.15;
  const netWorth = round(savings + investing + business + reserve + earned + assetSale - courseCost - repairCost - forcedSalePenalty - (choiceKey === 'protect' ? 40 : 0));
  const maxShare = Math.max(alloc.sav, alloc.inv, alloc.bus, alloc.res);
  const riskPenalty = Math.max(0, maxShare - 40) * 1.5 + forcedSalePenalty;
  const score = round(netWorth - riskPenalty);
  const delta = round(netWorth - DEMO_CAPITAL);

  // ---- „Pamoka": faktinė įvykių seka, sudaryta tik iš apskaičiuotų skaičių ----
  const savBase = startingCapital * alloc.sav / 100;
  const invBase = startingCapital * alloc.inv / 100;
  const busBase = startingCapital * alloc.bus / 100;
  const steps = [];
  const step = (text, amount = null) => steps.push({ text, amount });
  step(`Pradinis kapitalas: ${money(startingCapital)}.`, round(startingCapital));
  step(`Pasirinkimas „${choice.label}": ${choiceKey === 'invest' ? 'investicijos auga ×1,10' : choiceKey === 'business' ? 'verslas auga ×1,18' : choiceKey === 'protect' ? 'avarijos išlaida sumažėja iki 40 € (mokestis 40 €)' : choiceKey === 'course' ? 'sumokėta 80 € už įgūdžius' : choiceKey === 'marketplace' ? 'parduotas turimas daiktas už 90 €' : `gauta ${earned} € papildomų pajamų`}.`, null);
  if (earned) step(`Papildomos pajamos: ${signed(earned)}.`, earned);
  if (assetSale) step(`Turto pavertimas pinigais: ${money(assetSale)} gauta pardavus daiktą; tai nėra naujos pajamos.`, assetSale);
  if (courseCost) step(`Įgūdžių kursas: −${money(courseCost)} dabar, įgūdžiai gali padėti uždirbti ateityje.`, -courseCost);
  step(`Paskirstymas: santaupos ${alloc.sav} % = ${money(savBase)}, investicijos ${alloc.inv} % = ${money(invBase)}, verslas ${alloc.bus} % = ${money(busBase)}, rezervas ${alloc.res} % = ${money(reserve)}.`, null);
  step(`Savaitės rinkos įvykio krypties ženklai, ne procentinė prognozė: santaupos ${signed(savings - savBase)} → ${money(savings)}; investicijos ${signed(investing - invBase)} → ${money(investing)}; verslas ${signed(business - busBase)} → ${money(business)}.`, round(savings - savBase + (investing - invBase) + (business - busBase)));
  step(`Netikėta išlaida: ${money(repairCost)}.`, -round(repairCost));
  if (reserveUsed >= repairCost - 0.005) step(`Rezervas padengė visą išlaidą (${money(reserveUsed)}) be jokių nuostolių.`, -round(reserveUsed));
  else step(`Rezervo užteko tik ${money(reserveUsed)}, todėl trūkstamą ${money(shortfall)} teko parduoti su 15 % nuostoliu: −${money(forcedSalePenalty)}.`, -round(shortfall + forcedSalePenalty));
  if (choiceKey === 'protect') step(`Apsaugos mokestis: −${money(40)}.`, -40);
  step(`Galutinė grynoji vertė: ${money(netWorth)} (${signed(delta)} nuo pradinio kapitalo).`, delta);

  return {
    choice: choiceKey,
    alloc: { ...alloc },
    startingCapital: round(startingCapital),
    week: weekNo,
    netWorth,
    delta,
    score,
    earned,
    assetSale,
    courseCost,
    repairCost,
    reserveUsed: round(reserveUsed),
    forcedSalePenalty: round(forcedSalePenalty),
    maxShare,
    steps,
    lesson: choiceKey === 'protect'
      ? 'Apsauga kainavo 40 €, bet sumažino avarijos poveikį. Rezervas vis tiek padeda išlaikyti lankstumą.'
      : reserveUsed >= repairCost
        ? 'Rezervas padengė netikėtą išlaidą be priverstinio turto pardavimo.'
        : 'Rezervas buvo per mažas, todėl dalį turto teko parduoti su 15 % nuostoliu.',
  };
}

export function buildDemoReveal(playerChoice, playerAlloc, startingCapital = DEMO_CAPITAL, weekNo = 1) {
  const player = simulateDemo(playerChoice, playerAlloc, startingCapital, weekNo);
  const rows = [{ name: 'Tu', ...player }, ...PEERS.map((peer) => ({ name: peer.name, ...simulateDemo(peer.choice, peer.alloc, startingCapital, weekNo) }))]
    .sort((a, b) => b.score - a.score)
    .map((row, index) => ({ ...row, rank: index + 1 }));
  const riskAward = rows.slice().sort((a, b) => a.maxShare - b.maxShare || b.score - a.score)[0];
  const growthAward = rows.slice().sort((a, b) => b.delta - a.delta)[0];
  return {
    player,
    rows,
    awards: [
      { title: 'Geriausia strategija', name: rows[0].name, value: rows[0].score, unit: 'taškai' },
      { title: 'Rizikos meistras', name: riskAward.name, value: riskAward.maxShare, unit: '% didžiausia dalis' },
      { title: 'Didžiausias augimas', name: growthAward.name, value: growthAward.delta, unit: '€' },
    ],
  };
}

export function compareDemoChoice(current, alternativeChoice, alloc, startingCapital = DEMO_CAPITAL, weekNo = 1) {
  const before = simulateDemo(current, alloc, startingCapital, weekNo);
  const alternative = simulateDemo(alternativeChoice, alloc, startingCapital, weekNo);
  return { before, alternative, difference: round(alternative.netWorth - before.netWorth) };
}
