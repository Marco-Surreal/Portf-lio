async (page) => {
  const D = '/projects/sandbox/.preview/surr/', S = '/projects/sandbox/.kiro/artifacts/screenshots/';
  for (const p of page.context().pages()) if (p !== page) await p.close();
  await page.route('https://surr.test/**', (route) => {
    const u = route.request().url(), f = u.split('/').pop();
    if (f.endsWith('.png')) return route.fulfill({ path: D + f, contentType: 'image/png' });
    if (f === 'potrace.js') return route.fulfill({ path: '/projects/sandbox/.preview/potrace-js/potrace.js', contentType: 'application/javascript' });
    if (f.endsWith('.js')) return route.fulfill({ path: D + f, contentType: 'application/javascript' });
    return route.fulfill({ contentType: 'text/html; charset=utf-8', body: '<meta charset="utf-8"><body style="margin:0;background:#fff"><script src="/potrace.js"></script><script src="/lib.js"></script><script src="/glyphs.js"></script></body>' });
  });
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('https://surr.test/'); await page.waitForFunction(() => window.SL && window.Potrace);
  __BODY__
}
