import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import {
  moeda,
  data as formataData,
  STATUS,
  ETIQUETA,
  type StatusSessao,
} from '@/lib/formato'

type Props = { params: Promise<{ id: string }> }

export default async function ClientePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  const { data: atendimentos } = await supabase
    .from('atendimentos')
    .select('id, descricao, valor_total, valor_restante, data_sessao, status, reagendamentos')
    .eq('cliente_id', id)
    .order('data_sessao', { ascending: false, nullsFirst: false })

  const telefoneLimpo = cliente.telefone?.replace(/\D/g, '')

  // Ajuda o tatuador a perceber quem costuma desmarcar
  const totalRemarcacoes = (atendimentos ?? []).reduce(
    (soma, a) => soma + Number(a.reagendamentos ?? 0),
    0
  )

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <Link
        href="/clientes"
        className="text-sm text-zinc-400 transition hover:text-white"
      >
        ← Voltar para clientes
      </Link>

      <div className="mt-4">
        <CabecalhoPagina
          titulo={cliente.nome}
          acao={{ href: `/clientes/${id}/editar`, rotulo: 'Editar' }}
        />
      </div>

      {(cliente.telefone || cliente.instagram || cliente.observacoes || totalRemarcacoes > 0) && (
        <section className="sombra-cartao mb-10 space-y-4 rounded-2xl border border-marca bg-superficie px-6 py-5">
          {cliente.telefone && (
            <p className="text-white">
              Telefone:{' '}
              <a
                href={`https://wa.me/55${telefoneLimpo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-destaque hover:underline"
              >
                {cliente.telefone}
              </a>
            </p>
          )}

          {cliente.instagram && (
            <p className="text-white">
              Instagram:{' '}
              <a
                href={`https://instagram.com/${cliente.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-destaque hover:underline"
              >
                @{cliente.instagram}
              </a>
            </p>
          )}

          {totalRemarcacoes > 0 && (
            <p className="text-[#f0997b]">
              Remarcou {totalRemarcacoes} {totalRemarcacoes === 1 ? 'vez' : 'vezes'}
            </p>
          )}

          {cliente.observacoes && (
            <p className="whitespace-pre-wrap text-sm text-zinc-300">
              {cliente.observacoes}
            </p>
          )}
        </section>
      )}

      <div className="mb-4 flex items-center justify-between px-2">
        <h2 className="text-xl text-white">Atendimentos</h2>
        <Link
          href={`/atendimentos/novo?cliente=${id}`}
          className="rounded-lg bg-marca px-4 py-2 text-sm tracking-wide text-white transition hover:bg-marca-forte"
        >
          Novo
        </Link>
      </div>

      {!atendimentos || atendimentos.length === 0 ? (
        <EstadoVazio
          titulo="Nenhum atendimento"
          descricao="Registre o primeiro orçamento deste cliente."
          acao={{
            href: `/atendimentos/novo?cliente=${id}`,
            rotulo: 'Criar atendimento',
          }}
        />
      ) : (
        <ul className="space-y-4">
          {atendimentos.map((a) => {
            const status = STATUS[a.status as StatusSessao]

            return (
              <li key={a.id}>
                <Link
                  href={`/atendimentos/${a.id}`}
                  className="sombra-cartao block rounded-2xl border border-marca bg-superficie px-6 py-5 transition hover:border-destaque"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-xl text-destaque">{a.descricao}</p>
                    <span className={`${ETIQUETA} ${status.cor}`}>{status.rotulo}</span>
                  </div>

                  <div className="mt-2 flex items-end justify-between gap-3">
                    <span className="text-zinc-400">
                      {formataData(a.data_sessao)}
                      {Number(a.reagendamentos) > 0 && (
                        <span className="block text-xs text-[#f0997b]">
                          remarcada {a.reagendamentos}x
                        </span>
                      )}
                    </span>
                    <span className="text-right text-destaque">
                      {moeda(a.valor_total)}
                      {Number(a.valor_restante) > 0 && (
                        <span className="block text-xs text-zinc-400">
                          falta {moeda(a.valor_restante)}
                        </span>
                      )}
                    </span>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
