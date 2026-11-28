// Monta um arquivo .ttf (contornos TrueType) e um .woff a partir dos contornos vetorizados (json)
// uso: node build-ttf.js entrada.json saida.ttf "Nome da Família" PostScriptName peso
const fs = require('fs');
const zlib = require('zlib');
const [, , IN, OUT, FAMILY, PSNAME, WEIGHT = '400'] = process.argv;
const src = JSON.parse(fs.readFileSync(IN, 'utf8'));
const M = src.metrics;
const TOL = 0.6; // erro máximo (unidades) ao converter cúbica -> quadrática

// ---------- contornos ----------
function parse(d) {
  const t = d.match(/[MCL]|-?\d+\.?\d*/g) || [];
  const contours = []; let cur = null, i = 0, cmd = null;
  const num = () => parseFloat(t[i++]);
  while (i < t.length) {
    if (/[MCL]/.test(t[i])) cmd = t[i++];
    if (cmd === 'M') { cur = { start: [num(), num()], segs: [] }; contours.push(cur); cmd = null; }
    else if (cmd === 'C') { cur.segs.push(['C', [num(), num()], [num(), num()], [num(), num()]]); }
    else if (cmd === 'L') { cur.segs.push(['L', [num(), num()]]); }
    else i++;
  }
  return contours;
}
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
function cubicToQuads(p0, c1, c2, p3, out, depth = 0) {
  const ex = p3[0] - 3 * c2[0] + 3 * c1[0] - p0[0], ey = p3[1] - 3 * c2[1] + 3 * c1[1] - p0[1];
  const err = Math.sqrt(3) / 36 * Math.hypot(ex, ey);
  if (err <= TOL || depth > 6) {
    const q = [(3 * (c1[0] + c2[0]) - p0[0] - p3[0]) / 4, (3 * (c1[1] + c2[1]) - p0[1] - p3[1]) / 4];
    out.push([q, false], [p3, true]); return;
  }
  const a = lerp(p0, c1, 0.5), b = lerp(c1, c2, 0.5), c = lerp(c2, p3, 0.5), ab = lerp(a, b, 0.5), bc = lerp(b, c, 0.5), m = lerp(ab, bc, 0.5);
  cubicToQuads(p0, a, ab, m, out, depth + 1); cubicToQuads(m, bc, c, p3, out, depth + 1);
}
function toPoints(ct) {
  const pts = []; let p = ct.start;
  for (const s of ct.segs) {
    if (s[0] === 'L') { pts.push([s[1], true]); p = s[1]; }
    else { cubicToQuads(p, s[1], s[2], s[3], pts); p = s[3]; }
  }
  // arredonda e limpa
  let q = pts.map(([pt, on]) => [Math.round(pt[0]), Math.round(pt[1]), on]);
  const o = [];
  for (const pt of q) { const l = o[o.length - 1]; if (l && l[0] === pt[0] && l[1] === pt[1]) { if (pt[2]) l[2] = true; continue; } o.push(pt); }
  while (o.length > 1 && o[0][0] === o[o.length - 1][0] && o[0][1] === o[o.length - 1][1]) { const l = o.pop(); if (l[2]) o[0][2] = true; }
  // tira pontos de linha reta redundantes (on-on-on colineares)
  return o;
}
function area(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
function inside(pt, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function glyphContours(d) {
  const cs = parse(d).map(toPoints).filter((c) => c.length >= 3 && Math.abs(area(c)) > 4);
  // TrueType: contorno externo no sentido horário, furos no anti-horário
  return cs.map((c, i) => {
    const probe = c.find((p) => p[2]) || c[0];
    let depth = 0; cs.forEach((o, j) => { if (j !== i && inside([probe[0] + 0.01, probe[1] + 0.01], o)) depth++; });
    const a = area(c), wantCW = depth % 2 === 0;
    return (wantCW && a > 0) || (!wantCW && a < 0) ? c.slice().reverse() : c;
  });
}
// ---------- glifos ----------
const glyphs = [{ name: '.notdef', adv: 500, contours: [[[50, 0, true], [50, 700, true], [450, 700, true], [450, 0, true]], [[110, 60, true], [390, 60, true], [390, 640, true], [110, 640, true]]] }];
for (const g of src.glyphs) glyphs.push({ ch: g.ch, adv: g.adv, contours: g.d ? glyphContours(g.d) : [] });
function encodeGlyph(g) {
  if (!g.contours.length) return { buf: Buffer.alloc(0), bbox: [0, 0, 0, 0], pts: 0 };
  const all = g.contours.flat();
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const bbox = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  const ends = []; let n = 0; g.contours.forEach((c) => { n += c.length; ends.push(n - 1); });
  const flags = [], xb = [], yb = [];
  let px = 0, py = 0;
  for (const p of all) {
    let f = p[2] ? 1 : 0; const dx = p[0] - px, dy = p[1] - py; px = p[0]; py = p[1];
    if (dx === 0) f |= 0x10; else if (Math.abs(dx) < 256) { f |= 0x02 | (dx > 0 ? 0x10 : 0); xb.push(Math.abs(dx)); } else { xb.push(['s', dx]); }
    if (dy === 0) f |= 0x20; else if (Math.abs(dy) < 256) { f |= 0x04 | (dy > 0 ? 0x20 : 0); yb.push(Math.abs(dy)); } else { yb.push(['s', dy]); }
    flags.push(f);
  }
  const parts = [];
  const head = Buffer.alloc(10); head.writeInt16BE(g.contours.length, 0); bbox.forEach((v, i) => head.writeInt16BE(v, 2 + i * 2)); parts.push(head);
  const e = Buffer.alloc(ends.length * 2 + 2); ends.forEach((v, i) => e.writeUInt16BE(v, i * 2)); e.writeUInt16BE(0, ends.length * 2); parts.push(e);
  parts.push(Buffer.from(flags));
  const enc = (arr) => { const b = []; for (const v of arr) { if (Array.isArray(v)) { const t = Buffer.alloc(2); t.writeInt16BE(v[1]); b.push(t); } else b.push(Buffer.from([v])); } return Buffer.concat(b); };
  parts.push(enc(xb), enc(yb));
  let buf = Buffer.concat(parts);
  if (buf.length % 4) buf = Buffer.concat([buf, Buffer.alloc(4 - buf.length % 4)]);
  return { buf, bbox, pts: all.length };
}
const enc = glyphs.map(encodeGlyph);
// ---------- tabelas ----------
const u16 = (v) => { const b = Buffer.alloc(2); b.writeUInt16BE(v & 0xffff); return b; };
const i16 = (v) => { const b = Buffer.alloc(2); b.writeInt16BE(v); return b; };
const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32BE(v >>> 0); return b; };
const cat = (...a) => Buffer.concat(a);
const nG = glyphs.length;
const bb = enc.filter((e) => e.pts).map((e) => e.bbox);
const xMin = Math.min(...bb.map((b) => b[0])), yMin = Math.min(...bb.map((b) => b[1])), xMax = Math.max(...bb.map((b) => b[2])), yMax = Math.max(...bb.map((b) => b[3]));
const advMax = Math.max(...glyphs.map((g) => g.adv));
const lsbs = enc.map((e) => e.bbox[0]);
const rsbs = enc.map((e, i) => glyphs[i].adv - e.bbox[2]);
const maxPts = Math.max(...enc.map((e) => e.pts)), maxCt = Math.max(...glyphs.map((g) => g.contours.length));
// glyf + loca
let off = 0; const loca = [];
enc.forEach((e) => { loca.push(off); off += e.buf.length; }); loca.push(off);
const glyf = Buffer.concat(enc.map((e) => e.buf));
const locaB = Buffer.concat(loca.map(u32));
const now = BigInt(Math.floor(Date.now() / 1000) + 2082844800);
const ldt = () => { const b = Buffer.alloc(8); b.writeBigUInt64BE(now); return b; };
const head = cat(u32(0x00010000), u32(0x00010000), u32(0), u32(0x5F0F3CF5), u16(0x000B), u16(1000), ldt(), ldt(), i16(xMin), i16(yMin), i16(xMax), i16(yMax), u16(0), u16(8), i16(2), i16(1), i16(0));
const asc = Math.max(M.asc, yMax), desc = Math.min(M.desc, yMin);
const hhea = cat(u32(0x00010000), i16(asc), i16(desc), i16(0), u16(advMax), i16(Math.min(...lsbs)), i16(Math.min(...rsbs)), i16(Math.max(...enc.map((e) => e.bbox[2]))), i16(1), i16(0), i16(0), i16(0), i16(0), i16(0), i16(0), i16(0), u16(nG));
const maxp = cat(u32(0x00010000), u16(nG), u16(maxPts), u16(maxCt), u16(0), u16(0), u16(2), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0), u16(0));
const hmtx = Buffer.concat(glyphs.map((g, i) => cat(u16(g.adv), i16(lsbs[i]))));
// cmap formato 4
const map = glyphs.map((g, i) => [g.ch ? g.ch.codePointAt(0) : -1, i]).filter((m) => m[0] >= 0).sort((a, b) => a[0] - b[0]);
const segs = [];
for (const [c, gid] of map) { const l = segs[segs.length - 1]; if (l && c === l.end + 1 && gid === l.gid + (c - l.start)) l.end = c; else segs.push({ start: c, end: c, gid }); }
segs.push({ start: 0xffff, end: 0xffff, gid: 0, last: true });
const sc = segs.length, es = Math.floor(Math.log2(sc)), sr = 2 * Math.pow(2, es);
const f4 = cat(u16(4), u16(16 + sc * 8), u16(0), u16(sc * 2), u16(sr), u16(es), u16(sc * 2 - sr),
  Buffer.concat(segs.map((s) => u16(s.end))), u16(0), Buffer.concat(segs.map((s) => u16(s.start))),
  Buffer.concat(segs.map((s) => u16(s.last ? 1 : (s.gid - s.start)))), Buffer.concat(segs.map(() => u16(0))));
const cmap = cat(u16(0), u16(2), u16(0), u16(3), u32(20), u16(3), u16(1), u32(20), f4);
// OS/2 v4
const avg = Math.round(glyphs.filter((g) => g.adv).reduce((a, g) => a + g.adv, 0) / glyphs.filter((g) => g.adv).length);
const codes = map.map((m) => m[0]);
const hasDing = codes.some((c) => c >= 0x2700 && c <= 0x27bf);
const os2 = cat(u16(4), i16(avg), u16(+WEIGHT), u16(5), u16(0), i16(650), i16(600), i16(0), i16(75), i16(650), i16(600), i16(0), i16(350), i16(50), i16(250), i16(0),
  Buffer.alloc(10), u32(0x00000003), u32(hasDing ? (1 << 15) : 0), u32(0), u32(0), Buffer.from('MSUR'), u16(0x0040), u16(Math.min(...codes)), u16(Math.min(0xffff, Math.max(...codes))),
  i16(M.asc), i16(M.desc), i16(0), u16(asc), u16(-desc), u32(1), u32(0), i16(M.x), i16(M.cap), u16(0), u16(32), u16(0));
// name
const ver = 'Version 1.000';
const names = { 0: 'Copyright (c) 2026 Marco Surreal', 1: FAMILY, 2: 'Regular', 3: '1.000;MSUR;' + PSNAME, 4: FAMILY, 5: ver, 6: PSNAME, 8: 'Marco Surreal', 9: 'Marco Surreal' };
const recs = [], strs = []; let so = 0;
for (const [id, s] of Object.entries(names)) {
  const mac = Buffer.from(s.replace(/[^\x20-\x7e]/g, '?'), 'latin1'); recs.push([1, 0, 0, +id, mac.length, so]); strs.push(mac); so += mac.length;
}
for (const [id, s] of Object.entries(names)) {
  const w = Buffer.from(s, 'utf16le'); w.swap16(); recs.push([3, 1, 0x409, +id, w.length, so]); strs.push(w); so += w.length;
}
const name = cat(u16(0), u16(recs.length), u16(6 + recs.length * 12), Buffer.concat(recs.map((r) => cat(...r.map(u16)))), Buffer.concat(strs));
const post = cat(u32(0x00030000), u32(0), i16(-110), i16(50), u32(0), u32(0), u32(0), u32(0), u32(0));
// ---------- arquivo ----------
const tables = { 'OS/2': os2, cmap, glyf, head, hhea, hmtx, loca: locaB, maxp, name, post };
const tags = Object.keys(tables).sort();
const pad4 = (b) => (b.length % 4 ? Buffer.concat([b, Buffer.alloc(4 - b.length % 4)]) : b);
const csum = (b) => { b = pad4(b); let s = 0; for (let i = 0; i < b.length; i += 4) s = (s + b.readUInt32BE(i)) >>> 0; return s; };
function sfnt() {
  const n = tags.length, es2 = Math.floor(Math.log2(n)), sr2 = Math.pow(2, es2) * 16;
  const hdr = cat(u32(0x00010000), u16(n), u16(sr2), u16(es2), u16(n * 16 - sr2));
  let o = 12 + n * 16; const dir = [], data = [];
  for (const t of tags) { const b = tables[t]; dir.push(cat(Buffer.from(t.padEnd(4)), u32(csum(b)), u32(o), u32(b.length))); data.push(pad4(b)); o += pad4(b).length; }
  return Buffer.concat([hdr, ...dir, ...data]);
}
let font = sfnt();
const adj = (0xB1B0AFBA - csum(font)) >>> 0;
const headOff = font.indexOf(Buffer.from('head')); const hoff = font.readUInt32BE(headOff + 8);
font.writeUInt32BE(adj, hoff + 8);
tables.head.writeUInt32BE(adj, 8);
fs.writeFileSync(OUT, font);
// WOFF 1.0 (mesma fonte comprimida, para o site)
function woff() {
  const n = tags.length; let o = 44 + n * 20; const dir = [], data = [];
  for (const t of tags) {
    const b = t === 'head' ? (() => { const h = Buffer.from(tables.head); h.writeUInt32BE(0, 8); return h; })() : tables[t];
    const orig = tables[t]; const z = zlib.deflateSync(orig); const use = z.length < orig.length ? z : orig;
    dir.push(cat(Buffer.from(t.padEnd(4)), u32(o), u32(use.length), u32(orig.length), u32(csum(b))));
    data.push(pad4(use)); o += pad4(use).length;
  }
  const total = o;
  const hdr = cat(Buffer.from('wOFF'), u32(0x00010000), u32(total), u16(n), u16(0), u32(font.length), u16(1), u16(0), u32(0), u32(0), u32(0), u32(0), u32(0));
  return Buffer.concat([hdr, ...dir, ...data]);
}
fs.writeFileSync(OUT.replace(/\.ttf$/i, '.woff'), woff());
console.log(OUT, 'glifos', nG, 'ttf', (font.length / 1024).toFixed(0) + 'KB', 'woff', (fs.statSync(OUT.replace(/\.ttf$/i, '.woff')).size / 1024).toFixed(0) + 'KB', 'maxPts', maxPts);
