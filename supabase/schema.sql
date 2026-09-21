-- ===========================================================================
-- MC CONSULTING — estrutura do banco
-- Cole este arquivo inteiro no Supabase: SQL Editor > New query > Run.
-- Pode rodar mais de uma vez sem quebrar nada.
-- ===========================================================================

-- ---------------------------------------------------------------- tabela ---
create table if not exists public.veiculos (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique,

  marca         text not null,
  modelo        text not null,
  versao        text,

  ano_fab       int,
  ano_modelo    int,
  km            int          default 0,

  preco         numeric(12,2) default 0,   -- 0 = mostra "Consulte"
  preco_antigo  numeric(12,2) default 0,   -- 0 = sem preço "de"

  combustivel   text,
  cambio        text,
  carroceria    text,
  cor           text,
  cor_detalhe   text,                      -- "Branco Pérola"
  cor_hex       text         default '#cccccc',

  cidade        text         default 'Brasília (DF)',
  opcionais     text[]       default '{}',
  fotos         text[]       default '{}', -- URLs públicas do Storage
  observacoes   text,

  oferta        boolean      default false,
  destaque      boolean      default false,
  vendido       boolean      default false,
  ordem         int          default 0,

  criado_em     timestamptz  default now(),
  atualizado_em timestamptz  default now()
);

create index if not exists veiculos_vendido_idx on public.veiculos (vendido);
create index if not exists veiculos_marca_idx   on public.veiculos (marca);
create index if not exists veiculos_ordem_idx   on public.veiculos (ordem desc, criado_em desc);

-- ------------------------------------------------- atualizado_em automático -
create or replace function public.tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists veiculos_atualizado_em on public.veiculos;
create trigger veiculos_atualizado_em
  before update on public.veiculos
  for each row execute function public.tocar_atualizado_em();

-- --------------------------------------------------------------- acesso ---
-- Garante o acesso via API mesmo se o projeto foi criado com
-- "Automatically expose new tables" desligado.
grant usage on schema public to anon, authenticated;
grant select on public.veiculos to anon, authenticated;
grant insert, update, delete on public.veiculos to authenticated;

-- ------------------------------------------------------------------- RLS ---
-- A chave anônima é pública por natureza (fica no JavaScript do site).
-- Quem protege os dados é o RLS: qualquer um lê, só logado escreve.
alter table public.veiculos enable row level security;

drop policy if exists "leitura publica"      on public.veiculos;
drop policy if exists "escrita autenticada"  on public.veiculos;

create policy "leitura publica"
  on public.veiculos for select
  to anon, authenticated
  using (true);

create policy "escrita autenticada"
  on public.veiculos for all
  to authenticated
  using (true)
  with check (true);

-- --------------------------------------------------------------- storage ---
insert into storage.buckets (id, name, public)
values ('veiculos', 'veiculos', true)
on conflict (id) do update set public = true;

drop policy if exists "fotos leitura publica"  on storage.objects;
drop policy if exists "fotos envio autenticado" on storage.objects;
drop policy if exists "fotos troca autenticada" on storage.objects;
drop policy if exists "fotos exclusao autenticada" on storage.objects;

create policy "fotos leitura publica"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'veiculos');

create policy "fotos envio autenticado"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'veiculos');

create policy "fotos troca autenticada"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'veiculos');

create policy "fotos exclusao autenticada"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'veiculos');

-- ===========================================================================
-- Depois de rodar:
-- 1. Authentication > Users > Add user  → crie o login da loja (e-mail e senha).
--    Não existe cadastro aberto no painel: só quem você criar aqui entra.
-- 2. Desligue o cadastro público em Authentication > Sign In / Providers >
--    "Allow new users to sign up".
-- 3. Project Settings > API → copie "Project URL" e a chave "anon public"
--    para assets/js/config.supabase.js
-- ===========================================================================
