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

/* ---------- motivos novos, tirados das artes da pasta MARCO SURREAL AESTHETICS ----------
   Todos são desenhados em volta de (0, 0) e retornam { svg, w }. */

const ptsStr = (pts) => 'M' + pts.map((p) => f(p[0]) + ' ' + f(p[1])).join('L');

/** Um olho da Mulher Multiolhos: pálpebra de cima grossa passando do canto, sombra colorida em arco
    por cima, pálpebra de baixo fina, íris preta com brilho e 3 cílios no canto de fora. */
function umOlho(x, y, { ink, accent, paper, mirror = false, closed = false }) {
  const m = mirror ? -1 : 1, P = (px, py) => [x + m * px, y + py];
  let o = '';
  // sombra colorida acima da pálpebra
  o += `<path fill="${accent}" d="${tapered(bez(P(-12, -3.5), P(-6, -13.5), P(6, -13.5), P(12.5, -4)), (u) => 0.4 + 4.2 * Math.sin(Math.PI * u))}"/>`;
  if (closed) {
    // olho piscando: só a pálpebra fechada, curvada para baixo
    o += `<path d="${tapered(bez(P(-13, -1), P(-6, 6), P(6, 6), P(13.5, -1.5)), (u) => 0.6 + 3 * Math.sin(Math.PI * u))}"/>`;
  } else {
    o += `<path fill="${paper}" d="M${f(P(-12, 0)[0])} ${f(y)}Q${f(x)} ${f(y - 9)} ${f(P(12, 0)[0])} ${f(y)}Q${f(x)} ${f(y + 8)} ${f(P(-12, 0)[0])} ${f(y)}Z"/>`;
    o += `<circle cx="${f(P(0.5, 0)[0])}" cy="${f(y + 0.3)}" r="4.6"/>`;
    o += `<circle cx="${f(P(2, 0)[0])}" cy="${f(y - 1.2)}" r="1.5" fill="${paper}"/>`;
    o += `<path d="${tapered(bez(P(-13, 0.6), P(-6, -9.5), P(6, -9.5), P(13.8, -0.6)), (u) => 0.6 + 3.2 * Math.sin(Math.PI * u))}"/>`;
    o += `<path d="${tapered(bez(P(-9.5, 2.5), P(-4, 7.8), P(4, 7.8), P(9.5, 2.5)), (u) => 0.4 + 1.5 * Math.sin(Math.PI * u))}"/>`;
  }
  // cílios curvados para fora no canto de fora
  [[7, -5.2, 5], [10.2, -3.4, 6.5], [12.8, -1.2, 5.5]].forEach(([lx, ly, len]) => {
    const yy = closed ? ly + 5.5 : ly;
    o += `<path d="${tapered(bez(P(lx, yy), P(lx + 1, yy - len * 0.6), P(lx + 2.6, yy - len * 0.9), P(lx + 4.2, yy - len)), (u) => 0.3 + 1.6 * (1 - u))}"/>`;
  });
  return o;
}

/** Vários olhinhos simples: três olhos espalhados, um deles piscando. */
function olhinhos(ox, { ink, accent, paper }) {
  const w = 92, cx = ox + w / 2;
  const s = umOlho(-14, -13, { ink, accent, paper, mirror: true }) +
    umOlho(16, -6, { ink, accent, paper, closed: true }) +
    umOlho(-3, 17, { ink, accent, paper });
  return { svg: `<g transform="translate(${f(cx)} ${MID}) scale(1.32)" fill="${ink}">${s}</g>`, w };
}

/** Nuvem oriental: contorno de bolinhas, caracóis por dentro e rabichos em chama nas pontas. */
let nuvemId = 0;
function nuvem(ox, { ink, flip = false }) {
  const w = 108, cx = ox + w / 2, id = 'nv' + (nuvemId++), sw = 4;
  const lobes = [[-24, 9, 11], [-11, -4, 14], [7, -10, 13], [23, 0, 11], [10, 11, 11], [-6, 12, 10]];
  let s = `<mask id="${id}" maskUnits="userSpaceOnUse" x="-70" y="-50" width="140" height="100"><rect x="-70" y="-50" width="140" height="100" fill="#fff"/>` +
    lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#000"/>`).join('') + '</mask>';
  s += `<g mask="url(#${id})">` + lobes.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + sw}"/>`).join('') + '</g>';
  // caracóis por dentro (uma volta e pouco, engrossando para fora)
  [[-11, -4, 7.5, 0.3], [7, -10, 7, 2.3], [-24, 9, 5.5, 3.8], [23, 0, 5.5, 5.4], [10, 11, 5, 1]].forEach(([x, y, r, a0]) => {
    const pts = [];
    for (let k = 0; k <= 50; k++) { const t = k / 50, th = a0 + 1.15 * TAU * t, rr = r * (0.12 + 0.88 * t); pts.push([x + rr * Math.cos(th), y + rr * Math.sin(th)]); }
    s += `<path d="${tapered(pts, (u) => 0.8 + 2.2 * u)}"/>`;
  });
  // rabichos em chama saindo das pontas
  s += `<path d="${tapered(bez([-33, 14], [-42, 18], [-44, 4], [-53, 3]), (u) => 0.3 + 5.5 * Math.pow(1 - u, 0.8))}"/>`;
  s += `<path d="${tapered(bez([31, -5], [39, -11], [41, -19], [50, -23]), (u) => 0.3 + 5.5 * Math.pow(1 - u, 0.8))}"/>`;
  return { svg: `<g transform="translate(${f(cx)} ${MID}) scale(${flip ? -1 : 1} 1)" fill="${ink}">${s}</g>`, w };
}

/** Fogo: línguas de chama onduladas subindo de uma base, com uma cópia colorida deslocada atrás
    (como o fogo laranja do flash de blackwork). */
function fogo(ox, { ink, accent }) {
  const w = 84, cx = ox + w / 2;
  const tongues = [[-22, 24, -6, 1.1], [-11, 28, -26, 1.5], [0, 30, -36, 1.3], [11, 28, -24, 1.55], [22, 24, -8, 1.05]];
  let shapes = '';
  tongues.forEach(([x0, y0, y1, ph], i) => {
    const pts = [], lean = x0 * 0.35;
    for (let k = 0; k <= 60; k++) {
      const t = k / 60, y = y0 + (y1 - y0) * t;
      const x = x0 + lean * t * t + 5.5 * Math.sin(t * TAU * ph + i * 1.7) * Math.sin(Math.PI * Math.min(1, t * 1.3));
      pts.push([x, y]);
    }
    shapes += `<path d="${tapered(pts, (u) => 0.3 + 9 * Math.pow(1 - u, 0.7))}"/>`;
  });
  // base arredondada juntando as línguas
  shapes += `<path d="M-27 23Q-28 34 0 35Q28 34 27 23Q13 28 0 28Q-13 28 -27 23Z"/>`;
  // faíscas soltas
  shapes += `<path d="${tapered(bez([-27, 2], [-29, -4], [-26, -9], [-29, -14]), (u) => 0.3 + 3.4 * (1 - u))}"/>`;
  shapes += `<path d="${tapered(bez([27, -2], [29, -8], [26, -13], [29, -18]), (u) => 0.3 + 3.4 * (1 - u))}"/>`;
  const svg = `<g transform="translate(2.6 1.6)" fill="${accent}">${shapes}</g><g fill="${ink}">${shapes}</g>`;
  return { svg: `<g transform="translate(${f(cx)} ${MID})">${svg}</g>`, w };
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

const MOTIVOS = { terung, s: sScroll, olhinhos, nuvem, fogo };

function build(sequence, { ink, accent, paper }) {
  let x = 0, body = '';
  sequence.forEach((item) => {
    const g = MOTIVOS[item.type](x, { ink, accent, paper, ...item });
    body += g.svg;
    x += g.w + (item.gap ?? 10);
  });
  const W = Math.round(x);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMid meet">` +
    teethBorder(W, ink, paper) + body + '</svg>\n';
}

const INK = '#121110', COTTON = '#ECE8D4', VERMILION = '#D93829', OCHRE = '#E2A025', FOREST = '#162A24';

// flor > S > olhinhos > S > nuvem > S > flor > S > fogo > S (e repete)
const sequencia = [
  { type: 'terung' }, { type: 's' }, { type: 'olhinhos' }, { type: 's', flip: true }, { type: 'nuvem' },
  { type: 's' }, { type: 'terung', petals: 7 }, { type: 's', flip: true }, { type: 'fogo' }, { type: 's' }
];
// faixa creme: a mesma ideia começando em outro ponto, para as faixas não ficarem iguais
const sequenciaCreme = [
  { type: 'nuvem', flip: true }, { type: 's' }, { type: 'terung' }, { type: 's', flip: true }, { type: 'fogo' },
  { type: 's' }, { type: 'olhinhos' }, { type: 's', flip: true }, { type: 'terung', petals: 7 }, { type: 's' }
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
