'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { moeda, data, nomeForma, FORMAS, FORMAS_ESCOLHA, type FormaPagamento } from '@/lib/formato'

type Props = {
  id: string
  valorTotal: number
  valorSinal: number
  valorRestante: number
  sinalRecebidoEm: string | null
  sinalForma: string | null
  pagamentoRecebidoEm: string | null
  pagamentoForma: string | null
}

type Etapa = 'sinal' | 'pagamento'

/**
 * Valores do atendimento e confirmação de cada recebimento.
 * O "a cobrar" vem pronto do banco (coluna calculada valor_restante).
 */
export default function BlocoPagamento(p: Props) {
  const router = useRouter()
  const [escolhendo, setEscolhendo] = useState<Etapa | null>(null)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const temSinal = p.valorSinal > 0
  const sinalRecebido = Boolean(p.sinalRecebidoEm)
  const pago = Boolean(p.pagamentoRecebidoEm)

  // O restante só pode ser confirmado depois do sinal, para a conta nunca ficar ambígua
  const valorDoRestante = p.valorTotal - (temSinal ? p.valorSinal : 0)
  const aguardandoSinal = temSinal && !sinalRecebido && !pago

  async function salvar(campos: Record<string, string | null>) {
    setSalvando(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase.from('atendimentos').update(campos).eq('id', p.id)

    setSalvando(false)

    if (error) {
      setErro('Não foi possível salvar. Tente novamente.')
      return
    }

    setEscolhendo(null)
    router.refresh()
  }

  function confirmar(etapa: Etapa, forma: FormaPagamento) {
    salvar({
      [`${etapa}_recebido_em`]: new Date().toISOString(),
      [`${etapa}_forma`]: forma,
    })
  }

  function desfazer(etapa: Etapa) {
    const texto =
      etapa === 'sinal'
        ? 'Desfazer a confirmação do sinal?'
        : 'Desfazer a confirmação do pagamento?'
    if (!window.confirm(texto)) return
    salvar({ [`${etapa}_recebido_em`]: null, [`${etapa}_forma`]: null })
  }

  return (
    <section className="sombra-cartao rounded-2xl border border-destaque bg-superficie px-6 py-5">
      <p className="text-sm text-zinc-400">
        {pago ? 'Pagamento concluído' : 'A cobrar nesta sessão'}
      </p>
      <p className="mt-1 text-5xl font-bold tracking-tight text-destaque">
        {moeda(p.valorRestante)}
      </p>
      <p className="mt-1 text-sm text-zinc-400">Orçamento de {moeda(p.valorTotal)}</p>

      <div className="mt-4 space-y-4 border-t border-marca/60 pt-4">
        {temSinal && (
          <Linha
            titulo={`Sinal · ${moeda(p.valorSinal)}`}
            situacao={
              sinalRecebido
                ? `Recebido em ${data(p.sinalRecebidoEm)} · ${nomeForma(p.sinalForma)}`
                : pago
                  ? 'Incluído no pagamento final'
                  : 'Aguardando'
            }
            concluido={sinalRecebido || pago}
            podeConfirmar={!sinalRecebido && !pago}
            podeDesfazer={sinalRecebido && !pago}
            escolhendo={escolhendo === 'sinal'}
            salvando={salvando}
            aoAbrir={() => setEscolhendo('sinal')}
            aoFechar={() => setEscolhendo(null)}
            aoEscolher={(forma) => confirmar('sinal', forma)}
            aoDesfazer={() => desfazer('sinal')}
          />
        )}

        <Linha
          titulo={`${temSinal ? 'Restante' : 'Pagamento'} · ${moeda(valorDoRestante)}`}
          situacao={
            pago
              ? `Pago em ${data(p.pagamentoRecebidoEm)} · ${nomeForma(p.pagamentoForma)}`
              : aguardandoSinal
                ? 'Depois do sinal'
                : 'Aguardando'
          }
          concluido={pago}
          podeConfirmar={!pago && !aguardandoSinal}
          podeDesfazer={pago}
          escolhendo={escolhendo === 'pagamento'}
          salvando={salvando}
          aoAbrir={() => setEscolhendo('pagamento')}
          aoFechar={() => setEscolhendo(null)}
          aoEscolher={(forma) => confirmar('pagamento', forma)}
          aoDesfazer={() => desfazer('pagamento')}
        />
      </div>

      {erro && <p className="mt-3 text-sm text-red-300">{erro}</p>}
    </section>
  )
}

type PropsLinha = {
  titulo: string
  situacao: string
  concluido: boolean
  podeConfirmar: boolean
  podeDesfazer: boolean
  escolhendo: boolean
  salvando: boolean
  aoAbrir: () => void
  aoFechar: () => void
  aoEscolher: (forma: FormaPagamento) => void
  aoDesfazer: () => void
}

function Linha(l: PropsLinha) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-white">{l.titulo}</p>
          <p className={`text-xs ${l.concluido ? 'text-destaque' : 'text-zinc-400'}`}>
            {l.situacao}
          </p>
        </div>

        {l.concluido && (
          <div className="flex shrink-0 items-center gap-2">
            {l.podeDesfazer && (
              <button
                type="button"
                onClick={l.aoDesfazer}
                disabled={l.salvando}
                className="text-xs text-zinc-500 underline hover:text-zinc-300 disabled:opacity-50"
              >
                Desfazer
              </button>
            )}
            <span
              aria-label="Confirmado"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-marca"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z" />
              </svg>
            </span>
          </div>
        )}

        {l.podeConfirmar && !l.escolhendo && (
          <button
            type="button"
            onClick={l.aoAbrir}
            className="shrink-0 rounded-full border border-marca px-4 py-1.5 text-sm text-white transition hover:border-destaque"
          >
            Confirmar
          </button>
        )}
      </div>

      {l.escolhendo && (
        <div className="mt-3">
          <p className="mb-2 text-xs text-zinc-400">Como foi pago?</p>
          <div className="grid grid-cols-2 gap-2">
            {FORMAS_ESCOLHA.map((forma) => (
              <button
                key={forma}
                type="button"
                onClick={() => l.aoEscolher(forma)}
                disabled={l.salvando}
                className="rounded-full border border-marca px-3 py-2.5 text-sm text-white transition hover:border-destaque hover:bg-marca/30 disabled:opacity-50"
              >
                {FORMAS[forma]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={l.aoFechar}
            disabled={l.salvando}
            className="mt-2 w-full py-2 text-xs text-zinc-500 hover:text-zinc-300"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}