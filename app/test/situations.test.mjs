// situations.test.mjs — situacijų įvairovės patikra.
// Reikalavimas: kiekvieną kartą vartotojas gauna naujas situacijas, jos nesikartoja.
import assert from 'node:assert/strict';
import { SITUATIONS, SITUATIONS_BY_TOPIC, WEEKS } from '../public/content.js';
import { buildSeason, pickSituations, situationPublic, TOPIC_ORDER, CONFIG } from '../public/engine.js';
import { makeRng } from '../public/engine.js';
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

// 1. Biblioteka pakankama
{
  assert.ok(SITUATIONS.length >= 20, 'bibliotekoje per mažai situacijų');
  const ids = SITUATIONS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'id turi būti unikalūs');
  ok(`bibliotekoje ${SITUATIONS.length} situacijos, visi id unikalūs`);
}

// 2. Kiekviena situacija turi temą, tekstą ir bent 3 pasirinkimus su pamoka
{
  for (const s of SITUATIONS) {
    assert.ok(TOPIC_ORDER.includes(s.topic), `${s.id}: nežinoma tema ${s.topic}`);
    assert.ok(s.title && s.body, `${s.id}: trūksta teksto`);
    assert.ok(Array.isArray(s.options) && s.options.length >= 3, `${s.id}: per mažai pasirinkimų`);
    for (const o of s.options) assert.ok(o.key && o.label && o.lesson, `${s.id}/${o.key}: trūksta lauko`);
  }
  ok('visos situacijos turi temą, tekstą ir bent 3 pasirinkimus su pamoka');
}

// 3. Kiekviena tema turi pakankamai situacijų sezonui
{
  const need = {};
  for (const t of TOPIC_ORDER) need[t] = (need[t] || 0) + 1;
  for (const [t, count] of Object.entries(need)) {
    assert.ok((SITUATIONS_BY_TOPIC[t] || []).length >= count * 2, `tema ${t}: per mažai situacijų`);
  }
  ok('kiekvienos temos pakanka bent dviem sezonams');
}

// 4. Sezonas ima po vieną situaciją kiekvienai temai ir jos viduje nesikartoja
{
  const season = buildSeason('test-seed-1', { used: [] });
  assert.equal(season.situationIds.length, CONFIG.WEEKS);
  assert.equal(new Set(season.situationIds).size, CONFIG.WEEKS, 'sezone situacijos kartojasi');
  for (let i = 0; i < CONFIG.WEEKS; i++) {
    assert.equal(season.situations[i].topic, TOPIC_ORDER[i], `savaitė ${i + 1}: neteisinga tema`);
  }
  ok('sezone – 6 skirtingos situacijos, temų eilė išlaikyta');
}

// 5. Du sezonai iš eilės nesikartoja
{
  const a = buildSeason('seed-a', { used: [] });
  const b = buildSeason('seed-b', { used: a.situationIds });
  const overlap = b.situationIds.filter((id) => a.situationIds.includes(id));
  assert.equal(overlap.length, 0, 'antras sezonas kartoja situacijas: ' + overlap.join(', '));
  ok('antras sezonas nekartoja pirmojo situacijų');
}

// 6. Trys sezonai iš eilės – vis dar be pasikartojimų
{
  const used = [];
  const seasons = [];
  for (let i = 0; i < 3; i++) {
    const s = buildSeason('seed-' + i, { used });
    seasons.push(s.situationIds);
    used.push(...s.situationIds);
  }
  const all = seasons.flat();
  assert.equal(new Set(all).size, all.length, 'trys sezonai kartoja situacijas');
  ok('trys sezonai iš eilės – 18 skirtingų situacijų');
}

// 7. Išsėmus biblioteką ciklas prasideda iš naujo, bet sezonas lieka vientisas
{
  const all = SITUATIONS.map((s) => s.id);
  const s = buildSeason('exhausted', { used: all });
  assert.equal(s.situationIds.length, CONFIG.WEEKS);
  assert.equal(new Set(s.situationIds).size, CONFIG.WEEKS);
  ok('išsėmus biblioteką sezonas vis tiek surenkamas be pasikartojimų');
}

// 8. Fiksuoti id atkuria tą patį sezoną (vienodos sąlygos visai klasei)
{
  const a = buildSeason('fixed', { ids: ['koncertas', 'kainu-kilimas', 'rinkos-krytis', 'pirmoji-investicija', 'maisto-biudzetas', 'juodai-dienai'] });
  const b = buildSeason('fixed', { ids: a.situationIds });
  assert.deepEqual(a.situationIds, b.situationIds);
  ok('sezonas atkuriamas iš tų pačių id (vienodos sąlygos klasei)');
}

// 9. Skirtingi sezonai duoda skirtingas situacijas
{
  const seen = new Set();
  for (let i = 0; i < 12; i++) seen.add(buildSeason('vary-' + i, { used: [] }).situationIds.join('|'));
  assert.ok(seen.size >= 3, 'sezonai per mažai skiriasi');
  ok(`12 sezonų davė ${seen.size} skirtingus derinius`);
}

// 10. Vieša situacijos dalis neatskleidžia pamokos
{
  const s = SITUATIONS[0];
  const pub = situationPublic(s);
  assert.ok(pub.title && pub.body && pub.options.length);
  assert.ok(pub.options.every((o) => !('lesson' in o)), 'viešoje dalyje neturi būti pamokos');
  ok('mokiniui siunčiama situacija neatskleidžia paaiškinimų');
}

// 11. Baziniai WEEKS lieka nepakitę (suderinamumas su komandos testais)
{
  assert.equal(WEEKS.length, 6);
  ok('bazinis WEEKS sąrašas liko 6 savaičių');
}

// 12. Pasirinkimas deterministinis tam pačiam sėklai
{
  const a = pickSituations(makeRng(42), []).map((s) => s.id);
  const b = pickSituations(makeRng(42), []).map((s) => s.id);
  assert.deepEqual(a, b);
  ok('tas pats sėklos numeris duoda tą patį sezoną');
}

console.log(`\nSituations: ${n} checks passed`);
