import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { moeda, dataHora, STATUS, type StatusSessao } from '@/lib/formato'
import MudarStatus from './mudar-status'

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
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <Link
        href="/painel"
        className="text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        Voltar para a agenda
      </Link>

      <header className="mt-4 mb-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {cliente?.nome ?? 'Cliente removido'}
          </h1>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${status.cor}`}
          >
            {status.rotulo}
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-400">
          {dataHora(atendimento.data_sessao)}
        </p>
      </header>

      {/* O valor a cobrar e o que o tatuador precisa ver primeiro */}
      <section className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
        <p className="text-sm text-zinc-400">A cobrar nesta sessão</p>
        <p className="mt-1 text-4xl font-bold tracking-tight text-emerald-400">
          {moeda(atendimento.valor_restante)}
        </p>

        <dl className="mt-4 flex gap-6 border-t border-emerald-900/40 pt-4 text-sm">
          <div>
            <dt className="text-zinc-500">Orçamento</dt>
            <dd className="mt-0.5 font-medium text-zinc-200">
              {moeda(atendimento.valor_total)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">Sinal pago</dt>
            <dd className="mt-0.5 font-medium text-zinc-200">
              {moeda(atendimento.valor_sinal)}
            </dd>
          </div>
        </dl>
      </section>

      {atendimento.imagem_url && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm text-zinc-400">Referência</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={atendimento.imagem_url}
            alt="Referência da tatuagem"
            className="w-full rounded-xl border border-zinc-800 object-contain"
          />
        </section>
      )}

      <section className="mt-6">
        <h2 className="mb-2 text-sm text-zinc-400">Arte</h2>
        <p className="whitespace-pre-wrap text-zinc-200">
          {atendimento.descricao}
        </p>
      </section>

      {cliente?.telefone && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm text-zinc-400">Contato</h2>
          <a
            href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            {cliente.telefone}
          </a>
        </section>
      )}

      <div className="mt-8">
        <MudarStatus id={atendimento.id} statusAtual={atendimento.status} />
      </div>
    </main>
  )
}
