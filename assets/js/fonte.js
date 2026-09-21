/* ==========================================================================
   FONTE DO ESTOQUE
   Decide de onde vêm os veículos: do Supabase, quando configurado, ou do
   arquivo assets/js/dados.js. Se o banco estiver configurado mas falhar
   (rede, projeto pausado), cai no arquivo em vez de deixar a página vazia.

   window.estoquePronto → Promise que resolve com a lista e preenche
                          window.VEICULOS antes das telas renderizarem.
   ========================================================================== */
window.estoquePronto = (function () {
  var local = window.VEICULOS || [];

  if (!window.API || !window.API.configurado()) {
    return Promise.resolve(local);
  }

  return window.API.listar()
    .then(function (lista) {
      // Banco configurado e ainda vazio: mostra o arquivo para a página não
      // nascer sem nada. Assim que o primeiro veículo for cadastrado, o
      // banco assume.
      window.VEICULOS = lista.length ? lista : local;
      return window.VEICULOS;
    })
    .catch(function (erro) {
      console.warn('[estoque] falha ao ler o Supabase, usando dados.js:', erro.message);
      window.VEICULOS = local;
      return local;
    });
})();
