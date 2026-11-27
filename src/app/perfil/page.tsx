import { createClient } from '@/lib/supabase/server'
import FormularioPerfil from './formulario'
import BotaoSair from './botao-sair'

export default async function PerfilPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const dados = user?.user_metadata ?? {}

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <header className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-4xl font-bold tracking-tight text-white">Perfil</h1>
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">
            Os dados do seu estúdio.
          </p>
        </div>

        <div className="flex h-28 w-28 shrink-0 items-end justify-center overflow-hidden rounded-full border-[6px] border-destaque">
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-24 w-24 translate-y-2 text-destaque">
            <circle cx="12" cy="7.5" r="4.5" />
            <path d="M3 22c0-4.4 4-8 9-8s9 3.6 9 8v1H3v-1Z" />
          </svg>
        </div>
      </header>

      <FormularioPerfil
        email={user?.email ?? ''}
        nome={dados.nome ?? ''}
        telefone={dados.telefone ?? ''}
        instagram={dados.instagram ?? ''}
      />

      <div className="mt-6">
        <BotaoSair />
      </div>
    </main>
  )
}
