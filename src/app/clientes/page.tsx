import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'

/**
 * Versao provisoria. A lista real de clientes e construida na Etapa 7.
 */
export default function ClientesPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina
        titulo="Clientes"
        descricao="Todo mundo que já passou pela sua cadeira."
      />

      <EstadoVazio
        titulo="Nenhum cliente ainda"
        descricao="Cadastre o primeiro cliente para começar a registrar orçamentos e sessões."
      />
    </main>
  )
}
