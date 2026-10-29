const XP_PER_LEVEL = 200;

export function createRewards() {
  return { xp: 0, awarded: {}, trophies: [], cosmetics: [] };
}

export function awardOnce(rewards, key, amount) {
  if (rewards.awarded[key]) return rewards;
  return { ...rewards, xp: rewards.xp + amount, awarded: { ...rewards.awarded, [key]: amount } };
}

export function levelForXp(xp) {
  return Math.max(1, Math.floor(Number(xp || 0) / XP_PER_LEVEL) + 1);
}

export function weeklyXp(report) {
  const alloc = report?.alloc || {};
  const risky = Number(alloc.inv || 0) >= 80 && Number(alloc.res || 0) <= 10;
  if (risky) return { mission: 0, explanation: 0, cycle: 0 };
  return { mission: 100, explanation: 50, cycle: 150 };
}

const TROPHIES = [
  ['financial-genius', 'Finansinis genijus', 'Geriausias bendras strategijos balas savaitę.'],
  ['best-saver', 'Geriausias taupytojas', 'Didžiausias atsarginio fondo paskirstymas, jei strategija išlieka subalansuota.'],
  ['risk-master', 'Rizikos meistras', 'Geriausias strategijos balansas tarp grąžos ir rizikos.'],
  ['comeback-king', 'Sugrįžimo karalius', 'Didžiausias pagerėjimas po neigiamo ankstesnės savaitės rezultato.'],
  ['business-tycoon', 'Verslo magnatas', 'Geriausias tvarus verslo rezultatas, neaukštinant rizikos.'],
  ['smart-investor', 'Sumanus investuotojas', 'Geriausia pagal riziką pakoreguota investicijų grąža.'],
  ['most-improved', 'Didžiausia pažanga', 'Didžiausias finansinių žinių pagerėjimas.'],
];

export function trophyEligibility(rows, player) {
  if (!player || !rows?.length) return [];
  const best = (fn) => Math.max(...rows.map(fn));
  const safe = (v) => Number.isFinite(v) ? v : -Infinity;
  const metrics = {
    'financial-genius': [player.score, best((r) => r.score)],
    'best-saver': [player.alloc?.res || 0, best((r) => r.alloc?.res || 0)],
    'risk-master': [100 - Math.abs((player.alloc?.inv || 0) - (player.alloc?.res || 0)), best((r) => 100 - Math.abs((r.alloc?.inv || 0) - (r.alloc?.res || 0)))],
    'comeback-king': [player.delta, best((r) => r.delta)],
    'business-tycoon': [safe(player.bizReturn), best((r) => safe(r.bizReturn))],
    'smart-investor': [safe(player.investmentReturn), best((r) => safe(r.investmentReturn))],
    'most-improved': [player.knowledgeImprovement || 0, best((r) => r.knowledgeImprovement || 0)],
  };
  return TROPHIES.filter(([key]) => metrics[key][0] >= metrics[key][1] && metrics[key][0] > -Infinity)
    .map(([key, title, requirement]) => ({ key, title, requirement }));
}

export { XP_PER_LEVEL, TROPHIES };
