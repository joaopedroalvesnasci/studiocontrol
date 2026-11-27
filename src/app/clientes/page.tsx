import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'

export default async function ClientesPage() {
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome, telefone, atendimentos(count)')
    .order('nome')

  const vazio = !clientes || clientes.length === 0

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Todo mundo que já passou pela sua cadeira."
        acao={vazio ? undefined : { href: '/clientes/novo', rotulo: 'Novo' }}
      />

      {vazio ? (
        <EstadoVazio
          titulo="Nenhum cliente ainda"
          descricao="Cadastre o primeiro cliente para começar a registrar orçamentos e sessões."
          acao={{ href: '/clientes/novo', rotulo: 'Cadastrar cliente' }}
        />
      ) : (
        <ul className="space-y-5">
          {clientes.map((cliente) => {
            const total =
              (cliente.atendimentos as unknown as { count: number }[])?.[0]
                ?.count ?? 0

            return (
              <li key={cliente.id}>
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="sombra-cartao flex items-center justify-between gap-3 rounded-2xl border border-marca bg-superficie px-6 py-6 transition hover:border-destaque"
                >
                  <div className="min-w-0">
                    <p className="truncate text-2xl text-white">{cliente.nome}</p>
                    {cliente.telefone && (
                      <p className="mt-1 truncate text-zinc-400">{cliente.telefone}</p>
                    )}
                  </div>

                  <span className="shrink-0 font-bold text-destaque">
                    {total === 1 ? '1 atendimento' : `${total} atendimentos`}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
