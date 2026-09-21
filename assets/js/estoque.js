/* ==========================================================================
   ESTOQUE — sidebar de filtros, ordenação, grid de cards e favoritos.
   Depende de dados.js (window.VEICULOS) e layout.js (window.ICO).
   ========================================================================== */
(function () {
  var POR_PAGINA = 12;
  var visiveis = POR_PAGINA;

  var ICO_CAMBIO = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M7 4a2 2 0 1 0-3 1.72V11a1 1 0 0 0 1 1h6v3.28a2 2 0 1 0 2 0V12h6a1 1 0 0 0 1-1V5.72a2 2 0 1 0-2 0V10h-5V5.72a2 2 0 1 0-2 0V10H6V5.72A2 2 0 0 0 7 4z"/></svg>';
  var ICO_KM     = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 0c-6.617 0-12 5.383-12 12 0 2.184.586 4.233 1.61 5.999l1.736-1.003C2.495 15.525 2 13.822 2 12c0-5.523 4.477-10 10-10s10 4.477 10 10c0 1.822-.495 3.525-1.346 4.996l1.736 1.003C23.414 16.233 24 14.184 24 12c0-6.617-5.383-12-12-12zm0 18c-1.294 0-2.343-1.049-2.343-2.343 0-.883.489-1.652 1.21-2.051L12 8l1.133 5.606c.722.399 1.21 1.168 1.21 2.051C14.343 16.951 13.294 18 12 18z"/></svg>';
  var ICO_FUEL   = '<svg width="16" height="16" viewBox="0 0 24 24"><path d="M12 0c-4.87 7.197-8 11.699-8 16.075 0 4.378 3.579 7.925 8 7.925s8-3.547 8-7.925c0-4.376-3.13-8.878-8-16.075zm-.027 5.12c.467.725 1.027 1.987 1.027 3.32 0 3.908-4 4.548-4 2.17 0-1.633 1.988-4.044 2.973-5.49z"/></svg>';
  var ICO_PIN    = '<svg width="13" height="13" viewBox="0 0 24 24"><path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z"/></svg>';

  /* ---------- Utilidades ---------- */
  function brl(n) {
    return Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function num(n) {
    return Number(n || 0).toLocaleString('pt-BR');
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  var ano = window.anoVeiculo;

  function unicos(lista, chave) {
    var vistos = {};
    lista.forEach(function (v) {
      var k = v[chave];
      if (k !== undefined && k !== null && k !== '') vistos[k] = (vistos[k] || 0) + 1;
    });
    return Object.keys(vistos).sort().map(function (k) { return { valor: k, total: vistos[k] }; });
  }

  /* ---------- Favoritos (localStorage) ---------- */
  var favoritos = {
    chave: 'favoritos',
    ler: function () {
      try { return JSON.parse(localStorage.getItem(this.chave) || '[]'); } catch (e) { return []; }
    },
    gravar: function (ids) {
      try { localStorage.setItem(this.chave, JSON.stringify(ids)); } catch (e) {}
      this.pintar();
    },
    tem: function (id) { return this.ler().indexOf(String(id)) !== -1; },
    alternar: function (id) {
      id = String(id);
      var ids = this.ler();
      var i = ids.indexOf(id);
      if (i === -1) ids.push(id); else ids.splice(i, 1);
      this.gravar(ids);
    },
    limparTudo: function () { this.gravar([]); },
    pintar: function () {
      var ids = this.ler();
      document.querySelectorAll('[data-fav]').forEach(function (b) {
        b.classList.toggle('active', ids.indexOf(b.dataset.fav) !== -1);
      });
      document.querySelectorAll('[data-fav-count]').forEach(function (el) { el.textContent = ids.length; });

      var caixa = document.getElementById('favs');
      if (!caixa) return;
      var lista = (window.VEICULOS || []).filter(function (v) { return ids.indexOf(String(v.id)) !== -1; });
      caixa.innerHTML = lista.length
        ? lista.map(function (v) {
            return '<p><strong>' + esc(v.marca + ' ' + v.modelo) + '</strong><br>' +
                   '<span style="color:var(--vermelho)">R$ ' + brl(v.preco) + '</span></p>';
          }).join('')
        : '<p style="color:var(--texto-fraco)">Nenhum veículo favoritado.</p>';
    }
  };
  window.favoritos = favoritos;

  /* ---------- Sidebar de filtros (montada a partir dos dados) ---------- */
  function grupoCheckbox(titulo, campo, itens, render) {
    if (!itens.length) return '';
    return '<div class="box-filtro">' +
      '<p class="filtro-titulo">' + titulo + '</p>' +
      '<ul class="filtro-grupo">' +
        itens.map(function (it) {
          return '<li><label>' +
            '<input type="checkbox" name="' + campo + '" value="' + esc(it.valor) + '">' +
            (render ? render(it) : '') +
            '<span>' + esc(it.valor) + '</span>' +
          '</label></li>';
        }).join('') +
      '</ul>' +
    '</div>';
  }

  function montarFiltros(dados) {
    var alvo = document.getElementById('form-filtro');
    if (!alvo) return;

    var corHex = {};
    dados.forEach(function (v) { if (v.cor) corHex[v.cor] = v.corHex || '#dddddd'; });

    alvo.innerHTML =
      // Para exibir o logo da marca: return '<img src="assets/img/marca/' + it.valor.toLowerCase() + '.png" alt="">';
      grupoCheckbox('Marca', 'marca', unicos(dados, 'marca')) +
      '<div class="box-filtro">' +
        '<p class="filtro-titulo">Preço</p>' +
        '<div class="range-group">' +
          '<span>de</span><input type="text" inputmode="numeric" name="preco-de" placeholder="0">' +
          '<span>até</span><input type="text" inputmode="numeric" name="preco-ate" placeholder="0">' +
        '</div>' +
      '</div>' +
      '<div class="box-filtro">' +
        '<p class="filtro-titulo">Km</p>' +
        '<div class="range-group">' +
          '<span>de</span><input type="text" inputmode="numeric" name="km-de" placeholder="0">' +
          '<span>até</span><input type="text" inputmode="numeric" name="km-ate" placeholder="0">' +
        '</div>' +
      '</div>' +
      grupoCheckbox('Ano', 'anoModelo', unicos(dados, 'anoModelo').reverse()) +
      grupoCheckbox('Combustível', 'combustivel', unicos(dados, 'combustivel')) +
      grupoCheckbox('Cor', 'cor', unicos(dados, 'cor'), function (it) {
        return '<svg class="filtro-cor" height="20" width="20"><circle cx="10" cy="10" r="9" fill="' + esc(corHex[it.valor]) + '"/></svg>';
      }) +
      // Para exibir o ícone da carroceria: return '<img src="assets/img/carroceria/' + it.valor + '.png" alt="">';
      grupoCheckbox('Carroceria', 'carroceria', unicos(dados, 'carroceria')) +
      grupoCheckbox('Câmbio', 'cambio', unicos(dados, 'cambio'));

    if (!alvo.innerHTML.trim()) {
      alvo.innerHTML = '<div class="box-filtro"><p style="color:var(--texto-fraco)">Os filtros aparecem aqui quando houver veículos cadastrados.</p></div>';
    }
  }

  /* ---------- Card do veículo ---------- */
  function card(v) {
    var foto = v.foto
      ? '<img src="' + esc(v.foto) + '" alt="' + esc(v.marca + ' ' + v.modelo) + '" loading="lazy">'
      : '<div class="img-placeholder">Foto do veículo</div>';

    var precos = '';
    if (v.preco) {
      if (v.precoAntigo) precos += '<h3 class="preco-antigo">R$ ' + brl(v.precoAntigo) + '</h3>';
      precos += '<h3 class="preco">R$ ' + brl(v.preco) + '</h3>';
    } else {
      precos += '<h3 class="preco preco--consulte">Consulte</h3>';
    }

    function chip(icone, texto) {
      return '<div class="box-opicionais-home">' + icone + '<span>' + esc(texto) + '</span></div>';
    }

    var link = 'veiculo.html?id=' + encodeURIComponent(v.id);

    return '<article class="carro">' +
      '<div class="vitrine-favoritos">' +
        '<button type="button" class="btn" data-fav="' + esc(v.id) + '" title="Salvar favorito" aria-label="Salvar favorito">' +
          (window.ICO ? window.ICO.coracao : '') +
        '</button>' +
      '</div>' +
      (v.oferta ? '<div class="selo-oferta-home">Oferta</div>' : '') +
      '<div class="box-veiculo-resultado">' +
        '<div class="carro-img"><a href="' + link + '">' + foto + '</a></div>' +
        '<div class="carro-info">' +
          '<h2 class="tit-marca"><a href="' + link + '">' +
            '<div class="year">' + esc(ano(v)) + '</div>' +
            '<div class="first-name">' + esc(v.marca + ' ' + v.modelo) + '</div>' +
            '<div class="last-name">' + esc(v.versao || '') + '</div>' +
          '</a></h2>' +
          '<div class="price2-col">' + precos + '</div>' +
          (v.cidade ? '<div class="vitrine-cidade">' + ICO_PIN + ' ' + esc(v.cidade) + '</div>' : '') +
          '<div class="opicionais">' +
            chip(ICO_CAMBIO, v.cambio || '—') +
            chip(ICO_KM, num(v.km) + ' km') +
            chip(ICO_FUEL, v.combustivel || '—') +
          '</div>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  /* ---------- Filtragem + ordenação ---------- */
  function coletarFiltros() {
    var form = document.getElementById('form-filtro');
    var f = { checks: {}, ranges: {} };
    if (!form) return f;
    form.querySelectorAll('input[type=checkbox]:checked').forEach(function (i) {
      (f.checks[i.name] = f.checks[i.name] || []).push(i.value);
    });
    form.querySelectorAll('input[type=text]').forEach(function (i) {
      var v = parseFloat(String(i.value).replace(/\D/g, ''));
      if (!isNaN(v)) f.ranges[i.name] = v;
    });
    return f;
  }

  function aplicar() {
    var dados = (window.VEICULOS || []).slice();
    var f = coletarFiltros();

    dados = dados.filter(function (v) {
      for (var campo in f.checks) {
        if (f.checks[campo].indexOf(String(v[campo])) === -1) return false;
      }
      if (f.ranges['preco-de']  != null && v.preco < f.ranges['preco-de'])  return false;
      if (f.ranges['preco-ate'] != null && v.preco > f.ranges['preco-ate']) return false;
      if (f.ranges['km-de']     != null && v.km    < f.ranges['km-de'])     return false;
      if (f.ranges['km-ate']    != null && v.km    > f.ranges['km-ate'])    return false;
      return true;
    });

    var ordem = (document.getElementById('order') || {}).value || '';
    var ord = {
      'preco asc':  function (a, b) { return a.preco - b.preco; },
      'preco desc': function (a, b) { return b.preco - a.preco; },
      'ano asc':    function (a, b) { return a.anoModelo - b.anoModelo; },
      'ano desc':   function (a, b) { return b.anoModelo - a.anoModelo; },
      'modelo asc': function (a, b) { return (a.modelo || '').localeCompare(b.modelo || ''); },
      'modelo desc':function (a, b) { return (b.modelo || '').localeCompare(a.modelo || ''); },
    }[ordem];
    if (ord) dados.sort(ord);

    render(dados);
  }

  function render(dados) {
    var grid = document.getElementById('veiculos-grid');
    var titulo = document.getElementById('titulo-resultado');
    var maisWrap = document.getElementById('show-more');
    if (!grid) return;

    if (titulo) {
      titulo.textContent = dados.length
        ? 'Todos os veículos do estoque (' + dados.length + ')'
        : 'Estoque';
    }

    if (!dados.length) {
      grid.innerHTML = '<div class="estado-vazio">' +
        '<strong>Nenhum veículo cadastrado.</strong><br>' +
        'Preencha <code>assets/js/dados.js</code> para popular a listagem.' +
      '</div>';
      if (maisWrap) maisWrap.hidden = true;
      return;
    }

    grid.innerHTML = dados.slice(0, visiveis).map(card).join('');
    if (maisWrap) maisWrap.hidden = dados.length <= visiveis;
    favoritos.pintar();
  }

  /* ---------- Boot ---------- */
  function iniciar() {
    var dados = window.VEICULOS || [];
    montarFiltros(dados);
    aplicar();

    var form = document.getElementById('form-filtro');
    if (form) {
      form.addEventListener('change', function () { visiveis = POR_PAGINA; aplicar(); });
      form.addEventListener('input', function (e) {
        if (e.target.type === 'text') { visiveis = POR_PAGINA; aplicar(); }
      });
    }

    var order = document.getElementById('order');
    if (order) order.addEventListener('change', aplicar);

    var mais = document.querySelector('[data-mostrar-mais]');
    if (mais) mais.addEventListener('click', function () { visiveis += POR_PAGINA; aplicar(); });

    // Favoritar
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-fav]');
      if (btn) { e.preventDefault(); favoritos.alternar(btn.dataset.fav); }
    });

    // Sidebar mobile
    var sidebar = document.getElementById('sidebar');
    document.querySelectorAll('[data-toggle-sidebar]').forEach(function (b) {
      b.addEventListener('click', function () { sidebar.classList.toggle('is-open'); });
    });

    favoritos.pintar();
  }

  document.addEventListener('layout:pronto', function () {
    (window.estoquePronto || Promise.resolve()).then(iniciar);
  });
})();
