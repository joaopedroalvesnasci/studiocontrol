import Link from 'next/link'

type Props = {
  titulo: string
  descricao: string
  acao?: { href: string; rotulo: string }
}

/** Tela vazia é um convite para agir, não um aviso de erro. */
export default function EstadoVazio({ titulo, descricao, acao }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-marca/70 px-6 py-12 text-center">
      <p className="text-lg font-semibold text-white">{titulo}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-400">{descricao}</p>

      {acao && (
        <Link
          href={acao.href}
          className="mt-6 inline-block rounded-full bg-marca px-6 py-3 font-semibold text-white transition hover:bg-marca-forte"
        >
          {acao.rotulo}
        </Link>
      )}
    </div>
  )
}
