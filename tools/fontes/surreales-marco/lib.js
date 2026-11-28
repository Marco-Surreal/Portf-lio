// Carrega o PNG do Marco e separa cada letra (componente conectado) num canvas próprio.
window.SL = (() => {
  const L = {};
  const BOX = { // letra: [x0,y0,x1,y1] no PNG 3000x3000
    F:[628,859,840,1150], J:[833,868,1026,1148], K:[1119,856,1327,1118],
    T:[144,1256,438,1549], R:[429,1254,728,1544], A:[732,1245,1017,1532], B:[1014,1232,1261,1529], A2:[1255,1245,1540,1529],
    L:[1524,1241,1746,1524], H:[1744,1249,1977,1531], O:[1984,1235,2232,1532], S:[2242,1241,2446,1534],
    S2:[153,1701,357,1994], E:[357,1693,575,1995], L2:[586,1710,787,2008], E2:[797,1698,1016,2000], C:[1026,1693,1228,1993],
    I:[1245,1711,1380,1978], O2:[1393,1688,1641,1985], N:[1642,1699,1891,1971], A3:[1895,1695,2180,1980], D:[2168,1680,2436,1974],
    O3:[2462,1662,2710,1959], S3:[2719,1668,2924,1961], M:[1623,2079,1886,2362], G:[1926,2067,2166,2367],
  };
  L.BOX = BOX;
  L.load = async () => {
    const img = new Image(); img.src = '/ex.png'; await img.decode();
    const W = img.width, H = img.height, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0);
    const px = x.getImageData(0, 0, W, H).data, ink = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) ink[i] = (px[i * 4] + px[i * 4 + 1] + px[i * 4 + 2]) / 3 < 128 ? 1 : 0;
    // rótulo de componente para isolar cada letra mesmo quando as caixas se sobrepõem
    const lab = new Int32Array(W * H); let n = 0; const st = new Int32Array(W * H);
    for (let i = 0; i < W * H; i++) if (ink[i] && !lab[i]) { n++; let sp = 0; st[sp++] = i; lab[i] = n;
      while (sp) { const j = st[--sp]; for (const k of [j - 1, j + 1, j - W, j + W]) if (k >= 0 && k < W * H && ink[k] && !lab[k]) { lab[k] = n; st[sp++] = k; } } }
    L.G = {};
    for (const [k, b] of Object.entries(BOX)) { const x0 = b[0] - 14, y0 = b[1] - 14, x1 = b[2] + 14, y1 = b[3] + 14;
      // componente dominante dentro da caixa
      const cnt = {}; for (let y = y0; y <= y1; y++) for (let xx = x0; xx <= x1; xx++) { const l = lab[y * W + xx]; if (l) cnt[l] = (cnt[l] || 0) + 1; }
      const id = +Object.entries(cnt).sort((a, b) => b[1] - a[1])[0][0];
      const w = x1 - x0 + 1, h = y1 - y0 + 1, cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const cx = cv.getContext('2d'), im = cx.createImageData(w, h);
      for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) { const i = (y * w + xx) * 4, on = lab[(y + y0) * W + xx + x0] === id; im.data[i] = im.data[i + 1] = im.data[i + 2] = 0; im.data[i + 3] = on ? 255 : 0; }
      cx.putImageData(im, 0, 0);
      let a0 = w, a1 = -1, b0 = h, b1 = -1; for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) if (im.data[(y * w + xx) * 4 + 3]) { if (xx < a0) a0 = xx; if (xx > a1) a1 = xx; if (y < b0) b0 = y; if (y > b1) b1 = y; }
      const cv2 = document.createElement('canvas'); cv2.width = a1 - a0 + 1; cv2.height = b1 - b0 + 1; cv2.getContext('2d').drawImage(cv, -a0, -b0); L.G[k] = cv2; L.OFF = L.OFF || {}; L.OFF[k] = [x0 + a0 - b[0], y0 + b0 - b[1]];
    }
    return L.G;
  };
  return L;
})();
