import assert from 'node:assert/strict';
import { DEMO_EVENTS, DEMO_SCENARIOS, getDemoEvent, simulateDemo } from '../public/demo.js';

assert.equal(DEMO_SCENARIOS.length, 5, 'demo turi penkis rinkos scenarijus');
assert.equal(DEMO_EVENTS.length, 6, 'yra įžanginis įvykis ir po vieną kiekvienai savaitei');
assert.match(getDemoEvent(1).body, /DI laboratorija.*modelį/i);
assert.match(getDemoEvent(2).body, /infliacijos/i);
assert.match(getDemoEvent(3).body, /mokyklų tinklu/i);
assert.match(getDemoEvent(4).body, /palūkanų/i);
assert.match(getDemoEvent(5).body, /muitus/i);
for (let week = 1; week <= 5; week++) {
  const event = getDemoEvent(week);
  assert.ok(event.outlook.signals, `savaitė ${week} turi rinkų krypties užuominas`);
  assert.doesNotMatch(`${event.body} ${event.outlook.body}`, /fondas gali (kilti|kristi) \d+\s*%/i);
}
const result = simulateDemo('invest', { sav: 0, inv: 100, bus: 0, res: 0, shares: 0, technology: 100 }, 1000, 1);
assert.ok(result.steps.some(({ text }) => /krypties ženklai, ne procentinė prognozė/i.test(text)));
assert.ok(!result.steps.some(({ text }) => /akcijų fondą prognozuota|fondas gali kilti \d+ %|fondas gali kristi \d+ %/i.test(text)));
console.log('PASS: naujienos pateikia įvykius ir krypties užuominas, ne fondų procentines prognozes');
