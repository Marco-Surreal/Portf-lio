/*
 * Vetoriza as 2 pedras e os 2 fogos que o Marco desenhou em
 * "MARCO SURREAL AESTHETICS/elementos oriental/PEDRA E FOGO.png" (3000x3000)
 * e grava tools/faixa-pedra-fogo/pedra-fogo.json.
 * Trecho para o browser_run_code_unsafe do Playwright (usa o potrace.js no navegador).
 * Cada recorte = [x, y, largura, altura] na imagem original; o desenho é recortado justo depois.
 */
async (page) => {
  const ARQ = '/projects/sandbox/Portf-lio/MARCO SURREAL AESTHETICS/elementos oriental/PEDRA E FOGO.png';
  const RECORTES = {
    pedraM1: [150, 380, 1300, 850], pedraM2: [1450, 380, 1300, 850],
    fogoM1: [100, 1400, 1320, 900], fogoM2: [1420, 1400, 1250, 800]
  };
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('https://trace.test/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('/a.png')) return route.fulfill({ path: ARQ, contentType: 'image/png' });
    if (u.endsWith('/potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script src="/potrace.js"></script></body></html>' });
  });
  await page.goto('https://trace.test/');
  const dlP = page.waitForEvent('download', { timeout: 300000 });
  const info = await page.evaluate(async (RECORTES) => {
    const im = new Image(); im.src = '/a.png'; await im.decode();
    const out = {}, log = [];
    for (const [nome, [rx, ry, rw, rh]] of Object.entries(RECORTES)) {
      const W = rw, H = rh;
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(im, rx, ry, rw, rh, 0, 0, W, H);
      const d = x.getImageData(0, 0, W, H); const ink = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) {
        const v = (d.data[i * 4] + d.data[i * 4 + 1] + d.data[i * 4 + 2]) / 3 < 128 && d.data[i * 4 + 3] > 128 ? 0 : 255;
        d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; ink[i] = v ? 0 : 1;
      }
      // caixa justa ignorando sujeirinhas: só conta linha/coluna com pelo menos 6 pontos de tinta
      const col = new Int32Array(W), row = new Int32Array(H);
      for (let i = 0; i < W * H; i++) if (ink[i]) { col[i % W]++; row[(i / W) | 0]++; }
      let x0 = 0, x1 = W - 1, y0 = 0, y1 = H - 1;
      while (col[x0] < 6) x0++; while (col[x1] < 6) x1--; while (row[y0] < 6) y0++; while (row[y1] < 6) y1--;
      const Q = 4; x0 = Math.max(0, x0 - Q); y0 = Math.max(0, y0 - Q); x1 = Math.min(W - 1, x1 + Q); y1 = Math.min(H - 1, y1 + Q);
      x.putImageData(d, 0, 0);
      const CW = x1 - x0 + 1, CH = y1 - y0 + 1;
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; cv.getContext('2d').drawImage(c, x0, y0, CW, CH, 0, 0, CW, CH);
      Potrace.setParameter({ turdsize: 200, alphamax: 1.0, opttolerance: 0.6, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(cv.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r));
      const dd = (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
      out[nome] = { w: CW, h: CH, d: dd }; log.push(`${nome} ${CW}x${CH} ${dd.length}`);
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })); a.download = 'p.json'; document.body.appendChild(a); a.click();
    return log.join(', ');
  }, RECORTES);
  const dl = await dlP;
  await dl.saveAs('/projects/sandbox/Portf-lio/tools/faixa-pedra-fogo/pedra-fogo.json');
  return info;
}
