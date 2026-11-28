'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { periodo } from '@/lib/formato'
import {
  DURACOES,
  DIA_INTEIRO,
  intervalo,
  conflitos,
  proximoHorarioLivre,
  paraCampoDataHora,
  buscarSessoesProximas,
  type SessaoOcupada,
} from '@/lib/agenda'
import Botao from '@/components/ui/botao'
import { Campo } from '@/components/ui/campo'

type Props = {
  id: string
  dataSessao: string | null
  duracaoMinutos: number
  reagendamentos: number
  aoFechar: () => void
}

/**
 * Escolhe nova data, hora e duração para uma sessão.
 * Usa a mesma checagem de horário ocupado do cadastro, ignorando a própria sessão.
 * Só conta como remarcação quando uma sessão que já tinha data muda de data.
 */
export default function PainelReagendar({
  id,
  dataSessao,
  duracaoMinutos,
  reagendamentos,
  aoFechar,
}: Props) {
  const router = useRouter()
  const tinhaData = Boolean(dataSessao)

  // Se a data antiga já passou (sessão atrasada), o campo começa vazio
  const dataAindaVale = tinhaData && new Date(dataSessao!).getTime() > Date.now()
  const [novaData, setNovaData] = useState(dataAindaVale ? paraCampoDataHora(new Date(dataSessao!)) : '')
  const [duracao, setDuracao] = useState(duracaoMinutos)
  const [conflito, setConflito] = useState<{ sessao: SessaoOcupada; sugestao: string | null } | null>(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function salvar() {
    setErro('')
    setConflito(null)

    if (!novaData) {
      setErro('Escolha a nova data e hora.')
      return
    }

    const desejado = new Date(novaData)
    if (desejado.getTime() < Date.now()) {
      setErro('Escolha uma data a partir de agora.')
      return
    }

    setSalvando(true)
    const supabase = createClient()

    const sessoes = await buscarSessoesProximas(supabase, desejado)
    const choques = conflitos(intervalo(desejado, duracao), sessoes, id)

    if (choques.length > 0) {
      const livre = proximoHorarioLivre(desejado, duracao, sessoes, id)
      setConflito({ sessao: choques[0], sugestao: livre ? paraCampoDataHora(livre) : null })
      setSalvando(false)
      return
    }

    const mudouDeData = tinhaData && new Date(dataSessao!).getTime() !== desejado.getTime()

    const { error } = await supabase
      .from('atendimentos')
      .update({
        data_sessao: desejado.toISOString(),
        duracao_minutos: duracao,
        reagendamentos: reagendamentos + (mudouDeData ? 1 : 0),
      })
      .eq('id', id)

    setSalvando(false)

    if (error) {
      setErro('Não foi possível salvar a nova data. Tente novamente.')
      return
    }

    aoFechar()
    router.refresh()
  }

  return (
    <div className="sombra-cartao space-y-5 rounded-2xl border border-marca bg-superficie px-6 py-5">
      <p className="text-lg text-white">{tinhaData ? 'Reagendar sessão' : 'Marcar data'}</p>

      <Campo
        id="nova-data"
        rotulo="Nova data e hora"
        type="datetime-local"
        value={novaData}
        min={paraCampoDataHora(new Date())}
        onChange={(e) => {
          setNovaData(e.target.value)
          setConflito(null)
        }}
        className="[color-scheme:dark]"
      />

      <div>
        <p className="mb-2 ml-4 text-base text-white">Duração</p>
        <div className="grid grid-cols-3 gap-2">
          {DURACOES.map((d) => (
            <button
              key={d.minutos}
              type="button"
              onClick={() => {
                setDuracao(d.minutos)
                setConflito(null)
              }}
              className={`rounded-full border px-3 py-2.5 text-sm transition ${
                duracao === d.minutos
                  ? 'border-destaque bg-marca/30 text-destaque'
                  : 'border-marca text-zinc-300 hover:text-white'
              }`}
            >
              {d.rotulo}
            </button>
          ))}
        </div>
      </div>

      {conflito && (
        <div className="rounded-2xl border border-[#f0997b] bg-[#f0997b]/10 px-5 py-4">
          <p className="font-semibold text-[#f0997b]">
            {duracao >= DIA_INTEIRO ? 'Esse dia já tem sessão marcada' : 'Esse horário já está ocupado'}
          </p>
          <p className="mt-1 text-sm text-zinc-200">
            {conflito.sessao.clientes?.nome ?? 'Cliente'}, {conflito.sessao.descricao}
          </p>
          <p className="text-sm text-zinc-400">
            {periodo(conflito.sessao.data_sessao, conflito.sessao.duracao_minutos)}
          </p>

          {conflito.sugestao ? (
            <button
              type="button"
              onClick={() => {
                setNovaData(conflito.sugestao!)
                setConflito(null)
              }}
              className="mt-3 w-full rounded-full bg-marca px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-marca-forte"
            >
              Usar o próximo horário livre: {conflito.sugestao.slice(11)}
            </button>
          ) : (
            <p className="mt-3 text-sm text-zinc-300">
              {duracao >= DIA_INTEIRO
                ? 'Escolha outra data.'
                : 'Não há outro horário livre nesse dia. Escolha outra data.'}
            </p>
          )}
        </div>
      )}

      {erro && (
        <p className="rounded-2xl border border-red-900 bg-red-950/50 px-5 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <Botao onClick={salvar} disabled={salvando} className="w-full">
        {salvando ? 'Salvando...' : tinhaData ? 'Salvar nova data' : 'Salvar data'}
      </Botao>

      <button
        type="button"
        onClick={aoFechar}
        disabled={salvando}
        className="w-full py-1 text-sm text-zinc-500 hover:text-zinc-300"
      >
        Voltar
      </button>
    </div>
  )
}
