/*
 * Gera as faixas ornamentais do site, na estética do Marco Surreal:
 * tribal / Bornéu (espinhos em gancho), olhos concêntricos, olhinhos, flores de pétalas ondulando,
 * nuvens orientais com caracóis, e a "sombra deslocada" colorida atrás do preto (como nos flashes).
 *
 * Uso: node tools/gerar-ornamentos.js
 * Saída: assets/img/faixa-*.svg  (versão escura sobre o creme e versão "-claro" sobre o verde)
 *
 * Cada SVG é um ladrilho que se repete na horizontal sem emenda. Altura do viewBox: 120.
 * As cores são as mesmas das faixas antigas: tinta + vermelho no creme, creme + ocre no verde.
 */
const fs = require('fs');
const path = require('path');

const H = 120, MID = H / 2, TAU = Math.PI * 2;
const f = (n) => Math.round(n * 100) / 100;
const P = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');
let uid = 0;

/* ---------- geometria ---------- */

/** Linha central -> forma chapada com espessura variável (traço que afina, como agulha). */
function tapered(pts, widthAt) {
  const len = [0];
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len[len.length - 1] || 1;
  const L = [], R = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1];
    const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m;
    const w = widthAt(len[i] / total) / 2;
    L.push([p[0] - ty * w, p[1] + tx * w]);
    R.push([p[0] + ty * w, p[1] - tx * w]);
  });
  return P(L.concat(R.reverse())) + 'Z';
}

function bez(p0, c0, c1, p1, steps = 40) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([
      u * u * u * p0[0] + 3 * u * u * t * c0[0] + 3 * u * t * t * c1[0] + t * t * t * p1[0],
      u * u * u * p0[1] + 3 * u * u * t * c0[1] + 3 * u * t * t * c1[1] + t * t * t * p1[1]
    ]);
  }
  return pts;
}

const circle = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
/** Espinho: grosso na base, termina em ponta. */
const thorn = (p0, c0, c1, p1, w) => tapered(bez(p0, c0, c1, p1), (u) => 0.3 + w * Math.pow(1 - u, 0.85));
/** Folha / lâmina: fina nas duas pontas. */
const blade = (p0, c0, c1, p1, w) => tapered(bez(p0, c0, c1, p1), (u) => 0.4 + w * Math.pow(Math.sin(Math.PI * u), 0.7));
/** Espiral (caracol) de dentro para fora. */
function spiralPts(cx, cy, R, turns, a0, dir = 1, steps = 80) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const s = i / steps, th = a0 + dir * turns * TAU * s, r = R * (0.08 + 0.92 * s);
    pts.push([cx + r * Math.cos(th), cy + r * Math.sin(th)]);
  }
  return pts;
}
const mirrorX = (pts) => pts.map(([x, y]) => [-x, y]);
const rot = (pts, a) => pts.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]);

/* ---------- motivos ----------
   Cada motivo é desenhado em volta de (0, 0) e recebe (ink, acc).
   Retorna { svg, w } — w é a largura ocupada. */

/** Olho tribal: anel preto, olho colorido, ganchos girando em volta e "pente" de espinhos dos lados. */
function olhoTribal(ink, acc) {
  let s = `<path fill-rule="evenodd" d="${circle(0, 0, 22)}${circle(0, 0, 14)}"/>`;
  s += `<circle r="9" fill="${acc}"/><circle r="3.6"/>`;
  // ganchos em volta do anel (como os do TRIBALZINHO), girando no mesmo sentido
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const base = rot([[19, -6], [30, -8], [38, 2], [36, 14]], a);
    s += `<path d="${thorn(base[0], base[1], base[2], base[3], 8.5)}"/>`;
  }
  // pente de espinhos nos dois lados
  [-1, 1].forEach((sx) => {
    [[-8, 15], [0, 22], [8, 15]].forEach(([y, len]) => {
      const x0 = sx * 19;
      s += `<path d="${thorn([x0, y], [x0 + sx * len * 0.35, y + 0.5], [x0 + sx * len * 0.7, y + 1], [x0 + sx * (len + 10), y + 1.5], 6)}"/>`;
    });
  });
  return { svg: s, w: 100 };
}

/** Olhinhos: dois olhos amendoados empilhados, com cílios em chama no de cima. */
function olhinhos(ink, acc) {
  const eye = (cy, lashes) => {
    let s = `<path fill="none" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round" d="M-15 ${cy}Q0 ${cy - 13} 15 ${cy}Q0 ${cy + 13} -15 ${cy}Z"/>`;
    s += `<circle cy="${cy}" r="5.2" fill="${acc}"/><circle cy="${cy}" r="2.1"/>`;
    if (lashes) [-8, 0, 8].forEach((x) => {
      const y0 = cy - 6.8 + Math.abs(x) * 0.16;
      s += `<path d="${thorn([x, y0], [x + 1.5, y0 - 3], [x - 1.5, y0 - 6], [x + 1, y0 - 10], 2.6)}"/>`;
    });
    return s;
  };
  return { svg: eye(-15, true) + eye(19, false), w: 34 };
}

/** Espinha tribal horizontal: losango com estrela no centro, chifres em gancho e olhos nas pontas. */
function espinha(ink, acc) {
  let s = `<path fill="${acc}" stroke="${ink}" stroke-width="2.6" stroke-linejoin="round" d="M0 -19L12 0L0 19L-12 0Z"/>`;
  s += `<path d="M0 -8Q1.2 -1.2 8 0Q1.2 1.2 0 8Q-1.2 1.2 -8 0Q-1.2 -1.2 0 -8Z"/>`;
  [-1, 1].forEach((sx) => {
    const X = (x) => sx * x;
    // chifres em crescente que abrem e voltam a ponta para fora (Bornéu)
    s += `<path d="${thorn([X(8), -8], [X(16), -26], [X(38), -34], [X(56), -24], 9)}"/>`;
    s += `<path d="${thorn([X(8), 8], [X(16), 26], [X(38), 34], [X(56), 24], 9)}"/>`;
    s += `<path d="${blade([X(11), 0], [X(26), -2], [X(44), -2], [X(60), 0], 10)}"/>`;
    s += `<circle cx="${X(32)}" cy="-0.8" r="3.2" fill="${acc}"/>`;
    // espinhos curtos entre o chifre e a lâmina
    s += `<path d="${thorn([X(18), -5], [X(26), -9], [X(32), -14], [X(40), -15], 4)}"/>`;
    s += `<path d="${thorn([X(18), 5], [X(26), 9], [X(32), 14], [X(40), 15], 4)}"/>`;
  });
  return { svg: s, w: 122 };
}

/** Flor: pétalas ondulando em catavento, contornadas, com miolo em caracol (como a FLOR TRIBAL). */
function flor(ink, acc, { petals = 7, dir = 1 } = {}) {
  let s = '';
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * TAU;
    const line = [];
    for (let k = 0; k <= 40; k++) {
      const t = k / 40, r = 8 + 30 * t;
      const th = a + dir * 0.6 * t + 0.16 * t * Math.sin(t * TAU * 1.6);
      line.push([r * Math.cos(th), r * Math.sin(th)]);
    }
    s += `<path fill="${acc}" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round" d="${tapered(line, (u) => 0.5 + 9 * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * u)), 0.75))}"/>`;
  }
  // miolo ondulado
  const rim = [];
  for (let k = 0; k <= 72; k++) { const th = (k / 72) * TAU, r = 11 + 1.3 * Math.sin(th * 9); rim.push([r * Math.cos(th), r * Math.sin(th)]); }
  s += `<path fill="${acc}" stroke="${ink}" stroke-width="2.4" d="${P(rim)}Z"/>`;
  s += `<path d="${tapered(spiralPts(0, 0, 7.5, 1.6, 0, dir), (u) => 2.2)}"/>`;
  return { svg: s, w: 92 };
}

/** Nuvem oriental: contorno de vários lóbulos, caracóis por dentro e rabichos em chama nas pontas. */
function nuvem(ink, acc, { flip = false } = {}) {
  const lobes = [[-26, 8, 11], [-12, -3, 14], [6, -9, 13], [22, 0, 11], [9, 10, 11], [-8, 11, 10]];
  const id = 'n' + (uid++);
  const sw = 2.6;
  let s = `<mask id="${id}" maskUnits="userSpaceOnUse" x="-80" y="-60" width="160" height="120"><rect x="-80" y="-60" width="160" height="120" fill="#fff"/>` +
    lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('') + '</mask>';
  s += `<g mask="url(#${id})">` + lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + sw}"/>`).join('') + '</g>';
  // caracóis dentro dos lóbulos maiores
  [[-12, -3, 7, 0.4], [6, -9, 6.5, 2.2], [-26, 8, 5, 3.6], [22, 0, 5, 5.6]].forEach(([x, y, r, a0]) => {
    s += `<path d="${tapered(spiralPts(x, y, r, 1.05, a0, 1), (u) => 0.6 + 2 * u)}"/>`;
  });
  // rabichos (chama) saindo dos dois lados
  s += `<path d="${thorn([-34, 13], [-42, 16], [-44, 4], [-52, 2], 5)}"/>`;
  s += `<path d="${thorn([30, -4], [38, -10], [40, -18], [48, -22], 5)}"/>`;
  s += `<path d="${thorn([28, 7], [36, 12], [42, 10], [48, 14], 3.6)}"/>`;
  return { svg: flip ? `<g transform="scale(-1 1)">${s}</g>` : s, w: 106 };
}

/* ---------- montagem ---------- */

/** Bordas de cima e de baixo com a fileira de dentes (a parte ornamental que já existia). */
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

const MOTIFS = { olhoTribal, olhinhos, espinha, flor, nuvem };

function build(sequence, { ink, acc }) {
  let x = 0, body = '';
  const gap = 12;
  sequence.forEach((item) => {
    const fn = MOTIFS[item.m], sc = item.scale || 1, dy = item.dy || 0;
    const shadow = fn(acc, acc, item).svg;          // cópia toda na cor de destaque…
    const main = fn(ink, acc, item);                 // …e o desenho por cima
    const w = main.w * sc;
    const cx = x + gap / 2 + w / 2;
    body += `<g transform="translate(${f(cx)} ${MID + dy}) scale(${sc})">` +
      `<g transform="translate(2.6 2.4)" fill="${acc}">${shadow.replace(/stroke="[^"]*"/g, `stroke="${acc}"`)}</g>` +
      `<g fill="${ink}">${main.svg}</g></g>`;
    x += w + gap;
  });
  const W = Math.round(x);
  // a largura arredondada tem que bater com o conteúdo para a emenda ficar invisível
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMid meet">` +
    teethBorder(W, ink) + body + '</svg>\n';
}

const INK = '#121110', COTTON = '#ECE8D4', VERMILION = '#D93829', OCHRE = '#E2A025';
const ESCURO = { ink: INK, acc: VERMILION }, CLARO = { ink: COTTON, acc: OCHRE };

const SEQ = {
  olhos: [{ m: 'olhoTribal' }, { m: 'olhinhos' }, { m: 'espinha' }, { m: 'olhinhos' }],
  flores: [{ m: 'flor' }, { m: 'olhinhos' }, { m: 'flor', dir: -1, petals: 6, scale: 0.8 }, { m: 'espinha', scale: 0.85 }],
  nuvens: [{ m: 'nuvem' }, { m: 'flor', scale: 0.72 }, { m: 'nuvem', flip: true }, { m: 'olhoTribal', scale: 0.8 }]
};

const outDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, seq] of Object.entries(SEQ)) {
  for (const [suffix, colors] of [['', ESCURO], ['-claro', CLARO]]) {
    const svg = build(seq, colors);
    const file = `faixa-${name}${suffix}.svg`;
    fs.writeFileSync(path.join(outDir, file), svg);
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    console.log(`${file}  ${vb[1]}x${vb[2]}  ratio=${vb[1]}/${vb[2]}  ${(svg.length / 1024).toFixed(1)} KB`);
  }
}
