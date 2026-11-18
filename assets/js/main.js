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

  /* ---------- Scroll + mouse: block-line e camadas em profundidade ----------
   * Cada imagem com data-depth anda com o mouse e com o scroll numa velocidade diferente,
   * então as camadas deslizam umas sobre as outras. O movimento é suavizado (lerp),
   * como as interações "smooth" do template Alien. */
  var hero = $('.hero');
  var blockFill = $('.block-line__fill');
  var heroLayers = $$('.hero-layer');
  var aboutImgs = $$('.about-img');
  var target = { x: 0, y: 0 }, cur = { x: 0, y: 0, s: window.scrollY };
  var running = false;

  function render() {
    var y = window.scrollY;
    cur.x += (target.x - cur.x) * 0.08;
    cur.y += (target.y - cur.y) * 0.08;
    cur.s += (y - cur.s) * 0.12;

    var heroH = hero.offsetHeight || 1;
    var progress = Math.min(1, Math.max(0, (y + window.innerHeight * 0.6) / heroH));
    blockFill.style.height = (progress * 100) + '%';

    if (!reduceMotion) {
      heroLayers.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 1;
        el.style.transform = 'translate3d(' + (cur.x * 22 * d) + 'px,' + (-cur.s * 0.12 * d + cur.y * 16 * d) + 'px,0)';
      });
      aboutImgs.forEach(function (el) {
        var rect = el.parentElement.getBoundingClientRect();
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        var offset = rect.top + rect.height / 2 - window.innerHeight / 2;
        var p = parseFloat(el.getAttribute('data-parallax')) || 0;
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.transform = 'translate3d(' + (cur.x * 14 * d) + 'px,' + (offset * p + cur.y * 10 * d) + 'px,0)';
      });
    }

    var settled = Math.abs(target.x - cur.x) < 0.001 && Math.abs(target.y - cur.y) < 0.001 && Math.abs(y - cur.s) < 0.5;
    if (settled) running = false; else window.requestAnimationFrame(render);
  }
  function wake() { if (!running) { running = true; window.requestAnimationFrame(render); } }
  window.addEventListener('scroll', wake, { passive: true });
  window.addEventListener('resize', wake);
  if (!reduceMotion) {
    window.addEventListener('mousemove', function (e) {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
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

  /* Cortina de entrada das imagens, em cascata dentro de cada grupo */
  function prepReveal(el, i, base) {
    el.style.setProperty('--d', ((base || 0) + i * 0.14).toFixed(2) + 's');
    el.addEventListener('transitionend', function (e) {
      if (e.propertyName === 'clip-path' && el.classList.contains('is-visible')) el.classList.add('is-revealed');
    });
  }
  $$('#hero-image .img-reveal').forEach(function (el, i) { prepReveal(el, i, 0.45); });  // entra depois do título
  $$('.about-images .img-reveal').forEach(function (el, i) { prepReveal(el, i); });

  /* ---------- Portfólio ---------- */
  var grid = $('#portfolio-grid');
  grid.innerHTML = DATA.portfolio.map(function (p) {
    var m = media(p.imagem, p.titulo);
    var strip = '';
    for (var i = 0; i < 6; i++) strip += '<span>VER FICHA TÉCNICA ✦</span>';
    return '' +
      '<article class="card" data-cat="' + esc(p.categoria) + '" data-reveal>' +
        '<div class="card-media tilt" data-tilt>' + m +
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
  var targets = $$('[data-reveal], .lines, .img-reveal');
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
