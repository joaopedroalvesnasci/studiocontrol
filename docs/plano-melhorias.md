# Plano de melhorias (pós-Sprint 2)

Cada etapa é desenvolvida em sua própria branch, com `npm run build` antes do push,
teste guiado, revisão em Pull Request e conferência em produção antes da próxima.

| Etapa | O que entra | Banco |
|---|---|---|
| 0 | Datas e "Hoje" no fuso de São Paulo | — |
| 1 | Confirmação de sinal e restante, com data e forma de pagamento | 4 colunas |
| 2 | Pendências (sessões atrasadas e pagamentos a receber) e "Sem data marcada" | — |
| 3 | Reagendar, com contagem de remarcações | 1 coluna |
| 4 | Alternância Lista / Calendário na Agenda | — |
| 5 | Aba Financeiro (faturamento) | — |
| Futuro | Despesas, materiais, estoque e lucro | — |

## Decisões

**Fuso horário.** O servidor da Vercel roda em UTC. Toda formatação de data usa
`America/Sao_Paulo`, e comparações de dia usam `chaveDoDia()` e `ehHoje()`
(`src/lib/formato.ts`). Sem isso, horários apareciam 3 horas adiantados em produção
e o "Hoje" falhava entre 21h e meia-noite.

**Pagamentos.** Sinal e restante têm confirmação própria, com data e forma
(Pix, Dinheiro, Débito, Crédito). Débito e crédito ficam separados porque as taxas
da maquininha são diferentes. O restante é sempre pago de uma vez; não há parcelas.

**Atendimentos anteriores à Etapa 1.** São preenchidos automaticamente: sinal
cadastrado conta como recebido (data do cadastro), sessões concluídas contam como
quitadas (data da sessão), e a forma de pagamento fica "não informada".

**Pendências.** Uma sessão agendada vira pendente a partir do dia seguinte à data
marcada, já que uma sessão de tatuagem dura horas.

**Reagendamento.** Registra quantas vezes o atendimento foi remarcado, para
identificar clientes que costumam faltar.

**Calendário.** A Agenda abre na lista; um botão alterna para o calendário do mês.

**Financeiro.** Mostra faturamento, não lucro, porque o sistema ainda não registra
despesas. Cada valor conta no mês em que foi recebido. Aba própria na barra
inferior, entre Clientes e Perfil. Períodos: este mês, mês passado, 3 meses,
este ano e intervalo personalizado.