// Engine tests + balance check. Run: node test/engine.test.mjs
import assert from 'node:assert/strict';
import { buildSeason, newState, playWeek, netWorth, defaultAlloc, validateAlloc, strategyScore, CONFIG, ASSET_KEYS } from '../public/engine.js';
import { WEEKS } from '../public/content.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ', name); };

const mk = (sav, inv, bus, res, mix, upgrade = false) => ({ sav, inv, bus, res, mix: mix || { etf: 40, reit: 30, green: 20, gold: 10, tech: 0 }, upgrade });
const STRATS = {
  balanced:     mk(30, 25, 25, 20),
  all_tech:     mk(0, 100, 0, 0, { tech: 100, etf: 0, reit: 0, green: 0, gold: 0 }),
  all_business: mk(0, 0, 100, 0, null, true),
  saver:        mk(60, 10, 0, 30, { etf: 100, tech: 0, reit: 0, green: 0, gold: 0 }),
  no_reserve:   mk(30, 40, 30, 0, { etf: 50, tech: 50, reit: 0, green: 0, gold: 0 }),
  all_reserve:  mk(0, 0, 0, 100),
};
const choiceFor = (w) => WEEKS[w - 1].options[1].key; // the neutral option each week

function runSeason(seed, al, pick = choiceFor) {
  const season = buildSeason(seed);
  let s = newState();
  for (let w = 1; w <= CONFIG.WEEKS; w++) s = playWeek(s, season, w, pick(w), al).state;
  return s;
}

t('season is deterministic per seed', () => {
  assert.deepEqual(buildSeason('abc'), buildSeason('abc'));
  assert.notDeepEqual(buildSeason('abc').weeks[0].market, buildSeason('abd').weeks[0].market);
});
t('same seed + same choices = identical result for different students', () => {
  assert.equal(netWorth(runSeason('K1', STRATS.balanced)), netWorth(runSeason('K1', STRATS.balanced)));
});
t('alloc validation', () => {
  assert.equal(validateAlloc(defaultAlloc()), null);
  assert.ok(validateAlloc({ ...defaultAlloc(), sav: 99 }));
  assert.ok(validateAlloc({ ...defaultAlloc(), sav: -5, inv: 60 }));
  assert.ok(validateAlloc(null));
});
t('no NaN or negative pools over 500 random seasons', () => {
  for (let i = 0; i < 500; i++) for (const k of Object.keys(STRATS)) {
    const s = runSeason('n' + i, STRATS[k]);
    for (const v of [s.reserve, s.savings, s.business, s.debt, ...ASSET_KEYS.map((a) => s.invest[a])]) {
      assert.ok(Number.isFinite(v) && v >= -1e-6, `${k} ${i} ${v}`);
    }
  }
});
t('every week has 3-4 options and a lesson', () => {
  for (const w of WEEKS) { assert.ok(w.options.length >= 3); for (const o of w.options) assert.ok(o.lesson && o.label); }
});
t('invalid choice rejected', () => {
  assert.throws(() => playWeek(newState(), buildSeason('x'), 1, 'nope', defaultAlloc()));
});
t('shield removes price rise cost', () => {
  const season = buildSeason('shield');
  const withShield = (() => { let s = newState(); for (let w = 1; w <= 6; w++) s = playWeek(s, season, w, w === 3 ? 'stock' : choiceFor(w), STRATS.balanced).state; return s; })();
  assert.equal(withShield.shield, true);
});
t('bankruptcy -> second chance works', () => {
  const season = buildSeason('bk');
  let s = newState();
  s.debt = 999; s.bankrupt = true;
  const r = playWeek(s, season, 1, choiceFor(1), STRATS.balanced);
  assert.equal(r.report.secondChance, true);
  assert.equal(r.state.debt, 0);
  assert.equal(r.state.bankrupt, false);
});

// ---- balance ----
const N = 2000;
const res = {};
for (const k of Object.keys(STRATS)) res[k] = [];
const wins = Object.fromEntries(Object.keys(STRATS).map((k) => [k, 0]));
const scoreWins = { ...wins };
const forced = { ...wins };
for (let i = 0; i < N; i++) {
  const outs = {};
  for (const k of Object.keys(STRATS)) {
    const s = runSeason('bal' + i, STRATS[k]);
    outs[k] = s; res[k].push(netWorth(s)); if (s.forcedSales > 0) forced[k]++;
  }
  wins[Object.keys(outs).reduce((a, b) => (netWorth(outs[a]) >= netWorth(outs[b]) ? a : b))]++;
  scoreWins[Object.keys(outs).reduce((a, b) => (strategyScore(outs[a]) >= strategyScore(outs[b]) ? a : b))]++;
}
const pct = (arr, q) => arr.slice().sort((a, b) => a - b)[Math.floor(q * (arr.length - 1))];
console.log(`\nBalance, ${N} seasons (neutral choices each week)`);
console.log('strategy'.padEnd(14), 'median'.padStart(8), 'p10'.padStart(7), 'p90'.padStart(7), 'forced%'.padStart(9), 'wealthWin%'.padStart(11), 'scoreWin%'.padStart(10));
for (const k of Object.keys(STRATS)) {
  console.log(k.padEnd(14), String(Math.round(pct(res[k], .5))).padStart(8), String(Math.round(pct(res[k], .1))).padStart(7), String(Math.round(pct(res[k], .9))).padStart(7),
    (100 * forced[k] / N).toFixed(1).padStart(9), (100 * wins[k] / N).toFixed(1).padStart(11), (100 * scoreWins[k] / N).toFixed(1).padStart(10));
}
console.log(`\n${passed} tests passed`);
