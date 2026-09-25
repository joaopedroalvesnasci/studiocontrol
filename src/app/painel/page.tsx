import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'

/**
 * Versao provisoria. A agenda real (proximas sessoes) e construida
 * na Etapa 8, quando os atendimentos ja existirem.
 */
export default function PainelPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <CabecalhoPagina
        titulo="Agenda"
        descricao="Suas próximas sessões aparecem aqui."
      />

      <EstadoVazio
        titulo="Nenhuma sessão agendada"
        descricao="Cadastre um cliente e crie o primeiro atendimento para ver a agenda."
        acao={{ href: '/clientes', rotulo: 'Ver clientes' }}
      />
    </main>
  )
}
