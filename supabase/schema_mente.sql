-- =====================================================================
-- Raiz | Pilar MENTE E ESPIRITO. Seguro de rodar mais de uma vez.
-- Cola tudo no SQL Editor do Supabase e clica Run.
-- =====================================================================

-- garante a tabela de textos livres (caso ainda nao exista do pilar Corpo)
create table if not exists public.config_usuario (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  chave text not null,
  valor text,
  atualizado_em timestamptz not null default now(),
  unique (user_id, chave)
);
alter table public.config_usuario enable row level security;
drop policy if exists "config proprios" on public.config_usuario;
create policy "config proprios" on public.config_usuario
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------- crises de ansiedade (um registro por dia)
create table if not exists public.crises_ansiedade (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia date not null,
  nota text,
  criado_em timestamptz not null default now(),
  unique (user_id, dia)
);
alter table public.crises_ansiedade enable row level security;
drop policy if exists "crises proprias" on public.crises_ansiedade;
create policy "crises proprias" on public.crises_ansiedade
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------- remedios (controle de prazo/estoque)
-- qtd_atual e por_dia, mais a data em que foi conferido: o app desconta sozinho.
create table if not exists public.remedios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null,
  qtd_atual numeric not null default 0,
  por_dia numeric not null default 1,
  conferido_em date not null default current_date,
  notas text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.remedios enable row level security;
drop policy if exists "remedios proprios" on public.remedios;
create policy "remedios proprios" on public.remedios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------- praticas espirituais (recorrentes)
create table if not exists public.praticas_espirituais (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  frequencia text not null default 'diaria'
    check (frequencia in ('diaria', 'semanal', 'mensal', 'pontual')),
  concluido_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.praticas_espirituais enable row level security;
drop policy if exists "praticas proprias" on public.praticas_espirituais;
create policy "praticas proprias" on public.praticas_espirituais
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------- gratidao (diario leve)
create table if not exists public.gratidao (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  texto text not null,
  criado_em timestamptz not null default now()
);
alter table public.gratidao enable row level security;
drop policy if exists "gratidao propria" on public.gratidao;
create policy "gratidao propria" on public.gratidao
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
