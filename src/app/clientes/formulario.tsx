'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Campo, CampoTexto } from '@/components/ui/campo'
import Botao from '@/components/ui/botao'

export type DadosCliente = {
  id?: string
  nome: string
  telefone: string | null
  instagram: string | null
  observacoes: string | null
}

type Props = { cliente?: DadosCliente }

/** Serve para cadastrar e para editar: a diferenca e receber ou nao um cliente. */
export default function FormularioCliente({ cliente }: Props) {
  const router = useRouter()
  const editando = Boolean(cliente?.id)

  const [nome, setNome] = useState(cliente?.nome ?? '')
  const [telefone, setTelefone] = useState(cliente?.telefone ?? '')
  const [instagram, setInstagram] = useState(cliente?.instagram ?? '')
  const [observacoes, setObservacoes] = useState(cliente?.observacoes ?? '')

  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')

    if (!nome.trim()) {
      setErro('Informe o nome do cliente.')
      return
    }

    setSalvando(true)
    const supabase = createClient()

    const campos = {
      nome: nome.trim(),
      telefone: telefone.trim() || null,
      instagram: instagram.trim().replace(/^@/, '') || null,
      observacoes: observacoes.trim() || null,
    }

    if (editando) {
      const { error } = await supabase
        .from('clientes')
        .update(campos)
        .eq('id', cliente!.id!)

      if (error) {
        setErro('Não foi possível salvar as alterações.')
        setSalvando(false)
        return
      }

      router.push(`/clientes/${cliente!.id}`)
      router.refresh()
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setErro('Sua sessão expirou. Entre novamente.')
      setSalvando(false)
      return
    }

    const { data, error } = await supabase
      .from('clientes')
      .insert({ ...campos, user_id: user.id })
      .select('id')
      .single()

    if (error) {
      setErro('Não foi possível cadastrar o cliente.')
      setSalvando(false)
      return
    }

    router.push(`/clientes/${data.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <Campo
        id="nome"
        rotulo="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Como você chama essa pessoa"
      />

      <Campo
        id="telefone"
        rotulo="Telefone"
        type="tel"
        inputMode="tel"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="(11) 99999-8888"
        ajuda="Usado para abrir a conversa no WhatsApp."
      />

      <Campo
        id="instagram"
        rotulo="Instagram"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="@perfil"
      />

      <CampoTexto
        id="observacoes"
        rotulo="Observações"
        value={observacoes}
        onChange={(e) => setObservacoes(e.target.value)}
        placeholder="Alergias, preferências, o que for útil lembrar"
      />

      {erro && (
        <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <Botao type="submit" disabled={salvando} className="w-full">
        {salvando
          ? 'Salvando...'
          : editando
            ? 'Salvar alterações'
            : 'Cadastrar cliente'}
      </Botao>
    </form>
  )
}
