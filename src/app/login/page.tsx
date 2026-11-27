'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Topo from '@/components/topo'
import { Campo } from '@/components/ui/campo'
import CampoSenha from '@/components/ui/campo-senha'
import Botao from '@/components/ui/botao'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/painel')
    router.refresh()
  }

  return (
    <div className="min-h-dvh">
      <Topo grande />

      <main className="mx-auto w-full max-w-md px-6 pt-6 pb-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-white">LOGIN</h1>
          <p className="mt-2 text-xl text-white">faça o login para continuar</p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-6">
          <Campo
            id="email"
            rotulo="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <CampoSenha
            id="senha"
            rotulo="Senha"
            autoComplete="current-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          {erro && (
            <p className="rounded-2xl border border-red-900 bg-red-950/50 px-5 py-3 text-sm text-red-300">
              {erro}
            </p>
          )}

          <Botao type="submit" disabled={carregando} className="w-full">
            {carregando ? 'Entrando...' : 'Log In'}
          </Botao>

          <p className="text-center text-sm text-white">
            Não tem conta?{' '}
            <Link href="/cadastro" className="font-bold text-destaque underline">
              Crie uma aqui
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}
