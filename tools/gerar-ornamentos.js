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
    out += `<path d="${tapered(pts, (u) => 1.3 + 6.8 * Math.pow(1 - u, 0.8))}"/>`;
  }
  out += `<circle r="${ringR}" fill="none" stroke="${ink}" stroke-width="4.1"/>`;
  out += `<circle r="${f(ringR * 0.42)}" fill="${accent}"/>`;
  return { svg: `<g transform="translate(${f(cx)} ${MID}) scale(${scale})" fill="${ink}">${out}</g>`, w };
}

/* ---------- fogo ----------
   Três línguas de fogo no mesmo traço do S: cada uma nasce numa espiral áurea (cresce φ a cada quarto
   de volta), sai por cima indo para a frente e afina até a ponta, com uma chicotada no fim.
   Os tamanhos seguem Fibonacci: espirais 21 / 13 / 8 e comprimentos 84 / 52 / 32. */
const PHI = (1 + Math.sqrt(5)) / 2;
function lingua(c, R, L, wMax, { voltas = 1.5, sobe = 0.03, onda = 0.35, flick = 0.1, w0 = 0.3, k1 = 0.6, k2 = 0.85 } = {}) {
  const T = voltas * TAU, pts = [], N = 80, end = -Math.PI / 2;
  for (let i = 0; i <= N; i++) {
    const t = i / N, th = end - T * (1 - t), r = R * Math.pow(PHI, -(T * (1 - t)) / (Math.PI / 2));
    pts.push([c[0] + r * Math.cos(th), c[1] + r * Math.sin(th)]);
  }
  const p0 = pts[pts.length - 1];
  const mid = [p0[0] + L * 0.55, p0[1] - L * sobe * 0.5 + L * onda * 0.25];
  const tip = [p0[0] + L, p0[1] - L * sobe - L * flick];
  const a1 = bezier(p0, [p0[0] + L * 0.25, p0[1]], [mid[0] - L * 0.2, mid[1]], mid, 30);
  const a2 = bezier(mid, [mid[0] + L * 0.2, mid[1]], [tip[0] - L * 0.12, tip[1] + L * flick * 0.8], tip, 30);
  const all = pts.concat(a1, [mid], a2, [tip]), ns = pts.length / all.length;
  return tapered(all, (u) => u < ns ? wMax * (w0 + (1 - w0) * Math.pow(u / ns, k1)) : 0.3 + (wMax - 0.3) * Math.pow(1 - (u - ns) / (1 - ns), k2));
}
const FOGO_D = [[[0, 4], 21, 84, 17], [[28, -28], 13, 52, 12.5], [[30, 18], 8, 32, 9]].map(([c, R, L, w]) => lingua(c, R, L, w)).join(' ');
const FOGO_BOX = (() => {
  const n = FOGO_D.match(/-?\d+(\.\d+)?/g).map(Number), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
})();
/**
 * Fogo com altura h, na cor de destaque. A cabeça (espirais) vai na frente, as pontas ficam para trás.
 * Desenhado indo para a esquerda; vira sozinho nas faixas que andam para a direita (rev).
 */
function fogo(ox, { h = 50, flipY = false, rev = false, accent }) {
  const k = h / FOGO_BOX.h, w = FOGO_BOX.w * k, fx = rev ? -k : k, fy = flipY ? -k : k;
  const tx = (rev ? ox + w : ox) - FOGO_BOX.x * fx, ty = MID + (flipY ? 1 : -1) * h / 2 - FOGO_BOX.y * fy;
  return { svg: `<path fill="${accent}" transform="translate(${f(tx)} ${f(ty)}) scale(${f(fx)} ${f(fy)})" d="${FOGO_D}"/>`, w };
}

/* ---------- artes do Marco (MARCO SURREAL AESTHETICS/ARTES FAIXA SITE.png) ----------
   Vetorizadas com tools/faixa-artes/vetorizar.js (Potrace) e guardadas em tools/faixa-artes/artes.json. */
const ARTES = JSON.parse(fs.readFileSync(path.join(__dirname, 'faixa-artes', 'artes.json'), 'utf8'));
/* Elementos orientais (água, vento, pedra): vetorizados das imagens de referência do Marco em
   "MARCO SURREAL AESTHETICS/elementos oriental/IMAGENS CHAT" com tools/faixa-elementos/vetorizar.js. */
Object.assign(ARTES, JSON.parse(fs.readFileSync(path.join(__dirname, 'faixa-elementos', 'elementos.json'), 'utf8')));

/**
 * Coloca uma arte com altura h, centrada na faixa.
 * flip espelha na horizontal, flipY na vertical; cor 'acc' usa a cor de destaque.
 * engrossa: soma um contorno da mesma cor (em unidades da faixa), para os olhinhos pequenos não sumirem.
 */
function arte(ox, { nome, h = 50, rot = 0, flip = false, flipY = false, cor, dy = 0, engrossa = 0, segue = false, rev = false, ink, accent }) {
  if (segue && rev) flip = !flip; // peças com direção (o fogo) viram nas faixas que andam para a direita
  const a = ARTES[nome], fill = cor === 'acc' ? accent : ink;
  // rot = giro em graus; a caixa é recalculada com o desenho já girado, e h vale para essa caixa
  let bx = 0, by = 0, bw = a.w, bh = a.h;
  if (rot) {
    const n = a.d.match(/-?\d+(\.\d+)?/g).map(Number), c = Math.cos(rot * Math.PI / 180), sn = Math.sin(rot * Math.PI / 180);
    const xs = [], ys = [];
    for (let i = 0; i + 1 < n.length; i += 2) { xs.push(n[i] * c - n[i + 1] * sn); ys.push(n[i] * sn + n[i + 1] * c); }
    bx = Math.min(...xs); by = Math.min(...ys); bw = Math.max(...xs) - bx; bh = Math.max(...ys) - by;
  }
  const k = h / bh, w = bw * k;
  const tx = flip ? ox + w : ox, ty = MID - h / 2 + dy + (flipY ? h : 0);
  const st = engrossa ? ` stroke="${fill}" stroke-width="${f(engrossa / k)}" stroke-linejoin="round"` : '';
  const giro = rot ? ` translate(${f(-bx)} ${f(-by)}) rotate(${rot})` : '';
  return { svg: `<path fill="${fill}"${st} fill-rule="evenodd" transform="translate(${f(tx)} ${f(ty)}) scale(${f(flip ? -k : k)} ${f(flipY ? -k : k)})${giro}" d="${a.d}"/>`, w };
}

/** Sorteio com semente: o mesmo cacho sai igual toda vez que o gerador roda. */
function sorteio(seed) {
  return () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/**
 * Cacho de olhinhos. As fileiras são simétricas de cima para baixo (ex. 2-3-2 ou 3-2-3) e cada olho
 * leva um empurrãozinho sorteado (posição e lado para onde olha), então o cacho parece solto,
 * sem virar grade. Todos com a mesma altura (eh). acc = quais olhos (0, 1, 2…) vão na cor de destaque.
 */
function olhar(ox, { de, linhas, seed = 1, eh = 22, passoX = 50, passoY = 25, mexe = [4, 2], acc = [], ink, accent }) {
  const rnd = sorteio(seed), postos = [];
  let i = 0;
  linhas.forEach((n, r) => {
    const yRow = (r - (linhas.length - 1) / 2) * passoY;
    for (let c = 0; c < n; c++, i++) {
      const nome = de[i % de.length], A = ARTES[nome], ew = A.w * eh / A.h;
      const cx = (c - (n - 1) / 2) * passoX + (rnd() * 2 - 1) * mexe[0];
      const cy = yRow + (r === 0 || r === linhas.length - 1 ? 0 : (rnd() * 2 - 1) * mexe[1]);
      postos.push({ nome, x: cx - ew / 2, y: cy, w: ew, flip: rnd() < 0.5, acc: acc.includes(i) });
    }
  });
  const x0 = Math.min(...postos.map((p) => p.x)), x1 = Math.max(...postos.map((p) => p.x + p.w));
  const svg = postos.map((p) => arte(ox + p.x - x0, { nome: p.nome, h: eh, dy: p.y, flip: p.flip, cor: p.acc ? 'acc' : '', engrossa: 1.5, ink, accent }).svg).join('');
  return { svg, w: x1 - x0 };
}

/** Borda "dentes": linha fina + fileira de triângulos apontando para dentro (a primeira versão). */
function bordaTriangulos(W, ink) {
  const n = Math.round(W / 12), tw = W / n;
  let top = '', bot = '';
  for (let i = 0; i < n; i++) {
    const x = i * tw;
    top += `M${f(x)} 6L${f(x + tw)} 6L${f(x + tw / 2)} 14Z`;
    bot += `M${f(x)} ${H - 6}L${f(x + tw)} ${H - 6}L${f(x + tw / 2)} ${H - 14}Z`;
  }
  return `<g fill="${ink}"><rect y="1.5" width="${W}" height="2.5"/><rect y="${H - 4}" width="${W}" height="2.5"/><path d="${top}${bot}"/></g>`;
}

/** Borda "contas": só a fieira de olhinhos (bolinha com pupila), sem a linha. */
function bordaContas(W, ink, paper) {
  const n = Math.round(W / 15), tw = W / n;
  let beads = '';
  for (let i = 0; i < n; i++) {
    const x = f(i * tw + tw / 2);
    for (const y of [10.5, H - 10.5]) beads += `<circle cx="${x}" cy="${y}" r="3.3" fill="${paper}" stroke="${ink}" stroke-width="1.4"/><circle cx="${x}" cy="${y}" r="1.3"/>`;
  }
  return `<g fill="${ink}">${beads}</g>`;
}

// Qual borda usar: 'triangulos' (teste pedido pelo Marco) ou 'contas'.
const BORDA = 'triangulos';

const MOTIVOS = { terung, s: sScroll, arte, olhar, fogo };

function build(sequence, { ink, accent, paper, rev = false }) {
  let x = 0, body = '';
  sequence.forEach((item) => {
    const g = MOTIVOS[item.type](x, { ink, accent, paper, rev, ...item });
    body += g.svg;
    x += g.w + (item.gap ?? 14);
  });
  const W = Math.round(x);
  const borda = BORDA === 'contas' ? bordaContas(W, ink, paper) : bordaTriangulos(W, ink);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMinYMid meet">` +
    borda + body + '</svg>\n';
}

const INK = '#121110', COTTON = '#ECE8D4', VERMILION = '#D93829', OCHRE = '#E2A025', FOREST = '#162A24';

// Composição: flor e S em espiral marcando o ritmo; entre eles, três fogos finos em estilo japonês
// (vetorizados das referências do Marco, na cor de destaque) e a pedra, que lembra cerâmica.
// Os fogos são diagonais (base embaixo à esquerda, pontas para cima à direita); giramos um pouco para as
// pontas ficarem para trás e a base ir na frente, no sentido em que a faixa anda (segue).
// flor · S · fogo A · S · pedra · S · flor · S · fogo B · S · fogo C · S
const S = { type: 'arte', nome: 'espiralS', h: 50 }, SR = { ...S, flip: true };
const FOGO = { type: 'arte', cor: 'acc', segue: true };
const FA = { ...FOGO, nome: 'fogoA', h: 56, rot: 18 };
const FB = { ...FOGO, nome: 'fogoB', h: 62, rot: 28 };
const FC = { ...FOGO, nome: 'fogoD', h: 60, rot: 26 };
const PEDRA = { type: 'arte', nome: 'pedra1c', h: 52 };
const sequencia = [
  { type: 'terung' }, S, FA, SR, PEDRA, S,
  { type: 'terung', petals: 7 }, SR, FB, S, FC, SR
];
// faixa creme: a mesma ideia começando em outro ponto
const sequenciaCreme = [
  FB, S, { type: 'terung' }, SR, FC, S,
  PEDRA, SR, { type: 'terung', petals: 7 }, S, FA, SR
];

// As faixas com --reverse andam para a direita: as versões "-rev" têm o fogo virado para esse lado.
const files = {
  'ornamento-espiral.svg': build(sequencia, { ink: INK, accent: VERMILION, paper: COTTON }),
  'ornamento-terung.svg': build(sequenciaCreme, { ink: INK, accent: VERMILION, paper: COTTON }),
  'ornamento-terung-rev.svg': build(sequenciaCreme, { ink: INK, accent: VERMILION, paper: COTTON, rev: true }),
  'ornamento-espiral-claro.svg': build(sequencia, { ink: COTTON, accent: OCHRE, paper: FOREST }),
  'ornamento-espiral-claro-rev.svg': build(sequencia, { ink: COTTON, accent: OCHRE, paper: FOREST, rev: true })
};

const outDir = path.join(__dirname, '..', 'assets', 'img');
fs.mkdirSync(outDir, { recursive: true });
for (const [name, svg] of Object.entries(files)) {
  fs.writeFileSync(path.join(outDir, name), svg);
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  console.log(`${name}  ${vb[1]}x${vb[2]}  ratio=${(vb[1] / vb[2]).toFixed(4)}  ${(svg.length / 1024).toFixed(1)} KB`);
}
