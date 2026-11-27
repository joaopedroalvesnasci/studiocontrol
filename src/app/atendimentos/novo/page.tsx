import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import FormularioAtendimento from './formulario'

type Props = {
  /** Aceita /atendimentos/novo?cliente=<id> para já vir preenchido. */
  searchParams: Promise<{ cliente?: string }>
}

export default async function NovoAtendimentoPage({ searchParams }: Props) {
  const { cliente: clientePreSelecionado } = await searchParams
  const supabase = await createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome')

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <CabecalhoPagina
        titulo="Novo atendimento"
        descricao="Registre a arte, o valor e a data da sessão."
      />

      {!clientes || clientes.length === 0 ? (
        <EstadoVazio
          titulo="Cadastre um cliente antes"
          descricao="Todo atendimento pertence a um cliente. Comece por lá."
          acao={{ href: '/clientes/novo', rotulo: 'Cadastrar cliente' }}
        />
      ) : (
        <FormularioAtendimento
          clientes={clientes}
          clienteInicial={clientePreSelecionado}
        />
      )}
    </main>
  )
}
