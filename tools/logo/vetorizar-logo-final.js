// Vetoriza "LOGO MARCO SURREAL/LOGO FINAL CONCERTO TUNEL.png" (desenho final do Marco).
// Roda no Playwright (browser_run_code) com /a.png servindo o PNG e /potrace.js servindo o Potrace.
// Cada pixel vai para a cor mais próxima da paleta do desenho; cada cor vira uma camada vetorial.
async (page) => {
  const r = await page.evaluate(async () => {
    const img = new Image(); img.src = '/a.png'; await img.decode();
    const N = img.width, c = document.createElement('canvas'); c.width = N; c.height = N; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, N, N).data;
    // paleta: fundo creme, amarelo das letras, verde escuro (contorno e vãos), verde do túnel, oliva das linhas do túnel
    const PAL = [[240, 240, 225], [250, 228, 10], [40, 85, 72], [78, 112, 66], [138, 166, 48]];
    const cls = new Uint8Array(N * N), sum = PAL.map(() => [0, 0, 0, 0]);
    let x0 = N, y0 = N, x1 = 0, y1 = 0;
    for (let i = 0; i < N * N; i++) {
      const R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2], A = d[i * 4 + 3];
      let best = 0, bd = 1e9;
      if (A > 128) PAL.forEach((p, k) => { const e = (R - p[0]) ** 2 + (G - p[1]) ** 2 + (B - p[2]) ** 2; if (e < bd) { bd = e; best = k; } });
      cls[i] = best; const s = sum[best]; s[0] += R; s[1] += G; s[2] += B; s[3]++;
      if (best) { const px = i % N, py = (i / N) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
    }
    const P = 24; x0 = Math.max(0, x0 - P); y0 = Math.max(0, y0 - P); x1 = Math.min(N - 1, x1 + P); y1 = Math.min(N - 1, y1 + P);
    const W = x1 - x0 + 1, H = y1 - y0 + 1;
    const hex = (s) => '#' + s.slice(0, 3).map((v) => Math.round(v / Math.max(1, s[3])).toString(16).padStart(2, '0')).join('');
    async function layer(test, blur) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const i = (y + y0) * N + xx + x0; im.data[(y * W + xx) * 4 + 3] = test(cls[i]) ? 255 : 0; }
      cx.putImageData(im, 0, 0);
      // fundo branco + camada em preto, desfoque leve e limiar no meio (borda lisa)
      const c3 = document.createElement('canvas'); c3.width = W; c3.height = H; const y3 = c3.getContext('2d');
      y3.fillStyle = '#fff'; y3.fillRect(0, 0, W, H); y3.filter = 'blur(' + blur + 'px)'; y3.drawImage(cv, 0, 0);
      const id3 = y3.getImageData(0, 0, W, H);
      for (let i = 0; i < W * H; i++) { const v = id3.data[i * 4] < 128 ? 0 : 255; id3.data[i * 4] = id3.data[i * 4 + 1] = id3.data[i * 4 + 2] = v; id3.data[i * 4 + 3] = 255; }
      y3.filter = 'none'; y3.putImageData(id3, 0, 0);
      Potrace.setParameter({ turdsize: 30, alphamax: 1.0, opttolerance: 0.4, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(c3.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r));
      return (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
    }
    const out = { size: [W, H], off: [x0, y0], colors: { yellow: hex(sum[1]), teal: hex(sum[2]), green: hex(sum[3]), olive: hex(sum[4]) } };
    out.sil = await layer((k) => k > 0, 2.5);
    out.tunnel = await layer((k) => k === 3 || k === 4, 1.5);
    out.lines = await layer((k) => k === 4, 1.2);
    out.face = await layer((k) => k === 1, 1.5);
    return out;
  });
  return JSON.stringify(r);
}
