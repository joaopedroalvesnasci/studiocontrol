import Link from 'next/link'

type Props = {
  titulo: string
  descricao?: string
  /** Botao opcional no canto direito, como "Novo cliente". */
  acao?: { href: string; rotulo: string }
}

export default function CabecalhoPagina({ titulo, descricao, acao }: Props) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">{titulo}</h1>
        {descricao && <p className="mt-1 text-sm text-zinc-400">{descricao}</p>}
      </div>

      {acao && (
        <Link
          href={acao.href}
          className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          {acao.rotulo}
        </Link>
      )}
    </header>
  )
}
