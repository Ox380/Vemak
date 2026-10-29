import { wireThemeToggle, themeFromURL } from './theme.js';
// landing.js — anonymous one-week playable demo; no login, no server writes.
import { DEMO_CAPITAL, DEMO_CHOICES, DEMO_EVENT, DEMO_FLOW, DEMO_MARKET_ASSETS, createDemoSession, getDemoMarketStory, getDemoMarketWinner, scoreDemoMarketGuess, getDemoStepChoices, buildDemoReveal, compareDemoChoice, simulateDemoStep, validateDemoAllocation, getDemoGamification } from './demo.js';
import { citySVG } from './iso.js';
import { esc, $, eur, api, lessonBlock } from './ui.js';

$('#heroCity').innerHTML = citySVG({ level: 2, savings: 420, reserve: 300, business: 640, invest: 520, mood: 'up' });
const box = $('#demoBox');
const BUCKETS = [
  { key: 'sav', name: 'Santaupos', color: 'var(--b-sav)', hint: 'lėtai auga, maža rizika' },
  { key: 'inv', name: 'Investicijos', color: 'var(--b-inv)', hint: 'didesnė grąža, bet svyravimai' },
  { key: 'bus', name: 'Verslas', color: 'var(--b-bus)', hint: 'augina tavo mokyklos mugę' },
  { key: 'res', name: 'Avarinis rezervas', color: 'var(--b-res)', hint: 'apsaugo nuo netikėtumų' },
];
let phase = 'intro';
let choice = null;
let prediction = null;
let alloc = { sav: 25, inv: 25, bus: 25, res: 25 };
let reveal = null;
let comparison = null;
let startingCapital = DEMO_CAPITAL;
let weekNo = 1;
let stepIndex = 0;
let stepCapital = DEMO_CAPITAL;
let stepHistory = [];
let demoSession = null;
let audience = 'school';   // 'school' | 'individual'
let viewedExplanation = false;

function total() { return Object.values(alloc).reduce((sum, value) => sum + value, 0); }
function gamificationMarkup(g) {
  const next = g.level * 200;
  const progress = Math.min(100, Math.round((g.xp % 200) / 2));
  return `<section class="game-loop" aria-label="Žaidimo progresas"><div class="game-loop-top"><div><span class="pill amber">⭐ 1 lygis → ${g.level} lygis</span><h4><span class="collection-gem" aria-hidden="true"><i></i><em></em></span>Miesto kolekcija</h4></div><b>${g.xp} XP</b></div><div class="xp-track"><span style="width:${progress}%"></span></div><div class="game-loop-meta"><span>🔥 ${g.streak} savaitės serija</span><span>Misija: ${g.mission.progress}/${g.mission.target} sprendimų ${g.mission.done ? '✓' : ''}</span><span>Kitas lygis: ${next} XP</span></div><div class="model-collection"><div><b>${g.unlocks.includes('tree') ? 'Atrakinta: miesto medis' : 'Artėjantis atrakinimas: miesto medis'}</b><small>Nemokamas 3D modelis iš Google Model Viewer pavyzdžių.</small></div><model-viewer class="tiny-model" src="https://modelviewer.dev/shared-assets/models/Astronaut.glb" camera-controls auto-rotate disable-zoom alt="3D kolekcijos astronautas"></model-viewer></div></section>`;
}
function allocationError() { return validateDemoAllocation(alloc); }
function city(result = null) {
  const s = result || { level: 1, savings: 250, reserve: 250, business: 250, invest: 250, debt: 0 };
  return citySVG({ level: s.level || 1, savings: s.savings || 0, reserve: s.reserve || 0, business: s.business || 0, invest: s.invest || 0, mood: result?.delta < 0 ? 'down' : result ? 'up' : 'neutral', debt: 0 });
}
function header(step, label) {
  return `<div class="demo-head"><div><span class="pill amber">${step}/10 · ${label}</span></div><strong>Šios savaitės kapitalas: ${eur(stepCapital)}</strong></div>`;
}
function oldHeader(step, label) {
  return `<div class="demo-head"><div><span class="pill amber">${step}/3 · ${label}</span></div><strong>Ekonomikos žaidimas · senoji strategija</strong></div>`;
}

function drawIntro() {
  box.innerHTML = `<div class="demo-intro"><div class="demo-intro-art" aria-label="Pinigų ir turto augimo iliustracija" role="img"><div class="money-art"><span class="money-arrow">↗</span><div class="bill bill-back">€</div><div class="bill bill-front">€</div><div class="coin coin-one">€</div><div class="coin coin-two">€</div></div></div><div><span class="pill blue">VEMAK · finansinė strategija</span><h3>Sveikas atvykęs į VEMAK!</h3><p>Turi <b>1 000 virtualių eurų</b>. Pirmiausia pereisi senąją 3 žingsnių pradžią, tada priimsi 10 papildomų sprendimų, o pabaigoje gausi analitiką.</p><ul><li>1/3: pasirink ekonominę kryptį.</li><li>2/3: paskirstyk pinigus.</li><li>3/3: užrakink strategiją.</li></ul><button class="btn" id="start-demo">Pradėti</button></div></div>`;
  $('#start-demo').addEventListener('click', () => { demoSession = createDemoSession(Date.now()); phase = 'legacy-event'; draw(); });
}
function drawLegacyEvent() {
  const story = getDemoMarketStory(demoSession.marketWeek);
  const candidates = DEMO_MARKET_ASSETS.map((asset) => `<button class="market-guess${prediction === asset.key ? ' selected' : ''}" type="button" data-market-guess="${asset.key}" aria-pressed="${prediction === asset.key}"><b>${esc(asset.label)}</b><small>${asset.key === 'business' ? 'vietos mugės įmonės' : asset.key === 'technology' ? 'technologijų bendrovės' : asset.key === 'shares' ? 'įvairių įmonių akcijos' : 'saugiau laikomi pinigai'}</small></button>`).join('');
  box.innerHTML = `${oldHeader(1, 'Rinkos naujiena')}<div class="demo-grid"><div class="city">${city()}</div><div class="card demo-panel"><div class="market-news"><span class="pill blue">Šios savaitės naujiena · ${demoSession.marketWeek}/5</span><h3>${esc(story.title)}</h3><p>${esc(story.body)}</p><small>Užuominos yra informacija, ne garantija — netikėti įvykiai gali pakeisti rinkos kryptį.</small></div><section class="market-prediction" aria-labelledby="market-prompt"><h4 id="market-prompt">Kuri sritis, tavo manymu, pasirodys geriausiai?</h4><p>Pasirink spėjimą prieš žiūrėdamas į savo strategiją. Teisingas spėjimas vertas 25 strategijos taškų, ne eurų.</p><div class="market-guess-grid">${candidates}</div><button class="btn" id="continue-market" ${prediction ? '' : 'disabled'}>Tęsti ekonominius sprendimus →</button></section></div></div>`;
  box.querySelectorAll('[data-market-guess]').forEach((button) => button.addEventListener('click', () => { prediction = button.dataset.marketGuess; drawLegacyEvent(); }));
  $('#continue-market').addEventListener('click', () => { if (!prediction) return; phase = 'legacy-event-choice'; draw(); });
}
function drawLegacyEventChoice() {
  box.innerHTML = `${oldHeader(1, 'Ekonominis įvykis')}<div class="demo-grid"><div class="city">${city()}</div><div class="card demo-panel"><h3>${esc(DEMO_EVENT.title)}</h3><p>${esc(DEMO_EVENT.body)}</p><div class="choice-grid">${demoSession.legacyChoices.map((item) => `<button class="choice-card" data-legacy-choice="${item.key}"><span class="choice-icon">${item.icon}</span><span><b>${esc(item.label)}</b><small>${esc(item.desc)}</small></span></button>`).join('')}</div></div></div>`;
  box.querySelectorAll('[data-legacy-choice]').forEach((button) => button.addEventListener('click', () => { choice = button.dataset.legacyChoice; phase = 'legacy-strategy'; draw(); }));
}
function drawEvent() {
  const step = demoSession.steps[stepIndex];
  box.innerHTML = `${header(stepIndex + 1, 'Ekonominis įvykis')}<div class="demo-grid"><div class="city">${city()}</div><div class="card demo-panel"><h3>${esc(step.prompt)}</h3><p>Pasirink vieną veiksmą. Pasekmė bus įtraukta į tavo balansą ir paaiškinta iškart.</p><div class="choice-grid">${step.choices.map((item) => `<button class="choice-card" data-step-choice="${item.key}"><span class="choice-icon">${item.legacyKey ? IC.back : item.delta >= 0 ? IC.up : IC.warn}</span><span><b>${esc(item.label)}</b><small>${esc(item.lesson)}</small></span></button>`).join('')}</div><p class="note">Po 10/10 pereisi į senosios strategijos rezultatų analizę.</p></div></div>`;
  box.querySelectorAll('[data-step-choice]').forEach((button) => button.addEventListener('click', () => {
    const result = simulateDemoStep(stepIndex, button.dataset.stepChoice, stepCapital, demoSession);
    stepCapital = result.nextCapital; stepHistory.push(result); stepIndex += 1;
    if (result.complete) { phase = 'analytics'; draw(); } else draw();
  }));
}
function drawAnalytics() {
  viewedExplanation = true;
  const gamification = getDemoGamification({ week: weekNo, predictionCorrect: false, decisions: stepHistory.length, explanationViewed: viewedExplanation, netWorth: stepCapital, startingCapital });
  box.innerHTML = `${oldHeader(3, 'Analitika')}<div class="card demo-panel"><h3>Visų sprendimų rezultatai</h3>${gamificationMarkup(gamification)}<div class="res"><div class="resrow"><span>Pradinis kapitalas</span><b>${eur(DEMO_CAPITAL)}</b></div><div class="resrow"><span>Po 10 ekonominių sprendimų</span><b>${eur(stepCapital)}</b></div><div class="resrow"><span>Ekonominių sprendimų pokytis</span><b class="${stepCapital >= DEMO_CAPITAL ? 'pos' : 'neg'}">${eur(stepCapital - DEMO_CAPITAL, true)}</b></div><div class="resrow"><span>Priimti sprendimai</span><b>${stepHistory.length}</b></div></div>${lessonBlock('Analitika paaiškina, kaip senoji strategija ir papildomi sprendimai kartu pakeitė tavo finansinę situaciją.', stepHistory.map((item) => ({ text: `${item.step}/10 · ${item.title}: ${item.choice}`, amount: item.delta, comment: item.choices?.find((choice) => choice.key === item.choice)?.lesson || 'Šis pasirinkimas pakeitė tavo balansą pagal nurodytą sumą.' })))}<div class="row"><button class="btn" id="restart-steps">Žaisti dar kartą</button><a class="btn alt" href="#pilotas">Prašyti pilno bandymo</a></div></div>`;
  $('#restart-steps').addEventListener('click', reset);
}
function drawStepFinish() {
  const gained = stepCapital - DEMO_CAPITAL;
  box.innerHTML = `${header(10, 'Ekonominio iššūkio pabaiga')}<div class="card demo-panel"><h3>Puikiai — užbaigei visus 10 sprendimų</h3><div class="res"><div class="resrow"><span>Pradinis balansas</span><b>${eur(DEMO_CAPITAL)}</b></div><div class="resrow"><span>Galutinis balansas</span><b>${eur(stepCapital)}</b></div><div class="resrow"><span>Pokytis</span><b class="${gained >= 0 ? 'pos' : 'neg'}">${eur(gained, true)}</b></div><div class="resrow"><span>Priimti sprendimai</span><b>${stepHistory.length}</b></div></div><div class="lesson"><div class="lesson-head"><span class="lesson-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.2 17.4h5.6M10.2 20.4h3.6"/><path d="M12 3.6a5.6 5.6 0 0 0-3.3 10.1c.5.4.8 1 .8 1.6v.5h5v-.5c0-.6.3-1.2.8-1.6A5.6 5.6 0 0 0 12 3.6z"/></svg></span><div><b>Ko išmokai</b><p class="muted">Poreikiai, rezervas, biudžetas, uždarbis ir ilgalaikiai tikslai yra susiję. Geras sprendimas ne visada reiškia didžiausią pelną šiandien — svarbu ir rizika, ir tavo tikslas.</p></div></div></div><div class="row"><button class="btn" id="continue-old-game">Tęsti senąją strategiją →</button><button class="btn alt" id="restart-steps">Žaisti nuo pradžių</button><a class="btn alt" href="#pilotas">Prašyti pilno bandymo</a></div></div>`;
  $('#continue-old-game').addEventListener('click', () => { startingCapital = stepCapital; if (!choice) choice = 'business'; phase = 'strategy'; draw(); });
  $('#restart-steps').addEventListener('click', reset);
}

function allocationMarkup() {
  return `<div class="allocation-bar">${BUCKETS.map((bucket) => `<span style="width:${alloc[bucket.key]}%;background:${bucket.color}"></span>`).join('')}</div><div class="allocation-list">${BUCKETS.map((bucket) => `<label class="allocation-row"><span><b>${bucket.name}</b><small>${bucket.hint}</small></span><input type="range" min="0" max="100" step="5" value="${alloc[bucket.key]}" data-bucket="${bucket.key}"><output>${alloc[bucket.key]}% · ${eur(startingCapital * alloc[bucket.key] / 100)}</output></label>`).join('')}</div><p class="allocation-total ${total() === 100 ? 'pos' : 'neg'}" id="allocation-total">Iš viso: ${total()} % · ${eur(startingCapital)} ${total() === 100 ? '' : '· reikia tiksliai 100 %'}</p>`;
}
function drawStrategy() {
  const error = allocationError();
  box.innerHTML = `${oldHeader(2, 'Strategija')}<div class="demo-grid"><div class="card demo-panel"><h3>Paskirstyk visus €1,000</h3><p>Naudok slankiklius. Strategija lieka privati iki penktadienio atskleidimo.</p>${allocationMarkup()}<div class="private-note">${audText('Klasė nemato tavo pasirinkimo, kol neįvyksta penktadienio atskleidimas.', 'Tavo pasirinkimas lieka paslėptas iki penktadienio atskleidimo.')}</div><button class="btn" id="lock-demo" style="width:100%" ${error ? 'disabled' : ''}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="10.6" width="14" height="9.4" rx="2.2"/><path d="M8.6 10.6V7.9a3.4 3.4 0 0 1 6.8 0v2.7"/></svg> Užrakinti strategiją</button><p class="note">Užrakinus pamatysi tik patvirtinimą. Rezultato ir kitų mokinių strategijų dar nematysi.</p></div><div class="city">${city()}</div></div>`;
  box.querySelectorAll('[data-bucket]').forEach((input) => input.addEventListener('input', () => { alloc[input.dataset.bucket] = Number(input.value); drawStrategy(); }));
  $('#lock-demo').addEventListener('click', () => { phase = 'locked'; draw(); });
}
function drawLocked() {
  box.innerHTML = `${oldHeader(3, 'Strategija užrakinta')}<div class="card locked-card"><div class="lock-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="10.6" width="14" height="9.4" rx="2.2"/><path d="M8.6 10.6V7.9a3.4 3.4 0 0 1 6.8 0v2.7"/></svg></div><h3>Strategija užrakinta</h3><p>Tavo sprendimas ir paskirstymas saugiai paslėpti. Dabar prasideda 10 papildomų ekonominių sprendimų.</p><div class="allocation-summary">${BUCKETS.map((bucket) => `<div><span>${bucket.name}</span><b>${eur(startingCapital * alloc[bucket.key] / 100)}</b><small>${alloc[bucket.key]}%</small></div>`).join('')}</div><div class="news">⏳ Senoji 3 žingsnių pradžia baigta. Toliau laukia išplėstas ekonomikos žaidimas.</div><button class="btn" id="reveal-demo" style="width:100%">Pradėti 10 ekonominių sprendimų →</button></div>`;
  $('#reveal-demo').addEventListener('click', () => { phase = 'event'; if (!demoSession) demoSession = createDemoSession(Date.now()); stepIndex = 0; stepCapital = startingCapital; stepHistory = []; draw(); });
}
function resultRow(row) {
  const isPlayer = row.name === 'Tu';
  return `<tr class="${isPlayer ? 'me' : ''}"><td><span class="rank">${row.rank}</span></td><td>${isPlayer ? ' ' : ''}${esc(row.name)}</td><td class="${row.delta >= 0 ? 'pos' : 'neg'}">${eur(row.delta, true)}</td><td><b>${eur(row.score)}</b></td></tr>`;
}
function drawReveal() {
  const marketWeek = demoSession.marketWeek;
  const reveal = buildDemoReveal(choice, alloc, startingCapital, marketWeek);
  const marketResult = scoreDemoMarketGuess(marketWeek, prediction);
  if (marketResult.bonus) {
    const playerRow = reveal.rows.find((row) => row.name === 'Tu');
    if (playerRow) playerRow.score += marketResult.bonus;
    reveal.rows.sort((a, b) => b.score - a.score).forEach((row, index) => { row.rank = index + 1; });
    reveal.awards[0].name = reveal.rows[0].name;
    reveal.awards[0].value = reveal.rows[0].score;
  }
  const story = getDemoMarketStory(marketWeek);
  const labels = Object.fromEntries(DEMO_MARKET_ASSETS.map((asset) => [asset.key, asset.label]));
  const predictionCard = `<div class="market-reveal ${marketResult.correct ? 'hit' : 'miss'}"><b>${marketResult.correct ? 'Puikus spėjimas! +25 strategijos taškai' : 'Rinka nustebino!'}</b><p>Tavo spėjimas: ${esc(labels[prediction] || 'nepasirinktas')} · Tikrasis lyderis: ${esc(marketResult.winnerLabel)}</p><small>${esc(story.outcome)}</small></div>`;
  const result = reveal.player;
  viewedExplanation = true;
  const gamification = getDemoGamification({ week: weekNo, predictionCorrect: marketResult.correct, decisions: stepHistory.length, explanationViewed: viewedExplanation, netWorth: result.netWorth, startingCapital });
  box.innerHTML = `${oldHeader(3, 'Analitika')}<div class="demo-grid"><div class="city">${city({ level: 1, savings: result.alloc.sav * 8, reserve: result.alloc.res * 8, business: result.alloc.bus * 8, invest: result.alloc.inv * 8, delta: result.delta })}</div><div class="card demo-panel"><h3>Grynoji vertė: <span class="${result.delta >= 0 ? 'pos' : 'neg'}">${eur(result.netWorth)}</span></h3>${predictionCard}${gamificationMarkup(gamification)}<div class="res"><div class="resrow"><span>Pradinis kapitalas</span><b>${eur(result.startingCapital)}</b></div><div class="resrow"><span>Galutinė grynoji vertė</span><b>${eur(result.netWorth)}</b></div><div class="resrow"><span>Pelnas arba nuostolis</span><b>${eur(result.delta, true)}</b></div><div class="resrow"><span>Spėjimo taškai</span><b>${marketResult.bonus}</b></div>${result.earned ? `<div class="resrow"><span>Papildomos pajamos</span><b class="pos">${eur(result.earned, true)}</b></div>` : ''}${result.assetSale ? `<div class="resrow"><span>Turto pardavimas (ne pajamos)</span><b class="pos">${eur(result.assetSale, true)}</b></div>` : ''}${result.courseCost ? `<div class="resrow"><span>Investicija į įgūdžius</span><b class="neg">${eur(-result.courseCost)}</b></div>` : ''}<div class="resrow"><span>Netikėta išlaida</span><b>${eur(result.repairCost)}</b></div><div class="resrow"><span>Priverstinio pardavimo nuostolis</span><b class="${result.forcedSalePenalty ? 'neg' : 'pos'}">${eur(-result.forcedSalePenalty)}</b></div></div>${lessonBlock(result.lesson, result.steps)}</div></div><div class="reveal-section">${audText('<h3>Klasės lyderių lentelė <small class="muted">(demonstraciniai žaidėjai)</small></h3>', '<h3>Lyderių lentelė <small class="muted">(demonstraciniai žaidėjai)</small></h3>')}<div class="table-scroll"><table><thead><tr><th>#</th><th>Žaidėjas</th><th>Pokytis</th><th>Strategijos taškai</th></tr></thead><tbody>${reveal.rows.map(resultRow).join('')}</tbody></table></div><div class="demo-awards">${reveal.awards.map((award) => `<div class="award"><small>${esc(award.title)}</small><b>${esc(award.name)}</b><span>${award.value}${award.unit === '€' ? ' €' : ' ' + esc(award.unit)}</span></div>`).join('')}</div><div class="row"><button class="btn" id="second-chance">Antra galimybė: palyginti sprendimą</button><button class="btn alt" id="replay-demo">Išbandyti kitą strategiją</button><button class="btn alt" id="next-week" ${weekNo >= 5 ? 'disabled' : ''}>Kita savaitė</button><a class="btn alt" href="#pilotas">Prašyti pilno klasės bandymo</a></div></div>`;
  $('#second-chance').addEventListener('click', () => { comparison = compareDemoChoice(choice, DEMO_CHOICES.find((item) => item.key !== choice).key, alloc, startingCapital, marketWeek); drawComparison(); });
  $('#replay-demo').addEventListener('click', () => { choice = null; prediction = null; phase = 'legacy-event'; draw(); });
  $('#next-week')?.addEventListener('click', () => { if (weekNo >= 5) return; startingCapital = result.netWorth; weekNo += 1; demoSession.marketWeek = (demoSession.marketWeek % 5) + 1; choice = null; prediction = null; phase = 'legacy-event'; draw(); });
}
function drawComparison() {
  const alternative = DEMO_CHOICES.find((item) => item.key === comparison.alternative.choice);
  box.innerHTML = `${header(3, 'Antra galimybė')}<div class="card comparison-card"><h3>Kas būtų, jeigu būtum pasirinkęs „${esc(alternative.label)}“?</h3><div class="compare-grid"><div><small>Tavo pirmas sprendimas</small><b>${eur(comparison.before.netWorth)}</b><span>${eur(comparison.before.delta, true)}</span></div><div class="compare-arrow">→</div><div><small>Alternatyvus sprendimas</small><b>${eur(comparison.alternative.netWorth)}</b><span class="${comparison.difference >= 0 ? 'pos' : 'neg'}">${eur(comparison.difference, true)} skirtumas</span></div></div><p><b>Kas pasikeitė:</b> ${esc(comparison.alternative.lesson)}</p><div class="news">Antra galimybė nekeičia klasės rezultatų. Ji leidžia saugiai palyginti sprendimus ir suprasti pasekmes.</div><div class="row"><button class="btn" id="restart-demo">Žaisti dar kartą</button><a class="btn alt" href="#pilotas">Prašyti pilno bandymo</a></div></div>`;
  $('#restart-demo').addEventListener('click', reset);
}
function drawTransition() { box.innerHTML = `${header(3, 'Savaitė vyksta')}<div class="transition-card"><div class="spinner">↻</div><h3>Ekonominiai įvykiai vyksta…</h3><p>Kainos, rinkos ir tavo pasirinkimai keičia miesto finansus.</p></div>`; }
function keepDemoVisible() {
  if (!box || typeof box.scrollIntoView !== 'function') return;
  requestAnimationFrame(() => box.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }));
}
function draw() { if (phase === 'intro') drawIntro(); else if (phase === 'legacy-event') drawLegacyEvent(); else if (phase === 'legacy-event-choice') drawLegacyEventChoice(); else if (phase === 'legacy-strategy') drawStrategy(); else if (phase === 'event') drawEvent(); else if (phase === 'analytics') drawAnalytics(); else if (phase === 'step-finish') drawStepFinish(); else if (phase === 'strategy') drawStrategy(); else if (phase === 'locked') drawLocked(); else if (phase === 'transition') drawTransition(); else if (phase === 'reveal') drawReveal(); if (phase !== 'intro') keepDemoVisible(); }
function reset() {  phase = 'intro'; choice = null; prediction = null; alloc = { sav: 25, inv: 25, bus: 25, res: 25 }; reveal = null; comparison = null; startingCapital = DEMO_CAPITAL; weekNo = 1; stepIndex = 0; stepCapital = DEMO_CAPITAL; stepHistory = []; demoSession = null; draw(); }
reset();

// Nubrėžtos ikonos: jokio emoji, kad veiktų ir be emoji šrifto.
const IC = {
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><rect x="5" y="10.6" width="14" height="9.4" rx="2.2"/><path d="M8.6 10.6V7.9a3.4 3.4 0 0 1 6.8 0v2.7"/></svg>',
  bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.2 17.4h5.6M10.2 20.4h3.6"/><path d="M12 3.6a5.6 5.6 0 0 0-3.3 10.1c.5.4.8 1 .8 1.6v.5h5v-.5c0-.6.3-1.2.8-1.6A5.6 5.6 0 0 0 12 3.6z"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4.4 21 19.6H3z"/><path d="M12 10v4.2M12 17.1v.1"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 7 5 11.5 9.5 16"/><path d="M5 11.5h9a4 4 0 0 1 4 4v1.5"/></svg>',
  sprout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20.4v-7.2"/><path d="M12 13.2c0-3 2.2-5 5.5-5 0 3-2.2 5-5.5 5z"/><path d="M12 15.2c0-2.4-1.8-4-4.5-4 0 2.4 1.8 4 4.5 4z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="3.9"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 3.2 19 6v5.2c0 4.3-2.8 7.7-7 9.6-4.2-1.9-7-5.3-7-9.6V6z"/></svg>',
  compass: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><circle cx="12" cy="12" r="8.6"/><path d="M15 9 13.2 13.2 9 15l1.8-4.2z"/></svg>',
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="7" y="2.9" width="10" height="18.2" rx="2.4"/><path d="M10.7 18.5h2.6"/></svg>',
};

// ---------- auditorijos versijos: mokyklai / asmeniui ----------
// Mokyklos turinys yra statiniame HTML (veikia ir be JS). Asmeninė versija įkeliama tik
// pasirinkus – taip pats puslapis nesidubliuoja ir išlieka viena tiesos vieta.
const AUD_MARKUP = {
  individual: {
    nav: '<a class="logo" href="/"><i>V</i>VEMAK</a><span class="sp"></span><a href="#demo">Demo</a><a href="#nauda">Nauda</a><a href="#planai">Planai</a><a href="#duk">D.U.K.</a><a class="btn" href="#pilotas">Registracija</a>',
    heroCopy: `
        <div class="sign">
          <span class="sign-face"><b>6 savaičių sezonas · sau pačiam</b><h1>Išmok investuoti, kol tai dar <em>nekainuoja tikrų pinigų</em>.</h1></span>
        </div>

        <div class="tag">
          <p class="lead-text">Šešių savaičių rinkos scenarijus: sek prognozes, paskirstyk virtualų biudžetą ir pamatyk, ką tavo sprendimai duotų augimo ir nuosmukio savaitėmis. Be brokerio, be rizikos, be realių pinigų.</p>
        </div>

        <div class="tag lead">
          <div class="row"><a class="btn xl" href="#pilotas">Rezervuoti asmeninį sezoną</a></div>
          <ul class="trust">
            <li><i class="ck"></i>Veikia naršyklėje, be diegimo</li>
            <li><i class="ck"></i>Jokie tikri pinigai</li>
            <li><i class="ck"></i>15–20 min. per savaitę</li>
          </ul>
        </div>

        <div class="strip" aria-label="Sezono savaitės">
          <div class="nowmark" id="nowMark"><span>dabar</span></div>
          <div class="wk done"><b>1 sav.</b><span>Biudžetas</span></div>
          <div class="wk now"><b>2 sav.</b><span>Taupymas</span></div>
          <div class="wk"><b>3 sav.</b><span>Rizika</span></div>
          <div class="wk"><b>4 sav.</b><span>Investicijos</span></div>
          <div class="wk"><b>5 sav.</b><span>Biudžetas</span></div>
          <div class="wk"><b>6 sav.</b><span>Sezono pabaiga</span></div>
        </div>`,
    ritmas: `
  <div class="sec-h"><h2>Viena savaitė – vienas sprendimas</h2><p class="muted">Gali žaisti savo tempu: viena savaitė telpa į 15–20 minučių.</p></div>
  <div class="week">
    <div><b>Įvykis</b>Kainos kyla, rinkos krenta arba pasirodo viliojantys pigūs pasiūlymai. Perskaitai situaciją ir prognozių užuominas.</div>
    <div><b>Sprendimas</b>Pasirenki kryptį ir paskirstai visą kapitalą į santaupas, investicijas, verslą ir rezervą.</div>
    <div><b>Rezultatas</b>Pamatai savaitės pelną arba nuostolį ir kaip pasikeitė tavo miesto finansai.</div>
    <div><b>Pamoka</b>Mentorius paaiškina pasekmes žingsnis po žingsnio, o tavo miestas auga toliau.</div>
  </div>`,
    nauda: `
  <div class="sec-h"><h2>Ką gausi tu, o ne klasė</h2></div>
  <div class="stalls">
    <article class="stall big"><h3><em>01</em>Tau: savas miestas ir savi sprendimai</h3><ul>
      <li>Šešių savaičių rinkos scenarijus: augimas, nuosmukis ir netikėtos išlaidos</li>
      <li>Paskirstai virtualius 1 000 € į santaupas, investicijas, verslą ir rezervą</li>
      <li>Kiekvieną savaitę naujas įvykis, tad sprendimą priimi iš naujo, o ne nusirašai</li>
      <li>Po klaidos gauni antrą galimybę – klaida čia nieko nekainuoja</li>
      <li>Klasės kodo nereikia: žaidi vienas, savo tempu</li></ul></article>
    <article class="stall"><h3><em>02</em>Mokaisi iš pasekmių, o ne iš pamokymų</h3><ul>
      <li>Po kiekvieno nuostolio ar prieaugio matai įvykių seką žingsnis po žingsnio</li>
      <li>Mentorius paaiškina, kas nutiko, remdamasis tavo skaičiais</li>
      <li>Paskutinę savaitę palygini savo strategiją su geriausiu modelio rastu variantu</li>
      <li>Skaičius ir patarimus sudaro taisyklės, tad jie nėra išgalvoti</li></ul></article>
    <article class="stall"><h3><em>03</em>Saugu, aišku ir be spaudimo</h3><ul>
      <li>Jokie tikri pinigai, joks brokeris, jokia rizika</li>
      <li>Demo išbandai iš karto, be registracijos ir be el. pašto</li>
      <li>Žaidimas yra mokomoji priemonė, o ne finansinė rekomendacija</li>
      <li>Gali pertraukti ir grįžti bet kada</li></ul></article>
  </div>`,
    kodel: `
  <div class="sec-h"><h2>Mokymasis per pasekmes</h2></div>
  <div class="feat">
    <div class="card"><div class="feat-head"><span class="ic">${IC.target}</span><h3>Fiksuotas scenarijus</h3></div><p>Kiekvieną sezoną tie patys šeši įvykiai, tad rezultatą lemia tavo sprendimai, o ne atsitiktinumas.</p></div>
    <div class="card"><div class="feat-head"><span class="ic">${IC.shield}</span><h3>Rizika be rizikos</h3></div><p>Gali pabandyti agresyvią strategiją ir pamatyti, kiek ji kainuotų nuosmukio savaitę – neprarasdamas nė euro.</p></div>
    <div class="card"><div class="feat-head"><span class="ic">${IC.compass}</span><h3>Mentorius be išgalvotų faktų</h3></div><p>Skaičius ir patarimus sudaro taisyklės, todėl jie nėra „haliucinacijos“. Tai mokomoji pagalba, ne finansinė rekomendacija.</p></div>
    <div class="card"><div class="feat-head"><span class="ic">${IC.device}</span><h3>Veikia bet kur</h3></div><p>Telefone, planšetėje ar kompiuteryje. Lengvas, be sunkios 3D grafikos.</p></div>
  </div>`,
    pilotas: `
  <div class="sec-h"><h2>Rezervuoti asmeninį sezoną</h2><p class="muted">Vienas žaidėjas, vienas miestas. Palik kontaktus – atidarysime tavo sezoną ir atsiųsime mokėjimo nuorodą.</p></div>
  <form class="pilot-card" id="pf">
    <label for="pn">Vardas</label><input id="pn" required maxlength="80">
    <label for="pe">El. paštas</label><input id="pe" type="email" required maxlength="120">
    <label for="pr">Kaip žaisi?</label><select id="pr"><option>Sau asmeniškai</option><option>Šeimai</option><option>Dovanai</option><option>Kita</option></select>
    <label for="pm">Žinutė (nebūtina)</label><textarea id="pm" rows="3" maxlength="500"></textarea>
    <label style="display:flex;gap:9px;align-items:flex-start;font-weight:500;margin-top:16px"><input type="checkbox" id="pc" style="width:auto;margin-top:5px" required> Sutinku, kad su manimi susisieuktų dėl asmeninio sezono. Duomenys naudojami tik šiam tikslui.</label>
    <p class="err" id="perr" role="alert"></p><button class="btn xl" style="width:100%">Registracija</button>
  </form>`,
    duk: `
  <div class="sec-h"><h2>Dažni klausimai</h2></div>
  <details><summary>Ar man reikia tikrų pinigų?</summary><p>Ne. Viskas vyksta su virtualiais eurais: nėra mokėjimų, brokerio ar prizų.</p></details>
  <details><summary>Ar gausiu investavimo patarimų?</summary><p>Ne. Žaidimas yra mokomoji priemonė ir nesiūlo finansinių ar investavimo rekomendacijų.</p></details>
  <details><summary>Kiek laiko užtrunka?</summary><p>Vienas sezonas – 6 savaitės, po 15–20 minučių per savaitę. Gali žaisti savo tempu.</p></details>
  <details><summary>Ar galiu žaisti be mokyklos ar klasės kodo?</summary><p>Taip. Asmeninis sezonas skirtas vienam žaidėjui, tad klasės kodo nereikia.</p></details>
  <details><summary>Ką gausiu sezono pabaigoje?</summary><p>Kiekvienos savaitės rezultatą, mentoriaus paaiškinimą ir palyginimą su geriausiu modelio variantu.</p></details>`,
  },
};
const AUD_IDS = ['nav', 'heroCopy', 'ritmas', 'nauda', 'kodel', 'pilotas', 'duk'];
const AUD_SNAP = {};
for (const id of AUD_IDS) { const el = document.getElementById(id); if (el) AUD_SNAP[id] = el.innerHTML; }
function audText(school, individual) { return audience === 'individual' ? individual : school; }

// Judantis „dabar" žymeklis: rodo, kuri sezono savaitė eina šiuo metu.
// Ranka surinktos raidės: kiekviena raidė šiek tiek pasukta ir paslinkta,
// kad užrašas atrodytų rašytas ranka, o ne nulietas šriftu.
function handSet(el) {
  if (!el || el.dataset.handDone) return;
  const text = el.textContent;
  if (!text) return;
  el.dataset.handDone = '1';
  let seed = 20261029;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const frag = document.createDocumentFragment();
  for (const word of text.split(' ')) {
    if (!word) { frag.appendChild(document.createTextNode(' ')); continue; }
    const w = document.createElement('span');
    w.className = 'w';
    // kiekvienas žodis šiek tiek pasuktas ir paslinktas
    w.style.setProperty('--wr', (rnd() * 2.6 - 1.3).toFixed(2) + 'deg');
    w.style.setProperty('--wy', (rnd() * 3.0 - 1.5).toFixed(2) + 'px');
    w.style.marginRight = (rnd() * 2.2 - 0.6).toFixed(2) + 'px';
    for (const ch of word) {
      const c = document.createElement('span');
      c.className = 'c';
      c.textContent = ch;
      // raidės posūkis, aukštis ir dydis – kaip rašant ranka
      c.style.setProperty('--r', (rnd() * 9.0 - 4.5).toFixed(2) + 'deg');
      c.style.setProperty('--y', (rnd() * 6.0 - 3.0).toFixed(2) + 'px');
      c.style.setProperty('--s', (0.95 + rnd() * 0.11).toFixed(3));
      w.appendChild(c);
    }
    frag.appendChild(w); frag.appendChild(document.createTextNode(' '));
  }
  el.textContent = ''; el.appendChild(frag);
}

function handSetAll(root) {
  (root || document).querySelectorAll('[data-hand]').forEach(handSet);
}

// Demo scenarijus keiciasi: kiekvienas lankytojas pradeda nuo dar nematyto.
function pickDemoScenarioOffset() {
  try {
    const total = DEMO_SCENARIOS.length;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem('vemak.demo.seen') || '[]'); } catch { seen = []; }
    if (!Array.isArray(seen)) seen = [];
    let offset = 0;
    while (offset < total && seen.includes(offset)) offset += 1;
    if (offset >= total) { seen = []; offset = 0; }
    seen.push(offset);
    localStorage.setItem('vemak.demo.seen', JSON.stringify(seen.slice(-total)));
    return offset;
  } catch { return 0; }
}

function placeNowMark() {
  const strip = document.querySelector('.strip');
  const mark = document.getElementById('nowMark');
  const cell = strip && strip.querySelector('.wk.now');
  if (!strip || !mark || !cell) return;
  mark.style.left = (cell.offsetLeft + cell.offsetWidth / 2) + 'px';
}
window.addEventListener('resize', placeNowMark);
function setAudience(kind, opts = {}) {
  audience = kind === 'individual' ? 'individual' : 'school';
  const source = audience === 'individual' ? AUD_MARKUP.individual : AUD_SNAP;
  for (const id of AUD_IDS) { const el = document.getElementById(id); if (el && source[id] !== undefined) el.innerHTML = source[id]; }
  document.querySelectorAll('.aud-btn').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.aud === audience)));
  document.title = audience === 'individual'
    ? 'VEMAK · Investavimo treniruoklis sau pačiam'
    : 'VEMAK · Finansinis raštingumas, kurį mokiniai nori žaisti';
  try { localStorage.setItem('vemak.audience', audience); } catch { /* privatus režimas */ }
  placeNowMark();
themeFromURL();
wireThemeToggle();
window.addEventListener('vemak:theme', () => { const c = document.getElementById('heroCity'); if (c) c.innerHTML = citySVG({ mood: 'neutral' }); });
  if (phase === 'intro') drawIntro();
  if (opts.scroll) { const target = document.getElementById('pilotas'); if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}
document.querySelectorAll('.aud-btn').forEach((btn) => btn.addEventListener('click', () => setAudience(btn.dataset.aud)));
document.querySelectorAll('[data-plan]').forEach((btn) => btn.addEventListener('click', () => setAudience(btn.dataset.plan, { scroll: true })));

// Forma siunčiama per delegavimą: ji išlieka veikianti ir pakeitus auditoriją.
document.addEventListener('submit', async (e) => {
  const form = e.target;
  if (!form || form.id !== 'pf') return;
  e.preventDefault();
  const val = (sel) => form.querySelector(sel)?.value || '';
  try {
    await api('POST', '/api/pilot', {
      plan: audience,
      name: val('#pn'), email: val('#pe'), school: val('#ps'),
      role: val('#pr'), message: val('#pm'), consent: !!form.querySelector('#pc')?.checked,
    });
    form.innerHTML = audience === 'individual'
      ? '<h3>Ačiū! Rezervacija gauta</h3><p>Susisieksime el. paštu dėl asmeninio sezono ir mokėjimo nuorodos.</p>'
      : '<h3>Ačiū! Prašymas gautas</h3><p>Susisieksime el. paštu dėl pilotinio bandymo.</p>';
  } catch (er) { const box = form.querySelector('#perr'); if (box) box.textContent = er.message; }
});

// Pradinė auditorija: nuoroda #asmeniui arba paskutinis pasirinkimas.
let savedAudience = 'school';
try { savedAudience = localStorage.getItem('vemak.audience') || 'school'; } catch { /* privatus režimas */ }
setAudience(location.hash.replace('#', '') === 'asmeniui' || savedAudience === 'individual' ? 'individual' : 'school');
placeNowMark();
// Nuoroda turi veikti ir tada, kai puslapis jau atidarytas (pvz., paspaudus #asmeniui nuorodą).
window.addEventListener('hashchange', () => {
  if (location.hash === '#asmeniui') setAudience('individual');
  else if (location.hash === '#mokyklai') setAudience('school');
});
