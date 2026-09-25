'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { enviarReferencia, TAMANHO_MAXIMO } from '@/lib/upload'
import { moeda } from '@/lib/formato'
import { Campo, CampoTexto } from '@/components/ui/campo'
import Botao from '@/components/ui/botao'
import Selecao from '@/components/ui/selecao'

type Cliente = { id: string; nome: string }

type Props = {
  clientes: Cliente[]
  userId: string
  clienteInicial?: string
}

export default function Formulario({ clientes, userId, clienteInicial }: Props) {
  const router = useRouter()

  const [clienteId, setClienteId] = useState(clienteInicial ?? clientes[0].id)
  const [descricao, setDescricao] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [previa, setPrevia] = useState('')
  const [linkImagem, setLinkImagem] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [valorSinal, setValorSinal] = useState('')
  const [dataSessao, setDataSessao] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const total = Number(valorTotal) || 0
  const sinal = Number(valorSinal) || 0
  const restante = total - sinal

  function escolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const selecionado = evento.target.files?.[0]
    if (!selecionado) return

    if (selecionado.size > TAMANHO_MAXIMO) {
      setErro('A imagem passa de 5 MB. Escolha uma menor.')
      return
    }

    setErro('')
    setArquivo(selecionado)
    setPrevia(URL.createObjectURL(selecionado))
    setLinkImagem('')
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')

    if (!descricao.trim()) {
      setErro('Descreva a arte que será feita.')
      return
    }
    if (sinal > total) {
      setErro('O sinal não pode ser maior que o valor total.')
      return
    }

    setSalvando(true)

    try {
      let imagemUrl = linkImagem.trim() || null

      if (arquivo) {
        imagemUrl = await enviarReferencia(arquivo, userId)
      }

      const supabase = createClient()
      const { data, error } = await supabase
        .from('atendimentos')
        .insert({
          user_id: userId,
          cliente_id: clienteId,
          descricao: descricao.trim(),
          imagem_url: imagemUrl,
          valor_total: total,
          valor_sinal: sinal,
          data_sessao: dataSessao ? new Date(dataSessao).toISOString() : null,
        })
        .select('id')
        .single()

      if (error) throw error

      router.push(`/atendimentos/${data.id}`)
      router.refresh()
    } catch {
      setErro('Não foi possível salvar o atendimento. Tente novamente.')
      setSalvando(false)
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <Selecao
        id="cliente"
        rotulo="Cliente"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
      >
        {clientes.map((cliente) => (
          <option key={cliente.id} value={cliente.id}>
            {cliente.nome}
          </option>
        ))}
      </Selecao>

      <CampoTexto
        id="descricao"
        rotulo="A arte"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Rosa no antebraço, sombreada, cerca de 12 cm"
      />

      <div>
        <label htmlFor="imagem" className="mb-1.5 block text-sm text-zinc-300">
          Referência
        </label>

        {previa && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={previa}
            alt="Prévia da referência"
            className="mb-3 max-h-60 w-full rounded-lg border border-zinc-800 object-contain"
          />
        )}

        <input
          id="imagem"
          type="file"
          accept="image/*"
          onChange={escolherArquivo}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-400 outline-none transition file:mr-3 file:rounded file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-sm file:text-zinc-200 focus:border-emerald-500"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Até 5 MB. No celular dá para fotografar na hora.
        </p>

        {!arquivo && (
          <div className="mt-3">
            <Campo
              id="link"
              rotulo="Ou cole um link"
              type="url"
              inputMode="url"
              value={linkImagem}
              onChange={(e) => setLinkImagem(e.target.value)}
              placeholder="https://..."
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo
          id="total"
          rotulo="Valor total"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={valorTotal}
          onChange={(e) => setValorTotal(e.target.value)}
          placeholder="0,00"
        />
        <Campo
          id="sinal"
          rotulo="Sinal recebido"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={valorSinal}
          onChange={(e) => setValorSinal(e.target.value)}
          placeholder="0,00"
        />
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <p className="text-sm text-zinc-400">A cobrar no dia</p>
        <p
          className={`text-2xl font-bold ${
            restante < 0 ? 'text-red-400' : 'text-emerald-400'
          }`}
        >
          {moeda(restante)}
        </p>
      </div>

      <Campo
        id="data"
        rotulo="Data e hora da sessão"
        type="datetime-local"
        value={dataSessao}
        onChange={(e) => setDataSessao(e.target.value)}
        ajuda="Pode deixar em branco e agendar depois."
      />

      {erro && (
        <p className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <Botao type="submit" disabled={salvando} className="w-full">
        {salvando ? 'Salvando...' : 'Salvar atendimento'}
      </Botao>
    </form>
  )
}
