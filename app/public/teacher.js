// teacher.js — teacher dashboard: login, classes, season control, live stats, lesson plans, CSV + PDF (print) export.
import { esc, $, $$, eur, api, toast, AVATARS } from './ui.js';
import { WEEKS, TOPICS } from './content.js';

const app = $('#app');
const KEY = 'vemak.teacher';
let token = localStorage.getItem(KEY);
let timer = null;
let tabName = 'overview';

const shell = (inner, name = '') => {
  app.innerHTML = `<header class="top"><div class="wrap"><a class="logo" href="/"><i>V</i>VEMAK</a><span class="pill blue">Mokytojo skydelis</span><span style="flex:1"></span>
    ${name ? `<span class="muted">${esc(name)}</span><button class="btn alt" id="out" style="min-height:38px;padding:6px 12px">Atsijungti</button>` : ''}</div></header>
    <main class="main"><div class="wrap" id="view">${inner}</div></main>`;
  $('#out')?.addEventListener('click', () => { localStorage.removeItem(KEY); token = null; boot(); });
};

function viewLogin(mode = 'login', msg = '') {
  clearInterval(timer);
  shell(`<div class="center card" style="margin-top:4vh"><h1>${mode === 'login' ? 'Mokytojo prisijungimas' : 'Mokytojo registracija'}</h1>
  <form id="f">${mode === 'register' ? `<label for="name">Vardas, pavardė</label><input id="name" required maxlength="60"><label for="school">Mokykla</label><input id="school" maxlength="80">` : ''}
  <label for="email">El. paštas</label><input id="email" type="email" required autocomplete="username">
  <label for="pw">Slaptažodis ${mode === 'register' ? '(bent 8 simboliai)' : ''}</label><input id="pw" type="password" required minlength="${mode === 'register' ? 8 : 1}" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}">
  <p class="err" id="err" role="alert">${esc(msg)}</p><button class="btn" style="width:100%">${mode === 'login' ? 'Prisijungti' : 'Registruotis'}</button></form>
  <p style="text-align:center"><a href="#" id="sw">${mode === 'login' ? 'Neturi paskyros? Registruokis' : 'Jau turi paskyrą? Prisijunk'}</a></p>
  <p class="muted" style="font-size:.8rem">Mokinių el. pašto adresų nerenkame. Mokiniai jungiasi tik su klasės kodu ir slapyvardžiu.</p></div>`);
  $('#sw').addEventListener('click', (e) => { e.preventDefault(); viewLogin(mode === 'login' ? 'register' : 'login'); });
  $('#f').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const body = { email: $('#email').value, password: $('#pw').value };
      if (mode === 'register') { body.name = $('#name').value; body.school = $('#school').value; }
      const r = await api('POST', '/api/teacher/' + mode, body);
      token = r.token; localStorage.setItem(KEY, token); localStorage.setItem(KEY + '.name', r.name); boot();
    } catch (er) { $('#err').textContent = er.message; }
  });
}

async function viewClasses() {
  clearInterval(timer);
  const list = await api('GET', '/api/teacher/classes', null, token);
  shell(`<div class="row" style="justify-content:space-between"><h1>Mano klasės</h1></div>
  <div class="two" style="grid-template-columns:1fr 1fr">
  <div class="card"><h3>Nauja klasė</h3><form id="nc"><label for="cn">Pavadinimas (pvz. 10A)</label><input id="cn" required maxlength="30">
    <label for="cg">Klasė</label><select id="cg">${[5,6,7,8,9,10,11,12].map((g) => `<option ${g === 10 ? 'selected' : ''}>${g}</option>`).join('')}</select>
    <p class="err" id="err" role="alert"></p><button class="btn">Sukurti klasę</button></form></div>
  <div class="grid">${list.length ? list.map((c) => `<a class="card" href="#" data-id="${c.id}" style="text-decoration:none;color:inherit"><div class="row" style="justify-content:space-between"><h3 style="margin:0">${esc(c.name)}</h3><span class="pill ${c.status === 'live' ? '' : 'amber'}">${{ draft: 'Nepradėta', live: 'Vyksta', done: 'Baigta' }[c.status]}</span></div>
    <p class="muted" style="margin:.4em 0">Kodas: <b style="letter-spacing:3px;color:var(--navy)">${esc(c.code)}</b> · ${c.students} mokiniai · savaitė ${c.week}/6</p></a>`).join('') : '<div class="card muted">Dar neturi klasių. Sukurk pirmąją.</div>'}</div></div>`, localStorage.getItem(KEY + '.name'));
  $$('[data-id]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openClass(a.dataset.id); }));
  $('#nc').addEventListener('submit', async (e) => {
    e.preventDefault();
    try { const r = await api('POST', '/api/teacher/classes', { name: $('#cn').value, grade: $('#cg').value }, token); openClass(r.id); } catch (er) { $('#err').textContent = er.message; }
  });
}

async function openClass(id) {
  tabName = 'overview';
  const draw = async () => {
    let c;
    try { c = await api('GET', '/api/teacher/classes/' + id, null, token); } catch (e) { if (e.status === 401) { localStorage.removeItem(KEY); token = null; return boot(); } toast(e.message, 'err'); return viewClasses(); }
    renderClass(c, draw);
  };
  await draw();
  clearInterval(timer);
  timer = setInterval(() => { if (!document.hidden && tabName === 'overview') draw(); }, 8000);
}

function renderClass(c, redraw) {
  const s = c.stats, joinUrl = `${location.origin}/play?kodas=${c.code}`;
  const phase = c.status === 'draft' ? 'Sezonas nepradėtas' : c.status === 'done' ? 'Sezonas baigtas' : c.revealed >= c.week ? `${c.week} savaitė atskleista` : `${c.week} savaitė vyksta`;
  const canReveal = c.status === 'live' && c.revealed < c.week;
  const canNext = c.status === 'live' && c.revealed >= c.week && c.week < 6;
  const tabs = [['overview', 'Apžvalga'], ['students', 'Mokiniai'], ['lessons', 'Pamokų planai'], ['report', 'Ataskaita']];
  const body = {
    overview: () => `<div class="hud">
      <div class="stat"><span>Mokiniai</span><b>${s.students}</b></div>
      <div class="stat"><span>Strategija užrakinta</span><b>${s.lockedThisWeek}/${s.students}</b></div>
      <div class="stat"><span>Užbaigtos savaitės</span><b>${s.completion} %</b></div>
      <div class="stat"><span>Žinių pokytis</span><b>${s.knowledgeChange == null ? '–' : (s.knowledgeChange > 0 ? '+' : '') + s.knowledgeChange + ' %'}</b></div></div>
      <div class="two"><div class="card"><h3>Žinių pokytis pagal temą</h3>${s.quizPost ? '' : '<p class="muted" style="font-size:.85rem">Baigiamasis testas atsiras po sezono pabaigos. Rodoma tik tikrų mokinių atsakymų statistika.</p>'}
        ${s.topics.map((t) => `<div style="margin:12px 0"><div class="row" style="justify-content:space-between"><b>${TOPICS.find((x) => x.key === t.key).name}</b><span>${t.pre == null ? '–' : t.pre + ' %'} → ${t.post == null ? '–' : t.post + ' %'}</span></div>
          <div class="bar"><span style="width:${t.pre || 0}%;background:#94a3b8"></span></div><div class="bar" style="margin-top:3px"><span style="width:${t.post || 0}%;background:#19b394"></span></div></div>`).join('')}
        <small class="muted">Pilka: prieš · žalia: po</small></div>
      <div class="card"><h3>Lyderiai</h3>${c.rankings ? `<table><tbody>${c.rankings.byStrategy.slice(0, 5).map((r) => `<tr><td><span class="medal m${r.rank}">${r.rank}</span></td><td>${AVATARS[r.avatar] || ''} ${esc(r.nickname)}</td><td>${eur(r.score)}</td></tr>`).join('')}</tbody></table><p class="muted" style="font-size:.8rem">Strategijos taškai (rizika įskaičiuota)</p>` : '<p class="muted">Atsiras po pirmos atskleistos savaitės.</p>'}</div></div>`,
    students: () => `<div class="card" style="overflow:auto"><table><thead><tr><th>Slapyvardis</th><th>Užrakinta</th><th>Savaitės</th><th>Gr. vertė</th><th>Strat. taškai</th><th>Prival. pardavimai</th><th>Skola</th><th>Testas prieš/po</th></tr></thead><tbody>
      ${c.students.map((x) => `<tr><td>${esc(x.nickname)}</td><td>${x.locked ? '🔒' : '–'}</td><td>${x.weeksPlayed}</td><td>${x.netWorth == null ? '–' : eur(x.netWorth)}</td><td>${x.score == null ? '–' : eur(x.score)}</td><td>${x.forcedSales}</td><td>${x.debt > 0 ? eur(x.debt) : '–'}</td><td>${x.pre ?? '–'} / ${x.post ?? '–'}</td></tr>`).join('') || '<tr><td colspan="8" class="muted">Dar nėra mokinių. Pasidalink kodu.</td></tr>'}</tbody></table></div>`,
    lessons: () => `<div class="grid">${c.lessons.map((l) => `<div class="card"><span class="pill ${l.week === c.week ? '' : 'blue'}">${l.week} savaitė · ${l.minutes} min.</span><h3 style="margin-top:8px">${esc(l.title)}</h3>
      <p><b>Tikslas:</b> ${esc(l.goal)}</p><p><b>Veikla:</b> ${esc(l.activity)}</p><p><b>Diskusijos klausimai:</b></p><ul>${l.questions.map((q) => `<li>${esc(q)}</li>`).join('')}</ul>
      <p class="muted" style="font-size:.85rem">Žaidimo įvykis: ${esc(WEEKS[l.week - 1].title)}</p></div>`).join('')}
      <p class="muted">Pamokų planai yra pavyzdiniai. Prieš teigdami atitiktį Bendrosioms programoms, susiekite jas su konkrečiais mokymosi pasiekimais.</p></div>`,
    report: () => `<div class="card" id="rep"><h2>Klasės ataskaita · ${esc(c.name)}</h2><p class="muted">${new Date().toLocaleDateString('lt-LT')} · ${s.students} mokiniai · ${phase}</p>
      <div class="hud"><div class="stat"><span>Užbaigtos savaitės</span><b>${s.completion} %</b></div><div class="stat"><span>Žinių pokytis</span><b>${s.knowledgeChange == null ? '–' : (s.knowledgeChange > 0 ? '+' : '') + s.knowledgeChange + ' %'}</b></div><div class="stat"><span>Testą atliko prieš/po</span><b>${s.quizPre}/${s.quizPost}</b></div></div>
      <table><thead><tr><th>Tema</th><th>Prieš</th><th>Po</th></tr></thead><tbody>${s.topics.map((t) => `<tr><td>${TOPICS.find((x) => x.key === t.key).name}</td><td>${t.pre ?? '–'}${t.pre == null ? '' : ' %'}</td><td>${t.post ?? '–'}${t.post == null ? '' : ' %'}</td></tr>`).join('')}</tbody></table>
      <p class="muted" style="font-size:.85rem">Rodikliai skaičiuojami tik iš šios klasės mokinių atsakymų. Maža imtis nėra statistiškai patikima. Naudokite kaip pokalbio pradžią.</p>
      <div class="row noprint" style="margin-top:12px"><button class="btn" id="pdf">Spausdinti / PDF</button><button class="btn alt" id="csv">Atsisiųsti CSV</button></div></div>`,
  }[tabName]();
  shell(`<div class="row" style="justify-content:space-between;margin-bottom:10px"><div><a href="#" id="back">← Visos klasės</a><h1 style="margin:.2em 0">Klasė ${esc(c.name)}</h1></div>
    <div class="card" style="padding:12px 16px"><small class="muted">Klasės kodas</small><div style="font-size:1.8rem;font-weight:900;letter-spacing:6px;color:var(--navy)">${esc(c.code)}</div><small class="muted">${esc(joinUrl)}</small></div></div>
  <div class="card" style="margin-bottom:14px"><div class="row" style="justify-content:space-between"><div><span class="pill ${c.status === 'live' ? '' : 'amber'}">${phase}</span>
    <p class="muted" style="margin:.4em 0 0;font-size:.9rem">${c.status === 'draft' ? 'Kai mokiniai prisijungs, pradėk sezoną.' : c.status === 'live' ? 'Ciklas: sprendimai → atskleisti rezultatus → kita savaitė.' : 'Mokiniai gali atlikti baigiamąjį testą.'}</p></div>
    <div class="row">${c.status === 'draft' ? '<button class="btn" id="start">Pradėti sezoną</button>' : ''}${canReveal ? `<button class="btn" id="reveal">Atskleisti ${c.week} savaitės rezultatus</button>` : ''}${canNext ? `<button class="btn dark" id="next">Pradėti ${c.week + 1} savaitę</button>` : ''}
    <button class="btn alt" id="del" style="color:#b3261e">Ištrinti</button></div></div></div>
  <nav class="tabs" role="tablist" style="margin-bottom:14px">${tabs.map(([k, n]) => `<button class="tab" role="tab" data-t="${k}" aria-selected="${k === tabName}">${n}</button>`).join('')}</nav>${body}`, localStorage.getItem(KEY + '.name'));
  $('#back').addEventListener('click', (e) => { e.preventDefault(); viewClasses(); });
  $$('[data-t]').forEach((b) => b.addEventListener('click', () => { tabName = b.dataset.t; renderClass(c, redraw); }));
  const act = (sel, path, msg, confirmMsg) => $(sel)?.addEventListener('click', async () => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    try { await api('POST', `/api/teacher/classes/${c.id}/${path}`, null, token); toast(msg, 'ok'); redraw(); } catch (e) { toast(e.message, 'err'); }
  });
  act('#start', 'start', 'Sezonas pradėtas');
  act('#reveal', 'reveal', 'Rezultatai atskleisti', `Atskleisti rezultatus? Mokiniai, kurie neužrakino strategijos (${c.stats.students - c.stats.lockedThisWeek}), gaus numatytą strategiją.`);
  act('#next', 'next', 'Nauja savaitė prasidėjo');
  $('#del')?.addEventListener('click', async () => {
    if (!confirm(`Ištrinti klasę ${c.name} ir visų mokinių duomenis? Šio veiksmo atšaukti negalima.`)) return;
    try { await api('DELETE', '/api/teacher/classes/' + c.id, null, token); toast('Klasė ištrinta', 'ok'); viewClasses(); } catch (e) { toast(e.message, 'err'); }
  });
  $('#pdf')?.addEventListener('click', () => window.print());
  $('#csv')?.addEventListener('click', async () => {
    try {
      const r = await fetch(`/api/teacher/classes/${c.id}/export.csv`, { headers: { Authorization: 'Bearer ' + token } });
      if (!r.ok) throw new Error('Nepavyko atsisiųsti.');
      const blob = await r.blob(), a = document.createElement('a');
      a.href = URL.createObjectURL(blob); a.download = `vemak-${c.name}.csv`; a.click(); URL.revokeObjectURL(a.href);
    } catch (e) { toast(e.message, 'err'); }
  });
}

async function boot() {
  if (!token) return viewLogin();
  try { await viewClasses(); } catch (e) { if (e.status === 401) { localStorage.removeItem(KEY); token = null; return viewLogin('login', 'Sesija pasibaigė.'); } toast(e.message, 'err'); }
}
boot();
