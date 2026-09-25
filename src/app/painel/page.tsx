import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import { moeda, dataHora } from '@/lib/formato'

export default async function PainelPage() {
  const supabase = await createClient()

  const { data: sessoes } = await supabase
    .from('atendimentos')
    .select('id, descricao, valor_restante, data_sessao, clientes(nome)')
    .eq('status', 'agendada')
    .not('data_sessao', 'is', null)
    .order('data_sessao', { ascending: true })

  const hoje = new Date().toDateString()

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina
        titulo="Agenda"
        descricao="Suas próximas sessões, da mais próxima para a mais distante."
        acao={{ href: '/atendimentos/novo', rotulo: 'Novo' }}
      />

      {!sessoes || sessoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma sessão agendada"
          descricao="Cadastre um cliente e crie o primeiro atendimento para ver a agenda."
          acao={{ href: '/clientes', rotulo: 'Ver clientes' }}
        />
      ) : (
        <ul className="space-y-2">
          {sessoes.map((sessao) => {
            const cliente = sessao.clientes as unknown as { nome: string } | null
            const ehHoje =
              sessao.data_sessao &&
              new Date(sessao.data_sessao).toDateString() === hoje

            return (
              <li key={sessao.id}>
                <Link
                  href={`/atendimentos/${sessao.id}`}
                  className={`block rounded-xl border px-4 py-4 transition ${
                    ehHoje
                      ? 'border-emerald-700 bg-emerald-950/20'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {cliente?.nome ?? 'Cliente removido'}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-zinc-500">
                        {sessao.descricao}
                      </p>
                    </div>

                    {ehHoje && (
                      <span className="shrink-0 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        Hoje
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-zinc-400">
                      {dataHora(sessao.data_sessao)}
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {moeda(sessao.valor_restante)}
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
