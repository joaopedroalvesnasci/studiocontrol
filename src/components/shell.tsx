'use client'

import { usePathname } from 'next/navigation'
import NavInferior from './nav-inferior'

/** Telas que aparecem antes do login e nao levam a barra de navegacao. */
const SEM_NAVEGACAO = ['/login', '/cadastro']

export default function Shell({ children }: { children: React.ReactNode }) {
  const caminho = usePathname()
  const escondeNav = SEM_NAVEGACAO.some((rota) => caminho.startsWith(rota))

  if (escondeNav) {
    return <>{children}</>
  }

  return (
    <>
      <div className="pb-20">{children}</div>
      <NavInferior />
    </>
  )
}
