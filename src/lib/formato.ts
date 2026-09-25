/** Formata um numero como moeda brasileira: 1234.5 vira "R$ 1.234,50". */
export function moeda(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0)
  return numero.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/** Formata data e hora: "14/03/2026 às 15:30". */
export function dataHora(valor: string | null | undefined) {
  if (!valor) return 'Sem data definida'

  const data = new Date(valor)
  const dia = data.toLocaleDateString('pt-BR')
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dia} às ${hora}`
}

/** Formata apenas a data: "14/03/2026". */
export function data(valor: string | null | undefined) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('pt-BR')
}

/** Rotulo e cor de cada status de sessao. */
export const STATUS = {
  agendada: { rotulo: 'Agendada', cor: 'bg-emerald-950 text-emerald-300' },
  concluida: { rotulo: 'Concluída', cor: 'bg-zinc-800 text-zinc-300' },
  cancelada: { rotulo: 'Cancelada', cor: 'bg-red-950 text-red-300' },
} as const

export type StatusSessao = keyof typeof STATUS
