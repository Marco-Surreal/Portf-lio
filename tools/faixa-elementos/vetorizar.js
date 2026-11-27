/*
 * Vetoriza os elementos (água, vento, pedra) das imagens de referência em
 * "MARCO SURREAL AESTHETICS/elementos oriental/IMAGENS CHAT" e grava tools/faixa-elementos/elementos.json.
 * Trecho para o browser_run_code_unsafe do Playwright (usa o potrace.js no navegador).
 * Cada recorte = [arquivo, x, y, largura, altura] na imagem original (1536x1024).
 */
async (page) => {
  const DIR = '/projects/sandbox/Portf-lio/MARCO SURREAL AESTHETICS/elementos oriental/IMAGENS CHAT/';
  const A = 'Imagem do ChatGPT 27 de nov. de 2026, 17_01_02.png', B = 'Imagem do ChatGPT 27 de nov. de 2026, 17_00_57.png';
  const RECORTES = {
    agua1: [A, 410, 320, 290, 230], agua2: [A, 740, 330, 360, 215], agua3: [A, 1120, 360, 340, 160],
    vento1: [A, 400, 580, 330, 180], vento2: [A, 740, 590, 360, 150], vento3: [A, 1120, 590, 350, 160],
    pedra1: [A, 410, 790, 290, 200], pedra2: [A, 760, 790, 300, 200], pedra3: [A, 1120, 790, 340, 200],
    aguaG: [B, 880, 60, 400, 380], ventoG: [B, 220, 540, 470, 390], pedraG: [B, 830, 530, 480, 400]
  };
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('https://trace.test/**', (route) => {
    const u = decodeURIComponent(route.request().url());
    if (u.includes('/img/')) return route.fulfill({ path: DIR + u.split('/img/')[1], contentType: 'image/png' });
    if (u.endsWith('/potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script src="/potrace.js"></script></body></html>' });
  });
  await page.goto('https://trace.test/');
  const dlP = page.waitForEvent('download', { timeout: 300000 });
  const info = await page.evaluate(async (RECORTES) => {
    const cache = {}, out = {}, log = [];
    for (const [nome, [arq, rx, ry, rw, rh]] of Object.entries(RECORTES)) {
      if (!cache[arq]) { const im = new Image(); im.src = '/img/' + encodeURIComponent(arq); await im.decode(); cache[arq] = im; }
      const S = 2, W = rw * S, H = rh * S;                     // traça em 2x para a borda sair mais lisa
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.imageSmoothingQuality = 'high';
      x.filter = 'blur(1.2px)'; x.drawImage(cache[arq], rx, ry, rw, rh, 0, 0, W, H); x.filter = 'none';
      const d = x.getImageData(0, 0, W, H); let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let i = 0; i < W * H; i++) {
        const v = (d.data[i * 4] + d.data[i * 4 + 1] + d.data[i * 4 + 2]) / 3 < 150 ? 0 : 255;  // o cinza das imagens conta como tinta
        d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255;
        if (!v) { const px = i % W, py = (i / W) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      }
      const Q = 4; x0 = Math.max(0, x0 - Q); y0 = Math.max(0, y0 - Q); x1 = Math.min(W - 1, x1 + Q); y1 = Math.min(H - 1, y1 + Q);
      const CW = x1 - x0 + 1, CH = y1 - y0 + 1;
      x.putImageData(d, 0, 0);
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; cv.getContext('2d').drawImage(c, x0, y0, CW, CH, 0, 0, CW, CH);
      Potrace.setParameter({ turdsize: 60, alphamax: 1.0, opttolerance: 0.4, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(cv.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r));
      const dd = (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
      out[nome] = { w: CW, h: CH, d: dd }; log.push(`${nome} ${CW}x${CH}`);
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })); a.download = 'e.json'; document.body.appendChild(a); a.click();
    return log.join(', ');
  }, RECORTES);
  const dl = await dlP;
  await dl.saveAs('/projects/sandbox/Portf-lio/tools/faixa-elementos/elementos.json');
  return info;
}
