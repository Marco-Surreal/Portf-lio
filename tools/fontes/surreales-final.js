// SURREALES final: parte da SURREALES.ttf escolhida pelo Marco (FONTES SITE SURREAL/SURREALES.ttf, branch main),
// troca O U Y, 2 5 6 8 9 0 e a b d e p q n v t r y o u pelos desenhos dele (MAIUSCULAS.png e "números e minúsculas.png")
// e uniformiza a espessura do traço de todas as letras (engorda as finas e afina as grossas, no máximo 10 e 6 unidades).
// Corpo de um script do Playwright; parâmetros usados: {"mode":"final","tCap":120,"tLow":88,"corr":0.5,"max":10,"maxThin":6,"min":3}
  const P = __PARAMS__;
  const res = await page.evaluate(async (P) => {
    const base = await (await fetch('/base.json')).json();
    const R = 0.8, PADX = 100, TOP = 1035, H = Math.round((935 + 300 + 200) * R), SB = 14;
    const G = {}; for (const g of base.glyphs) G[g.ch] = g;
    // ---------- utilidades ----------
    const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    function rasterD(d, adv) { const c = cv(Math.ceil((adv + 2 * PADX + 200) * R), H), x = c.getContext('2d');
      x.setTransform(R, 0, 0, -R, PADX * R, TOP * R); x.fillStyle = '#000'; if (d) x.fill(new Path2D(d), 'evenodd'); return c; }
    function maskOf(c) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, m = new Uint8Array(c.width * c.height); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] > 127 ? 1 : 0; return m; }
    function dt(m, W, Hh, val) { const INF = 1e9, d = new Float32Array(W * Hh), S2 = Math.SQRT2;
      for (let i = 0; i < d.length; i++) d[i] = m[i] === val ? INF : 0;
      for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!d[i]) continue; let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + S2); if (x < W - 1) v = Math.min(v, d[i - W + 1] + S2); } d[i] = v; }
      for (let y = Hh - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; if (!d[i]) continue; let v = d[i];
        if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (y < Hh - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + S2); if (x > 0) v = Math.min(v, d[i + W - 1] + S2); } d[i] = v; }
      return d; }
    function bbox(m, W, Hh) { let x0 = W, x1 = -1, y0 = Hh, y1 = -1; for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) if (m[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, x1, y0, y1 }; }
    // espessura do traço: mediana de 2x a distância até a borda, medida na linha central do traço
    function weight(m, W, Hh) { const d = dt(m, W, Hh, 1), v = [];
      for (let y = 1; y < Hh - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x, a = d[i]; if (!m[i] || a < 2) continue; let ok = true;
        for (const k of [i - 1, i + 1, i - W, i + W, i - W - 1, i - W + 1, i + W - 1, i + W + 1]) if (d[k] > a) { ok = false; break; } if (ok) v.push(2 * a - 1); }
      v.sort((p, q) => p - q); return v.length ? v[Math.floor(v.length / 2)] / R : 0; }
    function offset(m, W, Hh, du) { if (!du) return m; const dp = du * R, o = new Uint8Array(m.length);
      if (dp > 0) { const d = dt(m, W, Hh, 0); for (let i = 0; i < m.length; i++) o[i] = m[i] || d[i] <= dp ? 1 : 0; }
      else { const d = dt(m, W, Hh, 1); for (let i = 0; i < m.length; i++) o[i] = m[i] && d[i] > -dp ? 1 : 0; }
      return o; }
    function maskCanvas(m, W, Hh, blur) { const c = cv(W, Hh), x = c.getContext('2d'), im = x.createImageData(W, Hh); for (let i = 0; i < m.length; i++) { im.data[i * 4 + 3] = m[i] ? 255 : 0; } x.putImageData(im, 0, 0);
      if (!blur) return c; const c2 = cv(W, Hh), y = c2.getContext('2d'); y.filter = 'blur(' + blur + 'px)'; y.drawImage(c, 0, 0); return cv2mask(c2); }
    function cv2mask(c) { return c; }
    async function trace(m, W, Hh) { const c = cv(W, Hh), x = c.getContext('2d'), im = x.createImageData(W, Hh);
      for (let i = 0; i < m.length; i++) { const v = m[i] ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0);
      Potrace.setParameter({ turdsize: 8, alphamax: 1.0, opttolerance: 0.2, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(c.toDataURL()); await new Promise((r) => setTimeout(r, 20)); await new Promise((r) => Potrace.process(r));
      const dd = (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
      return dd; }
    // suaviza a borda (desfoque leve + limiar) sem perder detalhe
    function smooth(m, W, Hh, r) { const c = maskCanvas(m, W, Hh, 0), c2 = cv(W, Hh), y = c2.getContext('2d'); y.filter = 'blur(' + r + 'px)'; y.drawImage(c, 0, 0); return maskOf(c2); }

    // ---------- letras novas dos PNGs ----------
    async function sheet(url) { const img = new Image(); img.src = url; await img.decode(); const W = img.width, Hh = img.height, c = cv(W, Hh), x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, Hh); x.drawImage(img, 0, 0); const px = x.getImageData(0, 0, W, Hh).data, ink = new Uint8Array(W * Hh);
      for (let i = 0; i < W * Hh; i++) ink[i] = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3 < 128 ? 1 : 0;
      const lab = new Int32Array(W * Hh), st = new Int32Array(W * Hh), area = [0]; let n = 0;
      for (let i = 0; i < W * Hh; i++) if (ink[i] && !lab[i]) { n++; area[n] = 0; let sp = 0; st[sp++] = i; lab[i] = n; while (sp) { const j = st[--sp]; area[n]++; for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < W * Hh && ink[k] && !lab[k]) { lab[k] = n; st[sp++] = k; } } }
      return { W, Hh, lab, area }; }
    function crop(S, b) { // componentes grandes dentro da caixa
      const [x0, y0, x1, y1] = b, w = x1 - x0 + 1, h = y1 - y0 + 1, cnt = {};
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const l = S.lab[y * S.W + x]; if (l) cnt[l] = (cnt[l] || 0) + 1; }
      const keep = new Set(Object.keys(cnt).filter((l) => S.area[l] > 200 && cnt[l] > S.area[l] * 0.9).map(Number));
      const c = cv(w, h), x = c.getContext('2d'), im = x.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (keep.has(S.lab[(y + y0) * S.W + xx + x0])) im.data[(y * w + xx) * 4 + 3] = 255;
      x.putImageData(im, 0, 0); return c; }
    const S1 = await sheet('/MAIUSCULAS.png'), S2 = await sheet('/numeros.png');
    const LK = 508 / 440; // escala única das minúsculas (altura-x 440 px no desenho = 508 na fonte)
    // [char, folha, caixa, modo]  modo: {h: altura final, yb: base} ou {row: linha de base no desenho}
    const NEW = [
      ['O', S1, [453, 750, 1024, 1432], { h: 716, yb: -8 }], ['U', S1, [1152, 763, 1751, 1457], { h: 708, yb: -8 }], ['Y', S1, [1956, 706, 2548, 1496], { h: 700, yb: 0 }],
      ['2', S2, [285, 153, 542, 544], { h: 700, yb: 0 }], ['5', S2, [694, 134, 952, 580], { h: 708, yb: -8 }], ['6', S2, [1138, 130, 1413, 558], { h: 716, yb: -8 }],
      ['8', S2, [1591, 111, 1852, 579], { h: 716, yb: -8 }], ['9', S2, [2023, 110, 2329, 555], { h: 716, yb: -8 }], ['0', S2, [2461, 102, 2795, 574], { h: 716, yb: -8 }],
      ['a', S2, [77, 814, 487, 1261], { row: 1260 }], ['b', S2, [518, 661, 962, 1258], { row: 1260 }], ['d', S2, [977, 670, 1421, 1267], { row: 1267 }],
      ['e', S2, [1453, 766, 1856, 1258], { row: 1260 }], ['p', S2, [1908, 838, 2352, 1435], { row: 1260 }], ['q', S2, [2364, 833, 2808, 1430], { row: 1260 }],
      ['n', S2, [256, 1583, 703, 2015], { row: 2005 }], ['v', S2, [738, 1592, 1212, 2000], { row: 2005 }], ['t', S2, [1242, 1432, 1597, 1981], { row: 1990 }],
      ['r', S2, [1659, 1497, 2047, 1991], { row: 1995 }], ['y', S2, [2151, 1502, 2537, 1998], { row: 2000 }],
      ['o', S2, [226, 2111, 616, 2554], { row: 2560 }], ['u', S2, [704, 2119, 1114, 2570], { row: 2560 }],
    ];
    const CUR = {}; // ch -> { m, W, adv, sbL, sbR, isNew }
    for (const [ch, S, b, md] of NEW) { const c = crop(S, b), w = c.width, h = c.height;
      const k = md.h ? md.h / h : LK, yb = md.h ? md.yb : (md.row - b[3]) * LK, Hu = h * k, Wu = w * k, adv = Wu + 2 * SB;
      const g = cv(Math.ceil((adv + 2 * PADX + 200) * R), H), x = g.getContext('2d'); x.imageSmoothingQuality = 'high';
      x.drawImage(c, (PADX + SB) * R, (TOP - (yb + Hu)) * R, Wu * R, Hu * R);
      CUR[ch] = { m: maskOf(g), W: g.width, adv, sbL: SB, sbR: SB, isNew: true }; }
    // letras que ficam como estão na fonte base
    for (const g of base.glyphs) { if (CUR[g.ch] || !g.d) continue; const c = rasterD(g.d, g.adv), m = maskOf(c), bb = bbox(m, c.width, H);
      CUR[g.ch] = { m, W: c.width, adv: g.adv, sbL: bb.x0 / R - PADX, sbR: g.adv - ((bb.x1 + 1) / R - PADX), d: g.d }; }
    // ---------- medir espessuras ----------
    const COMB = { O: 'ÓÒÔÕÖ', U: 'ÚÙÛÜ', a: 'áàâãäå', e: 'éèêë', o: 'óòôõö', u: 'úùûü', n: 'ñ' };
    const accented = new Set(Object.values(COMB).join('').split('').concat('ÁÀÂÃÄÅÉÈÊËÍÌÎÏÇçÑíìîï'.split('')));
    const W8 = {}; for (const ch in CUR) if (!accented.has(ch) && /[A-Za-z0-9]/.test(ch)) W8[ch] = Math.round(weight(CUR[ch].m, CUR[ch].W, H));
    if (P.mode === 'measure') return { W8 };
    // ---------- uniformizar ----------
    const ADJ = {};
    for (const ch in W8) { const tgt = /[A-Z0-9]/.test(ch) ? P.tCap : P.tLow; let du = (tgt - W8[ch]) / 2 * P.corr; du = Math.max(-P.maxThin, Math.min(P.max, du));
      if (CUR[ch].isNew || Math.abs(du) >= P.min) ADJ[ch] = Math.round(du * 10) / 10; }
    const out = [];
    async function finalize(ch, m, Wc, sbL, sbR) { const sm = smooth(m, Wc, H, 0.8), bb = bbox(sm, Wc, H); const dd = await trace(sm, Wc, H);
      const shift = sbL - (bb.x0 / R - PADX), adv = Math.round((bb.x1 - bb.x0 + 1) / R + sbL + sbR);
      const d = dd.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (s, a, b) => (a / R - PADX + shift).toFixed(1) + ' ' + (TOP - b / R).toFixed(1));
      return { ch, adv, d, m: sm, shift }; }
    const FIN = {};
    for (const ch in ADJ) { const u = CUR[ch]; const m = offset(u.m, u.W, H, ADJ[ch]); FIN[ch] = await finalize(ch, m, u.W, u.sbL, u.sbR); }
    // acentos: o acento da letra antiga sobre a letra nova
    for (const [b, list] of Object.entries(COMB)) { if (!FIN[b]) continue; const ob = CUR[b].isNew ? null : CUR[b];
      for (const ch of list) { const old = G[ch]; if (!old) continue; const oc = rasterD(old.d, old.adv), om = maskOf(oc), Wc = oc.width;
        const baseOld = rasterD(G[b].d, G[b].adv), bm = maskOf(baseOld), bo = bbox(bm, baseOld.width, H);
        const nb = FIN[b], Wn = Math.max(Wc, CUR[b].W), nm = new Uint8Array(Wn * H); const nbb = bbox(nb.m, CUR[b].W, H);
        for (let y = 0; y < H; y++) for (let x = 0; x < CUR[b].W; x++) if (nb.m[y * CUR[b].W + x]) nm[y * Wn + x] = 1;
        const cut = bo.y0 - Math.round(20 * R), dx = Math.round((nbb.x0 + nbb.x1) / 2 - (bo.x0 + bo.x1) / 2), dy = nbb.y0 - bo.y0;
        for (let y = 0; y < cut; y++) for (let x = 0; x < Wc; x++) if (om[y * Wc + x]) { const X = x + dx, Y = y + dy; if (X >= 0 && X < Wn && Y >= 0 && Y < H) nm[Y * Wn + X] = 1; }
        const f = await finalize(ch, nm, Wn, CUR[b].sbL, CUR[b].sbR); f.adv = nb.adv; FIN[ch] = f; } }
    for (const g of base.glyphs) { const f = FIN[g.ch]; out.push(f ? { ch: g.ch, adv: f.adv, d: f.d } : g); }
    return { name: base.name, metrics: base.metrics, glyphs: out, ADJ, W8 };
  }, P);
  return JSON.stringify(res);
