export const serviceOptions = [
  { id: 'site', label: 'Melhoria de site / landing page' },
  { id: 'automation', label: 'Automação de contato / agendamento' },
  { id: 'instagram', label: 'Visual e apresentação do Instagram' },
] as const

export type ServiceId = typeof serviceOptions[number]['id']
export type OpportunityStatus = 'not-assessed' | 'public-signal' | 'client-confirmed' | 'not-fit'
export type CheckStatus = 'not-checked' | 'confirmed' | 'mismatch' | 'access-restricted'
export type InterestStatus = 'no-response' | 'responded' | 'need-confirmed' | 'proposal-requested'

export type OpportunityAssessment = {
  status: OpportunityStatus
  evidenceNote: string
  evidenceSource: string
}

export type LeadQualification = {
  identityStatus: CheckStatus
  contactStatus: CheckStatus
  verifiedContactType: string
  verifiedContactValue: string
  verificationSourceUrl: string
  verificationNote: string
  verificationDate: string
  opportunities: Record<ServiceId, OpportunityAssessment>
  noRelevantService: boolean
  nextAction: string
  nextActionDate: string
  interestStatus: InterestStatus
  interestEvidence: string
  interestDate: string
}

export type ScoreLine = { label: string; points: number; detail: string }

export function createDefaultQualification(): LeadQualification {
  return {
    identityStatus: 'not-checked',
    contactStatus: 'not-checked',
    verifiedContactType: 'WhatsApp',
    verifiedContactValue: '',
    verificationSourceUrl: '',
    verificationNote: '',
    verificationDate: '',
    opportunities: {
      site: { status: 'not-assessed', evidenceNote: '', evidenceSource: '' },
      automation: { status: 'not-assessed', evidenceNote: '', evidenceSource: '' },
      instagram: { status: 'not-assessed', evidenceNote: '', evidenceSource: '' },
    },
    noRelevantService: false,
    nextAction: '',
    nextActionDate: '',
    interestStatus: 'no-response',
    interestEvidence: '',
    interestDate: '',
  }
}

const checkStatuses: CheckStatus[] = ['not-checked', 'confirmed', 'mismatch', 'access-restricted']
const opportunityStatuses: OpportunityStatus[] = ['not-assessed', 'public-signal', 'client-confirmed', 'not-fit']
const interestStatuses: InterestStatus[] = ['no-response', 'responded', 'need-confirmed', 'proposal-requested']

export function normalizeQualification(value: unknown): LeadQualification {
  const defaults = createDefaultQualification()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  const input = value as Partial<LeadQualification>
  const rawOpportunities = input.opportunities && typeof input.opportunities === 'object' ? input.opportunities : {}
  const opportunities = { ...defaults.opportunities }
  for (const option of serviceOptions) {
    const raw = (rawOpportunities as Partial<Record<ServiceId, OpportunityAssessment>>)[option.id]
    if (!raw || typeof raw !== 'object') continue
    opportunities[option.id] = {
      status: opportunityStatuses.includes(raw.status) ? raw.status : 'not-assessed',
      evidenceNote: typeof raw.evidenceNote === 'string' ? raw.evidenceNote : '',
      evidenceSource: typeof raw.evidenceSource === 'string' ? raw.evidenceSource : '',
    }
  }
  const noRelevantService = input.noRelevantService === true
  return {
    identityStatus: checkStatuses.includes(input.identityStatus as CheckStatus) ? input.identityStatus as CheckStatus : 'not-checked',
    contactStatus: checkStatuses.includes(input.contactStatus as CheckStatus) ? input.contactStatus as CheckStatus : 'not-checked',
    verifiedContactType: typeof input.verifiedContactType === 'string' ? input.verifiedContactType : defaults.verifiedContactType,
    verifiedContactValue: typeof input.verifiedContactValue === 'string' ? input.verifiedContactValue : '',
    verificationSourceUrl: typeof input.verificationSourceUrl === 'string' ? input.verificationSourceUrl : '',
    verificationNote: typeof input.verificationNote === 'string' ? input.verificationNote : '',
    verificationDate: typeof input.verificationDate === 'string' ? input.verificationDate : '',
    opportunities,
    noRelevantService,
    nextAction: typeof input.nextAction === 'string' ? input.nextAction : '',
    nextActionDate: typeof input.nextActionDate === 'string' ? input.nextActionDate : '',
    interestStatus: interestStatuses.includes(input.interestStatus as InterestStatus) ? input.interestStatus as InterestStatus : 'no-response',
    interestEvidence: typeof input.interestEvidence === 'string' ? input.interestEvidence : '',
    interestDate: typeof input.interestDate === 'string' ? input.interestDate : '',
  }
}

export function isHttpUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function qualifiedOpportunityPoints(qualification: LeadQualification) {
  let signalCount = 0
  let clientConfirmedCount = 0
  for (const assessment of Object.values(qualification.opportunities)) {
    if (assessment.status === 'public-signal' && assessment.evidenceNote.trim() && isHttpUrl(assessment.evidenceSource.trim())) signalCount += 1
    const clientConfirmedNeed = qualification.interestStatus === 'need-confirmed' || qualification.interestStatus === 'proposal-requested'
    if (assessment.status === 'client-confirmed' && assessment.evidenceNote.trim() && clientConfirmedNeed && qualification.interestEvidence.trim() && qualification.interestDate) clientConfirmedCount += 1
  }
  return Math.min(50, signalCount * 10 + clientConfirmedCount * 20)
}

function hasExplicitNoFit(qualification: LeadQualification) {
  return qualification.noRelevantService || serviceOptions.every(({ id }) => qualification.opportunities[id].status === 'not-fit')
}

export function getScoreBreakdown(qualification: LeadQualification): ScoreLine[] {
  const explicitNoFit = hasExplicitNoFit(qualification)
  const noFitDetail = 'Dados registrados no CRM, mas não pontuados porque nenhum serviço compatível foi marcado.'
  const servicePoints = explicitNoFit ? 0 : qualifiedOpportunityPoints(qualification)
  const scoreStarted = !explicitNoFit && servicePoints > 0
  const pausedDetail = explicitNoFit ? noFitDetail : 'Ainda não pontuado: registre um serviço compatível com evidência para iniciar o score.'
  const identityPoints = scoreStarted && qualification.identityStatus === 'confirmed' ? 10 : 0
  const contactPoints = scoreStarted && qualification.contactStatus === 'confirmed' && qualification.verifiedContactValue.trim() ? 15 : 0
  const sourcePoints = scoreStarted && isHttpUrl(qualification.verificationSourceUrl.trim()) && qualification.verificationNote.trim() ? 10 : 0
  const verificationDatePoints = scoreStarted && qualification.verificationDate ? 5 : 0
  const nextActionPoints = scoreStarted && qualification.nextAction.trim() ? 5 : 0
  const nextActionDatePoints = scoreStarted && qualification.nextActionDate ? 5 : 0
  return [
    { label: 'Encaixe de serviço com evidência', points: servicePoints, detail: explicitNoFit ? 'Nenhum serviço compatível foi registrado.' : servicePoints === 0 ? 'Marque um sinal público com fonte/nota ou confirme necessidade após interação documentada para iniciar o score.' : 'Sinais públicos documentados valem 10 cada; necessidade confirmada pelo negócio com interação, evidência e data vale 20; teto de 50.' },
    { label: 'Identidade do negócio conferida', points: identityPoints, detail: scoreStarted ? 'Até 10 pontos.' : pausedDetail },
    { label: 'Contato público conferido', points: contactPoints, detail: scoreStarted ? 'Até 15 pontos, somente com canal e valor registrados.' : pausedDetail },
    { label: 'Fonte e nota da conferência', points: sourcePoints, detail: scoreStarted ? 'Até 10 pontos com URL HTTP(S) e observação.' : pausedDetail },
    { label: 'Data da conferência', points: verificationDatePoints, detail: scoreStarted ? 'Até 5 pontos.' : pausedDetail },
    { label: 'Próxima ação definida', points: nextActionPoints, detail: scoreStarted ? 'Até 5 pontos.' : pausedDetail },
    { label: 'Data da próxima ação', points: nextActionDatePoints, detail: scoreStarted ? 'Até 5 pontos.' : pausedDetail },
  ]
}

export function getProspectingScore(qualification: LeadQualification): number | null {
  if (hasExplicitNoFit(qualification)) return 0
  const servicePoints = qualifiedOpportunityPoints(qualification)
  if (servicePoints === 0) return null
  return Math.min(100, getScoreBreakdown(qualification).reduce((total, line) => total + line.points, 0))
}

export function hasRelevantService(qualification: LeadQualification) {
  return !hasExplicitNoFit(qualification) && qualifiedOpportunityPoints(qualification) > 0
}

export function getScoreLabel(score: number | null) {
  if (score === null) return 'Ainda não avaliado'
  if (score === 0) return 'Sem serviço compatível'
  if (score < 50) return 'Baixa prioridade · evidência limitada'
  if (score < 70) return 'Potencial médio · confirme o encaixe'
  if (score < 85) return 'Prioridade alta de pesquisa'
  return 'Prioridade muito alta de pesquisa'
}

export function getValidationLabel(qualification: LeadQualification) {
  if (qualification.identityStatus === 'mismatch' || qualification.contactStatus === 'mismatch') return 'Divergência encontrada'
  if (qualification.identityStatus === 'confirmed' && qualification.contactStatus === 'confirmed' && qualification.verifiedContactValue.trim() && isHttpUrl(qualification.verificationSourceUrl.trim()) && qualification.verificationNote.trim() && qualification.verificationDate) return 'Conferido manualmente'
  if (qualification.identityStatus === 'access-restricted' || qualification.contactStatus === 'access-restricted') return 'Acesso restrito · exige login'
  if (qualification.identityStatus !== 'not-checked' || qualification.contactStatus !== 'not-checked' || qualification.verificationSourceUrl || qualification.verificationNote || qualification.verificationDate) return 'Validação parcial'
  return 'Não verificado'
}

export function canMarkReadyForContact(qualification: LeadQualification) {
  const score = getProspectingScore(qualification)
  return score !== null && score >= 50 && hasRelevantService(qualification) &&
    qualification.identityStatus === 'confirmed' && qualification.contactStatus === 'confirmed' &&
    Boolean(qualification.verifiedContactValue.trim()) && isHttpUrl(qualification.verificationSourceUrl.trim()) &&
    Boolean(qualification.verificationNote.trim()) && Boolean(qualification.verificationDate)
}

export function getInterestTemperature(qualification: LeadQualification) {
  if (qualification.interestStatus === 'no-response') return { label: 'Frio · sem resposta registrada', className: 'cold' }
  if (!qualification.interestEvidence.trim() || !qualification.interestDate) return { label: 'Interação sem evidência/data', className: 'pending' }
  if (qualification.interestStatus === 'responded') return { label: 'Morno · respondeu', className: 'warm' }
  if (qualification.interestStatus === 'need-confirmed') return { label: 'Quente · necessidade confirmada', className: 'hot' }
  return { label: 'Quente · pediu proposta', className: 'hot' }
}
