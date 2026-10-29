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
const BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.2 17.4h5.6M10.2 20.6h3.6"/><path d="M12 3.4a5.6 5.6 0 0 0-3.3 10.1c.5.4.8 1 .8 1.6v.3h5v-.3c0-.6.3-1.2.8-1.6A5.6 5.6 0 0 0 12 3.4Z"/></svg>';

// Klausimų laukelis po pamokos: atsakymus sudaro serveris iš mokinio skaičių.
export function askBlock(suggestions = []) {
  const chips = (suggestions || []).slice(0, 4)
    .map((s) => `<button type="button" class="ask-chip">${esc(s)}</button>`).join('');
  return `<div class="ask">`
    + `<div class="ask-head"><b>Neaišku? Paklausk mentoriaus</b>`
    + `<p class="muted">Atsakymą sudaro taisyklės iš tavo šios savaitės skaičių – jis nėra sugalvotas ir nėra finansinė rekomendacija.</p></div>`
    + `<div class="ask-row"><input id="ask-q" type="text" maxlength="240" autocomplete="off" placeholder="Pvz., kodėl praradau pinigų?" aria-label="Tavo klausimas mentoriiu">`
    + `<button class="btn" type="button" id="ask-go">Klausti</button></div>`
    + (chips ? `<div class="ask-chips">${chips}</div>` : '')
    + `<div class="ask-answer" id="ask-answer" aria-live="polite" hidden></div>`
    + `</div>`;
}

export function lessonBlock(lesson, steps = [], suggestions = []) {
const rows = (steps || []).map((s) => `<li><span class="lesson-step-copy"><span>${esc(s.text)}</span>${s.comment ? `<small class="lesson-comment">${esc(s.comment)}</small>` : ''}</span>`
    + (s.amount != null ? `<b class="${s.amount > 0 ? 'pos' : s.amount < 0 ? 'neg' : 'muted'}">${eur(s.amount, true)}</b>` : '')
    + '</li>').join('');
  return `<div class="lesson">`
    + `<div class="lesson-head"><span class="lesson-icon">${BULB}</span><div><b>Pamoka</b>`
    + `<p class="muted">${esc(lesson || '')}</p></div></div>`
    + (rows ? `<div class="lesson-title">Kas įvyko žingsnis po žingsnio</div><ol class="lesson-steps">${rows}</ol>` : '')
    + (suggestions && suggestions.length ? askBlock(suggestions) : '')
    + '</div>';
}

// Suriša klausimų laukelį. getContext() grąžina savaitės skaičius atsakymui.
export function wireAsk(getContext, suggestions = []) {
  const q = $('#ask-q'); const go = $('#ask-go'); const out = $('#ask-answer');
  if (!q || !go || !out) return;
  let busy = false;
  const send = async (text) => {
    const question = String(text == null ? q.value : text).trim();
    if (!question || busy) return;
    q.value = question; busy = true; go.disabled = true;
    out.hidden = false; out.className = 'ask-answer pending';
    out.innerHTML = '<span class="muted">Mentorius tikrina tavo skaičius…</span>';
    try {
      const ctx = typeof getContext === 'function' ? getContext() : {};
      const r = await api('POST', '/api/ask', { question, context: ctx });
      out.className = 'ask-answer';
      out.innerHTML = `<p>${esc(r.answer || '')}</p>`
        + (r.grounded ? `<small class="muted">${esc(r.grounded)}</small>` : '');
    } catch (e) {
      out.className = 'ask-answer';
      out.innerHTML = `<p class="neg">${esc(e && e.message ? e.message : 'Nepavyko atsakyti. Bandyk dar kartą.')}</p>`;
    } finally { busy = false; go.disabled = false; }
  };
  go.addEventListener('click', () => send());
  q.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
  $$('.ask-chip').forEach((b) => b.addEventListener('click', () => send(b.textContent)));
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
