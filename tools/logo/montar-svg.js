// SVG da logo a partir de LOGO MARCO SURREAL/LOGO FINAL CONCERTO TUNEL.png (desenho final do Marco).
// Formas do desenho final; cores da versão anterior da logo.
// Uso: node montar-svg.js trace-out.json   (trace-out.json = resultado de vetorizar-logo-final.js)
const fs = require('fs');
const t = JSON.parse(fs.readFileSync(process.argv[2] || __dirname + '/trace-out.json', 'utf8'));
const [W, H] = t.size, r = (d) => d.replace(/(\d+\.\d)\d+/g, '$1'), C = t.colors;
// Cores da versão anterior da logo (escolha do Marco): o PNG foi clareado só para facilitar a vetorização.
const COR = { face: '#f1c233', linhas: '#5c6a31', brilho: '#8a7f22' };
const vb = `0 0 ${W} ${H}`;
const defs = `<defs><filter id="g" x="-15%" y="-15%" width="130%" height="140%"><feGaussianBlur stdDeviation="34"/></filter>`
  + `<linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stop-color="#162925"/><stop offset="0.8" stop-color="#2a3a28"/><stop offset="1" stop-color="#34442a"/></linearGradient>`
  + `<clipPath id="sil"><path d="${r(t.sil)}"/></clipPath></defs>`;
// silhueta com o degradê escuro (o túnel fica nela), linhas do túnel recortadas pela silhueta e a face amarela por cima
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}">${defs}`
  + `<path fill="${COR.brilho}" opacity="0.7" filter="url(#g)" d="${r(t.sil)}"/><path fill="url(#t)" d="${r(t.sil)}"/>`
  + `<path fill="${COR.linhas}" clip-path="url(#sil)" d="${r(t.lines)}"/><path fill="${COR.face}" d="${r(t.face)}"/></svg>`;
const faceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}"><path fill="${COR.face}" d="${r(t.face)}"/></svg>`;
const out = __dirname + '/../../assets/img/';
fs.writeFileSync(out + 'logo-marco-surreal.svg', full);
fs.writeFileSync(out + 'logo-marco-surreal-face.svg', faceSvg);
console.log(W + 'x' + H, (full.length / 1024).toFixed(0) + 'KB', (faceSvg.length / 1024).toFixed(0) + 'KB');
