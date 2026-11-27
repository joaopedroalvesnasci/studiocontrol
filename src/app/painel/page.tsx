import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import { moeda, dataHora, ehHoje } from '@/lib/formato'

export default async function PainelPage() {
  const supabase = await createClient()

  const { data: sessoes } = await supabase
    .from('atendimentos')
    .select('id, descricao, valor_restante, data_sessao, clientes(nome)')
    .eq('status', 'agendada')
    .not('data_sessao', 'is', null)
    .order('data_sessao', { ascending: true })

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <CabecalhoPagina
        titulo="Agenda"
        descricao="Suas próximas sessões, da mais próxima para a mais distante"
        acao={{ href: '/atendimentos/novo', rotulo: 'Novo' }}
      />

      {!sessoes || sessoes.length === 0 ? (
        <EstadoVazio
          titulo="Nenhuma sessão agendada"
          descricao="Cadastre um cliente e crie o primeiro atendimento para ver a agenda."
          acao={{ href: '/clientes', rotulo: 'Ver clientes' }}
        />
      ) : (
        <ul className="space-y-4">
          {sessoes.map((sessao) => {
            const cliente = sessao.clientes as unknown as { nome: string } | null
            const hoje = ehHoje(sessao.data_sessao)

            return (
              <li key={sessao.id}>
                <Link
                  href={`/atendimentos/${sessao.id}`}
                  className={`sombra-cartao block rounded-2xl border bg-superficie px-6 py-5 transition hover:border-destaque ${
                    hoje ? 'border-destaque' : 'border-marca'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-2xl text-white">
                      {cliente?.nome ?? 'Cliente removido'}
                    </p>
                    {hoje && (
                      <span className="shrink-0 rounded-md bg-destaque px-3 py-1 text-xs font-bold text-fundo">
                        Hoje
                      </span>
                    )}
                  </div>

                  <p className="mt-1 truncate text-zinc-400">{sessao.descricao}</p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-zinc-400">
                      {dataHora(sessao.data_sessao)}
                    </span>
                    <span className="text-xl font-bold text-destaque">
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
