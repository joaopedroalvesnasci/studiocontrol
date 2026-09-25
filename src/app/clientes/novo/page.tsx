import CabecalhoPagina from '@/components/cabecalho-pagina'
import FormularioCliente from '../formulario'

export default function NovoClientePage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina
        titulo="Novo cliente"
        descricao="Só o nome já basta para começar."
      />
      <FormularioCliente />
    </main>
  )
}
