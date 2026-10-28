// play.js — student app. Screens: join, quiz, city/week, strategy, results, leaderboard, investments, budget, mentor, finish.
import { WEEKS, ASSET_META, TOPICS } from './content.js';
import { CONFIG, ASSET_KEYS, DEFAULT_MIX } from './engine.js';
import { citySVG } from './iso.js';
import { esc, $, $$, eur, pct, api, toast, AVATARS, TONE } from './ui.js';

const app = $('#app');
const TOKEN_KEY = 'vemak.student';
let token = localStorage.getItem(TOKEN_KEY);
let me = null;
let tab = 'city';
let draft = null; // { choice, sav, inv, bus, res, mix, upgrade }
let poll = null;
let revealStage = 0; // 0: start, 1: results, 2: leaderboard, 3: trophies, 4: XP, 5: mentor, 6: teaser/final

const BUCKET_META = [
  { k: 'sav', name: 'Santaupos', color: '#3b82f6', hint: '+0,3 % per savaitę, be rizikos' },
  { k: 'inv', name: 'Investicijos', color: '#8b5cf6', hint: 'Gali augti arba kristi' },
  { k: 'bus', name: 'Verslas', color: '#f5a524', hint: `Veikia pirmų ${CONFIG.BIZ_CAP_PER_LEVEL} € (1 lygis)` },
  { k: 'res', name: 'Rezervas', color: '#19b394', hint: 'Netikėtoms išlaidoms, nieko neuždirba' },
];

async function load() {
  me = await api('GET', '/api/me', null, token);
  return me;
}
function shell(inner, active) {
  const tabs = [['city', 'Miestas'], ['week', 'Savaitė'], ['results', 'Rezultatai'], ['board', 'Lyderiai'], ['invest', 'Investicijos'], ['budget', 'Biudžetas'], ['mentor', 'Mentorius']];
  app.innerHTML = `
  <header class="top"><div class="wrap">
    <a class="logo" href="/play"><i>V</i>VEMAK</a>
    <nav class="tabs" role="tablist" aria-label="Skyriai">${tabs.map(([k, n]) => `<button class="tab" role="tab" data-tab="${k}" aria-selected="${k === active}">${n}</button>`).join('')}</nav>
    <span class="pill blue">${AVATARS[me.me.avatar]} ${esc(me.me.nickname)}</span>
    <button class="btn alt" id="out" style="min-height:38px;padding:6px 12px">Atsijungti</button>
  </div></header>
  <main class="main"><div class="wrap" id="view">${inner}</div></main>`;
  $$('.tab').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; if (tab === 'results' && me.reports.length) { revealStage = 0; tab = 'reveal'; } render(); }));
  $('#out').addEventListener('click', () => { if (confirm('Atsijungti? Prisijungsi vėl tik su nauju slapyvardžiu.')) { localStorage.removeItem(TOKEN_KEY); location.reload(); } });
}

// ---------- join ----------
function renderJoin(msg = '') {
  clearInterval(poll);
  const code = new URLSearchParams(location.search).get('kodas') || '';
  let avatar = 0;
  app.innerHTML = `<div class="center card">
    <a class="logo" href="/" style="margin-bottom:12px"><i>V</i>VEMAK</a>
    <h1>Prisijunk prie klasės</h1>
    <p class="muted">Klasės kodą duos mokytojas. Realaus vardo nereikia, pasirink slapyvardį.</p>
    <form id="f" autocomplete="off">
      <label for="code">Klasės kodas</label><input id="code" maxlength="6" value="${esc(code)}" style="text-transform:uppercase;letter-spacing:4px;font-weight:800;font-size:1.3rem" required>
      <label for="nick">Slapyvardis (2-20 simbolių)</label><input id="nick" maxlength="20" required>
      <label>Avataras</label><div class="avatars">${AVATARS.map((a, i) => `<button type="button" class="avbtn" data-i="${i}" aria-pressed="${i === 0}" aria-label="Avataras ${i + 1}">${a}</button>`).join('')}</div>
      <p class="err" id="err" role="alert">${esc(msg)}</p>
      <button class="btn" style="width:100%">Pradėti</button>
    </form></div>`;
  $$('.avbtn').forEach((b) => b.addEventListener('click', () => { avatar = +b.dataset.i; $$('.avbtn').forEach((x) => x.setAttribute('aria-pressed', x === b)); }));
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await api('POST', '/api/join', { code: $('#code').value, nickname: $('#nick').value, avatar });
      token = r.token; localStorage.setItem(TOKEN_KEY, token); boot();
    } catch (er) { $('#err').textContent = er.message; }
  });
}

// ---------- quiz ----------
function renderQuiz(kind) {
  const title = kind === 'pre' ? 'Pradinis testas (4 klausimai)' : 'Baigiamasis testas (4 klausimai)';
  const intro = kind === 'pre' ? 'Tai ne pažymys. Tai padeda pamatyti, kiek išmoksi per sezoną.' : 'Sezonas baigtas. Atsakyk dar kartą ir pamatysi, kiek išmokai.';
  app.innerHTML = `<div class="center card" style="max-width:640px"><h1>${title}</h1><p class="muted">${intro}</p>
    <form id="q" class="quiz">${me.quiz.map((q, i) => `<fieldset><legend>${i + 1}. ${esc(q.q)}</legend>${q.o.map((o, j) => `<label><input type="radio" name="q${i}" value="${j}" required> ${esc(o)}</label>`).join('')}</fieldset>`).join('')}
    <p class="err" id="err" role="alert"></p><button class="btn" style="width:100%">Pateikti</button></form></div>`;
  $('#q').addEventListener('submit', async (e) => {
    e.preventDefault();
    const answers = me.quiz.map((_, i) => Number((new FormData(e.target)).get('q' + i)));
    try { await api('POST', '/api/me/quiz', { kind, answers }, token); boot(); } catch (er) { $('#err').textContent = er.message; }
  });
}

// ---------- views ----------
function stateSummary() {
  const s = me.state;
  const inv = ASSET_KEYS.reduce((t, a) => t + s.invest[a], 0);
  const last = me.reports[me.reports.length - 1];
  const mood = last ? (last.delta < -15 ? 'down' : last.delta > 40 ? 'up' : 'neutral') : 'neutral';
  return { ...s, invest: inv, mood };
}
function hud() {
  const s = me.state;
  const inv = ASSET_KEYS.reduce((t, a) => t + s.invest[a], 0);
  return `<div class="hud">
    <div class="stat"><span>Grynoji vertė</span><b>${eur(me.netWorth)}</b></div>
    <div class="stat"><span>Santaupos</span><b>${eur(s.savings)}</b></div>
    <div class="stat"><span>Investicijos</span><b>${eur(inv)}</b></div>
    <div class="stat"><span>Verslas (lyg. ${s.level})</span><b>${eur(s.business)}</b></div>
    <div class="stat"><span>Rezervas</span><b>${eur(s.reserve)}</b></div>
    ${s.debt > 0 ? `<div class="stat" style="background:#fde8e5"><span>Skola</span><b>${eur(s.debt)}</b></div>` : ''}</div>`;
}
function stepBar() {
  const phase = me.cls.revealed >= me.cls.week ? 4 : me.locked ? 3 : 1;
  const names = ['Pirmadienis: įvykis', 'Antradienis–trečiadienis: sprendimai', 'Ketvirtadienis: užrakinta', 'Penktadienis: rezultatai'];
  return `<div class="steps" aria-label="Savaitės eiga">${['Pirm.', 'Antr.–treč.', 'Ketv.', 'Penkt.'].map((n, i) => `<div class="step ${i + 1 < phase ? 'done' : i + 1 === phase ? 'on' : ''}" title="${names[i]}">${n}</div>`).join('')}</div>`;
}

function progressionCard() {
  const rewards = me.rewards || { xp: 0, level: 1, trophies: [], cosmetics: [] };
  const xp = rewards.xp || 0;
  const level = rewards.level || 1;
  const next = level * 200;
  const progress = Math.min(100, Math.round((xp % 200) / 2));
  const trophyNames = { 'financial-genius': 'Finansinis genijus', 'best-saver': 'Geriausias taupytojas', 'risk-master': 'Rizikos meistras', 'comeback-king': 'Sugrįžimo karalius', 'business-tycoon': 'Verslo magnatas', 'smart-investor': 'Sumanus investuotojas', 'most-improved': 'Didžiausia pažanga' };
  const trophies = rewards.trophies?.map((key) => trophyNames[key] || key) || [];
  return `<div class="progress-card card"><div class="progress-top"><div class="avatar-badge">${AVATARS[me.me.avatar]}</div><div><span class="eyebrow">TAVO PAŽANGA</span><h3 style="margin:0">${esc(me.me.nickname)} · ${level} lygis</h3><p class="muted" style="margin:.2em 0 0">${xp} XP · dar ${Math.max(0, next - xp)} XP iki kito lygio</p></div><strong class="xp-pill">${progress}%</strong></div><div class="xp-track"><span style="width:${progress}%"></span></div><div class="achievement"><span class="achievement-icon">🏆</span><div><b>${trophies[0] || 'Pradžia'}</b><small>${trophies.length ? 'Savaitės apdovanojimas atrakintas' : 'Pirmas apdovanojimas laukia po atskleidimo'}</small></div></div><div class="rewards-cabinet"><h4>Apdovanojimų kabinetas</h4><p class="muted">${trophies.length ? trophies.join(' · ') : 'Kol kas apdovanojimų nėra'}</p><h4>Savaitės kelias</h4><div class="reward-pass">${Array.from({ length: 6 }, (_, i) => `<span class="reward-week ${i < me.reports.length ? 'unlocked' : ''}" title="${i < me.reports.length ? 'Atrakinta' : 'Užrakinta'}">${i + 1}</span>`).join('')}</div><p class="muted">${rewards.cosmetics?.length ? `Atrakinta: ${esc(rewards.cosmetics.join(' · '))}` : 'Kiekviena savaitė atrakina naują kosmetinį daiktą.'}</p></div></div>`;
}
function cityActions() {
  const buildings = [
    ['home', '🏠', 'Namai', 'Mentorius', 'mentor'],
    ['bank', '🏦', 'Bankas', 'Biudžetas', 'budget'],
    ['work', '💼', 'Darbovietė', 'Savaitės sprendimas', 'week'],
    ['cafe', '☕', 'Kavos baras', 'Verslo kapitalas', 'invest'],
    ['invest', '📈', 'Investicijų centras', 'Turto pasirinkimai', 'invest'],
    ['arena', '🏆', 'Varžybų arena', 'Klasės lyderiai', 'board'],
  ];
  return `<section class="city-actions" aria-label="Miesto vietos"><div class="section-kicker">MIESTO HUB · PASIRINK VEIKLĄ</div><div class="building-grid">${buildings.map(([key, icon, name, desc, go]) => `<button class="building-card" data-building="${key}" data-go="${go}"><span class="building-icon">${icon}</span><span><b>${name}</b><small>${desc}</small></span><span class="building-arrow">→</span></button>`).join('')}</div></section>`;
}

function viewCity() {
  const c = me.cls;
  const notStarted = c.week < 1;
  const waiting = c.week > 0 && c.revealed >= c.week && c.status !== 'done';
  let banner = '';
  if (notStarted) banner = `<div class="card"><h2>Laukiame, kol mokytojas pradės sezoną</h2><p class="muted">Kol kas pasiruošk. Puslapis atsinaujins pats.</p></div>`;
  else if (c.status === 'done') banner = `<div class="card"><h2>Sezonas baigtas 🎉</h2><button class="btn" data-go="results">Žiūrėti rezultatus</button></div>`;
  else if (waiting) banner = `<div class="card"><h2>${c.revealed} savaitė baigta</h2><p class="muted">Palauk, kol mokytojas atvers kitą savaitę. Peržiūrėk rezultatus ir mentoriaus patarimus.</p><button class="btn" data-go="results">Žiūrėti rezultatus</button></div>`;
  else {
    const w = WEEKS[c.week - 1];
    banner = `<div class="card">${stepBar()}<span class="pill amber">${c.week} savaitė iš ${c.weeks}</span><h2 style="margin-top:8px">${esc(w.title)}</h2><p>${esc(w.body)}</p>
      <button class="btn" data-go="week">${me.locked ? 'Strategija užrakinta ✓' : 'Priimti sprendimą'}</button></div>`;
  }
  return `${hud()}${progressionCard()}<div class="city-hero"><div><span class="pill amber">TAVO MIESTAS</span><h2>Augink savo finansinį miestą</h2><p class="muted">Kiekvienas pastatas atveria kitą žaidimo dalį. Pasirink, kur eiti toliau.</p></div><span class="city-status">${c.status === 'live' ? '● Gyvas sezonas' : c.status === 'done' ? '✓ Baigta' : '○ Laukiame starto'}</span></div><div class="city-hub"><div class="city">${citySVG(stateSummary())}</div>${cityActions()}</div><div class="grid">${banner}${me.mentor ? mentorCard(true) : ''}</div>`;
}

function mentorCard(short = false) {
  const m = me.mentor;
  if (!m) return `<div class="mentor"><div class="av">🧭</div><div><b>Mentorius</b><p class="muted" style="margin:.3em 0 0">Pirmą patarimą gausi po pirmos savaitės (penktadienį).</p></div></div>`;
  return `<div class="mentor"><div class="av">🧭</div><div><b>Mentoriaus patarimai po ${me.cls.revealed} savaitės</b><ul>${m.points.slice(0, short ? 2 : 4).map((p) => `<li>${esc(p)}</li>`).join('')}</ul>
    <p class="muted" style="font-size:.8rem;margin:.6em 0 0">Tai taisyklėmis grįstas mokomasis patarimas, ne finansinė rekomendacija.</p></div></div>`;
}

function viewWeek() {
  const c = me.cls;
  if (c.week < 1) return `<div class="card"><h2>Sezonas dar nepradėtas</h2></div>`;
  if (c.revealed >= c.week) return `<div class="card"><h2>Ši savaitė jau baigta</h2><p class="muted">Palauk kitos savaitės.</p></div>`;
  const w = WEEKS[c.week - 1];
  const lockedView = me.locked && me.myPending;
  if (!draft) draft = { choice: lockedView ? me.myPending.choice : null, ...(lockedView ? me.myPending.alloc : { sav: 30, inv: 25, bus: 25, res: 20, mix: { ...DEFAULT_MIX }, upgrade: false }) };
  const dis = lockedView ? 'disabled' : '';
  const tot = draft.sav + draft.inv + draft.bus + draft.res;
  const mixTot = ASSET_KEYS.reduce((t, a) => t + (draft.mix[a] || 0), 0);
  const canLock = !lockedView && draft.choice && tot === 100 && (draft.inv === 0 || mixTot === 100);
  return `${hud()}${stepBar()}
  ${w.news ? `<div class="news ${w.topic === 'invest' || w.topic === 'risk' ? 'down' : ''}">📰 ${esc(w.news)}</div>` : ''}
  <div class="two"><div class="grid">
    <div class="card"><span class="pill amber">${c.week} savaitė · ${esc(TOPICS.find((t) => t.key === w.topic).name)}</span>
      <h2 style="margin-top:8px">${esc(w.title)}</h2><p>${esc(w.body)}</p>
      <div class="opts" role="radiogroup" aria-label="Pasirinkimai">${w.options.map((o) => `<button class="opt" role="radio" aria-checked="${draft.choice === o.key}" data-opt="${o.key}" ${dis}>
        <span class="dot" style="background:${TONE[o.tone]}">${o.cash > 0 ? '+' : o.cash < 0 ? '−' : '='}</span><span><b>${esc(o.label)}</b><small>${esc(o.desc)}</small></span></button>`).join('')}</div>
      <p class="muted" style="font-size:.85rem">${esc(w.info)}</p></div>
  </div>
  <div class="card"><h2>Ketvirtadienis: paskirstyk pinigus</h2>
  <p class="muted">Laisvus pinigus padalink į 4 krepšelius. Suma turi būti 100 %.</p>
  ${me.revealProgress ? `<div class="reveal-progress" role="status">🔒 ${me.revealProgress.locked} iš ${me.revealProgress.total} bendraklasių jau pasirinko strategiją!<small>Pasirinkimai lieka slapti iki penktadienio atskleidimo.</small></div>` : ''}
  <div class="bar" aria-hidden="true">${BUCKET_META.map((b) => `<span style="width:${draft[b.k]}%;background:${b.color}"></span>`).join('')}</div>
    <div class="alloc" style="margin-top:12px">${BUCKET_META.map((b) => `<div><div class="slider"><label for="s_${b.k}" style="margin:0">${b.name}</label>
      <input type="range" id="s_${b.k}" data-k="${b.k}" min="0" max="100" step="5" value="${draft[b.k]}" ${dis}><b id="v_${b.k}">${draft[b.k]} %</b></div><small class="muted">${b.hint}</small></div>`).join('')}</div>
    <p id="tot" class="${tot === 100 ? 'pos' : 'neg'}" role="status">Iš viso: ${tot} % ${tot === 100 ? '✓' : '(turi būti 100 %)'}</p>
    ${draft.inv > 0 ? `<h3>Kur investuoti?</h3><div class="mix">${ASSET_KEYS.map((a) => `<div class="mixitem"><div><span>${ASSET_META[a].icon} ${ASSET_META[a].name}</span><span id="m_${a}">${draft.mix[a]} %</span></div><input type="range" data-m="${a}" min="0" max="100" step="5" value="${draft.mix[a]}" aria-label="${ASSET_META[a].name}" ${dis}></div>`).join('')}</div>
      <p id="mixtot" class="${mixTot === 100 ? 'pos' : 'neg'}">Investicijų mišinys: ${mixTot} % ${mixTot === 100 ? '✓' : '(turi būti 100 %)'}</p>` : ''}
    <label style="display:flex;gap:8px;align-items:center;font-weight:600"><input type="checkbox" id="up" style="width:auto" ${draft.upgrade ? 'checked' : ''} ${dis}> Plėsti Kavos barą (−${CONFIG.BIZ_UPGRADE_COST} €, kai verslas pilnas)</label>
    <div class="lockbar">${lockedView ? '<span class="pill">🔒 Užrakinta. Rezultatai bus penktadienį.</span>' : `<button class="btn" id="lock" ${canLock ? '' : 'disabled'} style="width:100%">🔒 Užrakinti strategiją</button><p class="muted" style="font-size:.8rem;margin:.5em 0 0">Užrakinus keisti nebegalėsi.</p>`}</div>
  </div></div>`;
}

function revealStep(title, body, nextLabel = 'Tęsti →') {
  return `<div class="reveal-step card"><p class="eyebrow">PENKTADIENIO ATSKLEIDIMAS · ${revealStage + 1}/7</p><h2>${title}</h2>${body}<div class="row"><button class="btn" id="reveal-next">${nextLabel}</button><button class="btn alt" id="reveal-skip">Praleisti animaciją</button></div></div>`;
}
function viewReveal() {
  const rs = me.reports, r = rs[rs.length - 1], reward = me.rewards || { xp: 0, level: 1, trophies: [], cosmetics: [] }, rk = me.rankings;
  const mine = rk?.byStrategy.find((row) => row.nickname === me.me.nickname);
  const trophyLabels = { 'financial-genius': 'Finansinis genijus', 'best-saver': 'Geriausias taupytojas', 'risk-master': 'Rizikos meistras', 'comeback-king': 'Sugrįžimo karalius', 'business-tycoon': 'Verslo magnatas', 'smart-investor': 'Sumanus investuotojas', 'most-improved': 'Didžiausia pažanga' };
  const earned = (reward.trophies || []).map((key) => trophyLabels[key] || key);
  const nextScenario = ['Kitą savaitę rinksiesi tarp atsargaus augimo ir drąsesnio verslo plėtros plano.', 'Kitą savaitę mokysiesi, kaip pasiruošti rinkos svyravimams.'][r.week % 2];
  if (revealStage === 0) return revealStep('Atskleidimas prasideda!', '<div class="countdown" aria-live="polite">3 · 2 · 1</div><p>Visų žaidėjų sprendimai jau užrakinti. Dabar pamatysi savaitės pasekmes.</p>');
  if (revealStage === 1) return revealStep('Tavo finansiniai rezultatai', `<div class="reveal-metrics"><div><small>Pradinis balansas</small><b>${eur(r.state?.netWorth ?? (r.netWorth - r.delta))}</b></div><div><small>Grynoji vertė</small><b>${eur(r.netWorth)}</b></div><div><small>Pelnas / nuostolis</small><b class="${r.delta >= 0 ? 'pos' : 'neg'}">${eur(r.delta, true)}</b></div><div><small>Atsparumas</small><b>${r.forced ? 'Reikėjo parduoti turtą' : 'Atspari strategija'}</b></div></div>`);
  if (revealStage === 2) return revealStep('Lyderių lentelės atskleidimas', `<p>Tavo galutinė vieta: <strong>${mine?.rank || '–'}</strong>${mine?.progress ? ` · ${mine.progress > 0 ? '▲' : '▼'} ${Math.abs(mine.progress)} vietos nuo praėjusios savaitės` : ''}</p><div class="podium">${(rk?.byStrategy || []).slice(0, 3).map((row, i) => `<div class="podium-place p${i + 1}"><b>${['🥇', '🥈', '🥉'][i]}</b><span>${esc(row.nickname)}</span><strong>${eur(row.score)}</strong></div>`).join('')}</div>`);
  if (revealStage === 3) return revealStep('Trofėjų ceremonija', `<div class="trophy-ceremony">${earned.length ? earned.map((name) => `<div class="ceremony-trophy">🏆<b>${esc(name)}</b><small>Sąlygos įvykdytos pagal savaitės rezultatus</small></div>`).join('') : '<p>Šią savaitę trofėjaus nelaimėjai, bet kiekvienas rezultatas padeda mokytis.</p>'}</div>`);
  if (revealStage === 4) return revealStep('XP ir apdovanojimai', `<div class="xp-reward"><strong>+${reward.xp} XP</strong><span>${reward.level} lygis</span><div class="xp-track"><span style="width:${Math.min(100, (reward.xp % 200) / 2)}%"></span></div><p>${reward.cosmetics?.length ? `Atrakinta: ${esc(reward.cosmetics.at(-1))}` : 'Tęsk žaisti, kad atrakintum kosmetinius daiktus.'}</p></div>`);
  if (revealStage === 5) return revealStep('Mentoriaus paaiškinimas', `<div class="mentor">${mentorCard()}</div><p class="muted">Mentoriaus patarimas paremtas taisyklėmis ir tavo sprendimo pasekmėmis.</p>`);
  return revealStep('Kita savaitė', `<div class="next-week-teaser">🔭<h3>Kas laukia toliau?</h3><p>${nextScenario}</p><p class="muted">Tai tik mokomasis scenarijaus anonsas — sprendimą priimsi prasidėjus kitai savaitei.</p></div>`, 'Peržiūrėti pilnus rezultatus');
}
function viewResults() {
  const rs = me.reports;
  if (!rs.length) return `<div class="card"><h2>Rezultatų dar nėra</h2><p class="muted">Pirmos savaitės rezultatai bus atskleisti penktadienį.</p></div>`;
  const r = rs[rs.length - 1];
  const reward = me.rewards || { xp: 0, level: 1, trophies: [], cosmetics: [] };
  const posn = (v) => `<span class="${v >= 0 ? 'pos' : 'neg'}">${eur(v, true)}</span>`;
  const ev = r.events.map((e) => ({ priceRise: '📈 Kainos kilo 12 %', marketDown: '📉 Rinkos krito', marketUp: '📈 Rinkos atsigavo', bizBoom: '🎪 Verslo mugė' }[e.kind])).filter(Boolean);
  return `${hud()}<div class="two"><div class="grid">
    <div class="card"><span class="pill">${r.week} savaitė${r.auto ? ' · automatinė strategija' : ''}</span><h2 style="margin-top:8px">Penktadienio rezultatai</h2>
      ${r.secondChance ? '<div class="news">🌱 Gavai antrą galimybę: pradedi iš naujo su nedideliu rezervu.</div>' : ''}
      ${ev.length ? `<p>${ev.join(' · ')}</p>` : ''}
      <div class="res">
        <div class="resrow"><span>Poreikiai</span><b>${eur(-r.needs)}</b></div>
        <div class="resrow"><span>Norai</span><b>${eur(-r.wants)}</b></div>
        <div class="resrow"><span>Laisvi pinigai paskirstymui</span><b>${eur(r.free)}</b></div>
        ${r.expense ? `<div class="resrow"><span>Netikėta išlaida</span><b class="neg">${eur(-r.expense)}</b></div>` : ''}
        ${r.forced ? `<div class="resrow"><span>Priverstinis turto pardavimas (−15 %)</span><b class="neg">${eur(-r.penaltyLost)}</b></div>` : ''}
        ${r.newDebt > 0 ? `<div class="resrow"><span>Naujas trūkumas (skola)</span><b class="neg">${eur(-r.newDebt)}</b></div>` : ''}
        <div class="resrow"><span><b>Grynosios vertės pokytis</b></span><b style="font-size:1.2rem">${posn(r.delta)}</b></div>
      </div>
      <h3 style="margin-top:14px">Kas nutiko su turtu</h3>
      <div class="cmp">${ASSET_KEYS.filter((a) => r.alloc.inv > 0 && (r.alloc.mix[a] || 0) > 0).map((a) => `<div>${ASSET_META[a].icon}<b class="${r.market[a] >= 0 ? 'pos' : 'neg'}">${pct(r.market[a])}</b><small>${ASSET_META[a].name}</small></div>`).join('') || '<small class="muted">Šią savaitę neinvestavai.</small>'}
        <div>☕<b class="${r.bizReturn >= 0 ? 'pos' : 'neg'}">${pct(r.bizReturn)}</b><small>Kavos baras</small></div></div>
      <p style="margin-top:14px"><b>Pamoka:</b> ${esc(r.lesson)}</p>
      <div class="reveal-rewards"><h3>Penktadienio apdovanojimai</h3><p>+${reward.xp} XP · ${reward.level} lygis</p><p class="muted">Tavo strategijos ir mokymosi pasiekimai saugomi visam sezonui.</p></div>
      ${r.bankrupt ? '<div class="news down">⚠️ Skola per didelė. Kitą savaitę pradėsi iš naujo su antra galimybe.</div>' : ''}
    </div>
  </div><div class="grid">${mentorCard()}<div class="card"><h3>Grynosios vertės kelias</h3>${chart(rs)}</div></div></div>`;
}
function chart(rs) {
  const vals = [0, ...rs.map((r) => r.netWorth)];
  const max = Math.max(...vals, 100), min = Math.min(...vals, 0), W = 320, H = 130;
  const x = (i) => 12 + (i * (W - 24)) / Math.max(1, CONFIG.WEEKS);
  const y = (v) => H - 14 - ((v - min) / (max - min || 1)) * (H - 28);
  const d = vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return `<svg viewBox="0 0 ${W} ${H}" style="width:100%" role="img" aria-label="Grynosios vertės grafikas"><path d="${d}" fill="none" stroke="#19b394" stroke-width="3"/>${vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#12213f"/>`).join('')}</svg>`;
}

function viewBoard() {
  const rk = me.rankings;
  if (!rk) return `<div class="card"><h2>Lyderių lentelė</h2><p class="muted">Atsiras po pirmos atskleistos savaitės.</p></div>`;
  const rows = (list, scoreCol) => `<table><thead><tr><th>#</th><th>Žaidėjas</th><th>${scoreCol ? 'Strategijos taškai' : 'Grynoji vertė'}</th><th>Pokytis</th>${scoreCol ? '' : '<th>Vietos</th>'}</tr></thead><tbody>${list.map((r) => `<tr class="${r.nickname === me.me.nickname ? 'me' : ''}"><td><span class="medal m${r.rank}">${r.rank}</span></td><td>${AVATARS[r.avatar] || ''} ${esc(r.nickname)}</td><td>${eur(scoreCol ? r.score : r.netWorth)}</td><td class="${r.delta >= 0 ? 'pos' : 'neg'}">${eur(r.delta, true)}</td>${scoreCol ? '' : `<td>${r.progress > 0 ? '▲' + r.progress : r.progress < 0 ? '▼' + -r.progress : '–'}</td>`}</tr>`).join('')}</tbody></table>`;
  return `<h2>Lyderių lentelė · ${rk.week} savaitė</h2>
  <div class="awards">${rk.awards.map((a) => `<div class="award"><small>${esc(a.title)}</small><b>${AVATARS[0] && '🏆'} ${esc(a.who || '–')}</b>${a.value != null ? `<span class="muted">${a.type === 'growth' ? eur(a.value, true) : '+' + a.value + ' ' + a.unit}</span>` : ''}</div>`).join('')}</div>
  <div class="two"><div class="card"><h3>Geriausia strategija (rizika įskaičiuota)</h3><p class="muted" style="font-size:.85rem">Taškai: grynoji vertė, minus bauda už viską vienoje vietoje ir už priverstinius pardavimus. Tai pagrindinis reitingas.</p>${rows(rk.byStrategy.slice(0, 10), true)}</div>
  <div class="card"><h3>Pagal grynąją vertę</h3><p class="muted" style="font-size:.85rem">Antrinis reitingas: tik kiek pinigų turi.</p>${rows(rk.byWealth.slice(0, 10), false)}</div></div>`;
}

function viewInvest() {
  const inv = me.state.invest;
  const total = ASSET_KEYS.reduce((t, a) => t + inv[a], 0);
  const info = { etf: 'Plati rinka. Vidutinė rizika, patikima ilgesnėje perspektyvoje.', tech: 'Didelė galima grąža, bet ir didžiausi svyravimai.', green: 'Aukštesnė rizika, augantis sektorius.', reit: 'Stabilesnis, mažesnė grąža.', gold: 'Saugus uostas: mažai uždirba, mažai svyruoja.' };
  const risk = { etf: 'Vidutinė', tech: 'Aukšta', green: 'Vidutinė–aukšta', reit: 'Žema', gold: 'Žema' };
  return `${hud()}<h2>Investicijos</h2><p class="muted">Pasiskirstymas tarp turto: ${eur(total)}. Istorija rodo tik praeitį, ateitis gali skirtis.</p>
  <div class="mix" style="grid-template-columns:repeat(auto-fit,minmax(220px,1fr))">${ASSET_KEYS.map((a) => {
    const hist = me.reports.filter((r) => r.alloc.inv > 0).map((r) => r.market[a]);
    return `<div class="card"><div style="font-size:1.8rem">${ASSET_META[a].icon}</div><h3>${ASSET_META[a].name}</h3><p class="muted" style="font-size:.9rem">${info[a]}</p>
    <div class="resrow"><span>Rizika</span><b>${risk[a]}</b></div><div class="resrow"><span>Tavo suma</span><b>${eur(inv[a])}</b></div>
    <div class="resrow"><span>Paskutinė savaitė</span><b class="${(hist.at(-1) ?? 0) >= 0 ? 'pos' : 'neg'}">${hist.length ? pct(hist.at(-1)) : '–'}</b></div></div>`;
  }).join('')}</div>`;
}

function viewBudget() {
  const s = me.state;
  const rise = me.shield ? 0 : (me.reports.some((r) => r.events.some((e) => e.kind === 'priceRise')) ? CONFIG.PRICE_RISE : 0);
  const needs = CONFIG.NEEDS * (1 + rise), wants = Math.max(CONFIG.MIN_WANTS, CONFIG.WANTS + (me.wantsDelta || 0));
  const free = CONFIG.PAY - needs - wants;
  const seg = [['Poreikiai', needs, '#ef5b4d'], ['Norai', wants, '#f5a524'], ['Laisva', Math.max(0, free), '#19b394']];
  return `${hud()}<h2>Mėnesio biudžetas</h2>
  <div class="card"><p class="muted">Viena žaidimo savaitė atitinka vieną mėnesį. Pajamos: <b>${eur(CONFIG.PAY)}</b>.</p>
    <div class="bar" style="height:26px">${seg.map(([n, v, c]) => `<span title="${n}" style="width:${(v / CONFIG.PAY) * 100}%;background:${c}"></span>`).join('')}</div>
    <div class="res" style="margin-top:12px">${seg.map(([n, v, c]) => `<div class="resrow"><span><i style="display:inline-block;width:12px;height:12px;border-radius:4px;background:${c}"></i> ${n}</span><b>${eur(v)} (${Math.round((v / CONFIG.PAY) * 100)} %)</b></div>`).join('')}</div>
    ${rise ? '<p class="neg">Kainos pakilo 12 %, todėl poreikiai brangesni.</p>' : me.shield ? '<p class="pos">Atsargos apsaugo nuo kainų kilimo. ✓</p>' : ''}
    <p class="muted" style="font-size:.9rem">Taisyklė: pirmiausia poreikiai, tada taupymas, tada norai.</p></div>`;
}

function viewMentor() {
  const all = Object.keys(me.mentor ? { 1: 1 } : {}).length;
  return `<h2>AI mentorius</h2>${mentorCard()}
  <div class="card" style="margin-top:14px"><h3>Kaip veikia mentorius</h3><ul>
  <li>Jis mato tik tavo sprendimus ir skaičius, <b>ne tavo vardo ar asmens duomenų</b>.</li>
  <li>Faktai skaičiuojami pagal taisykles, todėl jie niekada neišgalvoti.</li>
  <li>Tai mokomieji patarimai žaidime, ne investavimo rekomendacijos.</li></ul></div>`;
}

function viewFinish() {
  const q = me.quizResult, last = me.reports[me.reports.length - 1];
  const rk = me.rankings;
  const mine = rk?.byStrategy.find((r) => r.nickname === me.me.nickname);
  return `<div class="card hero-end"><div class="big">🎉 Sezonas baigtas</div><p>Tavo galutinė grynoji vertė: <b>${eur(last?.netWorth || 0)}</b>${mine ? ` · strategijos vieta: <b>${mine.rank}</b>` : ''}</p>
  ${q ? `<h3>Ką išmokai</h3><div class="cmp"><div><small>Prieš</small><b>${q.pre} %</b></div><div><small>Po</small><b>${q.post} %</b></div><div><small>Pokytis</small><b class="${q.post - q.pre >= 0 ? 'pos' : 'neg'}">${q.post - q.pre > 0 ? '+' : ''}${q.post - q.pre} %</b></div></div>` : ''}</div>
  ${viewResults()}`;
}

// ---------- render + events ----------
function render() {
  if (!me) return;
  if (me.cls.status === 'done' && tab === 'city' && me.reports.length) tab = 'finish';
  const views = { city: viewCity, week: viewWeek, results: viewResults, reveal: viewReveal, board: viewBoard, invest: viewInvest, budget: viewBudget, mentor: viewMentor, finish: viewFinish };
  shell(views[tab](), tab === 'finish' ? 'results' : tab);
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; if (tab === 'results' && me.reports.length) { revealStage = 0; tab = 'reveal'; } render(); }));
  $$('[data-go]').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.go; render(); }));
  if (tab === 'week') bindWeek();
  if (tab === 'reveal') bindReveal();
  window.scrollTo(0, 0);
}
function bindReveal() {
  const advance = () => { if (revealStage < 6) revealStage += 1; else tab = 'results'; render(); };
  $('#reveal-next')?.addEventListener('click', advance);
  $('#reveal-skip')?.addEventListener('click', () => { revealStage = 6; render(); });
}
function refreshTotals() {
  const tot = draft.sav + draft.inv + draft.bus + draft.res;
  $('#tot').className = tot === 100 ? 'pos' : 'neg';
  $('#tot').textContent = `Iš viso: ${tot} % ${tot === 100 ? '✓' : '(turi būti 100 %)'}`;
  const mt = ASSET_KEYS.reduce((t, a) => t + (draft.mix[a] || 0), 0);
  if ($('#mixtot')) { $('#mixtot').className = mt === 100 ? 'pos' : 'neg'; $('#mixtot').textContent = `Investicijų mišinys: ${mt} % ${mt === 100 ? '✓' : '(turi būti 100 %)'}`; }
  const bar = $('.bar'); if (bar) bar.innerHTML = BUCKET_META.map((b) => `<span style="width:${draft[b.k]}%;background:${b.color}"></span>`).join('');
  const ok = draft.choice && tot === 100 && (draft.inv === 0 || mt === 100);
  if ($('#lock')) $('#lock').disabled = !ok;
}
function bindWeek() {
  $$('[data-opt]').forEach((b) => b.addEventListener('click', () => { draft.choice = b.dataset.opt; $$('[data-opt]').forEach((x) => x.setAttribute('aria-checked', x === b)); refreshTotals(); }));
  $$('[data-k]').forEach((r) => r.addEventListener('input', () => {
    const k = r.dataset.k; draft[k] = +r.value; $('#v_' + k).textContent = r.value + ' %';
    refreshTotals();
  }));
  $$('[data-k]').forEach((r) => r.addEventListener('change', () => { if (r.dataset.k === 'inv') render(); }));
  $$('[data-m]').forEach((r) => r.addEventListener('input', () => { draft.mix[r.dataset.m] = +r.value; $('#m_' + r.dataset.m).textContent = r.value + ' %'; refreshTotals(); }));
  $('#up')?.addEventListener('change', (e) => { draft.upgrade = e.target.checked; });
  $('#lock')?.addEventListener('click', async () => {
    if (!confirm('Užrakinti strategiją? Vėliau keisti nebegalėsi.')) return;
    try {
      await api('POST', '/api/me/lock', { choice: draft.choice, alloc: { sav: draft.sav, inv: draft.inv, bus: draft.bus, res: draft.res, mix: draft.mix, upgrade: draft.upgrade } }, token);
      toast('Strategija užrakinta 🔒', 'ok'); await load(); tab = 'city'; render();
    } catch (e) { toast(e.message, 'err'); }
  });
}

async function boot() {
  if (!token) return renderJoin();
  try { await load(); } catch (e) { if (e.status === 401) { localStorage.removeItem(TOKEN_KEY); token = null; return renderJoin('Sesija pasibaigė. Prisijunk iš naujo.'); } return app.innerHTML = `<div class="center card"><p class="err">${esc(e.message)}</p></div>`; }
  if (me.needsPre) return renderQuiz('pre');
  if (me.needsPost) return renderQuiz('post');
  draft = null; render();
  clearInterval(poll);
  poll = setInterval(async () => { // light polling so the class stays in sync with the teacher
    if (document.hidden || tab === 'week' && !me.locked) return;
    const before = `${me.cls.week}/${me.cls.revealed}/${me.cls.status}`;
    try { await load(); } catch { return; }
    if (`${me.cls.week}/${me.cls.revealed}/${me.cls.status}` !== before) {
      draft = null; if (me.needsPost) return boot();
      toast(me.cls.revealed > Number(before.split('/')[1]) ? 'Rezultatai atskleisti!' : 'Nauja savaitė prasidėjo!', 'ok'); render();
    }
  }, 6000);
}
boot();
