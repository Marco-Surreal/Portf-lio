(function () {
  'use strict';

  var DATA = window.SITE_DATA || { config: {}, produtos: [], trabalhos: [], flashes: [] };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CART_KEY = 'marcosurreal:sacola';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  function esc(str) {
    return String(str == null ? '' : str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /** Foto real se existir, senão placeholder hachurado. */
  function media(src, label) {
    return src
      ? '<img src="' + esc(src) + '" alt="' + esc(label) + '" loading="lazy" />'
      : '<div class="ph" data-label="' + esc(label) + '"></div>';
  }

  /* ---------- Bloqueio de scroll compartilhado ---------- */
  var locks = 0;
  function lock(on) {
    locks = Math.max(0, locks + (on ? 1 : -1));
    document.body.classList.toggle('is-locked', locks > 0);
  }

  /* ---------- Barra do topo: marca o destino da seção visível ---------- */
  var navLinks = $$('.nav-links a');
  var navTargets = navLinks.map(function (a) { return $(a.getAttribute('href')); });
  function updateCurrent() {
    var line = window.innerHeight * 0.35, current = null;
    navTargets.forEach(function (sec, i) {
      var r = sec.getBoundingClientRect();
      if (r.top <= line && r.bottom > line && !current) current = navLinks[i];
    });
    navLinks.forEach(function (a) {
      if (a === current) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }

  var heroBig = $('#hero-logo');

  /* Imagens do topo: posição da Cerâmica em relação à imagem principal e à bio.
     Mede sem transformações (offsetLeft/offsetTop). No celular as imagens ficam embaixo do texto. */
  var heroHold = $('#hero-image');
  var sideBySide = window.matchMedia('(min-width: 641px)');
  function absLeft(el) { var x = 0; while (el) { x += el.offsetLeft; el = el.offsetParent; } return x; }
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function placeHeroImages() {
    if (!heroHold) return;
    var b = $('.hero-layer--b', heroHold);
    b.style.left = ''; b.style.top = ''; b.style.bottom = '';
    if (!sideBySide.matches) return;
    // A Cerâmica acompanha a principal: fica até 50% da largura para a esquerda dela,
    // mas nunca por cima da bio (aí ela chega mais perto da principal).
    var W = heroHold.offsetWidth, holdLeft = absLeft(heroHold), holdTop = absTop(heroHold);
    var bLeft = -0.5 * W;
    var intro = $('.hero-intro');
    if (intro) bLeft = Math.max(bLeft, absLeft(intro) + intro.offsetWidth + 16 - holdLeft);
    b.style.left = Math.round(bLeft) + 'px';
    // Na altura: passa um pouco para baixo da principal, na mesma medida em que o
    // Ateliê / Retrato passa para cima (6% da altura do bloco). Sem sair da seção embaixo.
    var bTop = heroHold.offsetHeight * 1.06 - b.offsetHeight;
    var bMax = $('.hero').offsetHeight - 24 - b.offsetHeight - holdTop;
    bTop = Math.round(Math.min(bTop, bMax));
    b.style.top = bTop + 'px'; b.style.bottom = 'auto';
  }
  function layoutHero() { placeHeroImages(); }
  layoutHero();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHero);
  window.addEventListener('resize', layoutHero);

  /* ---------- Hero reveal ---------- */
  window.requestAnimationFrame(function () {
    setTimeout(function () { document.body.classList.add('is-loaded'); }, 80);
  });

  /* ---------- Logo: os ecos sobem do túnel de novo quando o mouse passa ----------
     A entrada inicial é só CSS (.is-loaded). Aqui o eco é reiniciado tirando e recolocando a classe. */
  if (heroBig && !reduceMotion) {
    var echoes = $$('.hero-logo__echo', heroBig);
    var lastEcho = echoes[echoes.length - 1];
    var echoBusy = true; // a entrada já toca os ecos
    if (lastEcho) lastEcho.addEventListener('animationend', function () { echoBusy = false; });
    heroBig.addEventListener('mouseenter', function () {
      if (echoBusy || !lastEcho) return;
      echoBusy = true;
      heroBig.classList.remove('is-echo');
      void heroBig.offsetWidth; // força o navegador a reiniciar a animação
      heroBig.classList.add('is-echo');
    });
  }

  /* ---------- Movimento ligado ao scroll e ao mouse (coreografia do Alien) ----------
   * Valores tirados das interações do template (webflow.js):
   *  - "Hero Animation": com o progresso da seção, a linha vertical cresce 0→100% e o bloco
   *    de imagens anda até (-110px, 150px). Suavização 81 → lerp 0.19.
   *  - "Project Look At Mouse": o card gira até ±15° nos eixos X e Y. Suavização 93 → lerp 0.07.
   * O deslocamento do bloco de imagens só roda no desktop (≥ 992px), como no original.
   * Além disso, cada imagem com data-depth acompanha o mouse em profundidade própria,
   * para as camadas deslizarem umas sobre as outras. */
  var hero = $('.hero');
  var blockFill = $('.block-line__fill');
  var heroHolder = $('#hero-image');
  var heroLayers = $$('.hero-layer');
  var desktop = window.matchMedia('(min-width: 992px)');

  var mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  var heroP = progressOf(hero);
  var cards = [];   // estados dos cards em movimento
  var drifts = [];  // fotos das seções que acompanham o mouse (preenchido depois de montar as grades)
  var running = false;

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  /** 0 quando a seção começa a entrar por baixo, 1 quando termina de sair por cima. */
  function progressOf(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp01((vh - r.top) / (vh + r.height));
  }
  function near(a, b, eps) { return Math.abs(a - b) < eps; }

  /* A barra do topo fica escura quando passa sobre uma seção escura */
  var DARK = '.theme-dark, .shop, .footer, .ornament-band--dark, .ornament-band--forest';
  var navH = $('.navbar').offsetHeight;
  function updateNav() {
    var el = document.elementFromPoint(window.innerWidth / 2, navH + 2);
    document.body.classList.toggle('nav-dark', !!(el && el.closest(DARK)));
  }

  function render() {
    var settled = true;
    updateNav();
    updateCurrent();
    var hp = progressOf(hero);
    heroP += (hp - heroP) * 0.19;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    if (!near(hp, heroP, 0.0005) || !near(mouse.tx, mouse.x, 0.0005) || !near(mouse.ty, mouse.y, 0.0005)) settled = false;

    blockFill.style.height = (heroP * 100).toFixed(2) + '%';

    if (!reduceMotion) {
      var big = desktop.matches;
      // Desconta o ponto de partida (p0 = topo da página) para as imagens não começarem
      // empurradas para baixo e cortadas; elas descem a partir dali conforme a rolagem.
      var p0 = window.innerHeight / (window.innerHeight + hero.offsetHeight);
      heroHolder.style.transform = big ? 'translate3d(' + (-110 * (heroP - p0)).toFixed(2) + 'px,' + (150 * (heroP - p0)).toFixed(2) + 'px,0)' : '';
      heroLayers.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = 'translate3d(' + (mouse.x * 11 * d).toFixed(2) + 'px,' + (mouse.y * 8 * d).toFixed(2) + 'px,0)';
      });
      drifts.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = 'translate3d(' + (mouse.x * 11 * d).toFixed(2) + 'px,' + (mouse.y * 8 * d).toFixed(2) + 'px,0)';
      });
      cards.forEach(function (c) {
        c.rx += (c.tgx - c.rx) * 0.07;
        c.ry += (c.tgy - c.ry) * 0.07;
        c.lift += (c.tlift - c.lift) * 0.22;   // o Alien sobe o card com transition de 0.3s
        c.el.style.transform = 'translateY(' + c.lift.toFixed(2) + 'px) rotateX(' + c.rx.toFixed(2) + 'deg) rotateY(' + c.ry.toFixed(2) + 'deg)';
        if (!near(c.tgx, c.rx, 0.01) || !near(c.tgy, c.ry, 0.01) || !near(c.tlift, c.lift, 0.05)) settled = false;
      });
    }

    if (settled) running = false; else window.requestAnimationFrame(render);
  }
  function wake() { if (!running) { running = true; window.requestAnimationFrame(render); } }
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  if (!reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
      wake();
    }, { passive: true });
  }
  wake();

  /* ---------- Inclinação 3D + brilho de vidro ---------- */
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function bindTilt(el) {
    if (reduceMotion || !canHover || el._tilt) return;
    el._tilt = true;
    var zone = el.closest('.card, .product') || el;   // nos cards o botão de clique cobre a imagem
    zone.addEventListener('pointerenter', function () { el.classList.add('is-hover'); el.style.setProperty('--s', '1.035'); });
    zone.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
      var py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
      el.style.setProperty('--ry', ((px - 0.5) * 14).toFixed(2) + 'deg');
      el.style.setProperty('--rx', ((0.5 - py) * 11).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    zone.addEventListener('pointerleave', function () {
      el.classList.remove('is-hover');
      ['--rx', '--ry', '--s'].forEach(function (p) { el.style.removeProperty(p); });
    });
  }

  /** Cards do portfólio: giro de ±15° seguindo o mouse + subida de 10px + brilho de vidro na imagem. */
  function bindCard(card) {
    if (reduceMotion || !canHover) return;
    var item = $('.card-item', card), glass = $('.glass', card);
    var c = { el: item, rx: 0, ry: 0, tgx: 0, tgy: 0, lift: 0, tlift: 0 };
    cards.push(c);
    card.addEventListener('pointerenter', function () { c.tlift = -10; glass.classList.add('is-hover'); wake(); });
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var px = clamp01((e.clientX - r.left) / r.width), py = clamp01((e.clientY - r.top) / r.height);
      c.tgy = (px - 0.5) * 30;    // -15° a 15°
      c.tgx = (0.5 - py) * 30;
      var m = glass.getBoundingClientRect();
      glass.style.setProperty('--mx', (clamp01((e.clientX - m.left) / m.width) * 100).toFixed(1) + '%');
      glass.style.setProperty('--my', (clamp01((e.clientY - m.top) / m.height) * 100).toFixed(1) + '%');
      wake();
    });
    card.addEventListener('pointerleave', function () {
      c.tgx = 0; c.tgy = 0; c.tlift = 0;   // volta ao repouso (restingState 50 no Alien)
      glass.classList.remove('is-hover');
      wake();
    });
  }

  /* ---------- Textos e links vindos de data.js ---------- */
  var CFG = DATA.config || {};
  $$('[data-text]').forEach(function (el) { el.textContent = CFG[el.getAttribute('data-text')] || ''; });
  // lista de parágrafos (ex.: bio da abertura)
  $$('[data-paras]').forEach(function (el) {
    (CFG[el.getAttribute('data-paras')] || []).forEach(function (t) { var p = document.createElement('p'); p.textContent = t; el.appendChild(p); });
  });

  function waLink(text) {
    return 'https://wa.me/' + CFG.whatsapp + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  // Só entram links que existem de verdade: nada de "#" quebrado
  var socials = [
    CFG.instagram && { href: CFG.instagram, label: '#INSTAGRAM' },
    CFG.behance && { href: CFG.behance, label: '#BEHANCE' },
    CFG.spotify && { href: CFG.spotify, label: '#SPOTIFY' },
    CFG.pinterest && { href: CFG.pinterest, label: '#PINTEREST' }
  ].filter(Boolean);
  var contacts = [
    CFG.email && { href: 'mailto:' + CFG.email, label: CFG.email },
    CFG.whatsapp && { href: waLink(''), label: 'WhatsApp ' + fmtPhone(CFG.whatsapp) }
  ].filter(Boolean);
  // '5562982869136' → '(62) 98286-9136'
  function fmtPhone(n) {
    var m = String(n).replace(/\D/g, '').replace(/^55/, '').match(/^(\d{2})(\d{4,5})(\d{4})$/);
    return m ? '(' + m[1] + ') ' + m[2] + '-' + m[3] : '';
  }
  function linkHTML(l, li) {
    var ext = /^https?:/.test(l.href) ? ' target="_blank" rel="noopener"' : '';
    var a = '<a href="' + esc(l.href) + '"' + ext + '>' + esc(l.label) + '</a>';
    return li ? '<li>' + a + '</li>' : a;
  }
  $$('[data-social]').forEach(function (el) {
    var li = el.tagName === 'UL';
    el.innerHTML = socials.concat(li ? contacts : []).map(function (l) { return linkHTML(l, li); }).join('');
  });
  $$('[data-contact-links]').forEach(function (el) {
    el.innerHTML = contacts.map(function (l) { return linkHTML(l, false); }).join('');
  });

  /* ---------- Modal genérico (ficha de trabalho ou detalhes de produto) ---------- */
  var modal = $('#modal');
  var lastFocus = null;
  function openModal(o) {
    $('#modal-media').innerHTML = media(o.imagem, o.titulo);
    $('#modal-cat').textContent = o.cat;
    $('#modal-title').textContent = o.titulo;
    $('#modal-desc').textContent = o.descricao || '';
    var spec = o.spec || {};
    $('#modal-spec').innerHTML = Object.keys(spec).filter(function (k) { return spec[k]; }).map(function (k) {
      return '<dt>' + esc(k) + '</dt><dd>' + esc(spec[k]) + '</dd>';
    }).join('');
    $('#modal-actions').innerHTML = o.actions || '';
    lastFocus = document.activeElement;
    modal.hidden = false;
    lock(true);
    $('.modal-close', modal).focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    lock(false);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', closeModal); });

  /* ---------- Loja: dados e textos de produto ---------- */
  var PROD_CAT = { camiseta: 'Camiseta', print: 'Print', adesivo: 'Adesivo', ceramica: 'Cerâmica', objeto: 'Objeto' };
  var PROD_CAT_PL = { camiseta: 'Camisetas', print: 'Prints', adesivo: 'Adesivos', ceramica: 'Cerâmicas', objeto: 'Objetos' };
  var DISP = { disponivel: 'Disponível', esgotado: 'Esgotado', 'sob-encomenda': 'Sob encomenda' };
  var products = {};
  (DATA.produtos || []).forEach(function (p) { products[p.id] = p; });

  function canBuy(p) { return p.preco != null && p.disponibilidade === 'disponivel' && p.estoque > 0; }
  function priceText(p) { return p.preco != null ? brl.format(p.preco) : 'Preço a definir'; }

  function openProduct(id) {
    var p = products[id];
    if (!p) return;
    var spec = Object.assign({
      'Categoria': PROD_CAT[p.categoria] || p.categoria,
      'Edição': p.edicao,
      'Disponibilidade': DISP[p.disponibilidade] || p.disponibilidade,
      'Preço': priceText(p)
    }, p.detalhes || {});
    openModal({
      imagem: (p.imagens || [])[0], titulo: p.nome, descricao: p.descricao, spec: spec,
      cat: '#LOJA · ' + (PROD_CAT[p.categoria] || p.categoria).toUpperCase() + (p.demo ? ' · DEMO' : ''),
      actions: canBuy(p) ? '<button class="btn btn--primary" data-add="' + esc(p.id) + '">+ Sacola</button>' : ''
    });
  }

  /* ---------- [02] Loja: produtos em destaque ---------- */
  // Vitrine: grade de 6 produtos (3 × 2). Se houver mais, ela desliza para o lado (setas, arrastar ou rolar).
  // A mesma animação das 3 fotos da primeira página, em todas as fotos do site:
  // 1) flutuação (keyframes "float", 8s/10s/12s com atrasos diferentes, como .hero-float);
  // 2) cada foto acompanha o mouse com profundidade própria (data-depth), como as camadas do hero.
  // Ficam em invólucros próprios (.drift > .floaty), por isso não cancelam a inclinação,
  // o brilho de vidro e o giro dos cards, que estão na imagem e no card.
  var FLOAT = [['8s', '0s', 1], ['10s', '-3s', 0.6], ['12s', '-6s', -0.8]];
  var floatN = 0;
  function floatOpen() { var f = FLOAT[floatN++ % 3];
    return '<div class="drift" data-depth="' + f[2] + '"><div class="floaty" style="animation-duration:' + f[0] + ';animation-delay:' + f[1] + '">'; }

  // Escamas do fundo alinhadas à página inteira: cada seção/faixa desloca a textura pela sua posição,
  // então o padrão passa contínuo de uma seção para a outra (só a cor muda).
  function alignTexture() {
    $$('.seigaiha').forEach(function (el) {
      var top = el.getBoundingClientRect().top + window.scrollY;
      el.style.setProperty('--sy', (-(top % 24)).toFixed(2) + 'px');
    });
  }
  alignTexture();
  window.addEventListener('load', alignTexture);
  window.addEventListener('resize', alignTexture);
  if (window.ResizeObserver) new ResizeObserver(alignTexture).observe(document.body);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(alignTexture);

  var shopGrid = $('#shop-grid');
  var vitrine = (DATA.produtos || []).filter(function (p) { return p.destaque; });
  shopGrid.innerHTML = vitrine.map(function (p) {
    var selo = p.edicao && /única/i.test(p.edicao) ? 'ÚNICA' : '';
    // categoria (e edição) passam numa faixa sobre a imagem, igual ao "ver detalhes" dos Trabalhos
    var tag = '<span>' + esc((PROD_CAT[p.categoria] || p.categoria) + (p.edicao ? ' · ' + p.edicao : '')) + ' ✦</span>', strip = '';
    for (var i = 0; i < 6; i++) strip += tag;
    return '' +
      '<article class="product" data-cat="' + esc(p.categoria) + '" data-reveal>' +
        (selo ? '<span class="hanko">' + selo + '</span>' : '') +
        (p.demo ? '<span class="demo-tag">DEMO</span>' : '') +
        // clicar na imagem abre os detalhes do produto
        floatOpen() + '<div class="product-media tilt" data-tilt data-view="' + esc(p.id) + '" role="button" tabindex="0" aria-label="Ver detalhes: ' + esc(p.nome) + '">' + media((p.imagens || [])[0], p.nome) +
          '<div class="view-project" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div></div></div>' +
        '</div></div></div>' +
        '<h3>' + esc(p.nome) + '</h3>' +
        '<div class="product-foot">' +
          '<span class="price">' + priceText(p) + '</span>' +
          '<span class="product-btns">' +
            (canBuy(p) ? '<button class="btn btn--small" data-add="' + esc(p.id) + '" aria-label="Adicionar à sacola: ' + esc(p.nome) + '">+ Sacola</button>' : '') +
          '</span>' +
        '</div>' +
      '</article>';
  }).join('');

  // Setas e arrastar com o mouse. As setas só aparecem quando há mais produtos do que cabem na tela.
  var shopPrev = $('#shop-prev'), shopNext = $('#shop-next'), shopNav = $('#shop-nav');
  function shopStep() { return shopGrid.clientWidth; }
  function updateShopNav() {
    var max = shopGrid.scrollWidth - shopGrid.clientWidth;
    shopNav.hidden = max <= 2;
    shopPrev.disabled = shopGrid.scrollLeft <= 2;
    shopNext.disabled = shopGrid.scrollLeft >= max - 2;
  }
  shopPrev.addEventListener('click', function () { shopGrid.scrollBy({ left: -shopStep(), behavior: 'smooth' }); });
  shopNext.addEventListener('click', function () { shopGrid.scrollBy({ left: shopStep(), behavior: 'smooth' }); });
  shopGrid.addEventListener('scroll', updateShopNav, { passive: true });
  window.addEventListener('resize', updateShopNav);
  var drag = null;
  shopGrid.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button, a')) return; // no toque, o celular já rola sozinho
    drag = { x: e.clientX, left: shopGrid.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; shopGrid.classList.add('is-dragging'); }
    if (drag.moved) { shopGrid.scrollLeft = drag.left - dx; e.preventDefault(); }
  });
  window.addEventListener('pointerup', function () {
    if (!drag) return;
    var moved = drag.moved; drag = null;
    shopGrid.classList.remove('is-dragging');
    if (!moved) return;
    // ao soltar, encaixa na coluna mais próxima
    var card = $('.product:not([hidden])', shopGrid);
    var col = card ? card.offsetWidth + parseFloat(getComputedStyle(shopGrid).columnGap || 0) : shopStep();
    shopGrid.scrollTo({ left: Math.round(shopGrid.scrollLeft / col) * col, behavior: 'smooth' });
  });
  shopGrid.addEventListener('dragstart', function (e) { e.preventDefault(); });
  updateShopNav();

  // Botões de categoria: só aparecem as categorias que existem na vitrine, e só se houver mais de uma
  var shopCats = vitrine.map(function (p) { return p.categoria; }).filter(function (c, i, a) { return a.indexOf(c) === i; });
  var shopFilters = $('#shop-filters');
  if (shopCats.length > 1) {
    shopFilters.innerHTML = ['todos'].concat(shopCats).map(function (c, i) {
      return '<button class="filter' + (i ? '' : ' is-active') + '" data-shop-filter="' + esc(c) + '" aria-pressed="' + (i ? 'false' : 'true') + '">' + esc(c === 'todos' ? 'Todos' : (PROD_CAT_PL[c] || c)) + '</button>';
    }).join('');
  } else {
    shopFilters.hidden = true;
  }
  shopFilters.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-shop-filter]');
    if (!btn) return;
    var f = btn.getAttribute('data-shop-filter'), shown = 0;
    $$('.filter', shopFilters).forEach(function (b) {
      b.classList.toggle('is-active', b === btn);
      b.setAttribute('aria-pressed', String(b === btn));
    });
    $$('.product', shopGrid).forEach(function (card) {
      var show = f === 'todos' || card.getAttribute('data-cat') === f;
      card.hidden = !show;
      if (show) { shown++; card.classList.add('is-visible'); }
    });
    shopGrid.scrollLeft = 0;
    updateShopNav();
    $('#shop-empty').hidden = shown > 0;
  });

  /* ---------- [03] Trabalhos selecionados ---------- */
  var CATEGORIAS = { tatuagem: 'Tatuagem', design: 'Design', ceramica: 'Cerâmica' };
  var works = {};
  var grid = $('#portfolio-grid');
  var selected = (DATA.trabalhos || []).filter(function (t) { return t.destaque; }).slice(0, 6);
  grid.innerHTML = selected.map(function (p) {
    works[p.id] = p;
    var m = media(p.imagem, p.titulo);
    var strip = '';
    for (var i = 0; i < 6; i++) strip += '<span>VER DETALHES ✦</span>';
    return '' +
      '<article class="card" data-cat="' + esc(p.categoria) + '" data-reveal>' +
        '<div class="card-item">' +
          floatOpen() + '<div class="card-media glass">' + m +
            '<div class="view-project" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div></div></div>' +
          '</div></div></div>' +
          '<div class="card-info">' +
            '<div class="card-title-wrap"><h3 class="card-title">' + esc(p.titulo) + '</h3></div>' +
            '<span class="card-meta">' + esc(CATEGORIAS[p.categoria] || p.categoria) + (p.ano ? ' · ' + esc(p.ano) : '') + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="card-open" data-id="' + esc(p.id) + '" aria-label="Ver detalhes: ' + esc(p.titulo) + '"></button>' +
      '</article>';
  }).join('');

  $$('#trabalhos .filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter'), shown = 0;
      $$('#trabalhos .filter').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      $$('.card', grid).forEach(function (card) {
        var show = f === 'todos' || card.getAttribute('data-cat') === f;
        card.hidden = !show;
        if (show) { shown++; card.classList.add('is-visible'); }
      });
      $('#portfolio-empty').hidden = shown > 0;
    });
  });

  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.card-open');
    if (!btn) return;
    var p = works[btn.getAttribute('data-id')];
    var prod = p.produtoId && products[p.produtoId];
    var actions = prod ? '<p class="mono-small">Disponível na loja · ' + priceText(prod) + '</p><button class="btn btn--primary" data-view="' + esc(prod.id) + '">Ver na loja</button>' : '';
    openModal({
      imagem: p.imagem, titulo: p.titulo, descricao: p.descricao,
      cat: '#' + (CATEGORIAS[p.categoria] || p.categoria).toUpperCase(),
      spec: Object.assign({ 'Ano': p.ano }, p.ficha || {}), actions: actions
    });
  });

  /* ---------- [04] Flash Book ---------- */
  var ESTADO = { disponivel: 'Disponível', reservado: 'Reservado', tatuado: 'Tatuado' };
  var flashes = {};
  /* Flash book em formato de livro: capa, folhas que viram pela lombada e contracapa.
     Cada página mostra uma arte inteira e o nome dela embaixo, e só isso.
     No computador o livro abre em duas páginas (frente da folha = direita, verso = esquerda da dupla seguinte).
     No celular aparece uma página por vez: só a frente das folhas tem arte, e a folha vira para fora da tela.
     Clique na página da direita para avançar e na da esquerda para voltar; setas, teclado e arrastar também. */
  var fbook = $('#flash-grid');
  var mobileBook = window.matchMedia('(max-width: 700px)');
  var fbSheets = [], fbAt = 0, fbMax = 0, fbSingle = false;
  function flashPage(f) {
    flashes[f.id] = f;
    return '<figure class="fb-art">' +
        '<div class="fb-art__img">' + media(f.imagem, f.imagem ? f.nome : f.id) + '</div>' +
        '<figcaption class="fb-art__name">' + esc(f.nome) + '</figcaption>' +
      '</figure>';
  }
  function buildBook() {
    var list = DATA.flashes || [], pages = [];
    fbSingle = mobileBook.matches;
    var cover = '<div class="fb-cover"><span class="fb-cover__frame"></span><p class="fb-cover__name">Marco Surreal</p><p class="fb-cover__title">Flash<br>Book</p><span class="fb-cover__hint">Abrir ✦</span></div>';
    var back = '<div class="fb-cover fb-cover--back"><span class="fb-cover__frame"></span><p class="fb-cover__name">Marco Surreal</p></div>';
    var blank = '<div class="fb-blank"></div>';
    if (fbSingle) {
      // uma página por vez: [frente, verso] = [arte, em branco]; a última folha (que não vira) é a contracapa
      pages.push(cover, blank);
      list.forEach(function (f) { pages.push(flashPage(f), blank); });
      pages.push(back, blank);
    } else {
      pages.push(cover);
      list.forEach(function (f) { pages.push(flashPage(f)); });
      if (pages.length % 2 === 0) pages.push(blank);
      pages.push(back);
    }
    var html = '', n = pages.length / 2;
    for (var sIdx = 0; sIdx < n; sIdx++) {
      html += '<div class="fb-leaf" style="z-index:' + (n - sIdx) + '">' +
        '<div class="fb-page fb-page--front">' + pages[2 * sIdx] + '</div>' +
        '<div class="fb-page fb-page--back">' + pages[2 * sIdx + 1] + '</div></div>';
    }
    fbook.innerHTML = '<div class="fb-stage' + (fbSingle ? ' is-single' : '') + '" tabindex="0" aria-label="Flash book: use as setas para folhear"><div class="fb-book is-closed" id="fb-book">' + html + '</div></div>' +
      '<div class="fb-nav"><button class="shop-arrow" id="fb-prev" aria-label="Página anterior"><svg class="arw" viewBox="0 0 20 12" aria-hidden="true"><path d="M19 6H2M7 1 2 6l5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button><span class="mono-small" id="fb-label"></span><button class="shop-arrow" id="fb-next" aria-label="Próxima página"><svg class="arw" viewBox="0 0 20 12" aria-hidden="true"><path d="M1 6h17M13 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg></button></div>';
    fbSheets = $$('.fb-leaf', fbook);
    fbMax = fbSingle ? fbSheets.length - 1 : fbSheets.length;
    fbAt = 0;
    fbShow(true);
    $('#fb-prev').addEventListener('click', function () { fbGo(-1); });
    $('#fb-next').addEventListener('click', function () { fbGo(1); });
  }
  function fbShow(instant) {
    var n = fbSheets.length, book = $('#fb-book'), total = (DATA.flashes || []).length;
    fbSheets.forEach(function (sh, i) {
      var flip = i < fbAt;
      if (flip !== sh.classList.contains('is-flipped')) {
        // a folha que está virando fica por cima das outras durante o giro
        sh.style.zIndex = 100;
        clearTimeout(sh._t); sh._t = setTimeout(function () { sh.style.zIndex = sh.classList.contains('is-flipped') ? i + 1 : n - i; }, instant || reduceMotion ? 0 : 900);
      } else sh.style.zIndex = flip ? i + 1 : n - i;
      sh.classList.toggle('is-flipped', flip);
    });
    book.classList.toggle('is-closed', fbAt === 0);
    book.classList.toggle('is-end', !fbSingle && fbAt === n);
    $('#fb-prev').disabled = fbAt === 0; $('#fb-next').disabled = fbAt === fbMax;
    var label;
    if (fbAt === 0) label = 'Capa';
    else if (fbAt === fbMax) label = 'Contracapa';
    else if (fbSingle) label = fbAt + ' de ' + total;
    else { var a = 2 * fbAt - 1, b = Math.min(2 * fbAt, total); label = (a === b ? a : a + '–' + b) + ' de ' + total; }
    $('#fb-label').textContent = label;
  }
  function fbGo(d) { var t = Math.max(0, Math.min(fbMax, fbAt + d)); if (t !== fbAt) { fbAt = t; fbShow(); } }
  buildBook();
  if (mobileBook.addEventListener) mobileBook.addEventListener('change', buildBook);
  fbook.addEventListener('click', function (e) {
    if (fbook._swiped) { fbook._swiped = false; return; }
    if (e.target.closest('[data-flash], .fb-nav, .btn')) return;
    var pg = e.target.closest('.fb-page'); if (!pg) return;
    fbGo(pg.classList.contains('fb-page--front') ? 1 : -1);
  });
  fbook.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') { fbGo(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { fbGo(-1); e.preventDefault(); }
  });
  var fbX = null;
  fbook.addEventListener('pointerdown', function (e) { fbX = e.clientX; });
  fbook.addEventListener('pointerup', function (e) { if (fbX != null && Math.abs(e.clientX - fbX) > 50) { fbook._swiped = true; fbGo(e.clientX < fbX ? 1 : -1); } fbX = null; });

  /* ---------- [05] Contato ---------- */
  var form = $('#contact-form');
  var fAssunto = $('#f-assunto'), fMsg = $('#f-mensagem'), fFlash = $('#f-flash');
  var ASSUNTO = { tatuagem: 'Sessão de tatuagem', ceramica: 'Cerâmica sob encomenda', outro: 'Outro assunto' };
  var via = CFG.whatsapp ? 'whatsapp' : (CFG.email ? 'email' : '');
  $('#contact-submit').textContent = via === 'whatsapp' ? 'Enviar pelo WhatsApp' : via === 'email' ? 'Enviar por e-mail' : 'Envio indisponível';
  $('#contact-submit').disabled = !via;
  $('#contact-hint').textContent = via === 'whatsapp'
    ? 'Abre o WhatsApp com a mensagem pronta.'
    : via === 'email' ? 'Abre seu aplicativo de e-mail com a mensagem pronta para ' + CFG.email + '.'
    : 'Envio ainda não configurado.';

  /** Preenche o formulário a partir de um flash (clique aqui ou ?assunto=tatuagem&flash=F01 vindo de outra página). */
  function prefillFlash(id, scroll) {
    var f = flashes[id] || (DATA.flashes || []).filter(function (x) { return x.id === id; })[0];
    if (!f) return;
    fAssunto.value = 'tatuagem';
    fFlash.value = f.id;
    var line = 'Tenho interesse no flash ' + f.id + ' (' + f.nome + ').';
    if (fMsg.value.indexOf(f.id) === -1) fMsg.value = fMsg.value.trim() ? line + '\n' + fMsg.value : line;
    if (scroll) {
      $('#contato').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(function () { $('#f-nome').focus({ preventScroll: true }); }, reduceMotion ? 0 : 700);
    }
  }
  $('#flash-grid').addEventListener('click', function (e) {
    var b = e.target.closest('[data-flash]');
    if (b) prefillFlash(b.getAttribute('data-flash'), true);
  });
  (function fromURL() {
    var q = new URLSearchParams(window.location.search);
    if (q.get('flash')) prefillFlash(q.get('flash'), false);
    else if (ASSUNTO[q.get('assunto')]) fAssunto.value = q.get('assunto');
  })();

  var RULES = {
    nome: function (v) { return v ? '' : 'Informe seu nome.'; },
    contato: function (v) {
      if (!v) return 'Informe um e-mail ou WhatsApp.';
      var mail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), phone = v.replace(/\D/g, '').length >= 10;
      return mail || phone ? '' : 'Use um e-mail válido ou um telefone com DDD.';
    },
    assunto: function (v) { return v ? '' : 'Escolha um assunto.'; },
    mensagem: function (v) { return v ? '' : 'Escreva uma mensagem.'; }
  };
  function validate(name) {
    var input = form.elements[name], msg = RULES[name](input.value.trim());
    var field = input.closest('.field');
    field.classList.toggle('has-error', !!msg);
    input.setAttribute('aria-invalid', String(!!msg));
    var err = $('#e-' + name);
    err.textContent = msg;
    if (msg) input.setAttribute('aria-describedby', 'e-' + name); else input.removeAttribute('aria-describedby');
    return !msg;
  }
  Object.keys(RULES).forEach(function (n) {
    form.elements[n].addEventListener('blur', function () { if (this.value.trim()) validate(n); });
    form.elements[n].addEventListener('input', function () { if (this.closest('.field').classList.contains('has-error')) validate(n); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('#form-status');
    var bad = Object.keys(RULES).filter(function (n) { return !validate(n); });
    if (bad.length) {
      status.className = 'form-status err';
      status.textContent = 'Revise os campos destacados.';
      form.elements[bad[0]].focus();
      return;
    }
    var d = {};
    new FormData(form).forEach(function (v, k) { d[k] = String(v).trim(); });
    var assunto = ASSUNTO[d.assunto] + (d.flash ? ' · Flash ' + d.flash : '');
    var texto = 'Olá, Marco! Sou ' + d.nome + '.\n\nAssunto: ' + assunto + '\n\n' + d.mensagem + '\n\nContato: ' + d.contato;
    // O site não envia sozinho: abre o WhatsApp ou o e-mail com tudo preenchido.
    // A mensagem só chega quando a pessoa confirma o envio no aplicativo, e o aviso diz isso.
    if (via === 'whatsapp') {
      // Sem 'noopener' no terceiro argumento: com ele, window.open sempre devolve null
      // e a página atual também seria trocada. O opener é cortado logo em seguida.
      var w = window.open(waLink(texto), '_blank');
      if (w) w.opener = null; else window.location.href = waLink(texto);
    } else {
      window.location.href = 'mailto:' + CFG.email + '?subject=' + encodeURIComponent('[Site] ' + assunto) + '&body=' + encodeURIComponent(texto);
    }
    status.className = 'form-status ok';
    status.textContent = via === 'whatsapp'
      ? 'Abrimos o WhatsApp com sua mensagem. Para concluir, toque em enviar por lá.'
      : 'Abrimos seu e-mail com a mensagem pronta. Para concluir, envie por lá. Se nada abriu, escreva para ' + CFG.email + '.';
  });

  /* ---------- Sacola ---------- */
  var cart = loadCart();
  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY)) || {};
      var clean = {};
      Object.keys(raw).forEach(function (id) {
        var p = products[id];
        if (p && canBuy(p)) clean[id] = Math.min(p.estoque, Math.max(1, parseInt(raw[id], 10) || 1));
      });
      return clean;
    } catch (err) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (err) { /* modo privado */ }
  }

  var drawer = $('#cart-drawer');
  var drawerBackdrop = $('#drawer-backdrop');
  var bagBtn = $('#bag-toggle');
  $('#drawer-note').hidden = window.Commerce && window.Commerce.connected;

  function renderCart(bump) {
    var ids = Object.keys(cart);
    var list = $('#cart-list');
    var total = 0, count = 0;
    if (!ids.length) {
      list.innerHTML = '<li class="cart-empty">A sacola está vazia.</li>';
    } else {
      list.innerHTML = ids.map(function (id) {
        var p = products[id], q = cart[id];
        total += p.preco * q; count += q;
        return '' +
          '<li class="cart-item">' +
            '<div><h4>' + esc(p.nome) + '</h4><p class="mono-small">' + brl.format(p.preco) + (p.estoque === 1 ? ' · peça única' : '') + '</p></div>' +
            '<div class="qty">' +
              '<button data-dec="' + esc(id) + '" aria-label="Diminuir quantidade de ' + esc(p.nome) + '">−</button>' +
              '<span aria-live="polite">' + q + '</span>' +
              '<button data-inc="' + esc(id) + '" aria-label="Aumentar quantidade de ' + esc(p.nome) + '"' + (q >= p.estoque ? ' disabled' : '') + '>+</button>' +
            '</div>' +
          '</li>';
      }).join('');
    }
    $('#cart-total').textContent = brl.format(total);
    $('#bag-count').textContent = count;
    $('#checkout').disabled = !ids.length;
    if (bump) { bagBtn.classList.remove('bump'); void bagBtn.offsetWidth; bagBtn.classList.add('bump'); }
    saveCart();
  }
  function addToCart(id) {
    var p = products[id];
    if (!p || !canBuy(p)) return;
    cart[id] = Math.min(p.estoque, (cart[id] || 0) + 1);
    $('#cart-status').textContent = '';
    renderCart(true);
    closeModal();
    setDrawer(true);
  }

  // Botões de produto podem estar na loja ou dentro do modal
  document.addEventListener('click', function (e) {
    var add = e.target.closest('[data-add]');
    var view = e.target.closest('[data-view]');
    if (add) addToCart(add.getAttribute('data-add'));
    else if (view) openProduct(view.getAttribute('data-view'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var view = e.target.closest && e.target.closest('.product-media[data-view]');
    if (view) { e.preventDefault(); openProduct(view.getAttribute('data-view')); }
  });

  $('#cart-list').addEventListener('click', function (e) {
    var inc = e.target.closest('[data-inc]');
    var dec = e.target.closest('[data-dec]');
    if (inc) {
      var id = inc.getAttribute('data-inc');
      cart[id] = Math.min(products[id].estoque, cart[id] + 1);
    } else if (dec) {
      var d = dec.getAttribute('data-dec');
      cart[d] -= 1;
      if (cart[d] <= 0) delete cart[d];
    } else return;
    renderCart(true);
  });

  function setDrawer(open) {
    if (open === drawer.classList.contains('is-open')) return;
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    drawerBackdrop.hidden = !open;
    lock(open);
    if (open) $('#drawer-close').focus(); else bagBtn.focus();
  }
  bagBtn.addEventListener('click', function () { setDrawer(true); });
  $('#drawer-close').addEventListener('click', function () { setDrawer(false); });
  drawerBackdrop.addEventListener('click', function () { setDrawer(false); });

  $('#checkout').addEventListener('click', function () {
    var st = $('#cart-status');
    var items = Object.keys(cart).map(function (id) { return { id: id, nome: products[id].nome, preco: products[id].preco, quantidade: cart[id] }; });
    window.Commerce.checkout(items).catch(function () {
      // Sem plataforma conectada: nenhum pedido é criado e a sacola fica como está.
      st.className = 'form-status err';
      st.textContent = 'Demonstração: a loja ainda não está conectada a uma plataforma de pagamento. Nenhum pedido foi feito.';
    });
  });

  renderCart(false);

  /* ---------- Entrada dos elementos + linhas ---------- */
  $$('[data-tilt]').forEach(bindTilt);
  drifts = $$('.drift');
  $$('.card', grid).forEach(bindCard);
  var targets = $$('[data-reveal], .lines');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-visible');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) { io.observe(t); });
  } else {
    targets.forEach(function (t) { t.classList.add('is-visible'); });
  }

  /* ---------- Esc fecha camadas ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (drawer.classList.contains('is-open')) setDrawer(false);
  });

  $('#year').textContent = new Date().getFullYear();

})();
