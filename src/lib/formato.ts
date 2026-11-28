/**
 * Fuso do estúdio. O servidor da Vercel roda em UTC (horário de Londres),
 * então toda data é formatada explicitamente no horário de Brasília.
 */
export const FUSO = 'America/Sao_Paulo'

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
  const dia = data.toLocaleDateString('pt-BR', { timeZone: FUSO })
  const hora = data.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: FUSO,
  })

  return `${dia} às ${hora}`
}

/** Formata apenas a data: "14/03/2026". */
export function data(valor: string | null | undefined) {
  if (!valor) return '—'
  return new Date(valor).toLocaleDateString('pt-BR', { timeZone: FUSO })
}

/**
 * Dia no fuso do estúdio, no formato "2026-11-27".
 * Serve para comparar datas sem erro de fuso.
 */
export function chaveDoDia(valor: string | Date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: FUSO,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(valor))
}

/** A data cai hoje, no horário de Brasília? */
export function ehHoje(valor: string | null | undefined) {
  return Boolean(valor) && chaveDoDia(valor!) === chaveDoDia()
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

/** Formas de pagamento aceitas pelo banco (ver supabase/etapa1-pagamentos.sql). */
export const FORMAS = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  debito: 'Débito',
  credito: 'Crédito',
  nao_informada: 'Não informada',
} as const

export type FormaPagamento = keyof typeof FORMAS

/** Formas que aparecem como botão ao confirmar (sem "Não informada"). */
export const FORMAS_ESCOLHA: FormaPagamento[] = ['pix', 'dinheiro', 'debito', 'credito']

/** Nome legível de uma forma salva no banco. */
export function nomeForma(forma: string | null | undefined) {
  return FORMAS[(forma ?? 'nao_informada') as FormaPagamento] ?? 'Não informada'
}

/**
 * Data com início e fim da sessão: "28/11/2026 · 18:00 às 21:00".
 * Sessões de dia inteiro (1440 minutos) mostram "Dia inteiro".
 * Com `curto`, omite o ano: "28/11 · 18:00 às 21:00" (usado na Agenda).
 */
export function periodo(
  dataSessao: string | null | undefined,
  duracaoMinutos: number | null | undefined,
  curto = false
) {
  if (!dataSessao) return 'Sem data definida'

  const minutos = Number(duracaoMinutos ?? 180)
  const dia = curto
    ? new Date(dataSessao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: FUSO })
    : data(dataSessao)
  if (minutos >= 1440) return `${dia} · Dia inteiro`

  const inicio = new Date(dataSessao)
  const fim = new Date(inicio.getTime() + minutos * 60_000)
  const hora = (d: Date) =>
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: FUSO })

  return `${dia} · ${hora(inicio)} às ${hora(fim)}`
}
