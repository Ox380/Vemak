import assert from 'node:assert/strict';
import {
  DEMO_MARKET_ASSETS,
  DEMO_MARKET_STORIES,
  DEMO_SCENARIOS,
  getDemoEvent,
  getDemoMarketStory,
  getDemoMarketWinner,
  scoreDemoMarketGuess,
  simulateDemo,
} from '../public/demo.js';

assert.equal(DEMO_SCENARIOS.length, 12, 'naujausioje demo bazėje lieka 12 papildomų situacijų');
assert.equal(DEMO_MARKET_STORIES.length, 5, 'yra penkios atskiros spėjimo savaitės');
assert.equal(DEMO_MARKET_ASSETS.length, 4, 'spėjimui pateikiamos keturios turto sritys');
assert.match(getDemoEvent(1).body, /serverių tiekėjai/i);
assert.deepEqual(DEMO_MARKET_STORIES.map(({ id }) => id), [
  'sales-fraud-scandal', 'investor-demo', 'credit-crunch', 'battery-breakthrough', 'market-fair-orders',
]);
assert.equal(new Set(DEMO_MARKET_STORIES.map(({ signals }) => Object.keys(signals).join(','))).size, 1, 'visose naujienose pateikiamos tos pačios turto sritys');

const leaders = new Set();
for (let week = 1; week <= DEMO_MARKET_STORIES.length; week += 1) {
  const story = getDemoMarketStory(week);
  const winner = getDemoMarketWinner(week);
  leaders.add(winner.key);
  assert.ok(story.body.length > 30, `savaitė ${week} turi naujieną`);
  assert.ok(story.outcome.length > 20, `savaitė ${week} turi atskleidžiamą rezultatą`);
  assert.equal(scoreDemoMarketGuess(week, winner.key).bonus, 25);
  assert.equal(scoreDemoMarketGuess(week, winner.key).correct, true);
  assert.equal(scoreDemoMarketGuess(week, DEMO_MARKET_ASSETS.find(({ key }) => key !== winner.key).key).bonus, 0);
  assert.doesNotMatch(`${story.body} ${story.outcome}`, /fondas gali (kilti|kristi) \d+\s*%/i);
}
assert.equal(leaders.size, 4, 'per penkias istorijas išryškėja keturios skirtingos lyderių sritys');
const simulation = simulateDemo('invest', { sav: 0, inv: 100, bus: 0, res: 0 }, 1000, 1);
assert.ok(simulation.steps.some(({ text }) => /krypties ženklai, ne procentinė prognozė/i.test(text)));
console.log('Scenario news: 12 legacy stories preserved; five market-prediction stories passed');
