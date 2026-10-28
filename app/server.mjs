// VEMAK server. Zero dependencies (Node >= 20). Run: node server.mjs
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildSeason, newState, playWeek, validateAlloc, defaultAlloc, netWorth, strategyScore, mentorFacts, mentorNote, CONFIG } from './public/engine.js';
import { createRewards, awardOnce, weeklyXp, trophyEligibility, levelForXp } from './public/rewards.js';
import { WEEKS as CONTENT } from './public/content.js';
import { LESSONS, QUIZ } from './server/teaching.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = process.env.VEMAK_DATA || path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const PORT = Number(process.env.PORT || 3000);
fs.mkdirSync(DATA_DIR, { recursive: true });

// ---------- tiny JSON database (atomic write) ----------
let db = { teachers: {}, classes: {}, students: {}, sessions: {}, audit: [] };
try { db = { ...db, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }; } catch { /* first run */ }
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 50);
}
function saveNow() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db));
  fs.renameSync(tmp, DB_FILE);
}
process.on('SIGINT', () => { saveNow(); process.exit(0); });
process.on('SIGTERM', () => { saveNow(); process.exit(0); });

const audit = (actor, action, subject) => { db.audit.push({ at: new Date().toISOString(), actor, action, subject }); if (db.audit.length > 5000) db.audit.shift(); };
const rid = (n = 12) => crypto.randomBytes(n).toString('hex');
const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function newCode() {
  for (;;) {
    let c = ''; for (let i = 0; i < 6; i++) c += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    if (!Object.values(db.classes).some((k) => k.code === c)) return c;
  }
}
function hashPw(pw, salt = rid(16)) { return salt + ':' + crypto.scryptSync(pw, salt, 32).toString('hex'); }
function checkPw(pw, stored) {
  const [salt, h] = stored.split(':');
  const a = Buffer.from(crypto.scryptSync(pw, salt, 32).toString('hex'));
  const b = Buffer.from(h);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ---------- helpers ----------
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const bad = (m) => new HttpError(400, m);
const deny = (m = 'Reikia prisijungti.') => new HttpError(401, m);

const hits = new Map();
function limit(key, max, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (arr.length >= max) throw new HttpError(429, 'Per daug bandymų. Pabandyk vėliau.');
  arr.push(now); hits.set(key, arr);
}

function authTeacher(req) {
  const tok = (req.headers.authorization || '').replace(/^Bearer /, '');
  const sess = db.sessions[sha(tok)];
  if (!tok || !sess || sess.role !== 'teacher') throw deny();
  return db.teachers[sess.id];
}
function authStudent(req) {
  const tok = (req.headers.authorization || '').replace(/^Bearer /, '');
  const sess = db.sessions[sha(tok)];
  if (!tok || !sess || sess.role !== 'student') throw deny();
  const st = db.students[sess.id];
  if (!st) throw deny();
  return st;
}
const classOf = (st) => db.classes[st.classId];
const studentsOf = (cls) => Object.values(db.students).filter((s) => s.classId === cls.id);

function cleanNick(raw) {
  const n = String(raw || '').replace(/[\u0000-\u001f<>]/g, '').trim().replace(/\s+/g, ' ');
  if (n.length < 2 || n.length > 20) throw bad('Slapyvardis turi būti 2-20 simbolių.');
  return n;
}

// ---------- game logic ----------
function neutralChoice(week) { return CONTENT[week - 1].options[1].key; }
function ensureState(st) { if (!st.state) st.state = newState(); return st.state; }

function revealWeek(cls) {
  if (cls.week < 1) throw bad('Sezonas dar nepradėtas.');
  if (cls.revealed >= cls.week) throw bad('Ši savaitė jau atskleista.');
  const season = buildSeason(cls.seed);
  for (const st of studentsOf(cls)) {
    const sub = st.subs[cls.week] || { choice: neutralChoice(cls.week), alloc: defaultAlloc(), auto: true };
    st.subs[cls.week] = sub;
    const prev = ensureState(st);
    const { state, report } = playWeek(prev, season, cls.week, sub.choice, sub.alloc);
    report.auto = !!sub.auto;
    state.history[state.history.length - 1] = report;
    st.state = state;
    st.rewards = st.rewards || createRewards();
    const points = weeklyXp(report);
    for (const [kind, amount] of Object.entries(points)) if (amount) st.rewards = awardOnce(st.rewards, `week-${cls.week}-${kind}`, amount);
    st.rewards = awardOnce(st.rewards, `week-${cls.week}-knowledge`, st.quiz?.post && st.quiz.post.pct > (st.quiz.pre?.pct || 0) ? 100 : 0);
    st.rewards.level = levelForXp(st.rewards.xp);
    const row = {
      id: st.id, score: strategyScore(state), delta: report.delta, alloc: report.alloc,
      bizReturn: report.bizReturn, investmentReturn: Object.values(report.market || {}).reduce((sum, value) => sum + value, 0),
      knowledgeImprovement: (st.quiz?.post?.pct || 0) - (st.quiz?.pre?.pct || 0),
    };
    const classmates = studentsOf(cls).filter((x) => x.id !== st.id).map((x) => {
      const last = x.state?.history?.at(-1);
      return last ? { id: x.id, score: strategyScore(x.state), delta: last.delta, alloc: last.alloc, bizReturn: last.bizReturn, investmentReturn: Object.values(last.market || {}).reduce((sum, value) => sum + value, 0), knowledgeImprovement: (x.quiz?.post?.pct || 0) - (x.quiz?.pre?.pct || 0) } : null;
    }).filter(Boolean);
    const trophies = trophyEligibility([...classmates, row], row);
    for (const trophy of trophies) if (!st.rewards.trophies.includes(trophy.key)) st.rewards.trophies.push(trophy.key);
    const unlocks = { 1: 'Pradžios ženklelis', 2: 'Naujas avataro aksesuaras', 3: 'Kavos baro dekoracija', 4: 'Profilio rėmelis', 5: 'Miesto dekoracija', 6: 'Sezono čempiono kolekcija' };
    const cosmetic = unlocks[cls.week]; if (cosmetic && !st.rewards.cosmetics.includes(cosmetic)) st.rewards.cosmetics.push(cosmetic);
    state.history[state.history.length - 1] = report;
    st.mentor = st.mentor || {};
    st.mentor[cls.week] = { facts: mentorFacts(report, cls.week + 1), ...mentorNote(mentorFacts(report, cls.week + 1)) };
  }
  cls.revealed = cls.week;
  if (cls.week === CONFIG.WEEKS) cls.status = 'done';
  audit(cls.teacherId, 'reveal', cls.id + ':' + cls.week);
  save();
}

function rankings(cls) {
  const studs = studentsOf(cls).filter((s) => s.state && s.state.history.length);
  const week = cls.revealed;
  const row = (s, k) => {
    const h = s.state.history;
    const upto = h.slice(0, k);
    const last = upto[upto.length - 1];
    const sub = { ...s.state, history: upto, forcedSales: upto.reduce((t, r) => t + r.forced, 0) };
    return { id: s.id, nickname: s.nickname, avatar: s.avatar, netWorth: last ? last.netWorth : 0, delta: last ? last.delta : 0, score: strategyScore(sub), forcedSales: sub.forcedSales, debt: last ? last.state.debt : 0 };
  };
  const rankAt = (k) => {
    const rows = studs.filter((s) => s.state.history.length >= k).map((s) => row(s, k)).sort((a, b) => b.netWorth - a.netWorth);
    return Object.fromEntries(rows.map((r, i) => [r.id, i + 1]));
  };
  const cur = studs.map((s) => row(s, week)).sort((a, b) => b.netWorth - a.netWorth).map((r, i) => ({ ...r, rank: i + 1 }));
  const prevRank = week > 1 ? rankAt(week - 1) : {};
  for (const r of cur) r.progress = prevRank[r.id] ? prevRank[r.id] - r.rank : 0;
  const bestOf = (list, key) => list.length ? list.slice().sort((a, b) => b[key] - a[key])[0] : null;
  const awards = cur.length ? [
    { type: 'growth', title: 'Didžiausias augimas', who: bestOf(cur, 'delta')?.nickname, value: bestOf(cur, 'delta')?.delta, unit: '€' },
    { type: 'strategy', title: 'Geriausia strategija', who: bestOf(cur, 'score')?.nickname, value: null, unit: '' },
    { type: 'progress', title: 'Didžiausia pažanga', who: bestOf(cur, 'progress')?.nickname, value: bestOf(cur, 'progress')?.progress, unit: 'vietos' },
  ] : [];
  return { week, byWealth: cur, byStrategy: cur.slice().sort((a, b) => b.score - a.score).map((r, i) => ({ ...r, rank: i + 1 })), awards };
}

function quizScore(kind, answers) {
  const qs = QUIZ[kind];
  if (!Array.isArray(answers) || answers.length !== qs.length) throw bad('Atsakyk į visus klausimus.');
  const byTopic = {}; let right = 0;
  qs.forEach((q, i) => {
    const a = Number(answers[i]);
    if (!Number.isInteger(a) || a < 0 || a >= q.o.length) throw bad('Neteisingas atsakymas.');
    const ok = a === q.a; byTopic[q.topic] = ok ? 100 : 0; if (ok) right++;
  });
  return { right, total: qs.length, pct: Math.round((100 * right) / qs.length), byTopic };
}
const quizPublic = (kind) => QUIZ[kind].map(({ topic, q, o }) => ({ topic, q, o }));

// ---------- API ----------
const routes = [];
const route = (method, pattern, fn) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn });

route('POST', '/api/teacher/register', (req, body) => {
  limit('reg:' + req.ip, 10, 3600e3);
  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Neteisingas el. paštas.');
  if (String(body.password || '').length < 8) throw bad('Slaptažodis turi būti bent 8 simbolių.');
  if (Object.values(db.teachers).some((t) => t.email === email)) throw bad('Toks el. paštas jau registruotas.');
  const name = String(body.name || '').replace(/[<>]/g, '').trim().slice(0, 60);
  if (!name) throw bad('Įvesk vardą.');
  const t = { id: rid(), email, name, school: String(body.school || '').replace(/[<>]/g, '').trim().slice(0, 80), pw: hashPw(body.password) };
  db.teachers[t.id] = t;
  const tok = rid(24); db.sessions[sha(tok)] = { role: 'teacher', id: t.id };
  audit(t.id, 'register', t.id); save();
  return { token: tok, name: t.name };
});
route('POST', '/api/teacher/login', (req, body) => {
  limit('login:' + req.ip, 10, 600e3);
  const email = String(body.email || '').trim().toLowerCase();
  const t = Object.values(db.teachers).find((x) => x.email === email);
  if (!t || !checkPw(String(body.password || ''), t.pw)) throw deny('Neteisingas el. paštas arba slaptažodis.');
  const tok = rid(24); db.sessions[sha(tok)] = { role: 'teacher', id: t.id }; save();
  return { token: tok, name: t.name };
});
route('GET', '/api/teacher/classes', (req) => {
  const t = authTeacher(req);
  return Object.values(db.classes).filter((c) => c.teacherId === t.id).map((c) => ({ id: c.id, name: c.name, grade: c.grade, code: c.code, week: c.week, revealed: c.revealed, status: c.status, students: studentsOf(c).length }));
});
route('POST', '/api/teacher/classes', (req, body) => {
  const t = authTeacher(req);
  const name = String(body.name || '').replace(/[<>]/g, '').trim().slice(0, 30);
  if (!name) throw bad('Įvesk klasės pavadinimą.');
  const grade = Math.max(1, Math.min(12, Number(body.grade) || 10));
  const c = { id: rid(), teacherId: t.id, name, grade, code: newCode(), seed: rid(8), week: 0, revealed: 0, status: 'draft', createdAt: new Date().toISOString() };
  db.classes[c.id] = c; audit(t.id, 'class.create', c.id); save();
  return { id: c.id, code: c.code };
});
function ownClass(req, id) {
  const t = authTeacher(req);
  const c = db.classes[id];
  if (!c || c.teacherId !== t.id) throw new HttpError(404, 'Klasė nerasta.');
  return c;
}
route('POST', '/api/teacher/classes/:id/start', (req, _b, p) => {
  const c = ownClass(req, p.id);
  if (c.status !== 'draft') throw bad('Sezonas jau pradėtas.');
  c.week = 1; c.status = 'live'; audit(c.teacherId, 'start', c.id); save(); return { ok: true };
});
route('POST', '/api/teacher/classes/:id/reveal', (req, _b, p) => { revealWeek(ownClass(req, p.id)); return { ok: true }; });
route('POST', '/api/teacher/classes/:id/next', (req, _b, p) => {
  const c = ownClass(req, p.id);
  if (c.revealed < c.week) throw bad('Pirmiausia atskleisk šios savaitės rezultatus.');
  if (c.week >= CONFIG.WEEKS) throw bad('Sezonas baigtas.');
  c.week += 1; audit(c.teacherId, 'next', c.id + ':' + c.week); save(); return { ok: true };
});
route('DELETE', '/api/teacher/classes/:id', (req, _b, p) => {
  const c = ownClass(req, p.id);
  for (const s of studentsOf(c)) { delete db.students[s.id]; for (const [k, v] of Object.entries(db.sessions)) if (v.id === s.id) delete db.sessions[k]; }
  delete db.classes[c.id]; audit(c.teacherId, 'class.delete', c.id); save(); return { ok: true };
});
route('GET', '/api/teacher/classes/:id', (req, _b, p) => {
  const c = ownClass(req, p.id);
  const studs = studentsOf(c);
  const season = c.week ? c.week : 0;
  const locked = studs.filter((s) => s.subs[c.week]).length;
  const totalReports = studs.reduce((t, s) => t + (s.state ? s.state.history.length : 0), 0);
  const completion = studs.length && c.revealed ? Math.round((100 * totalReports) / (studs.length * c.revealed)) : 0;
  const pre = studs.filter((s) => s.quiz?.pre), post = studs.filter((s) => s.quiz?.post);
  const avg = (list, kind, f) => (list.length ? Math.round(list.reduce((t, s) => t + f(s.quiz[kind]), 0) / list.length) : null);
  const both = studs.filter((s) => s.quiz?.pre && s.quiz?.post);
  const topics = ['budget', 'saving', 'invest', 'risk'].map((k) => ({
    key: k,
    pre: avg(pre, 'pre', (q) => q.byTopic[k] ?? 0),
    post: avg(post, 'post', (q) => q.byTopic[k] ?? 0),
  }));
  const rk = c.revealed ? rankings(c) : null;
  return {
    id: c.id, name: c.name, grade: c.grade, code: c.code, week: c.week, revealed: c.revealed, status: c.status,
    stats: {
      students: studs.length, lockedThisWeek: c.week ? locked : 0, completion,
      knowledgeChange: both.length ? Math.round(both.reduce((t, s) => t + (s.quiz.post.pct - s.quiz.pre.pct), 0) / both.length) : null,
      quizPre: pre.length, quizPost: post.length, topics,
    },
    students: studs.map((s) => {
      const h = s.state?.history || []; const last = h[h.length - 1];
      return { id: s.id, nickname: s.nickname, locked: !!s.subs[c.week], weeksPlayed: h.length, netWorth: last ? last.netWorth : null, score: s.state ? strategyScore(s.state) : null, forcedSales: s.state?.forcedSales || 0, debt: last ? last.state.debt : 0, secondChances: s.state?.secondChances || 0, pre: s.quiz?.pre?.pct ?? null, post: s.quiz?.post?.pct ?? null };
    }).sort((a, b) => a.nickname.localeCompare(b.nickname, 'lt')),
    rankings: rk, lessons: LESSONS,
  };
});
route('GET', '/api/teacher/classes/:id/export.csv', (req, _b, p) => {
  const c = ownClass(req, p.id);
  const q = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
  const head = ['Slapyvardis', 'Savaitė', 'Pasirinkimas', 'Santaupos %', 'Investicijos %', 'Verslas %', 'Rezervas %', 'Pokytis €', 'Grynoji vertė €', 'Priverstiniai pardavimai', 'Skola €', 'Automatinis'];
  const rows = [head.map(q).join(',')];
  for (const s of studentsOf(c).sort((a, b) => a.nickname.localeCompare(b.nickname, 'lt'))) {
    for (const r of s.state?.history || []) {
      rows.push([s.nickname, r.week, r.choice, r.alloc.sav, r.alloc.inv, r.alloc.bus, r.alloc.res, r.delta, r.netWorth, r.forced, r.state.debt, r.auto ? 'taip' : 'ne'].map(q).join(','));
    }
  }
  return { __raw: '\ufeff' + rows.join('\r\n'), type: 'text/csv; charset=utf-8', filename: `vemak-${c.name}.csv` };
});

// ----- pilot requests from the landing page -----
route('POST', '/api/pilot', (req, body) => {
  limit('pilot:' + req.ip, 5, 3600e3);
  const clean = (v, n) => String(v || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, n);
  const email = clean(body.email, 120).toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw bad('Neteisingas el. paštas.');
  const name = clean(body.name, 80), school = clean(body.school, 120);
  if (!name || !school) throw bad('Įvesk vardą ir mokyklą.');
  if (body.consent !== true) throw bad('Reikia sutikimo, kad galėtume susisiekti.');
  db.pilots = db.pilots || [];
  db.pilots.push({ at: new Date().toISOString(), name, email, school, role: clean(body.role, 40), classes: clean(body.classes, 10), message: clean(body.message, 500) });
  save();
  return { ok: true };
});

// ----- student -----
route('POST', '/api/join', (req, body) => {
  limit('join:' + req.ip, 30, 600e3);
  const code = String(body.code || '').trim().toUpperCase();
  const c = Object.values(db.classes).find((x) => x.code === code);
  if (!c) throw new HttpError(404, 'Klasės kodas nerastas.');
  if (c.status === 'done') throw bad('Šis sezonas jau baigtas.');
  const nickname = cleanNick(body.nickname);
  if (studentsOf(c).some((s) => s.nickname.toLowerCase() === nickname.toLowerCase())) throw bad('Toks slapyvardis jau naudojamas klasėje.');
  if (studentsOf(c).length >= 60) throw bad('Klasė pilna.');
  const avatar = Math.max(0, Math.min(5, Number(body.avatar) || 0));
  const st = { id: rid(), classId: c.id, nickname, avatar, subs: {}, quiz: {}, state: newState(), mentor: {}, rewards: createRewards(), joinedAt: new Date().toISOString() };
  db.students[st.id] = st;
  const tok = rid(24); db.sessions[sha(tok)] = { role: 'student', id: st.id }; save();
  return { token: tok };
});
route('GET', '/api/me', (req) => {
  const st = authStudent(req); const c = classOf(st);
  const s = ensureState(st);
  const cw = c.week;
  const revealed = c.revealed;
  const reports = s.history.slice(0, revealed);
  const mySub = st.subs[cw] || null;
  const res = {
    me: { nickname: st.nickname, avatar: st.avatar },
    cls: { name: c.name, week: cw, revealed, status: c.status, weeks: CONFIG.WEEKS },
    needsPre: !st.quiz.pre, needsPost: c.status === 'done' && !st.quiz.post,
    quiz: !st.quiz.pre ? quizPublic('pre') : (c.status === 'done' && !st.quiz.post ? quizPublic('post') : null),
    quizResult: st.quiz.post ? { pre: st.quiz.pre?.pct, post: st.quiz.post.pct, byTopic: { pre: st.quiz.pre?.byTopic, post: st.quiz.post.byTopic } } : null,
    locked: !!mySub && cw > revealed,
    myPending: cw > revealed && mySub ? { choice: mySub.choice, alloc: mySub.alloc } : null,
    state: reports.length ? reports[reports.length - 1].state : { reserve: 0, savings: 0, business: 0, debt: 0, level: 1, invest: { etf: 0, tech: 0, green: 0, reit: 0, gold: 0 } },
    netWorth: reports.length ? reports[reports.length - 1].netWorth : 0,
    shield: !!s.shield && revealed >= 3, wantsDelta: reports.length ? s.wantsDelta : 0,
    bankrupt: revealed ? !!s.bankrupt : false,
    reports,
    rewards: { ...st.rewards, level: levelForXp(st.rewards?.xp || 0) },
    revealProgress: c.week > 0 ? { locked: studentsOf(c).filter((x) => x.subs[c.week] && !x.subs[c.week].auto).length, total: studentsOf(c).length, revealed: c.revealed >= c.week } : { locked: 0, total: studentsOf(c).length, revealed: false },
    mentor: revealed ? st.mentor[revealed] : null,
  };
  if (revealed) res.rankings = rankings(c);
  return res;
});
route('POST', '/api/me/quiz', (req, body) => {
  const st = authStudent(req); const c = classOf(st);
  const kind = body.kind;
  if (kind !== 'pre' && kind !== 'post') throw bad('Neteisingas testas.');
  if (st.quiz[kind]) throw bad('Testas jau išspręstas.');
  if (kind === 'post' && c.status !== 'done') throw bad('Baigiamasis testas dar neatidarytas.');
  st.quiz[kind] = quizScore(kind, body.answers);
  if (kind === 'post' && st.quiz.pre && st.quiz.post.pct > st.quiz.pre.pct) {
    st.rewards = st.rewards || createRewards();
    st.rewards = awardOnce(st.rewards, 'knowledge-improvement', 100);
    st.rewards.level = levelForXp(st.rewards.xp);
  }
  save();
  return { ok: true, pct: st.quiz[kind].pct };
});
route('POST', '/api/me/lock', (req, body) => {
  const st = authStudent(req); const c = classOf(st);
  if (c.week < 1) throw bad('Sezonas dar nepradėtas.');
  if (c.revealed >= c.week) throw bad('Ši savaitė jau baigta.');
  if (st.subs[c.week]) throw bad('Strategija jau užrakinta.');
  const opt = CONTENT[c.week - 1].options.find((o) => o.key === body.choice);
  if (!opt) throw bad('Nežinomas pasirinkimas.');
  const a = body.alloc || {};
  const alloc = { sav: Number(a.sav), inv: Number(a.inv), bus: Number(a.bus), res: Number(a.res), mix: a.mix && typeof a.mix === 'object' ? Object.fromEntries(['etf', 'tech', 'green', 'reit', 'gold'].map((k) => [k, Number(a.mix[k]) || 0])) : defaultAlloc().mix, upgrade: !!a.upgrade };
  const err = validateAlloc(alloc);
  if (err) throw bad(err);
  st.subs[c.week] = { choice: opt.key, alloc, lockedAt: new Date().toISOString() }; save();
  return { ok: true };
});
route('GET', '/api/me/strategies', (req) => {
  // Secrecy rule enforced here: only weeks that the teacher has revealed.
  const st = authStudent(req); const c = classOf(st);
  const out = {};
  for (let w = 1; w <= c.revealed; w++) {
    out[w] = studentsOf(c).filter((s) => s.subs[w]).map((s) => ({ nickname: s.nickname, mine: s.id === st.id, choice: s.subs[w].choice, alloc: s.subs[w].alloc, auto: !!s.subs[w].auto }));
  }
  return out;
});

// ---------- HTTP ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const PAGES = { '/': 'index.html', '/play': 'play.html', '/teacher': 'teacher.html' };
const SEC = {
  'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on('data', (c) => { size += c.length; if (size > 100_000) { reject(new HttpError(413, 'Per didelė užklausa.')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); } catch { reject(bad('Neteisingas JSON.')); } });
  });
}

export const server = http.createServer(async (req, res) => {
  try {
    req.ip = req.socket.remoteAddress;
    const url = new URL(req.url, 'http://x');
    if (url.pathname.startsWith('/api/')) {
      const body = req.method === 'GET' || req.method === 'DELETE' ? {} : await readBody(req);
      for (const r of routes) {
        if (r.method !== req.method) continue;
        const m = r.re.exec(url.pathname);
        if (!m) continue;
        const out = r.fn(req, body, m.groups || {});
        if (out && out.__raw !== undefined) {
          res.writeHead(200, { ...SEC, 'Content-Type': out.type, 'Content-Disposition': `attachment; filename="${encodeURIComponent(out.filename)}"`, 'Cache-Control': 'no-store' });
          return res.end(out.__raw);
        }
        res.writeHead(200, { ...SEC, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        return res.end(JSON.stringify(out));
      }
      throw new HttpError(404, 'Nerasta.');
    }
    if (req.method !== 'GET') throw new HttpError(405, 'Neleidžiamas metodas.');
    const rel = PAGES[url.pathname] || decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.normalize(path.join(PUBLIC, rel));
    if (!file.startsWith(PUBLIC + path.sep)) throw new HttpError(403, 'Draudžiama.');
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new HttpError(404, 'Puslapis nerastas.');
    res.writeHead(200, { ...SEC, 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    const status = e.status || 500;
    if (status === 500) console.error(e);
    res.writeHead(status, { ...SEC, 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: status === 500 ? 'Serverio klaida.' : e.message }));
  }
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, '0.0.0.0', () => console.log(`VEMAK running on http://localhost:${PORT}`));
}
export { saveNow };
