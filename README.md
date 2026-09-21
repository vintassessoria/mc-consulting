# MC Consulting — site de estoque

HTML/CSS/JS puro, sem build e sem dependências. O estoque vem do Supabase quando configurado; sem ele, o site usa `assets/js/dados.js`.

## Rodar local

```bash
npx -y serve -l 4321 .
```

Site em `http://localhost:4321` e painel em `http://localhost:4321/admin/`.

---

# Colocar no ar — 3 etapas

## 1. Banco de dados (Supabase)

1. Crie uma conta em **supabase.com** e um projeto novo (região *South America (São Paulo)*).
2. No menu lateral: **SQL Editor > New query**. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**. Isso cria a tabela de veículos, as permissões e a pasta de fotos.
3. **Authentication > Users > Add user**: crie o login da loja (e-mail e senha). Só quem você criar aqui consegue entrar no painel.
4. **Authentication > Sign In / Providers**: desligue *Allow new users to sign up*, para ninguém criar conta sozinho.
5. **Project Settings > API**: copie **Project URL** e a chave **anon public**.
6. Cole as duas em `assets/js/config.supabase.js`.

> A chave `anon public` é feita para ficar visível no site — quem protege os dados é o RLS criado pelo `schema.sql`: qualquer visitante lê o estoque, só quem tem login altera. **Nunca** use aqui a chave `service_role`.

## 2. Publicar (Vercel)

Sem instalar nada:

1. Entre em **vercel.com** com sua conta.
2. **Add New > Project > Deploy** e arraste a pasta do site.
3. Pronto — sai um endereço `.vercel.app` com HTTPS.

Ou pelo terminal, de dentro da pasta:

```bash
npx vercel --prod
```

O `vercel.json` já cuida dos cabeçalhos de segurança, do cache e de manter o `/admin` fora dos buscadores. O `.vercelignore` impede que o PDF do brandbook e a pasta `supabase/` subam junto.

**Domínio próprio:** Vercel > Project > Settings > Domains > Add, e aponte o DNS conforme as instruções que aparecem lá.

## 3. Cadastrar o estoque

Acesse `https://seu-site.vercel.app/admin/`, entre com o login criado no passo 1.4 e cadastre os veículos. As alterações aparecem no site na hora — não precisa publicar de novo.

---

## O painel

| Ação | Como |
| --- | --- |
| Novo veículo | botão **+ Novo veículo** |
| Editar | botão **Editar** na linha |
| Tirar da vitrine sem apagar | botão **Vendido** (continua no painel, sai do site) |
| Apagar de vez | dentro da edição, **Excluir** |
| Ordem na vitrine | campo **Prioridade** — número maior aparece primeiro |
| Preço sob consulta | deixe o preço em **0** → o site mostra "Consulte" |
| Fotos | clique na área tracejada; a **primeira foto é a capa** |

---

## Estrutura

| Arquivo | Papel |
| --- | --- |
| `assets/js/site.config.js` | telefone, WhatsApp, e-mail, endereço, redes, menu, logo, banner |
| `assets/js/config.supabase.js` | URL e chave do banco |
| `assets/js/api.js` | cliente do Supabase em fetch puro (auth, veículos, fotos) |
| `assets/js/fonte.js` | decide entre banco e arquivo local |
| `assets/js/dados.js` | estoque de reserva, usado quando o banco não responde |
| `assets/js/layout.js` | header, footer e widgets fixos de todas as páginas |
| `assets/js/estoque.js` | filtros, ordenação, card e favoritos |
| `assets/css/style.css` | identidade visual (bloco `:root`) |
| `admin/` | painel |
| `supabase/schema.sql` | estrutura do banco |

### Páginas

- `index.html` — estoque: banner, filtros e grid
- `veiculo.html?id=...` — detalhe
- `empresa.html`, `avaliacao.html`, `financiamento.html`, `contato.html`, `politica-de-privacidade.html` — cascas a preencher

Header e footer são injetados por `layout.js` nos slots `<div data-layout="header">` e `<div data-layout="footer">`. Para uma página nova, copie `empresa.html` e troque o `data-page` do `<body>`.

Os filtros da lateral e a nuvem de tags do rodapé se montam sozinhos a partir do estoque — não há lista fixa para manter.

---

## Identidade — brandbook MC Consulting

```
--azul      #0d3378   header ativo, preços, CTA, footer
--azul-esc  #08224f   hover e faixa de copyright
--cinza     #d2d2d2   detalhes
--preto     #0a0a0a   texto, selo de oferta
--verde     #25d366   WhatsApp (cor funcional, não é da marca)
```

Fonte: Outfit (arquivos locais em `assets/fonts/outfit/`), geométrica como o wordmark da logo.

| Imagem | Uso |
| --- | --- |
| `assets/img/logo-preta.png` | header claro (`SITE.logo`) |
| `assets/img/logo.png` | footer azul (`SITE.logoClara`) |
| `assets/img/banner-home.png` | hero da home (`SITE.banner`) |

`MC CONSULTING BRANDBOOK.pdf` fica na raiz só como referência e não vai para o deploy.

---

## Pendências

- **Preços dos 7 veículos** — todos estão como "Consulte".
- **Ano do Etios XS 1.5** — não informado.
- **Fotos** — nenhuma foto cadastrada; os cards usam o placeholder.
- **Páginas internas** — Empresa, Avaliação, Financiamento e Contato estão vazias.
