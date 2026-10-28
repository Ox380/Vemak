// demo.js — deterministic, one-week anonymous VEMAK demonstration.
export const DEMO_CAPITAL = 1000;
export const DEMO_EVENT = {
  title: 'Mokyklos mugė ir netikėta telefono avarija',
  body: 'Šią savaitę gali uždirbti iš mugės, investuoti augimui arba apsisaugoti nuo 120 € netikėtos išlaidos.',
  emergency: 120,
};

export const DEMO_CHOICES = [
  { key: 'business', label: 'Paleidžiu mugės verslą', desc: 'Verslo dalis gauna didesnį postūmį, bet avarija lieka tavo rizika.', icon: '☕' },
  { key: 'invest', label: 'Investuoju į augimą', desc: 'Investicijos auga greičiau, bet rinkos rezultatas nėra garantuotas.', icon: '📈' },
  { key: 'protect', label: 'Perku apsaugą', desc: 'Sumoku 40 €, o netikėta išlaida sumažėja iki 40 €.', icon: '🛡️' },
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

export function simulateDemo(choiceKey, alloc) {
  const error = validateDemoAllocation(alloc);
  if (error) throw new Error(error);
  const choice = choiceFor(choiceKey);
  if (!choice) throw new Error('Pasirink strategiją.');

  const savings = DEMO_CAPITAL * alloc.sav / 100 * 1.01;
  const investing = DEMO_CAPITAL * alloc.inv / 100 * (choiceKey === 'invest' ? 1.10 : 1.03);
  const business = DEMO_CAPITAL * alloc.bus / 100 * (choiceKey === 'business' ? 1.18 : 1.04);
  const reserve = DEMO_CAPITAL * alloc.res / 100;
  const repairCost = choiceKey === 'protect' ? 40 : DEMO_EVENT.emergency;
  const reserveUsed = Math.min(reserve, repairCost);
  const shortfall = repairCost - reserveUsed;
  const forcedSalePenalty = shortfall * 0.15;
  const netWorth = round(savings + investing + business + reserve - repairCost - forcedSalePenalty - (choiceKey === 'protect' ? 40 : 0));
  const maxShare = Math.max(alloc.sav, alloc.inv, alloc.bus, alloc.res);
  const riskPenalty = Math.max(0, maxShare - 40) * 1.5 + forcedSalePenalty;
  const score = round(netWorth - riskPenalty);
  const delta = round(netWorth - DEMO_CAPITAL);

  return {
    choice: choiceKey,
    alloc: { ...alloc },
    startingCapital: DEMO_CAPITAL,
    netWorth,
    delta,
    score,
    repairCost,
    reserveUsed: round(reserveUsed),
    forcedSalePenalty: round(forcedSalePenalty),
    maxShare,
    lesson: choiceKey === 'protect'
      ? 'Apsauga kainavo 40 €, bet sumažino avarijos poveikį. Rezervas vis tiek padeda išlaikyti lankstumą.'
      : reserveUsed >= repairCost
        ? 'Rezervas padengė netikėtą išlaidą be priverstinio turto pardavimo.'
        : 'Rezervas buvo per mažas, todėl dalį turto teko parduoti su 15 % nuostoliu.',
  };
}

export function buildDemoReveal(playerChoice, playerAlloc) {
  const player = simulateDemo(playerChoice, playerAlloc);
  const rows = [{ name: 'Tu', ...player }, ...PEERS.map((peer) => ({ name: peer.name, ...simulateDemo(peer.choice, peer.alloc) }))]
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

export function compareDemoChoice(current, alternativeChoice, alloc) {
  const before = simulateDemo(current, alloc);
  const alternative = simulateDemo(alternativeChoice, alloc);
  return { before, alternative, difference: round(alternative.netWorth - before.netWorth) };
}
