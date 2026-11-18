(function () {
  'use strict';

  var DATA = window.SITE_DATA || { portfolio: [], loja: [] };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CART_KEY = 'marcosurreal:sacola';
  var CATEGORIAS = { tatuagem: 'Tatuagem', design: 'Design', ceramica: 'Cerâmica' };

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

  /* ---------- Menu fullscreen ---------- */
  var menuBtn = $('#Menu');
  var menu = $('#nav-menu');
  function setMenu(open) {
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.textContent = open ? '#FECHAR' : '#MENU';
    document.body.classList.toggle('menu-open', open);
    lock(open);
  }
  menuBtn.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function () { if (menu.classList.contains('is-open')) setMenu(false); });
  });

  /* Links ainda sem destino */
  $$('[data-placeholder]').forEach(function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); });
    a.title = 'Link a preencher';
  });

  /* ---------- Hero reveal ---------- */
  window.requestAnimationFrame(function () {
    setTimeout(function () { document.body.classList.add('is-loaded'); }, 80);
  });

  /* ---------- Movimento ligado ao scroll e ao mouse (coreografia do Alien) ----------
   * Valores tirados das interações do template (webflow.js):
   *  - "Hero Animation": com o progresso da seção, a linha vertical cresce 0→100% e o bloco
   *    de imagens anda até (-110px, 150px). Suavização 81 → lerp 0.19.
   *  - "About Me Section": a foto principal desce 355px, a menor anda (80px, 126px) e o texto
   *    desce 492px; as linhas chegam a 100% em 35% e 37% do progresso. Suavização 92 → lerp 0.08.
   *  - "Project Look At Mouse": o card gira até ±15° nos eixos X e Y. Suavização 93 → lerp 0.07.
   * Os dois primeiros só rodam no desktop (≥ 992px), como no original.
   * Além disso, cada imagem com data-depth acompanha o mouse em profundidade própria,
   * para as camadas deslizarem umas sobre as outras. */
  var hero = $('.hero');
  var about = $('#manifesto');
  var blockFill = $('.block-line__fill');
  var heroHolder = $('#hero-image');
  var heroLayers = $$('.hero-layer');
  var aboutMovers = $$('[data-scroll]', about);
  var aboutLines = [$('.section-head .lines', about), $('.about > .lines', about)].filter(Boolean);
  aboutLines.forEach(function (l) { l.classList.add('is-scrub'); });
  var desktop = window.matchMedia('(min-width: 992px)');

  var mouse = { tx: 0, ty: 0, x: 0, y: 0 };
  var heroP = progressOf(hero), aboutP = progressOf(about);
  var cards = [];   // estados dos cards em movimento
  var running = false;

  function clamp01(v) { return Math.min(1, Math.max(0, v)); }
  /** 0 quando a seção começa a entrar por baixo, 1 quando termina de sair por cima. */
  function progressOf(el) {
    var r = el.getBoundingClientRect(), vh = window.innerHeight;
    return clamp01((vh - r.top) / (vh + r.height));
  }
  function near(a, b, eps) { return Math.abs(a - b) < eps; }

  function render() {
    var settled = true;
    var hp = progressOf(hero), ap = progressOf(about);
    heroP += (hp - heroP) * 0.19;
    aboutP += (ap - aboutP) * 0.08;
    mouse.x += (mouse.tx - mouse.x) * 0.08;
    mouse.y += (mouse.ty - mouse.y) * 0.08;
    if (!near(hp, heroP, 0.0005) || !near(ap, aboutP, 0.0005) || !near(mouse.tx, mouse.x, 0.0005) || !near(mouse.ty, mouse.y, 0.0005)) settled = false;

    blockFill.style.height = (heroP * 100).toFixed(2) + '%';
    aboutLines.forEach(function (l, i) {
      l.style.width = (clamp01(aboutP / (i ? 0.37 : 0.35)) * 100).toFixed(2) + '%';
    });

    if (!reduceMotion) {
      var big = desktop.matches;
      heroHolder.style.transform = big ? 'translate3d(' + (-110 * heroP).toFixed(2) + 'px,' + (150 * heroP).toFixed(2) + 'px,0)' : '';
      heroLayers.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = 'translate3d(' + (mouse.x * 22 * d).toFixed(2) + 'px,' + (mouse.y * 16 * d).toFixed(2) + 'px,0)';
      });
      aboutMovers.forEach(function (el) {
        var xy = el.getAttribute('data-scroll').split(',').map(Number);
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        var sx = big ? xy[0] * aboutP : 0, sy = big ? xy[1] * aboutP : 0;
        el.style.transform = 'translate3d(' + (sx + mouse.x * 14 * d).toFixed(2) + 'px,' + (sy + mouse.y * 10 * d).toFixed(2) + 'px,0)';
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

  /* Cortina de entrada das imagens do manifesto, em cascata */
  $$('.about-images .img-reveal').forEach(function (el, i) {
    el.style.setProperty('--d', (i * 0.14).toFixed(2) + 's');
    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'clip-path' && el.classList.contains('is-visible')) el.classList.add('is-revealed');
    });
  });

  /* ---------- Portfólio ---------- */
  var grid = $('#portfolio-grid');
  grid.innerHTML = DATA.portfolio.map(function (p) {
    var m = media(p.imagem, p.titulo);
    var strip = '';
    for (var i = 0; i < 6; i++) strip += '<span>VER FICHA TÉCNICA ✦</span>';
    return '' +
      '<article class="card" data-cat="' + esc(p.categoria) + '" data-reveal>' +
        '<div class="card-item">' +
          '<div class="card-media glass">' + m +
            '<div class="card-layer _02" aria-hidden="true">' + m + '</div>' +
            '<div class="card-layer _03" aria-hidden="true">' + m + '</div>' +
            '<div class="view-project" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div></div></div>' +
          '</div>' +
          '<div class="card-info">' +
            '<div class="card-title-wrap"><h3 class="card-title">' + esc(p.titulo) + '</h3></div>' +
            '<span class="card-meta">' + esc(CATEGORIAS[p.categoria] || p.categoria) + ' · ' + esc(p.ano) + '</span>' +
          '</div>' +
        '</div>' +
        '<button class="card-open" data-id="' + esc(p.id) + '" aria-label="Ver ficha técnica: ' + esc(p.titulo) + '"></button>' +
      '</article>';
  }).join('');

  $$('.filter').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      $$('.filter').forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-pressed', String(active));
      });
      $$('.card', grid).forEach(function (card) {
        card.hidden = !(f === 'todos' || card.getAttribute('data-cat') === f);
      });
    });
  });

  /* ---------- Modal ficha técnica ---------- */
  var modal = $('#modal');
  var lastFocus = null;
  function openModal(id) {
    var p = DATA.portfolio.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    $('#modal-media').innerHTML = media(p.imagem, p.titulo);
    $('#modal-cat').textContent = '#' + (CATEGORIAS[p.categoria] || p.categoria).toUpperCase() + ' · ' + p.vertente;
    $('#modal-title').textContent = p.titulo;
    $('#modal-desc').textContent = p.descricao;
    var ficha = Object.assign({ 'Ano': p.ano }, p.ficha || {});
    $('#modal-spec').innerHTML = Object.keys(ficha).map(function (k) {
      return '<dt>' + esc(k) + '</dt><dd>' + esc(ficha[k]) + '</dd>';
    }).join('');
    lastFocus = document.activeElement;
    modal.hidden = false;
    lock(true);
    $('.modal-close', modal).focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    lock(false);
    if (lastFocus) lastFocus.focus();
  }
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.card-open');
    if (btn) openModal(btn.getAttribute('data-id'));
  });
  $$('[data-close]', modal).forEach(function (el) { el.addEventListener('click', closeModal); });

  /* ---------- Loja + Sacola ---------- */
  var products = {};
  DATA.loja.forEach(function (p) { products[p.id] = p; });

  var cart = loadCart();
  function loadCart() {
    try {
      var raw = JSON.parse(localStorage.getItem(CART_KEY)) || {};
      var clean = {};
      Object.keys(raw).forEach(function (id) {
        if (products[id]) clean[id] = Math.min(products[id].estoque, Math.max(1, parseInt(raw[id], 10) || 1));
      });
      return clean;
    } catch (e) { return {}; }
  }
  function saveCart() {
    try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch (e) { /* modo privado */ }
  }

  var shopGrid = $('#shop-grid');
  shopGrid.innerHTML = DATA.loja.map(function (p) {
    return '' +
      '<article class="product" data-reveal>' +
        (p.selo ? '<span class="hanko">' + esc(p.selo) + '</span>' : '') +
        '<div class="product-media tilt" data-tilt>' + media(p.imagem, p.nome) + '</div>' +
        '<h3>' + esc(p.nome) + '</h3>' +
        '<p class="mono-small">' + esc(p.detalhe) + '</p>' +
        '<div class="product-foot">' +
          '<span class="price">' + brl.format(p.preco) + '</span>' +
          '<button class="btn btn--small" data-add="' + esc(p.id) + '">+ Sacola</button>' +
        '</div>' +
      '</article>';
  }).join('');

  shopGrid.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-add]');
    if (!btn) return;
    var id = btn.getAttribute('data-add');
    var max = products[id].estoque;
    cart[id] = Math.min(max, (cart[id] || 0) + 1);
    $('#cart-status').textContent = '';
    renderCart();
    setDrawer(true);
  });

  var drawer = $('#cart-drawer');
  var drawerBackdrop = $('#drawer-backdrop');
  var bagBtn = $('#bag-toggle');

  function renderCart() {
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
              '<button data-dec="' + esc(id) + '" aria-label="Diminuir">−</button>' +
              '<span>' + q + '</span>' +
              '<button data-inc="' + esc(id) + '" aria-label="Aumentar"' + (q >= p.estoque ? ' disabled' : '') + '>+</button>' +
            '</div>' +
          '</li>';
      }).join('');
    }
    $('#cart-total').textContent = brl.format(total);
    $('#bag-count').textContent = count;
    $('#checkout').disabled = !ids.length;
    bagBtn.classList.remove('bump'); void bagBtn.offsetWidth; bagBtn.classList.add('bump');
    saveCart();
  }

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
    renderCart();
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
    // PLACEHOLDER: integrar pagamento ou envio da reserva (WhatsApp / e-mail / backend).
    var notes = $('#cart-notes').value.trim();
    var resumo = Object.keys(cart).map(function (id) { return cart[id] + '× ' + products[id].nome; });
    console.info('[Reserva placeholder]', { itens: resumo, observacoes: notes });
    cart = {};
    $('#cart-notes').value = '';
    renderCart();
    var st = $('#cart-status');
    st.className = 'form-status ok';
    st.textContent = '✦ Reserva registrada. Entraremos em contato. (placeholder)';
  });

  renderCart();
  bagBtn.classList.remove('bump');

  /* ---------- Formulário de agendamento ---------- */
  var form = $('#booking-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var status = $('#form-status');
    var ok = true;
    $$('.field', form).forEach(function (f) { f.classList.remove('has-error'); });
    $$('[required]', form).forEach(function (input) {
      var valid = input.type === 'radio'
        ? !!form.querySelector('input[name="' + input.name + '"]:checked')
        : input.value.trim() !== '';
      if (!valid) { ok = false; input.closest('.field').classList.add('has-error'); }
    });
    if (!ok) {
      status.className = 'form-status err';
      status.textContent = 'Preencha os campos destacados.';
      return;
    }
    // PLACEHOLDER: enviar para WhatsApp, e-mail ou plataforma de agenda.
    var dados = {};
    new FormData(form).forEach(function (v, k) { dados[k] = v; });
    console.info('[Briefing placeholder]', dados);
    form.reset();
    status.className = 'form-status ok';
    status.textContent = '✦ Briefing recebido. Obrigado, ' + dados.nome.split(' ')[0] + '. (placeholder)';
  });

  /* ---------- Reveal + linhas progressivas ---------- */
  $$('[data-tilt]').forEach(bindTilt);
  $$('.card', grid).forEach(bindCard);
  var targets = $$('[data-reveal], .lines:not(.is-scrub), .img-reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    // .img-reveal começa com clip-path de área zero e o navegador nunca o considera visível;
    // por isso observamos o elemento pai e marcamos o filho.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target._revealChild || en.target;
        el.classList.add('is-visible');
        io.unobserve(en.target);
      });
    }, { threshold: 0.15 });
    targets.forEach(function (t) {
      if (t.classList.contains('img-reveal')) { t.parentElement._revealChild = t; io.observe(t.parentElement); }
      else io.observe(t);
    });
  } else {
    targets.forEach(function (t) { t.classList.add('is-visible'); });
  }

  /* ---------- Esc fecha camadas ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (drawer.classList.contains('is-open')) setDrawer(false);
    else if (menu.classList.contains('is-open')) setMenu(false);
  });

  $('#year').textContent = new Date().getFullYear();
})();
