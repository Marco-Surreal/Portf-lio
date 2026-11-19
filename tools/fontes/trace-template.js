async (page) => {
  const D = '/projects/sandbox/.preview/fontgen/';
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.route('https://font.test/**', (route) => {
    const u = route.request().url();
    if (u.endsWith('potrace.js')) return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    if (u.endsWith('.js')) return route.fulfill({ path: D + u.split('/').pop(), contentType: 'application/javascript' });
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<meta charset="utf-8"><body><script src="/potrace.js"></script><script src="/fontlib.js"></script><script src="/__FONT__.js"></script></body>' });
  });
  await page.goto('https://font.test/');
  const res = await page.evaluate(async () => {
    const FONT = window.__VAR__, m = FONT.metrics, sc = 1.5, pad = 40, out = [];
    for (const g of FONT.glyphs) {
      if (g.ch === ' ') { out.push({ ch: g.ch, adv: g.adv, d: '' }); continue; }
      const bm = FL.render(g, m, sc, pad, FONT.opts || {});
      Potrace.setParameter({ turdsize: __TURD__, alphamax: 1.0, opttolerance: 0.25, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(bm.toDataURL());
      await new Promise((r) => setTimeout(r, 30));
      await new Promise((r) => Potrace.process(r));
      const svg = Potrace.getSVG(1);
      const d = (svg.match(/ d="([^"]*)"/) || [, ''])[1];
      // px -> unidades da fonte (y para cima)
      const conv = d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (s, x, y) => (x / sc - pad).toFixed(1) + ' ' + (m.asc + pad - y / sc).toFixed(1));
      out.push({ ch: g.ch, adv: g.adv, d: conv });
    }
    return { name: FONT.name, metrics: m, glyphs: out };
  });
  return JSON.stringify(res);
}
