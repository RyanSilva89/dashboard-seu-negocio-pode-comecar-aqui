import { BadgeCheck, CalendarClock, CircleAlert, ClipboardCheck, ShieldCheck, Target } from 'lucide-react'
import {
  canMarkReadyForContact,
  getClientConfirmationBonus,
  getInterestTemperature,
  getProspectingScore,
  getPublicScore,
  getScoreBreakdown,
  getScoreLabel,
  getValidationLabel,
  isHttpUrl,
  scoringWeights,
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
  contactMade: boolean
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
  confirmed: 'Conferido em fonte pública',
  mismatch: 'Encontrei divergência',
  'access-restricted': 'Acesso restrito · exige login',
}

export default function LeadQualificationPanel({ lead, qualification, contactMade, onChange, onMarkReady }: Props) {
  const score = getProspectingScore(qualification)
  const publicScore = getPublicScore(qualification)
  const confirmationBonus = getClientConfirmationBonus(qualification)
  const scoreBreakdown = getScoreBreakdown(qualification)
  const validationLabel = getValidationLabel(qualification)
  const ready = canMarkReadyForContact(qualification)
  const accessRestricted = qualification.identityStatus === 'access-restricted' || qualification.contactStatus === 'access-restricted'
  const showInterestTracking = contactMade || qualification.interestStatus !== 'no-response' || Boolean(qualification.interestEvidence.trim() || qualification.interestDate)
  const temperature = getInterestTemperature(qualification)
  const originalContact = defaultContact(lead)
  const originalSource = defaultSource(lead)

  function updateOpportunity(id: ServiceId, updates: {
    status?: OpportunityStatus
    evidenceNote?: string
    evidenceSource?: string
    clientConfirmed?: boolean
    clientConfirmationNote?: string
  }) {
    const current = qualification.opportunities[id]
    const next = { ...current, ...updates }
    if (updates.status === 'not-fit') {
      next.clientConfirmed = false
      next.clientConfirmationNote = ''
    }
    if (updates.clientConfirmed === true && next.status === 'not-fit') next.status = 'not-assessed'
    if (updates.clientConfirmed === false) next.clientConfirmationNote = ''
    onChange({
      noRelevantService: false,
      opportunities: {
        ...qualification.opportunities,
        [id]: next,
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
      <p className="qualification-intro">A fase pública pode ser concluída sem falar com o negócio: confira identidade e contato em fonte pública oficial, registre URL, nota e data. Se não puder consultar a fonte ou só o responsável puder confirmar, deixe pendente. Tudo fica salvo neste navegador.</p>
      <details className="quick-validation-checklist">
        <summary><ClipboardCheck size={15} /><span><strong>Checklist rápido de conferência</strong><small>Identidade, canal, fonte e decisão segura</small></span></summary>
        <div className="quick-validation-body">
          <ol>
            <li>Confirme que o perfil pertence ao negócio e que nome/localidade combinam com outra fonte própria.</li>
            <li>Confira se telefone ou WhatsApp está publicado no perfil/site oficial; copie o canal exato, sem presumir que pertence à empresa.</li>
            <li>Registre URL exata, data e o que observou, sem dados sensíveis.</li>
            <li>Marque a necessidade como hipótese observável; “confirmada” só depois de conversa documentada, em campo separado do sinal público.</li>
            <li>Se login impedir a leitura, marque “Acesso restrito · exige login” e mantenha a ficha pendente.</li>
          </ol>
          <a href="/checklist-verificacao-manual-perfis.md" download>Baixar modelo preenchível em Markdown</a>
        </div>
      </details>

      <div className={`qualification-score ${ready ? 'score-qualifies' : ''}`}>
        <div className="qualification-score-top">
          <div><span className="qualification-kicker"><Target size={13} /> PRIORIDADE DE PROSPECÇÃO</span><strong>{score === null ? '—' : score}<small>{score === null ? '' : ' / 100'}</small></strong><span className="qualification-score-label">{getScoreLabel(score)}</span></div>
          <div className="qualification-score-mark"><ShieldCheck size={20} /></div>
        </div>
        <div className="qualification-score-track"><span style={{ width: `${score ?? 0}%` }} /></div>
        <div className="score-phase-summary" aria-label="Composição do score">
          <span>Fase pública <strong>{score === null ? '—' : `${publicScore}/${scoringWeights.maxPublicScore}`}</strong></span>
          <span>Fase cliente <strong>{score === null ? '—' : `+${confirmationBonus}/${scoringWeights.maxClientBonus}`}</strong></span>
        </div>
        <ul className="score-breakdown">{scoreBreakdown.map((line) => <li key={line.label}><span title={line.detail}>{line.label}</span><strong>{line.points ? `+${line.points}` : '0'}</strong></li>)}</ul>
        <p className="score-explanation">Até {scoringWeights.maxPublicScore} pontos vêm da análise pública: {scoringWeights.publicSignalPerService} por serviço com fonte e nota, limitados a {scoringWeights.maxPublicSignalPoints}, além da conferência de identidade, contato, fonte e data. Exemplo sem conversar: 1 sinal público (+{scoringWeights.publicSignalPerService}) + identidade (+{scoringWeights.identityConfirmed}) + contato publicado (+{scoringWeights.contactConfirmed}) + fonte/nota (+{scoringWeights.sourceAndNote}) = {scoringWeights.minimumPublicScoreToContact}; registrar a data acrescenta mais {scoringWeights.validationDate} pontos. Resposta simples atualiza temperatura e taxa de resposta, mas não soma pontos. Necessidade confirmada acrescenta {scoringWeights.confirmedNeed}; proposta solicitada acrescenta {scoringWeights.requestedProposal}, até {scoringWeights.maxClientBonus}, com evidência e data. A confirmação não substitui nem sobrescreve a evidência pública. Para o primeiro contato, exige-se score público ≥ {scoringWeights.minimumPublicScoreToContact}, identidade e contato confirmados, URL e nota válidas e um serviço compatível; a data da conferência é recomendada e soma pontos, mas não bloqueia a liberação. Bônus pós-conversa não liberam abordagem retroativamente. Score não é probabilidade de compra.</p>
      </div>

      <div className="validation-subheading"><strong>1. Conferir identidade e contato</strong><span>Sem mensagem ou ligação: use o perfil/site oficial.</span></div>
      <label className="field-label">Nome, perfil e localidade correspondem a este negócio?
        <select value={qualification.identityStatus} onChange={(event) => updateCheck('identityStatus', event.target.value as CheckStatus)}>
          {(Object.entries(statusLabels) as [CheckStatus, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label className="field-label">Situação do WhatsApp / contato
        <select value={qualification.contactStatus} onChange={(event) => updateCheck('contactStatus', event.target.value as CheckStatus)}>
          {(Object.entries(statusLabels) as [CheckStatus, string][]).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <small className="field-footnote">“Conferido” aqui significa que o canal está publicado em perfil/site oficial — não que você já falou com o responsável.</small>
      <div className="qualification-input-row">
        <label className="field-label">Canal<select value={qualification.verifiedContactType} onChange={(event) => onChange({ verifiedContactType: event.target.value })}><option>WhatsApp</option><option>Telefone</option><option>E-mail</option><option>Instagram</option></select></label>
        <label className="field-label">Contato conferido<input value={qualification.verifiedContactValue} onChange={(event) => onChange({ verifiedContactValue: event.target.value })} placeholder={originalContact || 'Digite o contato público'} /></label>
      </div>
      <label className="field-label">URL exata onde você conferiu<input type="url" value={qualification.verificationSourceUrl} onChange={(event) => onChange({ verificationSourceUrl: event.target.value })} placeholder={originalSource || 'https://...'} /></label>
      {originalSource && !qualification.verificationSourceUrl && <button className="source-prefill" type="button" onClick={() => onChange({ verificationSourceUrl: originalSource })}>Usar uma fonte já cadastrada nesta ficha</button>}
      <label className="field-label">O que você confirmou?<textarea value={qualification.verificationNote} onChange={(event) => onChange({ verificationNote: event.target.value })} placeholder="Ex.: perfil oficial do negócio; WhatsApp publicado na bio corresponde ao contato da ficha." rows={2} /></label>
      <div className="verification-register-row"><button className="button-outline" type="button" disabled={!isHttpUrl(qualification.verificationSourceUrl.trim()) || !qualification.verificationNote.trim()} onClick={() => onChange({ verificationDate: localToday() })}><CalendarClock size={14} /> Registrar conferência de hoje</button><span>Última conferência: {formatDate(qualification.verificationDate)}</span></div>

      <div className="validation-subheading"><strong>2. Marcar sinais públicos de serviço</strong><span>Um sinal observável é uma hipótese, não uma falha nem uma necessidade confirmada.</span></div>
      {serviceOptions.map(({ id, label }) => {
        const assessment = qualification.opportunities[id]
        return <div className="opportunity-assessment" key={id}>
          <label className="field-label">{label}
            <select value={qualification.noRelevantService ? 'not-fit' : assessment.status} disabled={qualification.noRelevantService} onChange={(event) => updateOpportunity(id, { status: event.target.value as OpportunityStatus })}>
              <option value="not-assessed">Ainda não avaliado</option>
              <option value="public-signal">Sinal público observado · hipótese</option>
              <option value="not-fit">Não se aplica</option>
            </select>
          </label>
          {assessment.status === 'public-signal' && !qualification.noRelevantService && <div className="qualification-input-row">
            <label className="field-label">Evidência pública observável<textarea value={assessment.evidenceNote} onChange={(event) => updateOpportunity(id, { evidenceNote: event.target.value })} placeholder="Descreva o sinal sem chamar de falha ou presumir necessidade." rows={2} /></label>
            <label className="field-label">Fonte do sinal (URL)<input type="url" value={assessment.evidenceSource} onChange={(event) => updateOpportunity(id, { evidenceSource: event.target.value })} placeholder="https://..." /></label>
          </div>}
          {!qualification.noRelevantService && <>
            <label className="client-confirmation-control"><input type="checkbox" checked={assessment.clientConfirmed} disabled={assessment.status === 'not-fit'} onChange={(event) => updateOpportunity(id, { clientConfirmed: event.target.checked })} /><span>O negócio confirmou a necessidade deste serviço?</span></label>
            {assessment.clientConfirmed && <>
              <label className="field-label">O que confirmou para este serviço?<textarea value={assessment.clientConfirmationNote} onChange={(event) => updateOpportunity(id, { clientConfirmationNote: event.target.value })} placeholder="Resumo objetivo do que o responsável confirmou, sem dados sensíveis." rows={2} /></label>
              <small className="field-footnote">A confirmação fica separada do sinal público e só soma quando a interação correspondente tem evidência e data.</small>
            </>}
          </>}
        </div>
      })}
      <label className="no-fit-control"><input type="checkbox" checked={qualification.noRelevantService} onChange={(event) => setNoFit(event.target.checked)} /><span>Revisei os serviços e nenhum se aplica — score 0</span></label>
      <small className="field-footnote">Marcar “Não se aplica” nos três serviços também resulta em 0; deixe “Ainda não avaliado” enquanto não tiver revisado.</small>

      <div className="validation-subheading"><strong>3. Próximo passo</strong><span>Organize a tarefa sem alterar o score do lead.</span></div>
      <label className="field-label">Próxima ação<input value={qualification.nextAction} onChange={(event) => onChange({ nextAction: event.target.value })} placeholder="Ex.: preparar abordagem sobre o fluxo de orçamento" /></label>
      <small className="field-footnote">A próxima ação ajuda a organizar o trabalho, mas não aumenta o score do lead.</small>
      <label className="field-label">Data da próxima ação<input type="date" value={qualification.nextActionDate} onChange={(event) => onChange({ nextActionDate: event.target.value })} /></label>
      {showInterestTracking ? <>
        <div className="validation-subheading"><strong>4. Resposta e sinal de interesse</strong><span>Opcional · registre somente após o contato.</span></div>
        <label className="field-label">Sinal de interesse registrado
          <select value={qualification.interestStatus} onChange={(event) => onChange({ interestStatus: event.target.value as InterestStatus })}>
            <option value="no-response">Frio · ainda sem resposta</option>
            <option value="responded">Morno · respondeu, necessidade em avaliação</option>
            <option value="declined">Frio · recusou / sem interesse</option>
            <option value="need-confirmed">Quente · confirmou necessidade</option>
            <option value="proposal-requested">Quente · pediu proposta/orçamento</option>
          </select>
        </label>
        <small className="field-footnote">O registro é opcional e não bloqueia etapas do pipeline. Resposta simples soma 0; necessidade ou proposta só pontua quando vinculada a um serviço e documentada. Recusa não é “morno”; se encerrar, mova para “Sem prioridade”.</small>
        {qualification.interestStatus !== 'no-response' && <>
          <label className="field-label">Evidência da interação<textarea value={qualification.interestEvidence} onChange={(event) => onChange({ interestEvidence: event.target.value })} placeholder="Ex.: conversa em que o responsável descreveu o processo atual; não inclua dados sensíveis." rows={2} /></label>
          <label className="field-label">Data da interação<input type="date" value={qualification.interestDate} onChange={(event) => onChange({ interestDate: event.target.value })} /></label>
        </>}
        <div className={`temperature-banner ${temperature.className}`}><CircleAlert size={15} /><span><strong>{temperature.label}</strong><small>Registre apenas o que ocorreu; o score não altera essa temperatura.</small></span></div>
      </> : <p className="field-footnote">O registro de resposta e interesse ficará disponível após mover o lead para “Contato feito”. Não é obrigatório para liberar ou registrar o primeiro contato.</p>}

      <div className="ready-gate">
        <button className="button-primary" type="button" disabled={!ready} onClick={onMarkReady}><BadgeCheck size={15} /> Marcar “Pronto para contato”</button>
        <p>{ready ? 'Dados e score público atendem aos critérios mínimos. A data da conferência é recomendada e adiciona pontos; revise sua mensagem antes de qualquer abordagem.' : accessRestricted ? 'O acesso está restrito. Não considere os dados confirmados nem avance para contato até conseguir revisar uma fonte válida.' : `Para liberar: score público ≥ ${scoringWeights.minimumPublicScoreToContact}, um serviço compatível, identidade e contato confirmados, URL e nota válidas. Registrar a data é recomendado, mas não obrigatório para liberar.`}</p>
      </div>
    </section>
  )
}
