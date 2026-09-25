import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import FormularioCliente from '../../formulario'

type Props = { params: Promise<{ id: string }> }

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome, telefone, instagram, observacoes')
    .eq('id', id)
    .single()

  if (!cliente) notFound()

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina titulo="Editar cliente" />
      <FormularioCliente cliente={cliente} />
    </main>
  )
}
