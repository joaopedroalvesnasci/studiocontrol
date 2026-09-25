type Props = {
  variante?: 'principal' | 'secundario'
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const ESTILOS = {
  principal:
    'bg-emerald-600 text-white hover:bg-emerald-500 focus-visible:outline-emerald-400',
  secundario:
    'border border-zinc-700 text-zinc-300 hover:bg-zinc-800 focus-visible:outline-zinc-500',
}

export default function Botao({
  variante = 'principal',
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`rounded-lg px-4 py-3 font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
    />
  )
}
