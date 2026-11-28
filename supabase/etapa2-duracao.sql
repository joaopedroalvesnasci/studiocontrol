-- StudioControl — Etapa 2: duração da sessão
-- Já aplicado no Supabase em 27/11/2026.

begin;

-- Duração em minutos. As sessões existentes recebem 180 (3 horas) automaticamente.
alter table public.atendimentos
  add column duracao_minutos integer not null default 180;

-- Só aceita as três durações combinadas: 3 horas, 6 horas e dia inteiro
alter table public.atendimentos
  add constraint duracao_valida check (duracao_minutos in (180, 360, 1440));

commit;
