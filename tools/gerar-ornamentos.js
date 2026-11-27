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

/** Curva de Bézier com as duas pontas incluídas. */
const bez = (p0, c0, c1, p1) => [p0, ...bezier(p0, c0, c1, p1), p1];

/**
 * Gancho duplo em S: duas espirais ligadas por uma curva, grosso no meio e fino nas pontas.
 * Retorna { svg, w } centrado em (ox + w/2, MID).
 */
function sScroll(ox, { R = 22, d = 24, turns = 1.55, wMax = 10, wMin = 1.6, flip = false, rotate = 0, scale = 1, ink }) {
  const w = (2 * d + 2 * R + 24) * scale;
  const A = spiral(-d, 0, R, turns, Math.PI / 2, 1);       // centro -> base da espiral esquerda
  const B = A.map(([x, y]) => [-x, -y]).reverse();          // simetria pontual: topo da direita -> centro
  const pA = A[A.length - 1], pB = B[0], k = d * 1.1;
  const line = A.concat(bezier(pA, [pA[0] + k, pA[1]], [pB[0] - k, pB[1]], pB), B);
  const d1 = tapered(line, (u) => wMin + (wMax - wMin) * Math.pow(Math.sin(Math.PI * u), 0.55));
  // Bornéu: pente de 3 espinhos curtos saindo do lado de fora de cada espiral, curvados no sentido do giro
  let thorns = '';
  [[-d, Math.PI, 1], [d, 0, -1]].forEach(([cx, mid, sg]) => {
    [-0.62, 0, 0.62].forEach((da, k) => {
      const th = mid + da, r0 = R * 0.9, len = k === 1 ? 14 : 10;
      const p0 = [cx + r0 * Math.cos(th), r0 * Math.sin(th)];
      const nx = Math.cos(th), ny = Math.sin(th), tx = -ny * sg, ty = nx * sg;
      const p1 = [p0[0] + nx * len + tx * 4.5, p0[1] + ny * len + ty * 4.5];
      const c0 = [p0[0] + nx * len * 0.45, p0[1] + ny * len * 0.45];
      const c1 = [p0[0] + nx * len * 0.85 + tx * 1, p0[1] + ny * len * 0.85 + ty * 1];
      thorns += `<path d="${tapered(bez(p0, c0, c1, p1), (u) => 0.3 + 6.4 * Math.pow(1 - u, 0.8))}"/>`;
    });
  });
  const eyes = `<circle cx="${f(A[0][0])}" cy="${f(A[0][1])}" r="2.6"/><circle cx="${f(B[B.length - 1][0])}" cy="${f(B[B.length - 1][1])}" r="2.6"/>`;
  const tr = `translate(${f(ox + w / 2)} ${MID}) rotate(${rotate}) scale(${scale} ${flip ? -scale : scale})`;
  return { svg: `<g transform="${tr}" fill="${ink}"><path d="${d1}"/>${thorns}${eyes}</g>`, w };
}

/** Bunga terung: anel central com pétalas em gancho girando no mesmo sentido. */
function terung(ox, { ringR = 12, petals = 6, rs = 10, ink, accent, paper, look = 0, scale = 1 }) {
  const ext = ringR + 2 * rs - 1;
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
  return { svg: `<g transform="translate(${f(cx)} ${MID}) scale(${scale})" fill="${ink}">${out}</g>`, w };
}

/* ---------- artes do Marco (MARCO SURREAL AESTHETICS/ARTES FAIXA SITE.png) ----------
   Vetorizadas com tools/faixa-artes/vetorizar.js (Potrace) e guardadas em tools/faixa-artes/artes.json. */
const ARTES = JSON.parse(fs.readFileSync(path.join(__dirname, 'faixa-artes', 'artes.json'), 'utf8'));

/** Coloca uma arte com altura h, centrada na faixa. flip espelha; cor 'acc' usa a cor de destaque. */
function arte(ox, { nome, h = 60, flip = false, cor, dy = 0, ink, accent }) {
  const a = ARTES[nome], k = h / a.h, w = a.w * k;
  const tx = flip ? ox + w : ox;
  const fill = cor === 'acc' ? accent : ink;
  return { svg: `<path fill="${fill}" fill-rule="evenodd" transform="translate(${f(tx)} ${f(MID - h / 2 + dy)}) scale(${f(flip ? -k : k)} ${f(k)})" d="${a.d}"/>`, w };
}

/** Dois olhos empilhados, um levemente deslocado do outro. */
function olhos(ox, { de = ['olho2', 'olho6'], h = 26, ink, accent }) {
  const A = ARTES[de[0]], B = ARTES[de[1]];
  const wa = A.w * h / A.h, wb = B.w * h / B.h, w = Math.max(wa, wb) + 8;
  const top = arte(ox + (w - wa) / 2 - 4, { nome: de[0], h, dy: -17, ink, accent });
  const bot = arte(ox + (w - wb) / 2 + 4, { nome: de[1], h, dy: 17, ink, accent });
  return { svg: top.svg + bot.svg, w };
}

/** Bordas: só a fieira de olhinhos (bolinha com pupila), como as contas da base do GRAAL. Sem a linha. */
function teethBorder(W, ink, paper) {
  const n = Math.round(W / 15), tw = W / n;
  let beads = '';
  for (let i = 0; i < n; i++) {
    const x = f(i * tw + tw / 2);
    for (const y of [10.5, H - 10.5]) beads += `<circle cx="${x}" cy="${y}" r="3.3" fill="${paper}" stroke="${ink}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="1.3"/>`;
  }
  return `<g fill="${ink}">${beads}</g>`;
}

const MOTIVOS = { terung, arte, olhos };

function build(sequence, { ink, accent, paper }) {
  let x = 0, body = '';
  sequence.forEach((item) => {
    const g = MOTIVOS[item.type](x, { ink, accent, paper, ...item });
    body += g.svg;
    x += g.w + (item.gap ?? 18);
  });
  const W = Math.round(x);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMid meet">` +
    teethBorder(W, ink, paper) + body + '</svg>\n';
}

const INK = '#121110', COTTON = '#ECE8D4', VERMILION = '#D93829', OCHRE = '#E2A025', FOREST = '#162A24';

// Composição: a flor e as espirais marcam o ritmo; entre elas, olhos, nuvens e fogo.
// O olho tribal fica no centro, com um fogo de cada lado espelhado (simetria de ornamento).
const sequencia = [
  { type: 'terung' },
  { type: 'arte', nome: 'espiralS', h: 50 },
  { type: 'olhos', de: ['olho2', 'olho6'] },
  { type: 'arte', nome: 'espiralDupla', h: 48 },
  { type: 'arte', nome: 'nuvem1', h: 60 },
  { type: 'arte', nome: 'fogo1', h: 52, cor: 'acc', gap: 4 },
  { type: 'arte', nome: 'olhoTribal', h: 62, gap: 4 },
  { type: 'arte', nome: 'fogo1', h: 52, cor: 'acc', flip: true },
  { type: 'arte', nome: 'nuvem2', h: 60, flip: true },
  { type: 'arte', nome: 'espiralDupla', h: 48 },
  { type: 'olhos', de: ['olho11', 'olho5'] },
  { type: 'arte', nome: 'espiralS', h: 50, flip: true }
];
// faixa creme: mesma ideia com as outras peças (olho de fogo, fogo 2, nuvem 3, olhos de pálpebra)
const sequenciaCreme = [
  { type: 'terung' },
  { type: 'arte', nome: 'espiralDupla', h: 48 },
  { type: 'olhos', de: ['olho4', 'olho10'] },
  { type: 'arte', nome: 'espiralS', h: 50 },
  { type: 'arte', nome: 'nuvem3', h: 56 },
  { type: 'arte', nome: 'fogo2', h: 52, cor: 'acc', gap: 6 },
  { type: 'arte', nome: 'olhoFogo', h: 54, gap: 6 },
  { type: 'arte', nome: 'fogo2', h: 52, cor: 'acc', flip: true },
  { type: 'arte', nome: 'nuvem3', h: 56, flip: true },
  { type: 'arte', nome: 'espiralS', h: 50, flip: true },
  { type: 'olhos', de: ['olho7', 'olho1'] },
  { type: 'arte', nome: 'espiralDupla', h: 48 }
];

const files = {
  'ornamento-espiral.svg': build(sequencia, { ink: INK, accent: VERMILION, paper: COTTON }),
  'ornamento-terung.svg': build(sequenciaCreme, { ink: INK, accent: VERMILION, paper: COTTON }),
  'ornamento-espiral-claro.svg': build(sequencia, { ink: COTTON, accent: OCHRE, paper: FOREST })
};

const outDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), svg);
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  console.log(`${name}  ${vb[1]}x${vb[2]}  ratio=${(vb[1] / vb[2]).toFixed(4)}  ${(svg.length / 1024).toFixed(1)} KB`);
}
