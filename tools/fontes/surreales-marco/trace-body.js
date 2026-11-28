  const res = await page.evaluate(async () => { window.DIS = __DIS__; await SL.load(); await GL.build();
    const K = 700 / GL.CAP, Z = 2, out = [];
    for (const d of GL.defs) { const u = GL.U[d.ch];
      if (u.space) { out.push({ ch: d.ch, adv: Math.round(u.adv * K), d: '' }); continue; }
      const o = GL.out(d.ch, window.DIS), c = document.createElement('canvas'); c.width = o.width * Z; c.height = o.height * Z;
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingEnabled = true; x.drawImage(o, 0, 0, c.width, c.height);
      Potrace.setParameter({ turdsize: 6, alphamax: 0.9, opttolerance: 0.2, optcurve: true, turnpolicy: 'minority' });
      Potrace.loadImageFromUrl(c.toDataURL()); await new Promise((r) => setTimeout(r, 20)); await new Promise((r) => Potrace.process(r));
      const svg = Potrace.getSVG(1), dd = (svg.match(/ d="([^"]*)"/) || [, ''])[1];
      const conv = dd.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (s, a, b) => (a / Z * K).toFixed(1) + ' ' + ((GL.ASC - b / Z) * K).toFixed(1));
      out.push({ ch: d.ch, adv: Math.round(u.adv * K), d: conv });
    }
    return { name: 'SURREALES', metrics: { asc: Math.round(GL.ASC * K), desc: -Math.round(GL.DESC * K), cap: 700, x: Math.round(GL.XH * K) }, glyphs: out };
  });
  return JSON.stringify(res);
