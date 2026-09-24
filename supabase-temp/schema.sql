-- StudioControl — estrutura do banco (Sprint 2)
-- Rodar no Supabase: SQL Editor > New query > Run

-- =====================================================
-- TABELA: clientes
-- =====================================================
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text not null check (length(trim(nome)) > 0),
  telefone text,
  instagram text,
  observacoes text,
  created_at timestamptz not null default now()
);

create index clientes_user_id_idx on public.clientes(user_id);

-- =====================================================
-- TABELA: atendimentos
-- =====================================================
create table public.atendimentos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  descricao text not null check (length(trim(descricao)) > 0),
  imagem_url text,
  valor_total numeric(10,2) not null default 0 check (valor_total >= 0),
  valor_sinal numeric(10,2) not null default 0 check (valor_sinal >= 0),
  valor_restante numeric(10,2) generated always as (valor_total - valor_sinal) stored,
  data_sessao timestamptz,
  status text not null default 'agendada'
    check (status in ('agendada', 'concluida', 'cancelada')),
  created_at timestamptz not null default now(),
  constraint sinal_nao_maior_que_total check (valor_sinal <= valor_total)
);

create index atendimentos_user_id_idx on public.atendimentos(user_id);
create index atendimentos_cliente_id_idx on public.atendimentos(cliente_id);
create index atendimentos_data_sessao_idx on public.atendimentos(data_sessao);

-- =====================================================
-- SEGURANÇA (RLS): cada tatuador vê apenas os seus dados
-- =====================================================
alter table public.clientes enable row level security;
alter table public.atendimentos enable row level security;

create policy "clientes_select_proprios" on public.clientes
  for select using (auth.uid() = user_id);
create policy "clientes_insert_proprios" on public.clientes
  for insert with check (auth.uid() = user_id);
create policy "clientes_update_proprios" on public.clientes
  for update using (auth.uid() = user_id);
create policy "clientes_delete_proprios" on public.clientes
  for delete using (auth.uid() = user_id);

create policy "atendimentos_select_proprios" on public.atendimentos
  for select using (auth.uid() = user_id);
create policy "atendimentos_insert_proprios" on public.atendimentos
  for insert with check (auth.uid() = user_id);
create policy "atendimentos_update_proprios" on public.atendimentos
  for update using (auth.uid() = user_id);
create policy "atendimentos_delete_proprios" on public.atendimentos
  for delete using (auth.uid() = user_id);