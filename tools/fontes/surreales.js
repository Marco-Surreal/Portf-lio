// SURREALES — desenho original. Pesada, serifas macias, terminais em espiral, letras levemente desalinhadas.
window.SURREALES = (function () {
  const F = FL;
  const K = { H: 700, S: 150, T: 64, SE: 44, ST: 48, HB: 72 };
  FL.setCurl(1.6);
  const G = {};
  // ---------- peças ----------
  function stem(x, y0, y1, w = K.S) { F.rr(x, y0, w, y1 - y0, 4); }
  function serif(x, y, w = K.S, l = 1, r = 1, top = false) {
    const e = K.SE, th = K.ST, br = 34, c = F.c;
    const y0 = top ? y - th : y;
    F.rr(x - e * l, y0, w + e * (l + r), th, 18);
    const yb = top ? y - th : y + th, s = top ? -1 : 1;
    if (l) { c.beginPath(); c.moveTo(x + 1, yb + s * br); c.quadraticCurveTo(x, yb, x - e * l * 0.9, yb); c.lineTo(x + 1, yb); c.fill(); }
    if (r) { c.beginPath(); c.moveTo(x + w - 1, yb + s * br); c.quadraticCurveTo(x + w, yb, x + w + e * r * 0.9, yb); c.lineTo(x + w - 1, yb); c.fill(); }
  }
  function sstem(x, y0, y1, w = K.S, sb = [1, 1], st = [1, 1]) { // haste com serifas
    stem(x, y0, y1, w);
    if (sb) serif(x, y0, w, sb[0], sb[1]);
    if (st === 'c') { serif(x, y1, w, 0, 0.6, true); curlTL(x, y1); }
    else if (st) serif(x, y1, w, st[0], st[1], true);
  }
  // serifa do alto à esquerda que enrola para baixo (espiral)
  function curlTL(x, y) {
    const h = K.ST + 8, yc = y - h / 2;
    const P = F.mono([[x + 40, yc], [x - 50, yc]], h);
    F.draw(F.curl(P, 1, 42, 1.1, 20), 1.0);
  }
  function bar(x0, x1, y, h = K.HB) { F.rr(x0, y, x1 - x0, h, 6); }
  // braço horizontal que termina enrolando (dir: +1 vai para a direita; down: enrola para baixo)
  function beak(x, y, h, dir, down, r0 = 60, turns = 1.08) {
    const yc = y + h / 2;
    const P = F.mono([[x - dir * 40, yc], [x, yc]], h);
    const side = (dir > 0) === down ? -1 : 1;
    F.draw(F.curl(P, side, r0, turns, 26), 0.95);
  }
  function diag(xb, xt, w, yb = 0, yt = K.H, wt = w) { F.poly([[xb, yb], [xb + w, yb], [xt + wt, yt], [xt, yt]]); }
  // barriga para a direita (B, D, P, R): centro da linha nas pontas, lado direito grosso
  function bowlR(x0, yb, yt, xr, thick = K.S * 0.92, thin = K.HB) {
    const ry = (yt - yb - thin) / 2, cy = (yt + yb) / 2;
    const rx = Math.min(ry, (xr - x0) * 0.55);
    const cx = xr - thick / 2 - rx;
    const P = F.pen(F.join([[x0 + 10, yt - thin / 2], [cx, yt - thin / 2]], F.arc(cx, cy, rx, ry, 90, -90), [[cx, yb + thin / 2], [x0 + 10, yb + thin / 2]]), thick, thin, 1.6);
    F.draw(P);
  }
  function oval(cx, cy, rx, ry, thick = K.S * 1.02, thin = K.T, a0 = 0, a1 = 360, pow = 1.5) {
    return F.pen(F.arc(cx, cy, rx, ry, a0, a1, 240), thick, thin, pow);
  }
  // ---------- maiúsculas ----------
  G.A = { w: 730, d() { diag(58, 300, 96, 0, K.H, 72); diag(526, 300, 150, 0, K.H, 124); bar(170, 560, 186, 66); F.rr(18, 0, 196, K.ST, 18); F.rr(482, 0, 236, K.ST, 18);
    const P = F.mono([[318, K.H - 34], [282, K.H - 34]], 68); F.draw(F.curl(P, 1, 46, 0.9, 24), 0.95); } };
  G.B = { w: 730, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 0], 'c'); bowlR(140, 340, K.H, 580, 132); bowlR(140, 0, 380, 624); } };
  G.C = { w: 650, d() { const P = oval(350, 350, 262, 318, 156, 62, 36, 318); F.draw(P); const T0 = F.rev(P.slice(0, 26)); F.draw(F.curl(T0, -1, 50, 1.0, 26), 0.95); const T1 = P.slice(-26); F.draw(Object.assign(T1, { ball: true }), 0.75); } };
  G.D = { w: 760, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 0], 'c'); bowlR(140, 0, K.H, 650, 158); } };
  G.E = { w: 670, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 0], 'c'); bar(150, 500, K.H - K.HB); beak(500, K.H - K.HB, K.HB, 1, true); bar(150, 430, 316, 64); F.rr(400, 286, 40, 124, 12); bar(150, 530, 0); beak(530, 0, K.HB, 1, false); } };
  G.F = { w: 650, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 1], 'c'); bar(150, 500, K.H - K.HB); beak(500, K.H - K.HB, K.HB, 1, true); bar(150, 430, 300, 64); F.rr(400, 270, 40, 124, 12); } };
  G.G = { w: 700, d() { const P = oval(350, 350, 262, 318, 156, 62, 36, 300); F.draw(P); F.draw(F.curl(F.rev(P.slice(0, 26)), -1, 50, 1.0, 26), 0.95); F.rr(470, 40, 150, 300, 30); bar(380, 660, 270, 70); } };
  G.H = { w: 830, ox: 70, d() { sstem(50, 0, K.H, K.S, [1, 1], 'c'); sstem(560, 0, K.H); bar(190, 570, 310, 70); } };
  G.I = { w: 330, d() { sstem(90, 0, K.H); } };
  G.J = { w: 520, d() { stem(290, 200, K.H); serif(290, K.H, K.S, 1, 1, true); const P = F.pen(F.join([[365, 210]], F.arc(250, 210, 115, 150, 0, -175, 90)), K.S, 60); F.draw(F.curl(P, -1, 46, 0.95, 26), 0.95); } };
  G.K = { w: 790, ox: 70, d() { sstem(50, 0, K.H, K.S, [1, 1], 'c'); diag(170, 520, 84, 250, K.H, 84); F.rr(470, K.H - K.ST, 200, K.ST, 18);
    const P = F.pen(F.bez([250, 380], [380, 300], [470, 150], [560, 40]), 150, 90); F.draw(F.curl(P, 1, 40, 0.95, 24), 0.95); } };
  G.L = { w: 650, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 0], 'c'); bar(150, 520, 0); beak(520, 0, K.HB, 1, false); } };
  G.M = { w: 880, d() { diag(50, 70, 92, 0, K.H, 92); diag(410, 70, 150, 0, K.H, 150); diag(410, 690, 82, 0, K.H, 82); stem(680, 0, K.H, K.S); serif(680, 0, K.S); serif(680, K.H, K.S, 0, 1, true); F.rr(14, 0, 166, K.ST, 18); F.rr(20, K.H - K.ST, 120, K.ST, 18); } };
  G.N = { w: 760, d() { stem(50, 0, K.H, 90); F.rr(10, 0, 170, K.ST, 18); F.rr(14, K.H - K.ST, 120, K.ST, 18); diag(560, 60, 150, 0, K.H, 150); stem(620, 0, K.H, 90); F.rr(580, K.H - K.ST, 170, K.ST, 18); } };
  G.O = { w: 720, d() { F.draw(oval(360, 350, 272, 316, 164, 64)); } };
  G.P = { w: 710, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 1], 'c'); bowlR(140, 280, K.H, 610, 150); } };
  G.Q = { w: 720, d() { F.draw(oval(360, 350, 272, 316, 164, 64)); const P = F.pen(F.bez([300, 40], [420, -10], [520, -90], [640, -40]), 110, 60); F.draw(F.curl(P, 1, 40, 0.9, 24), 0.95); } };
  G.R = { w: 770, ox: 70, d() { sstem(56, 0, K.H, K.S, [1, 1], 'c'); bowlR(140, 300, K.H, 600, 150); const P = F.pen(F.bez([340, 330], [470, 300], [470, 120], [520, 40]), 150, 100); const Q = F.join(P.map((p) => [p.x, p.y]), F.bez([520, 40], [550, -10], [610, 0], [650, 50]).slice(1)); const R = F.pen(Q, 150, 60); F.draw(Object.assign(F.taper(R, 0.7, 1, 40), { ball: true }), 0.8); } };
  G.S = { w: 600, d() { const pts = F.join(F.bez([480, 600], [420, 720], [110, 720], [110, 540]), F.bez([110, 540], [110, 380], [500, 380], [500, 180]).slice(1), F.bez([500, 180], [500, -20], [160, -20], [100, 120]).slice(1));
    const P = F.pen(pts, 166, 60, 1.3); F.draw(P); F.draw(F.curl(F.rev(P.slice(0, 20)), -1, 44, 0.95, 26), 0.95); F.draw(F.curl(P.slice(-20), 1, 40, 0.9, 24), 0.95); } };
  G.T = { w: 680, d() { bar(70, 610, K.H - K.HB, K.HB); beak(70, K.H - K.HB, K.HB, -1, true); beak(610, K.H - K.HB, K.HB, 1, true); sstem(265, 0, K.H - 20, K.S, [1, 1], null); } };
  G.U = { w: 740, d() { const pts = F.join([[125, K.H - 10], [125, 260]], F.arc(370, 260, 245, 230, 180, 360, 120), [[615, 260], [615, K.H - 10]]);
    const P = pts.map((p, i) => ({ x: p[0], y: p[1], w: p[0] < 370 ? 150 : 92 })); F.draw(F.pen(pts.slice(0), 150, 62).map((q, i) => ({ x: q.x, y: q.y, w: q.x < 370 ? q.w : Math.min(q.w, 92) }))); serif(50, K.H, 150, 1, 1, true); serif(569, K.H, 92, 1, 1, true); } };
  G.V = { w: 720, d() { diag(290, 50, 150, 0, K.H, 150); diag(290, 590, 86, 0, K.H, 86); F.rr(14, K.H - K.ST, 220, K.ST, 18); F.rr(530, K.H - K.ST, 180, K.ST, 18); } };
  G.W = { w: 1000, d() { diag(220, 40, 140, 0, K.H, 140); diag(220, 450, 80, 0, K.H, 80); diag(600, 420, 140, 0, K.H, 140); diag(600, 850, 80, 0, K.H, 80); F.rr(10, K.H - K.ST, 200, K.ST, 18); F.rr(380, K.H - K.ST, 200, K.ST, 18); F.rr(800, K.H - K.ST, 180, K.ST, 18); } };
  G.X = { w: 720, d() { diag(500, 60, 150, 0, K.H, 150); diag(70, 540, 86, 0, K.H, 86); F.rr(20, K.H - K.ST, 220, K.ST, 18); F.rr(490, K.H - K.ST, 190, K.ST, 18); F.rr(30, 0, 190, K.ST, 18); F.rr(460, 0, 240, K.ST, 18); } };
  G.Y = { w: 700, d() { diag(270, 40, 150, 330, K.H, 150); diag(330, 560, 84, 330, K.H, 84); sstem(270, 0, 340, K.S, [1, 1], null); F.rr(10, K.H - K.ST, 210, K.ST, 18); F.rr(510, K.H - K.ST, 180, K.ST, 18); } };
  G.Z = { w: 640, d() { bar(90, 580, K.H - K.HB); beak(90, K.H - K.HB, K.HB, -1, true); diag(60, 430, 150, 0, K.H, 150); bar(60, 560, 0); beak(560, 0, K.HB, 1, false); } };
  // ---------- números ----------
  G['0'] = { w: 640, d() { F.draw(oval(320, 350, 228, 312, 150, 66)); } };
  G['1'] = { w: 440, d() { sstem(150, 0, K.H, K.S, [1, 1], null); const P = F.pen(F.bez([200, K.H - 30], [160, K.H - 60], [110, K.H - 130], [50, K.H - 150]), 90, 60); F.draw(F.curl(P, 1, 30, 0.6, 30), 0.9); } };
  G['2'] = { w: 600, d() { const pts = F.join(F.arc(300, 500, 210, 190, 165, -20, 120), F.bez([497, 435], [460, 280], [200, 200], [95, 40]).slice(1)); const P = F.pen(pts, 156, 66); F.draw(P); F.draw(F.curl(F.rev(P.slice(0, 20)), 1, 40, 0.95, 26), 0.95); bar(60, 520, 0); beak(520, 0, K.HB, 1, false); } };
  G['3'] = { w: 590, d() { const a = F.pen(F.arc(280, 530, 200, 170, 160, -90, 140), 150, 64); F.draw(a); F.draw(F.curl(F.rev(a.slice(0, 18)), 1, 40, 0.95, 26), 0.95); const b = F.pen(F.arc(280, 200, 230, 200, 90, -170, 160), 160, 64); F.draw(b); F.draw(F.curl(b.slice(-18), -1, 40, 0.9, 26), 0.95); } };
  G['4'] = { w: 640, d() { diag(40, 340, 110, 210, K.H, 110); bar(40, 610, 170, 76); sstem(380, 0, K.H, K.S, [1, 1], null); } };
  G['5'] = { w: 590, d() { bar(140, 500, K.H - K.HB); beak(500, K.H - K.HB, K.HB, 1, true); diag(90, 110, 120, 340, K.H - 10, 110); const b = F.pen(F.join([[140, 420]], F.arc(290, 230, 230, 210, 125, -170, 160)), 160, 64); F.draw(b); F.draw(F.curl(b.slice(-18), -1, 40, 0.9, 26), 0.95); } };
  G['6'] = { w: 620, d() { F.draw(oval(320, 230, 240, 230, 150, 64)); const P = F.pen(F.join(F.arc(560, 230, 480, 450, 180, 112, 80)), 150, 64); F.draw(F.curl(P, -1, 40, 0.9, 26), 0.95); } };
  G['7'] = { w: 580, d() { bar(50, 550, K.H - K.HB); beak(50, K.H - K.HB, K.HB, -1, true); diag(150, 410, 150, 0, K.H - K.HB, 140); F.rr(110, 0, 230, K.ST, 18); } };
  G['8'] = { w: 620, d() { F.draw(oval(310, 525, 190, 165, 140, 62)); F.draw(oval(310, 200, 235, 200, 156, 64)); } };
  G['9'] = { w: 620, d() { F.draw(oval(300, 470, 240, 230, 150, 64)); const P = F.pen(F.arc(60, 470, 480, 450, 0, -68, 80), 150, 64); F.draw(F.curl(P, -1, 40, 0.9, 26), 0.95); } };
  // ---------- pontuação ----------
  const dot = (x, y, r = 62) => F.disc(x, y, r);
  G['.'] = { w: 260, d() { dot(130, 62); } };
  G[','] = { w: 260, d() { dot(130, 62); F.draw(F.taper(F.pen(F.bez([170, 70], [180, -10], [140, -80], [80, -120]), 70, 60), 0.3, 1, 22)); } };
  G[':'] = { w: 260, d() { dot(130, 62); dot(130, 430); } };
  G[';'] = { w: 260, d() { G[','].d(); dot(130, 430); } };
  G['!'] = { w: 300, d() { F.poly([[90, K.H], [210, K.H], [175, 200], [125, 200]]); F.disc(150, K.H - 4, 60); dot(150, 62); } };
  G['?'] = { w: 560, d() { const P = F.pen(F.join(F.arc(280, 510, 200, 180, 170, -40, 120), F.bez([433, 395], [330, 330], [290, 300], [290, 210]).slice(1)), 150, 70); F.draw(P); F.draw(F.curl(F.rev(P.slice(0, 18)), 1, 40, 0.95, 26), 0.95); dot(290, 62); } };
  G['-'] = { w: 400, d() { F.rr(60, 250, 280, 92, 30); } };
  G['–'] = { w: 560, d() { F.rr(40, 250, 480, 84, 30); } };
  G['—'] = { w: 900, d() { F.rr(40, 250, 820, 84, 30); } };
  G["'"] = { w: 220, d() { F.poly([[60, K.H + 40], [160, K.H + 40], [130, 470], [90, 470]]); F.disc(110, K.H + 34, 50); } };
  G['"'] = { w: 380, d() { F.poly([[60, K.H + 40], [160, K.H + 40], [130, 470], [90, 470]]); F.disc(110, K.H + 34, 50); F.poly([[220, K.H + 40], [320, K.H + 40], [290, 470], [250, 470]]); F.disc(270, K.H + 34, 50); } };
  G['('] = { w: 340, d() { F.draw(F.pen(F.arc(330, 330, 230, 470, 120, 240, 120), 110, 60)); } };
  G[')'] = { w: 340, d() { F.draw(F.pen(F.arc(10, 330, 230, 470, 60, -60, 120), 110, 60)); } };
  G['/'] = { w: 420, d() { diag(30, 290, 100, -60, K.H + 40, 100); } };
  G['+'] = { w: 560, d() { F.rr(60, 260, 440, 84, 20); F.rr(238, 80, 84, 440, 20); } };
  G['='] = { w: 560, d() { F.rr(60, 360, 440, 80, 20); F.rr(60, 170, 440, 80, 20); } };
  G['*'] = { w: 460, d() { for (let k = 0; k < 5; k++) { const a = (90 + k * 72) * Math.PI / 180; F.draw(F.mono([[230, 520], [230 + 150 * Math.cos(a), 520 + 150 * Math.sin(a)]], 64)); } } };
  G['&'] = { w: 720, d() { const pts = F.join(F.bez([640, 0], [400, 230], [150, 400], [180, 560]), F.bez([180, 560], [200, 720], [430, 720], [430, 570]).slice(1), F.bez([430, 570], [430, 440], [80, 400], [80, 200]).slice(1), F.bez([80, 200], [80, -20], [450, -40], [580, 260]).slice(1)); const P = F.pen(pts, 150, 64); F.draw(P); F.draw(F.curl(P.slice(-15), 1, 34, 0.8, 24), 0.95); } };
  G['@'] = { w: 860, d() { F.draw(F.pen(F.arc(430, 300, 360, 360, -20, 300, 240), 110, 56)); F.draw(oval(410, 300, 120, 140, 110, 56)); F.rr(530, 120, 90, 330, 30); } };
  G['#'] = { w: 640, d() { diag(150, 260, 80, 0, K.H, 80); diag(350, 460, 80, 0, K.H, 80); F.rr(60, 430, 520, 72, 20); F.rr(40, 200, 520, 72, 20); } };
  G['%'] = { w: 760, d() { F.ring(190, 530, 140, 170, 50, 90); F.ring(570, 170, 140, 170, 50, 90); diag(140, 520, 90, 0, K.H, 90); } };
  G['$'] = { w: 600, d() { G.S.d(); F.rr(260, -90, 80, 880, 30); } };
  G['['] = { w: 340, d() { F.rr(90, -100, 120, 900, 10); F.rr(90, 700, 210, 100, 10); F.rr(90, -100, 210, 100, 10); } };
  G[']'] = { w: 340, d() { F.rr(130, -100, 120, 900, 10); F.rr(40, 700, 210, 100, 10); F.rr(40, -100, 210, 100, 10); } };
  G['_'] = { w: 560, d() { F.rr(20, -110, 520, 70, 10); } };
  G['«'] = { w: 560, d() { [60, 270].forEach((x) => { F.draw(F.mono([[x + 200, 520], [x + 40, 350], [x + 200, 180]], 82)); }); } };
  G['»'] = { w: 560, d() { [40, 250].forEach((x) => { F.draw(F.mono([[x + 60, 520], [x + 220, 350], [x + 60, 180]], 82)); }); } };
  G['✦'] = { w: 720, d() { const c = F.c, cx = 360, cy = 350, R = 340, r = 70; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 2, rad = k % 2 ? r : R; const x = cx + rad * Math.cos(a), y = cy + rad * Math.sin(a); if (!k) c.moveTo(x, y); else { const am = a - Math.PI / 8; c.quadraticCurveTo(cx + r * 0.6 * Math.cos(am), cy + r * 0.6 * Math.sin(am), x, y); } } const a = Math.PI / 2; c.quadraticCurveTo(cx + r * 0.6 * Math.cos(a - Math.PI / 8), cy + r * 0.6 * Math.sin(a - Math.PI / 8), cx, cy + R); c.fill(); } };
  G[' '] = { w: 260, d() {} };
  // ---------- acentos ----------
  const ACC = {
    acute(x, y) { F.draw(F.taper(F.mono([[x - 50, y], [x + 70, y + 120]], 70), 0.6, 1, 50)); },
    grave(x, y) { F.draw(F.taper(F.mono([[x + 50, y], [x - 70, y + 120]], 70), 0.6, 1, 50)); },
    circ(x, y) { F.draw(F.mono([[x - 110, y], [x, y + 110], [x + 110, y]], 64)); },
    tilde(x, y) { F.draw(F.mono(F.bez([x - 130, y + 20], [x - 60, y + 140], [x + 60, y - 40], [x + 130, y + 90]), 62)); },
    diaer(x, y) { F.disc(x - 85, y + 50, 50); F.disc(x + 85, y + 50, 50); },
    ring(x, y) { F.ring(x, y + 60, 70, 70, 34, 34); },
    ced(x) { F.draw(F.taper(F.pen(F.join([[x, 30], [x, -40]], F.arc(x - 10, -90, 80, 55, 80, -200, 80)), 60, 40), 0.6, 1, 22)); }
  };
  const COMP = { 'Á': ['A', 'acute'], 'À': ['A', 'grave'], 'Â': ['A', 'circ'], 'Ã': ['A', 'tilde'], 'Ä': ['A', 'diaer'], 'Å': ['A', 'ring'], 'É': ['E', 'acute'], 'È': ['E', 'grave'], 'Ê': ['E', 'circ'], 'Ë': ['E', 'diaer'], 'Í': ['I', 'acute'], 'Ì': ['I', 'grave'], 'Î': ['I', 'circ'], 'Ï': ['I', 'diaer'], 'Ó': ['O', 'acute'], 'Ò': ['O', 'grave'], 'Ô': ['O', 'circ'], 'Õ': ['O', 'tilde'], 'Ö': ['O', 'diaer'], 'Ú': ['U', 'acute'], 'Ù': ['U', 'grave'], 'Û': ['U', 'circ'], 'Ü': ['U', 'diaer'], 'Ç': ['C', 'ced'], 'Ñ': ['N', 'tilde'] };
  const XC = { A: 360, E: 330, I: 165, O: 360, U: 370, C: 350, N: 380 };
  // ---------- montagem ----------
  // minúsculas = versaletes (mesmo desenho, menor, com peso compensado e outro desalinhamento)
  const list = [];
  const SC = 0.8;
  function add(ch, base, sc, accent, seed) { list.push({ ch, base, sc, accent, seed }); }
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((ch, i) => { add(ch, ch, 1, null, i + 11); add(ch.toLowerCase(), ch, SC, null, i + 101); });
  Object.keys(COMP).forEach((ch, i) => { const [b, a] = COMP[ch]; add(ch, b, 1, a, b.charCodeAt(0) - 54); add(ch.toLowerCase(), b, SC, a, b.charCodeAt(0) + 36); });
  Object.keys(G).filter((k) => !/[A-Z]/.test(k)).forEach((ch, i) => add(ch, ch, 1, null, 300 + i));
  function glyph(item) {
    const g0 = G[item.base];
    const sc = item.sc;
    const g = { w: g0.w, ox: g0.ox || 0, d: g0.d };
    return {
      ch: item.ch, adv: Math.round(g.w * sc + (sc < 1 ? 16 : 0) + (item.base === ' ' ? 0 : 50)),
      draw(ctx) {
        const r = F.rnd(item.seed * 2654435761);
        r(); r();
        const isLetter = /[A-Z]/.test(item.base);
        const rot = isLetter ? (r() - 0.5) * 2 * 2.6 : 0, dy = isLetter ? (r() - 0.5) * 2 * 16 : 0;
        ctx.save();
        ctx.translate((sc < 1 ? 8 : 0) + 25, 0);
        ctx.translate(g.w * sc / 2, 350 * sc + dy); ctx.rotate(rot * Math.PI / 180); ctx.translate(-g.w * sc / 2, -350 * sc);
        ctx.scale(sc, sc); ctx.translate(g.ox, 0);
        const save = Object.assign({}, K);
        if (sc < 1) { K.S = 150 * 1.06; K.T = 64 * 1.08; K.HB = 72 * 1.1; K.ST = 48 * 1.1; }
        g.d();
        if (item.accent) { const x = XC[item.base] + 0; if (item.accent === 'ced') ACC.ced(x); else ACC[item.accent](x, K.H + 70); }
        Object.assign(K, save);
        ctx.restore();
      }
    };
  }
  return { name: 'SURREALES', glyphs: list.map(glyph), metrics: { asc: 920, desc: -260, cap: 700, x: 560 }, opts: { bold: 18 } };
})();
