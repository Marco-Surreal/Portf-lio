// SURREALES: monta cada glifo a partir das letras desenhadas pelo Marco (SL.G).
// Coordenadas do glifo em px da imagem original: linha de base em y = 0, para cima é negativo.
// As letras que o Marco não desenhou são montadas com partes das que ele desenhou
// (hastes, bojos, espirais e terminais), para todas serem da mesma família.
window.GL = (() => {
  const ASC = 390, DESC = 125, CAP = 292, XH = 212, W = 1100;
  const U = {};
  const defs = [];
  const def = (ch, fn, o = {}) => defs.push({ ch, fn, o });

  // ---------- peças ----------
  const pieceCache = {};
  function piece(k, clip, cut, add) {
    const key = k + JSON.stringify(clip || '') + JSON.stringify(cut || '') + JSON.stringify(add || '');
    if (pieceCache[key]) return pieceCache[key];
    const s = SL.G[k], c = document.createElement('canvas'); c.width = s.width; c.height = s.height;
    const x = c.getContext('2d'); x.drawImage(s, 0, 0);
    const pathOf = (pts) => { x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); };
    if (clip) { x.globalCompositeOperation = 'destination-in'; x.fillStyle = '#000'; x.beginPath(); for (const pts of (Array.isArray(clip[0][0]) ? clip : [clip])) { pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); } x.fill(); }
    if (cut) { x.globalCompositeOperation = 'destination-out'; for (const pts of (Array.isArray(cut[0][0]) ? cut : [cut])) { pathOf(pts); x.fill(); } }
    if (add) { x.globalCompositeOperation = 'source-over'; x.fillStyle = '#000'; for (const pts of (Array.isArray(add[0][0]) ? add : [add])) { pathOf(pts); x.fill(); } }
    return (pieceCache[key] = c);
  }
  // altura normal de cada letra: todas as maiúsculas ficam com a mesma altura de versal
  const norm = (k) => CAP / SL.G[k].height;

  function glyph() {
    const c = document.createElement('canvas'); c.width = W; c.height = ASC + DESC;
    const x = c.getContext('2d'); x.translate(0, ASC); x.fillStyle = '#000';
    const g = {
      c, x,
      // P(letra, opções): desenha a letra (ou parte dela). at = [lx, ly, gx, gy]: o ponto (lx,ly) da letra vai para (gx,gy) no glifo.
      P(k, o = {}) {
        const s = SL.G[k], pc = piece(k, o.clip, o.cut, o.add), n = (o.n ?? norm(k)) * (o.s ?? 1);
        const sx = n * (o.sx ?? 1) * (o.fx ? -1 : 1), sy = n * (o.sy ?? 1) * (o.fy ? -1 : 1);
        const at = o.at || [0, s.height, o.x ?? 0, o.y ?? 0];
        x.save(); x.translate(at[2], at[3]); if (o.rot) x.rotate(o.rot * Math.PI / 180); x.scale(sx, sy);
        if (o.erase) x.globalCompositeOperation = 'destination-out';
        x.drawImage(pc, -at[0], -at[1]); x.restore();
        return g;
      },
      // polígono / caminho livre de tinta (ou apagando)
      poly(pts, erase) { x.save(); if (erase) x.globalCompositeOperation = 'destination-out'; x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); x.restore(); return g; },
      path(fn, erase) { x.save(); if (erase) x.globalCompositeOperation = 'destination-out'; x.beginPath(); fn(x); x.fill(); x.restore(); return g; },
      // copia outro glifo já pronto (sem o espaçamento)
      G(ch, o = {}) { const src = U[ch];
        const t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const y = t.getContext('2d'); y.translate(0, ASC);
        y.save(); y.translate(o.x ?? 0, o.y ?? 0); if (o.rot) y.rotate(o.rot * Math.PI / 180); y.scale((o.s ?? 1) * (o.sx ?? 1) * (o.fx ? -1 : 1), (o.s ?? 1) * (o.sy ?? 1) * (o.fy ? -1 : 1)); y.drawImage(src.ink, -src.ox, -ASC); y.restore();
        if (o.clip) { y.globalCompositeOperation = 'destination-in'; y.beginPath(); o.clip.forEach((p, i) => (i ? y.lineTo(p[0], p[1]) : y.moveTo(p[0], p[1]))); y.closePath(); y.fill(); }
        if (o.cut) { y.globalCompositeOperation = 'destination-out'; y.beginPath(); o.cut.forEach((p, i) => (i ? y.lineTo(p[0], p[1]) : y.moveTo(p[0], p[1]))); y.closePath(); y.fill(); }
        x.save(); x.setTransform(1, 0, 0, 1, 0, 0); if (o.erase) x.globalCompositeOperation = 'destination-out'; x.drawImage(t, 0, 0); x.restore(); return g; },
      // traço à mão: linha de pontos com largura variável (w pode ser número ou lista)
      stroke(pts, w, erase) { x.save(); if (erase) x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000';
        const ws = Array.isArray(w) ? w : pts.map(() => w); const L = [], R = [];
        for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const h = ws[i] / 2; L.push([pts[i][0] - dy * h, pts[i][1] + dx * h]); R.push([pts[i][0] + dy * h, pts[i][1] - dx * h]); }
        x.beginPath(); [...L, ...R.reverse()].forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); x.closePath(); x.fill(); x.restore(); return g; },
      dot(cx, cy, r, erase) { x.save(); if (erase) x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.ellipse(cx, cy, r * 1.04, r * 0.96, -0.3, 0, Math.PI * 2); x.fill(); x.restore(); return g; },
      w(ch) { return U[ch].w; },
    };
    return g;
  }

  // funde as emendas: desfoque leve + limiar (não apaga detalhes de 3 px ou mais)
  function finish(c, blur = 1.6, open = 0) {
    const t = document.createElement('canvas'); t.width = c.width; t.height = c.height;
    const x = t.getContext('2d'); x.filter = 'blur(' + blur + 'px)'; x.drawImage(c, 0, 0); x.filter = 'none';
    const im = x.getImageData(0, 0, t.width, t.height), d = im.data;
    let x0 = t.width, x1 = -1;
    for (let i = 0; i < d.length; i += 4) { const on = d[i + 3] > 127; d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = on ? 255 : 0; if (on) { const px = (i / 4) % t.width; if (px < x0) x0 = px; if (px > x1) x1 = px; } }
    if (open) {
      const W2 = t.width, H2 = t.height, ink = new Uint8Array(W2 * H2), ext = new Uint8Array(W2 * H2);
      for (let i = 0; i < W2 * H2; i++) ink[i] = d[i * 4 + 3] ? 1 : 0;
      const st = []; for (let xx = 0; xx < W2; xx++) { st.push(xx, (H2 - 1) * W2 + xx); } for (let y = 0; y < H2; y++) { st.push(y * W2, y * W2 + W2 - 1); }
      while (st.length) { const i = st.pop(); if (ext[i] || ink[i]) continue; ext[i] = 1; const px = i % W2; if (px > 0) st.push(i - 1); if (px < W2 - 1) st.push(i + 1); if (i >= W2) st.push(i - W2); if (i < W2 * (H2 - 1)) st.push(i + W2); }
      let hole = new Uint8Array(W2 * H2); for (let i = 0; i < W2 * H2; i++) hole[i] = !ink[i] && !ext[i] ? 1 : 0;
      for (let k = 0; k < open; k++) { const h2 = hole.slice(); for (let i = W2; i < W2 * (H2 - 1); i++) if (!hole[i] && (hole[i - 1] || hole[i + 1] || hole[i - W2] || hole[i + W2])) h2[i] = 1; hole = h2; }
      for (let i = 0; i < W2 * H2; i++) if (hole[i]) d[i * 4 + 3] = 0;
    }
    x.putImageData(im, 0, 0);
    return { ink: t, x0, x1 };
  }

  async function build(only) {
    for (const d of defs) {
      if (only && !only.includes(d.ch)) { /* ainda monta: outros glifos podem depender dele */ }
      if (d.o.space) { U[d.ch] = { ch: d.ch, adv: d.o.space, space: true }; continue; }
      const g = glyph(); d.fn(g);
      const f = finish(g.c, d.o.blur, d.o.open || 0);
      const sbL = d.o.sbL ?? d.o.sb ?? 6, sbR = d.o.sbR ?? d.o.sb ?? 6;
      U[d.ch] = { ch: d.ch, ink: f.ink, ox: f.x0, adv: Math.round(f.x1 - f.x0 + 1 + sbL + sbR), sbL, w: f.x1 - f.x0 + 1, o: d.o };
    }
    return U;
  }
  // canvas final do glifo (com espaçamento), linha de base em ASC
  function out(ch, distress) {
    const u = U[ch], c = document.createElement('canvas'); c.width = Math.max(1, u.adv); c.height = ASC + DESC;
    if (!u.space) c.getContext('2d').drawImage(u.ink, -u.ox + u.sbL, 0);
    if (distress && !u.space) rough(c, ch.codePointAt(0));
    return c;
  }
  // ---------- distress: borda gasta de impressão ----------
  // Feito para aparecer em tamanho pequeno: a borda ganha mordidas e ondulações de ~10-20 px
  // (na escala do desenho, versal = 292 px), lascas nas partes grossas e respingos de tinta.
  // Não abre buracos no meio das letras.
  function hash(x, y, s) { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function boxBlur(src, W, H, r) { const tmp = new Float32Array(W * H), out = new Float32Array(W * H), n = 2 * r + 1;
    for (let y = 0; y < H; y++) { let acc = 0; for (let x = -r; x <= r; x++) acc += src[y * W + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { tmp[y * W + x] = acc / n; acc += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)]; } }
    for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += tmp[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { out[y * W + x] = acc / n; acc += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
    return out; }
  const DS = { amp: 0.95, feat: 15, fine: 5, fineAmp: 0.35, chips: 5, specks: 7 };
  function rough(c, seed) {
    const W = c.width, H = c.height, x = c.getContext('2d'), im = x.getImageData(0, 0, W, H), d = im.data, m = new Float32Array(W * H);
    for (let i = 0; i < W * H; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    const v = boxBlur(m, W, H, 4), thick = boxBlur(m, W, H, 13), out = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const i = y * W + xx; if (v[i] < 0.01) continue; if (v[i] > 0.99) { out[i] = 1; continue; }
      const n = vnoise(xx / DS.feat, y / DS.feat, seed) - 0.5, f = vnoise(xx / DS.fine, y / DS.fine, seed + 11) - 0.5;
      // nas partes finas (pontas das espirais) a mordida é menor, para não quebrar o traço
      const k = Math.min(1, thick[i] * 1.6);
      out[i] = v[i] + n * DS.amp * k + f * DS.fineAmp * k > 0.5 ? 1 : 0; }
    let r = seed * 9301 + 49297; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    const stamp = (cx, cy, rad, val) => { for (let yy = -Math.ceil(rad); yy <= rad; yy++) for (let xx = -Math.ceil(rad); xx <= rad; xx++) { const q = xx * xx / (rad * rad) + yy * yy / (rad * rad * 0.6); if (q > 1) continue; const X = cx + xx, Y = cy + yy; if (X >= 0 && Y >= 0 && X < W && Y < H) out[Y * W + X] = val; } };
    let placed = 0, tries = 0; // lascas na borda das partes grossas
    while (placed < DS.chips && tries++ < 20000) { const px = (rnd() * W) | 0, py = (rnd() * H) | 0, i = py * W + px; if (v[i] > 0.4 && v[i] < 0.6 && thick[i] > 0.62) { stamp(px, py, 6 + rnd() * 6, 0); placed++; } }
    placed = 0; tries = 0; // respingos soltos perto da letra
    while (placed < DS.specks && tries++ < 20000) { const px = (rnd() * W) | 0, py = (rnd() * H) | 0, i = py * W + px; if (v[i] < 0.01 && thick[i] > 0.04 && thick[i] < 0.16) { stamp(px, py, 2.5 + rnd() * 3.5, 1); placed++; } }
    const sm = boxBlur(out, W, H, 1);
    for (let i = 0; i < W * H; i++) { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 0; d[i * 4 + 3] = sm[i] > 0.5 ? 255 : 0; }
    x.putImageData(im, 0, 0);
  }
  return { def, build, out, U, ASC, DESC, CAP, XH, defs, norm };
})();

// =====================================================================
// MAIÚSCULAS desenhadas pelo Marco
// =====================================================================
(() => {
  const { def } = GL;
  for (const [ch, k] of Object.entries({ A: 'A', B: 'B', C: 'C', D: 'D', E: 'E', F: 'F', G: 'G', H: 'H', J: 'J', L: 'L2', M: 'M', N: 'N', R: 'R', S: 'S', T: 'T' }))
    def(ch, (g) => g.P(k, { y: /[OCGS]/.test(ch) ? 4 : 0 }));
  // O com o miolo mais aberto
  def('O', (g) => g.P('O', { y: 4 }), { open: 7 });
  // I mais fino
  def('I', (g) => g.P('I', { sx: 0.8 }));
  // K mais fino, com o braço de cima solto da haste (para não parecer um R)
  def('K', (g) => g.P('K', { sx: 0.88, cut: [[62, -10], [128, -10], [96, 52], [70, 78], [64, 78]] }));

  // ---------- maiúsculas montadas com partes das letras dele ----------
  // P: o R sem a perna; a parte de baixo do bojo segue a borda do miolo do R
  def('P', (g) => g.P('R', { cut: [[76, 186], [120, 186], [165, 180], [188, 166], [210, 152], [232, 138], [252, 118], [320, 96], [320, 320], [104, 320], [100, 270], [86, 230]] }));
  // Q: o O com a perna espiralada do R saindo de baixo, à direita
  def('Q', (g) => {
    g.P('O', { y: 4 });
    const n = GL.norm('O');
    g.P('R', { clip: [[178, 158], [240, 168], [320, 210], [320, 300], [190, 300], [160, 240]], at: [190, 200, 150 * n, -60], s: 0.95 });
  });
  // Z: a barra de cima do T (com a espiral pendurada à esquerda), uma diagonal com o peso
  // da diagonal do N e o braço de baixo do E (com a espiral subindo à direita)
  def('Z', (g) => {
    g.G('T', { sx: 0.8, clip: [[-10, -400], [400, -400], [400, -222], [76, -222], [76, -130], [-10, -130]] });
    g.G('E', { x: 4, sx: 1.12, clip: [[-10, -38], [95, -38], [95, -100], [400, -100], [400, 60], [-10, 60]] });
    const w = GL.U.T.w * 0.8;
    g.stroke([[w - 26, -238], [w - 72, -178], [w / 2, -122], [78, -68], [40, -34]], [64, 72, 80, 90, 98]);
    // fecha o canto de baixo à esquerda (sobra da haste do E)
    g.stroke([[14, -26], [60, -22], [110, -20], [150, -22]], [46, 44, 42, 40]);
  });
  // U: as duas hastes do H (sem a barra) e o fundo redondo com o mesmo peso do traço
  // U: a metade de baixo do O (com a ponta em espiral) e as hastes do I, que afinam até a parede do O
  def('U', (g) => {
    g.G('O', { y: 0, clip: [[-50, -165], [400, -165], [400, 40], [-50, 40]], cut: [[58, -175], [176, -175], [176, -116], [58, -116]] });
    const w = GL.U.O.w, iw = GL.U.I.w * 0.8;
    for (const cx of [33, w - 33]) g.G('I', { x: cx - iw / 2, sx: 0.8, clip: [[-50, -400], [400, -400], [400, -150], [-50, -150]] });
  });
  function CAPH() { return GL.CAP; }
  // V: o A de cabeça para baixo, com o miolo triangular preenchido (a espiral fica no alto)
  def('V', (g) => g.P('A', { rot: 180, cut: [[86, 110], [143, 104], [136, 172], [74, 178]], at: [0, 0, SL.G.A.width * GL.norm('A'), 0] }));
  // W: o M de cabeça para baixo
  def('W', (g) => g.P('M', { rot: 180, at: [0, 0, SL.G.M.width * GL.norm('M'), 0] }));
  // X: duas diagonais com o peso das letras dele, pés e topo do A, espiral do H no vão de cima
  def('X', (g) => {
    g.stroke([[44, -300], [100, -205], [140, -146], [182, -82], [242, 8]], [104, 70, 60, 70, 108]);
    g.stroke([[232, -300], [178, -208], [138, -146], [96, -78], [36, 8]], [66, 42, 34, 44, 70]);
    g.poly([[-60, -292], [400, -292], [400, -400], [-60, -400]], true); g.poly([[-60, 0], [400, 0], [400, 60], [-60, 60]], true);
  });
  // Y: o alto do V (com a espiral) sobre a haste do I
  def('Y', (g) => {
    const I = SL.G.I, w = GL.U.V.w;
    g.G('V', { clip: [[-50, -400], [600, -400], [600, -215], [w / 2 + 46, -120], [w / 2 - 46, -120], [-50, -215]] });
    g.P('I', { clip: [[-5, 135], [I.width + 5, 135], [I.width + 5, I.height + 5], [-5, I.height + 5]], at: [I.width / 2, 135, w / 2 - 2, -150], sx: 0.9 });
  });
})();

// =====================================================================
// MINÚSCULAS: as letras dele em tamanho menor, com hastes que sobem (b d f h k l t)
// e descem (g j p q y). Mesmas espirais, pontas e serifas.
// =====================================================================
(() => {
  const { def } = GL; const X = GL.XH, CP = GL.CAP, AS = 312, DS = 108;
  const sy = X / CP, sya = AS / CP, syd = (X + DS) / CP;
  const stem = (g, x, y0, y1, sx = 0.58) => { // haste do I entre y0 (alto) e y1 (baixo)
    g.G('I', { x, y: y1, sx: sx / 0.8, sy: (y1 - y0) / CP });
  };
  def('o', (g) => g.G('O', { sx: 0.84, sy }), { open: 4 });
  def('c', (g) => g.G('C', { sx: 0.86, sy }));
  def('s', (g) => g.G('S', { sx: 0.86, sy }));
  def('e', (g) => { g.G('C', { sx: 0.88, sy }); g.stroke([[30, -104], [80, -100], [130, -106], [176, -112]], [30, 26, 26, 34]); });
  def('a', (g) => { g.G('O', { sx: 0.8, sy }); stem(g, 128, -X, 0); }, { open: 6 });
  def('d', (g) => { g.G('O', { sx: 0.8, sy }); stem(g, 128, -AS, 0); }, { open: 5 });
  def('b', (g) => { stem(g, 0, -AS, 0); g.G('O', { x: 40, sx: 0.8, sy, fx: false }); }, { open: 5 });
  def('p', (g) => { stem(g, 0, -X, DS); g.G('O', { x: 40, sx: 0.8, sy }); }, { open: 6 });
  def('q', (g) => { g.G('O', { sx: 0.8, sy }); stem(g, 128, -X, DS); }, { open: 5 });
  def('g', (g) => { g.G('O', { sx: 0.8, sy }); g.stroke([[166, -196], [168, -120], [166, -40]], [50, 46, 50]); g.G('J', { x: 14, y: DS, sx: 0.9, sy: 0.75, clip: [[-50, -70], [400, -70], [400, 200], [-50, 200]] }); });
  def('n', (g) => g.G('U', { rot: 180, x: GL.U.U.w * 0.86, y: -X, sx: 0.86, sy }));
  def('h', (g) => { g.G('n'); stem(g, 0, -AS, 0, 0.56); });
  def('m', (g) => { g.G('U', { rot: 180, x: GL.U.U.w * 0.7, y: -X, sx: 0.7, sy }); g.G('U', { rot: 180, x: GL.U.U.w * 0.7 + 128, y: -X, sx: 0.7, sy }); });
  def('r', (g) => { g.G('n', { cut: [[100, -118], [400, -118], [400, 40], [100, 40]] }); g.G('n', { clip: [[-50, -400], [100, -400], [100, 40], [-50, 40]] }); g.dot(150, -136, 22); });
  def('u', (g) => g.G('U', { sx: 0.86, sy }));
  def('i', (g) => { stem(g, 0, -X, 0); g.dot(GL.U.I.w * 0.29, -X - 52, 27); });
  def('j', (g) => { g.G('J', { y: DS, sx: 0.9, sy: syd }); g.dot(GL.U.J.w * 0.9 * 0.68, -X - 52, 27); });
  def('l', (g) => stem(g, 0, -AS, 0));
  def('f', (g) => g.G('F', { sx: 0.84, sy: sya }));
  def('k', (g) => { stem(g, 0, -AS, 0); g.G('K', { x: -6, sx: 0.84, sy, clip: [[64, -400], [400, -400], [400, 40], [64, 40]] }); });
  def('t', (g) => { stem(g, 31, -290, 0); g.G('T', { y: -41, sx: 0.62, sy: 0.62, clip: [[-50, -400], [400, -400], [400, -158], [-50, -158]] }); });
  def('v', (g) => g.G('V', { sx: 0.84, sy }));
  def('w', (g) => g.G('W', { sx: 0.82, sy }));
  def('x', (g) => g.G('X', { sx: 0.84, sy }));
  def('y', (g) => g.G('Y', { y: DS, sx: 0.84, sy: syd }));
  def('z', (g) => g.G('Z', { sx: 0.84, sy }));
})();

// =====================================================================
// NÚMEROS, PONTUAÇÃO E ACENTOS: montados com as mesmas peças
// =====================================================================
(() => {
  const { def } = GL; const C = GL.CAP, X = GL.XH;
  const stem = (g, x, y0, y1, sx = 0.58) => g.G('I', { x, y: y1, sx: sx / 0.8, sy: (y1 - y0) / C });
  def(' ', null, { space: 112 });
  def('0', (g) => g.G('O', { sx: 0.72 }));
  def('1', (g) => { stem(g, 40, -C, 0, 0.62); g.stroke([[60, -270], [30, -250], [4, -232]], [44, 30, 16]); g.dot(8, -236, 13); });
  def('2', (g) => { g.G('S', { fx: true, x: GL.U.S.w * 0.9, sx: 0.9, clip: [[-50, -400], [400, -400], [400, -96], [-50, -96]] });
    g.stroke([[66, -104], [40, -60], [20, -24]], [52, 54, 58]); g.stroke([[8, -26], [60, -30], [120, -24], [196, -30]], [50, 44, 46, 58]); g.poly([[0, 0], [400, 0], [400, 40], [0, 40]], true); });
  def('3', (g) => g.G('B', { clip: [[88, -400], [400, -400], [400, 40], [88, 40]] }));
  def('4', (g) => { g.stroke([[150, -290], [80, -190], [14, -100]], [52, 46, 44]); g.stroke([[4, -98], [80, -94], [150, -100], [212, -96]], [44, 40, 40, 46]); stem(g, 110, -C, 0, 0.58); });
  def('5', (g) => { g.stroke([[56, -282], [120, -286], [186, -278]], [44, 40, 50]); g.stroke([[56, -290], [52, -220], [46, -150]], [50, 46, 52]);
    g.G('S', { clip: [[-50, -168], [400, -168], [400, 40], [-50, 40]] }); });
  def('6', (g) => { g.G('o', { sx: 1.0, sy: 0.9 }); g.stroke([[24, -96], [30, -186], [66, -258], [124, -288], [176, -276]], [58, 54, 48, 40, 32]); g.dot(178, -264, 24); g.dot(172, -258, 9, true); });
  def('7', (g) => { g.G('Z', { sx: 0.8, clip: [[-50, -400], [400, -400], [400, -214], [-50, -214]] }); const w = GL.U.Z.w * 0.8; g.stroke([[w - 30, -236], [w - 80, -150], [w - 120, -70], [w - 140, 0]], [70, 58, 54, 66]); g.poly([[0, 0], [400, 0], [400, 40], [0, 40]], true); });
  def('8', (g) => { g.G('O', { x: 14, y: -146, sx: 0.6, sy: 0.5 }); g.G('O', { sx: 0.7, sy: 0.54 }); });
  def('9', (g) => g.G('6', { rot: 180, x: GL.U['6'].w, y: -C - 10 }));

  // pontuação
  def('.', (g) => g.dot(28, -28, 28), { sb: 12 });
  def(',', (g) => { g.dot(28, -28, 27); g.stroke([[44, -30], [42, 8], [22, 46]], [30, 20, 6]); }, { sb: 12 });
  def(':', (g) => { g.dot(28, -28, 27); g.dot(28, -168, 27); }, { sb: 12 });
  def(';', (g) => { g.G(','); g.dot(28, -168, 27); }, { sb: 12 });
  def('!', (g) => { g.stroke([[36, -292], [36, -190], [36, -92]], [58, 40, 22]); g.dot(36, -28, 27); }, { sb: 12 });
  def('?', (g) => { g.G('S', { fx: true, x: GL.U.S.w * 0.78, sx: 0.78, sy: 0.82, clip: [[-50, -400], [400, -400], [400, -132], [-50, -132]] });
    g.stroke([[86, -150], [84, -110], [84, -86]], [44, 32, 24]); g.dot(84, -28, 26); });
  const wave = (x0, x1, y) => { const p = []; for (let i = 0; i <= 6; i++) p.push([x0 + (x1 - x0) * i / 6, y + Math.sin(i * 1.3) * 3]); return p; };
  def('-', (g) => g.stroke(wave(0, 120, -118), [42, 36, 34, 36, 34, 36, 44]), { sb: 10 });
  def('–', (g) => g.stroke(wave(0, 210, -118), [42, 36, 34, 36, 34, 36, 44]), { sb: 10 });
  def('—', (g) => g.stroke(wave(0, 320, -118), [42, 36, 34, 36, 34, 36, 44]), { sb: 10 });
  def('_', (g) => g.stroke(wave(0, 230, 36), [36, 32, 30, 32, 30, 32, 38]), { sb: 0 });
  def("'", (g) => g.stroke([[22, -292], [20, -250], [16, -212]], [40, 26, 10]), { sb: 12 });
  def('"', (g) => { g.G("'"); g.G("'", { x: 54 }); }, { sb: 12 });
  const arc = (cx, cy, r, a0, a1, w0, w1, n = 12) => { const p = [], w = []; for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + (a1 - a0) * t; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.3]); w.push(w0 + (w1 - w0) * Math.sin(t * Math.PI)); } return [p, w]; };
  def('(', (g) => g.stroke(...arc(150, -110, 150, Math.PI * 0.68, Math.PI * 1.32, 30, 50)));
  def(')', (g) => g.G('(', { fx: true, x: GL.U['('].w }));
  def('[', (g) => { g.stroke([[30, -310], [26, -120], [30, 70]], [44, 40, 44]); g.stroke([[20, -306], [90, -310]], [36, 40]); g.stroke([[20, 66], [90, 70]], [36, 40]); });
  def(']', (g) => g.G('[', { fx: true, x: GL.U['['].w }));
  def('/', (g) => g.stroke([[170, -300], [90, -140], [10, 20]], [40, 34, 40]));
  def('+', (g) => { g.stroke(wave(0, 170, -120), 40); g.stroke([[85, -205], [85, -120], [85, -35]], [44, 38, 44]); });
  def('=', (g) => { g.stroke(wave(0, 170, -160), 38); g.stroke(wave(0, 170, -80), 38); });
  def('*', (g) => { for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3 + Math.PI / 2; g.stroke([[70 - Math.cos(a) * 62, -230 - Math.sin(a) * 62], [70 + Math.cos(a) * 62, -230 + Math.sin(a) * 62]], [34, 20]); } });
  def('&', (g) => { g.G('S', { sx: 0.9 }); g.stroke([[100, -128], [160, -64], [210, -4]], [34, 40, 50]); });
  def('$', (g) => { g.G('S', { x: 0 }); g.stroke([[104, -330], [102, -146], [104, 38]], [30, 24, 30]); });
  def('@', (g) => { g.G('o', { x: 64, y: -40, s: 0.78 }); g.stroke(...arc(150, -120, 140, -0.2, Math.PI * 1.9, 36, 36, 30)); });
  def('#', (g) => { g.stroke([[70, -280], [50, 0]], 38); g.stroke([[160, -280], [140, 0]], 38); g.stroke(wave(0, 220, -190), 36); g.stroke(wave(0, 220, -90), 36); });
  def('%', (g) => { g.G('o', { s: 0.5, y: -160 }); g.G('o', { s: 0.5, x: 130 }); g.stroke([[220, -292], [120, -140], [20, 8]], [36, 30, 36]); });
  def('«', (g) => { for (const dx of [0, 70]) g.stroke([[dx + 70, -190], [dx + 10, -120], [dx + 70, -50]], [24, 40, 24]); });
  def('»', (g) => g.G('«', { fx: true, x: GL.U['«'].w }));
  def('°', (g) => { g.dot(60, -250, 52); g.dot(60, -250, 22, true); });
  def('✦', (g) => g.path((x) => { const cx = 130, cy = -146, R = 140, r = 26; x.moveTo(cx, cy - R); for (let k = 0; k < 4; k++) { const a = -Math.PI / 2 + k * Math.PI / 2; x.quadraticCurveTo(cx + Math.cos(a + Math.PI / 4) * r, cy + Math.sin(a + Math.PI / 4) * r, cx + Math.cos(a + Math.PI / 2) * R, cy + Math.sin(a + Math.PI / 2) * R); } x.closePath(); }));

  // acentos
  def('ı', (g) => stem(g, 0, -X, 0));
  const top = (b) => (/[a-zı]/.test(b) ? -X : -C);
  const marks = {
    '\u0301': (g, cx, t) => g.stroke([[cx - 14, t - 24], [cx + 4, t - 50], [cx + 26, t - 80]], [18, 28, 36]),
    '\u0300': (g, cx, t) => g.stroke([[cx + 14, t - 24], [cx - 4, t - 50], [cx - 26, t - 80]], [18, 28, 36]),
    '\u0302': (g, cx, t) => g.stroke([[cx - 42, t - 26], [cx, t - 74], [cx + 42, t - 26]], [20, 34, 20]),
    '\u0303': (g, cx, t) => g.stroke([[cx - 50, t - 36], [cx - 26, t - 62], [cx, t - 50], [cx + 24, t - 36], [cx + 50, t - 62]], [18, 26, 24, 26, 18]),
    '\u0308': (g, cx, t) => { g.dot(cx - 34, t - 44, 18); g.dot(cx + 34, t - 44, 18); },
    '\u030A': (g, cx, t) => { g.dot(cx, t - 52, 28); g.dot(cx, t - 52, 12, true); },
  };
  const comb = { 'Á': 'A\u0301', 'á': 'a\u0301', 'À': 'A\u0300', 'à': 'a\u0300', 'Â': 'A\u0302', 'â': 'a\u0302', 'Ã': 'A\u0303', 'ã': 'a\u0303', 'Ä': 'A\u0308', 'ä': 'a\u0308', 'Å': 'A\u030A', 'å': 'a\u030A',
    'É': 'E\u0301', 'é': 'e\u0301', 'È': 'E\u0300', 'è': 'e\u0300', 'Ê': 'E\u0302', 'ê': 'e\u0302', 'Ë': 'E\u0308', 'ë': 'e\u0308',
    'Í': 'I\u0301', 'í': 'ı\u0301', 'Ì': 'I\u0300', 'ì': 'ı\u0300', 'Î': 'I\u0302', 'î': 'ı\u0302', 'Ï': 'I\u0308', 'ï': 'ı\u0308',
    'Ó': 'O\u0301', 'ó': 'o\u0301', 'Ò': 'O\u0300', 'ò': 'o\u0300', 'Ô': 'O\u0302', 'ô': 'o\u0302', 'Õ': 'O\u0303', 'õ': 'o\u0303', 'Ö': 'O\u0308', 'ö': 'o\u0308',
    'Ú': 'U\u0301', 'ú': 'u\u0301', 'Ù': 'U\u0300', 'ù': 'u\u0300', 'Û': 'U\u0302', 'û': 'u\u0302', 'Ü': 'U\u0308', 'ü': 'u\u0308', 'Ñ': 'N\u0303', 'ñ': 'n\u0303' };
  for (const [ch, [b, m]] of Object.entries(comb).map(([k, v]) => [k, [...v]])) def(ch, (g) => { g.G(b); marks[m](g, GL.U[b].w / 2, top(b) - 8); });
  const ced = (g, cx) => g.stroke([[cx, -8], [cx + 4, 22], [cx + 26, 40], [cx + 12, 68], [cx - 16, 74]], [28, 22, 24, 16, 6]);
  def('Ç', (g) => { g.G('C'); ced(g, GL.U.C.w / 2); });
  def('ç', (g) => { g.G('c'); ced(g, GL.U.c.w / 2); });
})();
