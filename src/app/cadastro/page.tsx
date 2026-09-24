'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function CadastroPage() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleCadastro(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Informe seu nome.')
      return
    }
    if (senha.length < 6) {
      setErro('A senha precisa ter ao menos 6 caracteres.')
      return
    }

    setCarregando(true)
    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: senha,
      options: { data: { nome: nome.trim() } },
    })

    if (error) {
      setErro(
        error.message.includes('already registered')
          ? 'Este e-mail já está cadastrado. Entre na sua conta.'
          : 'Não foi possível criar a conta. Tente novamente.'
      )
      setCarregando(false)
      return
    }

    router.push('/painel')
    router.refresh()
  }

  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Criar conta
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Organize clientes, orçamentos e sessões em um só lugar.
        </p>

        <form onSubmit={handleCadastro} className="mt-8 space-y-4">
          <div>
            <label htmlFor="nome" className="mb-1.5 block text-sm text-zinc-300">
              Nome
            </label>
            <input
              id="nome"
              type="text"
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-zinc-300">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
            />
          </div>

          <div>
            <label htmlFor="senha" className="mb-1.5 block text-sm text-zinc-300">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              autoComplete="new-password"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo de 6 caracteres"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
            />
          </div>

          {erro && (
            <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-lg bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
          >
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>

          <p className="text-center text-sm text-zinc-400">
            Já tem conta?{' '}
            <Link href="/login" className="text-emerald-400 hover:underline">
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </main>
  )
}
