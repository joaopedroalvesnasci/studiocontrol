import { ESTILO_CAMPO } from './campo'

type Props = {
  id: string
  rotulo: string
  ajuda?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export default function Selecao({ id, rotulo, ajuda, children, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 ml-4 block text-base text-white">
        {rotulo}
      </label>
      <div className="relative">
        <select
          id={id}
          {...props}
          className={`${ESTILO_CAMPO} appearance-none rounded-full bg-fundo pr-12`}
        >
          {children}
        </select>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-5 my-auto text-destaque"
        >
          <path d="M7 10l5 5 5-5H7Z" />
        </svg>
      </div>
      {ajuda && <p className="mt-1.5 ml-4 text-xs text-zinc-500">{ajuda}</p>}
    </div>
  )
}
