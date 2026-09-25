import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import Formulario from './formulario'

export default async function NovoAtendimentoPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string }>
}) {
  const { cliente: clientePreSelecionado } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome')

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina
        titulo="Novo atendimento"
        descricao="Registre a arte, o orçamento e a data da sessão."
      />

      {!clientes || clientes.length === 0 ? (
        <EstadoVazio
          titulo="Cadastre um cliente primeiro"
          descricao="Todo atendimento pertence a um cliente. Cadastre um para continuar."
          acao={{ href: '/clientes/novo', rotulo: 'Cadastrar cliente' }}
        />
      ) : (
        <Formulario
          clientes={clientes}
          userId={user.id}
          clienteInicial={clientePreSelecionado}
        />
      )}
    </main>
  )
}
