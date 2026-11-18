/*
 * CONTEÚDO EDITÁVEL DO SITE
 * ------------------------------------------------------------
 * Preencha aqui o portfólio e a loja. Não é preciso mexer no HTML.
 *
 * imagem: caminho da foto (ex.: "assets/img/flash-adaga.jpg").
 *         Deixe "" para mostrar o placeholder hachurado.
 * categoria (portfólio): "tatuagem" | "design" | "ceramica"
 * ficha: pares "Campo": "Valor" exibidos no modal de ficha técnica.
 *        Campos sugeridos estão em docs/pesquisa_fundamentos_e_conceito.md (seção 2).
 * estoque (loja): quantidade máxima na sacola. Flash 1/1 = 1.
 */
window.SITE_DATA = {
  portfolio: [
    {
      id: "p01",
      titulo: "[Título da peça]",
      categoria: "tatuagem",
      vertente: "Old School Surreal",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER: história e referências da peça]",
      ficha: {
        "Agulhas": "[ex.: RL 9 / M 13]",
        "Pigmentos": "[marca / cores]",
        "Área": "[antebraço]",
        "Tamanho": "[cm]",
        "Sessões": "[n]"
      }
    },
    {
      id: "p02",
      titulo: "[Título da peça]",
      categoria: "tatuagem",
      vertente: "Oriental / Ukiyo-e",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER]",
      ficha: {
        "Agulhas": "[—]",
        "Pigmentos": "[—]",
        "Área": "[—]",
        "Referência": "[ex.: Kuniyoshi, Suikoden]"
      }
    },
    {
      id: "p03",
      titulo: "[Cartaz / Capa]",
      categoria: "design",
      vertente: "Psicodelia 60s",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER]",
      ficha: {
        "Formato": "[A2]",
        "Técnica": "[serigrafia 4 cores]",
        "Papel": "[algodão 300g]",
        "Cliente": "[—]"
      }
    },
    {
      id: "p04",
      titulo: "[Identidade visual]",
      categoria: "design",
      vertente: "Direção de Arte",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER]",
      ficha: {
        "Entregáveis": "[logo, tipografia, aplicações]",
        "Cliente": "[—]"
      }
    },
    {
      id: "p05",
      titulo: "[Vaso totêmico]",
      categoria: "ceramica",
      vertente: "Cerâmica Escultórica",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER]",
      ficha: {
        "Argila": "[grés]",
        "Queima": "[1.260 °C]",
        "Esmalte": "[—]",
        "Dimensões": "[cm]"
      }
    },
    {
      id: "p06",
      titulo: "[Título da peça]",
      categoria: "tatuagem",
      vertente: "Psicodelia 60s",
      ano: "2026",
      imagem: "",
      descricao: "[A PREENCHER]",
      ficha: {
        "Agulhas": "[—]",
        "Pigmentos": "[—]",
        "Área": "[—]"
      }
    }
  ],

  loja: [
    { id: "s01", nome: "Flash 1/1: Adaga, Serpente & Rosa Old School", detalhe: "Tatuado apenas 1 vez", preco: 780, estoque: 1, selo: "1/1", imagem: "" },
    { id: "s02", nome: "Flash 1/1: Máscara Kitsune & Lótus Cósmica", detalhe: "Oriental Contemporâneo", preco: 890, estoque: 1, selo: "1/1", imagem: "" },
    { id: "s03", nome: "Serigrafia \"Cosmic Sound 1968\" (A2)", detalhe: "Design Gráfico · Tiragem 30 cópias", preco: 260, estoque: 30, selo: "/30", imagem: "" },
    { id: "s04", nome: "Print Fine Art \"Fênix Ukiyo-e\" (A3)", detalhe: "Papel Algodão 300g", preco: 190, estoque: 10, selo: "", imagem: "" },
    { id: "s05", nome: "Vaso Totem \"Olho do Sol\" em Grés", detalhe: "Cerâmica Escultórica · Peça Única", preco: 540, estoque: 1, selo: "ÚNICA", imagem: "" }
  ]
};
