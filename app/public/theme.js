// theme.js — programėlės temų sistema.
//
// Tamsi tema:  žali atspalviai, balta ir juoda.
// Šviesi tema: balta ir mėlyna.
//
// Tema įrašoma į localStorage ir pritaikoma prieš atvaizdavimą, kad nešoktų.

export const THEME_KEY = 'vemak.theme';
export const THEMES = ['dark', 'light'];
export const DEFAULT_THEME = 'light';   // kol vartotojas nepasirinko

// Tema keičiama TIK vartotojui pasirinkus. Sistemos nustatymas nelemia dizaino.
export function currentTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (THEMES.includes(saved)) return saved;
  } catch { /* localStorage gali būti uždraustas */ }
  return DEFAULT_THEME;
}

export function applyTheme(theme) {
  const t = THEMES.includes(theme) ? theme : 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.documentElement.style.colorScheme = t;
  try { localStorage.setItem(THEME_KEY, t); } catch { /* ignoruojame */ }
  window.dispatchEvent(new CustomEvent('vemak:theme', { detail: { theme: t } }));
  return t;
}

export function toggleTheme() {
  return applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

// Nuoroda gali nustatyti temą: /?theme=dark arba /?theme=light
export function themeFromURL() {
  try {
    const p = new URLSearchParams(location.search).get('theme');
    if (THEMES.includes(p)) { applyTheme(p); return p; }
  } catch { /* ignoruojame */ }
  return null;
}

// Perjungiklio mygtukas. Ikona piešiama SVG, ne emoji.
export function themeButtonHTML(label = true) {
  return '<button type="button" class="theme-toggle" id="themeToggle" aria-label="Perjungti šviesią ir tamsią temą">'
    + '<span class="tt-icon" aria-hidden="true">'
    + '<svg class="tt-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4 17 7M7 17l-1.6 1.6"/></svg>'
    + '<svg class="tt-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4 8.4 8.4 0 1 0 20 14.4Z"/></svg>'
    + '</span>'
    + (label ? '<span class="tt-label">Tema</span>' : '')
    + '</button>';
}

// Suriša perjungiklį, jei jis yra puslapyje.
export function wireThemeToggle(root) {
  const scope = root || document;
  const btn = scope.querySelector('#themeToggle');
  if (!btn || btn.dataset.wired) return;
  btn.dataset.wired = '1';
  btn.addEventListener('click', () => { toggleTheme(); });
  window.addEventListener('vemak:theme', () => { /* CSS pasikeičia pats */ });
}
