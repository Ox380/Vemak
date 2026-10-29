// theme-init.js — tema pritaikoma prieš atvaizdavimą, kad nešoktų spalvos.
// Įkeliamas sinhroniškai <head> dalyje. Tema keičiama TIK vartotojui pasirinkus.
(function () {
  try {
    var u = new URLSearchParams(location.search).get('theme');
    var t = (u === 'dark' || u === 'light') ? u : localStorage.getItem('vemak.theme');
    if (u === 'dark' || u === 'light') localStorage.setItem('vemak.theme', u);
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    document.documentElement.style.colorScheme = t === 'dark' ? 'dark' : 'light';
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
