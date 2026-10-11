export const serviceOptions = [
  { id: 'site', label: 'Melhoria de site / landing page' },
  { id: 'automation', label: 'Automação de contato / agendamento' },
  { id: 'instagram', label: 'Visual e apresentação do Instagram' },
] as const

export type ServiceId = typeof serviceOptions[number]['id']
export type OpportunityStatus = 'not-assessed' | 'public-signal' | 'not-fit'
export type CheckStatus = 'not-checked' | 'confirmed' | 'mismatch' | 'access-restricted'
export type InterestStatus = 'no-response' | 'responded' | 'declined' | 'need-confirmed' | 'proposal-requested'

export type OpportunityAssessment = {
  status: OpportunityStatus
  evidenceNote: string
  evidenceSource: string
  clientConfirmed: boolean
  clientConfirmationNote: string
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

export const scoringWeights = {
  publicSignalPerService: 20,
  maxPublicSignalPoints: 50,
  identityConfirmed: 10,
  contactConfirmed: 10,
  sourceAndNote: 5,
  validationDate: 5,
  confirmedNeed: 12,
  requestedProposal: 20,
  minimumPublicScoreToContact: 50,
  mediumPotentialThreshold: 50,
  highPriorityThreshold: 70,
  veryHighPriorityThreshold: 85,
  maxPublicScore: 80,
  maxClientBonus: 20,
  maxTotalScore: 100,
} as const

export function createDefaultQualification(): LeadQualification {
  const emptyOpportunity = (): OpportunityAssessment => ({
    status: 'not-assessed',
    evidenceNote: '',
    evidenceSource: '',
    clientConfirmed: false,
    clientConfirmationNote: '',
  })
  return {
    identityStatus: 'not-checked',
    contactStatus: 'not-checked',
    verifiedContactType: 'WhatsApp',
    verifiedContactValue: '',
    verificationSourceUrl: '',
    verificationNote: '',
    verificationDate: '',
    opportunities: {
      site: emptyOpportunity(),
      automation: emptyOpportunity(),
      instagram: emptyOpportunity(),
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
const opportunityStatuses: OpportunityStatus[] = ['not-assessed', 'public-signal', 'not-fit']
const interestStatuses: InterestStatus[] = ['no-response', 'responded', 'declined', 'need-confirmed', 'proposal-requested']

export function normalizeQualification(value: unknown): LeadQualification {
  const defaults = createDefaultQualification()
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaults
  const input = value as Partial<LeadQualification>
  const rawOpportunities = input.opportunities && typeof input.opportunities === 'object'
    ? input.opportunities as unknown as Record<string, unknown>
    : {}
  const opportunities = { ...defaults.opportunities }

  for (const option of serviceOptions) {
    const rawValue = rawOpportunities[option.id]
    if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) continue
    const raw = rawValue as Record<string, unknown>
    const legacyClientConfirmed = raw.status === 'client-confirmed'
    const status = legacyClientConfirmed
      ? 'not-assessed'
      : opportunityStatuses.includes(raw.status as OpportunityStatus)
        ? raw.status as OpportunityStatus
        : 'not-assessed'
    const oldEvidenceNote = typeof raw.evidenceNote === 'string' ? raw.evidenceNote : ''
    const clientConfirmed = status !== 'not-fit' && (legacyClientConfirmed || raw.clientConfirmed === true)

    opportunities[option.id] = {
      status,
      // A legacy client note is migrated to the separate client field, never counted as public evidence.
      evidenceNote: legacyClientConfirmed ? '' : oldEvidenceNote,
      evidenceSource: typeof raw.evidenceSource === 'string' ? raw.evidenceSource : '',
      clientConfirmed,
      clientConfirmationNote: status === 'not-fit'
        ? ''
        : legacyClientConfirmed
          ? oldEvidenceNote
          : typeof raw.clientConfirmationNote === 'string'
            ? raw.clientConfirmationNote
            : '',
    }
  }

  return {
    identityStatus: checkStatuses.includes(input.identityStatus as CheckStatus) ? input.identityStatus as CheckStatus : 'not-checked',
    contactStatus: checkStatuses.includes(input.contactStatus as CheckStatus) ? input.contactStatus as CheckStatus : 'not-checked',
    verifiedContactType: typeof input.verifiedContactType === 'string' ? input.verifiedContactType : defaults.verifiedContactType,
    verifiedContactValue: typeof input.verifiedContactValue === 'string' ? input.verifiedContactValue : '',
    verificationSourceUrl: typeof input.verificationSourceUrl === 'string' ? input.verificationSourceUrl : '',
    verificationNote: typeof input.verificationNote === 'string' ? input.verificationNote : '',
    verificationDate: typeof input.verificationDate === 'string' ? input.verificationDate : '',
    opportunities,
    noRelevantService: input.noRelevantService === true,
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

function hasExplicitNoFit(qualification: LeadQualification) {
  return qualification.noRelevantService || serviceOptions.every(({ id }) => qualification.opportunities[id].status === 'not-fit')
}

function hasRecordedInteraction(qualification: LeadQualification) {
  return qualification.interestStatus !== 'no-response' && Boolean(qualification.interestEvidence.trim()) && Boolean(qualification.interestDate)
}

function hasClientConfirmedService(qualification: LeadQualification) {
  const confirmationStage = qualification.interestStatus === 'need-confirmed' || qualification.interestStatus === 'proposal-requested'
  return confirmationStage && hasRecordedInteraction(qualification) && serviceOptions.some(({ id }) => {
    const assessment = qualification.opportunities[id]
    return assessment.status !== 'not-fit' && assessment.clientConfirmed && Boolean(assessment.clientConfirmationNote.trim())
  })
}

function countDocumentedPublicSignals(qualification: LeadQualification) {
  return serviceOptions.filter(({ id }) => {
    const assessment = qualification.opportunities[id]
    return assessment.status === 'public-signal' && Boolean(assessment.evidenceNote.trim()) && isHttpUrl(assessment.evidenceSource.trim())
  }).length
}

function getDocumentedPublicSignalPoints(qualification: LeadQualification) {
  return Math.min(scoringWeights.maxPublicSignalPoints, countDocumentedPublicSignals(qualification) * scoringWeights.publicSignalPerService)
}

export function hasRelevantService(qualification: LeadQualification) {
  if (hasExplicitNoFit(qualification)) return false
  return countDocumentedPublicSignals(qualification) > 0 || hasClientConfirmedService(qualification)
}

export function getPublicScore(qualification: LeadQualification) {
  if (hasExplicitNoFit(qualification) || !hasRelevantService(qualification)) return 0

  const servicePoints = getDocumentedPublicSignalPoints(qualification)
  const identityPoints = qualification.identityStatus === 'confirmed' ? scoringWeights.identityConfirmed : 0
  const contactPoints = qualification.contactStatus === 'confirmed' && qualification.verifiedContactValue.trim() ? scoringWeights.contactConfirmed : 0
  const sourceAndNotePoints = isHttpUrl(qualification.verificationSourceUrl.trim()) && qualification.verificationNote.trim() ? scoringWeights.sourceAndNote : 0
  const datePoints = qualification.verificationDate ? scoringWeights.validationDate : 0
  return Math.min(scoringWeights.maxPublicScore, servicePoints + identityPoints + contactPoints + sourceAndNotePoints + datePoints)
}

export function getClientConfirmationBonus(qualification: LeadQualification) {
  if (hasExplicitNoFit(qualification) || !hasRelevantService(qualification) || !hasRecordedInteraction(qualification)) return 0
  if (qualification.interestStatus === 'responded') return 0
  if (qualification.interestStatus === 'need-confirmed' && hasClientConfirmedService(qualification)) return scoringWeights.confirmedNeed
  if (qualification.interestStatus === 'proposal-requested' && hasClientConfirmedService(qualification)) return scoringWeights.requestedProposal
  return 0
}

function confirmationDetail(qualification: LeadQualification) {
  if (qualification.interestStatus === 'no-response') return 'Sem bônus até registrar uma resposta do negócio.'
  if (!hasRecordedInteraction(qualification)) return 'Registre evidência e data da conversa para pontuar.'
  if (qualification.interestStatus === 'responded') return 'Resposta documentada: atualiza temperatura/taxa de resposta, mas não soma pontos de prioridade.'
  if (qualification.interestStatus === 'declined') return 'Recusa documentada: sem bônus de score; se a prospecção terminou, mova o lead para “Sem prioridade”.'
  if (!hasClientConfirmedService(qualification)) return 'Necessidade/proposta exige confirmação por serviço, nota específica, evidência da interação e data.'
  return qualification.interestStatus === 'need-confirmed'
    ? `Necessidade confirmada por serviço, com evidência e data: +${scoringWeights.confirmedNeed}.`
    : `Proposta/orçamento solicitado e documentado para um serviço: +${scoringWeights.requestedProposal}.`
}

export function getScoreBreakdown(qualification: LeadQualification): ScoreLine[] {
  const active = hasRelevantService(qualification) && !hasExplicitNoFit(qualification)
  const publicServicePoints = active ? getDocumentedPublicSignalPoints(qualification) : 0
  const identityPoints = active && qualification.identityStatus === 'confirmed' ? scoringWeights.identityConfirmed : 0
  const contactPoints = active && qualification.contactStatus === 'confirmed' && qualification.verifiedContactValue.trim() ? scoringWeights.contactConfirmed : 0
  const sourceAndNotePoints = active && isHttpUrl(qualification.verificationSourceUrl.trim()) && qualification.verificationNote.trim() ? scoringWeights.sourceAndNote : 0
  const datePoints = active && qualification.verificationDate ? scoringWeights.validationDate : 0
  const confirmationPoints = active ? getClientConfirmationBonus(qualification) : 0
  const pausedDetail = hasExplicitNoFit(qualification)
    ? 'Dados permanecem no CRM, mas não pontuam porque nenhum serviço se aplica.'
    : 'Ainda não há um serviço compatível com evidência suficiente para iniciar o score.'

  return [
    { label: 'Fase pública · sinais de serviço', points: publicServicePoints, detail: active ? `${scoringWeights.publicSignalPerService} por serviço com nota e URL próprias, limitados a ${scoringWeights.maxPublicSignalPoints} pontos entre as três ofertas. A ausência de um problema observável não é uma falha comprovada.` : pausedDetail },
    { label: 'Fase pública · identidade', points: identityPoints, detail: active ? `${scoringWeights.identityConfirmed} pontos quando a identidade do negócio é conferida.` : pausedDetail },
    { label: 'Fase pública · canal', points: contactPoints, detail: active ? `${scoringWeights.contactConfirmed} pontos quando o canal público e o valor estão conferidos.` : pausedDetail },
    { label: 'Fase pública · fonte e nota', points: sourceAndNotePoints, detail: active ? `${scoringWeights.sourceAndNote} pontos com URL HTTP(S) e nota de conferência.` : pausedDetail },
    { label: 'Fase pública · data', points: datePoints, detail: active ? `${scoringWeights.validationDate} pontos com data de conferência registrada.` : pausedDetail },
    { label: 'Fase cliente · confirmação', points: confirmationPoints, detail: active ? confirmationDetail(qualification) : pausedDetail },
  ]
}

export function getProspectingScore(qualification: LeadQualification): number | null {
  if (hasExplicitNoFit(qualification)) return 0
  if (!hasRelevantService(qualification)) return null
  const total = getPublicScore(qualification) + getClientConfirmationBonus(qualification)
  return Math.min(scoringWeights.maxTotalScore, total)
}

export function getScoreLabel(score: number | null) {
  if (score === null) return 'Ainda não avaliado'
  if (score === 0) return 'Sem serviço compatível'
  if (score < scoringWeights.mediumPotentialThreshold) return 'Baixa prioridade · evidência limitada'
  if (score < scoringWeights.highPriorityThreshold) return 'Potencial médio · confirme o encaixe'
  if (score < scoringWeights.veryHighPriorityThreshold) return 'Prioridade alta de pesquisa'
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
  return getPublicScore(qualification) >= scoringWeights.minimumPublicScoreToContact && hasRelevantService(qualification) &&
    qualification.identityStatus === 'confirmed' && qualification.contactStatus === 'confirmed' &&
    Boolean(qualification.verifiedContactValue.trim()) && isHttpUrl(qualification.verificationSourceUrl.trim()) &&
    Boolean(qualification.verificationNote.trim()) && Boolean(qualification.verificationDate)
}

export function getInterestTemperature(qualification: LeadQualification) {
  if (qualification.interestStatus === 'no-response') return { label: 'Frio · sem resposta registrada', className: 'cold' }
  if (!qualification.interestEvidence.trim() || !qualification.interestDate) return { label: 'Interação sem evidência/data', className: 'pending' }
  if (qualification.interestStatus === 'declined') return { label: 'Frio · recusou ou não há interesse', className: 'cold' }
  if (qualification.interestStatus === 'responded') return { label: 'Morno · respondeu', className: 'warm' }
  if (!hasClientConfirmedService(qualification)) return { label: 'Interação registrada · associe a um serviço', className: 'pending' }
  if (qualification.interestStatus === 'need-confirmed') return { label: 'Quente · necessidade confirmada', className: 'hot' }
  return { label: 'Quente · pediu proposta', className: 'hot' }
}
