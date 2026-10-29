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
export function wireTheme(root) {
  const btn = (root || document).querySelector('#themeToggle');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => import('./theme.js').then((m) => m.toggleTheme()));
}

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

// Avatarai – piešiami figūromis, ne emoji, kad veiktų ir be emoji šrifto.
const av = (label, inner) => `<svg class="av" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${inner}</svg>`;
export const AVATARS = [
  av('Lapė', '<path d="M4.6 4.2 7.4 8"/><path d="M19.4 4.2 16.6 8"/><path d="M12 7.4c-3.9 0-6.4 2.6-6.4 6.2 0 3.3 2.5 5.4 6.4 5.4s6.4-2.1 6.4-5.4c0-3.6-2.5-6.2-6.4-6.2Z"/><circle cx="9.6" cy="13" r=".85" fill="currentColor"/><circle cx="14.4" cy="13" r=".85" fill="currentColor"/>'),
  av('Panda', '<circle cx="6.4" cy="7" r="2.6"/><circle cx="17.6" cy="7" r="2.6"/><circle cx="12" cy="13" r="7.2"/><ellipse cx="9.2" cy="11.6" rx="1.9" ry="2.3" fill="currentColor" opacity=".28"/><ellipse cx="14.8" cy="11.6" rx="1.9" ry="2.3" fill="currentColor" opacity=".28"/><circle cx="12" cy="16.2" r="1.2" fill="currentColor"/>'),
  av('Pelėda', '<path d="M4.6 5.4 7.8 8.2"/><path d="M19.4 5.4 16.2 8.2"/><path d="M12 6.8c-3.7 0-6.3 2.7-6.3 6.6 0 3.3 2.5 5.2 6.3 5.2s6.3-1.9 6.3-5.2c0-3.9-2.6-6.6-6.3-6.6Z"/><circle cx="9.3" cy="12.4" r="2.1"/><circle cx="14.7" cy="12.4" r="2.1"/><path d="M12 15.4 10.6 17h2.8Z" fill="currentColor"/>'),
  av('Aštuonkojis', '<path d="M5.4 13.2a6.6 6.6 0 0 1 13.2 0"/><circle cx="9.4" cy="11.4" r=".9" fill="currentColor"/><circle cx="14.6" cy="11.4" r=".9" fill="currentColor"/><path d="M5.6 14.4c0 2.4-.8 3.6-1.8 4.4"/><path d="M9.2 15.4c0 1.9-.3 2.8-.9 3.6"/><path d="M14.8 15.4c0 1.9.3 2.8.9 3.6"/><path d="M18.4 14.4c0 2.4.8 3.6 1.8 4.4"/>'),
  av('Liūtas', '<circle cx="12" cy="12.4" r="4.6"/><path d="M12 4.4v2M12 18.4v2M4.4 12.4h2M17.6 12.4h2M6.7 7.1l1.5 1.5M15.8 16.2l1.5 1.5M17.3 7.1l-1.5 1.5M8.2 16.2l-1.5 1.5"/><circle cx="10.3" cy="11.6" r=".8" fill="currentColor"/><circle cx="13.7" cy="11.6" r=".8" fill="currentColor"/>'),
  av('Varlė', '<circle cx="8.4" cy="8.6" r="2.4"/><circle cx="15.6" cy="8.6" r="2.4"/><path d="M12 8.4c-4.1 0-7 2.4-7 5.6 0 2.5 2.6 4 7 4s7-1.5 7-4c0-3.2-2.9-5.6-7-5.6Z"/><path d="M8.6 15.4c1 .9 5.8.9 6.8 0"/>'),
];
export const TONE = { red: '#ff6b5e', green: '#1ae87f', blue: '#1ae87f', purple: '#0aa85c', gray: '#8aa094' };
// Mažos ikonos – SVG, kad veiktų be emoji šrifto.
const ico = (label, inner) => `<svg class="av" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${label}">${inner}</svg>`;
export const ICO = {
  coin: ico('Biudžetas', '<ellipse cx="12" cy="7.6" rx="6.4" ry="2.8"/><path d="M5.6 7.6v8.8c0 1.5 2.9 2.8 6.4 2.8s6.4-1.3 6.4-2.8V7.6"/><path d="M5.6 12c0 1.5 2.9 2.8 6.4 2.8s6.4-1.3 6.4-2.8"/>'),
  shield: ico('Rezervas', '<path d="M12 3.4 19 6v5.2c0 4.3-2.8 7.7-7 9.6-4.2-1.9-7-5.3-7-9.6V6Z"/>'),
  trend: ico('Investavimas', '<path d="M4 17.2 9.4 11l3.6 3.4L20 6.6"/><path d="M15.2 6.6H20v4.8"/>'),
  bolt: ico('Rizika', '<path d="M13.4 3 6 13.4h4.8L10.6 21 18 10.6h-4.8Z"/>'),
  warn: ico('Dėmesio', '<path d="M12 4.4 21 19.4H3Z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".9" fill="currentColor"/>'),
  home: ico('Namai', '<path d="M4.4 11 12 4.6l7.6 6.4"/><path d="M6.2 10.4v8.8h11.6v-8.8"/><path d="M10.2 19.2v-5h3.6v5"/>'),
  bank: ico('Bankas', '<path d="M3.6 9.6 12 4.4l8.4 5.2"/><path d="M5.6 9.6v8.6M9.6 9.6v8.6M14.4 9.6v8.6M18.4 9.6v8.6"/><path d="M3.6 18.8h16.8"/>'),
  work: ico('Darbovietė', '<rect x="3.4" y="7.4" width="17.2" height="12" rx="2"/><path d="M9 7.4V5.6h6v1.8"/><path d="M3.4 12.6h17.2"/>'),
  cafe: ico('Kavos baras', '<path d="M5.6 5.6h11.2l-1.2 12.2a1.6 1.6 0 0 1-1.6 1.4H8.4a1.6 1.6 0 0 1-1.6-1.4Z"/><path d="M4 5.6h13.6"/><path d="M8.6 9.6v6M12 9.6v6"/>'),
  compass: ico('Mentorius', '<circle cx="12" cy="12" r="8.4"/><path d="M15.2 8.8 13.4 13.4 8.8 15.2l1.8-4.6Z"/>'),
  lock: ico('Užrakinta', '<rect x="5.6" y="10.4" width="12.8" height="9.2" rx="2"/><path d="M8.6 10.4V8.2a3.4 3.4 0 0 1 6.8 0v2.2"/>'),
  news: ico('Naujiena', '<path d="M4.4 6.4h11.2v11.2H6a1.6 1.6 0 0 1-1.6-1.6Z"/><path d="M15.6 9.6h2.8a1.6 1.6 0 0 1 1.6 1.6v5.2a1.6 1.6 0 0 1-1.6 1.6h-2.8"/><path d="M7.2 9.6h5.6M7.2 12.4h5.6M7.2 15.2h3.6"/>'),
  telescope: ico('Kas toliau', '<path d="M4.6 13.2 15.4 6l2.2 3.6-10.8 7.2Z"/><path d="M17.6 9.6 20 10.8"/><path d="M9.6 15.6 8.2 20M12.4 13.8l2.6 5.6"/>'),
  sprout: ico('Antra galimybė', '<path d="M12 19.4v-6.6"/><path d="M12 12.8c0-3.2-2.4-5.6-5.6-5.6 0 3.2 2.4 5.6 5.6 5.6Z"/><path d="M12 12.8c0-3.2 2.4-5.6 5.6-5.6 0 3.2-2.4 5.6-5.6 5.6Z"/>'),
};
export const TROPHY = av('Apdovanojimas', '<path d="M7.4 4.4h9.2v3.4a4.6 4.6 0 0 1-9.2 0Z"/><path d="M7.4 5.6H5.2a2.2 2.2 0 0 0 2.2 3.4M16.6 5.6h2.2a2.2 2.2 0 0 1-2.2 3.4"/><path d="M12 12.4v3.2M9 19.6h6l-.8-4h-4.4Z"/>');

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
