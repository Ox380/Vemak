// iso.js — procedūrinė izometrinė miesto scena (SVG). Jokių paveikslų failų:
// įkeliama akimirksniu net mokyklos kompiuteryje.
//
// Struktūra v3 (detalus miesto žemėlapis): 12x12 kvartalai, du bulvarai su šaligatviais,
// perėjos ir šviesoforai, centrinė aikštė su fontanu, parkas su tvenkiniu ir prieplauka,
// skirtingų tipų pastatai (gyvenamieji su dvišlaičiais stogais, biurų bokštas, bankas,
// birža su kupolu, arena su tribūnomis), transportas, žibintai, suoliukai, sodai,
// pėsčiųjų takai, lietaus balos.
//
// Art direction: tai vis dar „bazinis" variantas (sprendimas 20). Dizaineris gali pakeisti
// kiekvieną pastatą iliustruotu SVG/PNG sprite'u, naudodamas tas pačias tinklelio koordinates.
const TW = 26, TH = 13;      // plytelės pusė: plotis / aukštis
const OX = 400, OY = 118;    // tinklelio (0,0) ekrano pozicija
const N = 12;                // kvartalų skaičius kraštinėje
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

// deterministinis pseudo-atsitiktinis (kad scena visada būtų ta pati)
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
function disc(cx, cy, r, fill, extra = '', seg = 28) {
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
  if (opts.base) { // cokolinis aukštas
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
  if (opts.pitch) { // dvišlaitis stogas
    const midx = gx + w / 2;
    const a = P(gx, gy, h), b = P(gx + w, gy, h), c = P(gx + w, gy + d, h), e = P(gx, gy + d, h);
    const ra = P(midx, gy, h + w * 7), rb = P(midx, gy + d, h + w * 7);
    s += poly([a, b, ra], shade('#b8524c', 1.12)) + poly([c, e, rb], shade('#b8524c', 0.76));
    s += poly([a, ra, rb, e], shade('#b8524c', 0.94)) + poly([b, c, rb, ra], shade('#b8524c', 0.64));
  }
  if (opts.dome) { // kupolas su smaile (metalinė spalva, kad nesusilietų su augmenija)
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
  if (opts.sign) {
    const [sx, sy] = P(gx + w / 2, gy + d, h * 0.72);
    const sw = opts.sign.length * 6 + 14;
    s += `<g transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})"><rect x="${(-sw / 2).toFixed(1)}" y="-10" width="${sw}" height="18" rx="6" fill="#0f1e3d" opacity=".88"/>`
      + `<text y="3" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${opts.sign}</text></g>`;
  }
  return s;
}

// ---- augmenija ----
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

// ---- gatvės elementai ----
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
function planter(x, y) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="8" ry="3" fill="#08101f" opacity=".16"/>`
    + `<rect x="-6" y="-7" width="12" height="7" rx="2" fill="#b0bccb"/><rect x="-6" y="-7" width="12" height="2" rx="1" fill="#cfd8e4"/>`
    + `<ellipse cx="0" cy="-10" rx="6" ry="3.4" fill="#35b077"/><circle cx="-2" cy="-11" r="1.7" fill="#ff8fa3"/><circle cx="2.4" cy="-10.4" r="1.7" fill="#ffd166"/></g>`;
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
  if (mood === 'up') s += `<circle cx="700" cy="62" r="70" fill="url(#sunglow)"/><circle cx="700" cy="62" r="24" fill="#ffd166"/>`;
  s += mood === 'down'
    ? '<g fill="#64718a" opacity=".9"><ellipse cx="150" cy="66" rx="62" ry="19"/><ellipse cx="210" cy="56" rx="44" ry="16"/><ellipse cx="600" cy="84" rx="66" ry="19"/></g>'
    : '<g fill="#fff" opacity=".92"><ellipse cx="140" cy="66" rx="48" ry="14"/><ellipse cx="180" cy="58" rx="32" ry="12"/><ellipse cx="616" cy="88" rx="54" ry="14"/><ellipse cx="656" cy="82" rx="32" ry="11"/></g>';
  if (mood !== 'down') {
    s += '<g stroke="#5b6b80" stroke-width="1.6" fill="none" opacity=".55">'
      + '<path d="M300 92 q6 -6 12 0"/><path d="M316 100 q5 -5 10 0"/><path d="M286 104 q4 -4 8 0"/></g>';
  }
  return s;
}

// state: { level, savings, reserve, business, invest (total), mood: 'up'|'down'|'neutral', debt }
export function citySVG(st) {
  const lvl = st.level || 1, mood = st.mood || 'neutral';
  const r = rng(20261028);
  let g = sky(mood);

  // ================= ŽEMĖ =================
  const isRoad = (x, y) => x === 6 || y === 6;
  const isSidewalk = (x, y) => {
    const near = (a) => a === 5 || a === 7;
    return !isRoad(x, y) && (near(x) || near(y));
  };
  let ground = '';
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const t = [P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)];
    let col;
    if (isRoad(x, y)) col = (x + y) % 2 ? '#8d99ab' : '#96a2b4';
    else if (isSidewalk(x, y)) col = (x + y) % 2 ? '#dfe6ef' : '#e6ecf4';
    else {
      const v = r();
      col = (x + y) % 2 ? mix('#7fd18b', '#6cc47a', v * 0.5) : mix('#74c982', '#63bd74', v * 0.5);
    }
    ground += poly(t, col, 'stroke="#ffffff22" stroke-width=".6"');
  }
  // parko pėsčiųjų takai
  for (const [tx, ty] of [[2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 3], [9, 9], [9, 10], [10, 10]]) {
    ground += poly([P(tx + .08, ty + .08), P(tx + .92, ty + .08), P(tx + .92, ty + .92), P(tx + .08, ty + .92)], '#d9c9a8', 'opacity=".9"');
  }
  g += poly([P(0, N), P(N, N), P(N, N, -18), P(0, N, -18)], '#6b5b4b');
  g += poly([P(N, 0), P(N, N), P(N, N, -18), P(N, 0, -18)], '#53463a');
  g += ground;

  // kelio žymėjimas
  for (let i = 0; i < N; i++) {
    if (i !== 6) {
      const a = P(6.44, i + 0.34), b = P(6.56, i + 0.66);
      g += `<line x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}" stroke="#fff" stroke-width="1.9" opacity=".5"/>`;
      const c = P(i + 0.34, 6.44), d = P(i + 0.66, 6.56);
      g += `<line x1="${c[0].toFixed(1)}" y1="${c[1].toFixed(1)}" x2="${d[0].toFixed(1)}" y2="${d[1].toFixed(1)}" stroke="#fff" stroke-width="1.9" opacity=".5"/>`;
    }
  }
  // perėjos
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
  g += crosswalk(5, 6, 'x') + crosswalk(7, 6, 'x') + crosswalk(6, 5, 'y') + crosswalk(6, 7, 'y');

  // ================= AIKŠTĖ IR PARKAS =================
  let plaza = disc(6.5, 6.5, 1.0, '#e2e9f2');
  plaza += disc(6.5, 6.5, 0.82, '#cfd9e6');
  plaza += disc(6.5, 6.5, 0.55, '#a9d4ec');
  plaza += disc(6.5, 6.5, 0.30, '#7fbfe0');
  const [fx, fy] = P(6.5, 6.5, 0);
  plaza += `<ellipse cx="${fx.toFixed(1)}" cy="${(fy - 9).toFixed(1)}" rx="5.5" ry="7.5" fill="#ffffff" opacity=".85"/>`
    + `<rect x="${(fx - 1.8).toFixed(1)}" y="${(fy - 19).toFixed(1)}" width="3.6" height="14" fill="#eef3f9" rx="1.6"/>`
    + `<circle cx="${fx.toFixed(1)}" cy="${(fy - 21).toFixed(1)}" r="2.6" fill="#cfe9f8"/>`;

  let pond = disc(9.6, 3.3, 1.15, '#4fa8cc', 'opacity=".97"');
  pond += disc(9.6, 3.3, 1.0, '#63bcd8');
  pond += disc(9.35, 3.1, 0.55, '#8fd6ea', 'opacity=".7"');
  pond += disc(9.6, 3.3, 0.16, '#e8f6ff', 'opacity=".5"');

  // plokštieji elementai (aikštė, tvenkinys) klojami iškart ant žemės
  g += plaza + pond;

  // ================= ELEMENTAI (iš galo į priekį) =================
  const items = [];
  // Sluoksnis = objekto priekinis kampas (gx+w + gy+d). Taip piešiama teisinga tvarka:
  // tai, kas arčiau žiūrovo, uždengia tai, kas už jo. (Anksčiau sluoksniai buvo rašomi
  // ranka ir dėl to medis atsidurdavo ant stogo, o etiketė nukrypdavo.)
  const solid = (gx, gy, w, d, fn) => items.push([gx + w + gy + d, fn]);
  // rankinis sluoksnis etiketėms, kurios kabo virš pastatų
  const put = (depth, fn) => items.push([depth, fn]);

  const lit = mood === 'up';

  // prieplauka prie tvenkinio
  solid(8.55, 3.6, 0.6, 0.4, () => {
    const a = P(8.55, 3.6, 4), b = P(9.15, 3.6, 4), c = P(9.15, 4.0, 4), d = P(8.55, 4.0, 4);
    let s = poly([a, b, c, d], '#c39a6b');
    for (let i = 0; i < 3; i++) {
      const p0 = P(8.62 + i * 0.24, 3.6, 4), p1 = P(8.62 + i * 0.24, 4.0, 4);
      s += `<line x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="#a97f52" stroke-width="1"/>`;
    }
    return s;
  });

  // gyvenamasis kvartalas
  const houses = [
    [0.5, 0.5, 2.0, 2.0, 30, '#f2e3d0'],
    [2.7, 0.6, 1.7, 1.7, 34, '#e8d6c4'],
    [4.6, 0.5, 1.3, 1.3, 28, '#f0ded0'],
    [0.6, 2.8, 1.8, 1.8, 40, '#efe0cd'],
  ];
  houses.forEach(([hx, hy, hw, hd, hh, hc]) => {
    solid(hx, hy, hw, hd, () => box(hx, hy, hw, hd, hh, hc, { windows: true, pitch: true, lit, floors: 2 }));
  });
  put(5.3, () => label(1.5, 1.5, 30 + 30, 'Namai \u00b7 ' + Math.round(st.reserve || 0) + ' \u20ac'));
  solid(0.35, 4.5, 4.2, 0.22, () => hedge(0.35, 4.5, 4.2, 0.22));
  solid(1.1, 4.8, 0, 0, () => flowers(1.1, 4.8));
  solid(2.6, 4.3, 0, 0, () => flowers(2.6, 4.3));
  solid(3.8, 4.8, 0, 0, () => flowers(3.8, 4.8, 0.9));
  solid(2.6, 2.3, 0, 0, () => tree(2.6, 2.3, 0.9));
  solid(2.9, 4.2, 0, 0, () => pine(2.9, 4.2, 0.85));
  solid(4.6, 2.2, 0, 0, () => bush(4.6, 2.2, 0.95));
  solid(2.2, 2.6, 0, 0, () => bench(2.2, 2.6));
  solid(2.6, 2.9, 0, 0, () => bench(2.6, 2.9));

  // biuru pastatas (du turiai)
  solid(3.1, 2.6, 1.7, 1.7, () => box(3.1, 2.6, 1.7, 1.7, 56, '#dbe7f5', { windows: true, parapet: true, floors: 7, lit, base: '#b9c9dd', floorLine: true }));
  solid(3.4, 2.9, 1.1, 1.1, () => box(3.4, 2.9, 1.1, 1.1, 68, '#e6eef8', { windows: true, parapet: true, floors: 4, lit }));
  put(9.4, () => label(3.95, 3.45, 68 + 26, 'Darboviet\u0117'));

  // banko bokstas
  solid(7.6, 0.5, 2.1, 2.1, () => box(7.6, 0.5, 2.1, 2.1, 88, '#d3e5f7', { windows: true, parapet: true, floors: 13, lit, floorLine: true, antenna: true }));
  solid(7.95, 0.85, 1.4, 1.4, () => box(7.95, 0.85, 1.4, 1.4, 104, '#e3eefb', { windows: true, parapet: true, floors: 5, lit }));
  solid(9.95, 1.0, 1.1, 1.5, () => box(9.95, 1.0, 1.1, 1.5, 40, '#c6dbef', { windows: true, parapet: true, floors: 5, lit, base: '#a8bed6' }));
  put(13.8, () => label(8.65, 1.55, 104 + 26, 'Bankas \u00b7 ' + Math.round(st.savings || 0) + ' \u20ac'));
  solid(7.4, 2.9, 3.6, 0.22, () => hedge(7.4, 2.9, 3.6, 0.22));

  // parko augmenija
  solid(8.6, 3.5, 0, 0, () => tree(8.6, 3.5, 0.95));
  solid(10.4, 3.6, 0, 0, () => tree(10.4, 3.6, 1.05));
  solid(10.9, 4.3, 0, 0, () => pine(10.9, 4.3, 0.95));
  solid(8.9, 4.6, 0, 0, () => tree(8.9, 4.6, 0.85));
  solid(10.2, 4.7, 0, 0, () => bush(10.2, 4.7));
  solid(7.6, 4.5, 0, 0, () => bush(7.6, 4.5, 0.9));
  solid(8.0, 4.2, 0, 0, () => bench(8.0, 4.2));
  solid(10.6, 4.6, 0, 0, () => bench(10.6, 4.6));
  solid(9.3, 4.9, 0, 0, () => flowers(9.3, 4.9));

  // birza su kupolu
  solid(0.5, 7.5, 2.2, 2.2, () => box(0.5, 7.5, 2.2, 2.2, 46, '#a9dcd2', { windows: true, parapet: true, floors: 5, lit, base: '#8dc9bd' }));
  solid(0.95, 7.95, 1.3, 1.3, () => box(0.95, 7.95, 1.3, 1.3, 54, '#bfe7df', { windows: true, dome: '#d9a441', floors: 2 }));
  put(12.6, () => {
    const [px, py] = P(1.6, 9.8, 62);
    const up = mood !== 'down';
    const col = up ? '#0a8f6f' : '#c0392b';
    const line = up ? 'M-10,6 L-3,-2 L3,3 L11,-9' : 'M-10,-8 L-3,0 L3,-5 L11,7';
    const head = up ? 'M5,-9 L11,-9 L11,-3' : 'M5,7 L11,7 L11,1';
    return `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><circle r="13" fill="#ffffff" opacity=".92"/>`
      + `<path d="${line}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`
      + `<path d="${head}" fill="none" stroke="${col}" stroke-width="2.6" stroke-linecap="round"/></g>`;
  });
  put(12.8, () => label(1.6, 8.6, 54 + 32, 'Bir\u017ea \u00b7 ' + Math.round(st.invest || 0) + ' \u20ac'));

  // kavos baras su terasa
  solid(3.1, 7.6, 1.7, 1.7, () => {
    const h = 26 + lvl * 13;
    let s = box(3.1, 7.6, 1.7, 1.7, h, '#f4a259', { windows: true, parapet: true, lit: true, floors: 2, base: '#d98b45' });
    const awn = [P(3.1, 9.3, h * 0.58), P(4.8, 9.3, h * 0.58), P(4.8, 9.75, h * 0.42), P(3.1, 9.75, h * 0.42)];
    s += poly(awn, '#e63946');
    for (let i = 0; i < 4; i++) {
      const a = P(3.1 + i * 0.42, 9.3, h * 0.58), b = P(3.1 + (i + 0.5) * 0.42, 9.3, h * 0.58);
      if (i % 2 === 0) s += poly([a, b, [b[0], b[1] + 8], [a[0], a[1] + 8]], '#fff', 'opacity=".92"');
    }
    // iškaba su puodeliu (nupiešta, ne emoji - kad veiktų ir be emoji šrifto)
    const [sx2, sy2] = P(3.95, 9.3, h + 14);
    s += `<g transform="translate(${sx2.toFixed(1)},${sy2.toFixed(1)})">`
      + `<rect x="-13" y="-11" width="26" height="22" rx="5" fill="#0f1e3d"/>`
      + `<rect x="-8" y="-5" width="12" height="10" rx="2" fill="#f7f2e6"/>`
      + `<path d="M4 -4 q6 0 6 5 q0 5 -6 5" fill="none" stroke="#f7f2e6" stroke-width="2"/>`
      + `<rect x="-8" y="6.5" width="12" height="1.8" rx="0.9" fill="#f7f2e6"/>`
      + `<rect x="-2" y="-9" width="1.6" height="4" rx="0.8" fill="#f7f2e6" opacity=".7"/></g>`;
    [[3.2, 9.9], [4.3, 9.9]].forEach(([tx, ty]) => {
      const [px, py] = P(tx, ty, 0);
      s += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="6" ry="2.4" fill="#08101f" opacity=".18"/>`
        + `<rect x="-4" y="-4" width="8" height="4" rx="1.5" fill="#d9b28a"/><rect x="-1" y="-14" width="2" height="10" fill="#9aa7b8"/>`
        + `<ellipse cx="0" cy="-15" rx="9" ry="4.5" fill="#f2c94c"/><polygon points="-9,-15 9,-15 0,-21" fill="#f7d977"/></g>`;
    });
    if (lvl >= 3) {
      const [sx, sy] = P(3.95, 8.45, h + 24);
      s += `<g transform="translate(${sx.toFixed(1)},${sy.toFixed(1)})"><circle r="9" fill="#ffd166"/><text y="4" text-anchor="middle" font-size="11" font-weight="800" fill="#0f1e3d">\u2605</text></g>`;
    }
    return s;
  });
  put(14.4, () => label(3.95, 8.8, 26 + lvl * 13 + 34, 'Kavos baras \u00b7 ' + Math.round(st.business || 0) + ' \u20ac'));

  // arena: betoninis žiedas, dviejų pakopų tribūnos, bėgimo takas, veja, vartai, prožektoriai
  solid(7.35, 7.35, 3.5, 3.5, () => {
    let s = shadow(7.5, 7.5, 3.2, 3.2, 7, 8, '.16');
    s += disc(9.1, 9.1, 1.85, '#b9c2cf');
    s += disc(9.1, 9.1, 1.72, '#cdd6e1');
    s += disc(9.1, 9.1, 1.62, '#9aa6b6');
    s += disc(9.1, 9.1, 1.5, '#c2ccd8');
    s += disc(9.1, 9.1, 1.38, '#a7b3c1');
    for (let i = 0; i < 26; i++) {   // sėdimos vietos
      const t = (i / 26) * Math.PI * 2;
      const p0 = P(9.1 + Math.cos(t) * 1.12, 9.1 + Math.sin(t) * 1.12, 6);
      const p1 = P(9.1 + Math.cos(t) * 1.62, 9.1 + Math.sin(t) * 1.62, 6);
      s += `<line x1="${p0[0].toFixed(1)}" y1="${p0[1].toFixed(1)}" x2="${p1[0].toFixed(1)}" y2="${p1[1].toFixed(1)}" stroke="#7f8b9a" stroke-width=".8" opacity=".5"/>`;
    }
    s += disc(9.1, 9.1, 1.22, '#d9665c');
    s += disc(9.1, 9.1, 1.05, '#e07a70');
    s += disc(9.1, 9.1, 0.92, '#5fbf72');
    s += disc(9.1, 9.1, 0.72, '#6ecd80');
    const c0 = P(9.1, 9.1, 0.2);
    s += `<ellipse cx="${c0[0].toFixed(1)}" cy="${c0[1].toFixed(1)}" rx="${(0.44 * TW).toFixed(1)}" ry="${(0.44 * TH).toFixed(1)}" fill="none" stroke="#ffffff" stroke-width="1.2" opacity=".75"/>`;
    const h0 = P(9.1, 9.1 - 0.7, 0.2), h1 = P(9.1, 9.1 + 0.7, 0.2);
    s += `<line x1="${h0[0].toFixed(1)}" y1="${h0[1].toFixed(1)}" x2="${h1[0].toFixed(1)}" y2="${h1[1].toFixed(1)}" stroke="#ffffff" stroke-width="1.2" opacity=".75"/>`;
    const gl = P(8.32, 9.1, 9), gl2 = P(8.32, 9.1, 14);
    const gr = P(9.88, 9.1, 9), gr2 = P(9.88, 9.1, 14);
    s += `<line x1="${gl[0].toFixed(1)}" y1="${gl[1].toFixed(1)}" x2="${gl2[0].toFixed(1)}" y2="${gl2[1].toFixed(1)}" stroke="#f4f7fb" stroke-width="2.4"/>`;
    s += `<line x1="${gr[0].toFixed(1)}" y1="${gr[1].toFixed(1)}" x2="${gr2[0].toFixed(1)}" y2="${gr2[1].toFixed(1)}" stroke="#f4f7fb" stroke-width="2.4"/>`;
    for (const [fx2, fy2] of [[7.85, 7.85], [10.35, 7.85], [7.85, 10.35], [10.35, 10.35]]) {
      const [px, py] = P(fx2, fy2, 0);
      s += `<g transform="translate(${px.toFixed(1)},${py.toFixed(1)})"><ellipse cx="1" cy="0" rx="4" ry="1.8" fill="#08101f" opacity=".2"/>`
        + `<rect x="-1.4" y="-26" width="2.8" height="26" fill="#8b98a8" rx="1.2"/>`
        + `<rect x="-6" y="-30" width="12" height="5" rx="2" fill="#d9e2ec"/></g>`;
    }
    return s;
  });
  put(22.0, () => label(9.1, 9.1, 26 + 36, 'Arena'));
  solid(9.4, 11.2, 0, 0, () => tree(9.4, 11.2, 0.95));
  solid(11.0, 10.9, 0, 0, () => tree(11.0, 10.9, 0.9));
  solid(10.9, 7.5, 0, 0, () => bush(10.9, 7.5, 0.95));

  // smulkus pastatai
  solid(0.6, 5.0, 1.4, 1.2, () => box(0.6, 5.0, 1.4, 1.2, 26, '#e7d3bd', { windows: true, pitch: true, lit }));
  solid(2.4, 5.1, 1.5, 1.1, () => box(2.4, 5.1, 1.5, 1.1, 22, '#f0dcc6', { windows: true, parapet: true, lit }));
  solid(4.4, 5.0, 1.2, 1.3, () => box(4.4, 5.0, 1.2, 1.3, 30, '#dce8f4', { windows: true, parapet: true, lit, floors: 3 }));
  solid(4.5, 10.4, 1.6, 1.4, () => box(4.5, 10.4, 1.6, 1.4, 24, '#e9d8c4', { windows: true, pitch: true, lit }));
  solid(7.0, 10.6, 1.4, 1.2, () => box(7.0, 10.6, 1.4, 1.2, 28, '#dbe7f5', { windows: true, parapet: true, lit, floors: 3 }));

  // transportas
  solid(1.2, 6.35, 0, 0, () => car(1.2, 6.35, '#e05a4f'));
  solid(4.0, 6.75, 0, 0, () => car(4.0, 6.75, '#3b82f6', true));
  solid(8.2, 6.35, 0, 0, () => car(8.2, 6.35, '#f5a524'));
  solid(6.35, 2.2, 0, 0, () => bus(6.35, 2.2));
  solid(6.35, 9.6, 0, 0, () => car(6.35, 9.6, '#8b5cf6'));
  solid(6.75, 4.6, 0, 0, () => car(6.75, 4.6, '#12b48c', true));

  // zibintai, sviesoforai, hidrantai, sodai
  for (const [lx, ly] of [[5.6, 2.4], [5.6, 4.7], [5.6, 9.2], [2.4, 4.85], [8.4, 5.6], [5.6, 9.9], [10.6, 5.6], [2.6, 10.4]]) {
    solid(lx, ly, 0, 0, () => lamp(lx, ly));
  }
  solid(5.4, 4.6, 0, 0, () => trafficLight(5.4, 4.6));
  solid(7.6, 7.6, 0, 0, () => trafficLight(7.6, 7.6));
  solid(5.5, 7.6, 0, 0, () => hydrant(5.5, 7.6));
  solid(9.2, 5.5, 0, 0, () => hydrant(9.2, 5.5));
  solid(5.5, 4.4, 0, 0, () => planter(5.5, 4.4));
  solid(7.4, 5.5, 0, 0, () => planter(7.4, 5.5));
  solid(2.0, 4.8, 0, 0, () => flowers(2.0, 4.8, 0.9));

  if (st.debt > 0) {
    put(40, () => {
      const [bx, by] = P(6.5, 6.5, 9);
      return `<g transform="translate(${bx.toFixed(1)},${by.toFixed(1)})"><rect x="-48" y="-15" width="96" height="26" rx="13" fill="#e63946"/>`
        + `<text y="3.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Skola ${Math.round(st.debt)} \u20ac</text></g>`;
    });
  }

  items.sort((a, b) => a[0] - b[0]);
  g += items.map((i) => i[1]()).join('');

  if (mood === 'down') {
    g += disc(3.4, 9.4, 0.5, '#7f8ea6', 'opacity=".35"') + disc(8.2, 2.2, 0.4, '#7f8ea6', 'opacity=".3"');
    let rain = '';
    for (let i = 0; i < 55; i++) {
      const x = (i * 47) % W, y = (i * 89) % (H - 40);
      rain += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}"/>`;
    }
    g += `<g stroke="#5b6b8a" stroke-width="1.3" opacity=".45">${rain}</g>`;
  }
  g += `<rect width="${W}" height="${H}" fill="url(#vig)" pointer-events="none"/>`;

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Izometrinis miesto žemėlapis: namai, biurų pastatas, bankas, birža, kavos baras, arena, parkas su tvenkiniu, aikštė su fontanu, bulvarai su perėjomis ir transportu" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
