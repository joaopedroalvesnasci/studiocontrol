type Props = {
  id: string
  rotulo: string
  ajuda?: string
} & React.SelectHTMLAttributes<HTMLSelectElement>

export default function Selecao({
  id,
  rotulo,
  ajuda,
  children,
  ...props
}: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-300">
        {rotulo}
      </label>
      <select
        id={id}
        {...props}
        className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none transition focus:border-emerald-500"
      >
        {children}
      </select>
      {ajuda && <p className="mt-1 text-xs text-zinc-500">{ajuda}</p>}
    </div>
  )
}
