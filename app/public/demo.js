// demo.js — deterministic, five-week anonymous VEMAK demonstration.
export const DEMO_CAPITAL = 1000;
export const DEMO_WEEKS = 5;
export function nextDemoWeek(weekNo, balance) {
  return weekNo >= DEMO_WEEKS ? null : { week: weekNo + 1, startingCapital: round(balance) };
}
export const DEMO_SCENARIOS = Object.freeze([
  Object.freeze({
    id: 'ai-model-launch', title: 'Naujo DI modelio pristatymas',
    body: 'Vietos DI laboratorija kitą savaitę pristatys naują modelį. Serverių tiekėjai praneša apie augančius užsakymus. Ar rinka apdovanos technologijų įmones, dar neaišku.',
    signals: Object.freeze({ shares: 'positive', technology: 'strong-positive', business: 'positive', savings: 'steady' }),
  }),
  Object.freeze({
    id: 'inflation-report', title: 'Aukštesnės maisto ir energijos kainos',
    body: 'Infliacijos ataskaita vėl viršijo lūkesčius. Šeimos mažina nebūtinus pirkinius, o prekybininkai praneša apie tuštesnius savaitgalio turgus. Taupomųjų sąskaitų pasiūlymai šiek tiek pagerėjo.',
    signals: Object.freeze({ shares: 'negative', technology: 'negative', business: 'strong-negative', savings: 'positive' }),
  }),
  Object.freeze({
    id: 'school-tech-contract', title: 'Technologijų bendrovė laimėjo mokyklų sutartį',
    body: 'Viena technologijų bendrovė pasirašė sutartį su mokyklų tinklu. IT tiekėjai tikisi naujų užsakymų, nors dar neaišku, ar ši nauda išplis į visą rinką.',
    signals: Object.freeze({ shares: 'steady', technology: 'positive', business: 'steady', savings: 'steady' }),
  }),
  Object.freeze({
    id: 'interest-rate-hike', title: 'Centrinis bankas pakėlė palūkanas',
    body: 'Kova su infliacija pabrangino paskolas. Augančioms bendrovėms gali būti sunkiau finansuoti plėtrą, tačiau taupytojai gali gauti daugiau palūkanų.',
    signals: Object.freeze({ shares: 'negative', technology: 'strong-negative', business: 'negative', savings: 'strong-positive' }),
  }),
  Object.freeze({
    id: 'export-deal', title: 'Atveriamas eksporto kelias',
    body: 'Prekybos partneriai sumažino muitus vietos gaminiams. Eksporto užsakymai auga, tačiau gamintojams prireiks laiko padidinti pajėgumus.',
    signals: Object.freeze({ shares: 'positive', technology: 'steady', business: 'strong-positive', savings: 'steady' }),
  }),
]);

export const DEMO_SCENARIO_EVENTS = Object.freeze([
  Object.freeze({ id: 'intro', title: 'Pasirink savaitės rinkos scenarijų', body: 'Perskaityk naujieną ir įvertink, kurioms rinkoms ji gali padėti ar pakenkti. Scenarijus suteikia užuominą, o ne garantiją.' }),
  ...DEMO_SCENARIOS.map(({ title, body }) => Object.freeze({ title, body })),
]);

const OUTLOOKS = Object.freeze([
  Object.freeze({ title: 'DI modelio pristatymas artėja', body: 'Serverių užsakymų naujienos suteikia pagrindo svarstyti technologijų rinkos augimą, bet lūkesčiai gali nepasitvirtinti.', returns: Object.freeze({ shares: 0.04, technology: 0.10, business: 0.04, savings: 0.01 }) }),
  Object.freeze({ title: 'Infliacija spaudžia vartojimą', body: 'Brangesnės būtinosios prekės gali sumažinti pirkėjų išlaidas. Rizikingų fondų ir verslo perspektyva silpnėja, o taupymo pasiūlymai gerėja.', returns: Object.freeze({ shares: -0.09, technology: -0.055, business: -0.08, savings: 0.03 }) }),
  Object.freeze({ title: 'Mokyklų technologijų sutartys', body: 'Nauji užsakymai suteikia pagrindo svarstyti IT tiekėjų augimą; kitiems sektoriams ši naujiena mažiau svarbi.', returns: Object.freeze({ shares: 0.02, technology: 0.12, business: 0.045, savings: 0.01 }) }),
  Object.freeze({ title: 'Brangesnio skolinimosi aplinka', body: 'Palūkanų kilimas apsunkina plėtrą skolinantis ir gali slėgti technologijų bendrovių vertinimus; taupytojams pasiūlymai gerėja.', returns: Object.freeze({ shares: -0.09, technology: -0.12, business: -0.055, savings: 0.04 }) }),
  Object.freeze({ title: 'Nauji eksporto pirkėjai', body: 'Mažesni muitai gali padėti gamintojams ir platesnei akcijų rinkai; technologijų paklausa išlieka stabili.', returns: Object.freeze({ shares: 0.09, technology: 0.02, business: 0.105, savings: 0.012 }) }),
]);

export function getDemoEvent(weekNo) {
  const week = Math.max(1, Math.min(DEMO_WEEKS, Number.isInteger(weekNo) ? weekNo : 1));
  const scenario = DEMO_SCENARIOS[week - 1];
  const event = DEMO_SCENARIO_EVENTS[week];
  const outlook = OUTLOOKS[week - 1];
  return Object.freeze({
    title: event.title,
    body: event.body,
    emergency: [0, 30, 70, 40, 90][week - 1],
    scenario,
    outlook: Object.freeze({
      economy: scenario.id,
      title: outlook.title,
      body: outlook.body,
      signals: scenario.signals,
      forecastReturns: outlook.returns,
      investmentReturns: outlook.returns,
      businessForecast: outlook.returns.business,
      businessDemandBonus: 0,
      investmentDelta: (outlook.returns.shares + outlook.returns.technology) / 2,
      businessDelta: outlook.returns.business,
      savingsDelta: outlook.returns.savings,
      businessRisk: [0.02, 0.03, 0.08, 0.05, 0.02][week - 1],
    }),
  });
}
export const DEMO_EVENT = getDemoEvent(1);
export const DEMO_EVENTS = Object.freeze(DEMO_SCENARIO_EVENTS);

export const DEMO_CHOICES = [
  { key: 'business', label: 'Paleidžiu mugės verslą', desc: 'Verslo grąža priklauso nuo savaitės paklausos prognozės – augimo metu gali uždirbti, nuosmukio metu patirti nuostolį.', icon: '☕' },
  { key: 'invest', label: 'Investuoju į augimą', desc: 'Rinkos prognozėje matysi akcijų ir technologijų fondų kryptį atskirai. Paskirstyk pinigus pagal tai, kuris gali kilti arba kristi; prognozė nėra garantija.', icon: '📈' },
  { key: 'protect', label: 'Perku apsaugą', desc: 'Sumoku 15 €: iki 40 € netikėta išlaida sumažėja iki 25 €.', icon: '🛡️' },
  { key: 'save', label: 'Renkuosi saugias santaupas', desc: 'Palieku daugiau lėšų santaupose: stabili palūkanų grąža, bet mažesnis galimas augimas.', icon: '🏦' },
  { key: 'scholarship', label: 'Pildau stipendijos paraišką (+120 €)', desc: 'Skiriu laiko paraiškai; rezultatas nėra garantuotas, bet šiame scenarijuje stipendija skiriama.', icon: '🎓' },
  { key: 'freelance', label: 'Pasiimu freelance užduotį (+180 €)', desc: 'Didesnis atlygis už skaitmeninį darbą, bet lieka mažiau laiko.', icon: '💻' },
  { key: 'course', label: 'Moku už įgūdžių kursą (−80 €)', desc: 'Mažiau pinigų dabar, bet įgyji įgūdžių būsimoms galimybėms.', icon: '📚' },
  { key: 'marketplace', label: 'Parduodu nenaudojamą daiktą (+90 €)', desc: 'Pinigai gaunami pardavus turimą daiktą – tai nėra naujos pajamos.', icon: '🛍️' },
];

export const DEMO_PEERS = [
  { name: 'Austėja', choice: 'protect', alloc: { sav: 25, inv: 20, bus: 20, res: 35 } },
  { name: 'Mantas', choice: 'business', alloc: { sav: 10, inv: 15, bus: 65, res: 10 } },
  { name: 'Ieva', choice: 'invest', alloc: { sav: 20, inv: 60, bus: 10, res: 10 } },
];

export function validateDemoAllocation(alloc) {
  if (!alloc || typeof alloc !== 'object') return 'Pasirink paskirstymą.';
  const keys = ['sav', 'inv', 'bus', 'res'];
  if (keys.some((key) => !Number.isInteger(alloc[key]) || alloc[key] < 0 || alloc[key] > 100)) return 'Kiekvienas paskirstymas turi būti sveikas skaičius nuo 0 iki 100.';
  if (keys.reduce((sum, key) => sum + alloc[key], 0) !== 100) return 'Paskirstymas turi sudaryti tiksliai 100 %.';
  if (alloc.shares !== undefined || alloc.technology !== undefined) {
    if (!Number.isInteger(alloc.shares) || !Number.isInteger(alloc.technology)) return 'Pasirink abu fondus 5 % žingsniu.';
    if ([alloc.shares, alloc.technology].some((value) => value < 0 || value > alloc.inv || value % 5 !== 0)) return 'Fondų dalys turi būti nuo 0 iki investicijų dalies ir keistis 5 % žingsniu.';
    if (alloc.shares + alloc.technology !== alloc.inv) return 'Akcijų ir technologijų fondai turi sudaryti tiksliai visą investicijų dalį.';
  }
  return null;
}

function round(value) { return Math.round(value * 100) / 100; }
function choiceFor(key) { return DEMO_CHOICES.find((choice) => choice.key === key); }

// „Pamoka" žingsniams — tie patys formatai kaip ekonomikos variklyje.
const money = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const signed = (n) => { const value = Math.round(Number(n) || 0); return (value > 0 ? '+' : value < 0 ? '−' : '') + money(Math.abs(value)); };
const percent = (n) => { const value = round(n * 100); return (value > 0 ? '+' : value < 0 ? '−' : '') + Math.abs(value) + ' %'; };
function signalLabel(value) {
  return ({
    'strong-positive': 'labai palankios naujienos',
    positive: 'palankios naujienos',
    steady: 'mišrios arba neaiškios naujienos',
    negative: 'nepalankios naujienos',
    'strong-negative': 'labai nepalankios naujienos',
  })[value] || 'neaiškios naujienos';
}


export function simulateDemo(choiceKey, alloc, startingCapital = DEMO_CAPITAL, weekNo = 1) {
  const error = validateDemoAllocation(alloc);
  if (error) throw new Error(error);
  const choice = choiceFor(choiceKey);
  if (!choice) throw new Error('Pasirink strategiją.');
  const event = getDemoEvent(weekNo);
  const outlook = event.outlook;
  const savingsRate = outlook.savingsDelta;
  const actualReturn = (forecast) => { const value = Number(forecast || 0); const direction = value > 0 ? 1 : value < 0 ? -1 : 0; return round(value - direction * 0.02); };

  const investmentForecasts = outlook.forecastReturns;
  const investmentReturns = Object.fromEntries(Object.entries(investmentForecasts).map(([key, value]) => [key, actualReturn(value)]));
  const savings = startingCapital * alloc.sav / 100 * (1 + savingsRate);
  const shareReturn = investmentReturns.shares;
  const technologyReturn = investmentReturns.technology;
  const rawShare = alloc.shares === undefined ? 50 : Number(alloc.shares || 0);
  const rawTechnology = alloc.technology === undefined ? 50 : Number(alloc.technology || 0);
  const splitTotal = rawShare + rawTechnology || 100;
  const sharePercent = rawShare * 100 / splitTotal;
  const technologyPercent = rawTechnology * 100 / splitTotal;
  const shareAmount = startingCapital * alloc.inv / 100 * sharePercent / 100;
  const technologyAmount = startingCapital * alloc.inv / 100 * technologyPercent / 100;
  const returnValue = (value) => value > 0 ? `kilti ${Math.round(value * 100)} %` : value < 0 ? `kristi ${Math.round(Math.abs(value) * 100)} %` : 'išlikti panaši';
  const businessForecast = event.outlook.businessForecast ?? event.outlook.businessDelta + event.outlook.businessDemandBonus;
  const businessReturn = actualReturn(businessForecast);
  const businessForecastText = returnValue(businessForecast);
  const investments = [
    { key: 'shares', name: 'Akcijų fondas', amount: shareAmount, percent: sharePercent, return: shareReturn },
    { key: 'technology', name: 'Technologijų fondas', amount: technologyAmount, percent: technologyPercent, return: technologyReturn },
  ];
  const investing = investments.reduce((sum, item) => sum + item.amount * (1 + item.return), 0);
  const business = startingCapital * alloc.bus / 100 * (1 + businessReturn);
  const earned = choiceKey === 'scholarship' ? 120 : choiceKey === 'freelance' ? 180 : 0;
  const assetSale = choiceKey === 'marketplace' ? 90 : 0;
  const courseCost = choiceKey === 'course' ? 80 : 0;
  const reserve = startingCapital * alloc.res / 100;
  const eventCost = event.emergency;
  const repairCost = choiceKey === 'protect' ? Math.min(eventCost, 40) : eventCost;
  const insuranceCost = choiceKey === 'protect' ? 15 : 0;
  const reserveUsed = Math.min(reserve, repairCost);
  const shortfall = repairCost - reserveUsed;
  const forcedSalePenalty = shortfall * 0.15;
  const netWorth = round(savings + investing + business + reserve + earned + assetSale - courseCost - repairCost - forcedSalePenalty - insuranceCost);
  const maxShare = Math.max(alloc.sav, alloc.inv, alloc.bus, alloc.res);
  const riskPenalty = Math.max(0, maxShare - 40) * 1.5 + forcedSalePenalty;
  const score = round(netWorth - riskPenalty);
  const weekDelta = round(netWorth - startingCapital);
  const totalDelta = round(netWorth - DEMO_CAPITAL);

  const savBase = startingCapital * alloc.sav / 100;
  const invBase = startingCapital * alloc.inv / 100;
  const busBase = startingCapital * alloc.bus / 100;
  const savedIncome = savings - savBase;
  const investmentIncome = investing - invBase;
  const businessIncome = business - busBase;
  const investmentFunds = alloc.inv === 0 ? 'Investicijų portfelis: lėšų neskirta.' : `Investicijų portfelis: akcijų fondas ${signalLabel(outlook.signals.shares)}, technologijų fondas ${signalLabel(outlook.signals.technology)}. Tikrasis uždarbis ar nuostolis paaiškės po įvykio.`;
  const steps = [];
  const step = (text, amount = null) => steps.push({ text, amount });
  step(`Pradinis kapitalas: ${money(startingCapital)}.`, round(startingCapital));
  step(`Savaitės rinkos įvykis „${event.title}“: ${event.body} Sprendimą, kur ir kiek investuoti, priimi tu.`, null);
  step(`Pasirinkimas „${choice.label}": ${choiceKey === 'invest' ? 'pasirenki investuoti; tikrasis rezultatas priklausys nuo savaitės rinkos įvykio' : choiceKey === 'business' ? 'verslo rezultatas priklausys nuo savaitės paklausos įvykio' : insuranceCost > 0 ? `apsauga už ${money(insuranceCost)} sumažina išlaidą iki ${money(repairCost)}` : 'apsauga be įmokos, nes šią savaitę nėra nenumatytos išlaidos'}.`, null);
  if (earned) step(`Papildomos pajamos: ${signed(earned)}.`, earned);
  if (assetSale) step(`Turto pavertimas pinigais: ${money(assetSale)} gauta pardavus daiktą; tai nėra naujos pajamos.`, assetSale);
  if (courseCost) step(`Įgūdžių kursas: −${money(courseCost)} dabar, įgūdžiai gali padėti uždirbti ateityje.`, -courseCost);
  step(`Paskirstymas: santaupos ${alloc.sav} % = ${money(savBase)}, investicijos ${alloc.inv} % = ${money(invBase)}, verslas ${alloc.bus} % = ${money(busBase)}, rezervas ${alloc.res} % = ${money(reserve)}.`, null);
  step(`Scenarijaus užuominos: akcijų fondas – ${signalLabel(outlook.signals.shares)}, technologijų fondas – ${signalLabel(outlook.signals.technology)}, verslo paklausa – ${signalLabel(outlook.signals.business)}, santaupos – ${signalLabel(outlook.signals.savings)}. Tai krypties ženklai, ne procentinė prognozė; tikrasis rezultatas gali skirtis.`, null);
  step(`Rinkos rezultatas: investicijos ${signed(investmentIncome)} (${percent(investmentIncome / (invBase || 1))}), o visas kapitalas pasikeitė ${signed(round(savedIncome + investmentIncome + businessIncome))}. Procentas čia aprašo jau įvykusį rezultatą, ne prognozę.`, round(savedIncome + investmentIncome + businessIncome));

  step(`Netikėta išlaida: ${money(eventCost)}${choiceKey === 'protect' ? `, po apsaugos liko ${money(repairCost)}` : ''}.`, -round(repairCost));
  if (reserveUsed >= repairCost - 0.005) step(`Rezervas padengė visą išlaidą (${money(reserveUsed)}) be jokių nuostolių.`, -round(reserveUsed));
  else step(`Rezervo užteko tik ${money(reserveUsed)}, todėl trūkstamą ${money(shortfall)} teko parduoti su 15 % nuostoliu: −${money(forcedSalePenalty)}.`, -round(shortfall + forcedSalePenalty));
  if (choiceKey === 'protect') step(`Apsaugos įmoka: −${money(insuranceCost)}.`, -round(insuranceCost));
  step(`Galutinė grynoji vertė: ${money(netWorth)} (${signed(weekDelta)} šią savaitę; ${signed(totalDelta)} nuo demo pradžios).`, weekDelta);

  return {
    choice: choiceKey,
    alloc: { ...alloc },
    startingCapital: round(startingCapital),
    week: weekNo,
    netWorth,
    weekDelta,
    totalDelta,
    cumulativeDelta: totalDelta,
    delta: weekDelta,
    profit: weekDelta,
    insuranceCost,
    repairCost: round(repairCost),
    score,
    earned,
    assetSale,
    courseCost,

    reserveUsed: round(reserveUsed),
    forcedSalePenalty: round(forcedSalePenalty),
    maxShare,
    steps,
    lesson: choiceKey === 'protect'
      ? insuranceCost > 0
        ? `Apsauga už ${money(insuranceCost)} sumažino ${money(eventCost)} išlaidą iki ${money(repairCost)}`
        : 'Šią savaitę nebuvo netikėtos išlaidos, todėl apsauga nieko nekainavo.'
      : reserveUsed >= repairCost
        ? 'Rezervas padengė netikėtą išlaidą be priverstinio turto pardavimo.'
        : 'Rezervas buvo per mažas, todėl dalį turto teko parduoti su 15 % nuostoliu.',
  };
}

function cash(value) { return Math.floor((value + 1e-8) * 100) / 100; }

export function findOptimalDemoStrategy(startingCapital = DEMO_CAPITAL, weekNo = 1) {
  let best = null;
  let combinationsChecked = 0;
  const event = getDemoEvent(weekNo);
  const candidates = DEMO_CHOICES.filter((choice) => {
    if (choice.key === 'invest') return event.outlook.signals.shares === 'positive' || event.outlook.signals.shares === 'strong-positive' || event.outlook.signals.technology === 'positive' || event.outlook.signals.technology === 'strong-positive';
    if (choice.key === 'business') return event.outlook.signals.business === 'positive' || event.outlook.signals.business === 'strong-positive';
    if (choice.key === 'save') return event.outlook.signals.savings === 'positive' || event.outlook.signals.savings === 'strong-positive';
    return choice.key === 'protect';
  });
  for (const choice of candidates) {
    for (let sav = 0; sav <= 100; sav += 5) {
      for (let inv = 0; inv <= 100 - sav; inv += 5) {
        for (let bus = 0; bus <= 100 - sav - inv; bus += 5) {
          const res = 100 - sav - inv - bus;
          for (let shares = 0; shares <= inv; shares += 5) {
            const technology = inv - shares;
            const alloc = { sav, inv, bus, res, shares, technology };
            const result = simulateDemo(choice.key, alloc, startingCapital, weekNo);
            combinationsChecked++;
            if (!best || result.netWorth > best.netWorth ||
              (result.netWorth === best.netWorth && result.forcedSalePenalty < best.forcedSalePenalty) ||
              (result.netWorth === best.netWorth && result.forcedSalePenalty === best.forcedSalePenalty && result.maxShare < best.maxShare)) {
              best = { ...result, choiceLabel: choice.label, investmentOutlook: event.outlook.investmentReturns };
            }
          }
        }
      }
    }
  }
  return { ...best, combinationsChecked };
}

export function buildDemoReveal(playerChoice, playerAlloc, startingCapital = DEMO_CAPITAL, weekNo = 1) {
  const player = simulateDemo(playerChoice, playerAlloc, startingCapital, weekNo);
  const rows = [{ name: 'Tu', ...player }, ...DEMO_PEERS.map((peer) => ({ name: peer.name, ...simulateDemo(peer.choice, peer.alloc, startingCapital, weekNo) }))]
    .map((row) => ({ ...row, delta: row.weekDelta, score: row.score - (row.startingCapital - startingCapital) }))
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
  const difference = round(alternative.netWorth - before.netWorth);
  return { before, alternative, difference, current, alternativeChoice };
}
