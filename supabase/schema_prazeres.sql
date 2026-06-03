-- =====================================================================
-- Raiz | Pilar PRAZERES. Seguro de rodar mais de uma vez.
-- Cola tudo no SQL Editor do Supabase e clica Run.
-- =====================================================================

-- ------------------------------------------------ midias (filmes e series)
create table if not exists public.midias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  tipo text not null default 'filme' check (tipo in ('filme', 'serie')),
  status text not null default 'quero' check (status in ('quero', 'assistindo', 'visto')),
  nota smallint check (nota between 1 and 5),
  onde text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.midias enable row level security;
drop policy if exists "midias proprias" on public.midias;
create policy "midias proprias" on public.midias
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------- livros (leitura)
create table if not exists public.livros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  autor text,
  status text not null default 'quero' check (status in ('quero', 'lendo', 'lido')),
  nota smallint check (nota between 1 and 5),
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.livros enable row level security;
drop policy if exists "livros proprios" on public.livros;
create policy "livros proprios" on public.livros
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------------------------------- hobbies
create table if not exists public.hobbies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  ultima_vez timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.hobbies enable row level security;
drop policy if exists "hobbies proprios" on public.hobbies;
create policy "hobbies proprios" on public.hobbies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
