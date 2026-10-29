// Deterministic one-week anonymous demo tests.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DEMO_CAPITAL, DEMO_CHOICES, buildDemoReveal, compareDemoChoice, findOptimalDemoStrategy, getDemoEvent, simulateDemo, validateDemoAllocation } from '../public/demo.js';

let passed = 0;
const t = (name, fn) => { fn(); passed++; console.log('ok  ', name); };
const balanced = { sav: 25, inv: 25, bus: 25, res: 25, shares: 15, technology: 10 };

t('landing page shows event-based clues and no numeric fund forecasts before strategy choices', () => {
  const source = readFileSync(new URL('../public/landing.js', import.meta.url), 'utf8');
  assert.match(source, /Rinkos naujienų užuominos/);
  assert.match(source, /Pats pasirenki, kur ir kiek investuoti/);
  assert.doesNotMatch(source, /fondas gali (kilti|kristi) \$\{|prognozė \$\{forecast/);
});

t('demo starts every player with €1,000', () => {
  assert.equal(simulateDemo('business', balanced).startingCapital, DEMO_CAPITAL);
});
t('best strategy changes with the actual week and events, not every week business', () => {
  const results = Array.from({ length: 5 }, (_, index) => findOptimalDemoStrategy(DEMO_CAPITAL, index + 1));
  assert.notEqual(results[0].choice, results[1].choice);
  assert.notEqual(results[1].choice, results[2].choice);
  assert.notEqual(results[2].choice, results[3].choice);
  assert.notEqual(results[3].choice, results[4].choice);
  assert.ok(new Set(results.map(({ choice }) => choice)).size >= 3);
});
t('scenario news rather than numeric fund forecasts is shown for every week', () => {
  const expected = [
    /DI laboratorija.*modelį/i,
    /infliacijos ataskaita/i,
    /mokyklų tinklu/i,
    /palūkanų/i,
    /sumažino muitus/i,
  ];
  for (let week = 1; week <= 5; week++) {
    const event = getDemoEvent(week);
    assert.match(event.body, expected[week - 1]);
    assert.ok(event.outlook.signals);
    assert.doesNotMatch(`${event.body} ${event.outlook.body}`, /fondas gali (kilti|kristi) \d+\s*%/i);
    const result = simulateDemo('invest', { sav: 0, inv: 100, bus: 0, res: 0, shares: 0, technology: 100 }, 1000, week);
    const steps = result.steps.map(({ text }) => text).join(' ');
    assert.ok(steps.includes('Savaitės rinkos įvykis'), `savaitė ${week} turi naujienos įvykį rezultatų paaiškinime`);
    assert.doesNotMatch(steps, /akcijų fondą prognozuota|technologijų fondą prognozuota|fondas gali kilti \d+ %|fondas gali kristi \d+ %/i);
  }
});

t('scenario changes actual outcomes while results avoid forecast percentages', () => {
  const balancedInvestments = { sav: 0, inv: 100, bus: 0, res: 0, shares: 0, technology: 100 };
  const growth = simulateDemo('invest', balancedInvestments, 1000, 1);
  const downturn = simulateDemo('invest', { ...balancedInvestments, shares: 100, technology: 0 }, 1000, 2);
  assert.ok(growth.netWorth > 1000);
  assert.ok(downturn.netWorth < 1000);
  for (const result of [growth, downturn]) {
    const steps = result.steps.map(({ text }) => text).join(' ');
    assert.doesNotMatch(steps, /fondas gali (kilti|kristi) \d+ %/i);
    assert.match(steps, /krypties ženklai, ne procentinė prognozė/);
  }
});
t('business is not the best strategy in every market scenario', () => {
  const results = [
    findOptimalDemoStrategy(DEMO_CAPITAL, 1),
    findOptimalDemoStrategy(DEMO_CAPITAL, 2),
    findOptimalDemoStrategy(DEMO_CAPITAL, 3),
    findOptimalDemoStrategy(DEMO_CAPITAL, 4),
    findOptimalDemoStrategy(DEMO_CAPITAL, 5),
  ];
  assert.deepEqual(results.map(({ choice }) => choice), ['business', 'save', 'protect', 'save', 'protect']);
  assert.equal(new Set(results.map(({ choice }) => choice)).size >= 3, true);
});
t('a downturn forecast can favor savings over either investment fund', () => {
  const result = findOptimalDemoStrategy(DEMO_CAPITAL, 2);
  assert.equal(result.choice, 'save');
  assert.equal(result.alloc.inv, 0);
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
t('all demo choices include forecast choices and individual opportunity events', () => {
  for (const key of ['business', 'invest', 'protect', 'save', 'scholarship', 'freelance', 'course', 'marketplace']) assert.ok(DEMO_CHOICES.some((choice) => choice.key === key), key);
});
t('income and asset-sale opportunities remain separate in the weekly demo', () => {
  assert.ok(simulateDemo('scholarship', balanced).earned > 0);
  const sale = simulateDemo('marketplace', balanced);
  assert.equal(sale.assetSale, 90);
  assert.equal(sale.earned, 0);
  assert.ok(sale.steps.some((step) => /Turto pavert/.test(step.text)));
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
  const short = simulateDemo('business', { sav: 0, inv: 100, bus: 0, res: 0, shares: 100, technology: 0 }, 1000, 2);
  assert.ok(short.steps.some((s) => /nuostoliu/.test(s.text)), 'forced-sale penalty is explained');
});
t('protected choice shows the 15 € insurance cost when an event occurs', () => {
  const result = simulateDemo('protect', balanced, 1000, 2);
  assert.ok(result.steps.some((s) => /Apsaugos įmoka: −15 €/.test(s.text)));
});

console.log(`\nDemo: ${passed} checks passed`);
