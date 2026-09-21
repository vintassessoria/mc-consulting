/* ==========================================================================
   ESTOQUE — fonte de dados dos veículos.
   Os filtros da sidebar e a nuvem de tags do rodapé são montados
   automaticamente a partir daqui.

   Campos:
     id          usado na URL do detalhe (veiculo.html?id=...)
     preco       número puro, sem R$ nem pontos. 0 = mostra "Consulte"
     precoAntigo 0 ou ausente = sem preço "de"
     oferta      true mostra o selo
     foto        "" usa o placeholder; troque pelo caminho da imagem
     corDetalhe  nome comercial da cor (ex.: "Branco Pérola"); o campo `cor`
                 continua sendo o valor usado no filtro
     opcionais   lista exibida na página de detalhe
   ========================================================================== */
window.VEICULOS = [
  {
    id: "jaecoo-7-elite",
    marca: "JAECOO", modelo: "7", versao: "Elite 1.6 Turbo Aut.",
    anoFab: 2026, anoModelo: 2027,
    preco: 0,
    km: 2870, combustivel: "GASOLINA", cambio: "Automático",
    cor: "PRETO", corHex: "#000000", carroceria: "suv",
    cidade: "Brasília (DF)", foto: "",
    opcionais: []
  },
  {
    id: "etios-xs-hatch",
    marca: "TOYOTA", modelo: "ETIOS", versao: "XS 1.5 Hatch",
    anoFab: null, anoModelo: null,          // ano não informado
    preco: 0,
    km: 104000, combustivel: "FLEX", cambio: "Manual",
    cor: "BRANCO", corHex: "#ffffff", corDetalhe: "Branco Pérola",
    carroceria: "hatch",
    cidade: "Brasília (DF)", foto: "",
    opcionais: []
  },
  {
    id: "renegade-trailhawk",
    marca: "JEEP", modelo: "RENEGADE", versao: "Trailhawk 2.0 Diesel 4x4 Aut.",
    anoFab: 2015, anoModelo: 2016,
    preco: 0,
    km: 137000, combustivel: "DIESEL", cambio: "Automático",
    cor: "PRATA", corHex: "#cccccc", carroceria: "suv",
    cidade: "Brasília (DF)", foto: "",
    opcionais: ["4X4"]
  },
  {
    id: "civic-lxr",
    marca: "HONDA", modelo: "CIVIC", versao: "LXR 2.0 Aut.",
    anoFab: 2013, anoModelo: 2014,
    preco: 0,
    km: 186000, combustivel: "FLEX", cambio: "Automático",
    cor: "BRANCO", corHex: "#ffffff", carroceria: "sedan",
    cidade: "Brasília (DF)", foto: "",
    opcionais: []
  },
  {
    id: "compass-80-anos",
    marca: "JEEP", modelo: "COMPASS", versao: "Longitude Série 80 Anos 1.3 T270 Aut.",
    anoFab: 2021, anoModelo: 2022,
    preco: 0,
    km: 59000, combustivel: "FLEX", cambio: "Automático",
    cor: "CINZA", corHex: "#8c8c8c", carroceria: "suv",
    cidade: "Brasília (DF)", foto: "",
    opcionais: []
  },
  {
    id: "corolla-cross-xre",
    marca: "TOYOTA", modelo: "COROLLA CROSS", versao: "XRE 2.0 CVT",
    anoFab: 2023, anoModelo: 2023,
    preco: 0,
    km: 54000, combustivel: "FLEX", cambio: "CVT",
    cor: "BRANCO", corHex: "#ffffff", corDetalhe: "Branco Pérola",
    carroceria: "suv",
    cidade: "Brasília (DF)", foto: "",
    opcionais: []
  },
  {
    id: "hilux-srx",
    marca: "TOYOTA", modelo: "HILUX", versao: "SRX 2.8 Diesel 4x4 Aut.",
    anoFab: 2021, anoModelo: 2022,
    preco: 0,
    km: 126000, combustivel: "DIESEL", cambio: "Automático",
    cor: "CINZA", corHex: "#8c8c8c", carroceria: "caminhonete",
    cidade: "Brasília (DF)", foto: "",
    opcionais: ["4X4"]
  }
];
