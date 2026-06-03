-- =====================================================================
-- Raiz | Pilar CORPO. Seguro de rodar mais de uma vez.
-- Cola tudo no SQL Editor do Supabase e clica Run.
-- =====================================================================

-- ----------------------------------------- saude_eventos (medicos, checkup, exames)
create table if not exists public.saude_eventos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  tipo text not null default 'consulta'
    check (tipo in ('consulta', 'exame', 'checkup', 'lembrete')),
  data date,
  feito boolean not null default false,
  recorrencia text not null default 'unica'
    check (recorrencia in ('unica', 'anual')),
  notas text,
  criado_em timestamptz not null default now()
);
alter table public.saude_eventos enable row level security;
drop policy if exists "saude_eventos proprios" on public.saude_eventos;
create policy "saude_eventos proprios" on public.saude_eventos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------- exercicios (movimento)
create table if not exists public.exercicios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  frequencia text not null default 'semanal'
    check (frequencia in ('diaria', 'semanal', 'mensal', 'pontual')),
  concluido_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.exercicios enable row level security;
drop policy if exists "exercicios proprios" on public.exercicios;
create policy "exercicios proprios" on public.exercicios
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------------------------------ skincare (rotina de pele)
create table if not exists public.skincare_itens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  periodo text not null default 'manha' check (periodo in ('manha', 'noite')),
  titulo text not null,
  concluido_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.skincare_itens enable row level security;
drop policy if exists "skincare proprios" on public.skincare_itens;
create policy "skincare proprios" on public.skincare_itens
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------------------------- peso (acompanhamento)
create table if not exists public.peso_registros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  dia date not null,
  valor numeric not null,
  criado_em timestamptz not null default now(),
  unique (user_id, dia)
);
alter table public.peso_registros enable row level security;
drop policy if exists "peso proprios" on public.peso_registros;
create policy "peso proprios" on public.peso_registros
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- --------------------------------------- alimentacao: habitos gentis (recorrentes)
create table if not exists public.alimentacao_habitos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null,
  concluido_em timestamptz,
  ordem int not null default 0,
  criado_em timestamptz not null default now()
);
alter table public.alimentacao_habitos enable row level security;
drop policy if exists "alimentacao_habitos proprios" on public.alimentacao_habitos;
create policy "alimentacao_habitos proprios" on public.alimentacao_habitos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ------------------------------- textos livres do usuario (ex: plano alimentar)
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
