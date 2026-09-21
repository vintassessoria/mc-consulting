/* ==========================================================================
   API — cliente do Supabase em fetch puro (sem SDK, sem CDN).
   Cobre o que o site precisa: ler estoque, autenticar o painel, gravar
   veículos e enviar fotos.

   window.API.configurado()        → true se config.supabase.js foi preenchido
   window.API.listar({admin})      → veículos já no formato do front
   window.API.salvar(registro)     → cria ou atualiza (precisa de sessão)
   window.API.remover(id)
   window.API.enviarFoto(file)     → URL pública
   window.API.removerFoto(url)
   window.API.entrar(email, senha) / sair() / sessao()
   ========================================================================== */
(function () {
  var CFG = window.SUPABASE || {};
  var CHAVE_SESSAO = 'mc.sessao';

  function configurado() {
    return !!(CFG.url && CFG.anonKey);
  }

  /* ---------------------------------------------------------- sessão ---- */
  function sessao() {
    try { return JSON.parse(localStorage.getItem(CHAVE_SESSAO) || 'null'); }
    catch (e) { return null; }
  }

  function guardarSessao(s) {
    if (s) {
      s.expira_em = Date.now() + (s.expires_in || 3600) * 1000;
      localStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
    } else {
      localStorage.removeItem(CHAVE_SESSAO);
    }
    return s;
  }

  function auth(caminho, corpo) {
    return fetch(CFG.url + '/auth/v1' + caminho, {
      method: 'POST',
      headers: { apikey: CFG.anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo)
    }).then(function (r) {
      return r.json().then(function (d) {
        if (!r.ok) throw new Error(d.error_description || d.msg || d.message || 'Falha na autenticação');
        return d;
      });
    });
  }

  function entrar(email, senha) {
    return auth('/token?grant_type=password', { email: email, password: senha })
      .then(guardarSessao);
  }

  function sair() {
    var s = sessao();
    guardarSessao(null);
    if (!s) return Promise.resolve();
    return fetch(CFG.url + '/auth/v1/logout', {
      method: 'POST',
      headers: { apikey: CFG.anonKey, Authorization: 'Bearer ' + s.access_token }
    }).catch(function () {});
  }

  // Renova o token se estiver perto de expirar
  function tokenValido() {
    var s = sessao();
    if (!s) return Promise.resolve(null);
    if (Date.now() < s.expira_em - 60000) return Promise.resolve(s.access_token);

    return auth('/token?grant_type=refresh_token', { refresh_token: s.refresh_token })
      .then(function (novo) { return guardarSessao(novo).access_token; })
      .catch(function () { guardarSessao(null); return null; });
  }

  /* ------------------------------------------------------- PostgREST ---- */
  function rest(caminho, opcoes) {
    opcoes = opcoes || {};
    return (opcoes.autenticado ? tokenValido() : Promise.resolve(null))
      .then(function (token) {
        if (opcoes.autenticado && !token) throw new Error('Sessão expirada. Entre novamente.');

        var cab = {
          apikey: CFG.anonKey,
          Authorization: 'Bearer ' + (token || CFG.anonKey),
          'Content-Type': 'application/json'
        };
        if (opcoes.retornar) cab.Prefer = 'return=representation';

        return fetch(CFG.url + '/rest/v1' + caminho, {
          method: opcoes.metodo || 'GET',
          headers: cab,
          body: opcoes.corpo ? JSON.stringify(opcoes.corpo) : undefined
        });
      })
      .then(function (r) {
        if (r.status === 204) return null;
        return r.json().then(function (d) {
          if (!r.ok) throw new Error(d.message || d.hint || 'Erro na requisição');
          return d;
        });
      });
  }

  /* ------------------------------------------------ banco <-> front ----- */
  function paraFront(r) {
    return {
      id: r.slug || r.id,
      uuid: r.id,
      slug: r.slug,
      marca: r.marca,
      modelo: r.modelo,
      versao: r.versao,
      anoFab: r.ano_fab,
      anoModelo: r.ano_modelo,
      km: r.km || 0,
      preco: Number(r.preco) || 0,
      precoAntigo: Number(r.preco_antigo) || 0,
      combustivel: r.combustivel,
      cambio: r.cambio,
      carroceria: r.carroceria,
      cor: r.cor,
      corDetalhe: r.cor_detalhe,
      corHex: r.cor_hex || '#cccccc',
      cidade: r.cidade,
      opcionais: r.opcionais || [],
      fotos: r.fotos || [],
      foto: (r.fotos && r.fotos[0]) || '',
      observacoes: r.observacoes,
      oferta: !!r.oferta,
      destaque: !!r.destaque,
      vendido: !!r.vendido,
      ordem: r.ordem || 0
    };
  }

  function paraBanco(v) {
    return {
      slug: v.slug || null,
      marca: v.marca, modelo: v.modelo, versao: v.versao || null,
      ano_fab: v.anoFab || null, ano_modelo: v.anoModelo || null,
      km: v.km || 0,
      preco: v.preco || 0, preco_antigo: v.precoAntigo || 0,
      combustivel: v.combustivel || null, cambio: v.cambio || null,
      carroceria: v.carroceria || null,
      cor: v.cor || null, cor_detalhe: v.corDetalhe || null, cor_hex: v.corHex || '#cccccc',
      cidade: v.cidade || null,
      opcionais: v.opcionais || [], fotos: v.fotos || [],
      observacoes: v.observacoes || null,
      oferta: !!v.oferta, destaque: !!v.destaque, vendido: !!v.vendido,
      ordem: v.ordem || 0
    };
  }

  /* --------------------------------------------------------- veículos --- */
  // admin: true traz também os vendidos
  function listar(opcoes) {
    opcoes = opcoes || {};
    var filtro = opcoes.admin ? '' : '&vendido=eq.false';
    return rest('/veiculos?select=*' + filtro + '&order=ordem.desc,criado_em.desc')
      .then(function (linhas) { return (linhas || []).map(paraFront); });
  }

  function salvar(v) {
    var corpo = paraBanco(v);
    return v.uuid
      ? rest('/veiculos?id=eq.' + v.uuid, { metodo: 'PATCH', corpo: corpo, autenticado: true, retornar: true })
      : rest('/veiculos', { metodo: 'POST', corpo: corpo, autenticado: true, retornar: true });
  }

  function remover(uuid) {
    return rest('/veiculos?id=eq.' + uuid, { metodo: 'DELETE', autenticado: true });
  }

  /* ----------------------------------------------------------- fotos ---- */
  function enviarFoto(file) {
    return tokenValido().then(function (token) {
      if (!token) throw new Error('Sessão expirada. Entre novamente.');

      var ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
      var nome = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;

      return fetch(CFG.url + '/storage/v1/object/veiculos/' + nome, {
        method: 'POST',
        headers: {
          apikey: CFG.anonKey,
          Authorization: 'Bearer ' + token,
          'Content-Type': file.type || 'image/jpeg'
        },
        body: file
      }).then(function (r) {
        if (!r.ok) return r.json().then(function (d) { throw new Error(d.message || 'Falha ao enviar a foto'); });
        return CFG.url + '/storage/v1/object/public/veiculos/' + nome;
      });
    });
  }

  function removerFoto(url) {
    var nome = String(url).split('/veiculos/').pop();
    if (!nome) return Promise.resolve();
    return tokenValido().then(function (token) {
      if (!token) return;
      return fetch(CFG.url + '/storage/v1/object/veiculos/' + nome, {
        method: 'DELETE',
        headers: { apikey: CFG.anonKey, Authorization: 'Bearer ' + token }
      }).catch(function () {});
    });
  }

  window.API = {
    configurado: configurado,
    entrar: entrar, sair: sair, sessao: sessao,
    listar: listar, salvar: salvar, remover: remover,
    enviarFoto: enviarFoto, removerFoto: removerFoto
  };
})();
