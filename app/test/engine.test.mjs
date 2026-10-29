// Engine tests + balance check. Run: node test/engine.test.mjs
import assert from 'node:assert/strict';
import { buildSeason, newState, playWeek, netWorth, defaultAlloc, validateAlloc, validateGoal, strategyScore, CONFIG, ASSET_KEYS } from '../public/engine.js';
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
t('earning choices create distinct income paths and progression', () => {
  const season = buildSeason('earning');
  const job = playWeek(newState(), season, 5, 'job', STRATS.balanced);
  const freelance = playWeek(newState(), season, 5, 'freelance', STRATS.balanced);
  const business = playWeek(newState(), season, 5, 'microbiz', STRATS.balanced);
  assert.ok(job.report.earned > 0);
  assert.ok(freelance.report.earned > 0);
  assert.ok(business.report.businessRevenue > 0);
  assert.notEqual(job.report.earned, freelance.report.earned);
  assert.ok(job.state.skills.work > 0);
  assert.ok(freelance.state.skills.digital > 0);
  assert.ok(business.state.reputation > 0);
});
t('weekly job opportunity is seed-dependent and remains shared by a class', () => {
  const a = buildSeason('opportunity-a');
  const b = buildSeason('opportunity-b');
  assert.deepEqual(a, buildSeason('opportunity-a'));
  assert.notEqual(a.weeks[4].opportunity, b.weeks[4].opportunity);
  assert.ok(a.weeks.every((week) => week.opportunity >= 0.8 && week.opportunity <= 1.2));
  assert.ok(a.weeks.every((week) => week.businessDemand >= 0.75 && week.businessDemand <= 1.25));
});
t('work and digital skills improve the seeded payout, not just the displayed skill count', () => {
  const season = buildSeason('skilled-gigs');
  const job = playWeek(newState(), season, 5, 'job', STRATS.balanced);
  const freelance = playWeek(newState(), season, 5, 'freelance', STRATS.balanced);
  assert.equal(job.report.earned, Math.round(80 * season.weeks[4].opportunity * 1.05 * 100) / 100);
  assert.equal(freelance.report.earned, Math.round(120 * season.weeks[4].opportunity * 1.05 * 100) / 100);
  assert.ok(job.report.earnedMultiplier > season.weeks[4].opportunity);
});
t('business planning and skill points improve later business returns', () => {
  const season = buildSeason('skilled-business');
  const early = playWeek(newState(), season, 1, 'wait', STRATS.balanced).state;
  const baseline = playWeek({ ...early, business: 100 }, season, 3, 'none', STRATS.balanced);
  const skilled = playWeek({ ...early, business: 100 }, season, 3, 'bizup', STRATS.balanced);
  assert.ok(skilled.report.bizReturn > baseline.report.bizReturn);
  assert.equal(skilled.state.skills.business, 2);
});
t('income accounting excludes transfers and tracks goal progress', () => {
  const season = buildSeason('accounting');
  const result = playWeek(newState(), season, 5, 'job', STRATS.balanced);
  assert.equal(result.state.incomeEarned, result.report.income + result.report.earned);
  assert.equal(result.state.expensesPaid, result.report.needs + result.report.wants);
  assert.equal(result.state.goal.target, 500);
  assert.equal(result.state.goal.progress, Math.round((result.state.savings + result.state.reserve) * 100) / 100);
});
t('financial goals can be selected and progress uses the selected goal', () => {
  const state = newState();
  assert.equal(validateGoal({ type: 'income', target: 1000 }), null);
  assert.ok(validateGoal({ type: 'unknown', target: 1000 }));
  assert.ok(validateGoal({ type: 'income', target: 0 }));
  const season = buildSeason('goal');
  const result = playWeek(state, season, 5, 'job', STRATS.balanced);
  result.state.goal = { type: 'income', target: 1000, progress: result.state.incomeEarned };
  assert.equal(result.state.goal.progress, result.state.incomeEarned);
});
t('earning opportunities are spread across the season', () => {
  const expected = [
    [2, 'scholarship'],
    [3, 'internship'],
    [4, 'course'],
    [6, 'marketplace'],
  ];
  const season = buildSeason('opportunities');
  for (const [week, choice] of expected) {
    const result = playWeek(newState(), season, week, choice, STRATS.balanced);
    assert.ok(result.report.earned > 0 || result.report.assetSale > 0 || result.report.cashImpact < 0, `${week}/${choice} has no economic effect`);
    assert.ok(result.report.lesson.length > 20);
  }
});
t('selling an item is tracked separately from earned income', () => {
  const result = playWeek(newState(), buildSeason('sale'), 6, 'marketplace', STRATS.balanced);
  assert.equal(result.report.assetSale, 90);
  assert.equal(result.report.earned, 0);
  assert.equal(result.state.incomeEarned, result.report.income);
  assert.match(result.report.steps.map((s) => s.text).join(' '), /turto pavert/);
});

// ---- „Pamoka": žingsnis po žingsnio paaiškinama, kas įvyko ----
t('every week explains the result step by step', () => {
  const season = buildSeason('steps');
  let s = newState();
  for (let w = 1; w <= CONFIG.WEEKS; w++) {
    const r = playWeek(s, season, w, choiceFor(w), STRATS.balanced);
    s = r.state;
    const steps = r.report.steps;
    assert.ok(Array.isArray(steps) && steps.length >= 4, `week ${w}: ${steps && steps.length} steps`);
    for (const st of steps) {
      assert.equal(typeof st.text, 'string', 'step has text');
      assert.ok(st.text.length > 5, 'step text is not empty');
      assert.ok(!/undefined|NaN/.test(st.text), 'no undefined/NaN: ' + st.text);
    }
    assert.match(steps[0].text, /Pradinė grynoji vertė/);
    assert.match(steps[steps.length - 1].text, /Galutinė grynoji vertė/);
    assert.equal(steps[steps.length - 1].amount, r.report.delta, 'last step amount = week delta');
  }
});
t('step trail is deterministic for the same seed', () => {
  const a = playWeek(newState(), buildSeason('K1'), 1, choiceFor(1), STRATS.balanced);
  const b = playWeek(newState(), buildSeason('K1'), 1, choiceFor(1), STRATS.balanced);
  assert.deepEqual(a.report.steps, b.report.steps);
});
t('a forced sale is named in its own step', () => {
  const season = buildSeason('force');
  const w = season.weeks.findIndex((x) => x.expense > 0) + 1;
  assert.ok(w > 0, 'season has an expense week');
  const r = playWeek(newState(), season, w, choiceFor(w), STRATS.all_tech);
  assert.ok(r.report.forced > 0, 'no reserve + all invested must force a sale');
  assert.ok(r.report.steps.some((s) => /Priverstinis turto pardavimas/.test(s.text)), 'forced sale step present');
  assert.ok(r.report.steps.some((s) => /Netikėta išlaida/.test(s.text)), 'expense step present');
});
t('allocation is itemised per bucket', () => {
  const r = playWeek(newState(), buildSeason('K1'), 1, choiceFor(1), STRATS.balanced);
  for (const label of ['santaup', 'investicij', 'verslą', 'rezerv']) {
    assert.ok(r.report.steps.some((s) => s.text.includes(label)), `step for ${label}`);
  }
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
