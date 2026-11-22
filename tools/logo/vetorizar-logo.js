  const r = await page.evaluate(async () => {
    const img = new Image(); img.src = '/a.png'; await img.decode();
    const N = 3000, c = document.createElement('canvas'); c.width = N; c.height = N; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, N, N).data;
    const yel = new Uint8Array(N * N), sil = new Uint8Array(N * N), oli = new Uint8Array(N * N);
    let x0 = N, y0 = N, x1 = 0, y1 = 0;
    for (let i = 0; i < N * N; i++) { const R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2], L = 0.2126 * R + 0.7152 * G + 0.0722 * B;
      yel[i] = R > 165 && G > 125 && B < 130 && R - B > 95 ? 1 : 0;
      sil[i] = yel[i] || L < 150 ? 1 : 0;
      oli[i] = L >= 78 && L < 150 && G > B + 30 && G >= R ? 1 : 0;
      if (sil[i]) { const px = i % N, py = (i / N) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
    const P = 24; x0 = Math.max(0, x0 - P); y0 = Math.max(0, y0 - P); x1 = Math.min(N - 1, x1 + P); y1 = Math.min(N - 1, y1 + P);
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    const mk = (m, blur, keepNearYellow) => { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const i = (y + y0) * N + xx + x0, o = (y * W + xx) * 4; im.data[o + 3] = m[i] ? 255 : 0; }
      cx.putImageData(im, 0, 0);
      const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; const x2 = c2.getContext('2d'); x2.fillStyle = '#fff'; x2.fillRect(0, 0, W, H); x2.filter = 'blur(' + blur + 'px)'; x2.drawImage(cv, 0, 0);
      const q = x2.getImageData(0, 0, W, H); for (let k = 0; k < q.data.length; k += 4) { const v = q.data[k] < 128 ? 0 : 255; q.data[k] = q.data[k + 1] = q.data[k + 2] = v; q.data[k + 3] = 255; } x2.filter = 'none'; x2.putImageData(q, 0, 0); return c2; };
    // olive longe da borda do amarelo (a mistura amarelo+escuro da borda também parece oliva)
    const yb = document.createElement('canvas'); yb.width = N; yb.height = N; { const yx = yb.getContext('2d'), im = yx.createImageData(N, N); for (let i = 0; i < N * N; i++) im.data[i * 4 + 3] = yel[i] ? 255 : 0; yx.putImageData(im, 0, 0); const t = document.createElement('canvas'); t.width = N; t.height = N; const tx = t.getContext('2d'); tx.filter = 'blur(6px)'; tx.drawImage(yb, 0, 0); const nd = tx.getImageData(0, 0, N, N).data; for (let i = 0; i < N * N; i++) if (nd[i * 4 + 3] > 6) oli[i] = 0; }
    const trace = async (cv, turd, am) => { Potrace.setParameter({ turdsize: turd, alphamax: am, opttolerance: 0.4, optcurve: true, turnpolicy: 'minority' }); Potrace.loadImageFromUrl(cv.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r)); return (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1]; };
    const out = { size: [W, H], off: [x0, y0] };
    out.sil = await trace(mk(sil, 4), 40, 1.1);
    out.face = await trace(mk(yel, 1.2), 12, 1.0);
    out.fins = await trace(mk(oli, 2), 300, 1.2);
    return out; });
  return JSON.stringify(r);
