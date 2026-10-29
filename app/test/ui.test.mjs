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
const api = async (m, p, b, t) => { const res = await fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined }); const data = await res.json(); assert.ok(res.ok, `${m} ${p} failed (${res.status}): ${JSON.stringify(data)}`); return data; };
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

// ---- landing ----
{
  const { d, w, errors } = await page('/', 'landing.js', BASE + '/');
  assert.ok([...d.querySelectorAll('.nav a.btn')].some((a) => a.textContent.includes('Registruoti paskyrą') && a.getAttribute('href') === '/teacher?register=1')); ok('registration CTA links to signup');
  assert.ok(![...d.querySelectorAll('.hero .row a')].some((a) => a.getAttribute('href') === '#demo')); ok('duplicate hero demo button removed');
  assert.ok([...d.querySelectorAll('.nav a')].some((a) => a.textContent.trim() === 'Demo')); ok('demo navigation link remains available');
  assert.ok(d.querySelector('#heroCity svg')); ok('hero city renders');
  assert.match(d.querySelector('#demoBox').textContent, /Sveikas atvykęs į VEMAK/); assert.ok(d.querySelector('.money-art')); assert.ok(!d.querySelector('.demo-intro-art')?.textContent.includes('🏙️')); ok('demo starts with money illustration');
  await click(d.querySelector('#start-demo'));
  await click(d.querySelector('#demoBox [data-choice]'));
  await click(d.querySelector('#to-strategy'));
  assert.ok(d.querySelector('#lock-demo').disabled === false); ok('demo event leads to secret strategy');
  for (const [key, value] of [['res', '5'], ['sav', '10'], ['inv', '40'], ['bus', '45']]) { const slider = d.querySelector(`[data-bucket="${key}"]`); slider.value = value; slider.dispatchEvent(new w.Event('input', { bubbles: true })); }
  for (const [key, value] of [['shares', '20'], ['technology', '20']]) { const slider = d.querySelector(`[data-fund="${key}"]`); slider.value = value; slider.dispatchEvent(new w.Event('input', { bubbles: true })); }
  assert.equal(d.querySelector('#lock-demo').disabled, false); ok('demo accepts diversified business and fund allocations');
  await click(d.querySelector('#lock-demo'));
  assert.match(d.body.textContent, /Strategija užrakinta/); assert.ok(!d.body.textContent.includes('Klasės lyderių lentelė')); ok('demo keeps strategy private after lock');
  await click(d.querySelector('#reveal-demo')); await sleep(550);
  assert.match(d.body.textContent, /Klasės lyderių lentelė/); assert.match(d.body.textContent, /Grynoji vertė/); assert.match(d.body.textContent, /Rizikos meistras/); assert.match(d.body.textContent, /Kaip skaičiuojami strategijos taškai\?/); assert.match(d.body.textContent, /1,5 taško/); ok('Friday reveal explains how strategy points differ from euros');
  assert.match(d.body.textContent, /Rinkos prognozė/);
  assert.ok(d.querySelector('.me')); ok('leaderboard shows weekly profit, net worth and strategy points in separate columns');
  assert.ok(d.querySelector('#optimal-strategy')); assert.ok(!d.querySelector('#second-chance')); ok('reveal replaces the second-chance button with optimal-strategy analysis');
  await click(d.querySelector('#optimal-strategy'));
  assert.match(d.body.textContent, /Geriausias modelio rastas rezultatas/); assert.match(d.body.textContent, /Patikrinta .*teisėtų variantų/); assert.match(d.body.textContent.replace(/\u00a0/g, ' '), /31 878/); assert.match(d.body.textContent, /nėra garantuotas/); ok('optimal strategy view shows computed profit, capital allocation, exhaustive search count and disclaimer');
  await click(d.querySelector('#back-to-reveal'));
  await click(d.querySelector('#next-week'));
  for (let week = 2; week <= 5; week++) {
    assert.match(d.body.textContent, new RegExp(`Savaitė ${week}\\/5`));
    assert.ok(d.querySelector('#demoBox h3').textContent.length > 0, `week ${week} has its own event`); assert.match(d.body.textContent, /Rinkos prognozė/);
    await click(d.querySelector('#demoBox [data-choice]'));
    await click(d.querySelector('#to-strategy'));
    await click(d.querySelector('#lock-demo'));
    await click(d.querySelector('#reveal-demo')); await sleep(550);
    assert.match(d.body.textContent, /Pokytis/); assert.match(d.body.textContent, /Grynoji vertė/); assert.match(d.querySelector('.me').textContent, /taškų/);
    if (week < 5) await click(d.querySelector('#next-week'));
  }
  assert.match(d.body.textContent, /Demo baigta: sužaidei visas 5 savaites/); assert.ok(!d.querySelector('#next-week')); ok('demo continues through all five weeks and ends without a sixth-week button');
  d.querySelector('#pn').value = 'Rūta'; d.querySelector('#pe').value = 'ruta@mokykla.lt'; d.querySelector('#ps').value = 'Gimnazija'; d.querySelector('#pc').checked = true;
  d.querySelector('#pf').dispatchEvent(new d.defaultView.Event('submit', { cancelable: true, bubbles: true })); await sleep(400);
  assert.match(d.querySelector('#pf').textContent, /Ačiū/); ok('pilot form submits');
  assert.deepEqual(errors, [], 'landing errors: ' + errors.join('|'));
}

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
  assert.match(d.querySelector('#pf button').textContent, /Rezervuoti sezoną/); ok('individual form CTA reserves a personal season');
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

// ---- teacher + student flow ----
const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const tr = await api('POST', '/api/teacher/register', { email: `ui-${suffix}@test.lt`, password: 'longenough1', name: 'UI Mokytojas' });
const T = tr.token;
const cls = await api('POST', '/api/teacher/classes', { name: `9B-${suffix.slice(-4)}`, grade: 9 }, T);
await api('POST', `/api/teacher/classes/${cls.id}/start`, null, T);

let studentToken;
{
  const { d, w, errors } = await page('/play', 'play.js', BASE + `/play?kodas=${cls.code}`, { 'vemak.student': '' });
  assert.ok(d.querySelector('#f')); assert.equal(d.querySelector('#code').value, new URL(BASE + `/play?kodas=${cls.code}`).searchParams.get('kodas')); ok('join page prefilled from ?kodas=');
  d.querySelector('#nick').value = 'Testas<b>';
  const joinResponse = await fetch(BASE + '/api/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ code: cls.code, nickname: 'Testas<b>', avatar: 0 }) });
  const joinPayload = await joinResponse.json();
  assert.equal(joinResponse.status, 200, JSON.stringify(joinPayload));
  const joined = joinPayload; w.localStorage.setItem('vemak.student', joined.token);
  w.eval((await build({ entryPoints: [PUB + 'play.js'], bundle: true, write: false, format: 'iife', platform: 'browser' })).outputFiles[0].text);
  await sleep(700);
  assert.ok(d.querySelector('#q'), `pre-quiz shown; join error: ${d.querySelector('#err')?.textContent || 'none'}, page: ${d.body.textContent.slice(0, 300)}`);ok('joined, pre-quiz shown');
  for (let i = 0; i < 4; i++) d.querySelector(`input[name=q${i}]`).checked = true;
  d.querySelector('#q').dispatchEvent(new w.Event('submit', { cancelable: true })); await sleep(700);
  assert.ok(d.querySelector('.city svg'), 'city shown'); ok('pre-quiz submitted, city map shows');
  assert.equal(d.querySelectorAll('[data-building]').length, 6); ok('city hub has six actionable buildings');
  assert.ok(d.querySelector('.progress-card')); assert.ok(d.querySelector('.achievement')); ok('player progression and achievement are visible');
  assert.match(d.body.textContent, /Apdovanojimų kabinetas/); assert.match(d.body.textContent, /Savaitės kelias/); ok('persistent rewards cabinet and six-week pass are visible');
  assert.ok(!d.body.innerHTML.includes('<b>Testas'), 'nickname escaped'); ok('nickname is HTML-escaped');
  await click(d.querySelector('[data-building="work"]'));
  assert.ok(d.querySelector('[data-opt]'), 'workplace opens the week screen'); ok('building opens a real feature screen');
  assert.match(d.body.textContent, /pasirinko strategiją/); ok('secret strategy lock progress is visible');
  await click(d.querySelector('[data-tab=city]'));
  await click(d.querySelector('[data-building="bank"]'));
  assert.match(d.body.textContent, /Mėnesio biudžetas/); ok('bank opens budget screen');
  await click(d.querySelector('[data-tab=city]'));
  await click(d.querySelector('[data-building="work"]'));
  assert.ok(d.querySelector('[data-opt]'), 'week screen'); ok('decision screen shows options');
  assert.equal(d.querySelector('#lock').disabled, true); ok('lock disabled until a choice is made');
  await click(d.querySelector('[data-opt]'));
  assert.equal(d.querySelector('#lock').disabled, false);
  const sl = d.querySelector('#s_res'); sl.value = '30'; sl.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(d.querySelector('#lock').disabled, true); assert.match(d.querySelector('#tot').textContent, /110/); ok('sliders must total 100 to lock');
  sl.value = '20'; sl.dispatchEvent(new w.Event('input', { bubbles: true }));
  await click(d.querySelector('#lock')); await sleep(600);
  assert.match(d.body.textContent, /užrakinta/i); ok('strategy locked via UI');
  studentToken = w.localStorage.getItem('vemak.student');
  for (const t of ['results', 'board', 'invest', 'budget', 'mentor']) { await click(d.querySelector(`[data-tab=${t}]`)); }
  ok('all tabs render without crashing');
  assert.deepEqual(errors, [], 'student errors: ' + errors.join('|'));
}
await api('POST', `/api/teacher/classes/${cls.id}/reveal`, null, T);
{
  const { d, w, errors } = await page('/play', 'play.js', BASE + '/play', { 'vemak.student': studentToken });
  await click(d.querySelector('[data-tab=results]'));
  assert.match(d.body.textContent, /Atskleidimas prasideda/); assert.ok(d.querySelector('#reveal-skip')); ok('Friday reveal starts with countdown and skip control');
  await click(d.querySelector('#reveal-skip'));
  assert.match(d.body.textContent, /Kita savaitė/); ok('reveal skip moves to next-week teaser');
  await click(d.querySelector('#reveal-next'));
  assert.match(d.body.textContent, /Penktadienio rezultatai/); ok('reveal returns to detailed financial results');
  assert.match(d.body.textContent, /Kas įvyko žingsnis po žingsnio/); ok('results includes step-by-step explanation');
  await click(d.querySelector('[data-tab=board]'));
  assert.match(d.body.textContent, /Lyderių lentelė/); assert.match(d.body.textContent, /Geriausia strategija/); ok('leaderboard shows strategy ranking first');
  await click(d.querySelector('[data-tab=mentor]'));
  assert.match(d.body.textContent, /Mentorius/); ok('mentor screen');
  await click(d.querySelector('[data-tab=invest]')); await click(d.querySelector('[data-tab=budget]')); await click(d.querySelector('[data-tab=city]'));
  assert.deepEqual(errors, [], 'student2 errors: ' + errors.join('|'));
}
{
  const { d, w, errors } = await page('/teacher', 'teacher.js', BASE + '/teacher', { 'vemak.teacher': T, 'vemak.teacher.name': 'UI Mokytojas' });
  assert.match(d.body.textContent, /9B/); ok('teacher sees class list');
  await click(d.querySelector('[data-id]'));
  assert.match(d.body.textContent, new RegExp(cls.code)); assert.ok(d.querySelector('#next')); ok('class page: code + next-week button');
  for (const t of ['students', 'lessons', 'report', 'overview']) await click(d.querySelector(`[data-t=${t}]`));
  await click(d.querySelector('[data-t=lessons]'));
  assert.match(d.body.textContent, /Poreikiai, norai/); ok('lesson plans render');
  await click(d.querySelector('[data-t=report]')); assert.ok(d.querySelector('#pdf') && d.querySelector('#csv')); ok('report has PDF + CSV buttons');
  assert.deepEqual(errors, [], 'teacher errors: ' + errors.join('|'));
}
{
  const { d, errors } = await page('/teacher', 'teacher.js', BASE + '/teacher?register=1');
  assert.match(d.querySelector('h1').textContent, /registracija/i);
  assert.ok(d.querySelector('#name') && d.querySelector('#school'));
  ok('registration CTA opens account registration form');
  assert.deepEqual(errors, [], 'registration page errors: ' + errors.join('|'));
}
console.log(`\nUI: ${n} checks passed`); process.exit(0);
