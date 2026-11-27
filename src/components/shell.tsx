'use client'

import { usePathname } from 'next/navigation'
import Topo from './topo'
import NavInferior from './nav-inferior'

/** Telas antes do login: têm topo próprio, maior, e não levam a navegação. */
const TELAS_DE_ACESSO = ['/login', '/cadastro']

export default function Shell({ children }: { children: React.ReactNode }) {
  const caminho = usePathname()
  const telaDeAcesso = TELAS_DE_ACESSO.some((rota) => caminho.startsWith(rota))

  if (telaDeAcesso) {
    return <>{children}</>
  }

  return (
    <>
      <Topo />
      <div className="pb-28">{children}</div>
      <NavInferior />
    </>
  )
}
