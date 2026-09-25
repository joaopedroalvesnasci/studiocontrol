import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import { moeda, data as formataData, STATUS, type StatusSessao } from '@/lib/formato'

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
    .select('id, descricao, valor_total, valor_restante, data_sessao, status')
    .eq('cliente_id', id)
    .order('data_sessao', { ascending: false, nullsFirst: false })

  const telefoneLimpo = cliente.telefone?.replace(/\D/g, '')

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <Link
        href="/clientes"
        className="text-sm text-zinc-500 transition hover:text-zinc-300"
      >
        Voltar para clientes
      </Link>

      <div className="mt-4">
        <CabecalhoPagina
          titulo={cliente.nome}
          acao={{ href: `/clientes/${id}/editar`, rotulo: 'Editar' }}
        />
      </div>

      {(cliente.telefone || cliente.instagram || cliente.observacoes) && (
        <section className="mb-8 space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-sm">
          {cliente.telefone && (
            <p>
              <span className="text-zinc-500">Telefone: </span>
              <a
                href={`https://wa.me/55${telefoneLimpo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                {cliente.telefone}
              </a>
            </p>
          )}

          {cliente.instagram && (
            <p>
              <span className="text-zinc-500">Instagram: </span>
              <a
                href={`https://instagram.com/${cliente.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                @{cliente.instagram}
              </a>
            </p>
          )}

          {cliente.observacoes && (
            <p className="whitespace-pre-wrap text-zinc-300">
              {cliente.observacoes}
            </p>
          )}
        </section>
      )}

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-white">Atendimentos</h2>
        <Link
          href={`/atendimentos/novo?cliente=${id}`}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
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
        <ul className="space-y-2">
          {atendimentos.map((a) => {
            const status = STATUS[a.status as StatusSessao]

            return (
              <li key={a.id}>
                <Link
                  href={`/atendimentos/${a.id}`}
                  className="block rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 transition hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-2 text-sm text-zinc-200">
                      {a.descricao}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.cor}`}
                    >
                      {status.rotulo}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-500">
                      {formataData(a.data_sessao)}
                    </span>
                    <span className="text-zinc-400">
                      {moeda(a.valor_total)}
                      {Number(a.valor_restante) > 0 && (
                        <span className="text-emerald-400">
                          {' '}
                          · falta {moeda(a.valor_restante)}
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
