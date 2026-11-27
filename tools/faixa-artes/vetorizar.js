/*
 * Vetoriza as artes de "MARCO SURREAL AESTHETICS/ARTES FAIXA SITE.png" e grava tools/faixa-artes/artes.json.
 * É um trecho para o browser_run_code_unsafe do Playwright (roda no navegador, usa o potrace.js).
 *
 * Passos por desenho:
 *  1. separa os desenhos da folha (componentes conectados numa grade de 8px);
 *  2. suaviza a borda (blur + limiar);
 *  3. AFINA o traço proporcionalmente: mede a espessura de cada trecho (transformada de distância
 *     + linha central) e guarda só uma fração dela em volta da linha central. Assim as pontas não
 *     encurtam e os trechos grossos continuam mais grossos que os finos (o desenho mantém o caráter);
 *  4. recorta justo e traça com Potrace.
 * Em AJUSTE: h = altura em que a peça aparece na faixa (de 120), T = espessura desejada do traço
 * principal nessa altura (mesma unidade), g = contraste entre grosso e fino (0 = proporcional).
 */
async (page) => {
  const NOMES = ['fogo1', 'fogo2', 'nuvem1', 'nuvem2', 'nuvem3', 'olhoTribal', 'espiralDupla', 'espiralS', 'olhoFogo',
    'olho1', 'olho2', 'olho3', 'olho4', 'olho5', 'olho6', 'olho7', 'olho8', 'olho9', 'olho10', 'olho11', 'olho12'];
  const FORA = ['nuvem1', 'nuvem2', 'nuvem3'];
  const ORN = { h: 50, T: 5.2, g: 0.3 }, FOGO = { h: 46, T: 3.6, g: 0.45 }, OLHO = { h: 17, T: 9, g: 0 };
  const AJUSTE = {
    fogo1: FOGO, fogo2: FOGO,
    espiralS: ORN, espiralDupla: ORN, olhoTribal: { ...ORN, h: 50 }, olhoFogo: { ...ORN, h: 50 }
  };
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  await page.route('https://trace.test/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('/a.png')) return route.fulfill({ path: '/projects/sandbox/Portf-lio/MARCO SURREAL AESTHETICS/ARTES FAIXA SITE.png', contentType: 'image/png' });
    if (u.endsWith('/potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    return route.fulfill({ status: 200, contentType: 'text/html', body: '<html><body><script src="/potrace.js"></script></body></html>' });
  });
  await page.goto('https://trace.test/');
  const dlP = page.waitForEvent('download', { timeout: 300000 });
  const rel = await page.evaluate(async ({ NOMES, FORA, AJUSTE, OLHO }) => {
    const img = new Image(); img.src = '/a.png'; await img.decode();
    const N = img.width, c = document.createElement('canvas'); c.width = N; c.height = N; const x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, N, N); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, N, N).data;
    const ink = new Uint8Array(N * N);
    for (let i = 0; i < N * N; i++) { const R = d[i * 4], G = d[i * 4 + 1], B = d[i * 4 + 2]; ink[i] = (R + G + B) / 3 < 170 && G < 140 ? 1 : 0; }
    const S = 8, M = N / S, g = new Uint8Array(M * M);
    for (let y = 0; y < N; y++) for (let xx = 0; xx < N; xx++) if (ink[y * N + xx]) g[((y / S) | 0) * M + ((xx / S) | 0)] = 1;
    const gd = new Uint8Array(M * M);
    for (let y = 0; y < M; y++) for (let xx = 0; xx < M; xx++) if (g[y * M + xx])
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, x2 = xx + dx; if (yy >= 0 && yy < M && x2 >= 0 && x2 < M) gd[yy * M + x2] = 1; }
    const lab = new Int32Array(M * M), boxes = [];
    let L = 0;
    for (let i = 0; i < M * M; i++) if (gd[i] && !lab[i]) {
      L++; const st = [i]; lab[i] = L; const b = [M, M, 0, 0, 0];
      while (st.length) { const k = st.pop(), ky = (k / M) | 0, kx = k % M;
        if (g[k]) { b[0] = Math.min(b[0], kx); b[1] = Math.min(b[1], ky); b[2] = Math.max(b[2], kx); b[3] = Math.max(b[3], ky); b[4]++; }
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = kx + dx, ny = ky + dy; if (nx < 0 || ny < 0 || nx >= M || ny >= M) continue; const n = ny * M + nx; if (gd[n] && !lab[n]) { lab[n] = L; st.push(n); } }
      }
      if (b[4] > 6) boxes.push({ id: L, b });
    }
    const parent = {}; boxes.forEach((o) => parent[o.id] = o.id);
    boxes.forEach((a) => { const host = boxes.filter((o) => o !== a && o.b[0] <= a.b[0] && o.b[1] <= a.b[1] && o.b[2] >= a.b[2] && o.b[3] >= a.b[3]).sort((p, q) => (p.b[2] - p.b[0]) * (p.b[3] - p.b[1]) - (q.b[2] - q.b[0]) * (q.b[3] - q.b[1]))[0]; if (host) parent[a.id] = host.id; });
    const root = (k) => { while (parent[k] !== k) k = parent[k]; return k; };
    for (let i = 0; i < M * M; i++) if (lab[i]) lab[i] = root(lab[i]);
    const groups = boxes.filter((o) => root(o.id) === o.id);

    // transformada de distância euclidiana exata (Felzenszwalb), devolve a distância até o fundo
    function edt(m, W, H) {
      const INF = 1e12, f = new Float64Array(Math.max(W, H)), out = new Float64Array(W * H);
      const dt1 = (len, get, set) => {
        const v = new Int32Array(len), z = new Float64Array(len + 1); let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
        for (let q = 0; q < len; q++) f[q] = get(q);
        for (let q = 1; q < len; q++) {
          let s; do { const p = v[k]; s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p); if (s <= z[k]) k--; else break; } while (k >= 0);
          k++; v[k] = q; z[k] = s; z[k + 1] = INF;
        }
        k = 0; for (let q = 0; q < len; q++) { while (z[k + 1] < q) k++; set(q, (q - v[k]) * (q - v[k]) + f[v[k]]); }
      };
      for (let i = 0; i < W * H; i++) out[i] = m[i] ? INF : 0;
      for (let xx = 0; xx < W; xx++) dt1(H, (q) => out[q * W + xx], (q, val) => { out[q * W + xx] = val; });
      for (let y = 0; y < H; y++) dt1(W, (q) => out[y * W + q], (q, val) => { out[y * W + q] = val; });
      for (let i = 0; i < W * H; i++) out[i] = Math.sqrt(out[i]);
      return out;
    }
    const blurBin = (m, W, H, r) => {
      const a = document.createElement('canvas'); a.width = W; a.height = H; const ax = a.getContext('2d'), im = ax.createImageData(W, H);
      for (let i = 0; i < W * H; i++) { const v = m[i] ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
      ax.putImageData(im, 0, 0);
      const b = document.createElement('canvas'); b.width = W; b.height = H; const bx = b.getContext('2d');
      bx.fillStyle = '#fff'; bx.fillRect(0, 0, W, H); bx.filter = `blur(${r}px)`; bx.drawImage(a, 0, 0);
      const o = bx.getImageData(0, 0, W, H).data, res = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) res[i] = o[i * 4] < 128 ? 1 : 0;
      return res;
    };

    const out = {}, info = [];
    for (let gi = 0; gi < groups.length; gi++) {
      const nome = NOMES[gi]; if (!nome || FORA.includes(nome)) continue;
      const { id, b } = groups[gi];
      const P = 6, x0 = Math.max(0, b[0] * S - P), y0 = Math.max(0, b[1] * S - P), x1 = Math.min(N, (b[2] + 1) * S + P), y1 = Math.min(N, (b[3] + 1) * S + P);
      const W = x1 - x0, H = y1 - y0;
      let m = new Uint8Array(W * H);
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
        const gg = (((y + y0) / S) | 0) * M + (((xx + x0) / S) | 0);
        m[y * W + xx] = ink[(y + y0) * N + xx + x0] && lab[gg] === id ? 1 : 0;
      }
      m = blurBin(m, W, H, 1.6);
      const cfg = AJUSTE[nome] || OLHO;
      // espessura: linha central = máximos locais da distância
      const D = edt(m, W, H), ridge = new Uint8Array(W * H), rv = [];
      for (let y = 1; y < H - 1; y++) for (let xx = 1; xx < W - 1; xx++) {
        const i = y * W + xx, v = D[i]; if (v < 1.5) continue;
        // máximo ao longo de algum eixo (estrito de um lado) e perto do maior vizinho: fica só a linha central
        let mx = 0; for (const o of [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]) mx = Math.max(mx, D[i + o]);
        if (v < mx - 0.75) continue;
        const eixo = (a, c) => v >= a && v >= c && (v > a || v > c);
        if (eixo(D[i - 1], D[i + 1]) || eixo(D[i - W], D[i + W]) || eixo(D[i - W - 1], D[i + W + 1]) || eixo(D[i - W + 1], D[i + W - 1])) { ridge[i] = 1; rv.push(v); }
      }
      rv.sort((p, q) => p - q);
      const med = rv[Math.floor(rv.length * 0.6)] || 1;                     // meia espessura típica (px da folha)
      const k = cfg.h / H, antes = 2 * med * k;                              // espessura na faixa
      const s = Math.min(1, cfg.T / antes);
      let fin = m;
      if (s < 0.999) {
        // cada pixel herda a meia espessura (Wr) da linha central mais próxima (Dijkstra a partir da linha central)
        const Wr = new Float64Array(W * H), dist = new Float64Array(W * H).fill(1e9);
        const heap = []; const push = (dd, i) => { heap.push([dd, i]); let c2 = heap.length - 1; while (c2 > 0) { const p = (c2 - 1) >> 1; if (heap[p][0] <= heap[c2][0]) break; [heap[p], heap[c2]] = [heap[c2], heap[p]]; c2 = p; } };
        const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let c2 = 0; for (;;) { const l = 2 * c2 + 1, r = l + 1; let mn = c2; if (l < heap.length && heap[l][0] < heap[mn][0]) mn = l; if (r < heap.length && heap[r][0] < heap[mn][0]) mn = r; if (mn === c2) break; [heap[mn], heap[c2]] = [heap[c2], heap[mn]]; c2 = mn; } } return top; };
        for (let i = 0; i < W * H; i++) if (ridge[i]) { dist[i] = 0; Wr[i] = D[i]; push(0, i); }
        const nb = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [-1, 1, 1.414], [1, -1, 1.414], [-1, -1, 1.414]];
        while (heap.length) {
          const [dd, i] = pop(); if (dd > dist[i]) continue; const y = (i / W) | 0, xx = i % W;
          for (const [dx, dy, cst] of nb) { const nx = xx + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const n = ny * W + nx; if (!m[n]) continue; const nd = dd + cst; if (nd < dist[n]) { dist[n] = nd; Wr[n] = Wr[i]; push(nd, n); } }
        }
        fin = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) if (m[i]) {
          const w0 = Wr[i] || D[i];
          const alvo = s * w0 * Math.pow(w0 / med, cfg.g);                    // nova meia espessura
          if (ridge[i] || dist[i] <= Math.min(w0, alvo)) fin[i] = 1;
        }
        fin = blurBin(fin, W, H, 2);
      }
      // recorte justo
      let bx0 = W, by0 = H, bx1 = 0, by1 = 0;
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) if (fin[y * W + xx]) { if (xx < bx0) bx0 = xx; if (xx > bx1) bx1 = xx; if (y < by0) by0 = y; if (y > by1) by1 = y; }
      const Q = 3; bx0 = Math.max(0, bx0 - Q); by0 = Math.max(0, by0 - Q); bx1 = Math.min(W - 1, bx1 + Q); by1 = Math.min(H - 1, by1 + Q);
      const CW = bx1 - bx0 + 1, CH = by1 - by0 + 1;
      const cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const cx = cv.getContext('2d'), im = cx.createImageData(CW, CH);
      for (let y = 0; y < CH; y++) for (let xx = 0; xx < CW; xx++) { const v = fin[(y + by0) * W + xx + bx0] ? 0 : 255, o = (y * CW + xx) * 4; im.data[o] = im.data[o + 1] = im.data[o + 2] = v; im.data[o + 3] = 255; }
      cx.putImageData(im, 0, 0);
      Potrace.setParameter({ turdsize: 30, alphamax: 1.0, opttolerance: 0.4, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(cv.toDataURL()); await new Promise((r) => setTimeout(r, 30)); await new Promise((r) => Potrace.process(r));
      const dd = (Potrace.getSVG(1).match(/ d="([^"]*)"/) || [, ''])[1];
      out[nome] = { w: CW, h: CH, d: dd };
      info.push(`${nome}: traço ${antes.toFixed(1)} -> ${(antes * s).toFixed(1)} (s=${s.toFixed(2)})`);
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })); a.download = 'artes.json';
    document.body.appendChild(a); a.click();
    return info.join('\n');
  }, { NOMES, FORA, AJUSTE, OLHO });
  const dl = await dlP;
  await dl.saveAs('/projects/sandbox/Portf-lio/tools/faixa-artes/artes.json');
  return rel;
}
