import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { chaveDoDia, FUSO } from '@/lib/formato'
import { diaJaPassou } from '@/lib/agenda'
import CartaoSessao, { type SessaoDaAgenda } from './cartao-sessao'

const CAMPOS =
  'id, status, descricao, valor_sinal, valor_restante, sinal_recebido_em, pagamento_recebido_em, data_sessao, duracao_minutos, clientes(nome)'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const SEMANA = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

type SessaoDoCalendario = SessaoDaAgenda & { status: 'agendada' | 'concluida' }
type Tipo = 'agendada' | 'concluida' | 'pendente'

/** Cor do ponto de cada tipo de sessão no calendário. */
const COR: Record<Tipo, string> = {
  agendada: 'bg-destaque',
  concluida: 'bg-zinc-400',
  pendente: 'bg-[#f0997b]',
}

/** Pagamento em aberto numa sessão concluída. */
function emAberto(sessao: SessaoDoCalendario) {
  return !sessao.pagamento_recebido_em && Number(sessao.valor_restante) > 0
}

/** Pendente = atrasada ou com pagamento a receber, as mesmas regras da lista. */
function tipoDa(sessao: SessaoDoCalendario): Tipo {
  if (sessao.status === 'concluida') return emAberto(sessao) ? 'pendente' : 'concluida'
  return diaJaPassou(sessao.data_sessao) ? 'pendente' : 'agendada'
}

/** Qual cartão usar na lista do dia, com as mesmas regras da Agenda. */
function varianteDa(sessao: SessaoDoCalendario) {
  if (sessao.status === 'concluida') return emAberto(sessao) ? 'receber' : 'concluida'
  return diaJaPassou(sessao.data_sessao) ? 'atrasada' : 'normal'
}

/** "2026-11" mais n meses, no mesmo formato. */
function somarMes(chave: string, n: number) {
  const [ano, mes] = chave.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1 + n, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

/** "2026-11-28" vira "Sábado, 28 de novembro". */
function tituloDoDia(chave: string) {
  const texto = new Date(`${chave}T12:00:00-03:00`).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: FUSO,
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

const link = (mes: string, dia?: string) =>
  `/painel?modo=calendario&mes=${mes}${dia ? `&dia=${dia}` : ''}`

type Props = { mes?: string; dia?: string }

export default async function Calendario({ mes, dia }: Props) {
  const hoje = chaveDoDia()
  const mesDeHoje = hoje.slice(0, 7)

  // Endereço inválido ou vazio cai no mês atual
  const chaveMes = mes && /^\d{4}-(0[1-9]|1[0-2])$/.test(mes) ? mes : mesDeHoje
  const [ano, numeroMes] = chaveMes.split('-').map(Number)
  const anterior = somarMes(chaveMes, -1)
  const seguinte = somarMes(chaveMes, 1)

  const supabase = await createClient()
  const { data: linhas } = await supabase
    .from('atendimentos')
    .select(CAMPOS)
    .in('status', ['agendada', 'concluida'])
    .gte('data_sessao', `${chaveMes}-01T00:00:00-03:00`)
    .lt('data_sessao', `${seguinte}-01T00:00:00-03:00`)
    .order('data_sessao', { ascending: true })

  const sessoes = (linhas ?? []) as unknown as SessaoDoCalendario[]

  // Agrupa as sessões pelo dia (no horário de Brasília)
  const porDia = new Map<string, SessaoDoCalendario[]>()
  for (const sessao of sessoes) {
    const chave = chaveDoDia(sessao.data_sessao!)
    porDia.set(chave, [...(porDia.get(chave) ?? []), sessao])
  }

  // Dia escolhido: o do endereço, se for deste mês; senão hoje, se estiver vendo o mês atual
  const diaValido = dia && /^\d{4}-\d{2}-\d{2}$/.test(dia) && dia.startsWith(chaveMes)
  const escolhido = diaValido ? dia : chaveMes === mesDeHoje ? hoje : null
  const sessoesDoDia = escolhido ? (porDia.get(escolhido) ?? []) : []

  const diasNoMes = new Date(Date.UTC(ano, numeroMes, 0)).getUTCDate()
  const espacosAntes = new Date(Date.UTC(ano, numeroMes - 1, 1)).getUTCDay()

  return (
    <>
      <section className="sombra-cartao rounded-2xl border border-marca bg-superficie px-4 py-5">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={link(anterior)}
            aria-label="Mês anterior"
            className="rounded-full px-3 py-1 text-2xl text-zinc-400 transition hover:text-white"
          >
            ‹
          </Link>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {MESES[numeroMes - 1]} {ano}
            </p>
            {chaveMes !== mesDeHoje && (
              <Link href={link(mesDeHoje)} className="text-xs text-destaque hover:underline">
                Voltar para hoje
              </Link>
            )}
          </div>
          <Link
            href={link(seguinte)}
            aria-label="Próximo mês"
            className="rounded-full px-3 py-1 text-2xl text-zinc-400 transition hover:text-white"
          >
            ›
          </Link>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {SEMANA.map((letra, i) => (
            <span key={i} className="pb-1 text-xs text-apagado">
              {letra}
            </span>
          ))}

          {Array.from({ length: espacosAntes }, (_, i) => (
            <span key={`vazio-${i}`} />
          ))}

          {Array.from({ length: diasNoMes }, (_, i) => {
            const numero = i + 1
            const chave = `${chaveMes}-${String(numero).padStart(2, '0')}`
            const doDia = porDia.get(chave) ?? []
            const tipos = (['pendente', 'agendada', 'concluida'] as Tipo[]).filter((t) =>
              doDia.some((s) => tipoDa(s) === t),
            )
            const selecionado = chave === escolhido
            const ehHoje = chave === hoje

            return (
              <Link
                key={chave}
                href={link(chaveMes, chave)}
                scroll={false}
                aria-label={`${numero}${doDia.length ? `, ${doDia.length} sessão(ões)` : ''}`}
                aria-current={selecionado ? 'date' : undefined}
                className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border text-sm transition ${
                  selecionado
                    ? 'border-marca bg-marca font-semibold text-white'
                    : ehHoje
                      ? 'border-destaque font-semibold text-destaque'
                      : 'border-transparent text-zinc-300 hover:border-marca'
                }`}
              >
                {numero}
                <span className="flex h-1.5 gap-0.5">
                  {tipos.map((t) => (
                    <span key={t} className={`h-1.5 w-1.5 rounded-full ${COR[t]}`} />
                  ))}
                </span>
              </Link>
            )
          })}
        </div>

        <div className="mt-4 flex justify-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${COR.agendada}`} /> Agendada
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${COR.concluida}`} /> Concluída
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${COR.pendente}`} /> Pendente
          </span>
        </div>
      </section>

      <section className="mt-8 mb-10">
        {escolhido ? (
          <>
            <h2 className="mb-4 px-2 text-xl text-white">{tituloDoDia(escolhido)}</h2>
            {sessoesDoDia.length > 0 ? (
              <ul className="space-y-4">
                {sessoesDoDia.map((s) => (
                  <li key={s.id}>
                    <CartaoSessao sessao={s} variante={varianteDa(s)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-2 text-sm text-zinc-400">Nenhuma sessão nesse dia.</p>
            )}
          </>
        ) : (
          <p className="px-2 text-sm text-zinc-400">
            {sessoes.length > 0
              ? `${sessoes.length} ${sessoes.length === 1 ? 'sessão' : 'sessões'} neste mês. Toque num dia para ver.`
              : 'Nenhuma sessão neste mês.'}
          </p>
        )}
      </section>
    </>
  )
}
