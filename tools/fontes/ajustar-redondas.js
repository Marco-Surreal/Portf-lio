// Coloca C, G e S (letras redondas) na mesma altura do O, com a mesma
// "sobra" acima e abaixo da linha (overshoot). Antes, o C media 708
// unidades de altura, G e S 700, e o O 725, por isso o C parecia menor.
// Escala uniforme (altura e largura juntas), mantendo a margem esquerda.
// O Ç usa a mesma escala do C.
//
// Uso: node ajustar-redondas.js entrada.json saida.json
const fs = require('fs');
const [inp, out] = process.argv.slice(2);
const font = JSON.parse(fs.readFileSync(inp, 'utf8'));
const by = Object.fromEntries(font.glyphs.map(g => [g.ch, g]));

const nums = d => (d.match(/-?\d+\.?\d*/g) || []).map(Number);
function box(g) {
  const n = nums(g.d), xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
}
function scale(g, s, ax, ay, ty) {
  let i = 0;
  g.d = g.d.replace(/-?\d+\.?\d*/g, v => {
    const n = Number(v), r = i++ % 2 === 0 ? (n - ax) * s + ax : (n - ay) * s + ty;
    return r.toFixed(1);
  });
}

const O = box(by.O);
const alvo = O.y1 - O.y0;
for (const ch of ['C', 'G', 'S']) {
  const g = by[ch], b = box(g), s = alvo / (b.y1 - b.y0);
  scale(g, s, b.x0, b.y0, O.y0);
  g.adv = Math.round(g.adv + (b.x1 - b.x0) * (s - 1));
  console.log(ch, 'altura', Math.round(b.y1 - b.y0), '->', Math.round(alvo), 'escala', s.toFixed(3));
  if (ch === 'C' && by['Ç']) {
    const c = by['Ç'], cb = box(c);
    scale(c, s, cb.x0, b.y0, O.y0);
    c.adv = g.adv; // mesmo espaço do C
  }
}
fs.writeFileSync(out, JSON.stringify(font));
