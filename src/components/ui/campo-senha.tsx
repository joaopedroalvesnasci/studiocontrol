'use client'

import { useState } from 'react'
import { ESTILO_CAMPO } from './campo'

type Props = {
  id: string
  rotulo: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>

/** Campo de senha com o botão de olho para mostrar ou esconder. */
export default function CampoSenha({ id, rotulo, ...props }: Props) {
  const [visivel, setVisivel] = useState(false)

  return (
    <div>
      <label htmlFor={id} className="mb-2 ml-4 block text-base text-white">
        {rotulo}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visivel ? 'text' : 'password'}
          {...props}
          className={`${ESTILO_CAMPO} rounded-full pr-14`}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          aria-label={visivel ? 'Esconder senha' : 'Mostrar senha'}
          className="absolute inset-y-0 right-3 my-auto flex h-10 w-10 items-center justify-center rounded-full text-destaque transition hover:bg-white/5"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            {visivel ? (
              <path d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7Zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9Zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            ) : (
              <path d="M3.3 2 2 3.3l3.2 3.2C3.6 7.8 2.5 9.6 2 12c1 2.5 5 7 10 7 1.9 0 3.6-.6 5.1-1.6l3.6 3.6 1.3-1.3L3.3 2Zm8.7 14.5a4.5 4.5 0 0 1-4.2-6.2l1.6 1.6a2.4 2.4 0 0 0 3 3l1.6 1.6c-.6.3-1.3.5-2 .5Zm0-11.5c-1.4 0-2.7.4-3.8 1l2 2a4.5 4.5 0 0 1 5.5 5.5l3.3 3.3c1.6-1.3 2.9-3 3.6-4.8-1-2.5-5-7-10-7Z" />
            )}
          </svg>
        </button>
      </div>
    </div>
  )
}
