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
- **`produtos`:** loja. `destaque: true` coloca o produto na vitrine da página inicial: uma grade de 6 (3 × 2; 2 colunas no celular). Com mais de 6, a grade desliza para o lado com setas, arrastando com o mouse ou rolando no celular. Os botões de categoria são criados a partir das categorias presentes. `preco: null` mostra "Preço a definir" e esconde o botão de compra. `demo: true` mostra o selo DEMO.
- **`trabalhos`:** portfólio (até 6 em destaque). `produtoId` liga um trabalho a um produto da loja, como uma cerâmica à venda.
- **`flashes`:** `estado` pode ser `disponivel`, `reservado` ou `tatuado`. "Tenho interesse" preenche o contato.
- **Fotos:** coloque em `assets/img/` e preencha `imagem` (ou `imagens`).
- **Faixas ornamentais:** `assets/img/ornamento-*.svg`, geradas por `node tools/gerar-ornamentos.js`.

## Pendências conhecidas

- **Loja:** sem plataforma conectada, "Finalizar compra" avisa que é demonstração e não cria pedido (`commerce.js`).
- **Páginas internas** (`loja/`, `trabalhos/`, `flashes/`, `produto/`): parte 2. Os botões "Ver todos" aparecem como "em breve".

## Visualizar

Abra `index.html` no navegador ou rode um servidor estático na pasta (ex.: `npx serve .`).

## Fontes e logo
- **Logo:** `assets/img/logo-marco-surreal.svg` (vetor) e `logo-marco-surreal-face.svg` (só a face das letras, usada no eco da animação). Vetorizadas a partir de `LOGO MARCO SURREAL/LOGOARRUMADA.png` (branch `main`), com o túnel ajustado pelo Marco. Scripts em `tools/logo/`.
- **Fontes próprias** em `assets/fonts`:
  - `SURREALES.ttf`: títulos e subtítulos. Feita a partir das letras desenhadas à mão pelo Marco (`FONTES SITE SURREAL/SURREALES EXAMPLE.png`, na branch `main`). As letras A B C D E F G H I J K L M N O R S T são o desenho dele vetorizado, sem simplificar. As que faltavam (P Q U V W X Y Z, minúsculas, números, acentos e pontuação) foram montadas com partes das letras dele: as mesmas hastes, espirais, pontas e serifas. O código fica em `tools/fontes/surreales-marco/`.
  - O site usa `SURREALES.ttf`/`.woff` com distress de impressão (borda gasta, lascas e respingos de tinta, sem buracos no meio das letras), pensado para aparecer em tamanho pequeno. `SURREALES LIMPA.ttf` é a mesma fonte sem o distress, para uso em arte.
  - `PRINTED BOY SURREAL.ttf`: menus, filtros e botões. Proporções no estilo da Squid Boy (traço grosso e uniforme, pontas retas com cantos macios), distress de tinta preta mais forte (borda irregular e respingos) e desalinhamento leve. Tem maiúsculas e minúsculas.
  - Os arquivos `.woff` são as mesmas fontes comprimidas, usadas pelo site.
  - Ambas têm A–Z, a–z, números, pontuação, acentos do português (á à â ã é ê í ó ô õ ú ç) e a estrela ✦.
- As duas são desenhos originais feitos em código (`tools/fontes/`), sem copiar contornos de outras fontes.
- Para trocar as fontes do site, edite o bloco "FONTES DO MARCO" no fim do `style.css`.
