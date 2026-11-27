/** Classes compartilhadas pelos campos: borda verde e cantos bem arredondados. */
export const ESTILO_CAMPO =
  'w-full border border-marca bg-transparent px-5 py-3.5 text-white placeholder:text-zinc-500 outline-none transition focus:border-destaque'

type Props = {
  id: string
  rotulo: string
  /** Texto de apoio abaixo do campo, como "Opcional". */
  ajuda?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Campo({ id, rotulo, ajuda, className = '', ...props }: Props) {
  return (
    <div>
      {rotulo && (
        <label htmlFor={id} className="mb-2 ml-4 block text-base text-white">
          {rotulo}
        </label>
      )}
      <input
        id={id}
        {...props}
        className={`${ESTILO_CAMPO} rounded-full ${className}`}
      />
      {ajuda && <p className="mt-1.5 ml-4 text-xs text-zinc-500">{ajuda}</p>}
    </div>
  )
}

type PropsArea = {
  id: string
  rotulo: string
  ajuda?: string
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export function CampoTexto({ id, rotulo, ajuda, ...props }: PropsArea) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 ml-4 block text-base text-white">
        {rotulo}
      </label>
      <textarea
        id={id}
        rows={3}
        {...props}
        className={`${ESTILO_CAMPO} resize-y rounded-3xl`}
      />
      {ajuda && <p className="mt-1.5 ml-4 text-xs text-zinc-500">{ajuda}</p>}
    </div>
  )
}
