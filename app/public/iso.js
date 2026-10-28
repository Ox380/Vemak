// iso.js — proceduralinė 2.5D izometrinė miesto scena (SVG). Jokių paveikslų failų:
// įkeliama akimirksniu net mokyklos kompiuteryje.
//
// Struktūra v2: 9x9 kvartalai, du bulvarai kryžiumi, centrinė aikštė su fontanu,
// parkas su tvenkiniu, pastatų šešėliai ir gatvių žibintai.
// Art direction: tai vis dar „bazinis" variantas (sprendimas 20). Dizaineris gali pakeisti
// kiekvieną pastatą iliustruotu SVG/PNG sprite'u, naudodamas tas pačias tinklelio koordinates.
const TW = 28, TH = 14;      // plytelės pusė: plotis / aukštis
const OX = 330, OY = 112;    // tinklelio (0,0) ekrano pozicija
const N = 9;                 // kvartalų skaičius kraštinėje
const P = (x, y, z = 0) => [OX + (x - y) * TW, OY + (x + y) * TH - z];
const pts = (a) => a.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('');
}

// Nykštantis pastato šešėlis ant žemės (stumiamas į dešinę-apačią, kaip ir visa šviesa).
function shadow(gx, gy, w, d, dx = 5, dy = 6) {
  const a = [P(gx, gy), P(gx + w, gy), P(gx + w, gy + d), P(gx, gy + d)].map(([x, y]) => [x + dx, y + dy]);
  return poly(a, '#0b1730', 'opacity=".17"');
}

// Apskritimas žemės plokštumoje → izometrinis daugiakampis (aikštei, tvenkiniui).
function disc(cx, cy, r, fill, extra = '') {
  const a = [];
  for (let i = 0; i < 26; i++) {
    const t = (i / 26) * Math.PI * 2;
    a.push(P(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
  }
  return poly(a, fill, extra);
}

function windows(gx, gy, w, d, h, cols, rows, side, lit) {
  let s = '';
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u0 = (i + 0.24) / cols, u1 = (i + 0.76) / cols;
    const v0 = (j + 0.26) / rows, v1 = (j + 0.68) / rows;
    const q = (u, v) => (side === 'L' ? P(gx + w * u, gy + d, h * v) : P(gx + w, gy + d * u, h * v));
    const on = (i * 5 + j * 3) % 7 !== 0;                 // deterministinis raštas
    const fill = on && lit ? '#ffe6a8' : on ? '#cfe9f8' : '#b9d6ea';
    s += poly([q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)], fill, `opacity="${on ? '.95' : '.6'}"`);
  }
  return s;
}

// opts: { windows, lit, parapet, pitch, antenna, top }
function box(gx, gy, w, d, h, color, opts = {}) {
  const top = [P(gx, gy, h), P(gx + w, gy, h), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const left = [P(gx, gy + d, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const right = [P(gx + w, gy, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx + w, gy, h)];
  let s = shadow(gx, gy, w, d);
  s += poly(left, shade(color, 0.80)) + poly(right, shade(color, 0.60)) + poly(top, opts.top || shade(color, 1.14));
  if (opts.windows) {
    const cols = Math.max(1, Math.round(w * 1.5)), rows = Math.max(1, Math.floor(h / 20));
    s += windows(gx, gy, w, d, h, cols, rows, 'L', opts.lit);
    s += windows(gx, gy, w, d, h, Math.max(1, Math.round(d * 1.5)), rows, 'R', opts.lit);
  }
  if (opts.parapet) {
    const t = 3;
    s += poly([P(gx, gy + d, h + t), P(gx + w, gy + d, h + t), P(gx + w, gy + d, h), P(gx, gy + d, h)], shade(color, 0.92));
    s += poly([P(gx + w, gy, h + t), P(gx + w, gy + d, h + t), P(gx + w, gy + d, h), P(gx + w, gy, h)], shade(color, 0.72));
    s += poly([P(gx, gy, h + t), P(gx + w, gy, h + t), P(gx + w, gy + d, h + t), P(gx, gy + d, h + t)], shade(color, 1.06));
  }
  if (opts.pitch) {  // dvišlaitis stogas
    const mid = [(gx + gx + w) / 2, (gy + gy + d) / 2];
    const a = P(gx, gy, h), b = P(gx + w, gy, h), c = P(gx + w, gy + d, h), e = P(gx, gy + d, h);
    const ridgeA = P(mid[0], gy, h + w * 6), ridgeB = P(mid[0], gy + d, h + w * 6);
    s += poly([a, b, ridgeA], shade('#c0504d', 1.15)) + poly([c, e, ridgeB], shade('#c0504d', 0.78));
    s += poly([a, ridgeA, ridgeB, e], shade('#c0504d', 0.95));
    s += poly([b, c, ridgeB, ridgeA], shade('#c0504d', 0.66));
  }
  if (opts.antenna) {
    const [ax, ay] = P(gx + w / 2, gy + d / 2, h + (opts.parapet ? 3 : 0));
    s += `<line x1="${ax}" y1="${ay}" x2="${ax}" y2="${ay - 22}" stroke="#8fa2bd" stroke-width="2.2"/>`;
    s += `<circle cx="${ax}" cy="${ay - 25}" r="3.4" fill="#ef5b4d"/>`;
  }
  return s;
}

function tree(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px},${py})"><ellipse cx="2" cy="0" rx="${9 * s}" ry="${3.4 * s}" fill="#0b1730" opacity=".16"/>`
    + `<rect x="-1.9" y="${-13 * s}" width="3.8" height="${13 * s}" fill="#8a5a33"/>`
    + `<ellipse cx="0" cy="${-21 * s}" rx="${11 * s}" ry="${13 * s}" fill="#2aa36b"/>`
    + `<ellipse cx="-3" cy="${-25 * s}" rx="${6 * s}" ry="${7 * s}" fill="#41c284"/></g>`;
}

function lamp(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px},${py})"><ellipse cx="1" cy="0" rx="6" ry="2.4" fill="#0b1730" opacity=".18"/>`
    + `<rect x="-1.6" y="-30" width="3.2" height="30" fill="#6f7f96" rx="1.4"/>`
    + `<circle cx="0" cy="-33" r="4.6" fill="#ffe9a8"/><circle cx="0" cy="-33" r="2.4" fill="#fff8e2"/></g>`;
}

function label(x, y, z, text) {
  const [px, py] = P(x, y, z);
  const w = text.length * 6.6 + 22;
  return `<g transform="translate(${px},${py})"><rect x="${-w / 2}" y="-13" width="${w}" height="23" rx="11.5" fill="#0f1e3d" opacity=".95"/>`
    + `<circle cx="${-w / 2 + 11}" cy="-1.5" r="3" fill="#12b48c"/>`
    + `<text x="${4}" y="3.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${text}</text></g>`;
}

// Kavos baras: auga kartu su žaidėjo verslo lygiu.
function cafe(gx, gy, level) {
  const h = 28 + level * 15;
  let s = shadow(gx, gy, 2, 2);
  s += box(gx, gy, 2, 2, h, '#f4a259', { windows: true, lit: true, parapet: true });
  const awn = [P(gx, gy + 2, h * 0.55), P(gx + 2, gy + 2, h * 0.55), P(gx + 2, gy + 2.45, h * 0.4), P(gx, gy + 2.45, h * 0.4)];
  s += poly(awn, '#e63946');
  for (let i = 0; i < 4; i++) {
    const a = P(gx + i * 0.5, gy + 2, h * 0.55), b = P(gx + (i + 0.5) * 0.5, gy + 2, h * 0.55);
    if (i % 2 === 0) s += poly([a, b, [b[0], b[1] + 8], [a[0], a[1] + 8]], '#fff', 'opacity=".9"');
  }
  const [cx, cy] = P(gx + 1, gy + 2, h + 8);
  s += `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="19">☕</text>`;
  if (level >= 2) s += box(gx + 2.15, gy + 0.15, 0.85, 1.35, 20, '#fcd581', { windows: true });
  if (level >= 3) s += `<g transform="translate(${P(gx + 1, gy + 1, h + 24).join(',')})"><circle r="9" fill="#ffd166"/><text y="4" text-anchor="middle" font-size="11" font-weight="800" fill="#0f1e3d">★</text></g>`;
  return s;
}

function sky(mood) {
  const stops = { up: ['#8fd8f7', '#eaf9ff'], down: ['#7d8ba3', '#c9d2de'], neutral: ['#9fd3f2', '#e9f6ff'] }[mood] || ['#9fd3f2', '#e9f6ff'];
  let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset="1" stop-color="${stops[1]}"/></linearGradient>`
    + `<radialGradient id="sunglow"><stop offset="0" stop-color="#fff6cf" stop-opacity=".95"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>`
    + `<radialGradient id="vig" cx=".5" cy=".42" r=".78"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b1730" stop-opacity=".14"/></radialGradient></defs>`;
  s += `<rect width="660" height="430" fill="url(#sky)"/>`;
  if (mood === 'up') s += `<circle cx="578" cy="54" r="62" fill="url(#sunglow)"/><circle cx="578" cy="54" r="23" fill="#ffd166"/>`;
  s += mood === 'down'
    ? '<g fill="#66738c" opacity=".9"><ellipse cx="128" cy="58" rx="58" ry="18"/><ellipse cx="182" cy="48" rx="42" ry="16"/><ellipse cx="500" cy="72" rx="62" ry="18"/></g>'
    : '<g fill="#fff" opacity=".92"><ellipse cx="120" cy="58" rx="46" ry="14"/><ellipse cx="156" cy="50" rx="30" ry="12"/><ellipse cx="516" cy="76" rx="52" ry="14"/><ellipse cx="552" cy="70" rx="30" ry="11"/></g>';
  return s;
}

// state: { level, savings, reserve, business, invest (total), mood: 'up'|'down'|'neutral', debt }
export function citySVG(st) {
  const lvl = st.level || 1, mood = st.mood || 'neutral';
  let g = sky(mood);

  // ---- žemė: 9x9 kvartalai, bulvarai x=4 ir y=4 ----
  const road = (x, y) => x === 4 || y === 4;
  let ground = '';
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const t = [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)];
    let col;
    if (road(x, y)) col = (x + y) % 2 ? '#8d99ab' : '#96a2b4';
    else col = (x + y) % 2 ? '#7fd18b' : '#74c982';
    ground += poly(t, col, 'stroke="#ffffff26" stroke-width=".7"');
  }
  // šaligatviai (šviesus apvadas) palei bulvarus
  for (let i = 0; i < N; i++) {
    if (i !== 4) {
      ground += poly([P(4, i), P(4.16, i), P(4.16, i + 1), P(4, i + 1)], '#e7edf5', 'opacity=".95"');
      ground += poly([P(i, 4), P(i + 1, 4), P(i + 1, 4.16), P(i, 4.16)], '#e7edf5', 'opacity=".95"');
    }
  }
  // pagrindo plokštė
  const slab = [P(0, N), P(N, N), P(N, N, -16), P(0, N, -16)];
  const slabR = [P(N, 0), P(N, N), P(N, N, -16), P(N, 0, -16)];
  g += poly(slab, '#6b5b4b') + poly(slabR, '#53463a') + ground;
  // kelio žymėjimas
  for (let i = 0; i < N; i++) {
    if (i !== 4) {
      const a = P(4.42, i + 0.35), b = P(4.58, i + 0.65);
      g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="2" opacity=".55"/>`;
      const c = P(i + 0.35, 4.42), d = P(i + 0.65, 4.58);
      g += `<line x1="${c[0]}" y1="${c[1]}" x2="${d[0]}" y2="${d[1]}" stroke="#fff" stroke-width="2" opacity=".55"/>`;
    }
  }

  // ---- centrinė aikštė su fontanu ----
  let plaza = disc(4.5, 4.5, 1.05, '#dfe7f1');
  plaza += disc(4.5, 4.5, 0.62, '#bfd9ee');
  plaza += disc(4.5, 4.5, 0.34, '#8fc7e8');
  const [fx, fy] = P(4.5, 4.5, 0);
  plaza += `<ellipse cx="${fx}" cy="${fy - 8}" rx="5" ry="7" fill="#fff" opacity=".85"/>`
    + `<rect x="${fx - 1.6}" y="${fy - 16}" width="3.2" height="12" fill="#e7edf5" rx="1.4"/>`;

  // ---- parkas su tvenkiniu (šiaurės rytai) ----
  let park = disc(7.2, 3.25, 0.6, '#5fb4d6', 'opacity=".95"');
  park += disc(7.2, 3.25, 0.42, '#7fcbe6', 'opacity=".9"');

  // ---- elementai: piešiami iš galo į priekį (pagal gx+gy) ----
  const items = [];

  items.push([0.9, () => park]);                                    // parko tvenkinys
  items.push([1.2, () => plaza]);                                   // aikštės grindinys
  items.push([1.4, () => box(0.35, 0.35, 2.3, 2.3, 40, '#efe0cd', { windows: true, pitch: true })]);
  items.push([2.0, () => label(1.5, 1.5, 40 + 26, 'Namai · ' + Math.round(st.reserve || 0) + ' €')]);
  items.push([2.2, () => box(2.6, 0.6, 1.4, 1.4, 50, '#dbe7f5', { windows: true, parapet: true, antenna: true })]);
  items.push([2.8, () => label(3.3, 1.3, 50 + 26, 'Darbovietė')]);
  items.push([3.4, () => tree(3.35, 3.4) + tree(3.6, 3.0, 0.85) + lamp(3.6, 3.75)]);
  items.push([3.6, () => box(5.5, 0.5, 2.1, 2.1, 78, '#d4e6f7', { windows: true, parapet: true, antenna: true })]);
  items.push([3.7, () => box(7.65, 1.1, 0.9, 1.3, 38, '#c3d8ee', { windows: true, parapet: true })]);
  items.push([4.3, () => label(6.55, 1.55, 78 + 26, 'Bankas · ' + Math.round(st.savings || 0) + ' €')]);
  items.push([4.6, () => tree(6.2, 3.35, 0.9) + tree(8.15, 3.3, 1.0) + tree(8.5, 1.6, 0.85)]);

  const invH = 30 + Math.min(46, Math.round((st.invest || 0) / 45));
  items.push([6.0, () => box(0.35, 5.45, 2.3, 2.3, invH, '#a9dcd2', { windows: true, parapet: true })]);
  items.push([6.1, () => `<g transform="translate(${P(1.5, 7.75, invH + 12).join(',')})"><text text-anchor="middle" font-size="17">${mood === 'down' ? '📉' : '📈'}</text></g>`]);
  items.push([6.6, () => label(1.5, 6.6, invH + 26, 'Birža · ' + Math.round(st.invest || 0) + ' €')]);
  items.push([7.5, () => cafe(2.55, 5.7, lvl)]);
  items.push([8.0, () => label(3.55, 6.7, 28 + lvl * 15 + 30, 'Kavos baras · ' + Math.round(st.business || 0) + ' €')]);

  // stadionas / arena
  items.push([8.2, () => {
    let s = shadow(5.5, 5.5, 2.4, 2.4);
    s += box(5.5, 5.5, 2.4, 2.4, 22, '#d9c7ea', { parapet: true });
    s += disc(6.7, 6.7, 0.95, '#b79fdc');
    s += disc(6.7, 6.7, 0.72, '#8fd18b');
    const [ax, ay] = P(6.7, 6.7, 22);
    s += `<circle cx="${ax}" cy="${ay - 16}" r="12" fill="#ffd166"/><text x="${ax}" y="${ay - 11}" text-anchor="middle" font-size="15">🏆</text>`;
    return s;
  }]);
  items.push([8.8, () => label(6.7, 8.35, 22 + 30, 'Arena')]);

  // medžiai ir žibintai likusiose zonose
  items.push([9.0, () => tree(6.3, 8.5) + tree(8.6, 5.2, 0.9) + tree(0.7, 8.6, 0.95) + tree(3.4, 8.5) + lamp(4.4, 7.6) + lamp(7.4, 4.4)]);
  items.push([9.2, () => tree(8.6, 8.5, 0.9) + lamp(1.6, 4.4)]);

  if (st.debt > 0) {
    items.push([10, () => {
      const [bx, by] = P(4.5, 4.5, 8);
      return `<g transform="translate(${bx},${by})"><rect x="-46" y="-15" width="92" height="25" rx="12.5" fill="#e63946"/>`
        + `<text y="3" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Skola ${Math.round(st.debt)} €</text></g>`;
    }]);
  }

  items.sort((a, b) => a[0] - b[0]);
  g += items.map((i) => i[1]()).join('');

  if (mood === 'down') {
    let rain = '';
    for (let i = 0; i < 40; i++) {
      const x = (i * 53) % 660, y = (i * 97) % 380;
      rain += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}"/>`;
    }
    g += `<g stroke="#5b6b8a" stroke-width="1.4" opacity=".5">${rain}</g>`;
  }
  g += `<rect width="660" height="430" fill="url(#vig)" pointer-events="none"/>`;
  return `<svg viewBox="0 0 660 430" role="img" aria-label="Izometrinis miestas: namai, bankas, birža, darbovietė, kavos baras ir arena" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
