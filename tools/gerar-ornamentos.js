/*
 * Gera as faixas ornamentais (estilo tatuagem de Bornéu / Dayak) usadas no lugar dos marquees de texto.
 * Uso: node tools/gerar-ornamentos.js
 * Saída: assets/img/ornamento-*.svg
 *
 * Cada SVG é um "ladrilho" que se repete na horizontal sem emenda.
 * Para usar um desenho próprio, basta substituir o arquivo SVG mantendo a altura do viewBox (120).
 */
const fs = require('fs');
const path = require('path');

const H = 120;
const MID = H / 2;
const TAU = Math.PI * 2;
const f = (n) => Math.round(n * 100) / 100;

/** Transforma uma linha central em forma chapada com espessura variável (traço de agulha que afina). */
function tapered(pts, widthAt) {
  const len = [0];
  for (let i = 1; i < pts.length; i++) {
    len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = len[len.length - 1];
  const left = [], right = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1;
    tx /= m; ty /= m;
    const w = widthAt(len[i] / total) / 2;
    left.push([p[0] - ty * w, p[1] + tx * w]);
    right.push([p[0] + ty * w, p[1] - tx * w]);
  });
  const all = left.concat(right.reverse());
  return 'M' + all.map((p) => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
}

/** Espiral de Arquimedes do centro (s=0) até a borda (s=1). */
function spiral(cx, cy, R, turns, endAngle, dir, steps = 90) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps;
    const th = endAngle + dir * turns * TAU * (1 - s);
    const r = R * (0.1 + 0.9 * s);
    pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
  }
  return pts;
}

function bezier(p0, c0, c1, p1, steps = 30) {
  const pts = [];
  for (let i = 1; i < steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t * t * t * p1[1]
    ]);
  }
  return pts;
}

/**
 * Gancho duplo em S: duas espirais ligadas por uma curva, grosso no meio e fino nas pontas.
 * Retorna { svg, w } centrado em (ox + w/2, MID).
 */
function sScroll(ox, { R = 22, d = 24, turns = 1.55, wMax = 10, wMin = 1.6, flip = false, rotate = 0, scale = 1, ink }) {
  const w = (2 * d + 2 * R) * scale;
  const A = spiral(-d, 0, R, turns, Math.PI / 2, 1);       // centro -> base da espiral esquerda
  const B = A.map(([x, y]) => [-x, -y]).reverse();          // simetria pontual: topo da direita -> centro
  const pA = A[A.length - 1], pB = B[0], k = d * 1.1;
  const line = A.concat(bezier(pA, [pA[0] + k, pA[1]], [pB[0] - k, pB[1]], pB), B);
  const d1 = tapered(line, (u) => wMin + (wMax - wMin) * Math.pow(Math.sin(Math.PI * u), 0.55));
  const eyes = `<circle cx="${f(A[0][0])}" cy="${f(A[0][1])}" r="2.6"/><circle cx="${f(B[B.length - 1][0])}" cy="${f(B[B.length - 1][1])}" r="2.6"/>`;
  const tr = `translate(${f(ox + w / 2)} ${MID}) rotate(${rotate}) scale(${scale} ${flip ? -scale : scale})`;
  return { svg: `<g transform="${tr}" fill="${ink}"><path d="${d1}"/>${eyes}</g>`, w };
}

/** Bunga terung: anel central com pétalas em gancho girando no mesmo sentido. */
function terung(ox, { ringR = 12, petals = 6, rs = 10, ink, accent, scale = 1 }) {
  const ext = ringR + 2 * rs + 2;
  const w = 2 * ext * scale + 8;
  const cx = ox + w / 2;
  let out = '';
  for (let i = 0; i < petals; i++) {
    const phi = (i / petals) * TAU;
    const Rp = ringR + rs;
    const c = [Rp * Math.cos(phi), Rp * Math.sin(phi)];
    const pts = [];
    const steps = 70, turns = 1.15;
    for (let j = steps; j >= 0; j--) {          // borda (presa no anel) -> centro da espiral
      const s = j / steps;
      const th = phi + Math.PI - turns * TAU * (1 - s);
      const r = rs * (0.12 + 0.88 * s);
      pts.push([c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]);
    }
    out += `<path d="${tapered(pts, (u) => 1.4 + 7.5 * Math.pow(1 - u, 0.8))}"/>`;
  }
  out += `<circle r="${ringR}" fill="none" stroke="${ink}" stroke-width="4.5"/>`;
  out += `<circle r="${f(ringR * 0.42)}" fill="${accent}"/>`;
  for (let i = 0; i < petals; i++) {             // pontos de respiro entre as pétalas
    const phi = ((i + 0.5) / petals) * TAU;
    out += `<circle cx="${f((ext - 1) * Math.cos(phi))}" cy="${f((ext - 1) * Math.sin(phi))}" r="2.2"/>`;
  }
  return { svg: `<g transform="translate(${f(cx)} ${MID}) scale(${scale})" fill="${ink}">${out}</g>`, w };
}

/** Borda superior e inferior com fileira de "dentes" triangulares. */
function teethBorder(W, ink) {
  const n = Math.round(W / 12), tw = W / n;
  let top = '', bot = '';
  for (let i = 0; i < n; i++) {
    const x = i * tw;
    top += `M${f(x)} 6L${f(x + tw)} 6L${f(x + tw / 2)} 14Z`;
    bot += `M${f(x)} ${H - 6}L${f(x + tw)} ${H - 6}L${f(x + tw / 2)} ${H - 14}Z`;
  }
  return `<g fill="${ink}"><rect y="1.5" width="${W}" height="2.5"/><rect y="${H - 4}" width="${W}" height="2.5"/><path d="${top}${bot}"/></g>`;
}

function build(sequence, { ink, accent }) {
  let x = 0, body = '';
  sequence.forEach((item) => {
    const g = item.type === 'terung'
      ? terung(x, { ink, accent, ...item })
      : sScroll(x, { ink, ...item });
    body += g.svg;
    x += g.w + (item.gap ?? 10);
  });
  const W = Math.round(x);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMid meet">` +
    teethBorder(W, ink) + body + '</svg>\n';
}

const INK = '#121110', COTTON = '#F0F1D8', VERMILION = '#D93829', OCHRE = '#E2A025';

const espiral = [
  { type: 'terung' },
  { type: 's' }, { type: 's', flip: true }, { type: 's' }, { type: 's', flip: true }
];
const terungSeq = [
  { type: 'terung' },
  { type: 's', rotate: 90, scale: 0.82, gap: 14 },
  { type: 'terung', petals: 6, scale: 0.8 },
  { type: 's', rotate: 90, scale: 0.82, flip: true, gap: 14 }
];

const files = {
  'ornamento-espiral.svg': build(espiral, { ink: INK, accent: VERMILION }),
  'ornamento-terung.svg': build(terungSeq, { ink: INK, accent: VERMILION }),
  'ornamento-espiral-claro.svg': build(espiral, { ink: COTTON, accent: OCHRE })
};

const outDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), svg);
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  console.log(`${name}  ${vb[1]}x${vb[2]}  ratio=${(vb[1] / vb[2]).toFixed(4)}  ${(svg.length / 1024).toFixed(1)} KB`);
}
