import Link from 'next/link'

type Props = {
  titulo: string
  descricao?: string
  /** Botão opcional no canto direito, como "Novo" ou "Editar". */
  acao?: { href: string; rotulo: string }
}

export default function CabecalhoPagina({ titulo, descricao, acao }: Props) {
  return (
    <header className="mb-7 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-4xl font-bold tracking-tight text-white">{titulo}</h1>
        {descricao && (
          <p className="mt-1 text-sm leading-relaxed text-zinc-400">{descricao}</p>
        )}
      </div>

      {acao && (
        <Link
          href={acao.href}
          className="shrink-0 rounded-lg bg-marca px-6 py-3 tracking-wide text-white transition hover:bg-marca-forte focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque"
        >
          {acao.rotulo}
        </Link>
      )}
    </header>
  )
}
