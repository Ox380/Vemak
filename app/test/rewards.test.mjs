import assert from 'node:assert/strict';
import {
  createRewards, awardOnce, levelForXp, weeklyXp, trophyEligibility,
} from '../public/rewards.js';

let n = 0;
const ok = (message) => console.log('ok  ', message, ++n && '');

let rewards = createRewards();
assert.deepEqual(rewards, { xp: 0, awarded: {}, trophies: [], cosmetics: [] });
ok('new players start with empty persistent rewards');

rewards = awardOnce(rewards, 'week-1-cycle', 150);
assert.equal(rewards.xp, 150);
rewards = awardOnce(rewards, 'week-1-cycle', 150);
assert.equal(rewards.xp, 150);
ok('the same qualifying achievement awards XP only once');

assert.equal(levelForXp(0), 1);
assert.equal(levelForXp(199), 1);
assert.equal(levelForXp(200), 2);
assert.equal(levelForXp(600), 4);
ok('levels use deterministic XP thresholds');

assert.deepEqual(weeklyXp({ alloc: { sav: 30, inv: 25, bus: 25, res: 20 } }), { mission: 100, explanation: 50, cycle: 150 });
assert.deepEqual(weeklyXp({ alloc: { sav: 0, inv: 100, bus: 0, res: 0 } }), { mission: 0, explanation: 0, cycle: 0 });
ok('highest-risk strategies receive no weekly XP');

const rows = [
  { id: 'a', score: 920, delta: 40, alloc: { res: 30, bus: 20, inv: 30 }, bizReturn: 0.12, investmentReturn: 0.1 },
  { id: 'b', score: 800, delta: 15, alloc: { res: 50, bus: 10, inv: 20 }, bizReturn: 0.05, investmentReturn: 0.04 },
];
const trophies = trophyEligibility(rows, rows[0]);
assert.ok(trophies.some((t) => t.key === 'financial-genius'));
assert.ok(trophies.some((t) => t.key === 'risk-master'));
assert.ok(trophies.every((t) => t.requirement));
ok('trophies have deterministic eligibility requirements');

console.log(`\nRewards: ${n} checks passed`);
