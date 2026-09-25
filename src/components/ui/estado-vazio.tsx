import Link from 'next/link'

type Props = {
  titulo: string
  descricao: string
  acao?: { href: string; rotulo: string }
}

/**
 * Tela vazia e um convite para agir, nao um aviso de erro.
 */
export default function EstadoVazio({ titulo, descricao, acao }: Props) {
  return (
    <div className="rounded-xl border border-dashed border-zinc-800 px-6 py-12 text-center">
      <p className="font-semibold text-zinc-200">{titulo}</p>
      <p className="mx-auto mt-1 max-w-xs text-sm text-zinc-500">{descricao}</p>

      {acao && (
        <Link
          href={acao.href}
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
        >
          {acao.rotulo}
        </Link>
      )}
    </div>
  )
}
