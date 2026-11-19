// Ferramentas de desenho das fontes (coordenadas em unidades da fonte, y para cima, linha de base em y=0)
window.FL = (function () {
  let c = null;
  const TAU = Math.PI * 2;
  const set = (ctx) => { c = ctx; };
  function disc(x, y, r) { c.beginPath(); c.arc(x, y, Math.max(r, 0.4), 0, TAU); c.fill(); }
  function poly(pts) { c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath(); c.fill(); }
  function rr(x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2)); c.fill(); }
  // pontos de curvas (arrays [x,y])
  function bez(p0, p1, p2, p3, n = 60) {
    const o = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, u = 1 - t;
      o.push([u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]);
    }
    return o;
  }
  function arc(cx, cy, rx, ry, a0, a1, n = 120) { // graus, 90 = topo
    const o = [];
    for (let i = 0; i <= n; i++) { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
    return o;
  }
  function line(a, b) { return [a, b]; }
  function join(...parts) { const o = []; parts.forEach((p) => p.forEach((q, i) => { if (!(o.length && i === 0 && Math.hypot(o[o.length - 1][0] - q[0], o[o.length - 1][1] - q[1]) < 0.01)) o.push(q); })); return o; }
  // reamostra para ~1 unidade entre pontos (largura interpolada)
  function resample(P, step = 1) {
    const o = [];
    for (let i = 0; i < P.length - 1; i++) {
      const a = P[i], b = P[i + 1], d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.ceil(d / step));
      for (let k = 0; k < n; k++) { const t = k / n; o.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, w: a.w + (b.w - a.w) * t }); }
    }
    o.push(P[P.length - 1]);
    return o;
  }
  // traço de pena: largura depende da direção (vertical = grosso, horizontal = fino)
  function pen(pts, thick, thin, pow = 1.4) {
    const P = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
      const ty = Math.abs(dy) / L;
      P.push({ x: pts[i][0], y: pts[i][1], w: thin + (thick - thin) * Math.pow(ty, pow) });
    }
    return P;
  }
  function mono(pts, w) { return pts.map((p) => ({ x: p[0], y: p[1], w })); }
  // espiral que continua o traço a partir do último ponto. side: +1 enrola para a esquerda, -1 para a direita
  let CURL = 1;
  function setCurl(k) { CURL = k; }
  function curl(P, side, r0, turns, w1, shrink = 0.62) {
    r0 *= CURL;
    const L = P[P.length - 1], Q = P[Math.max(0, P.length - 4)];
    let tx = L.x - Q.x, ty = L.y - Q.y; const n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
    const nx = side > 0 ? -ty : ty, ny = side > 0 ? tx : -tx;
    const cx = L.x + nx * r0, cy = L.y + ny * r0;
    const th0 = Math.atan2(L.y - cy, L.x - cx), N = Math.ceil(turns * 160), w0 = L.w;
    const o = P.slice();
    for (let k = 1; k <= N; k++) {
      const f = k / N, th = th0 + side * f * turns * TAU, r = r0 * (1 - shrink * f);
      o.push({ x: cx + r * Math.cos(th), y: cy + r * Math.sin(th), w: w0 + (w1 - w0) * Math.pow(f, 0.32), k: f });
    }
    o.ball = true;
    return o;
  }
  function taper(P, from, to, w1) { // afina o traço no fim (0..1 do comprimento)
    const n = P.length;
    return P.map((p, i) => { const f = i / (n - 1); if (f < from) return p; const k = Math.min(1, (f - from) / (to - from)); return { x: p.x, y: p.y, w: p.w + (w1 - p.w) * k }; });
  }
  let late = null, boldNow = 0;
  function draw(P, ballK = 0.62) {
    if (P.ball && late) { const Q = P.map((p) => ({ x: p.x, y: p.y, w: p.w + 2 * boldNow * (1 - Math.min(1, (p.k || 0) * 3.5)) })); Q.ball = true; const t = c.getTransform(); late.push(() => { c.setTransform(t); drawNow(Q, ballK); }); return; }
    drawNow(P, ballK);
  }
  function drawNow(P, ballK) {
    const R = resample(P, 0.9);
    for (const p of R) disc(p.x, p.y, p.w / 2);
    if (P.ball) { const e = P[P.length - 1]; disc(e.x, e.y, Math.max(e.w * ballK, e.w / 2)); }
  }
  function rev(P) { const o = P.slice().reverse(); return o; }
  // anel (elipse com furo) — furo pode ser deslocado
  function ring(cx, cy, rx, ry, irx, iry, icx = cx, icy = cy) {
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); c.moveTo(icx + irx, icy); c.ellipse(icx, icy, irx, iry, 0, 0, TAU, true); c.fill('evenodd');
  }
  function cut(fn) { const g = c.globalCompositeOperation; c.globalCompositeOperation = 'destination-out'; fn(); c.globalCompositeOperation = g; }
  function clip(x, y, w, h, fn) { c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); fn(); c.restore(); }
  function rnd(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  // Desenha um glifo num bitmap preto-e-branco. bold: engorda (unidades). post(ctx,img,info): efeitos extras no bitmap.
  function render(g, m, sc, pad, opt = {}) {
    const W = Math.ceil((g.adv + 2 * pad) * sc), H = Math.ceil((m.asc - m.desc + 2 * pad) * sc);
    const a = document.createElement('canvas'); a.width = W; a.height = H;
    const x = a.getContext('2d'); set(x);
    x.setTransform(sc, 0, 0, -sc, pad * sc, (m.asc + pad) * sc);
    x.fillStyle = '#000'; late = []; boldNow = opt.bold || 0; g.draw(x);
    const L = late; late = null;
    const lc = document.createElement('canvas'); lc.width = W; lc.height = H; const lx = lc.getContext('2d'); set(lx); lx.fillStyle = '#000'; L.forEach((f) => f()); set(x);
    const b = document.createElement('canvas'); b.width = W; b.height = H;
    const y = b.getContext('2d');
    if (opt.bold) y.filter = 'blur(' + (opt.bold * sc / 1.28) + 'px)';
    y.drawImage(a, 0, 0); y.filter = 'none';
    y.drawImage(lc, 0, 0);
    const img = y.getImageData(0, 0, W, H), d = img.data;
    const th = opt.bold ? 26 : 128;
    const info = { W, H, sc, pad, m };
    const mask = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) mask[i] = d[i * 4 + 3] > th ? 1 : 0;
    const out = opt.post ? opt.post(mask, info, g) : mask;
    for (let i = 0; i < W * H; i++) { const v = out[i] ? 0 : 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
    y.putImageData(img, 0, 0);
    return b;
  }
  return { setCurl, render, set, disc, poly, rr, bez, arc, line, join, pen, mono, curl, taper, draw, rev, ring, cut, clip, rnd, get c() { return c; } };
})();
