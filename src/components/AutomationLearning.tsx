import { ArrowRight, BookOpen, Check, Download, ShieldCheck } from 'lucide-react'

type AutomationIdea = {
  title: string
  summary: string
  trigger: string
  flow: string
  deliverable: string
  guardrail: string
  effort: string
  offer: string
}

const ideas: AutomationIdea[] = [
  {
    title: 'Formulário do site → CRM e retorno rápido',
    summary: 'Organiza os novos pedidos de contato para que a equipe saiba quem precisa responder e qual é o próximo passo.',
    trigger: 'Uma pessoa envia o formulário de contato ou orçamento do site.',
    flow: 'Validar os campos, registrar origem e serviço, criar ou atualizar o lead no CRM, avisar o responsável e abrir uma tarefa de retorno. A primeira resposta pode ficar como rascunho para revisão humana.',
    deliverable: 'Formulário mapeado, regra anti-duplicata, campos no CRM, notificação interna, tarefa de acompanhamento, testes e instrução de uso.',
    guardrail: 'Só enviar mensagens promocionais com base legal/consentimento apropriado e opção de descadastro. Sem consentimento, automatize apenas o registro e o aviso interno.',
    effort: 'Complexidade inicial: baixa–média',
    offer: 'Piloto de captura de leads: mapear um formulário do site, classificar os pedidos, encaminhá-los ao CRM escolhido pelo cliente, configurar alertas internos e testar com dados fictícios. Não inclui compra de listas nem promessa de conversão.'
  },
  {
    title: 'Pedido de orçamento/agendamento → triagem e confirmação',
    summary: 'Reduz a troca manual de mensagens entre o pedido do site e a confirmação do próximo passo.',
    trigger: 'Uma pessoa envia uma solicitação de orçamento, disponibilidade ou agendamento pelo site.',
    flow: 'Classificar por serviço e localidade, conferir os campos obrigatórios, encaminhar à pessoa certa, criar uma tarefa ou evento no calendário e preparar a confirmação para revisão.',
    deliverable: 'Formulário ou integração mapeada, regras de encaminhamento, calendário/tarefas, modelos de confirmação, testes de conflito e procedimento para exceções.',
    guardrail: 'Não confirmar um horário sem consultar a disponibilidade real. Em saúde, não solicitar sintomas, prontuários ou outros dados clínicos nesse formulário simples.',
    effort: 'Complexidade inicial: média',
    offer: 'Piloto de triagem de solicitações: organizar pedidos por serviço, enviar para o responsável e apoiar a confirmação no calendário autorizado pelo cliente. O escopo exclui atendimento de urgência e confirmação sem disponibilidade.'
  },
  {
    title: 'Pós-venda → pedido de avaliação e lembrete de retorno',
    summary: 'Transforma um atendimento concluído em uma rotina consistente de feedback e acompanhamento.',
    trigger: 'O cliente marca um atendimento ou pedido como concluído no sistema que já utiliza.',
    flow: 'Aguardar o intervalo combinado, criar um pedido neutro de feedback, registrar a resposta e, quando fizer sentido, gerar uma tarefa futura de retorno ou manutenção.',
    deliverable: 'Evento de conclusão, janela de envio, mensagem neutra, registro no CRM, lembrete, teste de descadastro e guia de manutenção.',
    guardrail: 'Solicite feedback de forma imparcial: não filtre apenas clientes satisfeitos, não condicione benefício a avaliações e respeite consentimento e descadastro.',
    effort: 'Complexidade inicial: média',
    offer: 'Piloto de pós-venda: configurar uma solicitação de feedback imparcial e lembretes internos para clientes que autorizaram contato, documentando consentimento, descadastro, responsáveis e exceções. Não inclui publicação automática de avaliações.'
  }
]

function buildScope(idea: AutomationIdea) {
  return [
    `RASCUNHO DE SERVIÇO — ${idea.title}`,
    `Objetivo: ${idea.summary}`,
    `Gatilho: ${idea.trigger}`,
    `Entrega: ${idea.deliverable}`,
    `Limites: ${idea.guardrail}`,
    'Antes de estimar: confirmar ferramentas existentes, volume, regras, tratamento de dados, aprovações e responsável pelo fluxo.',
    'Não prometer aumento de vendas ou resultados que não foram medidos.'
  ].join('\n')
}

export default function AutomationLearning({ onCopy }: { onCopy: (text: string) => void }) {
  return (
    <div className="learning-page">
      <section className="panel learning-hero">
        <div className="learning-hero-copy">
          <span className="learning-eyebrow"><BookOpen size={14} /> GUIA PRÁTICO · AUTOMAÇÕES PARA SITES</span>
          <h2>Três serviços de automação que um negócio com site pode contratar.</h2>
          <p>Aprenda a partir do processo do cliente — não da ferramenta. Cada ideia abaixo parte de um evento que o negócio já recebe e transforma esse evento em um próximo passo claro.</p>
          <div className="learning-tags"><span>Sem Apify</span><span>Usar ferramentas do cliente quando possível</span><span>Revisão humana no piloto</span></div>
        </div>
        <a className="button-primary learning-download" href="/guia-pratico-automacoes-com-sites.md" download>
          <Download size={16} /> Baixar guia completo
        </a>
      </section>

      <div className="learning-idea-grid">
        {ideas.map((idea, index) => (
          <article className={`panel learning-idea-card ${index === 0 ? 'learning-recommended' : ''}`} key={idea.title}>
            <div className="learning-card-top">
              <span className="learning-number">0{index + 1}</span>
              <span className="soft-badge">{idea.effort}</span>
            </div>
            {index === 0 && <span className="learning-recommend-label">Mais simples para um primeiro piloto</span>}
            <h3>{idea.title}</h3>
            <p className="learning-summary">{idea.summary}</p>
            <dl className="learning-details">
              <div><dt>Gatilho</dt><dd>{idea.trigger}</dd></div>
              <div><dt>Fluxo</dt><dd>{idea.flow}</dd></div>
              <div><dt>Entrega vendável</dt><dd>{idea.deliverable}</dd></div>
            </dl>
            <div className="learning-guardrail"><ShieldCheck size={15} /><span>{idea.guardrail}</span></div>
            <div className="learning-card-footer">
              <button className="text-link" type="button" onClick={() => onCopy(buildScope(idea))}>Copiar escopo-base <ArrowRight size={14} /></button>
            </div>
          </article>
        ))}
      </div>

      <div className="learning-lower-grid">
        <section className="panel learning-method">
          <div className="panel-heading"><div><h3>Como aprender e entregar</h3><p>Repita este roteiro antes de automatizar qualquer etapa do site de um cliente.</p></div><span className="soft-badge">Método</span></div>
          <ol className="learning-step-list">
            <li><span>1</span><div><strong>Descubra o processo atual</strong><p>Quem recebe o pedido hoje? Onde os dados entram? O que mais atrasa ou se perde?</p></div></li>
            <li><span>2</span><div><strong>Desenhe gatilho, dados e resultado</strong><p>Escreva o evento que inicia o fluxo, os campos necessários, a regra de decisão e quem recebe a saída.</p></div></li>
            <li><span>3</span><div><strong>Liste exceções e aprovações</strong><p>Preveja formulário incompleto, duplicata, indisponibilidade, descadastro e quando uma pessoa deve assumir.</p></div></li>
            <li><span>4</span><div><strong>Teste antes de ativar</strong><p>Use registros fictícios: caso normal, campo ausente, duplicata e falha da integração. Registre o resultado esperado.</p></div></li>
            <li><span>5</span><div><strong>Entregue e mantenha</strong><p>Documente acesso, responsável, como pausar, como corrigir e o que fica fora do escopo.</p></div></li>
          </ol>
        </section>

        <aside className="panel learning-service">
          <div className="learning-service-mark"><Check size={17} /></div>
          <span className="learning-eyebrow">FORMATO DE SERVIÇO</span>
          <h3>Comece por um piloto delimitado.</h3>
          <div className="learning-package"><strong>1. Diagnóstico</strong><span>Um formulário, um processo, uma pessoa responsável e um resultado esperado.</span></div>
          <div className="learning-package"><strong>2. Piloto</strong><span>Uma integração, regras documentadas, testes e validação do cliente com dados de exemplo.</span></div>
          <div className="learning-package"><strong>3. Entrega e acompanhamento</strong><span>Guia de uso, limites, acesso e opção de manutenção separada.</span></div>
          <div className="learning-pricing-note"><ShieldCheck size={15} /> Estime após descobrir volume, ferramentas, exceções, segurança e suporte. Não prometa vendas nem uma taxa de conversão.</div>
        </aside>
      </div>

      <section className="panel learning-internal-note">
        <div className="learning-internal-icon"><FileTextIcon /></div>
        <div><strong>O importador de planilhas do painel é um recurso interno distinto.</strong><p>Ele analisa arquivos localmente e só salva leads estruturados depois de revisão; não pesquisa negócios na web. As três ideias deste guia são serviços possíveis para sites de negócios e ainda não foram conectadas nem ativadas.</p></div>
      </section>
    </div>
  )
}

function FileTextIcon() {
  return <BookOpen size={18} />
}
