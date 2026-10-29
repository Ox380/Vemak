// landing.js — five-week anonymous playable demo; no login, no server writes.
import { DEMO_CHOICES, getDemoEvent, DEMO_CAPITAL, DEMO_WEEKS, nextDemoWeek, buildDemoReveal, findOptimalDemoStrategy, validateDemoAllocation } from './demo.js';
import { citySVG } from './iso.js';
import { esc, $, eur, api, lessonBlock } from './ui.js';

$('#heroCity').innerHTML = citySVG({ level: 2, savings: 420, reserve: 300, business: 640, invest: 520, mood: 'up' });
const box = $('#demoBox');
const BUCKETS = [
  { key: 'sav', name: 'Santaupos', color: '#3b82f6', hint: 'lėtai auga, maža rizika' },
  { key: 'inv', name: 'Investicijos', color: '#8b5cf6', hint: 'didesnė grąža, bet svyravimai' },
  { key: 'bus', name: 'Verslas', color: '#f5a524', hint: 'augina tavo mokyklos mugę' },
  { key: 'res', name: 'Avarinis rezervas', color: '#19b394', hint: 'apsaugo nuo netikėtumų' },
];
const BASE_ALLOCATION = { sav: 25, inv: 25, bus: 25, res: 25 };
let phase = 'intro';
let choice = null;
let alloc = { ...BASE_ALLOCATION, shares: Math.round(BASE_ALLOCATION.inv / 2 / 5) * 5, technology: BASE_ALLOCATION.inv - Math.round(BASE_ALLOCATION.inv / 2 / 5) * 5 };
let reveal = null;
let optimal = null;
let startingCapital = DEMO_CAPITAL;
let weekNo = 1;

function total() { return BASE_ALLOCATION.sav + BASE_ALLOCATION.inv + BASE_ALLOCATION.bus + BASE_ALLOCATION.res; }
function allocationError() { return validateDemoAllocation(alloc); }
function city(result = null) {
  const s = result || { level: 1, savings: 250, reserve: 250, business: 250, invest: 250, debt: 0 };
  return citySVG({ level: s.level || 1, savings: s.savings || 0, reserve: s.reserve || 0, business: s.business || 0, invest: s.invest || 0, mood: result?.delta < 0 ? 'down' : result ? 'up' : 'neutral', debt: 0 });
}
function header(step, label) {
  return `<div class="demo-head"><div><span class="pill amber">${step}/3 · Savaitė ${weekNo}/${DEMO_WEEKS} · ${label}</span></div><strong>Šios savaitės kapitalas: ${eur(startingCapital)}</strong></div>`;
}
function drawIntro() {
  box.innerHTML = `<div class="demo-intro"><div class="demo-intro-art">🏙️</div><div><span class="pill blue">VEMAK · finansinė strategija</span><h3>Sveikas atvykęs į VEMAK!</h3><p>Turi <b>1 000 virtualių eurų</b>. Tavo tikslas – per ${DEMO_WEEKS} savaites užauginti savo turtą, priimant protingus finansinius sprendimus.</p><ul><li>Pasirink kryptį pagal ekonominį įvykį.</li><li>Paskirstyk visus pinigus ir užrakink slaptą strategiją.</li><li>Penktadienį palygink rezultatą su klasės draugais.</li></ul><button class="btn" id="start-demo">Pradėti</button></div></div>`;
  $('#start-demo').addEventListener('click', () => { phase = 'event'; draw(); });
}
function drawEvent() {
  const event = getDemoEvent(weekNo);
  const forecast = event.outlook;
  const signalText = (value) => value === 'strong-positive' ? 'labai palankios naujienos' : value === 'positive' ? 'palankios naujienos' : value === 'strong-negative' ? 'labai nepalankios naujienos' : value === 'negative' ? 'nepalankios naujienos' : 'mišri arba neaiški kryptis';
  const signals = forecast.signals;
  box.innerHTML = `${header(1, 'Ekonominis įvykis')}<div class="demo-grid"><div class="city">${city()}</div><div class="card demo-panel"><p class="eyebrow">${weekNo === 1 ? 'PIRMADIENIS' : 'NAUJA SAVAITĖ'} · IŠŠŪKIS</p><h3>${esc(event.title)}</h3><p>${esc(event.body)}</p><div class="news"><b>Rinkos naujienų užuominos:</b> akcijų fondas – ${signalText(signals.shares)}; technologijų fondas – ${signalText(signals.technology)}; verslo paklausa – ${signalText(signals.business)}; santaupos – ${signalText(signals.savings)}. Tai tik situacijos ženklai, o ne garantuotas rezultatas.</div><div class="news">⚡ Penktadienį sužinosi, kaip šis įvykis paveikė rinką. Pats pasirenki, kur ir kiek investuoti.</div><div class="choice-grid">${DEMO_CHOICES.map((item) => `<button class="choice-card" data-choice="${item.key}" aria-pressed="${choice === item.key}"><span class="choice-icon">${item.icon}</span><span><b>${esc(item.label)}</b><small>${esc(item.desc)}</small></span></button>`).join('')}</div><button class="btn" id="to-strategy" style="width:100%" ${choice ? '' : 'disabled'}>Tęsti į slaptą strategiją →</button></div></div>`;
  box.querySelectorAll('[data-choice]').forEach((button) => button.addEventListener('click', () => { choice = button.dataset.choice; drawEvent(); }));
  $('#to-strategy').addEventListener('click', () => { phase = 'strategy'; draw(); });
}
function allocationMarkup() {
  const investmentSplit = `<div class="market-split"><p><b>Investicijų portfelis (${alloc.inv} % viso biudžeto)</b></p>${[['shares', 'Akcijų fondas', 'shares'], ['technology', 'Technologijų fondas', 'technology']].map(([key, name, type]) => { const signals = getDemoEvent(weekNo).outlook.signals; const signal = signals[type]; const signalText = signal === 'strong-positive' ? 'labai palankios naujienos' : signal === 'positive' ? 'palankios naujienos' : signal === 'strong-negative' ? 'labai nepalankios naujienos' : signal === 'negative' ? 'nepalankios naujienos' : 'neaiškios naujienos'; const amount = startingCapital * (alloc[key] || 0) / 100; return `<label class="allocation-row"><span><b>${name} · ${signalText}</b><small>Šiam fondui: ${eur(amount)} (${alloc.inv ? Math.round((alloc[key] || 0) * 100 / alloc.inv) : 0} % investicijų)</small></span><input type="range" min="0" max="${alloc.inv}" step="5" value="${alloc[key] || 0}" data-fund="${key}"><output>${alloc[key] || 0} % kapitalo</output></label>`; }).join('')}</div>`;
  return `<div class="allocation-bar">${BUCKETS.map((bucket) => `<span style="width:${alloc[bucket.key]}%;background:${bucket.color}"></span>`).join('')}</div><div class="allocation-list">${BUCKETS.map((bucket) => `<label class="allocation-row"><span><b>${bucket.name}</b><small>${bucket.hint}</small></span><input type="range" min="0" max="100" step="5" value="${alloc[bucket.key]}" data-bucket="${bucket.key}"><output>${alloc[bucket.key]}% · ${eur(startingCapital * alloc[bucket.key] / 100)}</output></label>`).join('')}</div>${investmentSplit}<p class="allocation-total ${total() === 100 ? 'pos' : 'neg'}" id="allocation-total">Iš viso: ${total()} % · ${eur(startingCapital)} ${total() === 100 ? '✓' : '· reikia tiksliai 100 %'}</p>`;
}
function drawStrategy() {
  const error = allocationError();
  box.innerHTML = `${header(2, 'Slapta strategija')}<div class="demo-grid"><div class="card demo-panel"><p class="eyebrow">KETVIRTADIENIS</p><h3>Paskirstyk visus ${eur(startingCapital)}</h3><p><b>Rinkos augimo arba nuosmukio prognozės keičiasi kas savaitę. Pasirink paskirstymą pagal šią situaciją – nė viena strategija negarantuoja pelno.</b></p>${allocationMarkup()}<div class="private-note">🔒 Klasė nemato tavo pasirinkimo, kol neįvyksta penktadienio atskleidimas.</div><button class="btn" id="lock-demo" style="width:100%" ${error ? 'disabled' : ''}>🔒 Užrakinti strategiją</button><p class="note">Užrakinus pamatysi tik patvirtinimą. Rezultato ir kitų mokinių strategijų dar nematysi.</p></div><div class="city">${city()}</div></div>`;
  box.querySelectorAll('[data-bucket]').forEach((input) => input.addEventListener('input', () => {
    const key = input.dataset.bucket;
    const previousInvestment = alloc.inv;
    alloc[key] = Number(input.value);
    if (key === 'inv') {
      if (alloc.inv === 0) {
        alloc.technology = 0;
        alloc.shares = 0;
      } else {
        alloc.technology = previousInvestment > 0 ? Math.floor((alloc.technology / previousInvestment) * alloc.inv / 5) * 5 : Math.floor(alloc.inv / 5 / 2) * 5;
        alloc.technology = Math.min(alloc.inv, alloc.technology);
        alloc.shares = alloc.inv - alloc.technology;
      }
    }
    drawStrategy();
  }));
  box.querySelectorAll('[data-fund]').forEach((input) => input.addEventListener('input', () => {
    const key = input.dataset.fund;
    const other = key === 'shares' ? 'technology' : 'shares';
  const roundToFive = (value) => Math.round(value / 5) * 5;
  const roundDownToFive = (value) => Math.floor(value / 5) * 5;
  const available = alloc.inv;
  if (available < 5) {
    alloc.shares = 0;
    alloc.technology = 0;
  } else {
    alloc[key] = Math.min(available, roundToFive(Number(input.value)));
    alloc[other] = available - alloc[key];
    if (alloc[other] < 0) {
      alloc[key] = available;
      alloc[other] = 0;
    }
  }
    if (alloc[other] > 0 && alloc[other] % 5 !== 0) {
      alloc[key] = roundDownToFive(alloc[key]);
      alloc[other] = available - alloc[key];
    }
    drawStrategy();
  }));
  $('#lock-demo').addEventListener('click', () => { phase = 'locked'; draw(); });
}
function drawLocked() {
  box.innerHTML = `${header(2, 'Strategija užrakinta')}<div class="card locked-card"><div class="lock-icon">🔒</div><h3>Strategija užrakinta</h3><p>Tavo sprendimas ir paskirstymas saugiai paslėpti iki penktadienio.</p><div class="allocation-summary">${BUCKETS.map((bucket) => `<div><span>${bucket.name}</span><b>${eur(startingCapital * alloc[bucket.key] / 100)}</b><small>${alloc[bucket.key]}%</small></div>`).join('')}</div><div class="news">⏳ Ekonominiai įvykiai vyksta… Penktadienį pamatysi, kas nutiko.</div><button class="btn" id="reveal-demo" style="width:100%">Rodyti penktadienio rezultatą →</button></div>`;
  $('#reveal-demo').addEventListener('click', () => { phase = 'transition'; draw(); setTimeout(() => { reveal = buildDemoReveal(choice, alloc, startingCapital, weekNo); phase = 'reveal'; draw(); }, 700); });
}
function resultRow(row) {
  const isPlayer = row.name === 'Tu';
  const change = row.weekDelta;
  return `<tr class="${isPlayer ? 'me' : ''}"><td><span class="rank">${row.rank}</span></td><td>${isPlayer ? '⭐ ' : ''}${esc(row.name)}</td><td class="${change >= 0 ? 'pos' : 'neg'}" aria-label="Savaitės pelnas arba nuostolis">${eur(change, true)}</td><td><b>${eur(row.netWorth)}</b><small class="muted" aria-hidden="true"> grynoji vertė</small></td><td><b>${eur(row.score)}</b><small class="muted" aria-hidden="true"> taškų</small></td></tr>`;
}
function drawReveal() {
  const result = reveal.player;
  const marketEvent = getDemoEvent(weekNo);
  const signals = marketEvent.outlook.signals;
  const signalText = (value) => value === 'strong-positive' ? 'labai palankios naujienos' : value === 'positive' ? 'palankios naujienos' : value === 'strong-negative' ? 'labai nepalankios naujienos' : value === 'negative' ? 'nepalankios naujienos' : 'mišrios arba neaiškios naujienos';
  box.innerHTML = `${header(3, 'Penktadienio atskleidimas')}<div class="demo-grid"><div class="city">${city({ level: 1, savings: result.alloc.sav * 8, reserve: result.alloc.res * 8, business: result.alloc.bus * 8, invest: result.alloc.inv * 8, delta: result.delta })}</div><div class="card demo-panel"><p class="eyebrow">PENKTADIENIS · REZULTATAI</p><h3>Grynoji vertė: <span class="${result.weekDelta >= 0 ? 'pos' : 'neg'}">${eur(result.netWorth)}</span></h3><div class="news market-outlook-reveal"><b>Rinkos prognozė:</b> akcijų fondas – ${signalText(signals.shares)}; technologijų fondas – ${signalText(signals.technology)}; verslo paklausa – ${signalText(signals.business)}; santaupos – ${signalText(signals.savings)}. Tai buvo scenarijaus užuominos, ne garantija.</div><div class="res"><div class="resrow"><span>Pradinis šios savaitės kapitalas</span><b>${eur(result.startingCapital)}</b></div><div class="resrow"><span>Galutinė grynoji vertė</span><b>${eur(result.netWorth)}</b></div><div class="resrow"><span>Šios savaitės pelnas arba nuostolis</span><b class="${result.weekDelta >= 0 ? 'pos' : 'neg'}">${eur(result.weekDelta, true)}</b></div><div class="resrow"><span>Pelnas arba nuostolis per 5 savaites</span><b class="${result.totalDelta >= 0 ? 'pos' : 'neg'}">${eur(result.totalDelta, true)}</b></div>${result.earned ? `<div class="resrow"><span>Papildomos pajamos</span><b class="pos">${eur(result.earned, true)}</b></div>` : ''}${result.assetSale ? `<div class="resrow"><span>Turto pardavimas (ne pajamos)</span><b class="pos">${eur(result.assetSale, true)}</b></div>` : ''}${result.courseCost ? `<div class="resrow"><span>Investicija į įgūdžius</span><b class="neg">${eur(-result.courseCost)}</b></div>` : ''}<div class="resrow"><span>Netikėta išlaida</span><b>${eur(result.repairCost)}</b></div><div class="resrow"><span>Priverstinio pardavimo nuostolis</span><b class="${result.forcedSalePenalty ? 'neg' : 'pos'}">${eur(-result.forcedSalePenalty)}</b></div></div>${lessonBlock(result.lesson, result.steps)}</div></div><div class="reveal-section"><h3>Klasės lyderių lentelė <small class="muted">(demonstraciniai žaidėjai)</small></h3><div class="table-scroll"><table><thead><tr><th>#</th><th>Žaidėjas</th><th>Pokytis</th><th>Grynoji vertė</th><th>Strategijos taškai</th></tr></thead><tbody>${reveal.rows.map(resultRow).join('')}</tbody></table></div><div class="demo-awards">${reveal.awards.map((award) => `<div class="award"><small>${esc(award.title)}</small><b>${esc(award.name)}</b><span>${award.value}${award.unit === '€' ? ' €' : ' ' + esc(award.unit)}</span></div>`).join('')}</div><details class="score-explainer"><summary>Kaip skaičiuojami strategijos taškai?</summary><p>Strategijos taškai vertina finansinio sprendimo rezultatą eurais, bet patys nėra pinigai ir prie tavo balanso nepridedami. Skaičiuojant atsižvelgiama į šios savaitės pelną arba nuostolį, riziką ir priverstinio turto pardavimo nuostolį. Jei didžiausia tavo paskirstymo dalis viršija 40 %, už kiekvieną papildomą procentinį punktą atimama 1,5 taško; priverstinio pardavimo nuostolis taip pat mažina taškus. Klasės lyderių lentelėje daugiau taškų reiškia geresnį pagal riziką įvertintą rezultatą.</p></details><div class="row"><button class="btn" id="optimal-strategy">Rodyti optimalios strategijos rezultatą</button>${weekNo < DEMO_WEEKS ? '<button class="btn alt" id="next-week">Tęsti su dabartiniu balansu →</button>' : '<strong class="demo-complete">🎉 Demo baigta: sužaidei visas 5 savaites.</strong>'}<a class="btn alt" href="#pilotas">Prašyti pilno klasės bandymo</a></div></div>`;
  $('#optimal-strategy').addEventListener('click', () => { optimal = findOptimalDemoStrategy(startingCapital, weekNo); drawOptimal(); });
  $('#replay-demo')?.addEventListener('click', () => reset());
  $('#next-week')?.addEventListener('click', () => { const next = nextDemoWeek(weekNo, result.netWorth); if (!next) return; startingCapital = next.startingCapital; weekNo = next.week; alloc = { ...BASE_ALLOCATION, shares: Math.round(BASE_ALLOCATION.inv / 2 / 5) * 5, technology: BASE_ALLOCATION.inv - Math.round(BASE_ALLOCATION.inv / 2 / 5) * 5 }; choice = null; reveal = null; optimal = null; phase = 'event'; draw(); });
}
function drawOptimal() {
  const result = optimal;
  if (!result) {
    box.innerHTML = `${header(3, 'Optimalios strategijos skaičiavimas')}<div class="card comparison-card"><h3>Geriausias rezultatas šiuo metu neapskaičiuotas</h3><p>Palik atsargą arba pasirink savo paskirstymą. Prognozė negarantuoja būsimos grąžos.</p><button class="btn alt" id="back-to-reveal">Grįžti prie savaitės rezultatų</button></div>`;
    $('#back-to-reveal').addEventListener('click', () => drawReveal());
    return;
  }
  const shares = result.alloc.shares ?? 0;
  const technology = result.alloc.technology ?? 0;
  const bestAssets = BUCKETS.map((bucket) => `${bucket.name}: ${result.alloc[bucket.key]} % (${eur(result.startingCapital * result.alloc[bucket.key] / 100)})`).join(' · ');
  const split = result.alloc.inv > 0 ? `Investicijų dalis: akcijų fondas ${Math.round(shares * 100 / result.alloc.inv)} % (${eur(result.startingCapital * shares / 100)}), technologijų fondas ${Math.round(technology * 100 / result.alloc.inv)} % (${eur(result.startingCapital * technology / 100)}).` : 'Investicijoms neskirta lėšų.';
  const allocation = `${bestAssets}. ${split}`;
  const event = getDemoEvent(weekNo);
  const signals = event.outlook.signals;
  const candidates = DEMO_CHOICES.filter((item) => item.key === 'protect' || (item.key === 'invest' && (signals.shares === 'positive' || signals.shares === 'strong-positive' || signals.technology === 'positive' || signals.technology === 'strong-positive')) || (item.key === 'business' && (signals.business === 'positive' || signals.business === 'strong-positive')) || (item.key === 'save' && (signals.savings === 'positive' || signals.savings === 'strong-positive')));
  const combinationHint = `Patikrinta ${result.combinationsChecked.toLocaleString('lt-LT')} teisėtų variantų; įtraukti ${candidates.length} situacijai tinkami sprendimai.`;
  const strategyTitle = DEMO_CHOICES.find((item) => item.key === result.choice)?.label || result.choiceLabel;
  box.innerHTML = `${header(3, 'Optimalios strategijos skaičiavimas')}<div class="card comparison-card"><p class="eyebrow">SKAIČIAVIMAS PAGAL ŠIOS SAVAITĖS ĮVYKĮ</p><h3>Geriausias modelio rastas rezultatas: ${eur(result.netWorth)}</h3><p>Šią savaitę, pasirinkus „${esc(strategyTitle)}“ ir žemiau parodytą paskirstymą, modelis būtų apskaičiavęs <b class="${result.weekDelta >= 0 ? 'pos' : 'neg'}">${eur(result.weekDelta, true)}</b> pokytį.</p><div class="res"><div class="resrow"><span>Pradinis šios savaitės kapitalas</span><b>${eur(result.startingCapital)}</b></div><div class="resrow"><span>Galutinė grynoji vertė</span><b>${eur(result.netWorth)}</b></div><div class="resrow"><span>Geriausia rasta strategija</span><b>${esc(strategyTitle)}</b></div><div class="resrow"><span>Paskirstymas</span><b>${allocation}</b></div><div class="resrow"><span>Paieškos apimtis</span><b>${combinationHint}</b></div></div><p class="news">Tai retrospektyvus skaičiavimas: naudojami jau žinomi šios savaitės įvykiai ir tos pačios žaidimo taisyklės. Tai nėra garantuotas ar iš anksto žinomas būsimas pelnas. Skaičiuojamas tik šios savaitės geriausias variantas, o ne garantija visoms likusioms savaitėms.</p><div class="row"><button class="btn alt" id="back-to-reveal">Grįžti prie savaitės rezultatų</button></div></div>`;
  $('#back-to-reveal').addEventListener('click', () => drawReveal());
}
function drawTransition() { box.innerHTML = `${header(3, 'Savaitė vyksta')}<div class="transition-card"><div class="spinner">↻</div><h3>Ekonominiai įvykiai vyksta…</h3><p>Kainos, rinkos ir tavo pasirinkimai keičia miesto finansus.</p></div>`; }
function draw() { if (phase === 'intro') drawIntro(); else if (phase === 'event') drawEvent(); else if (phase === 'strategy') drawStrategy(); else if (phase === 'locked') drawLocked(); else if (phase === 'transition') drawTransition(); else if (phase === 'reveal') drawReveal(); }
function reset() { phase = 'intro'; choice = null; alloc = { ...BASE_ALLOCATION, shares: 15, technology: 10 }; reveal = null; optimal = null; startingCapital = DEMO_CAPITAL; weekNo = 1; draw(); }
reset();

$('#pf').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('POST', '/api/pilot', { name: $('#pn').value, email: $('#pe').value, school: $('#ps').value, role: $('#pr').value, message: $('#pm').value, consent: $('#pc').checked });
    $('#pf').innerHTML = '<h3>Ačiū! Prašymas gautas ✓</h3><p>Susisieksime el. paštu dėl pilotinio bandymo.</p>';
  } catch (er) { $('#perr').textContent = er.message; }
});
