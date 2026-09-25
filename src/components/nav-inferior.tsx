'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ITENS = [
  {
    href: '/painel',
    rotulo: 'Agenda',
    icone: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M8 3v4M16 3v4M3 11h18" />
      </>
    ),
  },
  {
    href: '/clientes',
    rotulo: 'Clientes',
    icone: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        <path d="M16 4.5a4 4 0 0 1 0 7M18 20c0-2.4-.9-4.5-2.3-6" />
      </>
    ),
  },
  {
    href: '/perfil',
    rotulo: 'Perfil',
    icone: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7" />
      </>
    ),
  },
]

export default function NavInferior() {
  const caminho = usePathname()

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {ITENS.map((item) => {
          const ativo = caminho.startsWith(item.href)

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs transition ${
                  ativo ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {item.icone}
                </svg>
                {item.rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
