/* ==========================================================================
   CONFIGURAÇÃO DO SITE
   Único arquivo que você precisa editar para trocar dados de contato,
   nome da loja, redes sociais e itens do menu.
   ========================================================================== */
window.SITE = {
  nome: "MC Consulting",
  logo: "assets/img/logo-preta.png",   // header claro
  logoClara: "assets/img/logo.png",    // footer azul
  banner: "assets/img/banner-home.png",

  contato: {
    // Telefone fixo — deixe "" para esconder o botão vermelho de ligação
    telefone: "",
    telefoneLink: "",
    whatsapp: "(61) 99978-3789",
    whatsappLink: "https://wa.me/5561999783789",
    email: "contato@dominio.com.br",
    endereco: "Rua Exemplo, 000 — Cidade/UF",
    horario: "Segunda a sexta: 00:00 às 00:00 | Sábados: 00:00 às 00:00",
  },

  // Deixe "" para esconder o widget lateral da rede
  redes: {
    instagram: "#",
    facebook: "#",
  },

  menu: [
    { label: "Empresa",      href: "empresa.html" },
    { label: "Estoque",      href: "index.html" },
    { label: "Avaliação",    href: "avaliacao.html" },
    { label: "Financiamento", href: "financiamento.html" },
    { label: "Contato",      href: "contato.html" },
  ],

  // Nuvem de tags do rodapé — preencha quando tiver o estoque
  marcas: [],
  modelos: [],
};
