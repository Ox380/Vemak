// engine.js — VEMAK economy engine. Pure functions, no I/O. Runs in Node (server) and browser (demo).
// Everything is deterministic from the class seed, so every student in a class sees the same market.
import { WEEKS as WEEK_CONTENT, ASSET_META } from './content.js';

export const CONFIG = {
  WEEKS: 6,
  PAY: 1000,
  NEEDS: 600,
  WANTS: 150,
  MIN_WANTS: 50,
  SAVINGS_RATE: 0.003,
  FORCED_PENALTY: 0.15,   // lost when an emergency forces you to sell assets
  BIZ_BASE: 0.045,
  BIZ_SD: 0.08,
  BIZ_CAP_PER_LEVEL: 500, // capital above this earns only the savings rate
  BIZ_LEVEL_BONUS: 0.005,
  BIZ_UPGRADE_COST: 200,  // sunk equipment cost, paid from business capital
  BIZ_MAX_LEVEL: 3,
  DEBT_RATE: 0.05,
  BANKRUPT_DEBT: 400,
  RESTART_RESERVE: 100,
  PRICE_RISE: 0.12,
};

// asset: [mean weekly return, sd]
export const ASSETS = {
  etf:   [0.010, 0.040],
  tech:  [0.012, 0.090],
  green: [0.011, 0.075],
  reit:  [0.006, 0.025],
  gold:  [0.003, 0.030],
};
export const ASSET_KEYS = Object.keys(ASSETS);
export const DEFAULT_MIX = { etf: 40, reit: 30, green: 20, gold: 10, tech: 0 };
export const BUCKETS = ['sav', 'inv', 'bus', 'res'];

// ---------- seeded randomness ----------
export function hashSeed(str) {
  let h = 2166136261 >>> 0;
  for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
export function makeRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const between = (r, [lo, hi]) => lo + (hi - lo) * r();

// ---------- season (shared by the whole class) ----------
export function buildSeason(seed) {
  const r = makeRng(typeof seed === 'number' ? seed : hashSeed(seed));
  const weeks = [];
  for (let i = 0; i < CONFIG.WEEKS; i++) {
    const ev = WEEK_CONTENT[i].event;
    const w = { week: i + 1, market: {}, bizNoise: 0, expense: 0, shock: 0, priceRise: 0, bizBoom: 0 };
    w.shock = ev && (ev.type === 'marketShock' || ev.type === 'rebound') ? between(r, ev.range) : 0;
    for (const a of ASSET_KEYS) {
      const [mu, sd] = ASSETS[a];
      w.market[a] = mu + sd * gauss(r) + w.shock * (sd / 0.04) * 0.5;
    }
    w.bizNoise = gauss(r);
    if (ev && ev.type === 'expense') w.expense = Math.round(between(r, ev.range) / 10) * 10;
    if (ev && ev.type === 'rebound' && ev.expense) w.expense = Math.round(between(r, ev.expense) / 10) * 10;
    if (ev && ev.type === 'priceRise') w.priceRise = ev.pct;
    if (ev && ev.type === 'bizBoom') w.bizBoom = 0.04;
    weeks.push(w);
  }
  return { seed, weeks };
}

// ---------- player state ----------
export function newState() {
  return {
    week: 0,
    reserve: 0, savings: 0, business: 0, debt: 0,
    invest: { etf: 0, tech: 0, green: 0, reit: 0, gold: 0 },
    level: 1, wantsDelta: 0, shield: false, bizBoost: 0, priceRiseActive: false,
    forcedSales: 0, secondChances: 0, bankrupt: false,
    history: [],
  };
}
export const sumInvest = (s) => ASSET_KEYS.reduce((t, a) => t + s.invest[a], 0);
export const netWorth = (s) => s.reserve + s.savings + s.business + sumInvest(s) - s.debt;
export const bizCap = (s) => CONFIG.BIZ_CAP_PER_LEVEL * s.level;
const round2 = (x) => Math.round(x * 100) / 100;

// --- „Pamoka" žingsniams: vienodas skaičių formatas serveryje ir naršyklėje ---
const money = (n) => String(Math.round(Number(n) || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
const signed = (n) => { const v = Math.round(Number(n) || 0); return (v > 0 ? '+' : v < 0 ? '−' : '') + money(Math.abs(v)); };
const pctStr = (x, d = 1) => (x >= 0 ? '+' : '−') + Math.abs(Number(x) * 100).toFixed(d).replace('.', ',') + ' %';
const BUCKET_LABELS = { sav: 'santaupas', inv: 'investicijas', bus: 'verslą', res: 'rezervą' };

export function defaultAlloc() {
  return { sav: 30, inv: 25, bus: 25, res: 20, mix: { ...DEFAULT_MIX }, upgrade: false };
}
export function validateAlloc(al) {
  if (!al || typeof al !== 'object') return 'Trūksta paskirstymo.';
  let t = 0;
  for (const k of BUCKETS) {
    const v = al[k];
    if (!Number.isFinite(v) || v < 0 || v > 100) return 'Neteisinga procentų reikšmė.';
    t += v;
  }
  if (Math.round(t) !== 100) return 'Paskirstymas turi sudaryti 100 %.';
  if (al.mix) {
    let m = 0;
    for (const a of ASSET_KEYS) {
      const v = al.mix[a] ?? 0;
      if (!Number.isFinite(v) || v < 0) return 'Neteisingas investicijų mišinys.';
      m += v;
    }
    if (al.inv > 0 && Math.round(m) !== 100) return 'Investicijų mišinys turi sudaryti 100 %.';
  }
  return null;
}

// pay an expense: reserve -> savings -> forced sale of investments -> forced sale of business -> debt
function payExpense(s, amount, report) {
  let need = amount;
  const take = (pool) => { const t = Math.min(need, s[pool]); s[pool] -= t; need -= t; };
  take('reserve'); take('savings');
  const sellFrom = (getter, setter) => {
    if (need <= 0) return;
    const have = getter();
    const gross = Math.min(have, need / (1 - CONFIG.FORCED_PENALTY));
    if (gross <= 0) return;
    setter(gross);
    need -= gross * (1 - CONFIG.FORCED_PENALTY);
    s.forcedSales += 1; report.forced += 1; report.penaltyLost += gross * CONFIG.FORCED_PENALTY;
  };
  sellFrom(() => sumInvest(s), (gross) => {
    const total = sumInvest(s);
    for (const a of ASSET_KEYS) s.invest[a] -= (s.invest[a] / total) * gross;
  });
  sellFrom(() => s.business, (gross) => { s.business -= gross; });
  if (need > 0.005) { s.debt += need; report.newDebt += need; }
}

// ---------- the weekly step ----------
export function playWeek(prev, season, weekNo, choiceKey, alloc) {
  const err = validateAlloc(alloc);
  if (err) throw new Error(err);
  const content = WEEK_CONTENT[weekNo - 1];
  const opt = content.options.find((o) => o.key === choiceKey);
  if (!opt) throw new Error('Nežinomas pasirinkimas.');
  const sw = season.weeks[weekNo - 1];
  const s = JSON.parse(JSON.stringify(prev));
  const nwBefore = netWorth(s);
  const report = { week: weekNo, choice: choiceKey, forced: 0, penaltyLost: 0, newDebt: 0, secondChance: false, events: [], notes: [] };

  // „Pamoka" — faktinė įvykių seka, sudaryta tik iš apskaičiuotų skaičių (nieko neišgalvojama).
  const steps = [];
  const step = (text, amount = null) => steps.push({ text, amount });
  step(`Pradinė grynoji vertė: ${money(nwBefore)}.`, nwBefore);

  // second chance after bankruptcy (guided restart, once per season is shown; rule allows repeat but flagged)
  if (s.bankrupt) {
    s.debt = 0; s.savings = 0; s.business = 0; s.level = 1;
    for (const a of ASSET_KEYS) s.invest[a] = 0;
    s.reserve = CONFIG.RESTART_RESERVE; s.bankrupt = false; s.secondChances += 1;
    report.secondChance = true;
    step(`Antra galimybė: skola nurašyta, turtas atstatytas, pradedi su ${money(CONFIG.RESTART_RESERVE)} rezervu.`, CONFIG.RESTART_RESERVE);
  }

  // persistent effects of the choice
  if (opt.shield) s.shield = true;
  if (opt.wantsDelta) s.wantsDelta += opt.wantsDelta;
  if (opt.bizBoost) s.bizBoost += opt.bizBoost;

  // 1 žingsnis — pasirinkimas ir jo tiesioginis poveikis
  step(`Pasirinkimas „${opt.label}".`, null);
  if (opt.cash) step(opt.cash > 0 ? `Iš karto gauta ${signed(opt.cash)} (įskaičiuota į biudžetą).` : `Iš karto sumokėta ${money(-opt.cash)} (įskaičiuota į biudžetą).`, opt.cash);
  if (opt.shield) step('Apsauga: kainų kilimas šiam sezonui nebeturi įtakos poreikiams.', null);
  if (opt.wantsDelta) step(`Norai ${opt.wantsDelta > 0 ? 'išaugo' : 'sumažėjo'} ${money(Math.abs(opt.wantsDelta))} per savaitę.`, opt.wantsDelta);
  if (opt.bizBoost) step(`Verslo grąža padidėjo ${pctStr(opt.bizBoost)} per savaitę.`, null);
  if (opt.sellInvest) step('Pasirinkta parduoti investicijas – po savaitės rezultatų visos lėšos perkeliamos į rezervą.', null);
  if (opt.buyInvest) step(`Papildomai nupirkta ETF už ${money(opt.buyInvest)} po savaitės rezultatų.`, opt.buyInvest);
  if (sw.priceRise) { s.priceRiseActive = true; report.events.push({ kind: 'priceRise', pct: sw.priceRise }); }
  if (sw.shock < 0) report.events.push({ kind: 'marketDown', pct: sw.shock });
  if (sw.shock > 0) report.events.push({ kind: 'marketUp', pct: sw.shock });
  if (sw.bizBoom) report.events.push({ kind: 'bizBoom' });

  const rise = s.priceRiseActive && !s.shield ? CONFIG.PRICE_RISE : 0;
  const needs = CONFIG.NEEDS * (1 + rise);
  const wants = Math.max(CONFIG.MIN_WANTS, CONFIG.WANTS + s.wantsDelta);
  let free = CONFIG.PAY - needs - wants + (opt.cash || 0);
  report.needs = round2(needs); report.wants = round2(wants); report.income = CONFIG.PAY + Math.max(0, opt.cash || 0);

  // 2 žingsnis — įvykis ir mėnesio biudžetas
  if (rise > 0) step(`Įvykis: kainos pakilo ${pctStr(rise, 0).replace('+', '')}, todėl poreikiai išaugo iki ${money(needs)}.`, -round2(needs * rise));
  else if (s.priceRiseActive && s.shield) step(`Apsauga suveikė: kainų kilimas nepaveikė poreikių (${money(needs)}).`, null);
  const choiceCash = opt.cash || 0;
  const cashPart = choiceCash ? `${choiceCash > 0 ? '+' : '−'} ${money(Math.abs(choiceCash))} ` : '';
  step(`Biudžetas: pajamos ${money(CONFIG.PAY)} ${cashPart}− poreikiai ${money(needs)} − norai ${money(wants)} = ${money(free)} laisvų pinigų.`, round2(free));

  let buyInvest = opt.buyInvest || 0;
  if (free < 0) {
    const deficit = -free;
    buyInvest = Math.max(0, buyInvest - deficit);
    payExpense(s, deficit, report);
    report.deficit = round2(deficit);
    free = 0;
    step(`Trūkumas ${money(deficit)}: pirmiausia nuskaityta iš rezervo ir santaupų${report.forced ? ', o likusią dalį teko parduoti su 15 % nuostoliu' : ''}.`, -round2(deficit));
  }
  if (s.debt > 0 && free > 0) {
    const pay = Math.min(free, s.debt);
    s.debt -= pay; free -= pay; report.debtRepaid = round2(pay);
    step(`Grąžinta skola: ${money(pay)} (skola mažėja iki ${money(s.debt)}).`, -round2(pay));
  }
  report.free = round2(free);

  // allocate
  const mix = alloc.mix || DEFAULT_MIX;
  const mixTotal = ASSET_KEYS.reduce((t, a) => t + (mix[a] || 0), 0) || 1;
  s.savings += (free * alloc.sav) / 100;
  s.reserve += (free * alloc.res) / 100;
  s.business += (free * alloc.bus) / 100;
  for (const a of ASSET_KEYS) s.invest[a] += (free * alloc.inv / 100) * ((mix[a] || 0) / mixTotal);

  // 3 žingsnis — tavo paskirstymas
  for (const k of BUCKETS) {
    if (alloc[k] > 0) step(`Paskirstei ${alloc[k]} % į ${BUCKET_LABELS[k]}: ${money((free * alloc[k]) / 100)}.`, round2((free * alloc[k]) / 100));
  }
  if (alloc.inv > 0) {
    const parts = ASSET_KEYS.filter((a) => (mix[a] || 0) > 0)
      .map((a) => `${ASSET_META[a].name} ${mix[a]} %`).join(', ');
    if (parts) step(`Investicijų dalis padalinta: ${parts}.`, null);
  }

  // returns
  const invBefore = Object.fromEntries(ASSET_KEYS.map((a) => [a, s.invest[a]]));
  const bizBefore = s.business;
  const savBefore = s.savings;
  const mkt = {};
  for (const a of ASSET_KEYS) { mkt[a] = sw.market[a]; s.invest[a] *= 1 + sw.market[a]; }
  const cap = bizCap(s);
  const productive = Math.min(s.business, cap);
  const overflow = s.business - productive;
  const base = CONFIG.BIZ_BASE + CONFIG.BIZ_LEVEL_BONUS * (s.level - 1) + s.bizBoost + sw.bizBoom;
  const priceDrag = s.priceRiseActive ? CONFIG.PRICE_RISE * 0.2 : 0;
  const bizRet = base + CONFIG.BIZ_SD * sw.bizNoise - priceDrag;
  s.business = productive * (1 + bizRet) + overflow * (1 + CONFIG.SAVINGS_RATE);
  s.savings *= 1 + CONFIG.SAVINGS_RATE;
  if (s.debt > 0) s.debt *= 1 + CONFIG.DEBT_RATE;
  report.market = mkt; report.bizReturn = bizRet;

  // 4 žingsnis — ką uždirbo ar prarado tavo turtas
  for (const a of ASSET_KEYS) {
    const d = s.invest[a] - invBefore[a];
    if (Math.abs(invBefore[a]) > 0.005) {
      step(`${ASSET_META[a].name} ${pctStr(sw.market[a])}: ${signed(d)} (liko ${money(s.invest[a])}).`, round2(d));
    }
  }
  step(`Kavos baras ${pctStr(bizRet)}: ${signed(s.business - bizBefore)} (liko ${money(s.business)}).`, round2(s.business - bizBefore));
  step(`Santaupos ${pctStr(CONFIG.SAVINGS_RATE)}: ${signed(s.savings - savBefore)} (liko ${money(s.savings)}).`, round2(s.savings - savBefore));
  if (s.debt > 0) step(`Skola auga ${pctStr(CONFIG.DEBT_RATE, 0).replace('+', '')} per savaitę: dabar ${money(s.debt)}.`, null);

  // choice effects that act after returns
  if (opt.sellInvest) {
    const t = sumInvest(s);
    s.reserve += t;
    for (const a of ASSET_KEYS) s.invest[a] = 0;
    report.sold = round2(t);
    step(`Investicijos parduotos: ${money(t)} perkelta į rezervą.`, round2(t));
  }
  if (buyInvest > 0) {
    s.invest.etf += buyInvest;
    step(`Papildomai nupirkta ETF už ${money(buyInvest)}.`, round2(buyInvest));
  }

  // business upgrade (needs a full business, costs sunk equipment money)
  if (alloc.upgrade && s.level < CONFIG.BIZ_MAX_LEVEL && s.business >= cap * 0.95 && s.business > CONFIG.BIZ_UPGRADE_COST) {
    s.business -= CONFIG.BIZ_UPGRADE_COST; s.level += 1; report.upgraded = s.level;
    step(`Kavos baro plėtra: sumokėta ${money(CONFIG.BIZ_UPGRADE_COST)}, naujas lygis ${s.level} (didesnis kapitalo limitas).`, -CONFIG.BIZ_UPGRADE_COST);
  }

  // unexpected expense
  if (sw.expense) {
    const fBefore = report.forced, pBefore = report.penaltyLost;
    report.expense = sw.expense; payExpense(s, sw.expense, report);
    const soldGross = (report.penaltyLost - pBefore) / CONFIG.FORCED_PENALTY;
    const covered = Math.max(0, sw.expense - soldGross);
    step(`Netikėta išlaida: ${money(sw.expense)}.`, -sw.expense);
    if (covered > 0.005) step(`Rezervas ir santaupos padengė ${money(covered)} be nuostolių.`, null);
    else step('Rezervo neužteko, todėl teko parduoti turtą.', null);
    if (report.forced > fBefore) step(`Priverstinis turto pardavimas: parduota už ${money(soldGross)}, prarasta ${money(report.penaltyLost - pBefore)} (15 %).`, -round2(report.penaltyLost - pBefore));
    if (report.newDebt > 0) step(`Turto neužteko, todėl liko skola: ${money(report.newDebt)}.`, -round2(report.newDebt));
  }

  if (s.debt > CONFIG.BANKRUPT_DEBT) { s.bankrupt = true; report.bankrupt = true; step(`Skola viršijo ${money(CONFIG.BANKRUPT_DEBT)} – sekanti savaitė prasidės su antrąja galimybe.`, null); }

  s.week = weekNo;
  const nw = netWorth(s);
  report.netWorth = round2(nw);
  report.delta = round2(nw - nwBefore);
  report.reservePct = alloc.res; report.maxShare = Math.max(...BUCKETS.map((k) => alloc[k]));
  report.investPct = alloc.inv; report.savingsPct = alloc.sav; report.businessPct = alloc.bus;
  // 5 žingsnis — išvada
  step(`Galutinė grynoji vertė: ${money(nw)} (${signed(nw - nwBefore)} per savaitę).`, round2(nw - nwBefore));
  report.alloc = alloc; report.lesson = opt.lesson; report.steps = steps;
  report.state = { reserve: round2(s.reserve), savings: round2(s.savings), business: round2(s.business), debt: round2(s.debt), level: s.level, invest: Object.fromEntries(ASSET_KEYS.map((a) => [a, round2(s.invest[a])])) };
  s.history.push(report);
  return { state: s, report };
}

// risk-adjusted score for the "best strategy" award (see ECONOMY.md)
export function strategyScore(state) {
  const nw = netWorth(state);
  let conc = 0;
  for (const r of state.history) conc += Math.max(0, r.maxShare - 40) / 60;
  conc = state.history.length ? conc / state.history.length : 0;
  return round2(nw * (1 - 0.25 * conc) - 50 * state.forcedSales);
}

// ---------- rule-based mentor (facts first; text is a template, so it can never invent financial facts) ----------
export function mentorFacts(report, nextWeekNo) {
  const a = report.alloc;
  return {
    week: report.week, delta: report.delta, choice: report.choice,
    reservePct: a.res, savingsPct: a.sav, investPct: a.inv, businessPct: a.bus, maxShare: report.maxShare,
    forced: report.forced, debt: report.state.debt, expense: report.expense || 0, bankrupt: !!report.bankrupt,
    secondChance: !!report.secondChance, nextWeekNo,
  };
}
export function mentorNote(f) {
  const pts = [];
  if (f.secondChance) pts.push('Gavai antrą galimybę: pradėk nuo mažo rezervo ir paskirstyk pinigus atsargiai.');
  if (f.debt > 0) pts.push(`Turi skolą (${Math.round(f.debt)} €). Ji auga 5 % per savaitę, todėl pirmiausia ją sumažink.`);
  if (f.forced > 0) pts.push('Netikėta išlaida privertė parduoti turtą su 15 % praradimu. Rezervas būtų to išvengęs.');
  else if (f.expense > 0 && f.reservePct > 0) pts.push('Netikėtą išlaidą sumokėjai be nuostolių. Rezervas padėjo.');
  else if (f.reservePct >= 15) pts.push('Puikiai valdai riziką: turi rezervą netikėtoms išlaidoms.');
  else if (f.reservePct === 0) pts.push('Rezervas 0 %: netikėta išlaida gali kainuoti brangiai. Kitą savaitę skirk bent 15 %.');
  if (f.maxShare >= 60) pts.push(`Per daug pinigų vienoje vietoje (${f.maxShare} %). Paskirstyk juos tarp kelių krepšelių.`);
  else pts.push('Gerai paskirstei pinigus tarp kelių krepšelių.');
  if (f.investPct < 15 && f.savingsPct >= 50) pts.push('Investicijų dalis galėtų būti didesnė, nes santaupos auga labai lėtai.');
  if (f.nextWeekNo && f.nextWeekNo <= CONFIG.WEEKS) pts.push('Kitą savaitę gali pasitaikyti netikėtumų, todėl verta turėti rezervą.');
  return { result: f.delta, points: pts.slice(0, 4) };
}
