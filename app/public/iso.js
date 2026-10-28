// iso.js — procedūrinė izometrinė miesto scena (SVG). Jokių paveikslų failų:
// įkeliama akimirksniu net mokyklos kompiuteryje.
//
// Struktūra v5 (išplėstas miestas): 15x15 kvartalų, keturi kvartalai aplink du bulvarus,
// centrinė aikštė su fontanu, parkas su tvenkiniu ir prieplauka, prekyvietė,
// arena su tribūnomis, 26 pastatai (gyvenamieji, biurų, banko bokštas, birža su kupolu,
// kavos baras su terasa, parduotuvės), transportas, žibintai, suoliukai, sodai.
// Scena užpildo visą drobę: tinklelio įstrižainė 780x390 px, plotis 100 %, aukštis ~100 %.
//
// Taisyklės, kurių laikomasi (kad scena būtų stabili ir teisinga):
//  - visi „organiški" pasirinkimai imami iš sėklos (rng), todėl scena visada ta pati;
//  - sluoksniavimas skaičiuojamas pagal priekinį kampą (gx + w + gy + d), ne ranka;
//  - plokštieji elementai (aikštė, tvenkinys, takai, balos) klojami kartu su žeme;
//  - simboliai piešiami figūromis, ne emoji (veikia ir be emoji šrifto).
const TW = 26, TH = 13;      // plytelės pusė: plotis / aukštis
const OX = 395, OY = 112;    // tinklelio (0,0) ekrano pozicija (kalibruota, kad miestas tiksliai tilptų)
const N = 15;                // kvartalų skaičius kraštinėje
const W = 800, H = 520;      // SVG drobė

const P = (x, y, z = 0) => [OX + (x - y) * TW, OY + (x + y) * TH - z];
const pts = (a) => a.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('');
}
function mix(a, b, t) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const c = (s) => Math.round((((pa >> s) & 255) * (1 - t)) + (((pb >> s) & 255) * t));
  return '#' + [16, 8, 0].map((s) => c(s).toString(16).padStart(2, '0')).join('');
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---- žemės plokštumos geometrija ----
function disc(cx, cy, r, fill, extra = '', seg = 30) {
  const a = [];
  for (let i = 0; i < seg; i++) {
    const t = (i / seg) * Math.PI * 2;
    a.push(P(cx + Math.cos(t) * r, cy + Math.sin(t) * r));
  }
  return poly(a, fill, extra);
}
function shadow(gx, gy, w, d, dx = 6, dy = 7, op = '.18') {
  const a = [P(gx, gy), P(gx + w, gy), P(gx + w, gy + d), P(gx, gy + d)].map(([x, y]) => [x + dx, y + dy]);
  return poly(a, '#08101f', `opacity="${op}"`);
}

// ---- pastatų langai ----
function windows(gx, gy, w, d, h, cols, rows, side, lit, floorLine) {
  let s = '';
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const u0 = (i + 0.22) / cols, u1 = (i + 0.78) / cols;
    const v0 = (j + 0.24) / rows, v1 = (j + 0.62) / rows;
    const q = (u, v) => (side === 'L' ? P(gx + w * u, gy + d, h * v) : P(gx + w, gy + d * u, h * v));
    const on = (i * 5 + j * 3) % 7 !== 0;
    const fill = on && lit ? '#ffe7a6' : on ? '#cfe9f8' : '#b6d3e8';
    s += poly([q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)], fill, `opacity="${on ? '.95' : '.55'}"`);
  }
  if (floorLine) for (let j = 1; j < rows; j++) {
    const v = j / rows;
    const q = (u) => (side === 'L' ? P(gx + w * u, gy + d, h * v) : P(gx + w, gy + d * u, h * v));
    const p0 = q(0), p1 = q(1);
    s += `<line x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="#0b1730" stroke-width=".5" opacity=".10"/>`;
  }
  return s;
}

// opts: { windows, lit, floors, floorLine, parapet, pitch, dome, antenna, sign, base, top }
function box(gx, gy, w, d, h, color, opts = {}) {
  const top = [P(gx, gy, h), P(gx + w, gy, h), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const left = [P(gx, gy + d, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const right = [P(gx + w, gy, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx + w, gy, h)];
  let s = shadow(gx, gy, w, d);
  s += poly(left, shade(color, 0.80)) + poly(right, shade(color, 0.60)) + poly(top, opts.top || shade(color, 1.14));
  if (opts.base) {
    const bh = Math.min(h * 0.18, 12);
    s += poly([P(gx, gy + d, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, bh), P(gx, gy + d, bh)], shade(opts.base, 0.86));
    s += poly([P(gx + w, gy, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, bh), P(gx + w, gy, bh)], shade(opts.base, 0.68));
  }
  if (opts.windows) {
    const rows = opts.floors || Math.max(1, Math.floor(h / 18));
    s += windows(gx, gy, w, d, h, Math.max(1, Math.round(w * 1.5)), rows, 'L', opts.lit, opts.floorLine);
    s += windows(gx, gy, w, d, h, Math.max(1, Math.round(d * 1.5)), rows, 'R', opts.lit, opts.floorLine);
  }
  if (opts.parapet) {
    const t = 3.5;
    s += poly([P(gx, gy + d, h + t), P(gx + w, gy + d, h + t), P(gx + w, gy + d, h), P(gx, gy + d, h)], shade(color, 0.94));
    s += poly([P(gx + w, gy, h + t), P(gx + w, gy + d, h + t), P(gx + w, gy + d, h), P(gx + w, gy, h)], shade(color, 0.74));
    s += poly([P(gx, gy, h + t), P(gx + w, gy, h + t), P(gx + w, gy + d, h + t), P(gx, gy + d, h + t)], shade(color, 1.08));
  }
  if (opts.pitch) {
    const midx = gx + w / 2;
    const a = P(gx, gy, h), b = P(gx + w, gy, h), c = P(gx + w, gy + d, h), e = P(gx, gy + d, h);
    const ra = P(midx, gy, h + w * 7), rb = P(midx, gy + d, h + w * 7);
    s += poly([a, b, ra], shade('#b8524c', 1.12)) + poly([c, e, rb], shade('#b8524c', 0.76));
    s += poly([a, ra, rb, e], shade('#b8524c', 0.94)) + poly([b, c, rb, ra], shade('#b8524c', 0.64));
  }
  if (opts.dome) {
    const [cx, cy] = P(gx + w / 2, gy + d / 2, h);
    const domeCol = typeof opts.dome === 'string' ? opts.dome : shade(color, 1.2);
    s += `<ellipse cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${(w * TW * 0.42).toFixed(1)}" ry="${(w * TH * 0.62).toFixed(1)}" fill="${shade(domeCol, 0.9)}"/>`;
    s += `<ellipse cx="${(cx - w * 1.6).toFixed(1)}" cy="${(cy - 4).toFixed(1)}" rx="${(w * TW * 0.3).toFixed(1)}" ry="${(w * TH * 0.44).toFixed(1)}" fill="${domeCol}"/>`;
    s += `<ellipse cx="${(cx - w * 3).toFixed(1)}" cy="${(cy - 6).toFixed(1)}" rx="${(w * TW * 0.13).toFixed(1)}" ry="${(w * TH * 0.2).toFixed(1)}" fill="#ffffff" opacity=".45"/>`;
    s += `<line x1="${cx.toFixed(1)}" y1="${(cy - 8).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(cy - 22).toFixed(1)}" stroke="#8a6a2f" stroke-width="1.8"/>`;
    s += `<circle cx="${cx.toFixed(1)}" cy="${(cy - 24).toFixed(1)}" r="2.6" fill="#ffd166"/>`;
  }
  if (opts.antenna) {
    const [ax, ay] = P(gx + w / 2, gy + d / 2, h + (opts.parapet ? 3.5 : 0));
    s += `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${ax.toFixed(1)}" y2="${(ay - 26).toFixed(1)}" stroke="#8fa2bd" stroke-width="2"/>`;
    s += `<circle cx="${ax.toFixed(1)}" cy="${(ay - 29).toFixed(1)}" r="3.6" fill="#ef5b4d"/>`;
  }
  return s;
}

// ---- augmenija ir smulkūs objektai ----
function tree(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})">`
    + `<ellipse cx="${(3 * s).toFixed(1)}" cy="0" rx="${(9 * s).toFixed(1)}" ry="${(3.4 * s).toFixed(1)}" fill="#08101f" opacity=".18"/>`
    + `<rect x="${(-1.9 * s).toFixed(1)}" y="${(-13 * s).toFixed(1)}" width="${(3.8 * s).toFixed(1)}" height="${(13 * s).toFixed(1)}" fill="#8a5a33"/>`
    + `<ellipse cx="0" cy="${(-21 * s).toFixed(1)}" rx="${(11 * s).toFixed(1)}" ry="${(13 * s).toFixed(1)}" fill="#2aa36b"/>`
    + `<ellipse cx="${(-3 * s).toFixed(1)}" cy="${(-25 * s).toFixed(1)}" rx="${(6 * s).toFixed(1)}" ry="${(7 * s).toFixed(1)}" fill="#41c284"/></g>`;
}
function pine(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})">`
    + `<ellipse cx="${(2 * s).toFixed(1)}" cy="0" rx="${(7 * s).toFixed(1)}" ry="${(2.8 * s).toFixed(1)}" fill="#08101f" opacity=".18"/>`
    + `<rect x="-1.5" y="${(-9 * s).toFixed(1)}" width="3" height="${(9 * s).toFixed(1)}" fill="#7a5230"/>`
    + `<polygon points="0,${(-34 * s).toFixed(1)} ${(9 * s).toFixed(1)},${(-14 * s).toFixed(1)} ${(-9 * s).toFixed(1)},${(-14 * s).toFixed(1)}" fill="#1f8a5c"/>`
    + `<polygon points="0,${(-28 * s).toFixed(1)} ${(7 * s).toFixed(1)},${(-11 * s).toFixed(1)} ${(-7 * s).toFixed(1)},${(-11 * s).toFixed(1)}" fill="#27a06a"/></g>`;
}
function bush(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="${(1 * s).toFixed(1)}" cy="0" rx="${(7 * s).toFixed(1)}" ry="${(2.6 * s).toFixed(1)}" fill="#08101f" opacity=".15"/>`
    + `<ellipse cx="0" cy="${(-4 * s).toFixed(1)}" rx="${(7 * s).toFixed(1)}" ry="${(5 * s).toFixed(1)}" fill="#35b077"/>`
    + `<ellipse cx="-2" cy="${(-6 * s).toFixed(1)}" rx="${(4 * s).toFixed(1)}" ry="${(3 * s).toFixed(1)}" fill="#4cc98d"/></g>`;
}
function hedge(x, y, w, d) { return box(x, y, w, d, 7, '#3aa76f', { top: '#45c384' }); }
function flowers(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  const cols = ['#ff8fa3', '#ffd166', '#c084fc', '#ffffff'];
  let g = `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})">`;
  for (let i = 0; i < 6; i++) {
    g += `<circle cx="${((i % 3) - 1) * 5 * s}" cy="${(-3 - Math.floor(i / 3) * 5) * s}" r="${(1.9 * s).toFixed(1)}" fill="${cols[i % cols.length]}"/>`;
  }
  return g + '</g>';
}
function lamp(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="6" ry="2.4" fill="#08101f" opacity=".2"/>`
    + `<rect x="-1.6" y="-32" width="3.2" height="32" fill="#6f7f96" rx="1.4"/>`
    + `<circle cx="0" cy="-35" r="5" fill="#ffe9a8"/><circle cx="0" cy="-35" r="2.6" fill="#fff8e2"/></g>`;
}
function trafficLight(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="4" ry="2" fill="#08101f" opacity=".2"/>`
    + `<rect x="-1.3" y="-22" width="2.6" height="22" fill="#5b6b80" rx="1"/>`
    + `<rect x="-4" y="-34" width="8" height="13" rx="3" fill="#26313f"/>`
    + `<circle cx="0" cy="-31" r="1.8" fill="#ef5b4d"/><circle cx="0" cy="-27.5" r="1.8" fill="#f5a524"/><circle cx="0" cy="-24" r="1.8" fill="#3ddc84"/></g>`;
}
function bench(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="7" ry="2.6" fill="#08101f" opacity=".16"/>`
    + `<rect x="-7" y="-5" width="14" height="3" rx="1" fill="#a9754a"/>`
    + `<rect x="-7" y="-11" width="14" height="3" rx="1" fill="#bd8455"/>`
    + `<rect x="-6" y="-2" width="2" height="3" fill="#6b7a8d"/><rect x="4" y="-2" width="2" height="3" fill="#6b7a8d"/></g>`;
}
function hydrant(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="3.4" ry="1.6" fill="#08101f" opacity=".18"/>`
    + `<rect x="-2.2" y="-9" width="4.4" height="9" rx="2" fill="#d9534f"/><rect x="-3.4" y="-6.5" width="6.8" height="2" rx="1" fill="#b8403c"/>`
    + `<circle cx="0" cy="-9.5" r="2.4" fill="#e66863"/></g>`;
}
function planter(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="8" ry="3" fill="#08101f" opacity=".16"/>`
    + `<rect x="-6" y="-7" width="12" height="7" rx="2" fill="#b0bccb"/><rect x="-6" y="-7" width="12" height="2" rx="1" fill="#cfd8e4"/>`
    + `<ellipse cx="0" cy="-10" rx="6" ry="3.4" fill="#35b077"/><circle cx="-2" cy="-11" r="1.7" fill="#ff8fa3"/><circle cx="2.4" cy="-10.4" r="1.7" fill="#ffd166"/></g>`;
}
function car(x, y, color, flip = false) {
  const [px, py] = P(x, y, 0);
  const w = 22, h = 8;
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)}) scale(${flip ? -1 : 1},1)">`
    + `<ellipse cx="0" cy="1" rx="13" ry="4.5" fill="#08101f" opacity=".22"/>`
    + `<polygon points="${-w / 2},0 ${w / 2},0 ${w / 2 - 4},${-h} ${-w / 2 + 4},${-h}" fill="${shade(color, 0.85)}"/>`
    + `<polygon points="${-w / 2},0 ${w / 2},0 ${w / 2 - 3},${-4} ${-w / 2 + 3},${-4}" fill="${shade(color, 0.6)}"/>`
    + `<polygon points="${-w / 2 + 4},${-h} ${w / 2 - 4},${-h} ${w / 2 - 6},${-h - 5} ${-w / 2 + 6},${-h - 5}" fill="${shade(color, 1.1)}"/>`
    + `<polygon points="${-w / 2 + 5},${-h - 5} ${-1},${-h - 5} ${-1},${-h - 1} ${-w / 2 + 6},${-h - 1}" fill="#bfe3f5" opacity=".9"/>`
    + `<circle cx="${-w / 2 + 4}" cy="1" r="2.4" fill="#26313f"/><circle cx="${w / 2 - 4}" cy="1" r="2.4" fill="#26313f"/></g>`;
}
function bus(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="0" cy="1" rx="20" ry="6" fill="#08101f" opacity=".22"/>`
    + `<polygon points="-17,0 17,0 17,-15 -17,-15" fill="#2f7fd0"/><polygon points="-17,0 17,0 17,-6 -17,-6" fill="#1f66ad"/>`
    + `<polygon points="-17,-15 17,-15 17,-21 -17,-21" fill="#4a9be0"/>`
    + `<polygon points="-14,-16 14,-16 14,-20 -14,-20" fill="#cfe9f8" opacity=".92"/>`
    + `<circle cx="-10" cy="1" r="3" fill="#26313f"/><circle cx="10" cy="1" r="3" fill="#26313f"/></g>`;
}
// prekyvietės prekystalis (nupieštas, ne emoji)
function stall(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="2" cy="0" rx="9" ry="3.2" fill="#08101f" opacity=".18"/>`
    + `<rect x="-7" y="-8" width="14" height="8" rx="2" fill="#c8a06a"/>`
    + `<polygon points="-9,-8 9,-8 7,-15 -7,-15" fill="#e05a4f"/>`
    + `<polygon points="-9,-8 0,-8 0,-15 -7,-15" fill="#ef7a6f"/>`
    + `<circle cx="-3" cy="-11" r="1.6" fill="#ffd166"/><circle cx="3" cy="-11.5" r="1.6" fill="#8fd18b"/></g>`;
}

function label(x, y, z, text) {
  const [px, py] = P(x, y, z);
  const w = text.length * 6.4 + 22;
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><rect x="${(-w / 2).toFixed(1)}" y="-13" width="${w}" height="23" rx="11.5" fill="#0f1e3d" opacity=".95"/>`
    + `<circle cx="${(-w / 2 + 11).toFixed(1)}" cy="-1.5" r="3" fill="#12b48c"/>`
    + `<text x="4" y="3.5" text-anchor="middle" font-size="11.5" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${text}</text></g>`;
}

function sky(mood) {
  const stops = { up: ['#8ad4f5', '#eaf9ff'], down: ['#76839b', '#c4ccd8'], neutral: ['#9bd2f0', '#e8f6ff'] }[mood] || ['#9bd2f0', '#e8f6ff'];
  let s = '<defs>'
    + `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset="1" stop-color="${stops[1]}"/></linearGradient>`
    + '<radialGradient id="sunglow"><stop offset="0" stop-color="#fff6cf" stop-opacity=".95"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>'
    + '<radialGradient id="vig" cx=".5" cy=".45" r=".8"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0b1730" stop-opacity=".16"/></radialGradient>'
    + '</defs>'
    + `<rect width="${W}" height="${H}" fill="url(#sky)"/>`;
  if (mood === 'up') s += `<circle cx="690" cy="56" r="74" fill="url(#sunglow)"/><circle cx="690" cy="56" r="24" fill="#ffd166"/>`;
  s += mood === 'down'
    ? '<g fill="#64718a" opacity=".9"><ellipse cx="150" cy="62" rx="62" ry="19"/><ellipse cx="210" cy="52" rx="44" ry="16"/><ellipse cx="600" cy="80" rx="66" ry="19"/></g>'
    : '<g fill="#fff" opacity=".92"><ellipse cx="140" cy="58" rx="48" ry="14"/><ellipse cx="180" cy="50" rx="32" ry="12"/><ellipse cx="606" cy="80" rx="54" ry="14"/><ellipse cx="646" cy="74" rx="32" ry="11"/></g>';
  if (mood !== 'down') {
    s += '<g stroke="#5b6b80" stroke-width="1.6" fill="none" opacity=".55">'
      + '<path d="M300 84 q6 -6 12 0"/><path d="M316 92 q5 -5 10 0"/><path d="M286 96 q4 -4 8 0"/></g>';
  }
  return s;
}

// ================= MIESTO DUOMENYS (lengva tikrinti ir plėsti) =================
// Kvartalai: NW (0-7, 0-7), NE (8-15, 0-7), SW (0-7, 8-15), SE (8-15, 8-15)
const BUILDINGS = [
  // gyvenamasis kvartalas (šiaurės vakarai)
  { gx: 0.4, gy: 0.4, w: 1.5, d: 1.5, h: 30, c: '#f2e3d0', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 2.1, gy: 0.4, w: 1.5, d: 1.5, h: 32, c: '#e8d6c4', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 3.8, gy: 0.4, w: 1.5, d: 1.5, h: 28, c: '#f0ded0', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 0.4, gy: 2.1, w: 1.5, d: 1.5, h: 34, c: '#efe0cd', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 2.1, gy: 2.1, w: 1.5, d: 1.5, h: 30, c: '#f6ece0', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 0.4, gy: 3.8, w: 1.5, d: 1.5, h: 32, c: '#eddcc9', o: { windows: true, pitch: true, floors: 2 } },
  { gx: 2.1, gy: 3.8, w: 1.5, d: 1.5, h: 28, c: '#f2e6d6', o: { windows: true, pitch: true, floors: 2 } },
  // biurų pastatas (du tūriai)
  { gx: 4.3, gy: 0.5, w: 2.3, d: 2.3, h: 58, c: '#dbe7f5', o: { windows: true, parapet: true, floors: 7, base: '#b9c9dd', floorLine: true } },
  { gx: 4.75, gy: 0.95, w: 1.4, d: 1.4, h: 74, c: '#e6eef8', o: { windows: true, parapet: true, floors: 5 } },
  // mažieji pastatai
  { gx: 0.4, gy: 5.5, w: 1.7, d: 1.3, h: 24, c: '#e7d3bd', o: { windows: true, pitch: true } },
  { gx: 2.4, gy: 5.5, w: 1.7, d: 1.3, h: 22, c: '#f0dcc6', o: { windows: true, parapet: true } },
  { gx: 4.3, gy: 5.4, w: 1.5, d: 1.5, h: 30, c: '#dce8f4', o: { windows: true, parapet: true, floors: 3 } },
  // banko kvartalas (šiaurės rytai)
  { gx: 9.0, gy: 0.5, w: 2.4, d: 2.4, h: 92, c: '#d3e5f7', o: { windows: true, parapet: true, floors: 13, floorLine: true, antenna: true } },
  { gx: 9.45, gy: 0.95, w: 1.5, d: 1.5, h: 108, c: '#e3eefb', o: { windows: true, parapet: true, floors: 5 } },
  { gx: 11.7, gy: 1.1, w: 1.3, d: 1.7, h: 42, c: '#c6dbef', o: { windows: true, parapet: true, floors: 5, base: '#a8bed6' } },
  { gx: 8.6, gy: 5.2, w: 1.7, d: 1.4, h: 24, c: '#e9d8c4', o: { windows: true, parapet: true } },
  { gx: 10.5, gy: 5.2, w: 1.7, d: 1.4, h: 26, c: '#f0e2d2', o: { windows: true, parapet: true } },
  { gx: 12.4, gy: 5.2, w: 1.7, d: 1.4, h: 22, c: '#e4d3c0', o: { windows: true, pitch: true } },
  { gx: 13.1, gy: 2.6, w: 1.4, d: 1.4, h: 34, c: '#dce8f4', o: { windows: true, parapet: true, floors: 3 } },
  // biržos kvartalas (pietvakariai)
  { gx: 0.4, gy: 8.4, w: 2.4, d: 2.4, h: 48, c: '#a9dcd2', o: { windows: true, parapet: true, floors: 5, base: '#8dc9bd' } },
  { gx: 0.9, gy: 8.9, w: 1.4, d: 1.4, h: 56, c: '#bfe7df', o: { windows: true, dome: '#d9a441', floors: 2 } },
  { gx: 0.4, gy: 11.6, w: 1.6, d: 1.4, h: 22, c: '#e4d3c0', o: { windows: true, pitch: true } },
  { gx: 2.4, gy: 11.6, w: 1.6, d: 1.4, h: 24, c: '#f0dcc6', o: { windows: true, parapet: true } },
  { gx: 4.6, gy: 11.5, w: 1.6, d: 1.5, h: 30, c: '#dce8f4', o: { windows: true, parapet: true, floors: 3 } },
  { gx: 5.9, gy: 8.5, w: 1.2, d: 1.8, h: 28, c: '#e7d3bd', o: { windows: true, parapet: true, floors: 3 } },
  // pietryčiai: aplink areną
  { gx: 12.6, gy: 8.6, w: 1.7, d: 1.7, h: 30, c: '#e9d8c4', o: { windows: true, pitch: true } },
  { gx: 8.6, gy: 12.9, w: 1.7, d: 1.3, h: 24, c: '#e4d3c0', o: { windows: true, pitch: true } },
  { gx: 10.6, gy: 13.0, w: 1.6, d: 1.2, h: 26, c: '#f0dcc6', o: { windows: true, parapet: true } },
  { gx: 13.2, gy: 12.9, w: 1.4, d: 1.3, h: 28, c: '#dbe7f5', o: { windows: true, parapet: true, floors: 3 } },
  { gx: 8.5, gy: 8.5, w: 1.5, d: 1.5, h: 32, c: '#dce8f4', o: { windows: true, parapet: true, floors: 4 } },
];

export function citySVG(st) {
  const lvl = st.level || 1, mood = st.mood || 'neutral';
  const lit = mood === 'up';
  const r = rng(20261028);
  let g = sky(mood);

  // ================= ŽEMĖ =================
  // Kelias: x=7 ir y=7. Šaligatviai: juostos [6,7) ir [8,9) abiejose ašyse.
  const isRoad = (x, y) => x === 7 || y === 7;
  const isWalk = (x, y) => {
    const f = (v) => Math.floor(v);
    return !isRoad(x, y) && (f(x) === 6 || f(x) === 8 || f(y) === 6 || f(y) === 8);
  };
  let ground = '';
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const t = [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)];
    let col;
    if (isRoad(x, y)) col = (x + y) % 2 ? '#8d99ab' : '#96a2b4';
    else if (isWalk(x, y)) col = (x + y) % 2 ? '#dfe6ef' : '#e6ecf4';
    else {
      const v = r();
      col = (x + y) % 2 ? mix('#7fd18b', '#6cc47a', v * 0.5) : mix('#74c982', '#63bd74', v * 0.5);
    }
    ground += poly(t, col, 'stroke="#ffffff22" stroke-width=".6"');
  }
  // pėsčiųjų takai parkuose
  for (const [tx, ty] of [[9.4, 2.4], [10.4, 2.4], [11.4, 2.4], [12.4, 2.4], [13.4, 2.4], [13.4, 3.4], [13.4, 4.4],
                          [3.4, 5.6], [4.4, 5.6], [1.4, 5.6], [0.6, 5.6], [9.4, 13.4], [10.4, 13.4], [12.4, 13.4]]) {
    ground += poly([P(tx + .1, ty + .1), P(tx + .9, ty + .1), P(tx + .9, ty + .9), P(tx + .1, ty + .9)], '#d9c9a8', 'opacity=".88"');
  }
  g += poly([P(0, N), P(N, N), P(N, N, -18), P(0, N, -18)], '#6b5b4b');
  g += poly([P(N, 0), P(N, N), P(N, N, -18), P(N, 0, -18)], '#53463a');
  g += ground;

  // kelio žymėjimas
  for (let i = 0; i < N; i++) {
    if (i !== 7) {
      const a = P(7.44, i + 0.34), b = P(7.56, i + 0.66);
      g += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#fff" stroke-width="1.9" opacity=".5"/>`;
      const c = P(i + 0.34, 7.44), d = P(i + 0.66, 7.56);
      g += `<line x1="${c[0].toFixed(1)}" y1="${c[1].toFixed(1)}" x2="${d[0].toFixed(1)}" y2="${d[1].toFixed(1)}" stroke="#fff" stroke-width="1.9" opacity=".5"/>`;
    }
  }
  const crosswalk = (cx, cy, along) => {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const o = 0.12 + i * 0.16;
      const a = along === 'x'
        ? [P(cx + o, cy + .16), P(cx + o + .07, cy + .16), P(cx + o + .07, cy + .84), P(cx + o, cy + .84)]
        : [P(cx + .16, cy + o), P(cx + .84, cy + o), P(cx + .84, cy + o + .07), P(cx + .16, cy + o + .07)];
      s += poly(a, '#f4f7fb', 'opacity=".95"');
    }
    return s;
  };
  g += crosswalk(6, 7, 'x') + crosswalk(8, 7, 'x') + crosswalk(7, 6, 'y') + crosswalk(7, 8, 'y');

  // ================= PLOKŠTIEJI ELEMENTAI (klojami su žeme) =================
  // centrinė aikštė su fontanu
  let plaza = disc(7.5, 7.5, 1.2, '#e2e9f2');
  plaza += disc(7.5, 7.5, 0.95, '#cfd9e6');
  plaza += disc(7.5, 7.5, 0.62, '#a9d4ec');
  plaza += disc(7.5, 7.5, 0.34, '#7fbfe0');
  const [fx, fy] = P(7.5, 7.5, 0);
  plaza += `<ellipse cx="${fx.toFixed(1)}" cy="${(fy - 9).toFixed(1)}" rx="5.5" ry="7.5" fill="#ffffff" opacity=".85"/>`
    + `<rect x="${(fx - 1.8).toFixed(1)}" y="${(fy - 19).toFixed(1)}" width="3.6" height="14" fill="#eef3f9" rx="1.6"/>`
    + `<circle cx="${fx.toFixed(1)}" cy="${(fy - 21).toFixed(1)}" r="2.6" fill="#cfe9f8"/>`;
  // tvenkinys su atspindžiu
  let pond = disc(13.3, 3.6, 1.0, '#4fa8cc', 'opacity=".97"');
  pond += disc(13.3, 3.6, 0.84, '#63bcd8');
  pond += disc(13.05, 3.4, 0.46, '#8fd6ea', 'opacity=".7"');
  pond += disc(13.3, 3.6, 0.16, '#e8f6ff', 'opacity=".5"');
  // prekyvietės grindinys
  let market = disc(2.5, 14.2, 1.0, '#e8e2d4');
  market += disc(2.5, 14.2, 0.74, '#ded5c4');
  g += plaza + pond + market;

  // ================= ELEMENTAI (rikiuojama pagal priekinį kampą) =================
  const items = [];
  const solid = (gx, gy, w, d, fn) => items.push([gx + w + gy + d, fn]);
  const put = (depth, fn) => items.push([depth, fn]);

  BUILDINGS.forEach((b) => {
    solid(b.gx, b.gy, b.w, b.d, () => box(b.gx, b.gy, b.w, b.d, b.h, b.c, { ...b.o, lit }));
  });

  // pavadinimų etiketės (kiekviena iškart po savo pastato)
  put(8.4, () => label(1.6, 1.6, 60, 'Namai \u00b7 ' + Math.round(st.reserve || 0) + ' \u20ac'));
  put(8.8, () => label(4.75, 1.55, 74 + 26, 'Darboviet\u0117'));
  put(14.4, () => label(10.2, 1.65, 108 + 26, 'Bankas \u00b7 ' + Math.round(st.savings || 0) + ' \u20ac'));
  put(14.4, () => label(1.6, 10.2, 56 + 32, 'Bir\u017ea \u00b7 ' + Math.round(st.invest || 0) + ' \u20ac'));
  put(16.8, () => label(4.9, 9.9, 26 + lvl * 13 + 34, 'Kavos baras \u00b7 ' + Math.round(st.business || 0) + ' \u20ac'));
  put(27.2, () => label(11.5, 11.5, 26 + 36, 'Arena'));

  // gyvatvorės
  solid(0.3, 5.05, 5.4, 0.15, () => hedge(0.3, 5.05, 5.4, 0.15));
  solid(9.3, 4.7, 5.4, 0.15, () => hedge(9.3, 4.7, 5.4, 0.15));
  solid(0.3, 11.6, 5.4, 0.15, () => hedge(0.3, 11.6, 5.4, 0.15));
  solid(9.0, 13.7, 5.6, 0.15, () => hedge(9.0, 13.7, 5.6, 0.15));

  // sodai
  solid(2.8, 5.5, 0, 0, () => flowers(2.8, 5.5));
  solid(1.2, 5.5, 0, 0, () => flowers(1.2, 5.5, 0.9));
  solid(9.4, 3.8, 0, 0, () => flowers(9.4, 3.8));
  solid(12.4, 4.6, 0, 0, () => flowers(12.4, 4.6, 0.9));

  // kavos baras su terasa ir iškaba
  solid(4.0, 9.0, 1.8, 1.8, () => {
    const h = 26 + lvl * 13;
    let s = box(4.0, 9.0, 1.8, 1.8, h, '#f4a259', { windows: true, parapet: true, lit: true, floors: 2, base: '#d98b45' });
    const awn = [P(4.0, 10.8, h * 0.58), P(5.8, 10.8, h * 0.58), P(5.8, 11.25, h * 0.42), P(4.0, 11.25, h * 0.42)];
    s += poly(awn, '#e63946');
    for (let i = 0; i < 4; i++) {
      const a = P(4.0 + i * 0.45, 10.8, h * 0.58), b = P(4.0 + (i + 0.5) * 0.45, 10.8, h * 0.58);
      if (i % 2 === 0) s += poly([a, b, [b[0], b[1] + 8], [a[0], a[1] + 8]], '#fff', 'opacity=".92"');
    }
    const [sx2, sy2] = P(4.9, 10.8, h + 14);
    s += `<g transform="translate(${sx2.toFixed(1)},${sy2.toFixed(1)})">`
      + `<rect x="-13" y="-11" width="26" height="22" rx="5" fill="#0f1e3d"/>`
      + `<rect x="-8" y="-5" width="12" height="10" rx="2" fill="#f7f2e6"/>`
      + `<path d="M4 -4 q6 0 6 5 q0 5 -6 5" fill="none" stroke="#f7f2e6" stroke-width="2"/>`
      + `<rect x="-8" y="6.5" width="12" height="1.8" rx="0.9" fill="#f7f2e6"/>`
      + `<rect x="-2" y="-9" width="1.6" height="4" rx="0.8" fill="#f7f2e6" opacity=".7"/></g>`;
    [[4.15, 11.45], [5.65, 11.45]].forEach(([tx, ty]) => {
      const [px, py] = P(tx, ty, 0);
      s += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="6" ry="2.4" fill="#08101f" opacity=".18"/>`
        + `<rect x="-4" y="-4" width="8" height="4" rx="1.5" fill="#d9b28a"/><rect x="-1" y="-14" width="2" height="10" fill="#9aa7b8"/>`
        + `<ellipse cx="0" cy="-15" rx="9" ry="4.5" fill="#f2c94c"/><polygon points="-9,-15 9,-15 0,-21" fill="#f7d977"/></g>`;
    });
    if (lvl >= 3) {
      const [sx3, sy3] = P(4.9, 9.9, h + 24);
      s += `<g transform="translate(${sx3.toFixed(1)},${sy3.toFixed(1)})"><circle r="9" fill="#ffd166"/><path d="M-4,-2 L0,-6 L4,0" fill="none" stroke="#0f1e3d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    return s;
  });

  // biržos grafikas (nupieštas, ne emoji)
  put(14.6, () => {
    const [px, py] = P(1.6, 11.5, 64);
    const up = mood !== 'down';
    const col = up ? '#0a8f6f' : '#c0392b';
    const line = up ? 'M-10,6 L-3,-2 L3,3 L11,-9' : 'M-10,-8 L-3,0 L3,-5 L11,7';
    const head = up ? 'M5,-9 L11,-9 L11,-3' : 'M5,7 L11,7 L11,1';
    return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><circle r="13" fill="#ffffff" opacity=".92"/>`
      + `<path d="${line}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${head}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/></g>`;
  });

  // prekyvietės prekystaliai
  [[1.9, 13.8], [3.1, 13.8], [2.5, 14.7]].forEach(([sx, sy]) => {
    solid(sx, sy, 0, 0, () => stall(sx, sy));
  });

  // arena su tribūnomis (centras 11.5,11.5)
  solid(9.5, 9.5, 4.0, 4.0, () => {
    let s = shadow(9.7, 9.7, 3.6, 3.6, 7, 8, '.16');
    s += disc(11.5, 11.5, 2.0, '#b9c2cf');
    s += disc(11.5, 11.5, 1.86, '#cdd6e1');
    s += disc(11.5, 11.5, 1.72, '#9aa6b6');
    s += disc(11.5, 11.5, 1.58, '#c2ccd8');
    s += disc(11.5, 11.5, 1.44, '#a7b3c1');
    for (let i = 0; i < 28; i++) {
      const t = (i / 28) * Math.PI * 2;
      const p0 = P(11.5 + Math.cos(t) * 1.16, 11.5 + Math.sin(t) * 1.16, 6);
      const p1 = P(11.5 + Math.cos(t) * 1.7, 11.5 + Math.sin(t) * 1.7, 6);
      s += `<line x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="#7f8b9a" stroke-width=".8" opacity=".5"/>`;
    }
    s += disc(11.5, 11.5, 1.28, '#d9665c');
    s += disc(11.5, 11.5, 1.1, '#e07a70');
    s += disc(11.5, 11.5, 0.96, '#5fbf72');
    s += disc(11.5, 11.5, 0.76, '#6ecd80');
    const c0 = P(11.5, 11.5, 0.2);
    s += `<ellipse cx="${c0[0].toFixed(1)}" cy="${c0[1].toFixed(1)}" rx="${(0.46 * TW).toFixed(1)}" ry="${(0.46 * TH).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".75"/>`;
    const h0 = P(11.5, 10.8, 0.2), h1 = P(11.5, 12.2, 0.2);
    s += `<line x1="${h0[0].toFixed(1)}" y1="${h0[1].toFixed(1)}" x2="${h1[0].toFixed(1)}" y2="${h1[1].toFixed(1)}" stroke="#ffffff" stroke-width="1.2" opacity=".75"/>`;
    const gl = P(10.6, 11.5, 9), gl2 = P(10.6, 11.5, 14);
    const gr = P(12.4, 11.5, 9), gr2 = P(12.4, 11.5, 14);
    s += `<line x1="${gl[0].toFixed(1)}" y1="${gl[1].toFixed(1)}" x2="${gl2[0].toFixed(1)}" y2="${gl2[1].toFixed(1)}" stroke="#f4f7fb" stroke-width="2.4"/>`;
    s += `<line x1="${gr[0].toFixed(1)}" y1="${gr[1].toFixed(1)}" x2="${gr2[0].toFixed(1)}" y2="${gr2[1].toFixed(1)}" stroke="#f4f7fb" stroke-width="2.4"/>`;
    for (const [px2, py2] of [[9.8, 9.8], [13.2, 9.8], [9.8, 13.2], [13.2, 13.2]]) {
      const [px3, py3] = P(px2, py2, 0);
      s += `<g transform="translate(${px3.toFixed(1)},${py3.toFixed(1)})"><ellipse cx="1" cy="0" rx="4" ry="1.8" fill="#08101f" opacity=".2"/>`
        + `<rect x="-1.4" y="-28" width="2.8" height="28" fill="#8b98a8" rx="1.2"/>`
        + `<rect x="-6" y="-32" width="12" height="5" rx="2" fill="#d9e2ec"/></g>`;
    }
    return s;
  });

  // prieplauka prie tvenkinio
  solid(12.1, 3.7, 0.6, 0.5, () => {
    const a = P(12.1, 3.7, 4), b = P(12.7, 3.7, 4), c = P(12.7, 4.2, 4), d = P(12.1, 4.2, 4);
    let s = poly([a, b, c, d], '#c39a6b');
    for (let i = 0; i < 3; i++) {
      const p0 = P(12.18 + i * 0.24, 3.7, 4), p1 = P(12.18 + i * 0.24, 4.2, 4);
      s += `<line x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="#a97f52" stroke-width="1"/>`;
    }
    return s;
  });

  // augmenija
  const TREES = [
    ['tree', 3.0, 5.5, 0.9],
    ['tree', 1.0, 5.5, 0.9],
    ['tree', 5.0, 5.5, 0.95],
    ['pine', 5.6, 4.9, 0.9],
    ['tree', 9.4, 3.6, 0.95],
    ['tree', 11.2, 3.6, 0.9],
    ['bush', 12.4, 2.4, 0.9],
    ['tree', 14.6, 2.4, 0.9],
    ['tree', 14.6, 4.2, 0.9],
    ['tree', 3.4, 10.9, 0.9],
    ['tree', 5.6, 11.2, 0.95],
    ['bush', 5.6, 13.4, 0.9],
    ['tree', 0.6, 14.4, 0.9],
    ['tree', 0.6, 11.9, 0.9],
    ['tree', 9.0, 9.4, 0.9],
    ['tree', 12.4, 9.2, 0.9],
    ['tree', 14.6, 11.0, 0.9],
    ['tree', 9.0, 12.4, 0.9],
    ['pine', 14.6, 13.4, 0.9],
  ];
  TREES.forEach(([kind, x, y, s]) => {
    solid(x, y, 0, 0, () => (kind === 'tree' ? tree(x, y, s) : kind === 'pine' ? pine(x, y, s) : bush(x, y, s)));
  });

  // miesto baldai
  const LAMPS = [[6.5, 2.6], [6.5, 5.4], [6.5, 10.6], [6.5, 13.4], [8.5, 2.6], [8.5, 5.4], [8.5, 10.6], [8.5, 13.4], [2.6, 6.5], [5.0, 6.5], [10.0, 6.5], [13.0, 6.5], [2.6, 8.5], [5.0, 8.5], [10.0, 8.5], [13.0, 8.5]];
  LAMPS.forEach(([x, y]) => solid(x, y, 0, 0, () => lamp(x, y)));
  [[6.3, 6.3], [8.7, 8.7]].forEach(([x, y]) => solid(x, y, 0, 0, () => trafficLight(x, y)));
  [[5.6, 6.4], [9.4, 8.6]].forEach(([x, y]) => solid(x, y, 0, 0, () => hydrant(x, y)));
  [[6.4, 4.6], [8.6, 4.6], [6.4, 10.4], [8.6, 10.4]].forEach(([x, y]) => solid(x, y, 0, 0, () => planter(x, y)));
  [[6.4, 3.6], [6.4, 12.4], [3.2, 6.4], [10.2, 6.4], [9.2, 12.0], [14.6, 13.2]].forEach(([x, y]) => solid(x, y, 0, 0, () => bench(x, y)));

  // transportas
  solid(1.4, 7.35, 0, 0, () => car(1.4, 7.35, '#e05a4f'));
  solid(4.6, 7.75, 0, 0, () => car(4.6, 7.75, '#3b82f6', true));
  solid(10.4, 7.35, 0, 0, () => car(10.4, 7.35, '#f5a524'));
  solid(13.4, 7.75, 0, 0, () => car(13.4, 7.75, '#8b5cf6', true));
  solid(7.35, 1.6, 0, 0, () => bus(7.35, 1.6));
  solid(7.35, 10.6, 0, 0, () => car(7.35, 10.6, '#12b48c'));
  solid(7.75, 4.4, 0, 0, () => car(7.75, 4.4, '#e05a4f', true));
  solid(7.75, 13.4, 0, 0, () => car(7.75, 13.4, '#3b82f6'));

  if (st.debt > 0) {
    put(60, () => {
      const [bx, by] = P(7.5, 7.5, 10);
      return `<g transform="translate(${bx.toFixed(1)},${by.toFixed(1)})"><rect x="-48" y="-15" width="96" height="26" rx="13" fill="#e63946"/>`
        + `<text y="3.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Skola ${Math.round(st.debt)} \u20ac</text></g>`;
    });
  }

  items.sort((a, b) => a[0] - b[0]);
  g += items.map((i) => i[1]()).join('');

  if (mood === 'down') {
    g += disc(3.4, 9.4, 0.5, '#7f8ea6', 'opacity=".35"') + disc(10.2, 2.4, 0.4, '#7f8ea6', 'opacity=".3"')
      + disc(13.6, 12.4, 0.45, '#7f8ea6', 'opacity=".32"');
    let rain = '';
    for (let i = 0; i < 70; i++) {
      const x = (i * 47) % W, y = (i * 89) % (H - 40);
      rain += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}"/>`;
    }
    g += `<g stroke="#5b6b8a" stroke-width="1.3" opacity=".45">${rain}</g>`;
  }
  g += `<rect width="${W}" height="${H}" fill="url(#vig)" pointer-events="none"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Izometrinis miesto žemėlapis: gyvenamieji namai, biurų pastatas, banko bokštas, birža su kupolu, kavos baras, arena, parkas su tvenkiniu, aikštė su fontanu, prekyvietė, sporto aikštė, bulvarai su perėjomis ir transportu" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
