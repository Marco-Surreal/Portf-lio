# Portf-lio — Marco Surreal (`@marcosurreal`)

Site-portfólio de tatuagem, design gráfico e cerâmica. HTML, CSS e JavaScript puros, sem build.

## Documentos

- [Blueprint de arquitetura, direção de arte e animações](blueprint_completo_marco_surreal_fus_o_editorial_alien_template.md)
- [Pesquisa: fundamentos e conceito](docs/pesquisa_fundamentos_e_conceito.md)

## Estrutura

```text
index.html             Estrutura das seções [00]–[10] do blueprint
assets/css/style.css   Design system (tokens, tipografia, animações)
assets/js/data.js      CONTEÚDO EDITÁVEL: portfólio e loja
assets/js/main.js      Menu, filtros, modal, sacola, formulário
assets/img/            Faixas ornamentais em SVG (estilo Dayak / Bornéu)
tools/                 Gerador das faixas ornamentais
```

## Como preencher

- **Portfólio e loja:** edite `assets/js/data.js`. Para trocar um placeholder por foto, coloque o arquivo em `assets/img/` e preencha o campo `imagem`.
- **Textos (bio, manifesto, contato):** procure por `[A PREENCHER]` e `[` no `index.html`.
- **Faixas ornamentais (espirais Dayak):** ficam em `assets/img/ornamento-*.svg` e são geradas por `node tools/gerar-ornamentos.js`. Para usar um desenho próprio, exporte um SVG com 120 de altura no mesmo nome e, se a largura mudar, atualize o `--ratio` correspondente em `style.css`.
- **Links sociais:** troque `href="#"` e remova o atributo `data-placeholder`.
- **Envio do formulário e da sacola:** hoje só confirmam na tela. Os pontos de integração estão marcados com `PLACEHOLDER` em `main.js`.

## Visualizar

Abra `index.html` no navegador ou rode um servidor estático na pasta (ex.: `npx serve .`).
