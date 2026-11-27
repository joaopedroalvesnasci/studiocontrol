-- StudioControl — Etapa 1: confirmação de sinal e pagamento
-- Tudo dentro de uma transação: se qualquer linha falhar, nada é aplicado.

begin;

-- 1. Colunas novas: quando e como o sinal e o restante foram recebidos
alter table public.atendimentos
  add column sinal_recebido_em timestamptz,
  add column sinal_forma text,
  add column pagamento_recebido_em timestamptz,
  add column pagamento_forma text;

-- 2. Regras: só formas conhecidas, e data e forma sempre juntas
alter table public.atendimentos
  add constraint sinal_forma_valida
    check (sinal_forma in ('pix', 'dinheiro', 'debito', 'credito', 'nao_informada')),
  add constraint pagamento_forma_valida
    check (pagamento_forma in ('pix', 'dinheiro', 'debito', 'credito', 'nao_informada')),
  add constraint sinal_data_e_forma
    check ((sinal_recebido_em is null) = (sinal_forma is null)),
  add constraint pagamento_data_e_forma
    check ((pagamento_recebido_em is null) = (pagamento_forma is null));

-- 3. Preencher os atendimentos antigos
update public.atendimentos
set sinal_recebido_em = created_at,
    sinal_forma = 'nao_informada'
where valor_sinal > 0;

update public.atendimentos
set pagamento_recebido_em = coalesce(data_sessao, created_at),
    pagamento_forma = 'nao_informada'
where status = 'concluida';

-- 4. Recalcular o "a cobrar" considerando o que foi confirmado
alter table public.atendimentos drop column valor_restante;
alter table public.atendimentos
  add column valor_restante numeric(10,2) generated always as (
    case
      when pagamento_recebido_em is not null then 0
      when sinal_recebido_em is not null then valor_total - valor_sinal
      else valor_total
    end
  ) stored;

-- 5. Índices para a futura aba Financeiro
create index atendimentos_sinal_recebido_idx
  on public.atendimentos(user_id, sinal_recebido_em);
create index atendimentos_pagamento_recebido_idx
  on public.atendimentos(user_id, pagamento_recebido_em);

commit;