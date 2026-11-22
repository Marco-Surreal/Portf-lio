// SVG da logo a partir de LOGO MARCO SURREAL/LOGOARRUMADA.png (túnel ajustado pelo Marco).
// Camadas vetorizadas: silhueta (corpo escuro), face amarela das letras e linhas oliva do túnel.
const fs = require('fs');
const t = JSON.parse(fs.readFileSync(__dirname + '/trace-out.json', 'utf8'));
const [W, H] = t.size, r = (d) => d.replace(/(\d+\.\d)\d+/g, '$1');
const sil = r(t.sil), face = r(t.face), fins = r(t.fins);
const vb = `0 0 ${W} ${H}`;
const defs = `<defs><filter id="g" x="-15%" y="-15%" width="130%" height="140%"><feGaussianBlur stdDeviation="34"/></filter>`
  + `<linearGradient id="t" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stop-color="#162925"/><stop offset="0.8" stop-color="#2a3a28"/><stop offset="1" stop-color="#34442a"/></linearGradient>`
  + `<clipPath id="sil"><path d="${sil}"/></clipPath></defs>`;
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}">${defs}`
  + `<path fill="#8a7f22" opacity="0.7" filter="url(#g)" d="${sil}"/><path fill="url(#t)" d="${sil}"/>`
  + `<path fill="#5c6a31" clip-path="url(#sil)" d="${fins}"/><path fill="#f1c233" d="${face}"/></svg>`;
const faceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}"><path fill="#f1c233" d="${face}"/></svg>`;
const out = '/projects/sandbox/Portf-lio/assets/img/';
fs.writeFileSync(out + 'logo-marco-surreal.svg', full);
fs.writeFileSync(out + 'logo-marco-surreal-face.svg', faceSvg);
console.log((full.length / 1024).toFixed(0) + 'KB', (faceSvg.length / 1024).toFixed(0) + 'KB');
