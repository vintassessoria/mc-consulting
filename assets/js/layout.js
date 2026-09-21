/* ==========================================================================
   LAYOUT — injeta header, footer e widgets fixos em todas as páginas.
   Depende de site.config.js (window.SITE).
   Uso: <body data-page="estoque"> ... <div data-layout="header"></div>
   ========================================================================== */
(function () {
  var S = window.SITE || {};
  var contato = S.contato || {};
  var redes = S.redes || {};

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // "/empresa" e "empresa.html" viram "empresa"; "/" vira "index".
  // Serve para casar o href do menu com o data-page do <body>.
  function rota(href) {
    return String(href || '').replace(/^\//, '').replace(/\.html$/, '') || 'index';
  }

  // "2021/2022"; só o modelo quando os anos coincidem; "—" quando não informado
  window.anoVeiculo = function (v) {
    if (!v.anoFab && !v.anoModelo) return '—';
    if (!v.anoFab || !v.anoModelo) return String(v.anoModelo || v.anoFab);
    return v.anoFab === v.anoModelo ? String(v.anoModelo) : v.anoFab + '/' + v.anoModelo;
  };

  /* ---------- Ícones (SVG inline, sem dependência externa) ---------- */
  var ICO = {
    fone: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z"/></svg>',
    whats: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>',
    coracao: '<svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 4.248c-3.148-5.402-12-3.825-12 2.944 0 4.661 5.571 9.427 12 15.808 6.43-6.381 12-11.147 12-15.808 0-6.792-8.875-8.306-12-2.944z"/></svg>',
    email: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/></svg>',
    pin: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>',
    instagram: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    facebook: '<svg width="12" height="12" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>',
  };
  window.ICO = ICO;

  function big(name, size) {
    return ICO[name].replace('width="18"', 'width="' + size + '"').replace('height="18"', 'height="' + size + '"');
  }

  /* ---------- HEADER ---------- */
  function header() {
    var pagina = document.body.dataset.page || '';
    var itens = (S.menu || []).map(function (m) {
      var ativo = rota(m.href) === pagina ? ' class="active"' : '';
      return '<li' + ativo + '><a href="' + m.href + '">' + m.label + '</a></li>';
    }).join('');

    var contatos = '';
    if (contato.telefone) {
      contatos += '<li class="telefone-menu"><a href="' + (contato.telefoneLink || '#') + '">' + ICO.fone + contato.telefone + '</a></li>';
    }
    if (contato.whatsapp) {
      contatos += '<li class="whats-menu"><a href="' + (contato.whatsappLink || '#') + '" target="_blank" rel="noopener">' + ICO.whats + contato.whatsapp + '</a></li>';
    }

    return '' +
      '<nav id="menu">' +
        '<div class="navbar-inner">' +
          '<a href="/" class="navbar-brand" title="' + (S.nome || '') + '">' +
            '<img src="' + (S.logo || 'assets/img/logo-preta.png') + '" alt="' + esc(S.nome || '') + '">' +
          '</a>' +
          '<button class="navbar-toggle" type="button" aria-label="Abrir menu" aria-expanded="false">' +
            '<span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span>' +
          '</button>' +
          '<div class="navbar-collapse" id="menu-mobile">' +
            (contatos ? '<ul class="nav-contato">' + contatos + '</ul>' : '') +
            '<ul class="navbar-nav">' + itens +
              '<li><a href="#" data-abrir-favoritos>' + ICO.coracao + ' Favoritos <span class="fav-count" data-fav-count>0</span></a></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
      '</nav>' +
      '<div class="modal" id="favoritos-modal" hidden>' +
        '<div class="modal-content">' +
          '<div class="modal-header">' +
            '<h4>' + big('coracao', 20) + ' Favoritos</h4>' +
            '<button type="button" class="btn btn-outline" data-limpar-favoritos>Limpar</button>' +
            '<button type="button" class="close" data-fechar-modal aria-label="Fechar">&times;</button>' +
          '</div>' +
          '<div class="modal-body"><div id="favs"></div></div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- FOOTER ---------- */
  function footer() {
    var atendimento = '';
    if (contato.telefone) atendimento += '<li>' + ICO.fone.replace(/18/g, '12') + ' ' + contato.telefone + '</li>';
    if (contato.whatsapp) atendimento += '<li>' + ICO.whats.replace(/18/g, '12') + ' ' + contato.whatsapp + '</li>';
    if (contato.email)    atendimento += '<li>' + ICO.email + ' ' + contato.email + '</li>';
    if (contato.endereco) atendimento += '<li>' + ICO.pin + ' ' + contato.endereco + '</li>';
    if (!atendimento)     atendimento = '<li>Preencha os dados em <code>assets/js/site.config.js</code></li>';

    var menu = (S.menu || []).map(function (m) {
      return '<li><a href="' + m.href + '">' + m.label + '</a></li>';
    }).join('');

    var sociais = '';
    if (redes.instagram) sociais += '<li><a href="' + redes.instagram + '" target="_blank" rel="noopener">' + ICO.instagram + ' Instagram</a></li>';
    if (redes.facebook)  sociais += '<li><a href="' + redes.facebook + '" target="_blank" rel="noopener">' + ICO.facebook + ' Facebook</a></li>';
    if (!sociais)        sociais = '<li>—</li>';

    // Sem lista manual no config, deriva do estoque
    function doEstoque(campo) {
      var v = window.VEICULOS || [];
      return v.length
        ? Object.keys(v.reduce(function (a, x) { if (x[campo]) a[x[campo]] = 1; return a; }, {})).sort()
        : [];
    }

    function nuvem(titulo, lista) {
      if (!lista || !lista.length) return '';
      return '<h3>' + titulo + '</h3><ul>' +
        lista.map(function (t) { return '<li><a href="/">' + t + '</a></li>'; }).join('') +
        '</ul>';
    }

    return '' +
      '<footer class="page-footer">' +
        '<div class="container">' +
          '<div class="footer-marca">' +
            '<img src="' + (S.logoClara || 'assets/img/logo.png') + '" alt="' + esc(S.nome || '') + '">' +
          '</div>' +
          '<div class="footer-cols">' +
            '<div><h3>Atendimento</h3><address><ul>' + atendimento + '</ul></address></div>' +
            '<div><h3>Menu</h3><ul>' + menu + '</ul></div>' +
            '<div><h3>Redes sociais</h3><ul>' + sociais + '</ul></div>' +
          '</div>' +
        '</div>' +
        '<div class="container tag-cloud">' +
          nuvem('Marcas', (S.marcas && S.marcas.length) ? S.marcas : doEstoque('marca')) +
          nuvem('Modelos', (S.modelos && S.modelos.length) ? S.modelos : doEstoque('modelo')) +
        '</div>' +
        '<div class="footer-copyright">' +
          (contato.horario ? 'HORÁRIO DE ATENDIMENTO: ' + contato.horario : '') +
        '</div>' +
        '<div class="footer-dev"><div class="container"><p>&copy; ' + new Date().getFullYear() + ' ' + (S.nome || '') + '</p></div></div>' +
      '</footer>';
  }

  /* ---------- WIDGETS FIXOS ---------- */
  function widgets() {
    function lateral(classe, id, icone, titulo, chamada, href) {
      if (!href) return '';
      return '<div class="social-lateral ' + classe + '">' +
        '<input id="' + id + '" class="toggle" type="checkbox">' +
        '<label for="' + id + '" class="lbl-toggle">' + big(icone, 24) + '</label>' +
        '<div class="collapsible-content"><div class="content-inner">' +
          '<a href="' + href + '" target="_blank" rel="noopener">' + titulo + '<br><strong>' + chamada + '</strong></a>' +
        '</div></div>' +
      '</div>';
    }

    var html =
      lateral('facebook-lateral', 'col-fb', 'facebook', 'Acesse nosso <strong>Facebook</strong>', 'Clique aqui', redes.facebook) +
      lateral('instagram-lateral', 'col-ig', 'instagram', 'Siga-nos no <strong>Instagram</strong>', 'Clique aqui', redes.instagram) +
      lateral('whatsapp-lateral', 'col-wa', 'whats', '<strong>WhatsApp</strong>', contato.whatsapp || 'Fale conosco', contato.whatsappLink);

    if (contato.whatsappLink) {
      html += '<div class="fixed-whats"><a href="' + contato.whatsappLink + '" target="_blank" rel="noopener" aria-label="WhatsApp">' + big('whats', 28) + '</a></div>';
    }

    html +=
      '<div class="modal-cookie" id="cookieBar" hidden>' +
        '<div class="cookie-inner">' +
          '<p>Para proteger e melhorar a sua experiência no site, utilizamos cookies e dados pessoais de acordo com nossos <a href="/politica-de-privacidade">Termos de Uso e Política de Privacidade</a>.</p>' +
          '<button type="button" class="btn btn-danger" data-aceitar-cookies>OK</button>' +
        '</div>' +
      '</div>';

    return html;
  }

  /* ---------- Montagem + comportamentos ---------- */
  function montar() {
    var slotHeader = document.querySelector('[data-layout="header"]');
    var slotFooter = document.querySelector('[data-layout="footer"]');
    if (slotHeader) slotHeader.outerHTML = header();
    if (slotFooter) slotFooter.outerHTML = footer() + widgets();

    var hero = document.querySelector('[data-hero]');
    if (hero && S.banner) {
      hero.innerHTML = '<img src="' + S.banner + '" alt="' + esc(S.nome || '') + '" fetchpriority="high">';
    } else if (hero) {
      hero.remove();
    }

    // Menu mobile
    var toggle = document.querySelector('.navbar-toggle');
    var collapse = document.getElementById('menu-mobile');
    if (toggle && collapse) {
      toggle.addEventListener('click', function () {
        var aberto = collapse.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(aberto));
      });
    }

    // Modal de favoritos
    var modal = document.getElementById('favoritos-modal');
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-abrir-favoritos]')) { e.preventDefault(); modal.hidden = false; }
      if (e.target.closest('[data-fechar-modal]') || e.target === modal) { modal.hidden = true; }
      if (e.target.closest('[data-limpar-favoritos]') && window.favoritos) { window.favoritos.limparTudo(); }
      if (e.target.closest('[data-aceitar-cookies]')) {
        document.getElementById('cookieBar').hidden = true;
        try { localStorage.setItem('cookies-ok', '1'); } catch (err) {}
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal) modal.hidden = true;
    });

    // Cookie bar
    var ok = '1';
    try { ok = localStorage.getItem('cookies-ok'); } catch (err) {}
    if (!ok) document.getElementById('cookieBar').hidden = false;

    document.dispatchEvent(new CustomEvent('layout:pronto'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montar);
  } else {
    montar();
  }
})();
