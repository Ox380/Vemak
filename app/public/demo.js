// demo.js — deterministic, one-week anonymous VEMAK demonstration.
export const DEMO_CAPITAL = 1000;
export const DEMO_EVENT = {
  title: 'Kainos kyla: kaip paskirstysi 1 000 €?',
  body: 'Ekonomikoje kyla kainos. Turi 1 000 €. Pasirink kryptį, o tada paskirstyk visus pinigus tarp santaupų, investicijų, verslo ir avarinio rezervo.',
  emergency: 120,
};

export const DEMO_CHOICES = [
  { key: 'business', label: 'Paleidžiu mugės verslą', desc: 'Verslo dalis gauna didesnį postūmį, bet avarija lieka tavo rizika.', icon: '☕' },
  { key: 'invest', label: 'Investuoju į augimą', desc: 'Investicijos auga greičiau, bet rinkos rezultatas nėra garantuotas.', icon: '📈' },
  { key: 'protect', label: 'Perku apsaugą', desc: 'Sumoku 40 €, o netikėta išlaida sumažėja iki 40 €.', icon: '🛡️' },
  { key: 'scholarship', label: 'Pildau stipendijos paraišką (+120 €)', desc: 'Skiriu laiko paraiškai; rezultatas nėra garantuotas, bet šiame scenarijuje stipendija skiriama.', icon: '🎓' },
  { key: 'freelance', label: 'Pasiimu freelance užduotį (+180 €)', desc: 'Didesnis atlygis už skaitmeninį darbą, bet lieka mažiau laiko.', icon: '💻' },
  { key: 'course', label: 'Moku už įgūdžių kursą (−80 €)', desc: 'Mažiau pinigų dabar, bet įgyji įgūdžių būsimoms galimybėms.', icon: '📚' },
  { key: 'marketplace', label: 'Parduodu nenaudojamą daiktą (+90 €)', desc: 'Pinigai gaunami pardavus turimą daiktą — tai nėra naujos pajamos.', icon: '🛍️' },
];

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
  step(`Savaitei pasibaigus: santaupos ${signed(savings - savBase)} → ${money(savings)}; investicijos ${signed(investing - invBase)} → ${money(investing)}; verslas ${signed(business - busBase)} → ${money(business)}.`, round(savings - savBase + (investing - invBase) + (business - busBase)));
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
