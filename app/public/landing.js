// landing.js — hero city + live demo (runs the REAL engine in the browser, no login, nothing sent to a server).
import { WEEKS } from './content.js';
import { buildSeason, newState, playWeek, mentorFacts, mentorNote, ASSET_KEYS } from './engine.js';
import { citySVG } from './iso.js';
import { esc, $, eur, api, toast } from './ui.js';

$('#heroCity').innerHTML = citySVG({ level: 2, savings: 420, reserve: 300, business: 640, invest: 520, mood: 'up' });

const PRESETS = {
  balanced: { label: 'Subalansuota', desc: '30 % santaupos · 25 % investicijos · 25 % verslas · 20 % rezervas', alloc: { sav: 30, inv: 25, bus: 25, res: 20 } },
  allbiz:   { label: 'Viskas į verslą', desc: '100 % verslas', alloc: { sav: 0, inv: 0, bus: 100, res: 0 } },
  noreserve:{ label: 'Be rezervo', desc: '30 % santaupos · 40 % investicijos · 30 % verslas', alloc: { sav: 30, inv: 40, bus: 30, res: 0 } },
};
const season = buildSeason('demo-2026');
let state, round, choice, preset;
const box = $('#demoBox');
const mix = { etf: 50, tech: 0, green: 0, reit: 30, gold: 20 };
const reset = () => { state = newState(); round = 1; choice = null; preset = 'balanced'; draw(); };

function draw() {
  const w = WEEKS[round - 1];
  const last = state.history[state.history.length - 1];
  const city = citySVG({ level: state.level, savings: state.savings, reserve: state.reserve, business: state.business, invest: ASSET_KEYS.reduce((t, a) => t + state.invest[a], 0), mood: last ? (last.delta < -15 ? 'down' : last.delta > 40 ? 'up' : 'neutral') : 'neutral', debt: state.debt });
  box.innerHTML = `<div class="two"><div class="city">${city}</div><div>
    <span class="pill amber">Demo · ${round} iš 2 savaičių</span><h3 style="margin-top:8px">${esc(w.title)}</h3><p>${esc(w.body)}</p>
    <div class="opts" role="radiogroup" aria-label="Pasirinkimas">${w.options.map((o) => `<button class="opt" role="radio" aria-checked="${choice === o.key}" data-c="${o.key}"><span class="dot" style="background:${{ red: '#ef5b4d', green: '#19b394', blue: '#3b82f6' }[o.tone] || '#94a3b8'}">${o.cash > 0 ? '+' : o.cash < 0 ? '−' : '='}</span><span><b>${esc(o.label)}</b><small>${esc(o.desc)}</small></span></button>`).join('')}</div>
    <h4 style="margin:14px 0 4px">Kaip paskirstysi laisvus pinigus?</h4>
    <div class="presets">${Object.entries(PRESETS).map(([k, p]) => `<button class="opt" role="radio" aria-checked="${preset === k}" data-p="${k}"><span><b>${p.label}</b><small>${p.desc}</small></span></button>`).join('')}</div>
    <button class="btn" id="go" style="width:100%" ${choice ? '' : 'disabled'}>Užrakinti ir pamatyti rezultatą</button></div></div>`;
  box.querySelectorAll('[data-c]').forEach((b) => b.addEventListener('click', () => { choice = b.dataset.c; draw(); }));
  box.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => { preset = b.dataset.p; draw(); }));
  $('#go').addEventListener('click', play);
}

function play() {
  const { state: ns, report } = playWeek(state, season, round, choice, { ...PRESETS[preset].alloc, mix, upgrade: false });
  state = ns;
  const note = mentorNote(mentorFacts(report, round + 1));
  const city = citySVG({ level: state.level, savings: state.savings, reserve: state.reserve, business: state.business, invest: ASSET_KEYS.reduce((t, a) => t + state.invest[a], 0), mood: report.delta < -15 ? 'down' : report.delta > 40 ? 'up' : 'neutral', debt: state.debt });
  const done = round >= 2;
  box.innerHTML = `<div class="two"><div class="city">${city}</div><div>
    <span class="pill">Penktadienio rezultatas · ${round} savaitė</span>
    <h3 style="margin-top:8px">Grynosios vertės pokytis: <span class="${report.delta >= 0 ? 'pos' : 'neg'}">${eur(report.delta, true)}</span></h3>
    ${report.expense ? `<div class="news down">⚠️ Netikėta išlaida: ${eur(report.expense)}${report.forced ? '. Teko parduoti turtą su 15 % praradimu.' : '. Sumokėta be nuostolių.'}</div>` : ''}
    <p><b>Pamoka:</b> ${esc(report.lesson)}</p>
    <div class="mentor"><div class="av">🧭</div><div><b>Mentorius</b><ul>${note.points.slice(0, 3).map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div>
    <div class="row" style="margin-top:14px">${done ? `<a class="btn" href="#pilotas">Prašyti pilotinio bandymo</a><button class="btn alt" id="again">Bandyti kitaip</button>` : '<button class="btn" id="next">Kita savaitė →</button>'}</div>
    ${done ? `<p class="note">Šis demo naudoja tą patį variklį kaip pilnas žaidimas. Pilname žaidime yra 6 savaitės, klasės reitingas ir mokytojo skydelis.</p>` : ''}</div></div>`;
  $('#next')?.addEventListener('click', () => { round = 2; choice = null; draw(); });
  $('#again')?.addEventListener('click', reset);
}
reset();

$('#pf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('POST', '/api/pilot', { name: $('#pn').value, email: $('#pe').value, school: $('#ps').value, role: $('#pr').value, message: $('#pm').value, consent: $('#pc').checked });
    $('#pf').innerHTML = '<h3>Ačiū! Prašymas gautas ✓</h3><p>Susisieksime el. paštu dėl pilotinio bandymo.</p>';
  } catch (er) { $('#perr').textContent = er.message; }
});
