// iso.js — procedural 2.5D isometric city (SVG). No image files: loads instantly on school hardware.
// Art direction: this is the placeholder "base" (decision 20). A designer can replace each building()
// with an illustrated SVG/PNG sprite using the same grid coordinates.
const TW = 34, TH = 17; // half tile width/height
const OX = 330, OY = 70;
const P = (x, y, z = 0) => [OX + (x - y) * TW, OY + (x + y) * TH - z];
const pts = (a) => a.map((p) => p.map((n) => n.toFixed(1)).join(',')).join(' ');
const poly = (a, fill, extra = '') => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = (v) => Math.max(0, Math.min(255, Math.round(v * f)));
  return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => c(v).toString(16).padStart(2, '0')).join('');
}

function box(gx, gy, w, d, h, color, opts = {}) {
  const top = [P(gx, gy, h), P(gx + w, gy, h), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const left = [P(gx, gy + d, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx, gy + d, h)];
  const right = [P(gx + w, gy, 0), P(gx + w, gy + d, 0), P(gx + w, gy + d, h), P(gx + w, gy, h)];
  let s = poly(left, shade(color, 0.82)) + poly(right, shade(color, 0.62)) + poly(top, opts.top || shade(color, 1.12));
  if (opts.windows) {
    const cols = Math.max(1, Math.floor(w * 1.6)), rows = Math.max(1, Math.floor(h / 22));
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const u0 = (i + 0.25) / cols, u1 = (i + 0.75) / cols, v0 = (j + 0.3) / rows, v1 = (j + 0.7) / rows;
      const q = (u, v) => P(gx + w * u, gy + d, h * v);
      s += poly([q(u0, v0), q(u1, v0), q(u1, v1), q(u0, v1)], opts.lit ? '#ffe9a8' : '#bfe3f5', 'opacity=".9"');
    }
  }
  return s;
}

function tree(x, y, s = 1) {
  const [px, py] = P(x, y, 0);
  return `<g transform="translate(${px},${py})"><rect x="-2" y="-14" width="4" height="14" fill="#8a5a33"/><ellipse cx="0" cy="-22" rx="${11 * s}" ry="${13 * s}" fill="#2aa36b"/><ellipse cx="-3" cy="-26" rx="${6 * s}" ry="${7 * s}" fill="#41c284"/></g>`;
}

function label(x, y, z, text) {
  const [px, py] = P(x, y, z);
  const w = text.length * 7.2 + 18;
  return `<g transform="translate(${px},${py})"><rect x="${-w / 2}" y="-12" width="${w}" height="22" rx="11" fill="#12213f" opacity=".92"/><text x="0" y="3.5" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="system-ui,sans-serif">${text}</text></g>`;
}

function cafe(gx, gy, level) {
  const h = 30 + level * 16;
  let s = box(gx, gy, 2, 2, h, '#f4a259', { windows: true, lit: true });
  const awn = [P(gx, gy + 2, h * 0.55), P(gx + 2, gy + 2, h * 0.55), P(gx + 2, gy + 2.5, h * 0.4), P(gx, gy + 2.5, h * 0.4)];
  s += poly(awn, '#e63946');
  for (let i = 0; i < 4; i++) {
    const a = P(gx + i * 0.5, gy + 2, h * 0.55), b = P(gx + (i + 0.5) * 0.5, gy + 2, h * 0.55);
    if (i % 2 === 0) s += poly([a, b, [b[0], b[1] + 8], [a[0], a[1] + 8]], '#fff', 'opacity=".9"');
  }
  const [cx, cy] = P(gx + 1, gy + 2, h + 6);
  s += `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="20">☕</text>`;
  if (level >= 2) s += box(gx + 2.2, gy + 0.2, 0.9, 1.4, 22, '#fcd581', { windows: true });
  if (level >= 3) s += `<g transform="translate(${P(gx + 1, gy + 1, h + 20).join(',')})"><circle r="9" fill="#ffd166"/><text y="4" text-anchor="middle" font-size="11" font-weight="800" fill="#12213f">★</text></g>`;
  return s;
}

function sky(mood) {
  const stops = { up: ['#9fe3ff', '#e9fbff'], down: ['#8c9bb3', '#cfd6e2'], neutral: ['#a9dcff', '#eaf6ff'] }[mood] || ['#a9dcff', '#eaf6ff'];
  return `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${stops[0]}"/><stop offset="1" stop-color="${stops[1]}"/></linearGradient></defs><rect width="660" height="430" fill="url(#sky)" rx="18"/>`;
}

// state: { level, savings, reserve, business, invest (total), mood: 'up'|'down'|'neutral', debt }
export function citySVG(st) {
  const lvl = st.level || 1, mood = st.mood || 'neutral';
  let g = sky(mood);
  g += mood === 'down'
    ? '<g fill="#6b7893" opacity=".85"><ellipse cx="130" cy="60" rx="55" ry="18"/><ellipse cx="180" cy="50" rx="40" ry="16"/><ellipse cx="500" cy="75" rx="60" ry="18"/></g>'
    : '<g fill="#fff" opacity=".9"><ellipse cx="120" cy="60" rx="45" ry="14"/><ellipse cx="155" cy="52" rx="30" ry="12"/><ellipse cx="520" cy="80" rx="50" ry="14"/></g>';
  if (mood === 'up') g += '<circle cx="580" cy="48" r="22" fill="#ffd166"/>';

  // ground
  const N = 7;
  let ground = '';
  for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
    const road = x === 3 || y === 3;
    const col = road ? ((x + y) % 2 ? '#7b8798' : '#808c9e') : ((x + y) % 2 ? '#7fd18b' : '#74c982');
    ground += poly([P(x, y), P(x + 1, y), P(x + 1, y + 1), P(x, y + 1)], col, 'stroke="#ffffff22" stroke-width=".6"');
  }
  const slab = [P(0, N), P(N, N), P(N, N, -14), P(0, N, -14)];
  const slabR = [P(N, 0), P(N, N), P(N, N, -14), P(N, 0, -14)];
  g += poly(slab, '#6b5b4b') + poly(slabR, '#53463a') + ground;
  // road dashes
  for (let i = 0; i < N; i++) {
    if (i !== 3) {
      const a = P(3.45, i + 0.4), b = P(3.55, i + 0.6); g += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#fff" stroke-width="2" opacity=".6"/>`;
    }
  }

  // draw back-to-front (by gx+gy)
  const items = [];
  items.push([0.2, () => box(0.5, 0.5, 2, 2, 44, '#e9d8c4', { windows: true }) + `<polygon points="${pts([P(0.4, 0.4, 44), P(2.6, 0.4, 44), P(1.5, 1.5, 70), P(1.5, 1.5, 70)])}" fill="#c0504d"/>`]);
  items.push([1, () => label(1.5, 1.5, 78, 'Namai · ' + Math.round(st.reserve || 0) + ' €')]);
  items.push([1.8, () => box(4.2, 0.5, 2.2, 2.2, 52, '#dce6f2', { windows: true }) + box(4.1, 2.6, 2.4, 0.3, 8, '#b8c4d6') + [0, 1, 2, 3].map((i) => box(4.3 + i * 0.55, 2.7, 0.2, 0.2, 40, '#f5f7fb')).join('')]);
  items.push([2, () => label(5.3, 1.6, 62, 'Bankas · ' + Math.round(st.savings || 0) + ' €')]);
  items.push([6, () => box(0.4, 4.2, 2.2, 2.2, 38 + Math.min(40, Math.round((st.invest || 0) / 40)), '#9bd1c7', { windows: true }) + `<g transform="translate(${P(1.5, 6.4, 20).join(',')})"><text text-anchor="middle" font-size="18">${mood === 'down' ? '📉' : '📈'}</text></g>`]);
  items.push([6.2, () => label(1.5, 5.3, 92, 'Birža · ' + Math.round(st.invest || 0) + ' €')]);
  items.push([7.5, () => cafe(4.3, 4.3, lvl)]);
  items.push([8, () => label(5.3, 5.4, 52 + lvl * 16 + 20, 'Kavos baras · ' + Math.round(st.business || 0) + ' €')]);
  items.push([3.2, () => tree(3.5, 0.2) + tree(3.5, 6.7, 1.1)]);
  items.push([7, () => tree(0.3, 3.4, 1.1) + tree(6.8, 3.4)]);
  if (st.debt > 0) items.push([9, () => `<g transform="translate(${P(3.5, 3.5, 10).join(',')})"><rect x="-44" y="-14" width="88" height="24" rx="12" fill="#e63946"/><text y="3" text-anchor="middle" font-size="12" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">Skola ${Math.round(st.debt)} €</text></g>`]);
  items.sort((a, b) => a[0] - b[0]);
  g += items.map((i) => i[1]()).join('');
  if (mood === 'down') {
    let rain = '';
    for (let i = 0; i < 36; i++) { const x = (i * 53) % 660, y = (i * 97) % 380; rain += `<line x1="${x}" y1="${y}" x2="${x - 6}" y2="${y + 16}"/>`; }
    g += `<g stroke="#5b6b8a" stroke-width="1.4" opacity=".55">${rain}</g>`;
  }
  return `<svg viewBox="0 0 660 430" role="img" aria-label="Izometrinis miestas: namai, bankas, birža ir kavos baras" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}
