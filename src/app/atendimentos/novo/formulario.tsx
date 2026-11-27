'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { enviarReferencia, TAMANHO_MAXIMO } from '@/lib/upload'
import { moeda } from '@/lib/formato'
import { Campo, CampoTexto } from '@/components/ui/campo'
import Selecao from '@/components/ui/selecao'
import Botao from '@/components/ui/botao'

type Cliente = { id: string; nome: string }

type Props = {
  clientes: Cliente[]
  clienteInicial?: string
}

export default function FormularioAtendimento({
  clientes,
  clienteInicial,
}: Props) {
  const router = useRouter()

  const [clienteId, setClienteId] = useState(clienteInicial ?? '')
  const [descricao, setDescricao] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [valorSinal, setValorSinal] = useState('')
  const [dataSessao, setDataSessao] = useState('')

  const [modoImagem, setModoImagem] = useState<'arquivo' | 'link'>('arquivo')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [linkImagem, setLinkImagem] = useState('')
  const [previa, setPrevia] = useState('')

  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const total = Number(valorTotal) || 0
  const sinal = Number(valorSinal) || 0
  const restante = total - sinal

  function escolherArquivo(evento: React.ChangeEvent<HTMLInputElement>) {
    const escolhido = evento.target.files?.[0]
    if (!escolhido) return

    if (!escolhido.type.startsWith('image/')) {
      setErro('O arquivo precisa ser uma imagem.')
      return
    }
    if (escolhido.size > TAMANHO_MAXIMO) {
      setErro('A imagem precisa ter no máximo 5 MB.')
      return
    }

    setErro('')
    setArquivo(escolhido)
    setPrevia(URL.createObjectURL(escolhido))
  }

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault()
    setErro('')

    if (!clienteId) return setErro('Escolha o cliente.')
    if (!descricao.trim()) return setErro('Descreva a arte do atendimento.')
    if (total <= 0) return setErro('Informe o valor total do orçamento.')
    if (sinal > total) return setErro('O sinal não pode ser maior que o valor total.')

    setSalvando(true)

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Sua sessão expirou. Entre novamente.')

      let imagemUrl: string | null = null

      if (modoImagem === 'arquivo' && arquivo) {
         imagemUrl = await enviarReferencia(arquivo, user.id)
      } else if (modoImagem === 'link' && linkImagem.trim()) {
        imagemUrl = linkImagem.trim()
      }

      const { data, error } = await supabase
        .from('atendimentos')
        .insert({
          user_id: user.id,
          cliente_id: clienteId,
          descricao: descricao.trim(),
          imagem_url: imagemUrl,
          valor_total: total,
          valor_sinal: sinal,
          data_sessao: dataSessao ? new Date(dataSessao).toISOString() : null,
          status: 'agendada',
        })
        .select('id')
        .single()

      if (error) throw new Error('Não foi possível salvar o atendimento.')

      router.push(`/atendimentos/${data.id}`)
      router.refresh()
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.')
      setSalvando(false)
    }
  }

  const abaClasse = (ativa: boolean) =>
    `flex-1 rounded-full border px-3 py-2.5 text-sm transition ${
      ativa
        ? 'border-destaque bg-marca/30 text-destaque'
        : 'border-marca text-zinc-400 hover:text-white'
    }`

  return (
    <form onSubmit={salvar} className="space-y-6">
      <Selecao
        id="cliente"
        rotulo="Cliente"
        value={clienteId}
        onChange={(e) => setClienteId(e.target.value)}
      >
        <option value="">Selecione</option>
        {clientes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </Selecao>

      <CampoTexto
        id="descricao"
        rotulo="Arte"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Leão em blackwork no antebraço, 15 cm"
      />

      {/* Imagem de referência */}
      <div>
        <p className="mb-2 ml-4 text-base text-white">Referência</p>

        <div className="mb-3 flex gap-2">
          <button type="button" onClick={() => setModoImagem('arquivo')} className={abaClasse(modoImagem === 'arquivo')}>
            Enviar imagem
          </button>
          <button type="button" onClick={() => setModoImagem('link')} className={abaClasse(modoImagem === 'link')}>
            Colar link
          </button>
        </div>

        {modoImagem === 'arquivo' ? (
          <label className="flex w-full cursor-pointer items-center gap-3 rounded-full border border-marca px-3 py-2.5 transition hover:border-destaque focus-within:border-destaque">
            <span className="shrink-0 rounded-full bg-marca px-4 py-1.5 text-sm text-white">
              Escolher imagem
            </span>
            <span className="truncate text-sm text-zinc-400">
              {arquivo ? arquivo.name : 'Nenhuma imagem escolhida'}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={escolherArquivo}
              className="sr-only"
            />
          </label>
        ) : (
          <Campo
            id="link"
            rotulo=""
            type="url"
            value={linkImagem}
            onChange={(e) => {
              setLinkImagem(e.target.value)
              setPrevia(e.target.value)
            }}
            placeholder="https://..."
          />
        )}

        {previa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previa}
            alt="Prévia da referência"
            className="mt-3 max-h-60 w-full rounded-2xl border border-marca bg-white object-contain"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
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
          className="px-4"
        />
        <Campo
          id="sinal"
          rotulo="Sinal pago"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={valorSinal}
          onChange={(e) => setValorSinal(e.target.value)}
          placeholder="0,00"
          className="px-4"
        />
      </div>

      {total > 0 && (
        <div className="sombra-cartao flex items-center justify-between rounded-2xl border border-marca bg-superficie px-6 py-4">
          <span className="text-zinc-400">A cobrar na sessão</span>
          <span className={`text-2xl font-bold ${restante < 0 ? 'text-red-400' : 'text-destaque'}`}>
            {moeda(restante)}
          </span>
        </div>
      )}

      <Campo
        id="data"
        rotulo="Data e hora da sessão"
        type="datetime-local"
        value={dataSessao}
        onChange={(e) => setDataSessao(e.target.value)}
        ajuda="Deixe em branco se ainda não tiver data marcada."
        className="[color-scheme:dark]"
      />

      {erro && (
        <p className="rounded-2xl border border-red-900 bg-red-950/50 px-5 py-3 text-sm text-red-300">
          {erro}
        </p>
      )}

      <Botao type="submit" disabled={salvando} className="w-full">
        {salvando ? 'Salvando...' : 'Salvar atendimento'}
      </Botao>
    </form>
  )
}
