  const ONLY = __ONLY__, NAME = '__NAME__', ROW = __ROW__;
  await page.evaluate(async ([ONLY, ROW]) => { window.DIS = __DIS__; await SL.load(); await GL.build();
    const chars = ONLY ? [...ONLY] : GL.defs.map((d) => d.ch);
    const c = document.createElement('canvas'); c.width = 2400; const lines = []; let line = [], w = 0;
    for (const ch of chars) { const o = GL.out(ch, window.DIS); if (w + o.width > 2300 || (ROW && line.length >= ROW)) { lines.push(line); line = []; w = 0; } line.push([ch, o]); w += o.width; }
    lines.push(line); const LH = GL.ASC + GL.DESC + 30; c.height = lines.length * LH + 20;
    const x = c.getContext('2d'); x.fillStyle = '#F0F1D8'; x.fillRect(0, 0, c.width, c.height);
    lines.forEach((ln, i) => { let px = 30; const by = 20 + i * LH; x.fillStyle = 'rgba(185,74,50,.35)'; x.fillRect(0, by + GL.ASC, c.width, 1); x.fillRect(0, by + GL.ASC - GL.CAP, c.width, 1); x.fillRect(0, by + GL.ASC - GL.XH, c.width, 1);
      for (const [ch, o] of ln) { x.drawImage(o, px, by); x.fillStyle = 'rgba(0,0,255,.5)'; x.font = '18px sans-serif'; x.fillText(ch, px + 4, by + GL.ASC + GL.DESC + 18); px += o.width; } });
    c.id = 'sheet'; document.body.appendChild(c); }, [ONLY, ROW]);
  const h = await page.evaluate(() => document.getElementById('sheet').height);
  await page.setViewportSize({ width: 2400, height: Math.min(h, 4000) });
  await page.screenshot({ path: S + 'p-' + NAME + '.png' });
  return 'ok';
