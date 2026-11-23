# Portf-lio — Marco Surreal (`@marcosurreal`)

Site-portfólio de tatuagem, design gráfico e cerâmica. HTML, CSS e JavaScript puros, sem build.

## Documentos

- [Blueprint de arquitetura, direção de arte e animações](blueprint_completo_marco_surreal_fus_o_editorial_alien_template.md)
- [Pesquisa: fundamentos e conceito](docs/pesquisa_fundamentos_e_conceito.md)

## Estrutura

```text
index.html             Estrutura das seções [00]–[10] do blueprint
assets/css/style.css   Design system (tokens, tipografia, animações)
assets/js/data.js      CONTEÚDO EDITÁVEL: contatos, produtos, trabalhos e flashes
assets/js/commerce.js  Ponto de conexão com a futura plataforma de loja (Shopify/Nuvemshop)
assets/js/main.js      Menu, filtros, modal, sacola, flashes, formulário de contato
assets/img/            Faixas ornamentais em SVG (estilo Dayak / Bornéu)
tools/                 Gerador das faixas ornamentais
```

## Como preencher

Tudo fica em `assets/js/data.js`:

- **`config`:** texto de apresentação, e-mail, WhatsApp e redes. Link vazio não aparece no site.
- **Bio da abertura:** `apresentacao` (primeiro parágrafo, maior) e `bio` (lista de parágrafos menores). Os parágrafos de `bio` são texto de protótipo. A coluna da bio é um pouco mais larga que a logo e vai até embaixo, com os botões um pouco acima da base das imagens. Ao lado direito da logo há uma 4ª foto (ILUSTRAÇÃO, ainda sem imagem), posicionada pelo `placeFourth()` em `main.js` para não encostar na logo, no texto nem nas outras fotos; no celular ela fica escondida. Em telas baixas (até 820px de altura) só o primeiro parágrafo de `bio` aparece.
- **`produtos`:** loja. `destaque: true` coloca o produto na vitrine da página inicial: uma grade de 6 (3 × 2; 2 colunas no celular). Com mais de 6, a grade desliza para o lado com setas, arrastando com o mouse ou rolando no celular. Os botões de categoria são criados a partir das categorias presentes. `preco: null` mostra "Preço a definir" e esconde o botão de compra. `demo: true` mostra o selo DEMO.
- **`trabalhos`:** portfólio (até 6 em destaque). `produtoId` liga um trabalho a um produto da loja, como uma cerâmica à venda.
- **`flashes`:** `estado` pode ser `disponivel`, `reservado` ou `tatuado`. "Tenho interesse" preenche o contato. A seção não tem título (o nome FLASH BOOK já está na capa): só a explicação, tudo centrado no eixo do livro, sem moldura, com a textura de escamas do site aparecendo atrás. Na página inicial os flashes aparecem num **flash book** (protótipo): um livro com capa, páginas que viram em 3D (2 flashes por página no computador, 1 no celular) e contracapa. Para passar: clicar na página da direita (avança) ou da esquerda (volta), setas abaixo do livro, setas do teclado ou arrastar no celular.
- **Fotos:** coloque em `assets/img/` e preencha `imagem` (ou `imagens`).
- **Faixas ornamentais:** `assets/img/ornamento-*.svg`, geradas por `node tools/gerar-ornamentos.js`.

## Pendências conhecidas

- **Loja:** sem plataforma conectada, "Finalizar compra" avisa que é demonstração e não cria pedido (`commerce.js`).
- **Páginas internas** (`loja/`, `trabalhos/`, `flashes/`, `produto/`): parte 2. Os botões "Ver todos" aparecem como "em breve".

## Visualizar

Abra `index.html` no navegador ou rode um servidor estático na pasta (ex.: `npx serve .`).

## Fontes e logo
- **Logo:** `assets/img/logo-marco-surreal.svg` (vetor) e `logo-marco-surreal-face.svg` (só a face amarela das letras, usada no eco da animação). Vetorizadas a partir do desenho final do Marco, `LOGO MARCO SURREAL/LOGO FINAL CONCERTO TUNEL.png` (branch `main`): silhueta, linhas do túnel e face amarela. As cores são as da versão anterior da logo (o PNG foi clareado só para facilitar a vetorização). Fundo transparente, sem brilho em volta. Scripts em `tools/logo/` (`vetorizar-logo-final.js` e `montar-svg.js`).
- **Fontes próprias** em `assets/fonts`:
  - `SURREALES.ttf`: títulos e subtítulos. Base: a SURREALES escolhida pelo Marco (`FONTES SITE SURREAL/SURREALES.ttf`, branch `main`). O U Y, os números 2 5 6 8 9 0 e as minúsculas a b d e p q n v t r y o u foram trocados pelos desenhos novos dele (`MAIUSCULAS.png` e `números e minúsculas.png`). Depois a espessura do traço foi uniformizada em todas as letras: as finas engordaram e as grossas afinaram um pouco, sem mudar o desenho. Script: `tools/fontes/surreales-final.js`.
  - C, Ç, G e S foram ampliados para a mesma altura do O (letras redondas passam um pouco da linha, como o O). Antes o C era 2,5% mais baixo e G e S 3,6%. Script: `tools/fontes/ajustar-redondas.js`.
  - O nome MARCO SURREAL da barra superior usa a SURREALES.
  - A SURREALES é limpa, sem distress. No site ela aparece sempre em maiúsculas (`text-transform: uppercase`), para ficar legível em qualquer tela.
  - `PRINTED BOY SURREAL.ttf`: menus, filtros, botões e etiquetas pequenas (categorias, status, preços). Proporções no estilo da Squid Boy (traço grosso e uniforme, pontas retas com cantos macios), desgaste leve de tinta preta (borda levemente ondulada e gasta, poucas lascas e respingos) e desalinhamento leve. Tem maiúsculas e minúsculas. É a única fonte do site com distress.
  - Os arquivos `.woff` (`SURREALES.woff` e `printed-boy-surreal.woff`) são as mesmas fontes comprimidas, usadas pelo site.
  - Ambas têm A–Z, a–z, números, pontuação, acentos do português (á à â ã é ê í ó ô õ ú ç) e a estrela ✦.
- As duas são desenhos originais feitos em código (`tools/fontes/`), sem copiar contornos de outras fontes.
- Para trocar as fontes do site, edite o bloco "FONTES DO MARCO" no fim do `style.css`.
