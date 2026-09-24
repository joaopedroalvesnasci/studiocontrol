import { createClient } from '@/lib/supabase/server'
import BotaoSair from './botao-sair'

/**
 * Versão provisória do painel, usada apenas para validar o login.
 * A tela real (próximas sessões) é construída na Etapa 8.
 */
export default async function PainelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const nome = user?.user_metadata?.nome ?? user?.email

  return (
    <main className="px-6 py-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-bold tracking-tight text-white">Painel</h1>
        <p className="mt-2 text-zinc-400">Logado como {nome}</p>

        <div className="mt-8">
          <BotaoSair />
        </div>
      </div>
    </main>
  )
}
