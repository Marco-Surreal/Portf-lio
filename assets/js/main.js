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

  /* ---------- Marquees ---------- */
  function buildMarquee(el, words) {
    var group = words.map(function (w) {
      return '<span class="marquee-item">' + esc(w) + '</span><span class="marquee-star">✦</span>';
    }).join('');
    var html = '';
    for (var i = 0; i < 3; i++) html += '<div class="marquee-group">' + group + '</div>';
    el.innerHTML = '<div class="marquee-track">' + html + '</div>';
  }
  $$('.marquee[data-words]').forEach(function (el) {
    var words = el.getAttribute('data-words').split('|');
    // repete as palavras para preencher telas largas
    buildMarquee(el, words.concat(words));
  });

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

  /* ---------- Scroll: block-line + parallax ---------- */
  var hero = $('.hero');
  var blockFill = $('.block-line__fill');
  var heroImg = $('#hero-image');
  var parallaxEls = $$('[data-parallax]');
  var mouseX = 0, mouseY = 0, ticking = false;

  function onFrame() {
    ticking = false;
    var y = window.scrollY;
    var heroH = hero.offsetHeight || 1;
    var progress = Math.min(1, Math.max(0, (y + window.innerHeight * 0.6) / heroH));
    blockFill.style.height = (progress * 100) + '%';
    if (reduceMotion) return;

    heroImg.style.transform = 'translate3d(' + (mouseX * 18) + 'px,' + (-y * 0.15 + mouseY * 14) + 'px,0)';
    parallaxEls.forEach(function (el) {
      var rect = el.parentElement.getBoundingClientRect();
      var offset = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = 'translate3d(0,' + (offset * parseFloat(el.getAttribute('data-parallax'))) + 'px,0)';
    });
  }
  function requestFrame() { if (!ticking) { ticking = true; window.requestAnimationFrame(onFrame); } }
  window.addEventListener('scroll', requestFrame, { passive: true });
  window.addEventListener('resize', requestFrame);
  if (!reduceMotion) {
    hero.addEventListener('mousemove', function (e) {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      requestFrame();
    });
  }
  onFrame();

  /* ---------- Portfólio ---------- */
  var grid = $('#portfolio-grid');
  grid.innerHTML = DATA.portfolio.map(function (p) {
    var m = media(p.imagem, p.titulo);
    var strip = '';
    for (var i = 0; i < 6; i++) strip += '<span>VER FICHA TÉCNICA ✦</span>';
    return '' +
      '<article class="card" data-cat="' + esc(p.categoria) + '" data-reveal>' +
        '<div class="card-media">' + m +
          '<div class="card-layer _02" aria-hidden="true">' + m + '</div>' +
          '<div class="card-layer _03" aria-hidden="true">' + m + '</div>' +
          '<div class="view-project" aria-hidden="true"><div class="marquee-track"><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div><div class="marquee-group">' + strip + '</div></div></div>' +
        '</div>' +
        '<div class="card-info">' +
          '<h3 class="card-title">' + esc(p.titulo) + '</h3>' +
          '<span class="card-meta">' + esc(CATEGORIAS[p.categoria] || p.categoria) + ' · ' + esc(p.ano) + '</span>' +
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
        '<div class="product-media">' + media(p.imagem, p.nome) + '</div>' +
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
  var targets = $$('[data-reveal], .lines');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
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
    else if (menu.classList.contains('is-open')) setMenu(false);
  });

  $('#year').textContent = new Date().getFullYear();
})();
