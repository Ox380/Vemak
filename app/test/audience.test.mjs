// audience.test.mjs — asmeninės (individualios) versijos testai.
// Paleidimas: PORT=3111 node server.mjs  (kitame terminale), tada
//   BASE=http://localhost:3111 node test/audience.test.mjs
import { JSDOM, VirtualConsole } from 'jsdom';
import { build } from 'esbuild';
import assert from 'node:assert/strict';
const BASE = process.env.BASE || 'http://localhost:3111';
const PUB = new URL('../public/', import.meta.url).pathname;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function page(htmlPath, entry, url, storage = {}) {
  const out = await build({ entryPoints: [PUB + entry], bundle: true, write: false, format: 'iife', platform: 'browser' });
  const html = await (await fetch(BASE + htmlPath)).text();
  const errors = [];
  const vc = new VirtualConsole(); vc.on('jsdomError', (e) => errors.push(String(e.detail || e.message))); vc.on('error', (e) => errors.push(String(e)));
  const dom = new JSDOM(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''), { url, runScripts: 'outside-only', pretendToBeVisual: true, virtualConsole: vc });
  const w = dom.window;
  w.fetch = (u, o) => fetch(new URL(u, BASE), o);
  w.confirm = () => true; w.scrollTo = () => {};
  w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
  for (const [k, v] of Object.entries(storage)) w.localStorage.setItem(k, v);
  w.addEventListener('error', (e) => errors.push('window: ' + e.message));
  w.eval(out.outputFiles[0].text);
  await sleep(500);
  return { w, d: w.document, errors };
}
const click = async (el) => { assert.ok(el, 'element missing'); el.click(); await sleep(250); };
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

// ---- landing: asmeninė (individuali) versija ----
{
  const { d, w, errors } = await page('/', 'landing.js', BASE + '/#asmeniui');
  assert.ok([...d.querySelectorAll('.aud-btn')].some((b) => b.dataset.aud === 'individual' && b.getAttribute('aria-selected') === 'true')); ok('individual audience is preselected from the URL');
  assert.match(d.querySelector('#heroCopy').textContent, /nekainuoja tikrų pinigų/); ok('individual hero copy replaces the school headline');
  assert.match(d.querySelector('#nauda').textContent, /Ką gausi tu, o ne klasė/); ok('individual benefits heading replaces the school one');
  assert.ok(!d.querySelector('#nauda').textContent.includes('Mokytojams: pamoka paruošta už jus'), 'school benefit leaked'); ok('school benefit copy is gone in the individual version');
  assert.ok(!d.querySelector('#nauda').textContent.includes('Mokyklos vadovybei'), 'school benefit leaked'); ok('no school-governance benefit in the individual version');
  assert.match(d.querySelector('#nauda').textContent, /Klasės kodo nereikia/); ok('individual benefit explains there is no class code');
  assert.ok(!d.querySelector('#pf #ps'), 'individual form must not ask for a school'); ok('individual signup form drops the school field');
  assert.match(d.querySelector('#pf button').textContent, /Registracija/); ok('individual form CTA opens registration');
  assert.match(d.querySelector('#planai').textContent, /Asmeninis/); assert.match(d.querySelector('#planai').textContent, /9,99/); ok('plans section lists the individual offer with its price');
  assert.match(d.querySelector('#planai').textContent, /149/); ok('plans section still lists the school offer');
  assert.ok(![...d.querySelectorAll('#nav a')].some((a) => a.textContent.includes('Mokytojo prisijungimas'))); ok('individual navigation drops the teacher-only links');
  assert.match(d.title, /sau pačiam/); ok('page title follows the audience');
  await click(d.querySelector('.aud-btn[data-aud=school]'));
  assert.match(d.querySelector('#nauda').textContent, /Naudinga visiems klasės dalyviams/); ok('switching back restores the school version');
  assert.ok(d.querySelector('#pf #ps'), 'school form must ask for the school again'); ok('school form returns with its school field');
  await click(d.querySelector('[data-plan=individual]'));
  assert.match(d.querySelector('#nauda').textContent, /Ką gausi tu, o ne klasė/); ok('plan button switches to the individual version');
  assert.deepEqual(errors, [], 'individual landing errors: ' + errors.join('|'));
}

// ---- individuali registracija veikia be mokyklos lauko ----
{
  const { d, w, errors } = await page('/', 'landing.js', BASE + '/#asmeniui');
  d.querySelector('#pn').value = 'Tomas';
  d.querySelector('#pe').value = 'tomas@asmeninis.lt';
  d.querySelector('#pc').checked = true;
  d.querySelector('#pf').dispatchEvent(new d.defaultView.Event('submit', { cancelable: true, bubbles: true }));
  await sleep(400);
  assert.match(d.querySelector('#pf').textContent, /Ačiū/); ok('individual signup submits without a school');
  assert.match(d.querySelector('#pf').textContent, /asmeninio sezono/); ok('individual confirmation mentions the personal season');
  assert.deepEqual(errors, [], 'individual signup errors: ' + errors.join('|'));
}

console.log(`\nAudience: ${n} checks passed`); process.exit(0);
