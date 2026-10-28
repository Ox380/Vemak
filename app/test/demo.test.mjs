// Deterministic one-week anonymous demo tests.
import assert from 'node:assert/strict';
import { DEMO_CAPITAL, DEMO_CHOICES, buildDemoReveal, compareDemoChoice, simulateDemo, validateDemoAllocation } from '../public/demo.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ', name); };
const balanced = { sav: 25, inv: 25, bus: 25, res: 25 };

t('demo starts every player with €1,000', () => {
  assert.equal(simulateDemo('business', balanced).startingCapital, DEMO_CAPITAL);
});
t('next week carries the previous net worth forward', () => {
  const first = simulateDemo('business', balanced);
  const next = simulateDemo('protect', balanced, first.netWorth, 2);
  assert.equal(next.startingCapital, first.netWorth);
  assert.notEqual(next.netWorth, first.netWorth);
});
t('allocation must equal exactly 100%', () => {
  assert.equal(validateDemoAllocation(balanced), null);
  assert.match(validateDemoAllocation({ ...balanced, res: 24 }), /tiksliai 100/);
  assert.throws(() => simulateDemo('business', { sav: 30, inv: 30, bus: 30, res: 0 }), /tiksliai 100/);
});
t('economic choices produce different deterministic results', () => {
  const business = simulateDemo('business', balanced);
  const protect = simulateDemo('protect', balanced);
  assert.notEqual(business.netWorth, protect.netWorth);
  assert.equal(simulateDemo('business', balanced).netWorth, business.netWorth);
});
t('reveal includes leaderboard and risk awards', () => {
  const reveal = buildDemoReveal('business', balanced);
  assert.equal(reveal.rows.length, 4);
  assert.deepEqual(reveal.rows.map((row) => row.rank).sort(), [1, 2, 3, 4]);
  assert.equal(reveal.awards.length, 3);
  assert.ok(reveal.awards.some((award) => award.title === 'Rizikos meistras'));
});
t('alternative decision comparison is deterministic', () => {
  const comparison = compareDemoChoice('business', 'protect', balanced);
  assert.equal(comparison.difference, comparison.alternative.netWorth - comparison.before.netWorth);
  assert.notEqual(comparison.before.netWorth, comparison.alternative.netWorth);
});
t('all demo choices are present', () => assert.equal(DEMO_CHOICES.length, 3));

console.log(`\nDemo: ${passed} checks passed`);
