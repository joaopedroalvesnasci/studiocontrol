import Link from 'next/link'

type Props = { modo: 'lista' | 'calendario' }

const OPCOES = [
  { modo: 'lista', rotulo: 'Lista', href: '/painel' },
  { modo: 'calendario', rotulo: 'Calendário', href: '/painel?modo=calendario' },
] as const

/** Botão que alterna a Agenda entre a lista e o calendário do mês. */
export default function AlternarModo({ modo }: Props) {
  return (
    <div className="mb-7 grid grid-cols-2 gap-1 rounded-full border border-marca p-1">
      {OPCOES.map((opcao) => {
        const ativo = opcao.modo === modo
        return (
          <Link
            key={opcao.modo}
            href={opcao.href}
            aria-current={ativo ? 'page' : undefined}
            className={`rounded-full py-2 text-center text-sm transition ${
              ativo ? 'bg-marca font-semibold text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {opcao.rotulo}
          </Link>
        )
      })}
    </div>
  )
}
