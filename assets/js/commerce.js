/*
 * CAMADA DE COMÉRCIO
 * ------------------------------------------------------------
 * A sacola do site fala só com este objeto. Quando a plataforma for escolhida
 * (Shopify, Nuvemshop...), basta trocar a implementação de `checkout` aqui,
 * sem mexer no resto do site.
 *
 * Exemplo futuro (Shopify): criar um carrinho via Storefront API com os itens
 * e redirecionar para o checkout hospedado pela plataforma.
 */
window.Commerce = {
  /** true quando houver uma plataforma de pagamento conectada. */
  connected: false,

  /**
   * Recebe [{ id, nome, preco, quantidade }] e devolve uma Promise.
   * Nesta fase não existe plataforma conectada: a Promise é rejeitada com 'nao-configurado'
   * e nenhum pedido é criado.
   */
  checkout: function (items) {
    return Promise.reject(new Error('nao-configurado'));
  }
};
