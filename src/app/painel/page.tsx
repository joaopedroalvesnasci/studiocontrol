import { createClient } from '@/lib/supabase/server'
import CabecalhoPagina from '@/components/cabecalho-pagina'
import EstadoVazio from '@/components/ui/estado-vazio'
import { inicioDeHojeISO } from '@/lib/agenda'
import CartaoSessao, { type SessaoDaAgenda } from './cartao-sessao'
import AlternarModo from './alternar-modo'
import Calendario from './calendario'

const CAMPOS =
  'id, descricao, valor_sinal, valor_restante, sinal_recebido_em, pagamento_recebido_em, data_sessao, duracao_minutos, clientes(nome)'

type Props = {
  searchParams: Promise<{ modo?: string; mes?: string; dia?: string }>
}

export default async function PainelPage({ searchParams }: Props) {
  const { modo, mes, dia } = await searchParams

  // A Agenda abre na lista; o calendário só aparece quando escolhido
  if (modo === 'calendario') {
    return (
      <main className="mx-auto w-full max-w-md px-6 pt-6">
        <CabecalhoPagina
          titulo="Agenda"
          descricao="Suas sessões mês a mês"
          acao={{ href: '/atendimentos/novo', rotulo: 'Novo' }}
        />
        <AlternarModo modo="calendario" />
        <Calendario mes={mes} dia={dia} />
      </main>
    )
  }

  const supabase = await createClient()
  const meiaNoiteDeHoje = inicioDeHojeISO()

  const [atrasadas, aReceber, proximas, semData] = await Promise.all([
    // Agendadas para um dia que já passou
    supabase
      .from('atendimentos')
      .select(CAMPOS)
      .eq('status', 'agendada')
      .lt('data_sessao', meiaNoiteDeHoje)
      .order('data_sessao', { ascending: true }),

    // Concluídas com valor ainda em aberto
    supabase
      .from('atendimentos')
      .select(CAMPOS)
      .eq('status', 'concluida')
      .is('pagamento_recebido_em', null)
      .gt('valor_restante', 0)
      .order('data_sessao', { ascending: true }),

    // De hoje em diante
    supabase
      .from('atendimentos')
      .select(CAMPOS)
      .eq('status', 'agendada')
      .gte('data_sessao', meiaNoiteDeHoje)
      .order('data_sessao', { ascending: true }),

    // Orçamentos sem data
    supabase
      .from('atendimentos')
      .select(CAMPOS)
      .eq('status', 'agendada')
      .is('data_sessao', null)
      .order('created_at', { ascending: false }),
  ])

  const lista = (r: { data: unknown }) => (r.data ?? []) as SessaoDaAgenda[]
  const listaAtrasadas = lista(atrasadas)
  const listaAReceber = lista(aReceber)
  const listaProximas = lista(proximas)
  const listaSemData = lista(semData)

  const totalPendencias = listaAtrasadas.length + listaAReceber.length
  const tudoVazio = totalPendencias + listaProximas.length + listaSemData.length === 0

  return (
    <main className="mx-auto w-full max-w-md px-6 pt-6">
      <CabecalhoPagina
        titulo="Agenda"
        descricao="Suas próximas sessões, da mais próxima para a mais distante"
        acao={{ href: '/atendimentos/novo', rotulo: 'Novo' }}
      />

      <AlternarModo modo="lista" />

      {tudoVazio && (
        <EstadoVazio
          titulo="Nenhuma sessão agendada"
          descricao="Cadastre um cliente e crie o primeiro atendimento para ver a agenda."
          acao={{ href: '/clientes', rotulo: 'Ver clientes' }}
        />
      )}

      {totalPendencias > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 flex items-center gap-2 px-2 text-xl text-white">
            Precisa da sua atenção
            <span className="rounded-full bg-[#f0997b] px-2.5 py-0.5 text-sm font-bold text-fundo">
              {totalPendencias}
            </span>
          </h2>
          <p className="mb-4 px-2 text-sm text-zinc-400">
            Toque na sessão para concluir, cancelar ou registrar o pagamento.
          </p>
          <ul className="space-y-4">
            {listaAtrasadas.map((s) => (
              <li key={s.id}>
                <CartaoSessao sessao={s} variante="atrasada" />
              </li>
            ))}
            {listaAReceber.map((s) => (
              <li key={s.id}>
                <CartaoSessao sessao={s} variante="receber" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {listaProximas.length > 0 && (
        <section className="mb-10">
          {(totalPendencias > 0 || listaSemData.length > 0) && (
            <h2 className="mb-4 px-2 text-xl text-white">Próximas sessões</h2>
          )}
          <ul className="space-y-4">
            {listaProximas.map((s) => (
              <li key={s.id}>
                <CartaoSessao sessao={s} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {listaSemData.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-1 px-2 text-xl text-white">Sem data marcada</h2>
          <p className="mb-4 px-2 text-sm text-zinc-400">Orçamentos que ainda não viraram sessão.</p>
          <ul className="space-y-4">
            {listaSemData.map((s) => (
              <li key={s.id}>
                <CartaoSessao sessao={s} variante="semData" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
