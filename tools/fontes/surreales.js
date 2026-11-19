// SURREALES v2 — desenho original no estilo da Reagan: muito pesada, hastes da direita mais grossas que as da esquerda,
// barras finas, contraformas pequenas, serifas com apoio largo. Das espirais da Choco/Reagan: serifas que se esticam
// e enrolam em espiral aberta. Letras levemente desalinhadas (giro e altura), preenchimento liso.
window.SURREALES = (function () {
  const F = FL;
  const K = { H: 700, X: 510, SL: 145, SH: 212, HB: 70, HBB: 92, ST: 54, SE: 48 };
  const G = {};
  // ---------- peças ----------
  function stem(x, y0, y1, w) { F.rr(x, y0, w, y1 - y0, 4); }
  function serif(x, y, w, l = 1, r = 1, top = false) {
    const e = K.SE, th = K.ST, br = 46, c = F.c;
    const y0 = top ? y - th : y;
    F.rr(x - e * l, y0, w + e * (l + r), th, 16);
    const yb = top ? y - th : y + th, s = top ? -1 : 1;
    if (l) { c.beginPath(); c.moveTo(x + 1, yb + s * br); c.quadraticCurveTo(x, yb, x - e * l * 0.92, yb); c.lineTo(x + 1, yb); c.fill(); }
    if (r) { c.beginPath(); c.moveTo(x + w - 1, yb + s * br); c.quadraticCurveTo(x + w, yb, x + w + e * r * 0.92, yb); c.lineTo(x + w - 1, yb); c.fill(); }
  }
  function sstem(x, y0, y1, w, sb = [1, 1], st = [1, 1]) { stem(x, y0, y1, w); if (sb) serif(x, y0, w, sb[0], sb[1]); if (st) serif(x, y1, w, st[0], st[1], true); }
  function bar(x0, x1, y, h = K.HB) { F.rr(x0, y, x1 - x0, h, 8); }
  // braço que se estica e enrola em espiral aberta. dir: +1 vai para a direita; down: enrola para baixo
  function armSpiral(x, y, h, dir, down, o = {}) {
    const yc = y + h / 2;
    const P = F.mono([[x - dir * 40, yc], [x, yc]], h);
    F.draw(F.spiral(P, (dir > 0) === down ? -1 : 1, Object.assign({ ext: 34, r0: 72, turns: 1.2, w1: 16, rEnd: 0.22 }, o)));
  }
  // serifa de entrada das minúsculas (alto, à esquerda): estica para a esquerda e enrola para baixo
  function entry(x, y, o = {}) {
    const h = 58, yc = y - h / 2;
    const P = F.mono([[x + 40, yc], [x, yc]], h);
    F.draw(F.spiral(P, 1, Object.assign({ ext: 36, r0: 56, turns: 1.2, w1: 15, rEnd: 0.22 }, o)));
  }
  function diag(xb, xt, w, yb = 0, yt = K.H, wt = w) { F.poly([[xb, yb], [xb + w, yb], [xt + wt, yt], [xt, yt]]); }
  function bowlR(x0, yb, yt, xr, thick = K.SH, thin = K.HB) {
    const ry = (yt - yb - thin) / 2, cy = (yt + yb) / 2;
    const rx = Math.min(ry * 1.05, (xr - x0) * 0.6);
    const cx = xr - thick / 2 - rx;
    F.draw(F.pen(F.join([[x0 + 10, yt - thin / 2], [cx, yt - thin / 2]], F.arc(cx, cy, rx, ry, 90, -90), [[cx, yb + thin / 2], [x0 + 10, yb + thin / 2]]), thick, thin, 1.6));
  }
  const oval = (cx, cy, rx, ry, thick, thin, a0 = 0, a1 = 360, pow = 1.5) => F.pen(F.arc(cx, cy, rx, ry, a0, a1, 260), thick, thin, pow);
  const ring = (cx, cy, rx, ry, irx, iry, dx = 0, dy = 0) => F.ring(cx, cy, rx, ry, irx, iry, cx + dx, cy + dy);
  const sp = (P, side, o) => F.draw(F.spiral(P, side, o));
  const ball = (P, r) => { const Q = P.slice(); Q.ball = true; Q.ballR = r; F.draw(Q); };
  // ---------- maiúsculas ----------
  G.A = { w: 720, d() { diag(40, 300, 128, 0, K.H, 76); diag(462, 300, 236, 0, K.H, 128); bar(150, 520, 168, 70);
    F.rr(430, 0, 290, K.ST, 16); sp(F.mono([[175, K.ST / 2], [120, K.ST / 2]], K.ST), -1, { ext: 30, r0: 58, turns: 1.05, w1: 17 }); } };
  G.B = { w: 700, d() { sstem(40, 0, K.H, 170, [1, 0], [1, 0]); bowlR(200, 330, K.H, 610, 196); bowlR(200, 0, 380, 670, 220, K.HBB); } };
  G.C = { w: 660, d() { const P = oval(345, 350, 255, 318, 220, 72, 42, 322); F.draw(P); sp(F.rev(P.slice(0, 24)), -1, { ext: 10, r0: 56, turns: 1.05, w1: 17 }); ball(P.slice(-24), 52); } };
  G.D = { w: 720, d() { sstem(40, 0, K.H, 165, [1, 0], [1, 0]); bowlR(195, 0, K.H, 690, 232, 78); } };
  G.E = { w: 680, d() { sstem(40, 0, K.H, 168, [1, 0], [1, 0]); bar(200, 560, K.H - K.HB); armSpiral(560, K.H - K.HB, K.HB, 1, true);
    bar(200, 470, 312, 68); F.rr(440, 280, 46, 132, 14); bar(200, 590, 0, K.HBB); armSpiral(590, 0, K.HBB, 1, false, { r0: 66 }); } };
  G.F = { w: 650, d() { sstem(40, 0, K.H, 168, [1, 1], [1, 0]); bar(200, 560, K.H - K.HB); armSpiral(560, K.H - K.HB, K.HB, 1, true); bar(200, 470, 300, 68); F.rr(440, 268, 46, 132, 14); } };
  G.G = { w: 710, d() { const P = oval(350, 350, 258, 318, 222, 72, 42, 302); F.draw(P); sp(F.rev(P.slice(0, 24)), -1, { ext: 10, r0: 56, turns: 1.05, w1: 17 }); F.rr(475, 40, 190, 300, 30); bar(395, 690, 268, 72); } };
  G.H = { w: 760, d() { sstem(40, 0, K.H, 140); sstem(500, 0, K.H, 212); bar(170, 520, 300, 78); } };
  G.I = { w: 390, d() { sstem(90, 0, K.H, 210); } };
  G.J = { w: 580, d() { stem(300, 210, K.H, 212); serif(300, K.H, 212, 1, 1, true); const P = F.pen(F.join([[406, 230]], F.arc(250, 230, 156, 175, 0, -168, 100)), 212, 64); sp(P, -1, { ext: 4, r0: 50, turns: 1.0, w1: 17 }); } };
  G.K = { w: 760, d() { sstem(40, 0, K.H, 160, [1, 1], [1, 1]); diag(190, 560, 92, 280, K.H, 92); F.rr(500, K.H - K.ST, 220, K.ST, 16);
    const P = F.pen(F.bez([280, 400], [430, 300], [520, 140], [590, 60]), 212, 150); sp(P, 1, { ext: 16, r0: 50, turns: 1.0, w1: 17 }); } };
  G.L = { w: 650, d() { sstem(40, 0, K.H, 212, [1, 0], [1, 1]); bar(250, 590, 0, K.HBB); armSpiral(590, 0, K.HBB, 1, false, { r0: 66 }); } };
  G.M = { w: 880, d() { diag(40, 60, 108, 0, K.H, 108); diag(380, 60, 212, 0, K.H, 212); diag(392, 640, 96, 0, K.H, 96); stem(640, 0, K.H, 200); serif(640, 0, 200); serif(640, K.H, 200, 0, 1, true);
    F.rr(0, 0, 190, K.ST, 16); F.rr(10, K.H - K.ST, 150, K.ST, 16); } };
  G.N = { w: 740, d() { stem(40, 0, K.H, 104); F.rr(0, 0, 190, K.ST, 16); F.rr(4, K.H - K.ST, 150, K.ST, 16); diag(500, 40, 214, 0, K.H, 214); stem(596, 0, K.H, 104); F.rr(552, K.H - K.ST, 190, K.ST, 16); } };
  G.O = { w: 720, d() { ring(360, 350, 330, 352, 136, 262, -30, 0); } };
  G.P = { w: 670, d() { sstem(40, 0, K.H, 200, [1, 1], [1, 0]); bowlR(230, 300, K.H, 650, 220); } };
  G.Q = { w: 720, d() { ring(360, 350, 330, 352, 136, 262, -30, 0); const P = F.pen(F.bez([330, 30], [450, -20], [540, -100], [650, -60]), 150, 90); sp(P, 1, { ext: 8, r0: 46, turns: 0.95, w1: 16 }); } };
  G.R = { w: 760, d() { sstem(40, 0, K.H, 190, [1, 1], [1, 0]); bowlR(220, 310, K.H, 640, 216); diag(420, 270, 214, 0, 340, 200); F.rr(380, 0, 300, K.ST, 16); armSpiral(680, 0, K.ST, 1, false, { r0: 50 }); } };
  G.S = { w: 630, d() { const pts = F.join(F.bez([505, 590], [440, 735], [95, 735], [95, 530]), F.bez([95, 530], [95, 370], [535, 400], [535, 190]).slice(1), F.bez([535, 190], [535, -40], [150, -40], [95, 120]).slice(1));
    const P = F.pen(pts, 226, 72, 1.25); F.draw(P); sp(F.rev(P.slice(0, 16)), -1, { ext: 6, r0: 52, turns: 1.0, w1: 17 }); sp(P.slice(-16), 1, { ext: 6, r0: 50, turns: 1.0, w1: 17 }); } };
  G.T = { w: 680, d() { bar(70, 610, K.H - 80, 80); armSpiral(70, K.H - 80, 80, -1, true); armSpiral(610, K.H - 80, 80, 1, true); sstem(234, 0, K.H - 20, 212, [1, 1], null); } };
  G.U = { w: 740, d() { const pts = F.join([[146, K.H - 10], [146, 270]], F.arc(380, 270, 234, 210, 180, 360, 140), [[614, 270], [614, K.H - 10]]);
    F.draw(F.pen(pts, 212, 70).map((q) => ({ x: q.x, y: q.y, w: q.x > 520 ? Math.min(q.w, 104) : q.w }))); serif(40, K.H, 212, 1, 1, true); serif(562, K.H, 104, 1, 1, true); } };
  G.V = { w: 720, d() { diag(255, 30, 210, 0, K.H, 210); diag(330, 590, 96, 0, K.H, 96); F.rr(0, K.H - K.ST, 280, K.ST, 16); F.rr(540, K.H - K.ST, 180, K.ST, 16); } };
  G.W = { w: 1010, d() { diag(195, 20, 200, 0, K.H, 200); diag(260, 450, 86, 0, K.H, 86); diag(580, 400, 200, 0, K.H, 200); diag(640, 860, 86, 0, K.H, 86);
    F.rr(-10, K.H - K.ST, 260, K.ST, 16); F.rr(380, K.H - K.ST, 240, K.ST, 16); F.rr(810, K.H - K.ST, 190, K.ST, 16); } };
  G.X = { w: 740, d() { diag(470, 40, 214, 0, K.H, 214); diag(60, 540, 96, 0, K.H, 96); F.rr(0, K.H - K.ST, 280, K.ST, 16); F.rr(490, K.H - K.ST, 200, K.ST, 16); F.rr(10, 0, 210, K.ST, 16); F.rr(430, 0, 300, K.ST, 16); } };
  G.Y = { w: 720, d() { diag(240, 30, 212, 320, K.H, 212); diag(350, 570, 92, 320, K.H, 92); sstem(244, 0, 340, 212, [1, 1], null); F.rr(0, K.H - K.ST, 280, K.ST, 16); F.rr(520, K.H - K.ST, 190, K.ST, 16); } };
  G.Z = { w: 660, d() { bar(110, 600, K.H - K.HB, K.HB); armSpiral(110, K.H - K.HB, K.HB, -1, true); diag(40, 400, 214, 0, K.H, 200); bar(40, 570, 0, K.HBB); armSpiral(570, 0, K.HBB, 1, false, { r0: 66 }); } };
  // ---------- minúsculas (altura x 510) ----------
  const X = K.X;
  G.a = { w: 600, d() { ring(255, 165, 222, 170, 98, 82, -10, 0); stem(355, 0, 330, 196); serif(355, 0, 200, 0, 1);
    const P = F.pen(F.arc(345, 330, 200, 180, 0, 160, 120), 200, 70); F.draw(P); ball(P.slice(-10), 74); } };
  G.b = { w: 600, d() { sstem(40, 0, K.H, 165, [1, 0], [1, 0]); ring(345, 255, 225, 262, 92, 180, -12, 0); } };
  G.c = { w: 540, d() { const P = oval(285, 255, 225, 236, 214, 68, 48, 318); F.draw(P); sp(F.rev(P.slice(0, 22)), -1, { ext: 6, r0: 46, turns: 1.0, w1: 15 }); ball(P.slice(-22), 44); } };
  G.d = { w: 610, d() { ring(250, 255, 225, 262, 92, 180, -12, 0); sstem(380, 0, K.H, 200, [0, 1], [1, 0]); } };
  G.e = { w: 560, d() { const P = F.pen(F.join([[78, 268], [478, 268]], F.arc(280, 255, 212, 230, 6, 330, 180)), 188, 60, 1.5); F.draw(P); ball(P.slice(-18), 42); } };
  G.f = { w: 420, d() { stem(70, 0, 520, 190); serif(70, 0, 190); const P = F.pen(F.join([[165, 520]], F.arc(270, 520, 105, 140, 180, 30, 80)), 190, 64); F.draw(P); sp(P.slice(-12), -1, { ext: 2, r0: 42, turns: 1.0, w1: 15 }); bar(0, 380, X - 66, 66); } };
  G.g = { w: 590, d() { ring(250, 270, 215, 245, 88, 165, -12, 0); const P = F.pen(F.join([[455, X], [455, -20]], F.arc(270, -20, 185, 170, 0, -160, 100)), 190, 64); F.draw(P); sp(P.slice(-14), -1, { ext: 2, r0: 40, turns: 1.0, w1: 15 });
    sp(F.mono([[470, X - 30], [520, X - 30]], 56), 1, { ext: 10, r0: 36, turns: 1.0, w1: 14 }); } };
  G.h = { w: 610, d() { sstem(40, 0, K.H, 160, [1, 1], null); entry(40, K.H); F.draw(F.pen(F.arc(370, 290, 180, 220, 168, 0, 100), 204, 68)); sstem(448, 0, 290, 204, [1, 1], null); } };
  G.i = { w: 330, d() { sstem(60, 0, X, 195, [1, 1], null); entry(60, X); F.disc(158, 650, 86); } };
  G.j = { w: 330, d() { stem(80, -40, X, 195); entry(80, X); const P = F.pen(F.join([[178, -40]], F.arc(70, -40, 108, 150, 0, -150, 80)), 195, 64); sp(P, -1, { ext: 2, r0: 38, turns: 1.0, w1: 14 }); F.disc(178, 650, 86); } };
  G.k = { w: 610, d() { sstem(40, 0, K.H, 160, [1, 1], null); entry(40, K.H); diag(190, 450, 84, 210, X, 84); F.rr(400, X - K.ST, 200, K.ST, 16); const P = F.pen(F.bez([250, 300], [380, 230], [440, 110], [500, 50]), 196, 150); sp(P, 1, { ext: 10, r0: 44, turns: 1.0, w1: 15 }); } };
  G.l = { w: 330, d() { sstem(60, 0, K.H, 200, [1, 1], null); entry(60, K.H); } };
  G.m = { w: 880, d() { sstem(40, 0, X, 160, [1, 1], null); entry(40, X); F.draw(F.pen(F.arc(310, 290, 140, 220, 168, 0, 90), 190, 66)); sstem(355, 0, 290, 190, [1, 1], null);
    F.draw(F.pen(F.arc(640, 290, 140, 220, 168, 0, 90), 196, 66)); sstem(682, 0, 290, 196, [1, 1], null); } };
  G.n = { w: 610, d() { sstem(40, 0, X, 160, [1, 1], null); entry(40, X); F.draw(F.pen(F.arc(370, 290, 180, 220, 168, 0, 100), 204, 68)); sstem(448, 0, 290, 204, [1, 1], null); } };
  G.o = { w: 580, d() { ring(290, 255, 262, 268, 104, 186, -18, 0); } };
  G.p = { w: 610, d() { sstem(40, -230, X, 165, [1, 1], null); entry(40, X); ring(355, 255, 225, 262, 92, 180, -12, 0); } };
  G.q = { w: 610, d() { ring(250, 255, 225, 262, 92, 180, -12, 0); sstem(380, -230, X, 200, [1, 1], null); } };
  G.r = { w: 480, d() { sstem(40, 0, X, 168, [1, 1], null); entry(40, X); const P = F.pen(F.join(F.arc(320, 300, 130, 190, 170, 40, 80)), 190, 66); F.draw(P); ball(P.slice(-10), 76); } };
  G.s = { w: 500, d() { const pts = F.join(F.bez([395, 420], [350, 535], [80, 535], [80, 390]), F.bez([80, 390], [80, 270], [420, 290], [420, 140]).slice(1), F.bez([420, 140], [420, -30], [130, -30], [80, 90]).slice(1));
    const P = F.pen(pts, 200, 66, 1.25); F.draw(P); sp(F.rev(P.slice(0, 14)), -1, { ext: 4, r0: 40, turns: 1.0, w1: 14 }); sp(P.slice(-14), 1, { ext: 4, r0: 40, turns: 1.0, w1: 14 }); } };
  G.t = { w: 440, d() { const P = F.pen(F.join([[150, 640], [150, 170]], F.arc(270, 170, 120, 130, 180, 300, 80)), 190, 66); F.draw(P); sp(P.slice(-12), 1, { ext: 4, r0: 40, turns: 1.0, w1: 14 }); bar(20, 370, X - 66, 66); } };
  G.u = { w: 610, d() { sstem(42, 220, X, 196, null, [1, 1]); F.draw(F.pen(F.arc(330, 230, 190, 200, 180, 360, 120), 196, 66)); sstem(470, 0, X, 110, [0, 1], [1, 0]); } };
  G.v = { w: 580, d() { diag(200, 20, 196, 0, X, 196); diag(270, 470, 88, 0, X, 88); F.rr(-10, X - K.ST, 250, K.ST, 16); F.rr(420, X - K.ST, 170, K.ST, 16); } };
  G.w = { w: 850, d() { diag(160, 10, 186, 0, X, 186); diag(220, 380, 80, 0, X, 80); diag(480, 330, 186, 0, X, 186); diag(540, 720, 80, 0, X, 80);
    F.rr(-10, X - K.ST, 230, K.ST, 16); F.rr(300, X - K.ST, 220, K.ST, 16); F.rr(670, X - K.ST, 170, K.ST, 16); } };
  G.x = { w: 600, d() { diag(380, 30, 200, 0, X, 200); diag(50, 440, 88, 0, X, 88); F.rr(-10, X - K.ST, 250, K.ST, 16); F.rr(400, X - K.ST, 180, K.ST, 16); F.rr(10, 0, 190, K.ST, 16); F.rr(350, 0, 260, K.ST, 16); } };
  G.y = { w: 590, d() { diag(200, 20, 196, 0, X, 196); diag(270, 470, 88, 0, X, 88); F.rr(-10, X - K.ST, 250, K.ST, 16); F.rr(420, X - K.ST, 170, K.ST, 16);
    const P = F.pen(F.join([[300, 30], [250, -100]], F.bez([250, -100], [220, -180], [160, -200], [110, -170]).slice(1)), 150, 70); sp(P, 1, { ext: 2, r0: 38, turns: 1.0, w1: 14 }); } };
  G.z = { w: 520, d() { bar(90, 470, X - 66, 66); armSpiral(90, X - 66, 66, -1, true, { r0: 48, w1: 15 }); diag(30, 300, 196, 0, X, 180); bar(30, 450, 0, 84); armSpiral(450, 0, 84, 1, false, { r0: 52, w1: 15 }); } };
  // ---------- números ----------
  G['0'] = { w: 660, d() { ring(330, 350, 285, 352, 118, 262, -22, 0); } };
  G['1'] = { w: 460, d() { sstem(170, 0, K.H, 212, [1, 1], null); const P = F.pen(F.bez([220, K.H - 30], [170, K.H - 70], [110, K.H - 140], [40, K.H - 150]), 110, 72); sp(P, 1, { ext: 2, r0: 34, turns: 0.9, w1: 16 }); } };
  G['2'] = { w: 620, d() { const pts = F.join(F.arc(305, 495, 215, 180, 165, -20, 120), F.bez([507, 433], [470, 270], [200, 190], [80, 50]).slice(1)); const P = F.pen(pts, 216, 72); F.draw(P); sp(F.rev(P.slice(0, 16)), 1, { ext: 6, r0: 50, turns: 1.0, w1: 17 }); bar(50, 540, 0, K.HBB); armSpiral(540, 0, K.HBB, 1, false, { r0: 60 }); } };
  G['3'] = { w: 610, d() { const a = F.pen(F.arc(290, 530, 205, 165, 160, -90, 140), 204, 70); F.draw(a); sp(F.rev(a.slice(0, 14)), 1, { ext: 6, r0: 48, turns: 1.0, w1: 17 }); const b = F.pen(F.arc(290, 200, 240, 200, 90, -168, 160), 220, 72); F.draw(b); sp(b.slice(-14), -1, { ext: 6, r0: 48, turns: 1.0, w1: 17 }); } };
  G['4'] = { w: 660, d() { diag(40, 330, 120, 210, K.H, 120); bar(40, 640, 170, 80); sstem(390, 0, K.H, 212, [1, 1], null); } };
  G['5'] = { w: 610, d() { bar(150, 510, K.H - K.HB); armSpiral(510, K.H - K.HB, K.HB, 1, true); diag(96, 116, 130, 340, K.H - 10, 120); const b = F.pen(F.join([[150, 420]], F.arc(300, 225, 240, 215, 125, -168, 160)), 222, 70); F.draw(b); sp(b.slice(-14), -1, { ext: 6, r0: 48, turns: 1.0, w1: 17 }); } };
  G['6'] = { w: 640, d() { ring(325, 230, 270, 238, 100, 130, -14, 6); const P = F.pen(F.arc(590, 230, 535, 455, 180, 116, 90), 214, 70); sp(P, -1, { ext: 4, r0: 46, turns: 1.0, w1: 17 }); } };
  G['7'] = { w: 600, d() { bar(50, 570, K.H - K.HB); armSpiral(50, K.H - K.HB, K.HB, -1, true); diag(150, 400, 212, 0, K.H - K.HB, 190); F.rr(110, 0, 290, K.ST, 16); } };
  G['8'] = { w: 640, d() { ring(320, 525, 210, 175, 80, 90, -10, 0); ring(320, 200, 255, 205, 100, 115, -14, 0); } };
  G['9'] = { w: 640, d() { ring(315, 470, 270, 238, 100, 130, -14, -6); const P = F.pen(F.arc(50, 470, 535, 455, 0, -64, 90), 214, 70); sp(P, -1, { ext: 4, r0: 46, turns: 1.0, w1: 17 }); } };
  // ---------- pontuação ----------
  const dot = (x, y, r = 76) => F.disc(x, y, r);
  G['.'] = { w: 280, d() { dot(140, 76); } };
  G[','] = { w: 280, d() { dot(140, 76); F.draw(F.taper(F.pen(F.bez([196, 80], [206, -10], [160, -90], [90, -130]), 90, 70), 0.3, 1, 24)); } };
  G[':'] = { w: 280, d() { dot(140, 76); dot(140, 440); } };
  G[';'] = { w: 280, d() { G[','].d(); dot(140, 440); } };
  G['!'] = { w: 320, d() { F.poly([[80, K.H], [240, K.H], [195, 210], [125, 210]]); F.disc(160, K.H - 6, 80); dot(160, 76); } };
  G['?'] = { w: 580, d() { const P = F.pen(F.join(F.arc(290, 510, 210, 185, 170, -40, 120), F.bez([451, 391], [340, 330], [300, 300], [300, 220]).slice(1)), 206, 78); F.draw(P); sp(F.rev(P.slice(0, 14)), 1, { ext: 6, r0: 46, turns: 1.0, w1: 17 }); dot(300, 76); } };
  G['-'] = { w: 420, d() { F.rr(60, 245, 300, 104, 34); } };
  G['–'] = { w: 580, d() { F.rr(40, 248, 500, 96, 34); } };
  G['—'] = { w: 920, d() { F.rr(40, 248, 840, 96, 34); } };
  G["'"] = { w: 240, d() { F.poly([[60, K.H + 40], [180, K.H + 40], [145, 460], [95, 460]]); F.disc(120, K.H + 32, 60); } };
  G['"'] = { w: 420, d() { G["'"].d(); F.poly([[240, K.H + 40], [360, K.H + 40], [325, 460], [275, 460]]); F.disc(300, K.H + 32, 60); } };
  G['('] = { w: 360, d() { F.draw(F.pen(F.arc(350, 330, 240, 480, 120, 240, 120), 140, 70)); } };
  G[')'] = { w: 360, d() { F.draw(F.pen(F.arc(10, 330, 240, 480, 60, -60, 120), 140, 70)); } };
  G['/'] = { w: 440, d() { diag(30, 290, 120, -60, K.H + 40, 120); } };
  G['+'] = { w: 580, d() { F.rr(60, 255, 460, 100, 24); F.rr(240, 75, 100, 460, 24); } };
  G['='] = { w: 580, d() { F.rr(60, 365, 460, 94, 24); F.rr(60, 160, 460, 94, 24); } };
  G['*'] = { w: 480, d() { for (let k = 0; k < 5; k++) { const a = (90 + k * 72) * Math.PI / 180; F.draw(F.mono([[240, 520], [240 + 150 * Math.cos(a), 520 + 150 * Math.sin(a)]], 80)); } } };
  G['&'] = { w: 760, d() { const pts = F.join(F.bez([680, 0], [420, 230], [160, 400], [190, 565]), F.bez([190, 565], [210, 730], [460, 730], [455, 570]).slice(1), F.bez([455, 570], [450, 440], [85, 400], [85, 200]).slice(1), F.bez([85, 200], [85, -30], [480, -40], [610, 260]).slice(1)); const P = F.pen(pts, 200, 74); F.draw(P); sp(P.slice(-12), 1, { ext: 4, r0: 40, turns: 0.95, w1: 16 }); } };
  G['@'] = { w: 880, d() { F.draw(F.pen(F.arc(440, 300, 370, 370, -20, 300, 240), 130, 64)); ring(420, 300, 170, 190, 64, 110, -8, 0); F.rr(540, 110, 110, 350, 36); } };
  G['#'] = { w: 660, d() { diag(140, 250, 100, 0, K.H, 100); diag(350, 460, 100, 0, K.H, 100); F.rr(60, 425, 540, 90, 20); F.rr(40, 190, 540, 90, 20); } };
  G['%'] = { w: 800, d() { ring(200, 530, 160, 180, 55, 95); ring(600, 170, 160, 180, 55, 95); diag(150, 530, 110, 0, K.H, 110); } };
  G['$'] = { w: 630, d() { G.S.d(); F.rr(270, -100, 96, 900, 30); } };
  G['['] = { w: 360, d() { F.rr(90, -110, 140, 920, 10); F.rr(90, 700, 230, 110, 10); F.rr(90, -110, 230, 110, 10); } };
  G[']'] = { w: 360, d() { F.rr(130, -110, 140, 920, 10); F.rr(40, 700, 230, 110, 10); F.rr(40, -110, 230, 110, 10); } };
  G['_'] = { w: 580, d() { F.rr(20, -120, 540, 80, 10); } };
  G['«'] = { w: 600, d() { [60, 280].forEach((x) => F.draw(F.mono([[x + 210, 530], [x + 40, 350], [x + 210, 170]], 100))); } };
  G['»'] = { w: 600, d() { [40, 260].forEach((x) => F.draw(F.mono([[x + 60, 530], [x + 230, 350], [x + 60, 170]], 100))); } };
  G['✦'] = { w: 740, d() { const c = F.c, cx = 370, cy = 350, R = 350, r = 80; c.beginPath(); c.moveTo(cx, cy + R); for (let k = 1; k <= 8; k++) { const a = k * Math.PI / 4 + Math.PI / 2, rad = k % 2 ? r : R, am = a - Math.PI / 8; c.quadraticCurveTo(cx + r * 0.6 * Math.cos(am), cy + r * 0.6 * Math.sin(am), cx + rad * Math.cos(a), cy + rad * Math.sin(a)); } c.fill(); } };
  G['°'] = { w: 380, d() { ring(190, 590, 120, 120, 55, 55); } };
  G[' '] = { w: 260, d() {} };
  G.ı = { w: 330, d() { sstem(60, 0, X, 195, [1, 1], null); entry(60, X); } };
  // ---------- acentos ----------
  const ACC = {
    acute(x, y) { F.draw(F.taper(F.mono([[x - 60, y], [x + 70, y + 130]], 92), 0.6, 1, 64)); },
    grave(x, y) { F.draw(F.taper(F.mono([[x + 60, y], [x - 70, y + 130]], 92), 0.6, 1, 64)); },
    circ(x, y) { F.draw(F.mono([[x - 120, y], [x, y + 120], [x + 120, y]], 82)); },
    tilde(x, y) { F.draw(F.mono(F.bez([x - 140, y + 20], [x - 60, y + 150], [x + 60, y - 40], [x + 140, y + 100]), 80)); },
    diaer(x, y) { F.disc(x - 95, y + 55, 62); F.disc(x + 95, y + 55, 62); },
    ring(x, y) { F.ring(x, y + 70, 80, 80, 36, 36); },
    ced(x) { F.draw(F.taper(F.pen(F.join([[x, 30], [x, -40]], F.arc(x - 10, -95, 85, 60, 80, -200, 80)), 76, 52), 0.6, 1, 26)); }
  };
  const COMP = {};
  const XCU = { A: 370, E: 360, I: 195, O: 345, U: 380, C: 345, N: 370 }, XCL = { a: 300, e: 275, 'ı': 158, o: 290, u: 320, c: 290, n: 340 };
  [['A', 'Á', 'acute'], ['A', 'À', 'grave'], ['A', 'Â', 'circ'], ['A', 'Ã', 'tilde'], ['A', 'Ä', 'diaer'], ['A', 'Å', 'ring'], ['E', 'É', 'acute'], ['E', 'È', 'grave'], ['E', 'Ê', 'circ'], ['E', 'Ë', 'diaer'], ['I', 'Í', 'acute'], ['I', 'Ì', 'grave'], ['I', 'Î', 'circ'], ['I', 'Ï', 'diaer'], ['O', 'Ó', 'acute'], ['O', 'Ò', 'grave'], ['O', 'Ô', 'circ'], ['O', 'Õ', 'tilde'], ['O', 'Ö', 'diaer'], ['U', 'Ú', 'acute'], ['U', 'Ù', 'grave'], ['U', 'Û', 'circ'], ['U', 'Ü', 'diaer'], ['C', 'Ç', 'ced'], ['N', 'Ñ', 'tilde']].forEach(([b, ch, a]) => {
    COMP[ch] = [b, a, K.H + 70, XCU[b]];
    const lb = b === 'I' ? 'ı' : b.toLowerCase();
    COMP[ch.toLowerCase()] = [lb, a, X + 120, XCL[lb]];
  });
  // ---------- montagem: desalinhamento leve (giro e altura), sempre o mesmo para cada letra ----------
  const list = [];
  Object.keys(G).filter((k) => k !== 'ı').forEach((ch, i) => list.push({ ch, base: ch, seed: i * 7 + 11 }));
  Object.keys(COMP).forEach((ch, i) => list.push({ ch, base: COMP[ch][0], accent: COMP[ch][1], ay: COMP[ch][2], ax: COMP[ch][3], seed: COMP[ch][0].charCodeAt(0) * 7 + 11 }));
  const PAD = 12;
  const glyphs = list.map((it) => {
    const g = G[it.base];
    return {
      ch: it.ch, adv: g.w + (it.base === ' ' ? 0 : 2 * PAD),
      draw(ctx) {
        const r = F.rnd(it.seed * 2654435761); r(); r();
        const isLetter = /[A-Za-zı]/.test(it.base);
        const rot = isLetter ? (r() - 0.5) * 2 * 2.2 : 0, dy = isLetter ? (r() - 0.5) * 2 * 14 : 0;
        ctx.save(); ctx.translate(PAD, 0);
        ctx.translate(g.w / 2, 300 + dy); ctx.rotate(rot * Math.PI / 180); ctx.translate(-g.w / 2, -300);
        g.d();
        if (it.accent) { if (it.accent === 'ced') ACC.ced(it.ax); else ACC[it.accent](it.ax, it.ay); }
        ctx.restore();
      }
    };
  });
  return { name: 'SURREALES', glyphs, metrics: { asc: 930, desc: -280, cap: 700, x: X }, opts: { soft: 5 } };
})();
