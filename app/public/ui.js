// ui.js — tiny shared helpers. All dynamic text goes through esc() to prevent XSS (nicknames are user input).
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

export const eur = (n, sign = false) => {
  const v = Math.round(Number(n) || 0);
  const s = Math.abs(v).toLocaleString('lt-LT').replace(/\u00a0/g, ' ');
  return (sign ? (v > 0 ? '+' : v < 0 ? '−' : '') : v < 0 ? '−' : '') + s + ' €';
};
export const pct = (x, d = 1) => (x >= 0 ? '+' : '−') + Math.abs(x * 100).toFixed(d).replace('.', ',') + ' %';

export async function api(method, url, body, token) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* not JSON */ }
  if (!res.ok) { const e = new Error((data && data.error) || 'Ryšio klaida.'); e.status = res.status; throw e; }
  return data;
}

// „Pamoka" blokas: mokymo tekstas + žingsnis po žingsnio įvykių seka.
// Naudoja ir žaidimo rezultatų ekranas (engine.js), ir anoniminis demo (demo.js).
export function lessonBlock(lesson, steps = []) {
  const rows = (steps || []).map((s) => `<li><span>${esc(s.text)}</span>`
    + (s.amount != null ? `<b class="${s.amount > 0 ? 'pos' : s.amount < 0 ? 'neg' : 'muted'}">${eur(s.amount, true)}</b>` : '')
    + '</li>').join('');
  return `<div class="lesson">`
    + `<div class="lesson-head"><span class="lesson-icon">💡</span><div><b>Pamoka</b>`
    + `<p class="muted">${esc(lesson || '')}</p></div></div>`
    + (rows ? `<div class="lesson-title">Kas įvyko žingsnis po žingsnio</div><ol class="lesson-steps">${rows}</ol>` : '')
    + '</div>';
}

export function toast(msg, kind = 'info') {
  let box = $('#toasts');
  if (!box) { box = document.createElement('div'); box.id = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
  const t = document.createElement('div');
  t.className = 'toast ' + kind; t.textContent = msg; box.appendChild(t);
  setTimeout(() => t.remove(), 4200);
}

export const AVATARS = ['🦊', '🐼', '🦉', '🐙', '🦁', '🐸'];
export const TONE = { red: '#ff6b5b', green: '#19b394', blue: '#3b82f6', purple: '#8b5cf6', gray: '#94a3b8' };

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
