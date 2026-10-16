import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ChangeEvent, type ComponentType } from 'react'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  Filter,
  Globe,
  Camera,
  LayoutDashboard,
  MapPin,
  Menu,
  MessageSquareText,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Target,
  Upload,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import { leads, researchedAt, type Lead, type Priority } from './data/leads'
import { cityTargetsStorageKey, getLeadCity, getLeadNiche, initialCityTargets, initialNicheTargets, leadMatchesCity, leadMatchesNiche, nicheTargetsStorageKey, normalizeTarget, readSavedTargets, uniqueTargets } from './data/targets'
import MarketsManager from './components/MarketsManager'
import MascotMaker from './components/MascotMaker'
import SpreadsheetImporter from './components/SpreadsheetImporter'
import AutomationLearning from './components/AutomationLearning'
import LeadQualificationPanel from './components/LeadQualificationPanel'
import QuoteBuilder from './components/QuoteBuilder'
import ManualLeadForm from './components/ManualLeadForm'
import { createDefaultQualification, getProspectingScore, getScoreLabel, getValidationLabel, normalizeQualification, scoringWeights, type LeadQualification } from './data/leadQualification'

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
type PageKey = 'dashboard' | 'leads' | 'crm' | 'appointments' | 'projects' | 'markets' | 'import' | 'mascot' | 'learn' | 'billing' | 'ranking' | 'templates' | 'affiliate' | 'sitebuilder'
type Stage = 'Mapeado' | 'Qualificar' | 'Pronto para contato' | 'Contato feito' | 'Em conversa' | 'Proposta enviada' | 'Cliente' | 'Sem prioridade'
type LeadState = { stage: Stage; notes: string; qualification: LeadQualification }
type LeadStateUpdate = Partial<Omit<LeadState, 'qualification'>> & { qualification?: Partial<LeadQualification> }
type LocalState = Record<string, LeadState>
type AppBackup = {
  format: 'seu-site-pode-comecar-aqui-backup'
  version: 1
  exportedAt: string
  state: LocalState
  importedLeads: Lead[]
  cityTargets: string[]
  nicheTargets: string[]
  theme: 'light' | 'dark'
}

const stages: Stage[] = ['Mapeado', 'Qualificar', 'Pronto para contato', 'Contato feito', 'Em conversa', 'Proposta enviada', 'Cliente', 'Sem prioridade']
const boardStages: Stage[] = [...stages]
const orderedPipelineStages: Stage[] = ['Mapeado', 'Qualificar', 'Pronto para contato', 'Contato feito', 'Em conversa', 'Proposta enviada', 'Cliente']

function canTransitionStage(current: Stage, target: Stage) {
  if (current === target || target === 'Sem prioridade') return true
  const currentIndex = orderedPipelineStages.indexOf(current)
  const targetIndex = orderedPipelineStages.indexOf(target)
  if (target === 'Pronto para contato') return current === 'Mapeado' || current === 'Qualificar' || current === 'Sem prioridade' || targetIndex < currentIndex
  if (targetIndex < currentIndex) return true
  if (targetIndex !== currentIndex + 1) return false
  return true
}

function createDefaultLeadState(): LeadState {
  return { stage: 'Mapeado', notes: '', qualification: createDefaultQualification() }
}

const uberabaVerifiedChecks: Record<string, Partial<LeadQualification>> = {
  'clinica-vidativa-fisioterapia-uberaba': {
    identityStatus: 'confirmed',
    contactStatus: 'confirmed',
    verifiedContactType: 'Telefone',
    verifiedContactValue: '(34) 3314-7273',
    verificationSourceUrl: 'https://www.instagram.com/clinicavidativa_/',
    verificationNote: 'Perfil Instagram aberto sem login em 16/10/2026: dois telefones (34)3314-7577 e (34)3314-7273, serviços (fisioterapia, RPG, Pilates, psicóloga, acupuntura) e "Há 23 anos cuidando com amor". Waze confirma endereço Av. Santa Beatriz da Silva, 641, Santa Maria, Uberaba–MG, CEP 38020-380 e o (34)3314-7273. Apontador também lista o mesmo endereço. Nenhum site localizado.',
    verificationDate: '2026-10-16',
    nextAction: 'Perguntar ao responsável se existe alguma dificuldade operacional ou comercial a resolver.',
    opportunities: {
      site: { status: 'public-signal', evidenceNote: 'Nenhum site próprio localizado nas fontes consultadas (Instagram, Waze, Apontador, Google).', evidenceSource: 'https://www.instagram.com/clinicavidativa_/', clientConfirmed: false, clientConfirmationNote: '' },
      automation: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
    },
  },
  'restaurante-sertao-mineiro-uberaba': {
    identityStatus: 'confirmed',
    contactStatus: 'confirmed',
    verifiedContactType: 'Telefone',
    verifiedContactValue: '+55 34 99972-6619',
    verificationSourceUrl: 'https://www.sertaomineiro.com.br/',
    verificationNote: 'Site próprio confirmado em 16/10/2026: nome, endereço MG-190 km 1,5, telefone +55 34 99972-6619, e-mail restaurantesertaomineiro@gmail.com e Instagram @restaurante.sertaomineiro publicados. Funciona sáb/dom/feriados, almoço 12h–15h. Cobrança por quilo não confirmada.',
    verificationDate: '2026-10-16',
    nextAction: 'Perguntar ao responsável se existe alguma dificuldade operacional ou comercial a resolver.',
    opportunities: {
      site: { status: 'not-fit', evidenceNote: 'Já tem site próprio com endereço, horário, e-mail e telefone de reservas.', evidenceSource: 'https://www.sertaomineiro.com.br/', clientConfirmed: false, clientConfirmationNote: '' },
      automation: { status: 'public-signal', evidenceNote: 'Reservas e dúvidas feitas apenas por telefone ou e-mail; não há sistema de reservas online no site.', evidenceSource: 'https://www.sertaomineiro.com.br/', clientConfirmed: false, clientConfirmationNote: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
    },
  },
  'leticia-costa-estetica-avancada-uberaba': {
    identityStatus: 'confirmed',
    contactStatus: 'confirmed',
    verifiedContactType: 'Formulário do site',
    verifiedContactValue: 'leticiacosta.com.br',
    verificationSourceUrl: 'https://www.leticiacosta.com.br/',
    verificationNote: 'Site e Instagram @leticiacosta__ ("Farmacêutica Esteta", Uberaba–MG, link para leticiacosta.com.br) confirmados em 16/10/2026. Formulário funciona e redireciona ao WhatsApp após envio. Botão de WhatsApp do site aponta para "#" (sem número) — observado nesta data. Telefone +55 34 98836-1231 só aparece no Google; não confirmado no texto do site.',
    verificationDate: '2026-10-16',
    nextAction: 'Perguntar ao responsável se existe alguma dificuldade operacional ou comercial a resolver.',
    opportunities: {
      site: { status: 'public-signal', evidenceNote: 'Botão de WhatsApp do site aponta para "#" (placeholder sem número), observado em 16/10/2026. Formulário existe mas redireciona a WhatsApp após envio, sem canal direto publicado.', evidenceSource: 'https://www.leticiacosta.com.br/', clientConfirmed: false, clientConfirmationNote: '' },
      automation: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
    },
  },
  'fisio-prime-instituto-uberaba': {
    identityStatus: 'confirmed',
    contactStatus: 'confirmed',
    verifiedContactType: 'WhatsApp',
    verifiedContactValue: '+55 34 99654-7304',
    verificationSourceUrl: 'https://fisioprimeinstituto.com.br/fale-conosco/',
    verificationNote: 'Página Fale Conosco confirmada em 16/10/2026: endereço Rua Dr. José Ferreira, 230 Uberaba, telefone (34)3325-3525, WhatsApp +55 34 99654-7304 e e-mail contato@fisioprime.com.br publicados. Formulário "Marque seu atendimento" funciona como pedido com faixa horária (7–10h, 11–14h, 15–17h ou 18–21h); aviso "Entraremos em contato em breve!" — sem confirmação instantânea.',
    verificationDate: '2026-10-16',
    nextAction: 'Perguntar ao responsável se existe alguma dificuldade operacional ou comercial a resolver.',
    opportunities: {
      site: { status: 'not-fit', evidenceNote: 'Já tem site próprio com formulário de marcação de atendimento.', evidenceSource: 'https://fisioprimeinstituto.com.br/', clientConfirmed: false, clientConfirmationNote: '' },
      automation: { status: 'public-signal', evidenceNote: 'Formulário de marcação exige retorno manual ("Entraremos em contato em breve!"); sem confirmação instantânea nem integração com calendário real.', evidenceSource: 'https://fisioprimeinstituto.com.br/marque-seu-atendimento/', clientConfirmed: false, clientConfirmationNote: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
    },
  },
  'clinica-nunes-estetica-avancada': {
    identityStatus: 'confirmed',
    contactStatus: 'confirmed',
    verifiedContactType: 'WhatsApp',
    verifiedContactValue: '+55 34 99100-7363',
    verificationSourceUrl: 'https://www.instagram.com/clinicanunes.esteticaavancada/',
    verificationNote: 'Perfil Instagram aberto sem login em 16/10/2026: nome "Clínica Nunes I Harmonização Facial", Uberaba/MG, serviços (harmonização facial, perfiloplastia) e WhatsApp wa.me/5534991007363. Endereço de rua não confirmado.',
    verificationDate: '2026-10-16',
    nextAction: 'Perguntar ao responsável se existe alguma dificuldade operacional ou comercial a resolver.',
    opportunities: {
      site: { status: 'public-signal', evidenceNote: 'Nenhum site próprio localizado; presença digital concentrada no Instagram com link para WhatsApp.', evidenceSource: 'https://www.instagram.com/clinicanunes.esteticaavancada/', clientConfirmed: false, clientConfirmationNote: '' },
      automation: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '', clientConfirmed: false, clientConfirmationNote: '' },
    },
  },
}

const initialState: LocalState = Object.fromEntries(leads.map((lead) => {
  const initialLeadState = createDefaultLeadState()
  const verifiedCheck = uberabaVerifiedChecks[lead.id]
  return [lead.id, verifiedCheck
    ? { ...initialLeadState, qualification: normalizeQualification({ ...initialLeadState.qualification, ...verifiedCheck }) }
    : initialLeadState]
}))
const appStorageKey = 'seu-site-pode-comecar-aqui-state'
const previousAppStorageKey = 'prospecta-campinas-state'
const importedLeadsStorageKey = 'site-start-imported-leads'

const navGroups: { title?: string; items: { key: PageKey; label: string; icon: IconType; soon?: boolean }[] }[] = [
  { items: [{ key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { key: 'leads', label: 'Leads', icon: Users }, { key: 'crm', label: 'CRM', icon: ClipboardList }, { key: 'appointments', label: 'Agendamentos', icon: CalendarDays }, { key: 'projects', label: 'Meus projetos', icon: Globe }] },
  { items: [{ key: 'markets', label: 'Cidades e nichos', icon: MapPin }, { key: 'import', label: 'Importar planilha', icon: FileSpreadsheet }, { key: 'mascot', label: 'Criar mascote', icon: Sparkles }, { key: 'learn', label: 'Aprender automação', icon: BookOpen }] },
  { items: [{ key: 'billing', label: 'Cobrar clientes', icon: WalletCards, soon: true }, { key: 'ranking', label: 'Ranking', icon: Target }, { key: 'templates', label: 'Templates', icon: FileText }] },
  { items: [{ key: 'affiliate', label: 'Seja um afiliado', icon: BriefcaseBusiness, soon: true }, { key: 'sitebuilder', label: 'Criar site', icon: Sparkles, soon: true }] },
]

const pageTitles: Record<PageKey, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Visão geral dos leads e oportunidades digitais' },
  leads: { title: 'Leads', subtitle: 'Negócios mapeados, evidências e serviços possíveis' },
  crm: { title: 'CRM', subtitle: 'Organize seu acompanhamento manualmente' },
  appointments: { title: 'Agendamentos', subtitle: 'Área demonstrativa para suas próprias reuniões' },
  projects: { title: 'Meus projetos', subtitle: 'Organização de trabalhos e entregas' },
  markets: { title: 'Cidades e nichos', subtitle: 'Defina e refine seus mercados-alvo' },
  import: { title: 'Importar planilha', subtitle: 'Analise prospects com arquivo temporário e processamento local' },
  mascot: { title: 'Criar mascote', subtitle: 'Personalize uma primeira ideia visual para sua marca' },
  learn: { title: 'Aprender automação', subtitle: 'Ideias de serviços para negócios com site e um método prático' },
  billing: { title: 'Cobrar clientes', subtitle: 'Controle demonstrativo de cobranças' },
  ranking: { title: 'Ranking', subtitle: 'Prioridade provisória baseada em evidências observáveis' },
  templates: { title: 'Templates', subtitle: 'Rascunhos para adaptar antes de qualquer abordagem' },
  affiliate: { title: 'Seja um afiliado', subtitle: 'Módulo demonstrativo' },
  sitebuilder: { title: 'Criar site', subtitle: 'Módulo demonstrativo' },
}

function readState(): LocalState {
  try {
    const saved = localStorage.getItem(appStorageKey) ?? localStorage.getItem(previousAppStorageKey)
    if (!saved) return initialState
    const parsed: unknown = JSON.parse(saved)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return initialState
    const merged: LocalState = { ...initialState }
    Object.entries(parsed).forEach(([leadId, value]) => {
      if (!value || typeof value !== 'object') return
      const stored = value as Partial<LeadState>
      merged[leadId] = {
        stage: stages.includes(stored.stage as Stage) ? stored.stage as Stage : 'Mapeado',
        notes: typeof stored.notes === 'string' ? stored.notes : '',
        qualification: normalizeQualification(stored.qualification),
      }
    })
    return merged
  } catch {
    return initialState
  }
}

function readImportedLeads(): Lead[] {
  try {
    const saved = localStorage.getItem(importedLeadsStorageKey)
    if (!saved) return []
    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isImportedLead)
  } catch {
    return []
  }
}

function isImportedLead(value: unknown): value is Lead {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const lead = value as Partial<Lead>
  return typeof lead.id === 'string' && typeof lead.name === 'string' && typeof lead.specialty === 'string'
    && typeof lead.address === 'string' && Array.isArray(lead.contacts)
    && lead.contacts.every((contact) => contact && typeof contact.label === 'string' && typeof contact.value === 'string'
      && ['direto', 'diretório', 'social', 'planilha', 'manual'].includes(contact.type))
    && (typeof lead.website === 'string' || lead.website === null)
    && ['Confirmado', 'Não localizado nas fontes consultadas', 'Informado na planilha · não verificado', 'URL informada · não verificada', 'Não informado na planilha'].includes(lead.websiteStatus ?? '')
    && (lead.city === undefined || typeof lead.city === 'string')
    && (lead.niche === undefined || typeof lead.niche === 'string')
    && (lead.instagram === undefined || typeof lead.instagram === 'string')
    && typeof lead.services === 'string' && typeof lead.scheduling === 'string'
    && Array.isArray(lead.evidence) && lead.evidence.every((item) => typeof item === 'string')
    && typeof lead.offer === 'string' && typeof lead.priority === 'string' && typeof lead.priorityReason === 'string'
    && typeof lead.confidence === 'string' && Array.isArray(lead.sources)
    && lead.sources.every((source) => source && typeof source.label === 'string' && typeof source.supports === 'string'
      && (source.url === undefined || typeof source.url === 'string'))
    && (lead.origin === 'planilha' || lead.origin === 'manual')
    && (lead.importedAt === undefined || typeof lead.importedAt === 'string')
    && (lead.lastReviewedAt === undefined || typeof lead.lastReviewedAt === 'string')
}

function parseAppBackup(value: unknown): AppBackup {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('O arquivo não contém um backup válido.')
  const backup = value as Partial<AppBackup>
  if (backup.format !== 'seu-site-pode-comecar-aqui-backup' || backup.version !== 1) {
    throw new Error('Formato ou versão de backup não reconhecidos.')
  }
  if (typeof backup.exportedAt !== 'string' || !Array.isArray(backup.importedLeads)
    || !backup.importedLeads.every(isImportedLead)
    || !Array.isArray(backup.cityTargets) || !backup.cityTargets.every((target) => typeof target === 'string')
    || !Array.isArray(backup.nicheTargets) || !backup.nicheTargets.every((target) => typeof target === 'string')
    || (backup.theme !== 'light' && backup.theme !== 'dark')
    || !backup.state || typeof backup.state !== 'object' || Array.isArray(backup.state)) {
    throw new Error('O backup está incompleto ou contém dados inválidos.')
  }

  const restoredState: LocalState = { ...initialState }
  for (const [leadId, value] of Object.entries(backup.state)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('O backup contém um estado de lead inválido.')
    }
    const stored = value as Partial<LeadState>
    if (typeof stored.stage !== 'string' || !stages.includes(stored.stage as Stage)
      || typeof stored.notes !== 'string'
      || !stored.qualification || typeof stored.qualification !== 'object' || Array.isArray(stored.qualification)) {
      throw new Error('O backup contém uma qualificação de lead inválida.')
    }
    restoredState[leadId] = {
      stage: stored.stage as Stage,
      notes: stored.notes,
      qualification: normalizeQualification(stored.qualification),
    }
  }

  return {
    format: backup.format,
    version: backup.version,
    exportedAt: backup.exportedAt,
    state: restoredState,
    importedLeads: backup.importedLeads,
    cityTargets: uniqueTargets(backup.cityTargets),
    nicheTargets: uniqueTargets(backup.nicheTargets),
    theme: backup.theme,
  }
}

function statusClass(priority: Priority) {
  if (priority.startsWith('Alta') || priority.startsWith('Média-alta')) return 'priority-high'
  if (priority.startsWith('Média-baixa') || priority.startsWith('Baixa')) return 'priority-low'
  return 'priority-medium'
}

function siteStatusClass(status: Lead['websiteStatus']) {
  if (status === 'Confirmado') return 'site-confirmed'
  if (status === 'Informado na planilha · não verificado' || status === 'URL informada · não verificada' || status === 'Não informado na planilha') return 'site-unverified'
  return 'site-missing'
}

function getOfferTypes(lead: Lead) {
  const text = lead.offer.toLowerCase()
  const kinds: string[] = []
  if (/site|página|landing page|cta|mobile/.test(text)) kinds.push('Site / landing page')
  if (/automa|formulário|fluxo|whatsapp|agend|solicitação/.test(text)) kinds.push('Automação / agendamento')
  if (/instagram|visual/.test(text)) kinds.push('Instagram / visual')
  return kinds.length ? kinds : ['Validação inicial']
}

function isNeedsReview(qualification: LeadQualification = createDefaultQualification()) {
  return getValidationLabel(qualification) !== 'Conferido manualmente'
}

function App() {
  const [page, setPage] = useState<PageKey>('dashboard')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return localStorage.getItem('seu-site-theme') === 'light' ? 'light' : 'dark'
    } catch {
      return 'dark'
    }
  })
  const mainAreaRef = useRef<HTMLDivElement>(null)
  const backupFileRef = useRef<HTMLInputElement>(null)
  useLayoutEffect(() => {
    mainAreaRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [page])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [state, setState] = useState<LocalState>(readState)
  const [importedLeads, setImportedLeads] = useState<Lead[]>(readImportedLeads)
  const [cityTargets, setCityTargets] = useState<string[]>(() => readSavedTargets(cityTargetsStorageKey, initialCityTargets))
  const [nicheTargets, setNicheTargets] = useState<string[]>(() => readSavedTargets(nicheTargetsStorageKey, initialNicheTargets))
  const [search, setSearch] = useState('')
  const [siteFilter, setSiteFilter] = useState('Todos os sites')
  const [cityFilter, setCityFilter] = useState('Todas as cidades')
  const [nicheFilter, setNicheFilter] = useState('Todos os nichos')
  const [priorityFilter, setPriorityFilter] = useState('Todas as prioridades')
  const [offerFilter, setOfferFilter] = useState('Todas as ofertas')
  const [reviewFilter, setReviewFilter] = useState('Todas as fichas')
  const [sourceFilter, setSourceFilter] = useState('Todas as fontes')
  const [showManualLeadForm, setShowManualLeadForm] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101722' : '#f5f7fb')
    try {
      localStorage.setItem('seu-site-theme', theme)
    } catch {
      setToast('Não foi possível salvar a preferência de tema neste navegador.')
    }
  }, [theme])

  useEffect(() => {
    localStorage.setItem(appStorageKey, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    try { localStorage.setItem(cityTargetsStorageKey, JSON.stringify(cityTargets)) } catch { setToast('Não foi possível salvar os alvos no armazenamento local.') }
  }, [cityTargets])

  useEffect(() => {
    try { localStorage.setItem(nicheTargetsStorageKey, JSON.stringify(nicheTargets)) } catch { setToast('Não foi possível salvar os alvos no armazenamento local.') }
  }, [nicheTargets])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2400)
    return () => window.clearTimeout(timer)
  }, [toast])

  const allLeads = useMemo(() => [...leads, ...importedLeads], [importedLeads])
  const cityOptions = useMemo(() => uniqueTargets([...cityTargets, ...allLeads.map(getLeadCity).filter((city) => city !== 'Não informado')]), [cityTargets, allLeads])
  const nicheOptions = useMemo(() => uniqueTargets([...nicheTargets, ...allLeads.map(getLeadNiche).filter((niche) => niche !== 'Não informado')]), [nicheTargets, allLeads])

  const visibleLeads = useMemo(() => {
    const term = normalizeTarget(search)
    return allLeads.filter((lead) => {
      const matchesText = !term || normalizeTarget([lead.name, lead.specialty, lead.address, lead.services, ...lead.contacts.map((contact) => contact.value)].join(' ')).includes(term)
      const matchesSite = siteFilter === 'Todos os sites' || (siteFilter === 'Site confirmado' && lead.websiteStatus === 'Confirmado') || (siteFilter === 'URL informada · não verificada' && (lead.websiteStatus === 'Informado na planilha · não verificado' || lead.websiteStatus === 'URL informada · não verificada')) || (siteFilter === 'Site não localizado' && lead.websiteStatus === 'Não localizado nas fontes consultadas') || (siteFilter === 'Sem URL na planilha' && lead.websiteStatus === 'Não informado na planilha')
      const matchesCity = cityFilter === 'Todas as cidades' || leadMatchesCity(lead, cityFilter)
      const matchesNiche = nicheFilter === 'Todos os nichos' || leadMatchesNiche(lead, nicheFilter)
      const matchesPriority = priorityFilter === 'Todas as prioridades' || lead.priority === priorityFilter
      const matchesOffer = offerFilter === 'Todas as ofertas' || getOfferTypes(lead).includes(offerFilter)
      const matchesReview = reviewFilter === 'Todas as fichas' || (reviewFilter === 'Validação pendente' ? isNeedsReview(state[lead.id]?.qualification ?? createDefaultQualification()) : !isNeedsReview(state[lead.id]?.qualification ?? createDefaultQualification()))
      const matchesSources = sourceFilter === 'Todas as fontes' || (sourceFilter === 'Com fontes' ? lead.sources.length > 0 : lead.sources.length === 0)
      return matchesText && matchesSite && matchesCity && matchesNiche && matchesPriority && matchesOffer && matchesReview && matchesSources
    })
  }, [allLeads, search, siteFilter, cityFilter, nicheFilter, priorityFilter, offerFilter, reviewFilter, sourceFilter, state])

  const stageCount = (stage: Stage) => allLeads.filter((lead) => (state[lead.id]?.stage ?? 'Mapeado') === stage).length
  const siteCount = allLeads.filter((lead) => lead.websiteStatus === 'Confirmado').length
  const pageInfo = pageTitles[page]

  function updateLead(leadId: string, updates: LeadStateUpdate) {
    const current = state[leadId] ?? createDefaultLeadState()
    const incomingQualification = updates.qualification
    const qualification = normalizeQualification(incomingQualification ? {
      ...current.qualification,
      ...incomingQualification,
      opportunities: { ...current.qualification.opportunities, ...(incomingQualification.opportunities ?? {}) },
    } : current.qualification)
    const next: LeadState = { ...current, ...updates, qualification }
    if (updates.stage && !canTransitionStage(current.stage, updates.stage)) {
      setToast(updates.stage === 'Pronto para contato' || updates.stage === 'Contato feito'
        ? 'Atualize os estágios manualmente e avance pela sequência do pipeline.'
        : 'Avance uma etapa por vez no pipeline.')
      return
    }
    setState((currentState) => ({ ...currentState, [leadId]: next }))
  }

  function handleImport(newRows: Lead[]) {
    const seenIds = new Set(allLeads.map((lead) => lead.id))
    const additions = newRows.filter((lead) => !seenIds.has(lead.id))
    if (!additions.length) return false
    const combined = [...importedLeads, ...additions]
    try {
      localStorage.setItem(importedLeadsStorageKey, JSON.stringify(combined))
    } catch {
      setToast('Armazenamento local insuficiente: nenhum lead foi importado. Libere espaço e tente novamente.')
      return false
    }
    setImportedLeads(combined)
    setState((current) => {
      const next = { ...current }
      additions.forEach((lead) => { next[lead.id] = next[lead.id] ?? createDefaultLeadState() })
      return next
    })
    setCityTargets((current) => uniqueTargets([...current, ...additions.map(getLeadCity).filter((city) => city !== 'Não informado')]))
    setNicheTargets((current) => uniqueTargets([...current, ...additions.map(getLeadNiche).filter((niche) => niche !== 'Não informado')]))
    setSearch('')
    setSiteFilter('Todos os sites')
    setCityFilter('Todas as cidades')
    setNicheFilter('Todos os nichos')
    setPriorityFilter('Todas as prioridades')
    setOfferFilter('Todas as ofertas')
    setReviewFilter('Todas as fichas')
    setSourceFilter('Todas as fontes')
    openPage('leads')
    setToast(`${additions.length} ${additions.length === 1 ? 'lead importado' : 'leads importados'}; o arquivo original não foi guardado.`)
    return true
  }

  function handleManualLeadAdd(lead: Lead) {
    const duplicate = allLeads.find((existing) => {
      const sameInstagram = lead.instagram && existing.instagram && normalizeTarget(lead.instagram) === normalizeTarget(existing.instagram)
      const sameNameAndCity = normalizeTarget(existing.name) === normalizeTarget(lead.name)
        && normalizeTarget(getLeadCity(existing)) === normalizeTarget(lead.city ?? '')
      return sameInstagram || sameNameAndCity
    })
    if (duplicate) {
      setToast(`Este lead já está cadastrado como “${duplicate.name}”.`)
      return false
    }

    const combined = [...importedLeads, lead]
    try {
      localStorage.setItem(importedLeadsStorageKey, JSON.stringify(combined))
    } catch {
      setToast('Não foi possível salvar o lead neste navegador. Libere espaço e tente novamente.')
      return false
    }
    setImportedLeads(combined)
    setState((current) => ({ ...current, [lead.id]: createDefaultLeadState() }))
    setCityTargets((current) => uniqueTargets([...current, ...(lead.city ? [lead.city] : [])]))
    setNicheTargets((current) => uniqueTargets([...current, ...(lead.niche ? [lead.niche] : [])]))
    setSearch(lead.name)
    setSiteFilter('Todos os sites')
    setCityFilter('Todas as cidades')
    setNicheFilter('Todos os nichos')
    setPriorityFilter('Todas as prioridades')
    setOfferFilter('Todas as ofertas')
    setReviewFilter('Todas as fichas')
    setSourceFilter('Todas as fontes')
    setShowManualLeadForm(false)
    openPage('leads')
    openLead(lead)
    setToast('Lead cadastrado e salvo neste navegador; confira os dados antes de abordar.')
    return true
  }

  function openPage(nextPage: PageKey) {
    setPage(nextPage)
    setShowManualLeadForm(false)
    mainAreaRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
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

  function exportBackup() {
    const backup: AppBackup = {
      format: 'seu-site-pode-comecar-aqui-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
      importedLeads,
      cityTargets,
      nicheTargets,
      theme,
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-seu-site-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setToast('Backup baixado. Guarde o arquivo em um local seguro.')
  }

  async function restoreBackup(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return

    try {
      const backup = parseAppBackup(JSON.parse(await file.text()) as unknown)
      if (!window.confirm('Restaurar este backup vai substituir os leads importados, etapas, anotações, mercados e tema atuais neste navegador. Deseja continuar?')) return

      const updates: [string, string][] = [
        [appStorageKey, JSON.stringify(backup.state)],
        [importedLeadsStorageKey, JSON.stringify(backup.importedLeads)],
        [cityTargetsStorageKey, JSON.stringify(backup.cityTargets)],
        [nicheTargetsStorageKey, JSON.stringify(backup.nicheTargets)],
        ['seu-site-theme', backup.theme],
      ]
      const previousValues = new Map<string, string | null>()
      try {
        updates.forEach(([key, value]) => {
          previousValues.set(key, localStorage.getItem(key))
          localStorage.setItem(key, value)
        })
      } catch {
        let rollbackFailed = false
        for (const [key, previousValue] of previousValues) {
          try {
            if (previousValue === null) localStorage.removeItem(key)
            else localStorage.setItem(key, previousValue)
          } catch {
            rollbackFailed = true
          }
        }
        setToast(rollbackFailed
          ? 'Falha ao restaurar e ao reverter alguns dados. Recarregue o app e confira o conteúdo.'
          : 'Não foi possível salvar o backup neste navegador. Verifique as permissões e o espaço disponível.')
        return
      }

      setState(backup.state)
      setImportedLeads(backup.importedLeads)
      setCityTargets(backup.cityTargets)
      setNicheTargets(backup.nicheTargets)
      setTheme(backup.theme)
      setSelectedLead(null)
      setToast('Backup restaurado com sucesso neste navegador.')
    } catch (error) {
      setToast(error instanceof Error ? `Não foi possível restaurar o backup: ${error.message}` : 'Não foi possível ler o arquivo de backup.')
    } finally {
      input.value = ''
    }
  }

  return (
    <div className="app-shell" data-theme={theme}>
      <button className={`mobile-scrim ${drawerOpen ? 'visible' : ''}`} aria-label="Fechar menu" onClick={() => setDrawerOpen(false)} />
      <aside className={`sidebar ${drawerOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row">
          <div className="brand-mark"><img src="/brand-mark.svg" alt="" /></div>
          <div className="brand-copy"><span>Seu site pode</span><small>começar aqui</small></div>
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
                  {key === 'leads' && <span className="nav-count">{allLeads.length}</span>}
                  {soon && <span className="soon-badge">Em breve</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="local-note"><ShieldCheck size={16} /><span>Dados locais · exporte um backup para manter uma cópia</span></div>
          <div className="backup-actions">
            <button type="button" onClick={exportBackup}><Download size={14} />Exportar backup</button>
            <button type="button" onClick={() => backupFileRef.current?.click()}><Upload size={14} />Restaurar backup</button>
            <input ref={backupFileRef} className="visually-hidden-input" type="file" accept="application/json,.json" aria-label="Selecionar arquivo de backup" onChange={restoreBackup} />
          </div>
          <div className="profile-row"><div className="profile-avatar">SC</div><div><strong>Prospecção digital</strong><small>Dados locais · este navegador</small></div><MoreHorizontal size={18} className="profile-more" /></div>
        </div>
      </aside>

      <div className="main-area" ref={mainAreaRef}>
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Abrir menu" onClick={() => setDrawerOpen(true)}><Menu size={21} /></button>
            <div className="breadcrumb"><span>Início</span><ChevronRight size={14} /><strong>{pageInfo.title}</strong></div>
          </div>
          <div className="topbar-right">
            <div className="topbar-date"><span className="live-dot" /> Base inicial pesquisada em {researchedAt}</div>
            <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} aria-label={`Ativar tema ${theme === 'light' ? 'escuro' : 'claro'}`} title={`Ativar tema ${theme === 'light' ? 'escuro' : 'claro'}`}>
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
              <span>{theme === 'light' ? 'Escuro' : 'Claro'}</span>
            </button>
            <div className="topbar-avatar">SC</div>
          </div>
        </header>

        <main className="page-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">PROSPECÇÃO DIGITAL <span>•</span> CONTROLE PESSOAL · DADOS LOCAIS</div>
              <h1>{pageInfo.title}</h1>
              <p>{pageInfo.subtitle}</p>
            </div>
            {page === 'leads' && <div className="page-heading-actions"><button className="button-primary" onClick={() => setShowManualLeadForm((current) => !current)}>{showManualLeadForm ? <X size={15} /> : <Plus size={15} />}{showManualLeadForm ? 'Fechar cadastro' : 'Cadastrar lead'}</button><button className="button-outline" onClick={() => openPage('import')}><FileSpreadsheet size={15} /> Importar planilha</button><button className="filter-pill" onClick={() => { setSearch(''); setSiteFilter('Todos os sites'); setCityFilter('Todas as cidades'); setNicheFilter('Todos os nichos'); setPriorityFilter('Todas as prioridades'); setOfferFilter('Todas as ofertas'); setReviewFilter('Todas as fichas'); setSourceFilter('Todas as fontes') }}><Filter size={15} /> Limpar filtros</button></div>}
          </div>

          {page === 'dashboard' && <DashboardPage leads={allLeads} stageCount={stageCount} siteCount={siteCount} onNavigate={openPage} onOpenLead={openLead} state={state} />}
          {page === 'leads' && <LeadsPage leads={visibleLeads} totalCount={allLeads.length} cityOptions={cityOptions} nicheOptions={nicheOptions} search={search} setSearch={setSearch} siteFilter={siteFilter} setSiteFilter={setSiteFilter} cityFilter={cityFilter} setCityFilter={setCityFilter} nicheFilter={nicheFilter} setNicheFilter={setNicheFilter} priorityFilter={priorityFilter} setPriorityFilter={setPriorityFilter} offerFilter={offerFilter} setOfferFilter={setOfferFilter} reviewFilter={reviewFilter} setReviewFilter={setReviewFilter} sourceFilter={sourceFilter} setSourceFilter={setSourceFilter} state={state} updateLead={updateLead} selectedLeadId={selectedLead?.id} onOpenLead={openLead} showManualLeadForm={showManualLeadForm} onManualLeadCancel={() => setShowManualLeadForm(false)} onManualLeadAdd={handleManualLeadAdd} />}
          {page === 'crm' && <CRMPage leads={allLeads} state={state} updateLead={updateLead} selectedLeadId={selectedLead?.id} onOpenLead={openLead} />}
          {page === 'ranking' && <RankingPage leads={allLeads} state={state} onOpenLead={openLead} />}
          {page === 'markets' && <MarketsManager cities={cityTargets} niches={nicheTargets} leads={allLeads} onAddCity={(value) => { if (cityTargets.some((item) => normalizeTarget(item) === normalizeTarget(value))) return false; setCityTargets((current) => uniqueTargets([...current, value])); return true }} onAddNiche={(value) => { if (nicheTargets.some((item) => normalizeTarget(item) === normalizeTarget(value))) return false; setNicheTargets((current) => uniqueTargets([...current, value])); return true }} onRemoveCity={(value) => setCityTargets((current) => current.filter((item) => normalizeTarget(item) !== normalizeTarget(value)))} onRemoveNiche={(value) => setNicheTargets((current) => current.filter((item) => normalizeTarget(item) !== normalizeTarget(value)))} onSelectCity={(value) => { setCityFilter(value); setPage('leads') }} onSelectNiche={(value) => { setNicheFilter(value); setPage('leads') }} />}
          {page === 'import' && <SpreadsheetImporter existingLeads={allLeads} onImport={handleImport} />}
          {page === 'mascot' && <MascotMaker />}
          {page === 'learn' && <AutomationLearning onCopy={copyTemplate} />}
          {page === 'templates' && <TemplatesPage leads={allLeads} state={state} onCopy={copyTemplate} />}
          {page === 'appointments' && <PlaceholderPage icon={CalendarDays} title="Organize suas próximas conversas" label="DEMONSTRAÇÃO" description="Este espaço é para suas reuniões com leads. Nenhum lead tem um agendamento registrado e nenhum calendário externo está conectado." />}
          {page === 'projects' && <ProjectsPage />}
          {page === 'billing' && <PlaceholderPage icon={CircleDollarSign} title="Acompanhe cobranças dos seus projetos" label="DEMONSTRAÇÃO · SEM PAGAMENTOS" description="Nenhuma cobrança ou pagamento foi criado. Use este espaço futuramente para organizar propostas e valores acordados, sem processar transações." />}
          {page === 'affiliate' && <PlaceholderPage icon={BriefcaseBusiness} title="Programa de afiliados" label="EM BREVE" description="Não há programa, link de afiliado ou integração ativa nesta demonstração." />}
          {page === 'sitebuilder' && <PlaceholderPage icon={Globe} title="Criação de sites" label="EM BREVE" description="Este módulo é apenas uma referência de navegação. Ainda não cria, hospeda nem publica sites de clientes." />}
        </main>
        <footer className="app-footer"><span>Seu site pode começar aqui</span><span>Oportunidades são hipóteses · Nenhuma abordagem foi enviada</span></footer>
      </div>

      {selectedLead && <LeadDetail lead={selectedLead} state={state[selectedLead.id] ?? createDefaultLeadState()} onChange={updateLead} onClose={() => setSelectedLead(null)} />}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

function DashboardPage({ leads: rows, stageCount, siteCount, onNavigate, onOpenLead, state }: { leads: Lead[]; stageCount: (stage: Stage) => number; siteCount: number; onNavigate: (page: PageKey) => void; onOpenLead: (lead: Lead) => void; state: LocalState }) {
  const ranked = [...rows].sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority)).slice(0, 4)
  const pipeline = boardStages.map((stage) => ({ stage, value: stageCount(stage) }))
  const hypothesisCount = rows.reduce((total, lead) => {
    const qualification = state[lead.id]?.qualification ?? createDefaultQualification()
    return total + Object.values(qualification.opportunities).filter((opportunity) => opportunity.status === 'public-signal').length
  }, 0)
  return (
    <>
      <div className="welcome-banner">
        <div className="welcome-orb"><Target size={25} /></div>
        <div className="welcome-copy"><div className="welcome-label">SEU FOCO AGORA</div><h2>Centralize leads e organize próximos passos.</h2><p>A base reúne negócios mapeados em Campinas, São Paulo e Uberaba, além de perfis enviados por você. Fontes, contatos e pontos pendentes aparecem sinalizados em cada ficha; trate toda oferta como hipótese até conversar com o negócio.</p></div>
        <button className="button-primary" onClick={() => onNavigate('leads')}>Explorar leads <ArrowRight size={16} /></button>
        <div className="banner-pattern" aria-hidden="true"><span /><span /><span /></div>
      </div>

      <div className="metric-grid">
        <MetricCard label="Leads na base" value={String(rows.length)} hint="Pesquisados + importados localmente" icon={Users} tone="blue" />
        <MetricCard label="Sites confirmados" value={String(siteCount)} hint="URLs de planilha não contam como verificadas" icon={Globe} tone="violet" />
        <MetricCard label="Hipóteses de serviço" value={String(hypothesisCount)} hint={hypothesisCount ? 'Sinais registrados nas fichas de leads' : 'Nenhuma hipótese registrada ainda'} icon={Sparkles} tone="amber" />
        <MetricCard label="Conversas confirmadas" value={String(stageCount('Em conversa') + stageCount('Proposta enviada') + stageCount('Cliente'))} hint="Atualize manualmente no CRM" icon={MessageSquareText} tone="green" />
      </div>

      <div className="dashboard-grid">
        <section className="panel pipeline-panel">
          <div className="panel-heading"><div><h3>Seu acompanhamento</h3><p>Estágios internos — tudo começa como mapeado.</p></div><button className="text-link" onClick={() => onNavigate('crm')}>Abrir CRM <ArrowRight size={15} /></button></div>
          <div className="pipeline-list">
            {pipeline.map(({ stage, value }, index) => <div className="pipeline-row" key={stage}><div className="pipeline-label"><span className={`pipeline-dot dot-${index}`} />{stage}</div><div className="pipeline-track"><span style={{ width: `${Math.max(value / Math.max(rows.length, 1) * 100, value ? 9 : 0)}%` }} className={`pipeline-fill fill-${index}`} /></div><strong>{value}</strong></div>)}
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
      <div className="data-note"><BadgeCheck size={16} /><span>Base de pesquisa inicial em <strong>{researchedAt}</strong>. Fichas importadas ficam no armazenamento local deste navegador e não são verificadas automaticamente.</span></div>
    </>
  )
}

function MetricCard({ label, value, hint, icon: Icon, tone }: { label: string; value: string; hint: string; icon: IconType; tone: string }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}><Icon size={19} /></div><div className="metric-label">{label}</div><div className="metric-value">{value}</div><div className="metric-hint">{hint}</div><div className={`metric-decoration ${tone}`} /></div>
}

function LeadsPage({ leads: rows, totalCount, cityOptions, nicheOptions, search, setSearch, siteFilter, setSiteFilter, cityFilter, setCityFilter, nicheFilter, setNicheFilter, priorityFilter, setPriorityFilter, offerFilter, setOfferFilter, reviewFilter, setReviewFilter, sourceFilter, setSourceFilter, state, updateLead, selectedLeadId, onOpenLead, showManualLeadForm, onManualLeadCancel, onManualLeadAdd }: { leads: Lead[]; totalCount: number; cityOptions: string[]; nicheOptions: string[]; search: string; setSearch: (value: string) => void; siteFilter: string; setSiteFilter: (value: string) => void; cityFilter: string; setCityFilter: (value: string) => void; nicheFilter: string; setNicheFilter: (value: string) => void; priorityFilter: string; setPriorityFilter: (value: string) => void; offerFilter: string; setOfferFilter: (value: string) => void; reviewFilter: string; setReviewFilter: (value: string) => void; sourceFilter: string; setSourceFilter: (value: string) => void; state: LocalState; updateLead: (id: string, updates: Partial<LeadState>) => void; selectedLeadId?: string; onOpenLead: (lead: Lead) => void; showManualLeadForm: boolean; onManualLeadCancel: () => void; onManualLeadAdd: (lead: Lead) => boolean }) {
  const selectedTargets = [nicheFilter !== 'Todos os nichos' ? nicheFilter : '', cityFilter !== 'Todas as cidades' ? `em ${cityFilter}` : ''].filter(Boolean)
  const searchQuery = selectedTargets.length ? selectedTargets.join(' ') : ''
  const mapSearchUrl = searchQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchQuery)}` : ''

  return <>
    {showManualLeadForm && <ManualLeadForm onAdd={onManualLeadAdd} onCancel={onManualLeadCancel} />}
    <section className="panel leads-panel">
    <div className="table-toolbar"><div className="toolbar-title"><div><h3>Base de leads <span className="count-bubble">{rows.length}</span></h3><p>Pesquisados e importados; confira a origem e o nível de verificação por ficha.</p></div></div><div className="search-box"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar negócio, serviço ou cidade" aria-label="Buscar leads" />{search && <button aria-label="Limpar busca" onClick={() => setSearch('')}><X size={15} /></button>}</div></div>
    <div className="filter-bar"><label className="filter-select"><span>Cidade</span><select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}><option>Todas as cidades</option>{cityOptions.map((city) => <option key={city}>{city}</option>)}</select><ChevronDown size={14} /></label><label className="filter-select"><span>Nicho</span><select value={nicheFilter} onChange={(event) => setNicheFilter(event.target.value)}><option>Todos os nichos</option>{nicheOptions.map((niche) => <option key={niche}>{niche}</option>)}</select><ChevronDown size={14} /></label><label className="filter-select"><span>Site</span><select value={siteFilter} onChange={(event) => setSiteFilter(event.target.value)}><option>Todos os sites</option><option>Site confirmado</option><option>URL informada · não verificada</option><option>Site não localizado</option><option>Sem URL na planilha</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Prioridade provisória</span><select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}><option>Todas as prioridades</option><option>Alta provisória</option><option>Média-alta provisória</option><option>Média provisória</option><option>Média-baixa provisória</option><option>Baixa provisória</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Oferta</span><select value={offerFilter} onChange={(event) => setOfferFilter(event.target.value)}><option>Todas as ofertas</option><option>Site / landing page</option><option>Automação / agendamento</option><option>Instagram / visual</option><option>Validação inicial</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Verificação</span><select value={reviewFilter} onChange={(event) => setReviewFilter(event.target.value)}><option>Todas as fichas</option><option>Validação pendente</option><option>Conferidos manualmente</option></select><ChevronDown size={14} /></label><label className="filter-select"><span>Fontes</span><select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value)}><option>Todas as fontes</option><option>Com fontes</option><option>Sem fontes</option></select><ChevronDown size={14} /></label></div>
    <div className="lead-filter-summary" aria-live="polite">
      <span><strong>{rows.length}</strong> {rows.length === 1 ? 'lead encontrado' : 'leads encontrados'}{selectedTargets.length > 0 ? ` para ${selectedTargets.join(' ')}` : ''} <small>de {totalCount} na base</small></span>
      {mapSearchUrl && <a className="button-outline" href={mapSearchUrl} target="_blank" rel="noreferrer"><MapPin size={14} /> Buscar no Google Maps</a>}
      {mapSearchUrl && <small className="lead-filter-search-note">A busca abre em outra aba; os resultados só entram na base se você os cadastrar.</small>}
    </div>
    <div className="table-scroll"><table className="lead-table"><thead><tr><th>Negócio</th><th>Presença digital</th><th>Oportunidade hipotética</th><th>Score / prioridade</th><th>CRM</th><th aria-label="Abrir" /></tr></thead><tbody>{rows.map((lead) => { const current = state[lead.id] ?? createDefaultLeadState(); const score = getProspectingScore(current.qualification); return <tr key={lead.id} className={selectedLeadId === lead.id ? 'lead-selected' : undefined} aria-selected={selectedLeadId === lead.id} onClick={() => onOpenLead(lead)}><td><div className="business-cell"><div className="business-avatar">{lead.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').replace(/[—(]/g, '')}</div><div><strong>{lead.name}</strong><small><MapPin size={12} />{lead.address.split(',').slice(-2).join(',').trim()}</small></div></div></td><td><span className={`site-status ${siteStatusClass(lead.websiteStatus)}`}><span />{lead.websiteStatus}</span>{lead.website && <small className="website-host">{new URL(lead.website).hostname.replace('www.', '')}</small>}</td><td><div className="offer-cell"><strong>{getOfferTypes(lead)[0]}</strong><small>{lead.offer.length > 72 ? `${lead.offer.slice(0, 72)}…` : lead.offer}</small></div></td><td><div className="lead-score-cell"><span className="score-mini">{score === null ? '—' : `${score}/100`}</span><small>{getScoreLabel(score)}</small><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority}</span></div></td><td onClick={(event) => event.stopPropagation()}><select className="stage-select" aria-label={`Estágio CRM de ${lead.name}`} value={current.stage} onChange={(event) => updateLead(lead.id, { stage: event.target.value as Stage })}>{stages.map((stage) => <option key={stage} disabled={!canTransitionStage(current.stage, stage)}>{stage}</option>)}</select></td><td><button className="row-open" aria-label={`Abrir ${lead.name}`} onClick={(event) => { event.stopPropagation(); onOpenLead(lead) }}><ChevronRight size={17} /></button></td></tr> })}</tbody></table></div>
    {!rows.length && <div className="empty-state"><Search size={23} /><strong>Nenhum lead encontrado</strong><span>Tente mudar os filtros ou o termo da busca.</span></div>}
    <div className="table-footer"><span>Exibindo {rows.length} de {totalCount} leads na base</span><span><ShieldCheck size={14} /> Oportunidades ainda não validadas</span></div>
    </section>
  </>
}

function CRMPage({ leads: rows, state, updateLead, selectedLeadId, onOpenLead }: { leads: Lead[]; state: LocalState; updateLead: (id: string, updates: LeadStateUpdate) => void; selectedLeadId?: string; onOpenLead: (lead: Lead) => void }) {
  const leadState = (lead: Lead) => state[lead.id] ?? createDefaultLeadState()
  const verifiedCount = rows.filter((lead) => getValidationLabel(leadState(lead).qualification) === 'Conferido manualmente').length
  const readyCount = rows.filter((lead) => leadState(lead).stage === 'Pronto para contato').length
  const contactedStages: Stage[] = ['Contato feito', 'Em conversa', 'Proposta enviada', 'Cliente']
  const replyStages: Stage[] = ['Em conversa', 'Proposta enviada', 'Cliente']
  const proposalStages: Stage[] = ['Proposta enviada', 'Cliente']
  const contactedCount = rows.filter((lead) => contactedStages.includes(leadState(lead).stage)).length
  const repliedCount = rows.filter((lead) => replyStages.includes(leadState(lead).stage)).length
  const proposalBase = rows.filter((lead) => replyStages.includes(leadState(lead).stage)).length
  const proposalCount = rows.filter((lead) => proposalStages.includes(leadState(lead).stage)).length
  const responseRate = contactedCount ? `${Math.round(repliedCount / contactedCount * 100)}%` : '—'
  const proposalRate = proposalBase ? `${Math.round(proposalCount / proposalBase * 100)}%` : '—'
  return <>
    <div className="crm-intro"><div className="crm-intro-icon"><Activity size={20} /></div><div><strong>Seu pipeline, atualizado por você</strong><span>Os estágios são manuais; score e conferências são referências para seu acompanhamento. Nenhuma mensagem é enviada.</span></div><span className="saved-local"><ShieldCheck size={14} /> Local</span></div>
    <section className="panel crm-metrics-panel">
      <div className="panel-heading"><div><h3>Eficiência do pipeline</h3><p>Métricas pelos estágios registrados manualmente neste navegador.</p></div><span className="soft-badge">Sem envio automático</span></div>
      <div className="crm-metrics-grid">
        <div className="crm-metric"><span>Dados conferidos</span><strong>{verifiedCount}/{rows.length}</strong><small>{rows.length ? `${Math.round(verifiedCount / rows.length * 100)}% · identidade, contato, fonte e data` : 'Sem leads'}</small></div>
        <div className="crm-metric"><span>Prontos para contato</span><strong>{rows.length ? `${readyCount}/${rows.length}` : '—'}</strong><small>{rows.length ? `${Math.round(readyCount / rows.length * 100)}% do total · estágio escolhido manualmente` : 'Sem leads'}</small></div>
        <div className="crm-metric"><span>Taxa de resposta</span><strong>{responseRate}</strong><small>{contactedCount ? `${repliedCount} respostas / ${contactedCount} leads contatados` : 'Sem amostra de contatos'}</small></div>
        <div className="crm-metric"><span>Avanço a proposta</span><strong>{proposalRate}</strong><small>{proposalBase ? `${proposalCount} em proposta/cliente / ${proposalBase} com resposta` : 'Sem amostra de conversas'}</small></div>
      </div>
      <p className="crm-metric-definition">Resposta = Em conversa, Proposta enviada ou Cliente ÷ Contato feito ou etapas posteriores. Avanço = Proposta enviada ou Cliente ÷ leads que responderam. As taxas consideram os estágios registrados manualmente. “—” significa denominador zero.</p>
    </section>
    <div className="kanban-board">{boardStages.map((stage, index) => {
      const cards = rows.filter((lead) => leadState(lead).stage === stage)
      return <section className="kanban-column" key={stage}>
        <div className="kanban-heading"><span className={`kanban-dot dot-${index % 6}`} /><strong>{stage}</strong><span className="kanban-count">{cards.length}</span><MoreHorizontal size={17} /></div>
        <div className="kanban-cards">{cards.map((lead) => {
          const current = leadState(lead)
          const score = getProspectingScore(current.qualification)
          return <article className={`kanban-card ${selectedLeadId === lead.id ? 'lead-selected' : ''}`} key={lead.id}>
            <button className="card-name-button" onClick={() => onOpenLead(lead)}><strong>{lead.name}</strong><ChevronRight size={15} /></button>
            <span className="kanban-specialty">{getLeadCity(lead)} · {getLeadNiche(lead)}</span>
            <div className="kanban-tags"><span className={`site-mini ${lead.websiteStatus === 'Confirmado' ? 'has-site' : 'no-site'}`}>{lead.websiteStatus === 'Confirmado' ? 'Site verificado' : lead.website ? 'URL não verificada' : 'Sem URL'}</span><span className="score-mini">{score === null ? 'Score —' : `Score ${score}`}</span></div>
            <small className="kanban-verification">{getValidationLabel(current.qualification)} · {score === null ? 'avaliação pendente' : score >= 50 ? 'revisar encaixe' : score === 0 ? 'sem encaixe' : 'baixa prioridade'}</small>
            <p>{getOfferTypes(lead)[0]} · hipótese a validar</p>
            {current.qualification.nextAction && <small className="kanban-next-action">Próximo passo: {current.qualification.nextAction}{current.qualification.nextActionDate ? ` · ${current.qualification.nextActionDate}` : ''}</small>}
            <label className="kanban-stage-control">Mover para<select value={stage} onChange={(event) => updateLead(lead.id, { stage: event.target.value as Stage })}>{stages.map((item) => <option key={item} disabled={!canTransitionStage(current.stage, item)}>{item}</option>)}</select></label>
          </article>
        })}{!cards.length && <div className="kanban-empty">Nenhum lead neste estágio.</div>}</div>
      </section>
    })}</div>
    <div className="crm-privacy"><ShieldCheck size={16} /> Etapas, verificações e métricas ficam no localStorage deste navegador. Não insira informações clínicas nem dados sensíveis.</div>
  </>
}

function RankingPage({ leads: rows, state, onOpenLead }: { leads: Lead[]; state: LocalState; onOpenLead: (lead: Lead) => void }) {
  const sorted = rows.filter((lead) => (state[lead.id] ?? createDefaultLeadState()).stage !== 'Sem prioridade').sort((a, b) => {
    const scoreA = getProspectingScore((state[a.id] ?? createDefaultLeadState()).qualification)
    const scoreB = getProspectingScore((state[b.id] ?? createDefaultLeadState()).qualification)
    if (scoreA === null && scoreB !== null) return 1
    if (scoreB === null && scoreA !== null) return -1
    return (scoreB ?? 0) - (scoreA ?? 0) || priorityValue(a.priority) - priorityValue(b.priority)
  })
  return <div className="ranking-layout"><section className="panel ranking-panel"><div className="panel-heading"><div><h3>Leads para investigar primeiro</h3><p>Score público + confirmação documentada; score vazio continua sem avaliação.</p></div><span className="soft-badge">{sorted.length} leads ativos</span></div><div className="ranking-list">{sorted.map((lead, index) => { const current = state[lead.id] ?? createDefaultLeadState(); const score = getProspectingScore(current.qualification); return <button className="ranking-row" key={lead.id} onClick={() => onOpenLead(lead)}><span className={`ranking-number ${index < 2 ? 'top-ranked' : ''}`}>{String(index + 1).padStart(2, '0')}</span><div className="ranking-main"><strong>{lead.name}</strong><small>{lead.priorityReason}</small></div><div className="ranking-state"><span className="score-mini">{score === null ? 'Não avaliado' : `${score}/100`}</span><small>{current.stage}</small></div><ChevronRight size={17} /></button> })}</div></section><aside className="panel ranking-criteria"><div className="criteria-icon"><Target size={21} /></div><h3>Como ler esta ordem</h3><p>O score final soma análise pública (até {scoringWeights.maxPublicScore}) e confirmação documentada do cliente (até {scoringWeights.maxClientBonus}); ele prioriza investigação, não prevê venda. Registros importados continuam sem verificação até revisão manual.</p><div className="criteria-line"><BadgeCheck size={16} /><span>Fontes próprias e sinais específicos pesam na fase pública.</span></div><div className="criteria-line"><BadgeCheck size={16} /><span>Antes da primeira abordagem, exige-se score público ≥ {scoringWeights.minimumPublicScoreToContact}, identidade e contato confirmados, URL e nota válidas e um serviço compatível. A data da conferência soma +{scoringWeights.validationDate}, mas não é obrigatória.</span></div><div className="criteria-line"><BadgeCheck size={16} /><span>Resposta simples soma 0; necessidade confirmada (+{scoringWeights.confirmedNeed}) ou proposta solicitada (+{scoringWeights.requestedProposal}) podem alterar a pontuação.</span></div><div className="criteria-warning"><ShieldCheck size={16} /> Recusas não pontuam; leads movidos para “Sem prioridade” saem do Ranking ativo.</div></aside></div>
}

function ProjectsPage() {
  return <section className="panel empty-projects"><div className="empty-illustration"><BriefcaseBusiness size={27} /></div><span className="soft-badge">ESPAÇO DE TRABALHO</span><h3>Nenhum projeto em andamento</h3><p>Quando um cliente aceitar uma proposta sua, registre aqui o escopo, as entregas e os próximos passos. Esta demonstração não inclui trabalhos ou clientes fictícios.</p><div className="empty-project-stats"><span><strong>0</strong> projetos ativos</span><span><strong>0</strong> clientes confirmados</span><span><strong>0</strong> entregas em curso</span></div></section>
}

function PlaceholderPage({ icon: Icon, title, label, description }: { icon: IconType; title: string; label: string; description: string }) {
  return <section className="panel placeholder-panel"><div className="placeholder-icon"><Icon size={24} /></div><span className="soon-badge larger">{label}</span><h3>{title}</h3><p>{description}</p><div className="placeholder-note"><ShieldCheck size={16} /> Sem integrações externas ou ações automáticas neste módulo.</div></section>
}

function TemplatesPage({ leads: allLeads, state, onCopy }: { leads: Lead[]; state: LocalState; onCopy: (text: string) => void }) {
  const drafts = [
    { title: 'Primeiro contato · descoberta', tag: 'Rascunho editável', text: 'Olá, equipe de [negócio]! Vi que vocês apresentam [serviço observado] no site. Estou pesquisando formas práticas de melhorar a experiência digital de negócios locais. Como vocês organizam hoje os pedidos de contato ou orçamento que chegam pelo site ou WhatsApp? Se fizer sentido, posso compartilhar uma ideia curta e sem compromisso. Obrigado(a)!' },
    { title: 'Convite para piloto delimitado', tag: 'Usar após conversa', text: 'Obrigado(a) por compartilhar como funciona hoje. Com base no que conversamos, posso propor um piloto com escopo fechado: [entrega], em [prazo], por [valor]. A proposta não garante resultados comerciais; serve para testar uma melhoria específica. Posso enviar o escopo para vocês avaliarem?' },
  ]
  return <><div className="template-caution"><ShieldCheck size={17} /><span>Modelos são rascunhos. Personalize só com fatos verificados e não envie nada sem revisar.</span></div><QuoteBuilder leads={allLeads} leadState={state} onCopy={onCopy} /><div className="template-grid">{drafts.map((draft) => <article className="panel template-card" key={draft.title}><div className="template-card-top"><span className="soft-badge">{draft.tag}</span><MoreHorizontal size={18} /></div><h3>{draft.title}</h3><p>{draft.text}</p><button className="button-outline" onClick={() => onCopy(draft.text)}><Copy size={15} /> Copiar rascunho</button></article>)}</div><div className="data-note"><MessageSquareText size={16} /><span>Não há integração de WhatsApp, e-mail ou envio automatizado. A mensagem acima é apenas texto para editar.</span></div></>
}

function LeadDetail({ lead, state, onChange, onClose }: { lead: Lead; state: LeadState; onChange: (id: string, updates: LeadStateUpdate) => void; onClose: () => void }) {
  const drawerRef = useRef<HTMLElement | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    closeButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const drawer = drawerRef.current
      if (!drawer) return
      const focusable = Array.from(drawer.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) {
        event.preventDefault()
        drawer.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && (!drawer.contains(document.activeElement) || document.activeElement === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!drawer.contains(document.activeElement) || document.activeElement === last)) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [lead.id])

  return <div className="detail-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><aside ref={drawerRef} className="detail-drawer" role="dialog" aria-modal="true" aria-label={`Detalhes de ${lead.name}`} tabIndex={-1}><div className="detail-top"><span className="eyebrow">FICHA DO LEAD</span><button ref={closeButtonRef} className="icon-button" aria-label="Fechar ficha" onClick={onClose}><X size={19} /></button></div><div className="detail-title-row"><div className="detail-avatar">{lead.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').replace(/[—(]/g, '')}</div><div><h2>{lead.name}</h2><span><MapPin size={13} /> {lead.address.split(',').slice(-2).join(',').trim()}</span></div></div><div className="detail-chips"><span className={`site-status ${siteStatusClass(lead.websiteStatus)}`}><span />{lead.websiteStatus}</span><span className={`priority-chip ${statusClass(lead.priority)}`}>{lead.priority}</span></div>
    <div className="detail-actions">{lead.website && <a className="button-primary" href={lead.website} target="_blank" rel="noreferrer">{lead.origin === 'planilha' || lead.origin === 'manual' ? 'Abrir URL informada' : 'Abrir site'} <ExternalLink size={15} /></a>}{lead.instagram && <a className="button-outline" href={lead.instagram} target="_blank" rel="noreferrer"><Camera size={15} /> {lead.origin === 'planilha' || lead.origin === 'manual' ? 'Instagram informado' : 'Instagram'}</a>}{lead.sources.filter((source) => source.url && source.url !== lead.instagram && source.label.startsWith('Perfil social')).map((source) => <a className="button-outline" href={source.url} target="_blank" rel="noreferrer" key={source.url}>Abrir perfil social <ExternalLink size={15} /></a>)}</div>
    {lead.instagram && <div className="data-note profile-extraction-note"><ShieldCheck size={15} /><span>O link é mantido como fonte; este painel não extrai automaticamente bio, publicações, WhatsApp ou links externos. Abra o perfil, confirme o dado e registre a evidência em “Validar dados”.</span></div>}
    <div className="detail-divider" />
    <section className="detail-section"><div className="detail-section-heading"><h3>O que foi observado</h3><span className="soft-badge">{lead.origin === 'planilha' ? 'Origem: planilha' : lead.origin === 'manual' ? 'Origem: cadastro manual' : 'Fonte pública'}</span></div><p className="detail-service">{lead.services}</p>{lead.evidence.map((fact) => <div className="evidence-line" key={fact}><BadgeCheck size={15} /><span>{fact}</span></div>)}</section>
    <section className="detail-section"><h3>Oportunidade para você</h3><div className="hypothesis-box"><span className="hypothesis-label"><Sparkles size={14} /> HIPÓTESE A VALIDAR</span><p>{lead.offer}</p><small>Não há confirmação de necessidade, orçamento ou intenção de compra.</small></div></section>
    <section className="detail-section"><h3>{lead.origin === 'planilha' ? 'Contatos informados na planilha' : lead.origin === 'manual' ? 'Contatos cadastrados manualmente' : 'Contato público'}</h3><div className="contact-list">{lead.contacts.map((contact) => <div className="contact-row" key={`${contact.label}-${contact.value}`}><span>{contact.label}<small>{contact.type === 'planilha' ? 'Importado · não verificado' : contact.type === 'manual' ? 'Informado manualmente · não verificado' : contact.type === 'direto' ? 'Fonte do negócio' : contact.type === 'social' ? 'Perfil/publicação social' : 'Diretório de terceiros'}</small></span><strong>{contact.value}</strong></div>)}{!lead.contacts.length && <span>Contato não informado.</span>}</div><div className="address-box"><MapPin size={15} /><span>{lead.address}</span></div></section>
    <LeadQualificationPanel lead={lead} qualification={state.qualification} contactMade={['Contato feito', 'Em conversa', 'Proposta enviada', 'Cliente'].includes(state.stage)} onChange={(updates) => onChange(lead.id, { qualification: updates })} onMarkReady={() => onChange(lead.id, { stage: 'Pronto para contato' })} />
    <section className="detail-section"><h3>Agendamento observado</h3><p className="detail-service">{lead.scheduling}</p></section>
    <section className="detail-section"><h3>CRM interno</h3><label className="field-label">Estágio<select value={state.stage} onChange={(event) => onChange(lead.id, { stage: event.target.value as Stage })}>{stages.map((stage) => <option key={stage} disabled={!canTransitionStage(state.stage, stage)}>{stage}</option>)}</select></label><label className="field-label">Nota interna <textarea value={state.notes} onChange={(event) => onChange(lead.id, { notes: event.target.value })} placeholder="Registre somente o próximo passo ou observações não sensíveis." rows={3} /></label><small className="field-footnote"><ShieldCheck size={13} /> Salvo neste navegador. Não inclua dados de saúde ou informações sensíveis.</small></section>
    <section className="detail-section"><div className="detail-source-heading"><h3>{lead.origin === 'planilha' || lead.origin === 'manual' ? 'Origem dos dados' : 'Fontes e consulta'}</h3><span>{lead.origin === 'planilha' || lead.origin === 'manual' ? lead.importedAt : lead.lastReviewedAt ?? researchedAt}</span></div><div className="source-list">{lead.origin === 'planilha' && <div className="source-item"><span><strong>Importação local · arquivo não armazenado</strong><small>Campos selecionados pelo usuário; não são uma fonte pública nem foram verificados independentemente.</small></span></div>}{lead.origin === 'manual' && <div className="source-item"><span><strong>Cadastro manual · salvo neste navegador</strong><small>Os dados e links foram informados pelo usuário; confirme-os antes de qualquer abordagem.</small></span></div>}{lead.sources.map((source, index) => source.url ? <a className="source-item" href={source.url} target="_blank" rel="noreferrer" key={`${source.url}-${index}`}><span><strong>{source.label}</strong><small>{source.supports}</small></span><ExternalLink size={14} /></a> : <div className="source-item" key={`${source.label}-${index}`}><span><strong>{source.label}</strong><small>{source.supports}</small></span></div>)}{!lead.sources.length && lead.origin !== 'planilha' && lead.origin !== 'manual' && <span>Nenhuma fonte externa anexada.</span>}</div><div className="confidence-note"><ShieldCheck size={15} /><span>{lead.confidence}</span></div></section>
    <div className="detail-footer"><ShieldCheck size={15} /> {lead.origin === 'planilha' || lead.origin === 'manual' ? 'Confirme a origem dos contatos e os dados antes de qualquer abordagem.' : 'Dados públicos podem mudar; revalide antes de abordar.'}</div>
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
