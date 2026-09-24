type Props = {
  id: string
  rotulo: string
  /** Texto de apoio abaixo do campo, como "Opcional". */
  ajuda?: string
} & React.InputHTMLAttributes<HTMLInputElement>

export function Campo({ id, rotulo, ajuda, ...props }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-300">
        {rotulo}
      </label>
      <input
        id={id}
        {...props}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
      />
      {ajuda && <p className="mt-1 text-xs text-zinc-500">{ajuda}</p>}
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
      <label htmlFor={id} className="mb-1.5 block text-sm text-zinc-300">
        {rotulo}
      </label>
      <textarea
        id={id}
        rows={3}
        {...props}
        className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition focus:border-emerald-500"
      />
      {ajuda && <p className="mt-1 text-xs text-zinc-500">{ajuda}</p>}
    </div>
  )
}
