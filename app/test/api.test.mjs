// API end-to-end test. Starts the server on a random port with a temp data dir.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { WEEKS } from '../public/content.js';

process.env.VEMAK_DATA = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'vemak-'));
const { server } = await import('../server.mjs');
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}`;

async function call(method, url, body, token) {
  const r = await fetch(base + url, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, body: ct.includes('json') ? await r.json() : await r.text(), headers: r.headers };
}
let n = 0; const ok = (m) => console.log('ok  ', m, ++n && '');

// teacher
let r = await call('POST', '/api/teacher/register', { email: 'm@school.lt', password: 'short', name: 'Rūta' });
assert.equal(r.status, 400); ok('weak password rejected');
r = await call('POST', '/api/teacher/register', { email: 'm@school.lt', password: 'longenough1', name: 'Rūta', school: 'Vilniaus gimnazija' });
assert.equal(r.status, 200); const T = r.body.token; ok('teacher registered');
r = await call('POST', '/api/teacher/login', { email: 'm@school.lt', password: 'wrong-pass' });
assert.equal(r.status, 401); ok('wrong password rejected');
r = await call('GET', '/api/teacher/classes'); assert.equal(r.status, 401); ok('teacher API needs auth');

r = await call('POST', '/api/teacher/classes', { name: '10A', grade: 10 }, T);
const CID = r.body.id, CODE = r.body.code; assert.match(CODE, /^[A-Z2-9]{6}$/); ok('class created, code ' + CODE);

// students
const join = async (nick) => (await call('POST', '/api/join', { code: CODE.toLowerCase(), nickname: nick, avatar: 1 }));
const sA = (await join('Lukas')).body.token, sB = (await join('Ieva')).body.token, sC = (await join('Tomas')).body.token;
assert.equal((await join('lukas')).status, 400); ok('duplicate nickname rejected');
assert.equal((await call('POST', '/api/join', { code: 'XXXXXX', nickname: 'Z1' })).status, 404); ok('wrong code rejected');
assert.equal((await join('<b>x')).status, 200); ok('html chars stripped from nickname'); 

// pre quiz
r = await call('GET', '/api/me', null, sA);
assert.equal(r.body.needsPre, true); assert.equal(r.body.quiz.length, 8);
assert.ok(r.body.quiz.every((q) => q.topic && q.q && q.o.length === 4));
assert.ok(!JSON.stringify(r.body.quiz).includes('"a":'), 'quiz answers must not leak'); ok('pre-quiz serves eight varied questions without answers');
for (const tok of [sA, sB, sC]) assert.equal((await call('POST', '/api/me/quiz', { kind: 'pre', answers: [1, 0, 0, 0, 1, 0, 2, 0] }, tok)).body.pct, 100);
assert.equal((await call('POST', '/api/me/quiz', { kind: 'pre', answers: [0, 0, 0, 0] }, sA)).status, 400); ok('quiz can only be taken once');

// before start
assert.equal((await call('POST', '/api/me/lock', { choice: 'buy', alloc: { sav: 25, inv: 25, bus: 25, res: 25 } }, sA)).status, 400); ok('cannot lock before season starts');
assert.equal((await call('POST', `/api/teacher/classes/${CID}/start`, null, T)).status, 200);

// other teacher cannot touch the class
const T2 = (await call('POST', '/api/teacher/register', { email: 'x@school.lt', password: 'longenough1', name: 'Kita' })).body.token;
assert.equal((await call('GET', `/api/teacher/classes/${CID}`, null, T2)).status, 404); ok("another teacher cannot see this class");

// week 1 — pasirinkimų raktai imami iš klasės sezono situacijos, nes sezonai skiriasi
const sitOf = async (tok) => (await call('GET', '/api/me', null, tok)).body.cls.situation;
const s1 = await sitOf(sA);
assert.ok(s1 && s1.options.length >= 3, 'season situation is served to the student');
const K1 = s1.options[0].key, K2 = s1.options[1].key;
const good = { sav: 30, inv: 25, bus: 25, res: 20 };
assert.equal((await call('POST', '/api/me/lock', { choice: K1, alloc: { ...good, res: 10 } }, sA)).status, 400); ok('alloc must total 100');
assert.equal((await call('POST', '/api/me/lock', { choice: 'hack', alloc: good }, sA)).status, 400); ok('unknown choice rejected');
assert.equal((await call('POST', '/api/me/lock', { choice: K1, alloc: good }, sA)).status, 200);
assert.equal((await call('POST', '/api/me/lock', { choice: K2, alloc: good }, sA)).status, 400); ok('lock is final');
assert.equal((await call('POST', '/api/me/lock', { choice: K2, alloc: { sav: 0, inv: 0, bus: 0, res: 100 } }, sB)).status, 200);
// student C does not submit -> auto default

r = await call('GET', '/api/me/strategies', null, sA);
assert.deepEqual(r.body, {}); ok('others strategies hidden before reveal');
assert.equal((await call('POST', `/api/teacher/classes/${CID}/next`, null, T)).status, 400); ok('cannot advance before reveal');
assert.equal((await call('POST', `/api/teacher/classes/${CID}/reveal`, null, T)).status, 200);
assert.equal((await call('POST', `/api/teacher/classes/${CID}/reveal`, null, T)).status, 400); ok('double reveal blocked');

r = await call('GET', '/api/me', null, sA);
assert.equal(r.body.reports.length, 1); assert.ok(r.body.mentor.points.length > 0); assert.ok(r.body.rankings.byWealth.length === 4);
assert.equal(r.body.rewards.xp, 300); assert.equal(r.body.rewards.level, 2); assert.ok(r.body.rewards.cosmetics.includes('Pradžios ženklelis')); assert.ok(Array.isArray(r.body.rewards.trophies));
assert.deepEqual(r.body.revealProgress, { locked: 2, total: 4, revealed: true });
assert.ok(!JSON.stringify(r.body.revealProgress).includes('alloc')); ok('persistent XP, level, trophies, cosmetic and reveal progress');
const c = await call('GET', '/api/me', null, sC); assert.equal(c.body.reports[0].auto, true); ok('non-submitter gets default strategy (auto)');
r = await call('GET', '/api/me/strategies', null, sA); assert.equal(r.body[1].length, 4); ok('strategies visible after reveal');

// finish season
for (let w = 2; w <= 6; w++) {
  assert.equal((await call('POST', `/api/teacher/classes/${CID}/next`, null, T)).status, 200);
  const sw = await sitOf(sA);
  assert.equal((await call('POST', '/api/me/lock', { choice: sw.options[0].key, alloc: good }, sA)).status, 200); // Lukas plays; the others fall back to the default
  assert.equal((await call('POST', `/api/teacher/classes/${CID}/reveal`, null, T)).status, 200);
}
ok('6 weeks revealed');
assert.equal((await call('POST', `/api/teacher/classes/${CID}/next`, null, T)).status, 400); ok('cannot go beyond week 6');
r = await call('GET', '/api/me', null, sA);
assert.equal(r.body.needsPost, true); assert.equal(r.body.cls.status, 'done');
assert.equal((await call('POST', '/api/me/quiz', { kind: 'post', answers: [1, 0, 2, 0, 0, 0, 0, 0] }, sA)).body.pct, 100); ok('post-test works');
await call('POST', '/api/me/quiz', { kind: 'post', answers: [0, 0, 1, 0, 0, 0, 0, 0] }, sB);

r = await call('GET', `/api/teacher/classes/${CID}`, null, T);
assert.equal(r.body.stats.students, 4); assert.equal(r.body.stats.completion, 100);
assert.equal(typeof r.body.stats.knowledgeChange, 'number'); assert.ok(r.body.rankings.awards.length === 3);
console.log('     knowledgeChange =', r.body.stats.knowledgeChange, ', completion =', r.body.stats.completion);
ok('teacher dashboard stats computed from real data');

r = await call('GET', `/api/teacher/classes/${CID}/export.csv`, null, T);
assert.equal(r.status, 200); assert.ok(r.body.includes('Slapyvardis')); assert.ok(r.body.split('\r\n').length > 20);
assert.ok(!r.body.includes('<b>'), 'sanitised'); ok('CSV export (' + r.body.split('\r\n').length + ' rows)');

assert.equal((await call('POST', '/api/join', { code: CODE, nickname: 'Late' })).status, 400); ok('cannot join a finished season');
assert.equal((await call('DELETE', `/api/teacher/classes/${CID}`, null, T)).status, 200);
assert.equal((await call('GET', '/api/me', null, sA)).status, 401); ok('deleting a class removes student data and sessions');

r = await fetch(base + '/../../etc/passwd'); assert.ok([403, 404].includes(r.status)); ok('path traversal blocked');
r = await fetch(base + '/server.mjs'); assert.equal(r.status, 404); ok('server source not served');

console.log(`\nAPI: ${n} checks passed`);
server.close(); process.exit(0);
