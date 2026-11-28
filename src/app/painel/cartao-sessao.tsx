import Link from 'next/link'
import { moeda, periodo, data, ehHoje } from '@/lib/formato'

export type SessaoDaAgenda = {
  id: string
  descricao: string
  valor_sinal: number
  valor_restante: number
  sinal_recebido_em: string | null
  pagamento_recebido_em: string | null
  data_sessao: string | null
  duracao_minutos: number
  clientes: { nome: string } | null
}

type Props = {
  sessao: SessaoDaAgenda
  /**
   * normal: próxima sessão · atrasada: dia já passou e segue agendada
   * receber: concluída com pagamento em aberto · semData: orçamento sem data
   */
  variante?: 'normal' | 'atrasada' | 'receber' | 'semData'
}

const LARANJA = 'border-[#f0997b] text-[#f0997b]'

export default function CartaoSessao({ sessao, variante = 'normal' }: Props) {
  const hoje = variante === 'normal' && ehHoje(sessao.data_sessao)
  const sinalPendente = Number(sessao.valor_sinal) > 0 && !sessao.sinal_recebido_em
  const pago = Boolean(sessao.pagamento_recebido_em)
  const pendencia = variante === 'atrasada' || variante === 'receber'

  const borda = pendencia
    ? 'border-[#f0997b]'
    : hoje
      ? 'border-destaque'
      : 'border-marca'

  const situacao =
    variante === 'atrasada'
      ? `Era em ${data(sessao.data_sessao)} e ainda não foi atualizada`
      : variante === 'receber'
        ? `Concluída em ${data(sessao.data_sessao)} · pagamento em aberto`
        : variante === 'semData'
          ? 'Sem data marcada'
          : periodo(sessao.data_sessao, sessao.duracao_minutos, true)

  return (
    <Link
      href={`/atendimentos/${sessao.id}`}
      className={`sombra-cartao block rounded-2xl border bg-superficie px-6 py-5 transition hover:border-destaque ${borda}`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-2xl text-white">{sessao.clientes?.nome ?? 'Cliente removido'}</p>

        <div className="flex shrink-0 gap-2">
          {variante === 'atrasada' && (
            <span className={`rounded-md border px-2.5 py-1 text-xs ${LARANJA}`}>Atrasada</span>
          )}
          {variante === 'receber' && (
            <span className={`rounded-md border px-2.5 py-1 text-xs ${LARANJA}`}>A receber</span>
          )}
          {!pendencia && sinalPendente && (
            <span className={`rounded-md border px-2.5 py-1 text-xs ${LARANJA}`}>Sinal pendente</span>
          )}
          {hoje && (
            <span className="rounded-md bg-destaque px-3 py-1 text-xs font-bold text-fundo">Hoje</span>
          )}
        </div>
      </div>

      <p className="mt-1 truncate text-zinc-400">{sessao.descricao}</p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={`text-sm ${pendencia ? 'text-[#f0997b]' : 'text-zinc-400'}`}>{situacao}</span>
        <span className="shrink-0 text-xl font-bold text-destaque">
          {pago ? 'Pago' : moeda(sessao.valor_restante)}
        </span>
      </div>
    </Link>
  )
}
