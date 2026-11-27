async (page) => {
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('https://trace.test/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('/a.png')) return route.fulfill({ path: '/projects/sandbox/Portf-lio/MARCO SURREAL AESTHETICS/ARTES FAIXA SITE.png', contentType: 'image/png' });
    if (u.endsWith('/potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script src="/potrace.js"></script></body></html>' });
  });
  await page.goto('https://trace.test/');
  const r = await page.evaluate(async () => {
    const img = new Image(); img.src = '/a.png'; await img.decode();
    const N = img.width, c = document.createElement('canvas'); c.width = N; c.height = N; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, N, N).data;
    const ink = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) { const R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2]; ink[i] = (R + G + B) / 3 < 170 && G < 140 ? 1 : 0; }
    // agrupar: grade grossa (8px), dilatada, componentes conectados
    const S = 8, M = N / S, g = new Uint8Array(M * M);
    for (let y = 0; y < N; y++) for (let xx = 0; xx < N; xx++) if (ink[y * N + xx]) g[((y / S) | 0) * M + ((xx / S) | 0)] = 1;
    const DIL = 1, gd = new Uint8Array(M * M);
    for (let y = 0; y < M; y++) for (let xx = 0; xx < M; xx++) if (g[y * M + xx])
      for (let dy = -DIL; dy <= DIL; dy++) for (let dx = -DIL; dx <= DIL; dx++) { const yy = y + dy, x2 = xx + dx; if (yy >= 0 && yy < M && x2 >= 0 && x2 < M) gd[yy * M + x2] = 1; }
    const lab = new Int32Array(M * M), boxes = [];
    let L = 0;
    for (let i = 0; i < M * M; i++) if (gd[i] && !lab[i]) {
      L++; const st = [i]; lab[i] = L; let b = [M, M, 0, 0, 0];
      while (st.length) { const k = st.pop(), ky = (k / M) | 0, kx = k % M;
        if (g[k]) { b[0] = Math.min(b[0], kx); b[1] = Math.min(b[1], ky); b[2] = Math.max(b[2], kx); b[3] = Math.max(b[3], ky); b[4]++; }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = kx + dx, ny = ky + dy; if (nx < 0 || ny < 0 || nx >= M || ny >= M) continue; const n = ny * M + nx; if (gd[n] && !lab[n]) { lab[n] = L; st.push(n); } }
      }
      if (b[4] > 6) boxes.push({ id: L, b });
    }
    // pupila solta dentro do olho: junta peças cuja caixa está dentro da caixa de outra
    const parent = {}; boxes.forEach((o) => parent[o.id] = o.id);
    boxes.forEach((a) => { const host = boxes.filter((o) => o !== a && o.b[0] <= a.b[0] && o.b[1] <= a.b[1] && o.b[2] >= a.b[2] && o.b[3] >= a.b[3]).sort((p, q) => (p.b[2]-p.b[0])*(p.b[3]-p.b[1]) - (q.b[2]-q.b[0])*(q.b[3]-q.b[1]))[0]; if (host) parent[a.id] = host.id; });
    const root = (k) => { while (parent[k] !== k) k = parent[k]; return k; };
    for (let i = 0; i < M * M; i++) if (lab[i]) lab[i] = root(lab[i]);
    const groups = boxes.filter((o) => root(o.id) === o.id);
    const out = [];
    for (const { id, b } of groups) {
      const P = 6, x0 = Math.max(0, b[0] * S - P), y0 = Math.max(0, b[1] * S - P), x1 = Math.min(N, (b[2] + 1) * S + P), y1 = Math.min(N, (b[3] + 1) * S + P);
      const W = x1 - x0, H = y1 - y0;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
        const gi = (((y + y0) / S) | 0) * M + (((xx + x0) / S) | 0);
        const on = ink[(y + y0) * N + xx + x0] && lab[gi] === id; const o = (y * W + xx) * 4;
        im.data[o] = im.data[o + 1] = im.data[o + 2] = on ? 0 : 255; im.data[o + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      const c3 = document.createElement('canvas'); c3.width = W; c3.height = H; const y3 = c3.getContext('2d');
      y3.filter = 'blur(1.6px)'; y3.drawImage(cv, 0, 0); y3.filter = 'none';
      const id3 = y3.getImageData(0, 0, W, H);
      for (let i = 0; i < W * H; i++) { const v = id3.data[i * 4] < 128 ? 0 : 255; id3.data[i * 4] = id3.data[i * 4 + 1] = id3.data[i * 4 + 2] = v; id3.data[i * 4 + 3] = 255; }
      y3.putImageData(id3, 0, 0);
      Potrace.setParameter({ turdsize: 40, alphamax: 1.0, opttolerance: 0.5, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(c3.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r));
      const dd = (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
      out.push({ box: [x0, y0, W, H], d: dd });
    }
    return out;
  });
  return 'TRACE' + JSON.stringify(r) + 'END';
}
