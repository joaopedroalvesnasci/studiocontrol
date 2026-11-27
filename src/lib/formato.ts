/** Formata um número como moeda brasileira: 1234.5 vira "R$ 1.234,50". */
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

/** Rótulo e estilo de cada status de sessão (etiqueta com contorno, como no protótipo). */
export const STATUS = {
  agendada: { rotulo: 'Agendada', cor: 'border-destaque text-destaque' },
  concluida: { rotulo: 'Concluída', cor: 'border-zinc-400 text-zinc-200' },
  cancelada: { rotulo: 'Cancelada', cor: 'border-red-400 text-red-300' },
} as const

export type StatusSessao = keyof typeof STATUS

/** Classes base da etiqueta de status. */
export const ETIQUETA = 'shrink-0 rounded-md border px-3 py-1 text-xs tracking-wide'
