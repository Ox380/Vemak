// engine.js — VEMAK economy engine. Pure functions, no I/O. Runs in Node (server) and browser (demo).
// Everything is deterministic from the class seed, so every student in a class sees the same market.
import { WEEKS as WEEK_CONTENT } from './content.js';

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

  // second chance after bankruptcy (guided restart, once per season is shown; rule allows repeat but flagged)
  if (s.bankrupt) {
    s.debt = 0; s.savings = 0; s.business = 0; s.level = 1;
    for (const a of ASSET_KEYS) s.invest[a] = 0;
    s.reserve = CONFIG.RESTART_RESERVE; s.bankrupt = false; s.secondChances += 1;
    report.secondChance = true;
  }

  // persistent effects of the choice
  if (opt.shield) s.shield = true;
  if (opt.wantsDelta) s.wantsDelta += opt.wantsDelta;
  if (opt.bizBoost) s.bizBoost += opt.bizBoost;
  if (sw.priceRise) { s.priceRiseActive = true; report.events.push({ kind: 'priceRise', pct: sw.priceRise }); }
  if (sw.shock < 0) report.events.push({ kind: 'marketDown', pct: sw.shock });
  if (sw.shock > 0) report.events.push({ kind: 'marketUp', pct: sw.shock });
  if (sw.bizBoom) report.events.push({ kind: 'bizBoom' });

  const rise = s.priceRiseActive && !s.shield ? CONFIG.PRICE_RISE : 0;
  const needs = CONFIG.NEEDS * (1 + rise);
  const wants = Math.max(CONFIG.MIN_WANTS, CONFIG.WANTS + s.wantsDelta);
  let free = CONFIG.PAY - needs - wants + (opt.cash || 0);
  report.needs = round2(needs); report.wants = round2(wants); report.income = CONFIG.PAY + Math.max(0, opt.cash || 0);

  let buyInvest = opt.buyInvest || 0;
  if (free < 0) {
    const deficit = -free;
    buyInvest = Math.max(0, buyInvest - deficit);
    payExpense(s, deficit, report);
    report.deficit = round2(deficit);
    free = 0;
  }
  if (s.debt > 0 && free > 0) {
    const pay = Math.min(free, s.debt);
    s.debt -= pay; free -= pay; report.debtRepaid = round2(pay);
  }
  report.free = round2(free);

  // allocate
  const mix = alloc.mix || DEFAULT_MIX;
  const mixTotal = ASSET_KEYS.reduce((t, a) => t + (mix[a] || 0), 0) || 1;
  s.savings += (free * alloc.sav) / 100;
  s.reserve += (free * alloc.res) / 100;
  s.business += (free * alloc.bus) / 100;
  for (const a of ASSET_KEYS) s.invest[a] += (free * alloc.inv / 100) * ((mix[a] || 0) / mixTotal);

  // returns
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

  // choice effects that act after returns
  if (opt.sellInvest) {
    const t = sumInvest(s);
    s.reserve += t;
    for (const a of ASSET_KEYS) s.invest[a] = 0;
    report.sold = round2(t);
  }
  if (buyInvest > 0) { s.invest.etf += buyInvest; }

  // business upgrade (needs a full business, costs sunk equipment money)
  if (alloc.upgrade && s.level < CONFIG.BIZ_MAX_LEVEL && s.business >= cap * 0.95 && s.business > CONFIG.BIZ_UPGRADE_COST) {
    s.business -= CONFIG.BIZ_UPGRADE_COST; s.level += 1; report.upgraded = s.level;
  }

  // unexpected expense
  if (sw.expense) { report.expense = sw.expense; payExpense(s, sw.expense, report); }

  if (s.debt > CONFIG.BANKRUPT_DEBT) { s.bankrupt = true; report.bankrupt = true; }

  s.week = weekNo;
  const nw = netWorth(s);
  report.netWorth = round2(nw);
  report.delta = round2(nw - nwBefore);
  report.reservePct = alloc.res; report.maxShare = Math.max(...BUCKETS.map((k) => alloc[k]));
  report.investPct = alloc.inv; report.savingsPct = alloc.sav; report.businessPct = alloc.bus;
  report.alloc = alloc; report.lesson = opt.lesson;
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
