-- =====================================================================
-- Raiz | EUROTRIP. Seguro de rodar mais de uma vez.
-- Cola tudo no SQL Editor do Supabase e clica Run.
-- =====================================================================

-- garante a tabela de textos livres (caso ainda nao exista)
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

-- ------------------------------------------------------- paradas do roteiro
create table if not exists public.viagem_paradas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pais text not null,
  cidade text not null,
  dias int not null default 1,
  deslocamento text,
  notas text,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.viagem_paradas enable row level security;
drop policy if exists "paradas proprias" on public.viagem_paradas;
create policy "paradas proprias" on public.viagem_paradas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------- checklist de preparacao
create table if not exists public.viagem_checklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  feito boolean not null default false,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.viagem_checklist enable row level security;
drop policy if exists "checklist proprio" on public.viagem_checklist;
create policy "checklist proprio" on public.viagem_checklist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------------- orcamento
create table if not exists public.viagem_orcamento (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  categoria text not null default 'Outros',
  descricao text not null,
  valor numeric not null default 0,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.viagem_orcamento enable row level security;
drop policy if exists "orcamento proprio" on public.viagem_orcamento;
create policy "orcamento proprio" on public.viagem_orcamento
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
