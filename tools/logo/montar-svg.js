// SVG da logo a partir de LOGO MARCO SURREAL/LOGO FINAL CONCERTO TUNEL.png (desenho final do Marco).
// Camadas (de baixo para cima): silhueta verde escura, túnel verde, linhas oliva do túnel e a face amarela das letras.
// Uso: node montar-svg.js trace-out.json   (trace-out.json = resultado de vetorizar-logo-final.js)
const fs = require('fs');
const t = JSON.parse(fs.readFileSync(process.argv[2] || __dirname + '/trace-out.json', 'utf8'));
const [W, H] = t.size, r = (d) => d.replace(/(\d+\.\d)\d+/g, '$1'), C = t.colors;
const vb = `0 0 ${W} ${H}`;
const defs = `<defs><filter id="g" x="-10%" y="-15%" width="120%" height="130%"><feGaussianBlur stdDeviation="22"/></filter>`
  // no desenho, o verde escuro passa suave para o verde do túnel logo abaixo das letras
  + `<linearGradient id="t" gradientUnits="userSpaceOnUse" x1="0" y1="${Math.round(H * 0.64)}" x2="0" y2="${Math.round(H * 0.76)}"><stop offset="0" stop-color="${C.teal}"/><stop offset="1" stop-color="${C.green}"/></linearGradient></defs>`;
const full = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}">${defs}`
  + `<path fill="${C.yellow}" opacity="0.3" filter="url(#g)" d="${r(t.sil)}"/>`
  + `<path fill="${C.teal}" d="${r(t.sil)}"/><path fill="url(#t)" d="${r(t.tunnel)}"/>`
  + `<path fill="${C.olive}" d="${r(t.lines)}"/><path fill="${C.yellow}" d="${r(t.face)}"/></svg>`;
const faceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${W}" height="${H}"><path fill="${C.yellow}" d="${r(t.face)}"/></svg>`;
const out = __dirname + '/../../assets/img/';
fs.writeFileSync(out + 'logo-marco-surreal.svg', full);
fs.writeFileSync(out + 'logo-marco-surreal-face.svg', faceSvg);
console.log(W + 'x' + H, (full.length / 1024).toFixed(0) + 'KB', (faceSvg.length / 1024).toFixed(0) + 'KB');
