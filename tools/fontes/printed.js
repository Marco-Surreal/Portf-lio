// PRINTED BOY SURREAL — desenho original. Traço redondo e uniforme (geométrica pesada) + borda de tinta impressa leve.
window.PRINTED = (function () {
  const F = FL;
  const W = 128, h = W / 2;
  const T = 700 - h, B = h, XT = 510 - h, AS = 730 - h, DS = -215 + h;
  const G = {};
  const Lp = (pts) => F.draw(F.mono(pts, W));
  const A = (cx, cy, rx, ry, a0, a1) => F.arc(cx, cy, rx, ry, a0, a1, 200);
  const Ar = (...a) => Lp(A(...a));
  const ringC = (cx, cy, rx, ry) => Ar(cx, cy, rx, ry, 0, 360);
  // ---------- maiúsculas ----------
  G.A = { w: 700, d() { Lp([[75, B], [350, T], [625, B]]); Lp([[185, 240], [515, 240]]); } };
  G.B = { w: 640, d() { Lp(F.join([[90, B], [90, T], [330, T]], A(330, 505, 135, 130, 90, -90), [[330, 375], [90, 375]])); Lp(F.join([[90, 375], [350, 375]], A(350, 220, 180, 155, 90, -90), [[350, B], [90, B]])); } };
  G.C = { w: 680, d() { Ar(370, 350, 290, 285, 42, 318); } };
  G.D = { w: 690, d() { Lp(F.join([[90, B], [90, T], [320, T]], A(320, 350, 265, 285, 90, -90), [[320, B], [90, B]])); } };
  G.E = { w: 600, d() { Lp([[530, T], [90, T], [90, B], [530, B]]); Lp([[90, 355], [460, 355]]); } };
  G.F = { w: 580, d() { Lp([[520, T], [90, T], [90, B]]); Lp([[90, 365], [450, 365]]); } };
  G.G = { w: 710, d() { Ar(370, 350, 290, 285, 45, 360); Lp([[420, 330], [660, 330], [660, 200]]); } };
  G.H = { w: 720, d() { Lp([[90, B], [90, T]]); Lp([[630, B], [630, T]]); Lp([[90, 355], [630, 355]]); } };
  G.I = { w: 260, d() { Lp([[130, B], [130, T]]); } };
  G.J = { w: 540, d() { Lp(F.join([[450, T], [450, 250]], A(260, 250, 190, 185, 0, -180))); } };
  G.K = { w: 660, d() { Lp([[90, B], [90, T]]); Lp([[580, T], [110, 270]]); Lp([[270, 400], [600, B]]); } };
  G.L = { w: 560, d() { Lp([[90, T], [90, B], [520, B]]); } };
  G.M = { w: 860, d() { Lp([[80, B], [80, T], [430, 210], [780, T], [780, B]]); } };
  G.N = { w: 720, d() { Lp([[90, B], [90, T], [630, B], [630, T]]); } };
  G.O = { w: 760, d() { ringC(380, 350, 312, 285); } };
  G.P = { w: 620, d() { Lp(F.join([[90, B], [90, T], [320, T]], A(320, 480, 175, 155, 90, -90), [[320, 325], [90, 325]])); } };
  G.Q = { w: 760, d() { ringC(380, 350, 312, 285); Lp([[470, 190], [690, -20]]); } };
  G.R = { w: 650, d() { Lp(F.join([[90, B], [90, T], [320, T]], A(320, 485, 175, 150, 90, -90), [[320, 335], [90, 335]])); Lp([[300, 335], [575, B]]); } };
  G.S = { w: 610, d() { Lp(F.join(A(305, 497, 215, 138, 18, 270), A(305, 210, 240, 145, 90, -162).slice(1))); } };
  G.T = { w: 640, d() { Lp([[50, T], [590, T]]); Lp([[320, T], [320, B]]); } };
  G.U = { w: 700, d() { Lp(F.join([[90, T], [90, 285]], A(350, 285, 260, 220, 180, 360), [[610, 285], [610, T]])); } };
  G.V = { w: 700, d() { Lp([[60, T], [350, B], [640, T]]); } };
  G.W = { w: 980, d() { Lp([[50, T], [265, B], [490, T], [715, B], [930, T]]); } };
  G.X = { w: 680, d() { Lp([[75, T], [605, B]]); Lp([[605, T], [75, B]]); } };
  G.Y = { w: 660, d() { Lp([[60, T], [330, 330], [600, T]]); Lp([[330, 330], [330, B]]); } };
  G.Z = { w: 620, d() { Lp([[80, T], [540, T], [80, B], [550, B]]); } };
  // ---------- minúsculas ----------
  const OY = (XT + B) / 2, ORY = (XT - B) / 2;
  G.a = { w: 620, d() { ringC(290, OY, 225, ORY); Lp([[515, XT], [515, B]]); } };
  G.b = { w: 620, d() { Lp([[90, AS], [90, B]]); ringC(320, OY, 230, ORY); } };
  G.c = { w: 570, d() { Ar(300, OY, 232, ORY, 42, 318); } };
  G.d = { w: 620, d() { ringC(300, OY, 230, ORY); Lp([[530, AS], [530, B]]); } };
  G.e = { w: 600, d() { Lp([[75, OY], [530, OY]]); Ar(300, OY, 235, ORY, 0, 322); } };
  G.f = { w: 400, d() { Lp(F.join([[150, B], [150, 540]], A(285, 540, 135, 125, 180, 55))); Lp([[40, XT], [340, XT]]); } };
  G.g = { w: 620, d() { ringC(300, OY, 230, ORY); Lp(F.join([[530, XT], [530, 0]], A(300, 0, 230, 145, 0, -165))); } };
  G.h = { w: 600, d() { Lp([[90, AS], [90, B]]); Lp(F.join(A(300, 250, 210, 195, 180, 0), [[510, 250], [510, B]])); } };
  G.i = { w: 260, d() { Lp([[130, B], [130, XT]]); F.disc(130, 640, 74); } };
  G.ı = { w: 260, d() { Lp([[130, B], [130, XT]]); } };
  G.j = { w: 290, d() { Lp(F.join([[180, XT], [180, -30]], A(60, -30, 120, 115, 0, -110))); F.disc(180, 640, 74); } };
  G.k = { w: 580, d() { Lp([[90, AS], [90, B]]); Lp([[480, XT], [110, 185]]); Lp([[235, 275], [505, B]]); } };
  G.l = { w: 260, d() { Lp([[130, AS], [130, B]]); } };
  G.m = { w: 900, d() { Lp([[90, XT], [90, B]]); Lp(F.join(A(250, 280, 160, 165, 180, 0), [[410, 280], [410, B]])); Lp(F.join(A(570, 280, 160, 165, 180, 0), [[730, 280], [730, B]])); } };
  G.n = { w: 600, d() { Lp([[90, XT], [90, B]]); Lp(F.join(A(300, 250, 210, 195, 180, 0), [[510, 250], [510, B]])); } };
  G.o = { w: 600, d() { ringC(300, OY, 235, ORY); } };
  G.p = { w: 620, d() { Lp([[90, XT], [90, DS]]); ringC(320, OY, 230, ORY); } };
  G.q = { w: 620, d() { ringC(300, OY, 230, ORY); Lp([[530, XT], [530, DS]]); } };
  G.r = { w: 410, d() { Lp([[90, XT], [90, B]]); Lp(A(300, 245, 210, 200, 180, 78)); } };
  G.s = { w: 520, d() { Lp(F.join(A(260, 345, 170, 100, 18, 270), A(260, 160, 190, 95, 90, -162).slice(1))); } };
  G.t = { w: 420, d() { Lp(F.join([[170, 640], [170, 170]], A(300, 170, 130, 105, 180, 270), [[300, B], [370, B]])); Lp([[50, XT], [360, XT]]); } };
  G.u = { w: 600, d() { Lp(F.join([[90, XT], [90, 260]], A(300, 260, 210, 195, 180, 360))); Lp([[510, XT], [510, B]]); } };
  G.v = { w: 580, d() { Lp([[50, XT], [290, B], [530, XT]]); } };
  G.w = { w: 860, d() { Lp([[40, XT], [230, B], [430, XT], [630, B], [820, XT]]); } };
  G.x = { w: 560, d() { Lp([[65, XT], [495, B]]); Lp([[495, XT], [65, B]]); } };
  G.y = { w: 580, d() { Lp([[50, XT], [290, B]]); Lp([[530, XT], [190, DS]]); } };
  G.z = { w: 540, d() { Lp([[70, XT], [470, XT], [70, B], [480, B]]); } };
  // ---------- números ----------
  G['0'] = { w: 620, d() { ringC(310, 350, 245, 285); } };
  G['1'] = { w: 420, d() { Lp([[70, 560], [230, T], [230, B]]); } };
  G['2'] = { w: 590, d() { Lp(F.join(A(290, 475, 215, 160, 160, -35), [[75, B], [530, B]])); } };
  G['3'] = { w: 580, d() { Ar(285, 497, 200, 138, 155, -90); Ar(285, 215, 232, 150, 90, -155); } };
  G['4'] = { w: 630, d() { Lp([[430, B], [430, T], [65, 215], [585, 215]]); } };
  G['5'] = { w: 590, d() { Lp([[500, T], [125, T], [105, 395]]); Lp(F.join([[105, 395]], A(300, 230, 230, 170, 150, -160))); } };
  G['6'] = { w: 610, d() { ringC(305, 230, 235, 165); Ar(525, 230, 455, 420, 180, 118); } };
  G['7'] = { w: 570, d() { Lp([[65, T], [505, T], [205, B]]); } };
  G['8'] = { w: 610, d() { ringC(305, 510, 190, 125); ringC(305, 205, 230, 140); } };
  G['9'] = { w: 610, d() { ringC(305, 470, 235, 165); Ar(85, 470, 455, 420, 0, -62); } };
  // ---------- pontuação ----------
  const dot = (x, y = 70) => F.disc(x, y, 76);
  G['.'] = { w: 260, d() { dot(130); } };
  G[','] = { w: 260, d() { dot(130); Lp([[160, 60], [100, -110]]); } };
  G[':'] = { w: 260, d() { dot(130); dot(130, 420); } };
  G[';'] = { w: 260, d() { G[','].d(); dot(130, 420); } };
  G['!'] = { w: 270, d() { Lp([[135, T], [135, 260]]); dot(135); } };
  G['?'] = { w: 560, d() { Lp(F.join(A(280, 505, 200, 140, 170, -50), [[290, 300], [290, 250]])); dot(290); } };
  G['-'] = { w: 420, d() { Lp([[85, 290], [335, 290]]); } };
  G['–'] = { w: 580, d() { Lp([[70, 290], [510, 290]]); } };
  G['—'] = { w: 920, d() { Lp([[70, 290], [850, 290]]); } };
  G["'"] = { w: 230, d() { Lp([[115, T + 30], [115, 500]]); } };
  G['"'] = { w: 400, d() { Lp([[115, T + 30], [115, 500]]); Lp([[285, T + 30], [285, 500]]); } };
  G['('] = { w: 340, d() { Ar(340, 300, 220, 450, 125, 235); } };
  G[')'] = { w: 340, d() { Ar(0, 300, 220, 450, 55, -55); } };
  G['/'] = { w: 440, d() { Lp([[90, -60], [350, T + 40]]); } };
  G['|'] = { w: 260, d() { Lp([[130, -150], [130, T + 80]]); } };
  G['+'] = { w: 580, d() { Lp([[80, 300], [500, 300]]); Lp([[290, 90], [290, 510]]); } };
  G['='] = { w: 580, d() { Lp([[80, 395], [500, 395]]); Lp([[80, 195], [500, 195]]); } };
  G['*'] = { w: 480, d() { for (let k = 0; k < 5; k++) { const a = (90 + k * 72) * Math.PI / 180; Lp([[240, 500], [240 + 150 * Math.cos(a), 500 + 150 * Math.sin(a)]]); } } };
  G['&'] = { w: 720, d() { Lp(F.join(F.bez([650, B], [400, 260], [150, 400], [185, 560]), F.bez([185, 560], [210, 700], [430, 700], [420, 560]).slice(1), F.bez([420, 560], [410, 440], [95, 400], [95, 200]).slice(1), F.bez([95, 200], [95, 20], [470, 0], [590, 280]).slice(1))); } };
  G['@'] = { w: 880, d() { Ar(440, 300, 370, 370, -25, 300); ringC(420, 300, 130, 140); Lp([[555, 440], [555, 170]]); } };
  G['#'] = { w: 650, d() { Lp([[190, B], [290, T]]); Lp([[390, B], [490, T]]); Lp([[80, 440], [590, 440]]); Lp([[60, 235], [570, 235]]); } };
  G['%'] = { w: 780, d() { ringC(190, 520, 110, 135); ringC(590, 180, 110, 135); Lp([[160, B], [620, T]]); } };
  G['$'] = { w: 610, d() { G.S.d(); Lp([[305, -60], [305, 760]]); } };
  G['['] = { w: 340, d() { Lp([[290, 760], [120, 760], [120, -100], [290, -100]]); } };
  G[']'] = { w: 340, d() { Lp([[50, 760], [220, 760], [220, -100], [50, -100]]); } };
  G['_'] = { w: 560, d() { Lp([[40, -110], [520, -110]]); } };
  G['«'] = { w: 580, d() { [70, 270].forEach((x) => Lp([[x + 190, 500], [x + 40, 300], [x + 190, 100]])); } };
  G['»'] = { w: 580, d() { [70, 270].forEach((x) => Lp([[x + 50, 500], [x + 200, 300], [x + 50, 100]])); } };
  G['✦'] = { w: 720, d() { const c = F.c, cx = 360, cy = 330, R = 330, r = 70; c.beginPath(); c.moveTo(cx, cy + R); for (let k = 1; k <= 8; k++) { const a = k * Math.PI / 4 + Math.PI / 2, rad = k % 2 ? r : R; const am = a - Math.PI / 8; c.quadraticCurveTo(cx + r * 0.6 * Math.cos(am), cy + r * 0.6 * Math.sin(am), cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } c.fill(); } };
  G['°'] = { w: 360, d() { F.draw(F.mono(A(180, 590, 95, 95, 0, 360), 70)); } };
  G[' '] = { w: 270, d() {} };
  // ---------- acentos ----------
  const ACC = {
    acute(x, y) { Lp([[x - 50, y], [x + 60, y + 110]]); },
    grave(x, y) { Lp([[x + 50, y], [x - 60, y + 110]]); },
    circ(x, y) { Lp([[x - 110, y], [x, y + 100], [x + 110, y]]); },
    tilde(x, y) { Lp(F.bez([x - 130, y + 20], [x - 60, y + 130], [x + 60, y - 30], [x + 130, y + 90], 60)); },
    diaer(x, y) { F.disc(x - 95, y + 50, 70); F.disc(x + 95, y + 50, 70); },
    ring(x, y) { F.draw(F.mono(A(x, y + 60, 70, 70, 0, 360), 56)); },
    ced(x) { F.draw(F.mono(F.join([[x, 30], [x, -40]], A(x - 10, -95, 75, 55, 80, -200)), 58)); }
  };
  const COMP = {};
  [['A', 'Á', 'acute'], ['A', 'À', 'grave'], ['A', 'Â', 'circ'], ['A', 'Ã', 'tilde'], ['A', 'Ä', 'diaer'], ['A', 'Å', 'ring'], ['E', 'É', 'acute'], ['E', 'È', 'grave'], ['E', 'Ê', 'circ'], ['E', 'Ë', 'diaer'], ['I', 'Í', 'acute'], ['I', 'Ì', 'grave'], ['I', 'Î', 'circ'], ['I', 'Ï', 'diaer'], ['O', 'Ó', 'acute'], ['O', 'Ò', 'grave'], ['O', 'Ô', 'circ'], ['O', 'Õ', 'tilde'], ['O', 'Ö', 'diaer'], ['U', 'Ú', 'acute'], ['U', 'Ù', 'grave'], ['U', 'Û', 'circ'], ['U', 'Ü', 'diaer'], ['C', 'Ç', 'ced'], ['N', 'Ñ', 'tilde']].forEach(([b, ch, a]) => {
    COMP[ch] = [b, a, 770];
    const lb = b === 'I' ? 'ı' : b.toLowerCase();
    COMP[ch.toLowerCase()] = [lb, a, 615];
  });
  const list = [];
  Object.keys(G).filter((k) => k !== 'ı').forEach((ch) => list.push({ ch, base: ch }));
  Object.keys(COMP).forEach((ch) => list.push({ ch, base: COMP[ch][0], accent: COMP[ch][1], ay: COMP[ch][2] }));
  const glyphs = list.map((it) => {
    const g = G[it.base];
    return { ch: it.ch, adv: g.w, draw() { g.d(); if (it.accent) { const x = it.base === 'C' || it.base === 'c' ? g.w / 2 + 10 : g.w / 2; if (it.accent === 'ced') ACC.ced(x); else ACC[it.accent](x, it.ay); } } };
  });
  // ---------- tinta impressa: borda irregular + respingos leves ----------
  function hash(x, y, s) { let n = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; n = (n ^ (n >>> 13)) * 1274126177 | 0; return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  function vnoise(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi; const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function boxBlur(src, W, H, r) { // 3 passadas ~ gaussiana
    let a = Float32Array.from(src), b = new Float32Array(W * H);
    for (let pass = 0; pass < 3; pass++) {
      for (let y = 0; y < H; y++) { let acc = 0; const o = y * W; for (let x = -r; x <= r; x++) acc += a[o + Math.min(W - 1, Math.max(0, x))]; for (let x = 0; x < W; x++) { b[o + x] = acc / (2 * r + 1); acc += a[o + Math.min(W - 1, x + r + 1)] - a[o + Math.max(0, x - r)]; } }
      for (let x = 0; x < W; x++) { let acc = 0; for (let y = -r; y <= r; y++) acc += b[Math.min(H - 1, Math.max(0, y)) * W + x]; for (let y = 0; y < H; y++) { a[y * W + x] = acc / (2 * r + 1); acc += b[Math.min(H - 1, y + r + 1) * W + x] - b[Math.max(0, y - r) * W + x]; } }
    }
    return a;
  }
  function distress(mask, info, g) {
    const { W: Wd, H: Hd, sc, pad, m } = info;
    const seed = g.ch.codePointAt(0);
    const v = boxBlur(mask, Wd, Hd, Math.max(1, Math.round(4 * sc)));
    const out = new Uint8Array(Wd * Hd);
    for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) {
      const i = y * Wd + x, val = v[i];
      if (val < 0.02) { out[i] = 0; continue; }
      if (val > 0.98) { out[i] = 1; continue; }
      const ux = x / sc, uy = y / sc;
      const n = 0.7 * vnoise(ux / 11, uy / 11, seed) + 0.3 * vnoise(ux / 6, uy / 6, seed + 7);
      out[i] = val + (n - 0.5) * 0.7 > 0.5 ? 1 : 0;
    }
    // respingos pequenos perto da borda (fora) e furinhos (dentro)
    const r = FL.rnd(seed * 97 + 13);
    let placed = 0, tries = 0;
    while (placed < 7 && tries++ < 4000) {
      const x = Math.floor(r() * Wd), y = Math.floor(r() * Hd), i = y * Wd + x, val = v[i];
      const outside = val > 0.04 && val < 0.22, inside = val > 0.8 && val < 0.93;
      if (!outside && !inside) continue;
      const rad = (outside ? 2.2 + r() * 3.2 : 2 + r() * 2.6) * sc;
      for (let yy = -Math.ceil(rad); yy <= rad; yy++) for (let xx = -Math.ceil(rad); xx <= rad; xx++) {
        if (xx * xx + yy * yy > rad * rad) continue; const X = x + xx, Y = y + yy; if (X < 0 || Y < 0 || X >= Wd || Y >= Hd) continue; out[Y * Wd + X] = outside ? 1 : 0;
      }
      placed++;
    }
    return out;
  }
  return { name: 'PRINTED BOY SURREAL', glyphs, metrics: { asc: 920, desc: -250, cap: 700, x: 510 }, opts: { post: distress } };
})();
