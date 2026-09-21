/* ==========================================================================
   PAINEL — login, lista e edição de veículos.
   Depende de ../assets/js/config.supabase.js e ../assets/js/api.js
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------- listas ------ */
  var COMBUSTIVEIS = ['FLEX', 'GASOLINA', 'DIESEL', 'HÍBRIDO', 'ELÉTRICO', 'OUTROS'];
  var CAMBIOS      = ['Automático', 'Manual', 'CVT', 'Automatizado'];
  var CARROCERIAS  = ['hatch', 'sedan', 'suv', 'caminhonete', 'utilitário', 'cupê', 'minivan'];
  var CORES = {
    'BRANCO': '#ffffff', 'PRETO': '#000000', 'PRATA': '#cccccc', 'CINZA': '#8c8c8c',
    'VERMELHO': '#cc1f1f', 'AZUL': '#1f3fa8', 'VERDE': '#2e8b45', 'AMARELO': '#e8c30b',
    'MARROM': '#6b4423', 'BEGE': '#d8c9a8', 'LARANJA': '#e06b1f', 'OUTRA': '#cccccc'
  };

  /* --------------------------------------------------------- atalhos --- */
  var $ = function (id) { return document.getElementById(id); };
  var estado = { veiculos: [], editando: null, fotos: [], enviando: 0 };

  function mostrar(tela) {
    ['tela-config', 'tela-login', 'tela-app'].forEach(function (t) {
      $(t).hidden = (t !== tela);
    });
  }

  function recado(el, texto, tipo) {
    var e = $(el);
    if (!texto) { e.hidden = true; return; }
    e.className = 'aviso aviso-' + (tipo || 'erro');
    e.textContent = texto;
    e.hidden = false;
  }

  function brl(n) {
    return Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function opcoes(select, lista, incluirVazio) {
    select.innerHTML = (incluirVazio ? '<option value="">—</option>' : '') +
      lista.map(function (v) { return '<option value="' + v + '">' + v + '</option>'; }).join('');
  }

  // "toyota-hilux-srx-2-8-diesel-4x4-aut-2022"
  function gerarSlug(v) {
    var base = [v.marca, v.modelo, v.versao, v.anoModelo].filter(Boolean).join(' ');
    return base
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  /* =========================================================== LOGIN === */
  function iniciarLogin() {
    $('form-login').addEventListener('submit', function (e) {
      e.preventDefault();
      var botao = $('login-botao');
      botao.disabled = true;
      botao.textContent = 'Entrando…';
      recado('login-erro', '');

      window.API.entrar($('login-email').value.trim(), $('login-senha').value)
        .then(abrirPainel)
        .catch(function (err) {
          var msg = /invalid|credentials/i.test(err.message)
            ? 'E-mail ou senha incorretos.'
            : err.message;
          recado('login-erro', msg);
        })
        .finally(function () {
          botao.disabled = false;
          botao.textContent = 'Entrar';
        });
    });
  }

  function abrirPainel() {
    var s = window.API.sessao();
    $('usuario-email').textContent = (s && s.user && s.user.email) || '';
    mostrar('tela-app');
    carregarLista();
  }

  /* ============================================================ LISTA == */
  function carregarLista() {
    return window.API.listar({ admin: true })
      .then(function (lista) {
        estado.veiculos = lista;
        desenharLista();
      })
      .catch(function (err) { recado('lista-recado', err.message, 'erro'); });
  }

  function desenharLista() {
    var termo = ($('busca').value || '').trim().toLowerCase();
    var lista = estado.veiculos.filter(function (v) {
      if (!termo) return true;
      return [v.marca, v.modelo, v.versao].join(' ').toLowerCase().indexOf(termo) !== -1;
    });

    var ativos = estado.veiculos.filter(function (v) { return !v.vendido; }).length;
    $('contador').textContent = ativos + ' na vitrine · ' + estado.veiculos.length + ' no total';

    $('lista-vazia').hidden = lista.length > 0;
    $('corpo-tabela').innerHTML = lista.map(linha).join('');
  }

  function linha(v) {
    var foto = v.foto
      ? '<img class="t-foto" src="' + v.foto + '" alt="">'
      : '<div class="t-sem-foto">sem foto</div>';

    var situacao = v.vendido
      ? '<span class="selo selo-vendido">Vendido</span>'
      : '<span class="selo selo-ativo">Na vitrine</span>';
    if (!v.vendido && v.oferta) situacao += ' <span class="selo selo-oferta">Oferta</span>';

    return '<tr>' +
      '<td>' + foto + '</td>' +
      '<td>' +
        '<div class="t-nome">' + [v.marca, v.modelo].join(' ') + '</div>' +
        '<div class="t-versao">' + (v.versao || '') + '</div>' +
      '</td>' +
      '<td>' + anoTexto(v) + '</td>' +
      '<td>' + Number(v.km || 0).toLocaleString('pt-BR') + ' km</td>' +
      '<td>' + (v.preco ? brl(v.preco) : '<span style="color:var(--texto-fraco)">Consulte</span>') + '</td>' +
      '<td>' + situacao + '</td>' +
      '<td><div class="t-acoes">' +
        '<button class="btn btn-outline" data-vender="' + v.uuid + '">' +
          (v.vendido ? 'Reativar' : 'Vendido') +
        '</button>' +
        '<button class="btn btn-primary" data-editar="' + v.uuid + '">Editar</button>' +
      '</div></td>' +
    '</tr>';
  }

  function anoTexto(v) {
    if (!v.anoFab && !v.anoModelo) return '—';
    if (!v.anoFab || !v.anoModelo) return String(v.anoModelo || v.anoFab);
    return v.anoFab === v.anoModelo ? String(v.anoModelo) : v.anoFab + '/' + v.anoModelo;
  }

  /* ========================================================= FORMULÁRIO */
  function abrirForm(v) {
    estado.editando = v || null;
    estado.fotos = (v && v.fotos ? v.fotos.slice() : []);

    $('form-titulo').textContent = v ? [v.marca, v.modelo].join(' ') : 'Novo veículo';
    $('botao-excluir').hidden = !v;
    recado('form-erro', '');

    $('f-marca').value        = v ? v.marca || '' : '';
    $('f-modelo').value       = v ? v.modelo || '' : '';
    $('f-versao').value       = v ? v.versao || '' : '';
    $('f-ano-fab').value      = v && v.anoFab ? v.anoFab : '';
    $('f-ano-modelo').value   = v && v.anoModelo ? v.anoModelo : '';
    $('f-km').value           = v ? v.km || 0 : '';
    $('f-cidade').value       = v ? v.cidade || 'Brasília (DF)' : 'Brasília (DF)';
    $('f-preco').value        = v && v.preco ? v.preco : '';
    $('f-preco-antigo').value = v && v.precoAntigo ? v.precoAntigo : '';
    $('f-ordem').value        = v ? v.ordem || 0 : 0;
    $('f-combustivel').value  = v ? v.combustivel || '' : '';
    $('f-cambio').value       = v ? v.cambio || '' : '';
    $('f-carroceria').value   = v ? v.carroceria || '' : '';
    $('f-cor').value          = v ? v.cor || '' : '';
    $('f-cor-detalhe').value  = v ? v.corDetalhe || '' : '';
    $('f-cor-hex').value      = v ? v.corHex || '#cccccc' : '#cccccc';
    $('f-opcionais').value    = v && v.opcionais ? v.opcionais.join('\n') : '';
    $('f-observacoes').value  = v ? v.observacoes || '' : '';
    $('f-oferta').checked     = !!(v && v.oferta);
    $('f-destaque').checked   = !!(v && v.destaque);
    $('f-vendido').checked    = !!(v && v.vendido);

    desenharFotos();
    $('secao-lista').hidden = true;
    $('secao-form').hidden = false;
    window.scrollTo(0, 0);
  }

  function fecharForm() {
    $('secao-form').hidden = true;
    $('secao-lista').hidden = false;
    estado.editando = null;
    estado.fotos = [];
  }

  function coletar() {
    return {
      uuid: estado.editando ? estado.editando.uuid : null,
      marca: $('f-marca').value.trim().toUpperCase(),
      modelo: $('f-modelo').value.trim().toUpperCase(),
      versao: $('f-versao').value.trim(),
      anoFab: parseInt($('f-ano-fab').value, 10) || null,
      anoModelo: parseInt($('f-ano-modelo').value, 10) || null,
      km: parseInt($('f-km').value, 10) || 0,
      cidade: $('f-cidade').value.trim(),
      preco: parseFloat($('f-preco').value) || 0,
      precoAntigo: parseFloat($('f-preco-antigo').value) || 0,
      ordem: parseInt($('f-ordem').value, 10) || 0,
      combustivel: $('f-combustivel').value,
      cambio: $('f-cambio').value,
      carroceria: $('f-carroceria').value,
      cor: $('f-cor').value,
      corDetalhe: $('f-cor-detalhe').value.trim(),
      corHex: $('f-cor-hex').value,
      opcionais: $('f-opcionais').value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean),
      observacoes: $('f-observacoes').value.trim(),
      oferta: $('f-oferta').checked,
      destaque: $('f-destaque').checked,
      vendido: $('f-vendido').checked,
      fotos: estado.fotos
    };
  }

  function salvar(e) {
    e.preventDefault();
    if (estado.enviando > 0) {
      recado('form-erro', 'Aguarde o envio das fotos terminar.');
      return;
    }

    var v = coletar();
    if (!v.marca || !v.modelo) {
      recado('form-erro', 'Marca e modelo são obrigatórios.');
      return;
    }
    v.slug = (estado.editando && estado.editando.slug) || gerarSlug(v);

    var botao = $('botao-salvar');
    botao.disabled = true;
    botao.textContent = 'Salvando…';
    recado('form-erro', '');

    window.API.salvar(v)
      .then(function () {
        fecharForm();
        return carregarLista();
      })
      .then(function () {
        recado('lista-recado', 'Veículo salvo.', 'ok');
        setTimeout(function () { recado('lista-recado', ''); }, 3000);
      })
      .catch(function (err) {
        var msg = /duplicate key|unique/i.test(err.message)
          ? 'Já existe um veículo com esse endereço (marca + modelo + versão + ano). Altere a versão para diferenciar.'
          : err.message;
        recado('form-erro', msg);
      })
      .finally(function () {
        botao.disabled = false;
        botao.textContent = 'Salvar veículo';
      });
  }

  function excluir() {
    var v = estado.editando;
    if (!v) return;
    if (!confirm('Excluir ' + v.marca + ' ' + v.modelo + ' definitivamente?\n\nPara apenas tirar da vitrine, use "Vendido".')) return;

    window.API.remover(v.uuid)
      .then(function () {
        (v.fotos || []).forEach(function (f) { window.API.removerFoto(f); });
        fecharForm();
        return carregarLista();
      })
      .catch(function (err) { recado('form-erro', err.message); });
  }

  function alternarVendido(uuid) {
    var v = estado.veiculos.find(function (x) { return x.uuid === uuid; });
    if (!v) return;
    v.vendido = !v.vendido;
    desenharLista();
    window.API.salvar(v).catch(function (err) {
      v.vendido = !v.vendido;
      desenharLista();
      recado('lista-recado', err.message, 'erro');
    });
  }

  /* ============================================================= FOTOS = */
  function desenharFotos() {
    $('fotos-grade').innerHTML = estado.fotos.map(function (url, i) {
      return '<div class="foto-item">' +
        '<img src="' + url + '" alt="">' +
        (i === 0 ? '<span class="foto-capa">Capa</span>' : '') +
        '<button type="button" class="foto-x" data-foto="' + i + '" title="Remover">&times;</button>' +
      '</div>';
    }).join('');
  }

  /* Fotos de celular chegam com 20 MP e vários MB. Reduz para 1600px no maior
     lado e recomprime em JPEG antes de subir: o site carrega rápido e o
     Storage não enche. Se algo falhar, envia o arquivo original. */
  var LADO_MAX = 1600;
  var QUALIDADE = 0.82;

  function otimizar(file) {
    if (!/^image\//.test(file.type) || /svg/.test(file.type)) return Promise.resolve(file);

    return new Promise(function (resolve) {
      var url = URL.createObjectURL(file);
      var img = new Image();

      img.onload = function () {
        URL.revokeObjectURL(url);
        var escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
        if (escala === 1 && file.size < 900 * 1024) return resolve(file);

        var c = document.createElement('canvas');
        c.width = Math.round(img.width * escala);
        c.height = Math.round(img.height * escala);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);

        c.toBlob(function (blob) {
          if (!blob || blob.size >= file.size) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', QUALIDADE);
      };

      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  function enviarFotos(files) {
    var lista = Array.prototype.slice.call(files);
    if (!lista.length) return;

    estado.enviando += lista.length;
    $('fotos-status').textContent = 'Enviando ' + estado.enviando + ' foto(s)…';

    lista.reduce(function (fila, file) {
      return fila.then(function () {
        return otimizar(file)
          .then(window.API.enviarFoto)
          .then(function (url) { estado.fotos.push(url); desenharFotos(); })
          .catch(function (err) { recado('form-erro', 'Foto "' + file.name + '": ' + err.message); })
          .finally(function () {
            estado.enviando--;
            $('fotos-status').textContent = estado.enviando
              ? 'Enviando ' + estado.enviando + ' foto(s)…'
              : '';
          });
      });
    }, Promise.resolve());
  }

  /* ============================================================= BOOT == */
  function iniciar() {
    if (!window.API || !window.API.configurado()) { mostrar('tela-config'); return; }

    opcoes($('f-combustivel'), COMBUSTIVEIS, true);
    opcoes($('f-cambio'), CAMBIOS, true);
    opcoes($('f-carroceria'), CARROCERIAS, true);
    opcoes($('f-cor'), Object.keys(CORES), true);

    // Cor conhecida preenche a amostra sozinha
    $('f-cor').addEventListener('change', function () {
      if (CORES[this.value]) $('f-cor-hex').value = CORES[this.value];
    });

    iniciarLogin();

    $('botao-sair').addEventListener('click', function () {
      window.API.sair().finally(function () { location.reload(); });
    });
    $('botao-novo').addEventListener('click', function () { abrirForm(null); });
    $('botao-voltar').addEventListener('click', fecharForm);
    $('botao-cancelar').addEventListener('click', fecharForm);
    $('botao-excluir').addEventListener('click', excluir);
    $('form-veiculo').addEventListener('submit', salvar);
    $('busca').addEventListener('input', desenharLista);

    $('f-fotos').addEventListener('change', function () {
      enviarFotos(this.files);
      this.value = '';
    });

    document.addEventListener('click', function (e) {
      var editar = e.target.closest('[data-editar]');
      if (editar) {
        var v = estado.veiculos.find(function (x) { return x.uuid === editar.dataset.editar; });
        if (v) abrirForm(v);
        return;
      }
      var vender = e.target.closest('[data-vender]');
      if (vender) { alternarVendido(vender.dataset.vender); return; }

      var foto = e.target.closest('[data-foto]');
      if (foto) {
        var i = Number(foto.dataset.foto);
        var url = estado.fotos[i];
        estado.fotos.splice(i, 1);
        desenharFotos();
        window.API.removerFoto(url);
      }
    });

    // Já logado? entra direto
    if (window.API.sessao()) {
      abrirPainel();
    } else {
      mostrar('tela-login');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
