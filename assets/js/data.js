/*
 * CONTEÚDO EDITÁVEL DO SITE — fonte única de dados
 * ------------------------------------------------------------
 * Edite aqui textos, contatos, produtos, trabalhos e flashes. Não é preciso mexer no HTML.
 *
 * imagem / imagens: caminho da foto (ex.: "assets/img/vaso-olho-do-sol.jpg").
 *                   Deixe "" (ou []) para mostrar o placeholder hachurado.
 * destaque: true  → aparece na página inicial.
 * demo: true      → dado de demonstração; mostra o selo "DEMO". Remova quando a informação for real.
 */
window.SITE_DATA = {
  /* ---------- Contato e redes ---------- */
  config: {
    nome: 'Marco Surreal',
    // Apresentação da abertura (texto provisório, resumido da bio do Marco; ele vai reescrever)
    apresentacao: 'Tatuador, designer e artista multidisciplinar. Com base na tatuagem tradicional e forte influência da psicodelia dos anos 60, do surrealismo e da op art, trabalha com cores vibrantes, distorções visuais e a mistura entre referências clássicas e contemporâneas.',
    email: 'omarcosurreal@gmail.com',
    // WhatsApp só com números, com DDI e DDD. Ex.: '5511999998888'.
    // Se ficar vazio, o formulário envia por e-mail e o link de WhatsApp fica oculto.
    whatsapp: '5562982869136',
    instagram: 'https://www.instagram.com/marcosurreal/',
    behance: 'https://www.behance.net/marcomachado3',
    spotify: 'https://open.spotify.com/user/tonikow',
    pinterest: 'https://br.pinterest.com/marcosurreal/'
  },

  /* ---------- Produtos (loja) ----------
   * categoria: "camiseta" | "print" | "adesivo" | "ceramica" | "objeto"
   * preco: número em reais, ou null para "Preço a definir" (sem botão de compra)
   * estoque: quantidade máxima na sacola (peça única = 1)
   * disponibilidade: "disponivel" | "esgotado" | "sob-encomenda"
   * edicao: texto curto opcional (ex.: "Peça única", "Tiragem de 30")
 * grande: true → este produto abre a vitrine da página inicial em tamanho grande (use em um só)
   * detalhes: pares "Campo": "Valor" (materiais, dimensões, acabamento...) */
  produtos: [
    {
      id: 'p-vaso-olho-do-sol', nome: 'Vaso Totem "Olho do Sol"', categoria: 'ceramica',
      preco: 540, estoque: 1, disponibilidade: 'disponivel', edicao: 'Peça única',
      destaque: true, demo: true, imagens: [],
      descricao: '[A PREENCHER: descrição da peça]',
      detalhes: { 'Material': '[grés]', 'Acabamento': '[esmalte]', 'Dimensões': '[cm]' }
    },
    {
      id: 'p-serigrafia-01', nome: '[Serigrafia — título] (A2)', categoria: 'print',
      preco: 260, estoque: 30, disponibilidade: 'disponivel', edicao: '[Tiragem de 30]',
      destaque: true, demo: true, imagens: [],
      descricao: '[A PREENCHER]',
      detalhes: { 'Técnica': '[serigrafia]', 'Papel': '[—]', 'Formato': 'A2' }
    },
    {
      id: 'p-print-01', nome: '[Print — título] (A3)', categoria: 'print',
      preco: 190, estoque: 10, disponibilidade: 'disponivel', edicao: '',
      destaque: true, demo: true, imagens: [],
      descricao: '[A PREENCHER]',
      detalhes: { 'Papel': '[—]', 'Formato': 'A3' }
    },
    {
      id: 'p-camiseta-01', nome: '[Camiseta — estampa]', categoria: 'camiseta',
      preco: null, estoque: 10, disponibilidade: 'disponivel', edicao: '',
      destaque: true, grande: true, demo: true, imagens: [],
      descricao: '[A PREENCHER]',
      detalhes: { 'Tamanhos': '[—]', 'Tecido': '[—]' }
    },
    {
      id: 'p-adesivo-01', nome: '[Adesivo — nome]', categoria: 'adesivo',
      preco: null, estoque: 50, disponibilidade: 'disponivel', edicao: '',
      destaque: true, demo: true, imagens: [],
      descricao: '[A PREENCHER]',
      detalhes: { 'Tamanho': '[cm]' }
    }
  ],

  /* ---------- Trabalhos (portfólio) ----------
   * categoria: "tatuagem" | "design" | "ceramica"
   * produtoId: opcional. Liga o trabalho a um produto da loja (preço e estoque ficam só no produto). */
  trabalhos: [
    { id: 't01', titulo: '[Título do trabalho]', categoria: 'tatuagem', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: { 'Área': '[—]' } },
    { id: 't02', titulo: '[Título do trabalho]', categoria: 'tatuagem', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: {} },
    { id: 't03', titulo: '[Cartaz / Capa]', categoria: 'design', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: { 'Formato': '[—]', 'Cliente': '[—]' } },
    { id: 't04', titulo: '[Identidade visual]', categoria: 'design', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: {} },
    { id: 't05', titulo: 'Vaso Totem "Olho do Sol"', categoria: 'ceramica', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: {}, produtoId: 'p-vaso-olho-do-sol' },
    { id: 't06', titulo: '[Título do trabalho]', categoria: 'ceramica', ano: '', imagem: '', destaque: true,
      descricao: '[A PREENCHER]', ficha: {} }
  ],

  /* ---------- Flashes (desenhos para tatuagem) ----------
   * estado: "disponivel" | "reservado" | "tatuado"
   * tamanho, preco e exclusivo são opcionais. Não são vendidos pela sacola. */
  flashes: [
    { id: 'F01', nome: '[Nome do flash]', estado: 'disponivel', tamanho: '', preco: null, exclusivo: false, imagem: '', destaque: true, demo: true },
    { id: 'F02', nome: '[Nome do flash]', estado: 'disponivel', tamanho: '', preco: null, exclusivo: false, imagem: '', destaque: true, demo: true },
    { id: 'F03', nome: '[Nome do flash]', estado: 'reservado', tamanho: '', preco: null, exclusivo: false, imagem: '', destaque: true, demo: true },
    { id: 'F04', nome: '[Nome do flash]', estado: 'tatuado', tamanho: '', preco: null, exclusivo: false, imagem: '', destaque: true, demo: true }
  ]
};
