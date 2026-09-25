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
    <main className="mx-auto w-full max-w-md px-6 py-10">
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
        <ul className="space-y-2">
          {clientes.map((cliente) => {
            const total =
              (cliente.atendimentos as unknown as { count: number }[])?.[0]
                ?.count ?? 0

            return (
              <li key={cliente.id}>
                <Link
                  href={`/clientes/${cliente.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 transition hover:border-zinc-700"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-white">
                      {cliente.nome}
                    </p>
                    {cliente.telefone && (
                      <p className="mt-0.5 truncate text-sm text-zinc-500">
                        {cliente.telefone}
                      </p>
                    )}
                  </div>

                  <span className="ml-3 shrink-0 text-sm text-zinc-500">
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
