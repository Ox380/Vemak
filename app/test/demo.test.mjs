// Deterministic one-week anonymous demo tests.
import assert from 'node:assert/strict';
import { DEMO_CAPITAL, DEMO_CHOICES, DEMO_STEPS, DEMO_FLOW, createDemoSession, getDemoStepChoices, buildDemoReveal, compareDemoChoice, simulateDemo, simulateDemoStep, validateDemoAllocation } from '../public/demo.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ', name); };
const balanced = { sav: 25, inv: 25, bus: 25, res: 25 };

t('randomized demo sessions are reproducible but vary by seed', () => {
  const first = createDemoSession('session-a');
  assert.deepEqual(first, createDemoSession('session-a'));
  assert.notDeepEqual(first, createDemoSession('session-b'));
  assert.equal(first.steps.length, DEMO_STEPS.length);
  assert.equal(new Set(first.steps.map((step) => step.id)).size, DEMO_STEPS.length);
  assert.equal(first.legacyChoices.length, DEMO_CHOICES.length);
  assert.notDeepEqual(first.legacyChoices, createDemoSession('session-b').legacyChoices);
});
t('randomized session keeps each question and option valid', () => {
  const session = createDemoSession('validation');
  for (const [index, step] of session.steps.entries()) {
    assert.equal(step.sourceIndex >= 0 && step.sourceIndex < DEMO_STEPS.length, true);
    assert.equal(step.choices.every((choice) => choice.key && choice.label && choice.lesson), true);
    const result = simulateDemoStep(index, step.choices[0].key, DEMO_CAPITAL, session);
    assert.equal(result.title, step.title);
  }
});
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
t('demo keeps the old three steps before expanded choices and analytics', () => {
  assert.deepEqual(DEMO_FLOW, ['legacy-event', 'legacy-strategy', 'legacy-lock', 'expanded-steps', 'analytics']);
});
t('demo has ten connected economic steps with dynamic progress', () => {
  assert.equal(DEMO_STEPS.length, 10);
  let capital = DEMO_CAPITAL;
  for (let i = 0; i < DEMO_STEPS.length; i++) {
    const result = simulateDemoStep(i, 'balanced', capital);
    assert.equal(result.step, i + 1);
    assert.equal(result.totalSteps, DEMO_STEPS.length);
    assert.match(result.progress, new RegExp(`^${i + 1}/10`));
    assert.ok(result.choices.length >= 4, `step ${i + 1} needs expanded choices`);
    const choices = result.choices;
    assert.ok(choices.every((item) => item.label && item.lesson));
    const selected = simulateDemoStep(i, choices[0].key, DEMO_CAPITAL);
    assert.ok(selected.choices.find((item) => item.key === selected.choice).lesson);
    capital = result.nextCapital;
  }
  assert.equal(simulateDemoStep(9, 'balanced', capital).complete, true);
});
t('old economic choices remain available after the expanded steps', () => {
  for (let i = 0; i < DEMO_STEPS.length; i++) {
    const choices = getDemoStepChoices(i);
    assert.ok(choices.some((choice) => DEMO_CHOICES.some((old) => old.key === choice.key)), `old choice missing at step ${i + 1}`);
  }
});
t('all demo choices are present', () => {
  assert.equal(DEMO_CHOICES.length, 7);
  for (const key of ['business', 'invest', 'protect', 'scholarship', 'freelance', 'course', 'marketplace']) {
    assert.ok(DEMO_CHOICES.some((choice) => choice.key === key), key);
  }
});
t('earning choices change the demo and explain income', () => {
  const scholarship = simulateDemo('scholarship', balanced);
  const freelance = simulateDemo('freelance', balanced);
  assert.ok(scholarship.earned > 0);
  assert.ok(freelance.earned > scholarship.earned);
  assert.ok(scholarship.steps.some((step) => /pajam/.test(step.text)));
});
t('marketplace sale is shown separately from earned income', () => {
  const result = simulateDemo('marketplace', balanced);
  assert.equal(result.assetSale, 90);
  assert.equal(result.earned, 0);
  assert.ok(result.steps.some((step) => /Turto pavert/.test(step.text)));
});

// ---- „Pamoka": žingsnis po žingsnio paaiškinama, kas įvyko ----
t('demo lesson explains the result step by step', () => {
  const result = simulateDemo('business', balanced);
  assert.ok(Array.isArray(result.steps) && result.steps.length >= 6, `${result.steps && result.steps.length} steps`);
  for (const step of result.steps) {
    assert.ok(typeof step.text === 'string' && step.text.length > 5);
    assert.ok(!/undefined|NaN/.test(step.text), 'no undefined/NaN: ' + step.text);
  }
  assert.match(result.steps[0].text, /Pradinis kapitalas/);
  assert.match(result.steps[result.steps.length - 1].text, /Galutinė grynoji vertė/);
  assert.equal(result.steps[result.steps.length - 1].amount, result.delta);
});
t('step trail names the unexpected expense and its funding', () => {
  const covered = simulateDemo('business', { sav: 10, inv: 10, bus: 10, res: 70 });
  assert.ok(covered.steps.some((s) => /Netikėta išlaida/.test(s.text)));
  assert.ok(covered.steps.some((s) => /Rezervas padengė visą išlaidą/.test(s.text)));
  const short = simulateDemo('business', { sav: 10, inv: 60, bus: 30, res: 0 });
  assert.ok(short.steps.some((s) => /nuostoliu/.test(s.text)), 'forced-sale penalty is explained');
});
t('protected choice shows the 40 € insurance cost', () => {
  const result = simulateDemo('protect', balanced);
  assert.ok(result.steps.some((s) => /Apsaugos mokestis/.test(s.text)));
});

console.log(`\nDemo: ${passed} checks passed`);
