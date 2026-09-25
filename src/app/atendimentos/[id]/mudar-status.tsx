'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Botao from '@/components/ui/botao'

type Props = { id: string; statusAtual: string }

export default function MudarStatus({ id, statusAtual }: Props) {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function mudar(novoStatus: 'agendada' | 'concluida' | 'cancelada') {
    setSalvando(true)
    setErro('')

    const supabase = createClient()
    const { error } = await supabase
      .from('atendimentos')
      .update({ status: novoStatus })
      .eq('id', id)

    if (error) {
      setErro('Não foi possível alterar o status.')
      setSalvando(false)
      return
    }

    router.refresh()
    setSalvando(false)
  }

  return (
    <div className="space-y-3">
      {statusAtual === 'agendada' && (
        <>
          <Botao
            onClick={() => mudar('concluida')}
            disabled={salvando}
            className="w-full"
          >
            Marcar como concluída
          </Botao>
          <Botao
            variante="secundario"
            onClick={() => mudar('cancelada')}
            disabled={salvando}
            className="w-full"
          >
            Cancelar sessão
          </Botao>
        </>
      )}

      {statusAtual !== 'agendada' && (
        <Botao
          variante="secundario"
          onClick={() => mudar('agendada')}
          disabled={salvando}
          className="w-full"
        >
          Reabrir como agendada
        </Botao>
      )}

      {erro && <p className="text-sm text-red-300">{erro}</p>}
    </div>
  )
}
