// landing.js — anonymous one-week playable demo; no login, no server writes.
import { DEMO_CHOICES, DEMO_EVENT, DEMO_CAPITAL, buildDemoReveal, compareDemoChoice, validateDemoAllocation } from './demo.js';
import { citySVG } from './iso.js';
import { esc, $, eur, api } from './ui.js';

$('#heroCity').innerHTML = citySVG({ level: 2, savings: 420, reserve: 300, business: 640, invest: 520, mood: 'up' });
const box = $('#demoBox');
const BUCKETS = [
  { key: 'sav', name: 'Santaupos', color: '#3b82f6', hint: 'lėtai auga, maža rizika' },
  { key: 'inv', name: 'Investicijos', color: '#8b5cf6', hint: 'didesnė grąža, bet svyravimai' },
  { key: 'bus', name: 'Verslas', color: '#f5a524', hint: 'augina tavo mokyklos mugę' },
  { key: 'res', name: 'Avarinis rezervas', color: '#19b394', hint: 'apsaugo nuo netikėtumų' },
];
let phase = 'intro';
let choice = null;
let alloc = { sav: 25, inv: 25, bus: 25, res: 25 };
let reveal = null;
let comparison = null;
let startingCapital = DEMO_CAPITAL;
let weekNo = 1;

function total() { return Object.values(alloc).reduce((sum, value) => sum + value, 0); }
function allocationError() { return validateDemoAllocation(alloc); }
function city(result = null) {
  const s = result || { level: 1, savings: 250, reserve: 250, business: 250, invest: 250, debt: 0 };
  return citySVG({ level: s.level || 1, savings: s.savings || 0, reserve: s.reserve || 0, business: s.business || 0, invest: s.invest || 0, mood: result?.delta < 0 ? 'down' : result ? 'up' : 'neutral', debt: 0 });
}
function header(step, label) {
  return `<div class="demo-head"><div><span class="pill blue">5 min demo</span><span class="pill amber">${step}/3 · ${label}</span></div><strong>Šios savaitės kapitalas: ${eur(startingCapital)}</strong></div>`;
}
function drawIntro() {
  box.innerHTML = `<div class="demo-intro"><div class="demo-intro-art">🏙️</div><div><span class="pill blue">VEMAK · finansinė strategija</span><h3>Sveikas atvykęs į VEMAK!</h3><p>Turi <b>1 000 virtualių eurų</b>. Tavo tikslas – per 6 savaites užauginti savo turtą, priimant protingus finansinius sprendimus.</p><ul><li>Pasirink kryptį pagal ekonominį įvykį.</li><li>Paskirstyk visus pinigus ir užrakink slaptą strategiją.</li><li>Penktadienį palygink rezultatą su klasės draugais.</li></ul><button class="btn" id="start-demo">Pradėti</button></div></div>`;
  $('#start-demo').addEventListener('click', () => { phase = 'event'; draw(); });
}
function drawEvent() {
  box.innerHTML = `${header(1, 'Ekonominis įvykis')}<div class="demo-grid"><div class="city">${city()}</div><div class="card demo-panel"><p class="eyebrow">${weekNo === 1 ? 'PIRMADIENIS' : 'NAUJA SAVAITĖ'} · IŠŠŪKIS</p><h3>${esc(DEMO_EVENT.title)}</h3><p>${esc(DEMO_EVENT.body)}</p><div class="news">⚡ Penktadienį paaiškės tikrasis poveikis. Kiti žaidėjai dar nemato tavo sprendimo.</div><div class="choice-grid">${DEMO_CHOICES.map((item) => `<button class="choice-card" data-choice="${item.key}" aria-pressed="${choice === item.key}"><span class="choice-icon">${item.icon}</span><span><b>${esc(item.label)}</b><small>${esc(item.desc)}</small></span></button>`).join('')}</div><button class="btn" id="to-strategy" style="width:100%" ${choice ? '' : 'disabled'}>Tęsti į slaptą strategiją →</button></div></div>`;
  box.querySelectorAll('[data-choice]').forEach((button) => button.addEventListener('click', () => { choice = button.dataset.choice; drawEvent(); }));
  $('#to-strategy').addEventListener('click', () => { phase = 'strategy'; draw(); });
}
function allocationMarkup() {
  return `<div class="allocation-bar">${BUCKETS.map((bucket) => `<span style="width:${alloc[bucket.key]}%;background:${bucket.color}"></span>`).join('')}</div><div class="allocation-list">${BUCKETS.map((bucket) => `<label class="allocation-row"><span><b>${bucket.name}</b><small>${bucket.hint}</small></span><input type="range" min="0" max="100" step="5" value="${alloc[bucket.key]}" data-bucket="${bucket.key}"><output>${alloc[bucket.key]}% · ${eur(startingCapital * alloc[bucket.key] / 100)}</output></label>`).join('')}</div><p class="allocation-total ${total() === 100 ? 'pos' : 'neg'}" id="allocation-total">Iš viso: ${total()} % · ${eur(startingCapital)} ${total() === 100 ? '✓' : '· reikia tiksliai 100 %'}</p>`;
}
function drawStrategy() {
  const error = allocationError();
  box.innerHTML = `${header(2, 'Slapta strategija')}<div class="demo-grid"><div class="card demo-panel"><p class="eyebrow">KETVIRTADIENIS</p><h3>Paskirstyk visus €1,000</h3><p>Naudok slankiklius. Strategija lieka privati iki penktadienio atskleidimo.</p>${allocationMarkup()}<div class="private-note">🔒 Klasė nemato tavo pasirinkimo, kol neįvyksta penktadienio atskleidimas.</div><button class="btn" id="lock-demo" style="width:100%" ${error ? 'disabled' : ''}>🔒 Užrakinti strategiją</button><p class="note">Užrakinus pamatysi tik patvirtinimą. Rezultato ir kitų mokinių strategijų dar nematysi.</p></div><div class="city">${city()}</div></div>`;
  box.querySelectorAll('[data-bucket]').forEach((input) => input.addEventListener('input', () => { alloc[input.dataset.bucket] = Number(input.value); drawStrategy(); }));
  $('#lock-demo').addEventListener('click', () => { phase = 'locked'; draw(); });
}
function drawLocked() {
  box.innerHTML = `${header(2, 'Strategija užrakinta')}<div class="card locked-card"><div class="lock-icon">🔒</div><h3>Strategija užrakinta</h3><p>Tavo sprendimas ir paskirstymas saugiai paslėpti iki penktadienio.</p><div class="allocation-summary">${BUCKETS.map((bucket) => `<div><span>${bucket.name}</span><b>${eur(startingCapital * alloc[bucket.key] / 100)}</b><small>${alloc[bucket.key]}%</small></div>`).join('')}</div><div class="news">⏳ Ekonominiai įvykiai vyksta… Penktadienį pamatysi, kas nutiko.</div><button class="btn" id="reveal-demo" style="width:100%">Rodyti penktadienio rezultatą →</button></div>`;
  $('#reveal-demo').addEventListener('click', () => { phase = 'transition'; draw(); setTimeout(() => { reveal = buildDemoReveal(choice, alloc, startingCapital, weekNo); phase = 'reveal'; draw(); }, 700); });
}
function resultRow(row) {
  const isPlayer = row.name === 'Tu';
  return `<tr class="${isPlayer ? 'me' : ''}"><td><span class="rank">${row.rank}</span></td><td>${isPlayer ? '⭐ ' : ''}${esc(row.name)}</td><td class="${row.delta >= 0 ? 'pos' : 'neg'}">${eur(row.delta, true)}</td><td><b>${eur(row.score)}</b></td></tr>`;
}
function drawReveal() {
  const result = reveal.player;
  box.innerHTML = `${header(3, 'Penktadienio atskleidimas')}<div class="demo-grid"><div class="city">${city({ level: 1, savings: result.alloc.sav * 8, reserve: result.alloc.res * 8, business: result.alloc.bus * 8, invest: result.alloc.inv * 8, delta: result.delta })}</div><div class="card demo-panel"><p class="eyebrow">PENKTADIENIS · REZULTATAI</p><h3>Grynoji vertė: <span class="${result.delta >= 0 ? 'pos' : 'neg'}">${eur(result.netWorth)}</span></h3><div class="res"><div class="resrow"><span>Pradinis kapitalas</span><b>${eur(result.startingCapital)}</b></div><div class="resrow"><span>Galutinė grynoji vertė</span><b>${eur(result.netWorth)}</b></div><div class="resrow"><span>Pelnas arba nuostolis</span><b class="${result.delta >= 0 ? 'pos' : 'neg'}">${eur(result.delta, true)}</b></div><div class="resrow"><span>Netikėta išlaida</span><b>${eur(result.repairCost)}</b></div><div class="resrow"><span>Priverstinio pardavimo nuostolis</span><b class="${result.forcedSalePenalty ? 'neg' : 'pos'}">${eur(-result.forcedSalePenalty)}</b></div></div><p><b>Pamoka:</b> ${esc(result.lesson)}</p></div></div><div class="reveal-section"><h3>Klasės lyderių lentelė <small class="muted">(demonstraciniai žaidėjai)</small></h3><div class="table-scroll"><table><thead><tr><th>#</th><th>Žaidėjas</th><th>Pokytis</th><th>Strategijos taškai</th></tr></thead><tbody>${reveal.rows.map(resultRow).join('')}</tbody></table></div><div class="demo-awards">${reveal.awards.map((award) => `<div class="award"><small>${esc(award.title)}</small><b>${esc(award.name)}</b><span>${award.value}${award.unit === '€' ? ' €' : ' ' + esc(award.unit)}</span></div>`).join('')}</div><div class="row"><button class="btn" id="second-chance">🌱 Antra galimybė: palyginti sprendimą</button><button class="btn alt" id="replay-demo">Išbandyti kitą strategiją</button><button class="btn alt" id="next-week">Kita savaitė</button><a class="btn alt" href="#pilotas">Prašyti pilno klasės bandymo</a></div></div>`;
  $('#second-chance').addEventListener('click', () => { comparison = compareDemoChoice(choice, DEMO_CHOICES.find((item) => item.key !== choice).key, alloc); drawComparison(); });
  $('#replay-demo').addEventListener('click', () => { choice = null; reveal = null; comparison = null; phase = 'event'; draw(); });
  $('#next-week').addEventListener('click', () => { startingCapital = result.netWorth; weekNo += 1; choice = null; reveal = null; comparison = null; phase = 'event'; draw(); });
}
function drawComparison() {
  const alternative = DEMO_CHOICES.find((item) => item.key === comparison.alternative.choice);
  box.innerHTML = `${header(3, 'Antra galimybė')}<div class="card comparison-card"><p class="eyebrow">MOKYKIS IŠ ALTERNATYVOS</p><h3>Kas būtų, jeigu būtum pasirinkęs „${esc(alternative.label)}“?</h3><div class="compare-grid"><div><small>Tavo pirmas sprendimas</small><b>${eur(comparison.before.netWorth)}</b><span>${eur(comparison.before.delta, true)}</span></div><div class="compare-arrow">→</div><div><small>Alternatyvus sprendimas</small><b>${eur(comparison.alternative.netWorth)}</b><span class="${comparison.difference >= 0 ? 'pos' : 'neg'}">${eur(comparison.difference, true)} skirtumas</span></div></div><p><b>Kas pasikeitė:</b> ${esc(comparison.alternative.lesson)}</p><div class="news">💡 Antra galimybė nekeičia klasės rezultatų. Ji leidžia saugiai palyginti sprendimus ir suprasti pasekmes.</div><div class="row"><button class="btn" id="restart-demo">Žaisti dar kartą</button><a class="btn alt" href="#pilotas">Prašyti pilno bandymo</a></div></div>`;
  $('#restart-demo').addEventListener('click', reset);
}
function drawTransition() { box.innerHTML = `${header(3, 'Savaitė vyksta')}<div class="transition-card"><div class="spinner">↻</div><h3>Ekonominiai įvykiai vyksta…</h3><p>Kainos, rinkos ir tavo pasirinkimai keičia miesto finansus.</p></div>`; }
function draw() { if (phase === 'intro') drawIntro(); else if (phase === 'event') drawEvent(); else if (phase === 'strategy') drawStrategy(); else if (phase === 'locked') drawLocked(); else if (phase === 'transition') drawTransition(); else if (phase === 'reveal') drawReveal(); }
function reset() { phase = 'intro'; choice = null; alloc = { sav: 25, inv: 25, bus: 25, res: 25 }; reveal = null; comparison = null; startingCapital = DEMO_CAPITAL; weekNo = 1; draw(); }
reset();

$('#pf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('POST', '/api/pilot', { name: $('#pn').value, email: $('#pe').value, school: $('#ps').value, role: $('#pr').value, message: $('#pm').value, consent: $('#pc').checked });
    $('#pf').innerHTML = '<h3>Ačiū! Prašymas gautas ✓</h3><p>Susisieksime el. paštu dėl pilotinio bandymo.</p>';
  } catch (er) { $('#perr').textContent = er.message; }
});
