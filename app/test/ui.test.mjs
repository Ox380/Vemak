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
const api = async (m, p, b, t) => (await fetch(BASE + p, { method: m, headers: { 'content-type': 'application/json', ...(t ? { authorization: 'Bearer ' + t } : {}) }, body: b ? JSON.stringify(b) : undefined })).json();
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

// ---- landing ----
{
  const { d, w, errors } = await page('/', 'landing.js', BASE + '/');
  assert.ok([...d.querySelectorAll('.nav a.btn')].some((a) => a.textContent.includes('Registruoti paskyrą') && a.getAttribute('href') === '/teacher?register=1')); ok('registration CTA links to signup');
  assert.ok(![...d.querySelectorAll('.hero .row a')].some((a) => a.getAttribute('href') === '#demo')); ok('duplicate hero demo button removed');
  assert.ok(![...d.querySelectorAll('.nav a')].some((a) => a.textContent.trim() === 'Demo')); ok('duplicate demo navigation link remains removed');
  assert.ok(d.querySelector('#heroCity svg')); ok('hero city renders');
  assert.match(d.querySelector('#demoBox').textContent, /Sveikas atvykęs į VEMAK/); ok('demo starts with introduction');
  await click(d.querySelector('#start-demo'));
  await click(d.querySelector('#demoBox [data-choice]'));
  await click(d.querySelector('#to-strategy'));
  assert.ok(d.querySelector('#lock-demo').disabled === false); ok('demo event leads to secret strategy');
  const reserve = d.querySelector('[data-bucket="res"]'); reserve.value = '20'; reserve.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(d.querySelector('#lock-demo').disabled, true); ok('demo lock requires exactly 100% allocation');
  reserve.value = '25'; reserve.dispatchEvent(new w.Event('input', { bubbles: true }));
  await click(d.querySelector('#lock-demo'));
  assert.match(d.body.textContent, /Strategija užrakinta/); assert.ok(!d.body.textContent.includes('Klasės lyderių lentelė')); ok('demo keeps strategy private after lock');
  await click(d.querySelector('#reveal-demo')); await sleep(550);
  assert.match(d.body.textContent, /Klasės lyderių lentelė/); assert.match(d.body.textContent, /Rizikos meistras/); ok('Friday reveal shows leaderboard and awards');
  assert.match(d.body.textContent, /Išbandyti kitą strategiją/); assert.match(d.body.textContent, /Kita savaitė/); ok('demo offers replay and next week');
  await click(d.querySelector('#second-chance'));
  assert.match(d.body.textContent, /Alternatyvus sprendimas/); ok('second chance compares alternative decision');
  d.querySelector('#pn').value = 'Rūta'; d.querySelector('#pe').value = 'ruta@mokykla.lt'; d.querySelector('#ps').value = 'Gimnazija'; d.querySelector('#pc').checked = true;
  d.querySelector('#pf').dispatchEvent(new d.defaultView.Event('submit', { cancelable: true, bubbles: true })); await sleep(400);
  assert.match(d.querySelector('#pf').textContent, /Ačiū/); ok('pilot form submits');
  assert.deepEqual(errors, [], 'landing errors: ' + errors.join('|'));
}

// ---- teacher + student flow ----
const tr = await api('POST', '/api/teacher/register', { email: 'ui@test.lt', password: 'longenough1', name: 'UI Mokytojas' });
const T = tr.token;
const cls = await api('POST', '/api/teacher/classes', { name: '9B', grade: 9 }, T);
await api('POST', `/api/teacher/classes/${cls.id}/start`, null, T);

let studentToken;
{
  const { d, w, errors } = await page('/play', 'play.js', BASE + `/play?kodas=${cls.code}`, { 'vemak.student': '' });
  assert.ok(d.querySelector('#f')); assert.equal(d.querySelector('#code').value, new URL(BASE + `/play?kodas=${cls.code}`).searchParams.get('kodas')); ok('join page prefilled from ?kodas=');
  d.querySelector('#nick').value = 'Testas<b>'; d.querySelector('#f').dispatchEvent(new w.Event('submit', { cancelable: true })); await sleep(700);
  assert.ok(d.querySelector('#q'), 'pre-quiz shown');ok('joined, pre-quiz shown');
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
  assert.match(d.body.textContent, /Penktadienio rezultatai/); assert.match(d.body.textContent, /Pamoka:/); ok('results screen shows after reveal');
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
