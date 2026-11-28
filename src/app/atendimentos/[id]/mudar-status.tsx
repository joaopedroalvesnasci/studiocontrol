'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { moeda, FORMAS, FORMAS_ESCOLHA, type FormaPagamento } from '@/lib/formato'
import Botao from '@/components/ui/botao'
import PainelReagendar from './painel-reagendar'

type Props = {
  id: string
  statusAtual: string
  /** O que ainda falta receber (coluna calculada valor_restante). */
  valorAReceber: number
  /** Há sinal combinado que ainda não foi confirmado? */
  sinalPendente: boolean
  dataSessao: string | null
  duracaoMinutos: number
  reagendamentos: number
}

type Status = 'agendada' | 'concluida' | 'cancelada'

export default function MudarStatus({
  id,
  statusAtual,
  valorAReceber,
  sinalPendente,
  dataSessao,
  duracaoMinutos,
  reagendamentos,
}: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [perguntando, setPerguntando] = useState(false)
  const [reagendando, setReagendando] = useState(false)

  async function salvar(campos: Record<string, string | null>) {
    setSalvando(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').update(campos).eq('id', id)

    if (error) {
      setErro('Não foi possível salvar. Tente novamente.')
      setSalvando(false)
      return
    }

    setPerguntando(false)
    router.refresh()
    setSalvando(false)
  }

  function mudar(novoStatus: Status) {
    salvar({ status: novoStatus })
  }

  /** Ao concluir com valor em aberto, pergunta antes se o pagamento foi recebido. */
  function concluir() {
    if (valorAReceber > 0) {
      setPerguntando(true)
      return
    }
    mudar('concluida')
  }

  /** Conclui e registra o pagamento numa única gravação. */
  function concluirPago(forma: FormaPagamento) {
    const agora = new Date().toISOString()
    salvar({
      status: 'concluida',
      pagamento_recebido_em: agora,
      pagamento_forma: forma,
      // Sem sinal confirmado, o cliente pagou tudo de uma vez: o sinal vai junto
      ...(sinalPendente ? { sinal_recebido_em: agora, sinal_forma: forma } : {}),
    })
  }

  if (reagendando) {
    return (
      <PainelReagendar
        id={id}
        dataSessao={dataSessao}
        duracaoMinutos={duracaoMinutos}
        reagendamentos={reagendamentos}
        aoFechar={() => setReagendando(false)}
      />
    )
  }

  if (perguntando) {
    return (
      <div className="sombra-cartao rounded-2xl border border-marca bg-superficie px-6 py-5">
        <p className="text-lg text-white">
          {sinalPendente
            ? `Recebeu o valor total de ${moeda(valorAReceber)}?`
            : `Recebeu os ${moeda(valorAReceber)} restantes?`}
        </p>
        <p className="mt-1 text-sm text-zinc-400">Escolha como foi pago.</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {FORMAS_ESCOLHA.map((forma) => (
            <button
              key={forma}
              type="button"
              onClick={() => concluirPago(forma)}
              disabled={salvando}
              className="rounded-full border border-marca px-3 py-3 text-white transition hover:border-destaque hover:bg-marca/30 disabled:opacity-50"
            >
              {FORMAS[forma]}
            </button>
          ))}
        </div>

        <Botao
          variante="secundario"
          onClick={() => mudar('concluida')}
          disabled={salvando}
          className="mt-4 w-full text-base"
        >
          Ainda não recebi
        </Botao>
        <p className="mt-2 text-center text-xs text-zinc-500">
          A sessão é concluída e o valor fica a receber.
        </p>

        <button
          type="button"
          onClick={() => setPerguntando(false)}
          disabled={salvando}
          className="mt-2 w-full py-2 text-sm text-zinc-500 hover:text-zinc-300"
        >
          Voltar
        </button>

        {erro && <p className="mt-2 text-sm text-red-300">{erro}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {statusAtual === 'agendada' && (
        <>
          <Botao onClick={concluir} disabled={salvando} className="w-full">
            Marcar como concluída
          </Botao>
          <Botao
            variante="secundario"
            onClick={() => setReagendando(true)}
            disabled={salvando}
            className="w-full"
          >
            {dataSessao ? 'Reagendar' : 'Marcar data'}
          </Botao>
          <Botao
            variante="secundario"
            onClick={() => mudar('cancelada')}
            disabled={salvando}
            className="w-full"
          >
            Cancelar sessão
          </Botao>
        </>
      )}

      {statusAtual !== 'agendada' && (
        <Botao
          variante="secundario"
          onClick={() => mudar('agendada')}
          disabled={salvando}
          className="w-full"
        >
          Reabrir como agendada
        </Botao>
      )}

      {erro && <p className="text-sm text-red-300">{erro}</p>}
    </div>
  )
}
