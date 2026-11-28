'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { inicioDeHojeISO } from '@/lib/agenda'

/** Quantas sessões estão atrasadas ou com pagamento em aberto (mesma regra da Agenda). */
async function contarPendencias() {
  const supabase = createClient()
  const meiaNoiteDeHoje = inicioDeHojeISO()

  const [atrasadas, aReceber] = await Promise.all([
    supabase
      .from('atendimentos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'agendada')
      .lt('data_sessao', meiaNoiteDeHoje),
    supabase
      .from('atendimentos')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'concluida')
      .is('pagamento_recebido_em', null)
      .gt('valor_restante', 0),
  ])

  return (atrasadas.count ?? 0) + (aReceber.count ?? 0)
}

const ITENS = [
  {
    href: '/painel',
    rotulo: 'Agenda',
    icone: (
      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 7h14v10H5V9Zm2 2v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Zm-8 4v2h2v-2H7Zm4 0v2h2v-2h-2Zm4 0v2h2v-2h-2Z" />
    ),
  },
  {
    href: '/clientes',
    rotulo: 'Clientes',
    icone: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M1 20c0-3.9 3.6-7 8-7s8 3.1 8 7v1H1v-1Z" />
        <circle cx="17" cy="7" r="3" />
        <path d="M18.6 12.3c2.6.6 4.4 2.8 4.4 5.3V19h-4.2c-.3-2.6-1.6-4.9-3.6-6.4.9-.3 2.1-.4 3.4-.3Z" />
      </>
    ),
  },
  {
    href: '/perfil',
    rotulo: 'Perfil',
    icone: (
      <>
        <circle cx="12" cy="7.5" r="4.5" />
        <path d="M3 21c0-4.4 4-8 9-8s9 3.6 9 8v1H3v-1Z" />
      </>
    ),
  },
]

export default function NavInferior() {
  const caminho = usePathname()
  const [pendencias, setPendencias] = useState(0)

  // Reconta a cada troca de página, para o número acompanhar o que foi resolvido
  useEffect(() => {
    let ativo = true
    contarPendencias()
      .then((total) => {
        if (ativo) setPendencias(total)
      })
      .catch(() => {})
    return () => {
      ativo = false
    }
  }, [caminho])

  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-apagado/70 bg-fundo"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <ul className="mx-auto flex max-w-md">
        {ITENS.map((item) => {
          const ativo = caminho.startsWith(item.href)
          const numero = item.href === '/painel' ? pendencias : 0

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={ativo ? 'page' : undefined}
                aria-label={numero > 0 ? `${item.rotulo}, ${numero} pendências` : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-xs transition ${
                  ativo ? 'text-destaque' : 'text-apagado hover:text-zinc-300'
                }`}
              >
                <span className="relative">
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    {item.icone}
                  </svg>
                  {numero > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1.5 -right-2.5 min-w-5 rounded-full bg-[#f0997b] px-1.5 text-center text-[11px] leading-5 font-bold text-fundo"
                    >
                      {numero > 9 ? '9+' : numero}
                    </span>
                  )}
                </span>
                {item.rotulo}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
