import { useEffect, useMemo, useState, type ComponentType } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Copy,
  ExternalLink,
  FileText,
  Filter,
  Globe,
  Camera,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { leads, researchedAt, type Lead, type Priority } from './data/leads'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
type PageKey = 'dashboard' | 'leads' | 'crm' | 'appointments' | 'projects' | 'billing' | 'ranking' | 'templates' | 'affiliate' | 'sitebuilder'
type Stage = 'Mapeado' | 'Qualificar' | 'Em conversa' | 'Proposta enviada' | 'Cliente' | 'Sem prioridade'
type LeadState = { stage: Stage; notes: string }
type LocalState = Record<string, LeadState>

const stages: Stage[] = ['Mapeado', 'Qualificar', 'Em conversa', 'Proposta enviada', 'Cliente', 'Sem prioridade']
const boardStages: Stage[] = ['Mapeado', 'Qualificar', 'Em conversa', 'Proposta enviada', 'Cliente', 'Sem prioridade']
const initialState: LocalState = Object.fromEntries(leads.map((lead) => [lead.id, { stage: 'Mapeado', notes: '' }]))

const navGroups: { title?: string; items: { key: PageKey; label: string; icon: IconType; soon?: boolean }[] }[] = [
  { items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { key: 'leads', label: 'Leads', icon: Users }, { key: 'crm', label: 'CRM', icon: ClipboardList }, { key: 'appointments', label: 'Agendamentos', icon: CalendarDays }, { key: 'projects', label: 'Meus projetos', icon: Globe }] },
  { items: [{ key: 'billing', label: 'Cobrar clientes', icon: WalletCards, soon: true }, { key: 'ranking', label: 'Ranking', icon: Target }, { key: 'templates', label: 'Templates', icon: FileText }] },
  { items: [{ key: 'affiliate', label: 'Seja um afiliado', icon: BriefcaseBusiness, soon: true }, { key: 'sitebuilder', label: 'Criar site', icon: Sparkles, soon: true }] },
]

const pageTitles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral da sua prospecção local' },
  leads: { title: 'Leads', subtitle: 'Clínicas, evidências e possíveis serviços a oferecer' },
  crm: { title: 'CRM', subtitle: 'Organize seu acompanhamento manualmente' },
  appointments: { title: 'Agendamentos', subtitle: 'Área demonstrativa para suas próprias reuniões' },
  projects: { title: 'Meus projetos', subtitle: 'Organização de trabalhos e entregas' },
  billing: { title: 'Cobrar clientes', subtitle: 'Controle demonstrativo de cobranças' },
  ranking: { title: 'Ranking', subtitle: 'Prioridade provisória baseada em evidências observáveis' },
  templates: { title: 'Templates', subtitle: 'Rascunhos para adaptar antes de qualquer abordagem' },
  affiliate: { title: 'Seja um afiliado', subtitle: 'Módulo demonstrativo' },
  sitebuilder: { title: 'Criar site', subtitle: 'Módulo demonstrativo' },
}

function readState(): LocalState {
  try {
    const saved = localStorage.getItem('prospecta-campinas-state')
    if (!saved) return initialState
    return { ...initialState, ...JSON.parse(saved) as LocalState }
  } catch {
    return initialState
  }
}

function statusClass(priority: Priority) {
  if (priority.startsWith('Alta') || priority.startsWith('Média-alta')) return 'priority-high'
  if (priority.startsWith('Média-baixa') || priority.startsWith('Baixa')) return 'priority-low'
  return 'priority-medium'
}

function getOfferTypes(lead: Lead) {
  const text = lead.offer.toLowerCase()
  const kinds: string[] = []
  if (/site|página|landing page|cta|mobile/.test(text)) kinds.push('Site / landing page')
  if (/automa|formulário|fluxo|whatsapp|agend|solicitação/.test(text)) kinds.push('Automação / agendamento')
  if (/instagram|visual/.test(text)) kinds.push('Instagram / visual')
  return kinds.length ? kinds : ['Validação inicial']
}

function isNeedsReview(lead: Lead) {
  return /média|moderada|baixa|divergência|divergente|não confirmado|não confirmada|pendente/i.test(`${lead.confidence} ${lead.address}`)
}

function App() {
  const [page, setPage] = useState<PageKey>('dashboard')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [state, setState] = useState<LocalState>(readState)
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('Todos os sites')
  const [priorityFilter, setPriorityFilter] = useState('Todas as prioridades')
  const [offerFilter, setOfferFilter] = useState('Todas as ofertas')
  const [reviewFilter, setReviewFilter] = useState('Todas as fichas')
  const [sourceFilter, setSourceFilter] = useState('Todas as fontes')
  const [toast, setToast] = useState('')

  useEffect(() => {
    localStorage.setItem('prospecta-campinas-state', JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const visibleLeads = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('pt-BR')
    return leads.filter((lead) => {
      const matchesText = !term || [lead.name, lead.specialty, lead.address, lead.services].join(' ').toLocaleLowerCase('pt-BR').includes(term)
      const matchesSite = siteFilter === 'Todos os sites' || (siteFilter === 'Site confirmado' ? lead.websiteStatus === 'Confirmado' : lead.websiteStatus === 'Não localizado nas fontes consultadas')
      const matchesPriority = priorityFilter === 'Todas as prioridades' || lead.priority === priorityFilter
      const matchesOffer = offerFilter === 'Todas as ofertas' || getOfferTypes(lead).includes(offerFilter)
      const matchesReview = reviewFilter === 'Todas as fichas' || (reviewFilter === 'Revisar dados' ? isNeedsReview(lead) : !isNeedsReview(lead))
      const matchesSources = sourceFilter === 'Todas as fontes' || (sourceFilter === 'Com fontes' ? lead.sources.length > 0 : lead.sources.length === 0)
      return matchesText && matchesSite && matchesPriority && matchesOffer && matchesReview && matchesSources
    })
  }, [search, siteFilter, priorityFilter, offerFilter, reviewFilter, sourceFilter])

  const stageCount = (stage: Stage) => leads.filter((lead) => (state[lead.id]?.stage ?? 'Mapeado') === stage).length
  const siteCount = leads.filter((lead) => lead.websiteStatus === 'Confirmado').length
  const pageInfo = pageTitles[page]

  function updateLead(leadId: string, updates: Partial<LeadState>) {
    setState((current) => ({
      ...current,
      [leadId]: { ...(current[leadId] ?? { stage: 'Mapeado', notes: '' }), ...updates },
    }))
  }

  function openPage(nextPage: PageKey) {
    setPage(nextPage)
    setDrawerOpen(false)
    setSelectedLead(null)
  }

  function openLead(lead: Lead) {
    setSelectedLead(lead)
  }

  async function copyTemplate(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setToast('Rascunho copiado. Revise e personalize antes de usar.')
    } catch {
      setToast('Não foi possível copiar automaticamente neste navegador.')
    }
  }

  return (
    <div className="app-shell">
      <button className={`mobile-scrim ${drawerOpen ? 'visible' : ''}`} aria-label="Fechar menu" onClick={() => setDrawerOpen(false)} />
      <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><img src="/prospecta-mark.svg" alt="" /></div>
          <div className="brand-copy"><span>Prospecta</span><small>Campinas</small></div>
          <button className="icon-button sidebar-close" aria-label="Fechar menu" onClick={() => setDrawerOpen(false)}><X size={18} /></button>
        </div>
        <div className="sidebar-rule" />
        <nav className="side-nav" aria-label="Navegação principal">
          {navGroups.map((group, groupIndex) => (
            <div className="nav-group" key={groupIndex}>
              {group.title && <div className="nav-section-title">{group.title}</div>}
              {group.items.map(({ key, label, icon: Icon, soon }) => (
                <button key={key} className={`nav-item ${page === key ? 'nav-active' : ''}`} onClick={() => openPage(key)}>
                  <Icon size={19} strokeWidth={1.9} />
                  <span>{label}</span>
                  {key === 'leads' && <span className="nav-count">10</span>}
                  {soon && <span className="soon-badge">Em breve</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note"><ShieldCheck size={16} /><span>Dados do CRM salvos neste navegador</span></div>
          <div className="profile-row"><div className="profile-avatar">PC</div><div><strong>Prospecção local</strong><small>Campinas · São Paulo</small></div><MoreHorizontal size={18} className="profile-more" /></div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setDrawerOpen(true)}><Menu size={21} /></button>
            <div className="breadcrumb"><span>Prospecta</span><ChevronRight size={14} /><strong>{pageInfo.title}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="topbar-date"><span className="live-dot" /> Pesquisa atualizada em {researchedAt}</div>
            <div className="topbar-avatar">PC</div>
          </div>
        </header>

        <main className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PROSPECÇÃO LOCAL <span>•</span> CAMPINAS, SP</div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.subtitle}</p>
            </div>
            {page === 'leads' && <button className="filter-pill" onClick={() => { setSearch(''); setSiteFilter('Todos os sites'); setPriorityFilter('Todas as prioridades'); setOfferFilter('Todas as ofertas'); setReviewFilter('Todas as fichas'); setSourceFilter('Todas as fontes') }}><Filter size={15} /> Limpar filtros</button>}
          </div>

          {page === 'dashboard' && <DashboardPage stageCount={stageCount} siteCount={siteCount} onNavigate={openPage} onOpenLead={openLead} state={state} />}
          {page === 'leads' && <LeadsPage leads={visibleLeads} search={search} setSearch={setSearch} siteFilter={siteFilter} setSiteFilter={setSiteFilter} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} offerFilter={offerFilter} setOfferFilter={setOfferFilter} reviewFilter={reviewFilter} setReviewFilter={setReviewFilter} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} state={state} updateLead={updateLead} onOpenLead={openLead} />}
          {page === 'crm' && <CRMPage state={state} updateLead={updateLead} onOpenLead={openLead} />}
          {page === 'ranking' && <RankingPage state={state} onOpenLead={openLead} />}
          {page === 'templates' && <TemplatesPage onCopy={copyTemplate} />}
          {page === 'appointments' && <PlaceholderPage icon={CalendarDays} title="Organize suas próximas conversas" label="DEMONSTRAÇÃO" description="Este espaço é para suas reuniões com leads. Nenhuma clínica tem um agendamento registrado e nenhum calendário externo está conectado." />}
          {page === 'projects' && <ProjectsPage />}
          {page === 'billing' && <PlaceholderPage icon={CircleDollarSign} title="Acompanhe cobranças dos seus projetos" label="DEMONSTRAÇÃO · SEM PAGAMENTOS" description="Nenhuma cobrança ou pagamento foi criado. Use este espaço futuramente para organizar propostas e valores acordados, sem processar transações." />}
          {page === 'affiliate' && <PlaceholderPage icon={BriefcaseBusiness} title="Programa de afiliados" label="EM BREVE" description="Não há programa, link de afiliado ou integração ativa nesta demonstração." />}
          {page === 'sitebuilder' && <PlaceholderPage icon={Globe} title="Criação de sites" label="EM BREVE" description="Este módulo é apenas uma referência de navegação. Ainda não cria, hospeda nem publica sites de clientes." />}
        </main>
        <footer className="app-footer"><span>Prospecta Campinas</span><span>Oportunidades são hipóteses · Nenhuma abordagem foi enviada</span></footer>
      </div>

      {selectedLead && <LeadDetail lead={selectedLead} state={state[selectedLead.id] ?? { stage: 'Mapeado', notes: '' }} onChange={updateLead} onClose={() => setSelectedLead(null)} />}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

function DashboardPage({ stageCount, siteCount, onNavigate, onOpenLead, state }: { stageCount: (stage: Stage) => number; siteCount: number; onNavigate: (page: PageKey) => void; onOpenLead: (lead: Lead) => void; state: LocalState }) {
  const ranked = [...leads].sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority)).slice(0, 4)
  const pipeline = boardStages.map((stage) => ({ stage, value: stageCount(stage) }))
  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-orb"><Target size={25} /></div>
        <div className="welcome-copy"><div className="welcome-label">SEU FOCO AGORA</div><h2>Transforme sinais públicos em conversas relevantes.</h2><p>10 clínicas mapeadas em Campinas. As oportunidades são hipóteses — valide antes de propor qualquer serviço.</p></div>
        <button className="button-primary" onClick={() => onNavigate('leads')}>Explorar leads <ArrowRight size={16} /></button>
        <div className="banner-pattern" aria-hidden="true"><span /><span /><span /></div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Leads mapeados" value={String(leads.length)} hint="Clínicas locais" icon={Users} tone="blue" />
        <MetricCard label="Site próprio confirmado" value={String(siteCount)} hint="1 site não localizado nas fontes" icon={Globe} tone="violet" />
        <MetricCard label="Hipóteses de serviço" value={String(leads.length)} hint="Ainda sem validação comercial" icon={Sparkles} tone="amber" />
        <MetricCard label="Conversas confirmadas" value={String(stageCount('Em conversa') + stageCount('Proposta enviada') + stageCount('Cliente'))} hint="Atualize manualmente no CRM" icon={MessageSquareText} tone="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-heading"><div><h3>Seu acompanhamento</h3><p>Estágios internos — tudo começa como mapeado.</p></div><button className="text-link" onClick={() => onNavigate('crm')}>Abrir CRM <ArrowRight size={15} /></button></div>
          <div className="pipeline-list">
            {pipeline.map(({ stage, value }, index) => <div className="pipeline-row" key={stage}><div className="pipeline-label"><span className={`pipeline-dot dot-${index}`} />{stage}</div><div className="pipeline-track"><span style={{ width: `${Math.max(value / leads.length * 100, value ? 9 : 0)}%` }} className={`pipeline-fill fill-${index}`} /></div><strong>{value}</strong></div>)}
          </div>
          <div className="panel-footnote"><ShieldCheck size={15} /> Estágios editáveis ficam salvos apenas neste navegador.</div>
        </section>
        <section className="panel priority-panel">
          <div className="panel-heading"><div><h3>Prioridade para investigar</h3><p>Baseada em verificabilidade e sinais, não em intenção de compra.</p></div><button className="icon-button" aria-label="Abrir ranking" onClick={() => onNavigate('ranking')}><ArrowUpRight size={18} /></button></div>
          <div className="priority-list">{ranked.map((lead, i) => <button className="priority-item" key={lead.id} onClick={() => onOpenLead(lead)}><span className={`rank-index rank-${i + 1}`}>{String(i + 1).padStart(2, '0')}</span><span className="priority-name"><strong>{lead.name}</strong><small>{lead.websiteStatus === 'Confirmado' ? 'Site confirmado' : 'Site não localizado'}</small></span><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority.replace(' provisória', '')}</span><ChevronRight size={16} className="muted-icon" /></button>)}</div>
          <button className="panel-bottom-link" onClick={() => onNavigate('ranking')}>Ver critérios de priorização <ArrowRight size={14} /></button>
        </section>
      </div>

      <div className="bottom-grid">
        <section className="panel signals-panel"><div className="panel-heading"><div><h3>Sinais observados</h3><p>Ideias de oferta que ainda precisam de validação.</p></div><span className="soft-badge">Leitura pública</span></div>
          <div className="signal-grid"><div className="signal-card signal-blue"><div className="signal-icon"><Globe size={17} /></div><strong>Jornada site → contato</strong><span>Investigar clareza de páginas e chamadas, sem presumir que estejam ruins.</span><button onClick={() => onNavigate('leads')}>Ver fichas <ArrowRight size={14} /></button></div><div className="signal-card signal-lilac"><div className="signal-icon"><Zap size={17} /></div><strong>Fluxo de atendimento</strong><span>Alguns perfis usam WhatsApp para agendar; necessidade de automação não confirmada.</span><button onClick={() => onNavigate('leads')}>Qualificar hipótese <ArrowRight size={14} /></button></div><div className="signal-card signal-peach"><div className="signal-icon"><Camera size={17} /></div><strong>Presença visual</strong><span>Auditar consistência site–Instagram antes de sugerir qualquer redesign.</span><button onClick={() => onNavigate('templates')}>Ver rascunhos <ArrowRight size={14} /></button></div></div>
        </section>
        <section className="panel next-panel"><div className="panel-heading"><div><h3>Próximos passos</h3><p>Fluxo seguro para validar uma oportunidade.</p></div></div><div className="next-steps"><div className="step-row"><span className="step-number">1</span><div><strong>Escolha um lead bem documentado</strong><small>Comece pelos sites e contatos publicados pelo próprio negócio.</small></div></div><div className="step-row"><span className="step-number">2</span><div><strong>Faça uma pergunta de descoberta</strong><small>Não apresente hipótese como falha confirmada.</small></div></div><div className="step-row"><span className="step-number">3</span><div><strong>Ofereça um piloto de escopo fechado</strong><small>Defina entrega e preço; não prometa resultados.</small></div></div></div><button className="next-link" onClick={() => onNavigate('templates')}>Abrir modelos de mensagem <ArrowRight size={14} /></button></section>
      </div>
      <div className="data-note"><BadgeCheck size={16} /><span>Fontes consultadas em <strong>{researchedAt}</strong>. Dados públicos podem mudar; confirme endereço e canal antes de uma abordagem. Alterações do CRM são locais.</span></div>
    </>
  )
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: IconType; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-hint">{hint}</div><div className={`metric-decoration ${tone}`} /></div>
}

function LeadsPage({ leads: rows, search, setSearch, siteFilter, setSiteFilter, priorityFilter, setPriorityFilter, offerFilter, setOfferFilter, reviewFilter, setReviewFilter, sourceFilter, setSourceFilter, state, updateLead, onOpenLead }: { leads: Lead[]; search: string; setSearch: (value: string) => void; siteFilter: string; setSiteFilter: (value: string) => void; priorityFilter: string; setPriorityFilter: (value: string) => void; offerFilter: string; setOfferFilter: (value: string) => void; reviewFilter: string; setReviewFilter: (value: string) => void; sourceFilter: string; setSourceFilter: (value: string) => void; state: LocalState; updateLead: (id: string, updates: Partial<LeadState>) => void; onOpenLead: (lead: Lead) => void }) {
  return <section className="panel leads-panel">
    <div className="table-toolbar"><div className="toolbar-title"><div><h3>Base de leads <span className="count-bubble">{rows.length}</span></h3><p>Informações públicas, com fontes e limitações por ficha.</p></div></div><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar clínica, serviço ou bairro" aria-label="Buscar leads" />{search && <button aria-label="Limpar busca" onClick={() => setSearch('')}><X size={15} /></button>}</div></div>
    <div className="filter-bar"><label className="filter-select"><span>Site</span><select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}><option>Todos os sites</option><option>Site confirmado</option><option>Site não localizado</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Prioridade</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>Todas as prioridades</option><option>Alta provisória</option><option>Média-alta provisória</option><option>Média provisória</option><option>Média-baixa provisória</option><option>Baixa provisória</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Oferta</span><select value={offerFilter} onChange={(event) => setOfferFilter(event.target.value)}><option>Todas as ofertas</option><option>Site / landing page</option><option>Automação / agendamento</option><option>Instagram / visual</option><option>Validação inicial</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Verificação</span><select value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value)}><option>Todas as fichas</option><option>Revisar dados</option><option>Sem pendência destacada</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Fontes</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}><option>Todas as fontes</option><option>Com fontes</option><option>Sem fontes</option></select><ChevronDown size={14} /></label></div>
    <div className="table-scroll"><table className="lead-table"><thead><tr><th>Negócio</th><th>Presença digital</th><th>Oportunidade hipotética</th><th>Prioridade</th><th>CRM</th><th aria-label="Abrir" /></tr></thead><tbody>{rows.map((lead) => <tr key={lead.id} onClick={() => onOpenLead(lead)}><td><div className="business-cell"><div className="business-avatar">{lead.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').replace(/[—(]/g, '')}</div><div><strong>{lead.name}</strong><small><MapPin size={12} />{lead.address.split(',').slice(-2).join(',').trim()}</small></div></div></td><td><span className={`site-status ${lead.website ? 'site-confirmed' : 'site-missing'}`}><span />{lead.websiteStatus}</span>{lead.website && <small className="website-host">{new URL(lead.website).hostname.replace('www.', '')}</small>}</td><td><div className="offer-cell"><strong>{getOfferTypes(lead)[0]}</strong><small>{lead.offer.length > 72 ? `${lead.offer.slice(0, 72)}…` : lead.offer}</small></div></td><td><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority}</span></td><td onClick={(event) => event.stopPropagation()}><select className="stage-select" aria-label={`Estágio CRM de ${lead.name}`} value={state[lead.id]?.stage ?? 'Mapeado'} onChange={(event) => updateLead(lead.id, { stage: event.target.value as Stage })}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></td><td><button className="row-open" aria-label={`Abrir ${lead.name}`} onClick={(event) => { event.stopPropagation(); onOpenLead(lead) }}><ChevronRight size={17} /></button></td></tr>)}</tbody></table></div>
    {!rows.length && <div className="empty-state"><Search size={23} /><strong>Nenhum lead encontrado</strong><span>Tente mudar os filtros ou o termo da busca.</span></div>}
    <div className="table-footer"><span>Exibindo {rows.length} de {leads.length} leads pesquisados</span><span><ShieldCheck size={14} /> Oportunidades ainda não validadas</span></div>
  </section>
}

function CRMPage({ state, updateLead, onOpenLead }: { state: LocalState; updateLead: (id: string, updates: Partial<LeadState>) => void; onOpenLead: (lead: Lead) => void }) {
  return <>
    <div className="crm-intro"><div className="crm-intro-icon"><Activity size={20} /></div><div><strong>Seu pipeline, atualizado por você</strong><span>Arraste? Nesta demonstração, altere o estágio pelo menu de cada ficha. Nenhuma mensagem é enviada.</span></div><span className="saved-local"><ShieldCheck size={14} /> Local</span></div>
    <div className="kanban-board">{boardStages.map((stage, index) => { const cards = leads.filter((lead) => (state[lead.id]?.stage ?? 'Mapeado') === stage); return <section className="kanban-column" key={stage}><div className="kanban-heading"><span className={`kanban-dot dot-${index}`} /><strong>{stage}</strong><span className="kanban-count">{cards.length}</span><MoreHorizontal size={17} /></div><div className="kanban-cards">{cards.map((lead) => <article className="kanban-card" key={lead.id}><button className="card-name-button" onClick={() => onOpenLead(lead)}><strong>{lead.name}</strong><ChevronRight size={15} /></button><span className="kanban-specialty">{lead.specialty}</span><div className="kanban-tags"><span className={`site-mini ${lead.website ? 'has-site' : 'no-site'}`}>{lead.website ? 'Site' : 'Sem site localizado'}</span><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority.replace(' provisória', '')}</span></div><p>{getOfferTypes(lead)[0]} · hipótese a validar</p><label className="kanban-stage-control">Mover para<select value={stage} onChange={(event) => updateLead(lead.id, { stage: event.target.value as Stage })}>{stages.map((item) => <option key={item}>{item}</option>)}</select></label></article>)}{!cards.length && <div className="kanban-empty">Nenhum lead neste estágio.</div>}</div></section> })}</div>
    <div className="crm-privacy"><ShieldCheck size={16} /> Etapas e anotações ficam no localStorage deste navegador. Não insira informações clínicas nem dados sensíveis.</div>
  </>
}

function RankingPage({ state, onOpenLead }: { state: LocalState; onOpenLead: (lead: Lead) => void }) {
  const sorted = [...leads].sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority))
  return <div className="ranking-layout"><section className="panel ranking-panel"><div className="panel-heading"><div><h3>Leads para investigar primeiro</h3><p>Ordem provisória; não mede intenção de compra.</p></div><span className="soft-badge">10 analisados</span></div><div className="ranking-list">{sorted.map((lead, index) => <button className="ranking-row" key={lead.id} onClick={() => onOpenLead(lead)}><span className={`ranking-number ${index < 2 ? 'top-ranked' : ''}`}>{String(index + 1).padStart(2, '0')}</span><div className="ranking-main"><strong>{lead.name}</strong><small>{lead.priorityReason}</small></div><div className="ranking-state"><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority}</span><small>{state[lead.id]?.stage ?? 'Mapeado'}</small></div><ChevronRight size={17} /></button>)}</div></section><aside className="panel ranking-criteria"><div className="criteria-icon"><Target size={21} /></div><h3>Como ler esta ordem</h3><p>É uma triagem de pesquisa, não uma previsão de venda. Ela combina evidências públicas disponíveis e especificidade de um possível serviço a oferecer.</p><div className="criteria-line"><BadgeCheck size={16} /><span>Fontes próprias e dados corroborados pesam mais.</span></div><div className="criteria-line"><BadgeCheck size={16} /><span>Oferta ou sinal observável gera uma pergunta de descoberta.</span></div><div className="criteria-line"><BadgeCheck size={16} /><span>Endereço ou contato divergente reduz a prioridade.</span></div><div className="criteria-warning"><ShieldCheck size={16} /> Nenhuma necessidade, orçamento ou intenção de compra foi confirmada.</div></aside></div>
}

function ProjectsPage() {
  return <section className="panel empty-projects"><div className="empty-illustration"><BriefcaseBusiness size={27} /></div><span className="soft-badge">ESPAÇO DE TRABALHO</span><h3>Nenhum projeto em andamento</h3><p>Quando uma clínica aceitar uma proposta sua, registre aqui o escopo, as entregas e os próximos passos. Esta demonstração não inclui trabalhos ou clientes fictícios.</p><div className="empty-project-stats"><span><strong>0</strong> projetos ativos</span><span><strong>0</strong> clientes confirmados</span><span><strong>0</strong> entregas em curso</span></div></section>
}

function PlaceholderPage({ icon: Icon, title, label, description }: { icon: IconType; title: string; label: string; description: string }) {
  return <section className="panel placeholder-panel"><div className="placeholder-icon"><Icon size={24} /></div><span className="soon-badge larger">{label}</span><h3>{title}</h3><p>{description}</p><div className="placeholder-note"><ShieldCheck size={16} /> Sem integrações externas ou ações automáticas neste módulo.</div></section>
}

function TemplatesPage({ onCopy }: { onCopy: (text: string) => void }) {
  const drafts = [
    { title: 'Primeiro contato · descoberta', tag: 'Rascunho editável', text: 'Olá, equipe da [clínica]! Vi que vocês apresentam [serviço observado] no site. Estou pesquisando formas práticas de melhorar a experiência digital de clínicas locais. Como vocês organizam hoje os pedidos de avaliação que chegam pelo site ou WhatsApp? Se fizer sentido, posso compartilhar uma ideia curta e sem compromisso. Obrigado(a)!' },
    { title: 'Convite para piloto delimitado', tag: 'Usar após conversa', text: 'Obrigado(a) por compartilhar como funciona hoje. Com base no que conversamos, posso propor um piloto com escopo fechado: [entrega], em [prazo], por [valor]. A proposta não garante aumento de pacientes ou faturamento; serve para testar uma melhoria específica. Posso enviar o escopo para vocês avaliarem?' },
  ]
  return <><div className="template-caution"><ShieldCheck size={17} /><span>Modelos são rascunhos. Personalize só com fatos verificados e não envie nada sem revisar.</span></div><div className="template-grid">{drafts.map((draft) => <article className="panel template-card" key={draft.title}><div className="template-card-top"><span className="soft-badge">{draft.tag}</span><MoreHorizontal size={18} /></div><h3>{draft.title}</h3><p>{draft.text}</p><button className="button-outline" onClick={() => onCopy(draft.text)}><Copy size={15} /> Copiar rascunho</button></article>)}</div><div className="data-note"><MessageSquareText size={16} /><span>Não há integração de WhatsApp, e-mail ou envio automatizado. A mensagem acima é apenas texto para editar.</span></div></>
}

function LeadDetail({ lead, state, onChange, onClose }: { lead: Lead; state: LeadState; onChange: (id: string, updates: Partial<LeadState>) => void; onClose: () => void }) {
  return <div className="detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`Detalhes de ${lead.name}`}><div className="detail-top"><span className="eyebrow">FICHA DO LEAD · CAMPINAS</span><button className="icon-button" aria-label="Fechar ficha" onClick={onClose}><X size={19} /></button></div><div className="detail-title-row"><div className="detail-avatar">{lead.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').replace(/[—(]/g, '')}</div><div><h2>{lead.name}</h2><span><MapPin size={13} /> {lead.address.split(',').slice(-2).join(',').trim()}</span></div></div><div className="detail-chips"><span className={`site-status ${lead.website ? 'site-confirmed' : 'site-missing'}`}><span />{lead.websiteStatus}</span><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority}</span></div>
    <div className="detail-actions">{lead.website && <a className="button-primary" href={lead.website} target="_blank" rel="noreferrer">Abrir site <ExternalLink size={15} /></a>}{lead.instagram && <a className="button-outline" href={lead.instagram} target="_blank" rel="noreferrer"><Camera size={15} /> Instagram</a>}</div>
    <div className="detail-divider" />
    <section className="detail-section"><div className="detail-section-heading"><h3>O que foi observado</h3><span className="soft-badge">Fonte pública</span></div><p className="detail-service">{lead.services}</p>{lead.evidence.map((fact) => <div className="evidence-line" key={fact}><BadgeCheck size={15} /><span>{fact}</span></div>)}</section>
    <section className="detail-section"><h3>Oportunidade para você</h3><div className="hypothesis-box"><span className="hypothesis-label"><Sparkles size={14} /> HIPÓTESE A VALIDAR</span><p>{lead.offer}</p><small>Não há confirmação de necessidade, orçamento ou intenção de compra.</small></div></section>
    <section className="detail-section"><h3>Contato público</h3><div className="contact-list">{lead.contacts.map((contact) => <div className="contact-row" key={`${contact.label}-${contact.value}`}><span>{contact.label}<small>{contact.type === 'direto' ? 'Fonte do negócio' : contact.type === 'social' ? 'Perfil/publicação social' : 'Diretório de terceiros'}</small></span><strong>{contact.value}</strong></div>)}{!lead.contacts.length && <span>Contato público não confirmado.</span>}</div><div className="address-box"><MapPin size={15} /><span>{lead.address}</span></div></section>
    <section className="detail-section"><h3>Agendamento observado</h3><p className="detail-service">{lead.scheduling}</p></section>
    <section className="detail-section"><h3>CRM interno</h3><label className="field-label">Estágio<select value={state.stage} onChange={(event) => onChange(lead.id, { stage: event.target.value as Stage })}>{stages.map((stage) => <option key={stage}>{stage}</option>)}</select></label><label className="field-label">Nota interna <textarea value={state.notes} onChange={(event) => onChange(lead.id, { notes: event.target.value })} placeholder="Registre somente o próximo passo ou observações não sensíveis." rows={3} /></label><small className="field-footnote"><ShieldCheck size={13} /> Salvo neste navegador. Não inclua dados de saúde ou informações sensíveis.</small></section>
    <section className="detail-section"><div className="detail-source-heading"><h3>Fontes e consulta</h3><span>{researchedAt}</span></div><div className="source-list">{lead.sources.map((source) => <a className="source-item" href={source.url} target="_blank" rel="noreferrer" key={source.url}><span><strong>{source.label}</strong><small>{source.supports}</small></span><ExternalLink size={14} /></a>)}</div><div className="confidence-note"><ShieldCheck size={15} /><span>{lead.confidence}</span></div></section>
    <div className="detail-footer"><ShieldCheck size={15} /> Dados públicos podem mudar; revalide antes de abordar.</div>
  </aside></div>
}

function priorityValue(priority: Priority) {
  if (priority.startsWith('Alta')) return 0
  if (priority.startsWith('Média-alta')) return 1
  if (priority.startsWith('Média provisória')) return 2
  if (priority.startsWith('Média-baixa')) return 3
  return 4
}

export default App
