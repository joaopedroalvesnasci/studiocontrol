-- Etapa 4: contagem de remarcações por sessão
-- Só conta quando uma sessão que já tinha data muda de data.
begin;

alter table public.atendimentos
  add column reagendamentos integer not null default 0;

alter table public.atendimentos
  add constraint reagendamentos_nao_negativo check (reagendamentos >= 0);

commit;
