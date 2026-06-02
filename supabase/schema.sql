-- =====================================================================
-- Raiz | Schema inicial (fundacao)
-- Rode isto no SQL Editor do seu projeto Supabase.
-- Cada pagina que a gente construir vai adicionar suas proprias tabelas
-- aqui embaixo, sempre com RLS, pra que so voce veja seus dados.
-- =====================================================================

-- Check-in diario de humor (usado no Dashboard)
create table if not exists public.checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia date not null,
  humor smallint not null check (humor between 0 and 4),
  nota text,
  criado_em timestamptz not null default now(),
  unique (user_id, dia)
);

alter table public.checkins enable row level security;

-- Politicas: o usuario so enxerga e mexe nas proprias linhas
create policy "ler proprios checkins"
  on public.checkins for select
  using (auth.uid() = user_id);

create policy "inserir proprios checkins"
  on public.checkins for insert
  with check (auth.uid() = user_id);

create policy "atualizar proprios checkins"
  on public.checkins for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "apagar proprios checkins"
  on public.checkins for delete
  using (auth.uid() = user_id);


-- =====================================================================
-- CASA | Rotina (tarefas recorrentes) + Compras (decoracao e melhorias)
-- =====================================================================

create table if not exists public.tarefas_casa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  frequencia text not null default 'semanal'
    check (frequencia in ('diaria', 'semanal', 'mensal', 'pontual')),
  concluido_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.tarefas_casa enable row level security;
create policy "tarefas_casa proprias" on public.tarefas_casa
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.compras_casa (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  comprado boolean not null default false,
  prioridade text not null default 'media'
    check (prioridade in ('baixa', 'media', 'alta')),
  preco_estimado numeric,
  comprado_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.compras_casa enable row level security;
create policy "compras_casa proprias" on public.compras_casa
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- =====================================================================
-- SONHOS E METAS | metas (pessoais/profissionais) + passos (passo a passo)
-- Os passos podem se LIGAR a uma compra ou a uma tarefa de outra area.
-- =====================================================================

create table if not exists public.metas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  tipo text not null default 'pessoal'
    check (tipo in ('pessoal', 'profissional')),
  descricao text,
  prazo date,
  concluida boolean not null default false,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.metas enable row level security;
create policy "metas proprias" on public.metas
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.meta_passos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  meta_id uuid not null references public.metas (id) on delete cascade,
  titulo text not null,
  concluido boolean not null default false,
  ordem int not null default 0,
  -- ligacao com outra area (opcional)
  vinculo_tipo text check (vinculo_tipo in ('compra', 'tarefa')),
  vinculo_id uuid,
  criado_em timestamptz not null default now()
);
alter table public.meta_passos enable row level security;
create policy "meta_passos proprios" on public.meta_passos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
