/*
 * Vetoriza os elementos (fogo, água, vento, pedra) das imagens de referência em
 * "MARCO SURREAL AESTHETICS/elementos oriental" e grava tools/faixa-elementos/elementos.json.
 * Opções por recorte: vermelho = só a tinta vermelha conta (ignora marca d'água cinza);
 * contorno = [de, ate] abre uma linha clara por dentro da borda, nessa distância (px da imagem),
 * como as pedras das tatuagens japonesas.
 * Trecho para o browser_run_code_unsafe do Playwright (usa o potrace.js no navegador).
 * Cada recorte = [arquivo, x, y, largura, altura, opções] na imagem original.
 */
async (page) => {
  const DIR = '/projects/sandbox/Portf-lio/MARCO SURREAL AESTHETICS/elementos oriental/';
  const A = 'IMAGENS CHAT/Imagem do ChatGPT 27 de nov. de 2026, 17_01_02.png', B = 'IMAGENS CHAT/Imagem do ChatGPT 27 de nov. de 2026, 17_00_57.png';
  const C = 'IMAGENS CHAT/Imagem do ChatGPT 27 de nov. de 2026, 16_59_19-1.png';
  const FA = 'hand-drawn-japanese-traditional-flame-600w-2732272269.webp', FB = '75765296-japones-tradicional-tatuagem-chama-forma-ilustracoes-vetor.jpg';
  const RECORTES = {
    agua1: [A, 410, 320, 290, 230], agua2: [A, 740, 330, 360, 215], agua3: [A, 1120, 360, 340, 160],
    vento1: [A, 400, 580, 330, 180], vento2: [A, 740, 590, 360, 150], vento3: [A, 1120, 590, 350, 160],
    pedra1: [A, 410, 790, 290, 200], pedra2: [A, 760, 790, 300, 200], pedra3: [A, 1120, 790, 340, 200],
    aguaG: [B, 880, 60, 400, 380], ventoG: [B, 220, 540, 470, 390], pedraG: [B, 830, 530, 480, 400],
    fogoA: [FA, 50, 70, 500, 470, { vermelho: true }], fogoB: [FB, 250, 100, 480, 800, { vermelho: true }],
    fogoC: [C, 10, 130, 370, 660, { vermelho: true }], fogoD: ['IMAGENS CHAT/Imagem do ChatGPT 27 de nov. de 2026, 17_00_57.png', 290, 15, 340, 420, { vermelho: true }],
    fogoE: [A, 1090, 80, 380, 200], fogoF: [A, 790, 30, 260, 270],
    pedra1c: [A, 410, 790, 290, 200, { contorno: [9, 14] }], pedra3c: [A, 1120, 790, 340, 200, { contorno: [9, 14] }],
    pedraGc: [B, 830, 530, 480, 400, { contorno: [9, 14] }]
  };
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('https://trace.test/**', (route) => {
    const u = decodeURIComponent(route.request().url());
    if (u.includes('/img/')) { const f = u.split('/img/')[1]; return route.fulfill({ path: DIR + f, contentType: f.endsWith('.webp') ? 'image/webp' : f.endsWith('.jpg') ? 'image/jpeg' : 'image/png' }); }
    if (u.endsWith('/potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script src="/potrace.js"></script></body></html>' });
  });
  await page.goto('https://trace.test/');
  const dlP = page.waitForEvent('download', { timeout: 300000 });
  const info = await page.evaluate(async (RECORTES) => {
    const cache = {}, out = {}, log = [];
    // transformada de distância euclidiana (Felzenszwalb): distância de cada ponto de tinta até o fundo
    function edt(m, W, H) {
      const INF = 1e12, f = new Float64Array(Math.max(W, H)), o = new Float64Array(W * H);
      const dt1 = (len, get, set) => {
        const v = new Int32Array(len), z = new Float64Array(len + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
        for (let q = 0; q < len; q++) f[q] = get(q);
        for (let q = 1; q < len; q++) {
          let s; do { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) k--; else break; } while (k >= 0);
          k++; v[k] = q; z[k] = s; z[k + 1] = INF;
        }
        k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; set(q, (q - v[k]) * (q - v[k]) + f[v[k]]); }
      };
      for (let i = 0; i < W * H; i++) o[i] = m[i] ? INF : 0;
      for (let xx = 0; xx < W; xx++) dt1(H, (q) => o[q * W + xx], (q, val) => { o[q * W + xx] = val; });
      for (let y = 0; y < H; y++) dt1(W, (q) => o[y * W + q], (q, val) => { o[y * W + q] = val; });
      for (let i = 0; i < W * H; i++) o[i] = Math.sqrt(o[i]);
      return o;
    }
    for (const [nome, [arq, rx, ry, rw, rh, op = {}]] of Object.entries(RECORTES)) {
      if (!cache[arq]) { const im = new Image(); im.src = '/img/' + arq.split('/').map(encodeURIComponent).join('/'); await im.decode(); cache[arq] = im; }
      const S = 2, W = rw * S, H = rh * S;                     // traça em 2x para a borda sair mais lisa
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.imageSmoothingQuality = 'high';
      x.filter = 'blur(1.2px)'; x.drawImage(cache[arq], rx, ry, rw, rh, 0, 0, W, H); x.filter = 'none';
      const d = x.getImageData(0, 0, W, H); let x0 = W, y0 = H, x1 = 0, y1 = 0;
      for (let i = 0; i < W * H; i++) {
        const R = d.data[i * 4], G = d.data[i * 4 + 1], Bl = d.data[i * 4 + 2];
        const v = (op.vermelho ? R > 120 && R - G > 70 && R - Bl > 50 : (R + G + Bl) / 3 < 150) ? 0 : 255;  // o cinza das imagens conta como tinta
        d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255;
        if (!v) { const px = i % W, py = (i / W) | 0; if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; }
      }
      const Q = 4; x0 = Math.max(0, x0 - Q); y0 = Math.max(0, y0 - Q); x1 = Math.min(W - 1, x1 + Q); y1 = Math.min(H - 1, y1 + Q);
      const CW = x1 - x0 + 1, CH = y1 - y0 + 1;
      if (op.contorno) {
        // linha clara por dentro: tira a tinta dos pontos cuja distância até a borda fica entre [de, ate] (em px da imagem)
        const [de, ate] = op.contorno.map((v) => v * S), m = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) m[i] = d.data[i * 4] ? 0 : 1;
        const D = edt(m, W, H);
        for (let i = 0; i < W * H; i++) if (m[i] && D[i] > de && D[i] < ate) d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = 255;
      }
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
