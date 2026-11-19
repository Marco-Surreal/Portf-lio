async (page) => {
  const D = '/projects/sandbox/.preview/fontgen/';
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.route('https://font.test/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('.js')) return route.fulfill({ path: D + u.split('/').pop(), contentType: 'application/javascript' });
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<meta charset="utf-8"><body style="margin:0;background:#F0F1D8"><script src="/fontlib.js"></script><script src="/__FONT__.js"></script><canvas id="c"></canvas></body>' });
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('https://font.test/');
  await page.evaluate(() => {
    const FONT = window.__VAR__, cv = document.getElementById('c'), S = __S__, W = 1440, ROW = Math.round(1300 * S);
    const ONLY = __ONLY__; const gl = ONLY ? FONT.glyphs.filter((g) => ONLY.includes(g.ch)) : FONT.glyphs; let x = 10, y = 0; const pos = [];
    for (const g of gl) { const w = g.adv * S; if (x + w > W - 10) { x = 10; y += ROW; } pos.push([x, y]); x += w + 6; }
    cv.width = W; cv.height = y + ROW; const c = cv.getContext('2d'); FL.set(c);
    c.fillStyle = '#F0F1D8'; c.fillRect(0, 0, W, cv.height);
    const R = 3;
    gl.forEach((g, i) => { const [px, py] = pos[i]; const bm = FL.render(g, FONT.metrics, S * R, 40, FONT.opts || {});
      c.fillStyle = 'rgba(185,74,50,0.15)'; c.fillRect(px, py + 920 * S - 700 * S, g.adv * S, 700 * S);
      c.globalCompositeOperation = 'multiply'; c.drawImage(bm, px - 40 * S, py + 920 * S - (FONT.metrics.asc + 40) * S, bm.width / R, bm.height / R); c.globalCompositeOperation = 'source-over'; });
  });
  await page.screenshot({ path: '/projects/sandbox/.kiro/artifacts/screenshots/__OUT__.png', fullPage: true });
  return 'ok';
}
