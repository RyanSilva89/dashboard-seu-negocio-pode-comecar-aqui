import { BadgeCheck, CalendarClock, CircleAlert, ShieldCheck, Target } from 'lucide-react'
import {
  canMarkReadyForContact,
  getInterestTemperature,
  getProspectingScore,
  getScoreBreakdown,
  getScoreLabel,
  getValidationLabel,
  isHttpUrl,
  serviceOptions,
  type CheckStatus,
  type InterestStatus,
  type LeadQualification,
  type OpportunityStatus,
  type ServiceId,
} from '../data/leadQualification'
import type { Lead } from '../data/leads'

type Props = {
  lead: Lead
  qualification: LeadQualification
  onChange: (updates: Partial<LeadQualification>) => void
  onMarkReady: () => void
}

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function formatDate(value: string) {
  if (!value) return 'Ainda não registrada'
  const [year, month, day] = value.split('-').map(Number)
  return year && month && day ? new Date(year, month - 1, day).toLocaleDateString('pt-BR') : value
}

function defaultContact(lead: Lead) {
  return lead.contacts.find((contact) => /whatsapp/i.test(contact.label))?.value ??
    lead.contacts.find((contact) => /telefone|celular/i.test(contact.label))?.value ?? ''
}

function defaultSource(lead: Lead) {
  return lead.instagram || lead.sources.find((source) => source.url)?.url || lead.website || ''
}

const statusLabels: Record<CheckStatus, string> = {
  'not-checked': 'Ainda não conferido',
  confirmed: 'Confere com o negócio',
  mismatch: 'Encontrei divergência',
}

export default function LeadQualificationPanel({ lead, qualification, onChange, onMarkReady }: Props) {
  const score = getProspectingScore(qualification)
  const scoreBreakdown = getScoreBreakdown(qualification)
  const validationLabel = getValidationLabel(qualification)
  const ready = canMarkReadyForContact(qualification)
  const temperature = getInterestTemperature(qualification)
  const originalContact = defaultContact(lead)
  const originalSource = defaultSource(lead)

  function updateOpportunity(id: ServiceId, updates: { status?: OpportunityStatus; evidenceNote?: string; evidenceSource?: string }) {
    const current = qualification.opportunities[id]
    onChange({
      noRelevantService: false,
      opportunities: {
        ...qualification.opportunities,
        [id]: { ...current, ...updates },
      },
    })
  }

  function updateCheck(field: 'identityStatus' | 'contactStatus', value: CheckStatus) {
    const updates: Partial<LeadQualification> = { [field]: value }
    if (field === 'contactStatus' && value === 'confirmed' && !qualification.verifiedContactValue.trim() && originalContact) {
      updates.verifiedContactValue = originalContact
    }
    onChange(updates)
  }

  function setNoFit(checked: boolean) {
    onChange({ noRelevantService: checked })
  }

  return (
    <section className="detail-section qualification-section">
      <div className="detail-section-heading">
        <h3>Validar dados e potencial</h3>
        <span className={`validation-badge ${validationLabel === 'Conferido manualmente' ? 'verified' : validationLabel === 'Divergência encontrada' ? 'mismatch' : 'pending'}`}>{validationLabel}</span>
      </div>
      <p className="qualification-intro">Confira o perfil, registre onde viu cada informação e só então avalie se um serviço seu pode fazer sentido. Tudo fica salvo neste navegador.</p>

      <div className={`qualification-score ${score !== null && score >= 50 ? 'score-qualifies' : ''}`}>
        <div className="qualification-score-top">
          <div><span className="qualification-kicker"><Target size={13} /> PRIORIDADE DE PROSPECÇÃO</span><strong>{score === null ? '—' : score}<small>{score === null ? '' : ' / 100'}</small></strong><span className="qualification-score-label">{getScoreLabel(score)}</span></div>
          <div className="qualification-score-mark"><ShieldCheck size={20} /></div>
        </div>
        <div className="qualification-score-track"><span style={{ width: `${score ?? 0}%` }} /></div>
        <ul className="score-breakdown">{scoreBreakdown.map((line) => <li key={line.label}><span title={line.detail}>{line.label}</span><strong>{line.points ? `+${line.points}` : '0'}</strong></li>)}</ul>
        <p className="score-explanation">0 aparece quando você marca “nenhum serviço” ou “Não se aplica” nos três. A partir de 50, revise e confirme o encaixe. O score prioriza investigação; não é probabilidade de compra.</p>
      </div>

      <div className="validation-subheading"><strong>1. Conferir identidade e contato</strong><span>Use um canal público do próprio negócio.</span></div>
      <label className="field-label">O perfil corresponde a este negócio?
        <select value={qualification.identityStatus} onChange={(event) => updateCheck('identityStatus', event.target.value as CheckStatus)}>
          {(Object.entries(statusLabels) as [CheckStatus, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="field-label">Situação do WhatsApp / contato
        <select value={qualification.contactStatus} onChange={(event) => updateCheck('contactStatus', event.target.value as CheckStatus)}>
          {(Object.entries(statusLabels) as [CheckStatus, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <div className="qualification-input-row">
        <label className="field-label">Canal<select value={qualification.verifiedContactType} onChange={(event) => onChange({ verifiedContactType: event.target.value })}><option>WhatsApp</option><option>Telefone</option><option>E-mail</option><option>Instagram</option></select></label>
        <label className="field-label">Contato conferido<input value={qualification.verifiedContactValue} onChange={(event) => onChange({ verifiedContactValue: event.target.value })} placeholder={originalContact || 'Digite o contato público'} /></label>
      </div>
      <label className="field-label">URL exata onde você conferiu<input type="url" value={qualification.verificationSourceUrl} onChange={(event) => onChange({ verificationSourceUrl: event.target.value })} placeholder={originalSource || 'https://...'} /></label>
      {originalSource && !qualification.verificationSourceUrl && <button className="source-prefill" type="button" onClick={() => onChange({ verificationSourceUrl: originalSource })}>Usar uma fonte já cadastrada nesta ficha</button>}
      <label className="field-label">O que você confirmou?<textarea value={qualification.verificationNote} onChange={(event) => onChange({ verificationNote: event.target.value })} placeholder="Ex.: perfil oficial do negócio; WhatsApp publicado na bio corresponde ao contato da ficha." rows={2} /></label>
      <div className="verification-register-row"><button className="button-outline" type="button" disabled={!isHttpUrl(qualification.verificationSourceUrl.trim()) || !qualification.verificationNote.trim()} onClick={() => onChange({ verificationDate: localToday() })}><CalendarClock size={14} /> Registrar conferência de hoje</button><span>Última conferência: {formatDate(qualification.verificationDate)}</span></div>

      <div className="validation-subheading"><strong>2. Marcar encaixe de serviço</strong><span>“Sinal público” é hipótese; “confirmado” exige conversa com o negócio.</span></div>
      {serviceOptions.map(({ id, label }) => {
        const assessment = qualification.opportunities[id]
        return <div className="opportunity-assessment" key={id}>
          <label className="field-label">{label}
            <select value={qualification.noRelevantService ? 'not-fit' : assessment.status} disabled={qualification.noRelevantService} onChange={(event) => updateOpportunity(id, { status: event.target.value as OpportunityStatus })}>
              <option value="not-assessed">Ainda não avaliado</option>
              <option value="public-signal">Sinal público observado · hipótese</option>
              <option value="client-confirmed">Necessidade confirmada pelo negócio</option>
              <option value="not-fit">Não se aplica</option>
            </select>
          </label>
          {assessment.status === 'public-signal' && !qualification.noRelevantService && <div className="qualification-input-row">
            <label className="field-label">Evidência observável<textarea value={assessment.evidenceNote} onChange={(event) => updateOpportunity(id, { evidenceNote: event.target.value })} placeholder="Descreva o sinal sem chamar de falha." rows={2} /></label>
            <label className="field-label">Fonte do sinal (URL)<input type="url" value={assessment.evidenceSource} onChange={(event) => updateOpportunity(id, { evidenceSource: event.target.value })} placeholder="https://..." /></label>
          </div>}
          {assessment.status === 'client-confirmed' && !qualification.noRelevantService && <label className="field-label">O que o negócio confirmou?
            <textarea value={assessment.evidenceNote} onChange={(event) => updateOpportunity(id, { evidenceNote: event.target.value })} placeholder="Registre a necessidade nas palavras do responsável, sem dados sensíveis." rows={2} />
          </label>}
          {assessment.status === 'client-confirmed' && !qualification.noRelevantService && <small className="field-footnote">Para contar no score, registre abaixo a necessidade confirmada, a evidência e a data da interação.</small>}
        </div>
      })}
      <label className="no-fit-control"><input type="checkbox" checked={qualification.noRelevantService} onChange={(event) => setNoFit(event.target.checked)} /><span>Revisei os serviços e nenhum se aplica — score 0</span></label>
      <small className="field-footnote">Marcar “Não se aplica” nos três serviços também resulta em 0; deixe “Ainda não avaliado” enquanto não tiver revisado.</small>

      <div className="validation-subheading"><strong>3. Próximo passo e interesse</strong><span>Temperatura depende de interação, nunca somente da pontuação.</span></div>
      <label className="field-label">Próxima ação<input value={qualification.nextAction} onChange={(event) => onChange({ nextAction: event.target.value })} placeholder="Ex.: preparar abordagem sobre o fluxo de orçamento" /></label>
      <label className="field-label">Data da próxima ação<input type="date" value={qualification.nextActionDate} onChange={(event) => onChange({ nextActionDate: event.target.value })} /></label>
      <label className="field-label">Sinal de interesse registrado
        <select value={qualification.interestStatus} onChange={(event) => onChange({ interestStatus: event.target.value as InterestStatus })}>
          <option value="no-response">Frio · ainda sem resposta</option>
          <option value="responded">Morno · respondeu, necessidade em avaliação</option>
          <option value="need-confirmed">Quente · confirmou necessidade</option>
          <option value="proposal-requested">Quente · pediu proposta/orçamento</option>
        </select>
      </label>
      {qualification.interestStatus !== 'no-response' && <>
        <label className="field-label">Evidência da interação<textarea value={qualification.interestEvidence} onChange={(event) => onChange({ interestEvidence: event.target.value })} placeholder="Ex.: conversa em que o responsável descreveu o processo atual; não inclua dados sensíveis." rows={2} /></label>
        <label className="field-label">Data da interação<input type="date" value={qualification.interestDate} onChange={(event) => onChange({ interestDate: event.target.value })} /></label>
      </>}
      <div className={`temperature-banner ${temperature.className}`}><CircleAlert size={15} /><span><strong>{temperature.label}</strong><small>Registre apenas o que ocorreu; o score não altera essa temperatura.</small></span></div>

      <div className="ready-gate">
        <button className="button-primary" type="button" disabled={!ready} onClick={onMarkReady}><BadgeCheck size={15} /> Marcar “Pronto para contato”</button>
        <p>{ready ? 'Dados e encaixe atendem aos critérios mínimos. Revise sua mensagem antes de qualquer abordagem.' : 'Para liberar: pelo menos um serviço com evidência, score ≥ 50, identidade e contato confirmados, fonte válida, nota e data da conferência.'}</p>
      </div>
    </section>
  )
}
