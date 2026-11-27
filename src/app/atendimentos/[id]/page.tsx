import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { dataHora, STATUS, ETIQUETA, type StatusSessao } from '@/lib/formato'
import MudarStatus from './mudar-status'
import BlocoPagamento from './bloco-pagamento'

type Props = { params: Promise<{ id: string }> }

export default async function AtendimentoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: atendimento } = await supabase
    .from('atendimentos')
    .select('*, clientes(id, nome, telefone)')
    .eq('id', id)
    .single()

  if (!atendimento) notFound()

  const cliente = atendimento.clientes as {
    id: string
    nome: string
    telefone: string | null
  } | null

  const status = STATUS[atendimento.status as StatusSessao]

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <Link href="/painel" className="text-sm text-zinc-400 transition hover:text-white">
        ← Voltar para a agenda
      </Link>

      <header className="mt-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          {cliente ? (
            <Link
              href={`/clientes/${cliente.id}`}
              className="text-4xl font-bold tracking-tight text-white hover:text-destaque"
            >
              {cliente.nome}
            </Link>
          ) : (
            <h1 className="text-4xl font-bold tracking-tight text-white">Cliente removido</h1>
          )}
          <span className={`${ETIQUETA} mt-2 ${status.cor}`}>{status.rotulo}</span>
        </div>
        <p className="mt-1 text-zinc-400">{dataHora(atendimento.data_sessao)}</p>
      </header>

            {/* O valor a cobrar é o que o tatuador precisa ver primeiro */}
      <BlocoPagamento
        id={atendimento.id}
        valorTotal={Number(atendimento.valor_total)}
        valorSinal={Number(atendimento.valor_sinal)}
        valorRestante={Number(atendimento.valor_restante)}
        sinalRecebidoEm={atendimento.sinal_recebido_em}
        sinalForma={atendimento.sinal_forma}
        pagamentoRecebidoEm={atendimento.pagamento_recebido_em}
        pagamentoForma={atendimento.pagamento_forma}
      />

      {atendimento.imagem_url && (
        <section className="mt-6">
          <h2 className="mb-2 ml-2 text-zinc-400">Referência</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={atendimento.imagem_url}
            alt="Referência da tatuagem"
            className="sombra-cartao w-full rounded-2xl border border-marca bg-white object-contain"
          />
        </section>
      )}

      <section className="sombra-cartao mt-6 rounded-2xl border border-marca bg-superficie px-6 py-5">
        <h2 className="text-sm text-zinc-400">Arte</h2>
        <p className="mt-1 whitespace-pre-wrap text-lg text-destaque">{atendimento.descricao}</p>

        {cliente?.telefone && (
          <p className="mt-4 text-white">
            Contato:{' '}
            <a
              href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-destaque hover:underline"
            >
              {cliente.telefone}
            </a>
          </p>
        )}
      </section>

      <div className="mt-8">
        <MudarStatus id={atendimento.id} statusAtual={atendimento.status} />
      </div>
    </main>
  )
}
