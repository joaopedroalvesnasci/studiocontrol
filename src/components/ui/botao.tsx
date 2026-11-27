type Props = {
  variante?: 'principal' | 'secundario'
} & React.ButtonHTMLAttributes<HTMLButtonElement>

const ESTILOS = {
  principal: 'bg-marca text-white hover:bg-marca-forte',
  secundario: 'border border-marca text-white hover:bg-white/5',
}

export default function Botao({
  variante = 'principal',
  className = '',
  ...props
}: Props) {
  return (
    <button
      {...props}
      className={`rounded-full px-6 py-4 text-lg font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destaque disabled:opacity-50 ${ESTILOS[variante]} ${className}`}
    />
  )
}
