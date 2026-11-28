import type { SupabaseClient } from '@supabase/supabase-js'
import { chaveDoDia, FUSO } from './formato'

/** Durações aceitas pelo banco (ver supabase/etapa2-duracao.sql). */
export const DURACOES = [
  { minutos: 180, rotulo: '3 horas' },
  { minutos: 360, rotulo: '6 horas' },
  { minutos: 1440, rotulo: 'Dia inteiro' },
] as const

export const DURACAO_PADRAO = 180
export const DIA_INTEIRO = 1440

// O Brasil não tem horário de verão desde 2019: Brasília é sempre -03:00
const DESLOCAMENTO = '-03:00'
const UM_DIA = 24 * 60 * 60 * 1000

export type Intervalo = { inicio: Date; fim: Date }

export type SessaoOcupada = {
  id: string
  descricao: string
  data_sessao: string
  duracao_minutos: number
  clientes: { nome: string } | null
}

/** Meia-noite (horário de Brasília) do dia em que a data cai. */
export function inicioDoDia(data: Date) {
  return new Date(`${chaveDoDia(data)}T00:00:00${DESLOCAMENTO}`)
}

/** Período ocupado por uma sessão. "Dia inteiro" ocupa da meia-noite à meia-noite. */
export function intervalo(dataSessao: string | Date, duracaoMinutos: number): Intervalo {
  const data = new Date(dataSessao)

  if (duracaoMinutos >= DIA_INTEIRO) {
    const inicio = inicioDoDia(data)
    return { inicio, fim: new Date(inicio.getTime() + UM_DIA) }
  }

  return { inicio: data, fim: new Date(data.getTime() + duracaoMinutos * 60_000) }
}

/** Dois períodos se chocam se um começa antes do outro terminar. */
export function sobrepoe(a: Intervalo, b: Intervalo) {
  return a.inicio < b.fim && b.inicio < a.fim
}

/** Sessões que ocupam parte do período desejado. */
export function conflitos(desejado: Intervalo, sessoes: SessaoOcupada[], ignorarId?: string) {
  return sessoes.filter(
    (s) => s.id !== ignorarId && sobrepoe(desejado, intervalo(s.data_sessao, s.duracao_minutos))
  )
}

/**
 * Primeiro horário do mesmo dia, depois do desejado, em que a sessão cabe inteira.
 * Os candidatos são os horários em que outras sessões terminam.
 */
export function proximoHorarioLivre(
  desejado: Date,
  duracaoMinutos: number,
  sessoes: SessaoOcupada[],
  ignorarId?: string
): Date | null {
  if (duracaoMinutos >= DIA_INTEIRO) return null

  const dia = chaveDoDia(desejado)
  const ocupados = sessoes
    .filter((s) => s.id !== ignorarId)
    .map((s) => intervalo(s.data_sessao, s.duracao_minutos))

  const candidatos = ocupados
    .map((o) => o.fim)
    .filter((fim) => fim > desejado)
    .sort((a, b) => a.getTime() - b.getTime())

  for (const inicio of candidatos) {
    if (chaveDoDia(inicio) !== dia) break
    const teste = { inicio, fim: new Date(inicio.getTime() + duracaoMinutos * 60_000) }
    if (!ocupados.some((o) => sobrepoe(teste, o))) return inicio
  }

  return null
}

/** Converte uma data para o formato do campo datetime-local: "2026-11-28T21:00". */
export function paraCampoDataHora(data: Date) {
  const hora = new Intl.DateTimeFormat('en-GB', {
    timeZone: FUSO,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(data)
  return `${chaveDoDia(data)}T${hora}`
}

/**
 * Sessões agendadas em volta do dia escolhido (véspera até o dia seguinte),
 * para pegar também sessões longas que começam no dia anterior.
 */
export async function buscarSessoesProximas(
  supabase: SupabaseClient,
  data: Date
): Promise<SessaoOcupada[]> {
  const meiaNoite = inicioDoDia(data)
  const de = new Date(meiaNoite.getTime() - UM_DIA).toISOString()
  const ate = new Date(meiaNoite.getTime() + 2 * UM_DIA).toISOString()

  const { data: linhas } = await supabase
    .from('atendimentos')
    .select('id, descricao, data_sessao, duracao_minutos, clientes(nome)')
    .eq('status', 'agendada')
    .gte('data_sessao', de)
    .lt('data_sessao', ate)

  return (linhas ?? []) as unknown as SessaoOcupada[]
}

/** Meia-noite de hoje (horário de Brasília), no formato usado nas consultas ao banco. */
export function inicioDeHojeISO() {
  return inicioDoDia(new Date()).toISOString()
}

/**
 * A data é de um dia anterior a hoje? Uma sessão só vira pendente a partir
 * do dia seguinte, porque uma sessão de tatuagem dura horas.
 */
export function diaJaPassou(valor: string | null | undefined) {
  return Boolean(valor) && chaveDoDia(valor!) < chaveDoDia()
}
