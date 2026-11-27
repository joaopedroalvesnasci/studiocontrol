'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Campo } from '@/components/ui/campo'
import Botao from '@/components/ui/botao'

type Props = {
  email: string
  nome: string
  telefone: string
  instagram: string
}

/**
 * Os dados do estúdio ficam nos metadados da conta (Supabase Auth),
 * então não foi preciso criar tabela nova no banco.
 */
export default function FormularioPerfil(inicial: Props) {
  const router = useRouter()
  const [nome, setNome] = useState(inicial.nome)
  const [telefone, setTelefone] = useState(inicial.telefone)
  const [instagram, setInstagram] = useState(inicial.instagram)
  const [mensagem, setMensagem] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null)
  const [salvando, setSalvando] = useState(false)

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setMensagem(null)
    setSalvando(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        nome: nome.trim(),
        telefone: telefone.trim(),
        instagram: instagram.trim().replace(/^@/, ''),
      },
    })

    setSalvando(false)

    if (error) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível salvar. Tente novamente.' })
      return
    }

    setMensagem({ tipo: 'ok', texto: 'Dados salvos.' })
    router.refresh()
  }

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Campo
        id="nome"
        rotulo="Nome do studio"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Como seu estúdio se chama"
        className="rounded-2xl"
      />

      <Campo
        id="email"
        rotulo="E-mail"
        type="email"
        value={inicial.email}
        readOnly
        className="rounded-2xl text-zinc-300"
        ajuda="O e-mail é o seu login e não pode ser alterado aqui."
      />

      <div className="grid grid-cols-2 gap-4">
        <Campo
          id="telefone"
          rotulo="Tel contato"
          type="tel"
          inputMode="tel"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          placeholder="xx xxxxx-xxxx"
          className="rounded-xl px-4"
        />
        <Campo
          id="instagram"
          rotulo="Instagram"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="@seu_estudio"
          className="rounded-xl px-4"
        />
      </div>

      {mensagem && (
        <p
          className={`rounded-2xl px-5 py-3 text-sm ${
            mensagem.tipo === 'ok'
              ? 'border border-marca bg-marca/20 text-destaque'
              : 'border border-red-900 bg-red-950/50 text-red-300'
          }`}
        >
          {mensagem.texto}
        </p>
      )}

      <Botao type="submit" disabled={salvando} className="w-full">
        {salvando ? 'Salvando...' : 'Salvar dados'}
      </Botao>
    </form>
  )
}
