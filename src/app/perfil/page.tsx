import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import BotaoSair from './botao-sair'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const nome = user?.user_metadata?.nome ?? 'Tatuador'

  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina titulo="Perfil" />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <p className="text-lg font-semibold text-white">{nome}</p>
        <p className="mt-1 text-sm text-zinc-400">{user?.email}</p>
      </div>

      <div className="mt-6">
        <BotaoSair />
      </div>
    </main>
  )
}
