'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Topo from '@/components/topo'
import { Campo } from '@/components/ui/campo'
import CampoSenha from '@/components/ui/campo-senha'
import Botao from '@/components/ui/botao'

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
    <div className="min-h-dvh">
      <Topo grande />

      <main className="mx-auto w-full max-w-md px-6 pt-6 pb-12">
        <h1 className="text-center text-5xl font-bold tracking-tight text-white">
          Criar conta
        </h1>

        <form onSubmit={handleCadastro} className="mt-10 space-y-6">
          <Campo
            id="nome"
            rotulo="Nome completo"
            autoComplete="name"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

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
            autoComplete="new-password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 6 caracteres"
          />

          {erro && (
            <p className="rounded-2xl border border-red-900 bg-red-950/50 px-5 py-3 text-sm text-red-300">
              {erro}
            </p>
          )}

          <Botao type="submit" disabled={carregando} className="w-full">
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </Botao>

          <p className="text-center text-sm text-white">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-bold text-destaque underline">
              entrar
            </Link>
          </p>
        </form>
      </main>
    </div>
  )
}
