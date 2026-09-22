# Decisões de escopo do MVP (Sprint 2)

Mudanças em relação ao PRD da Sprint 1 e suas justificativas.

## Antecipação do roadmap
O PRD previa o desenvolvimento entre as Sprints 3 e 7. A disciplina exigiu o MVP
em produção na Sprint 2, então todos os requisitos Must foram concentrados nesta sprint.

## Simplificações do modelo
- **Um atendimento = uma sessão.** Tatuagens em várias sessões podem ser registradas
  como atendimentos separados por enquanto.
- **Pagamento = valor total + sinal.** O saldo é calculado automaticamente
  (total − sinal). Não há histórico de várias parcelas.
- **Status da sessão:** Agendada, Concluída e Cancelada.
- **Imagem de referência:** upload ou link, uma por atendimento, substituível.
- **Uma conta = um tatuador.** Estúdios com vários profissionais ficam para versão futura.

## Fora do MVP
- Should: busca/filtro, dashboard semanal, lembretes na plataforma.
- Could: orçamento em PDF, financeiro avançado, lembretes via WhatsApp.
- Modelo de negócio: trial, assinatura e landing page ficam para o Go-To-Market.