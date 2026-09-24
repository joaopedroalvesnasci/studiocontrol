'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Botao from '@/components/ui/botao'

export default function BotaoSair() {
  const router = useRouter()

  async function sair() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Botao variante="secundario" onClick={sair} className="w-full">
      Sair da conta
    </Botao>
  )
}
