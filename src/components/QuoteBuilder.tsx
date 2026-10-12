import { useState } from 'react'
import { BadgeCheck, CircleDollarSign, ExternalLink, FileText, ShieldCheck } from 'lucide-react'
import type { Lead } from '../data/leads'
import { getValidationLabel, type LeadQualification } from '../data/leadQualification'

type LeadReviewState = { qualification: LeadQualification } | undefined

const hostingMonthlyDefault = 23.99
const domainAnnualDefault = 40
const hostingSource = 'https://www.hostinger.com/br/hospedagem-de-sites'
const domainSource = 'https://registro.br/'

function parseAmount(value: string) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : 0
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)
}

export default function QuoteBuilder({ leads, leadState, onCopy }: { leads: Lead[]; leadState: Record<string, LeadReviewState>; onCopy: (text: string) => void }) {
  const [leadId, setLeadId] = useState('')
  const [scope, setScope] = useState('Landing page institucional responsiva, com informações do negócio e chamada para contato.')
  const [setupHours, setSetupHours] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [maintenanceHours, setMaintenanceHours] = useState('1')
  const [validityDays, setValidityDays] = useState('15')
  const [hostingMonthlyValue, setHostingMonthlyValue] = useState(String(hostingMonthlyDefault))
  const [domainAnnualValue, setDomainAnnualValue] = useState(String(domainAnnualDefault))
  const [generatedQuote, setGeneratedQuote] = useState('')

  const selectedLead = leads.find((lead) => lead.id === leadId)
  const qualification = selectedLead ? leadState[selectedLead.id]?.qualification : undefined
  const siteOpportunity = qualification?.opportunities.site
  const manuallyVerified = qualification !== undefined && getValidationLabel(qualification) === 'Conferido manualmente'
  const confirmedNeed = Boolean(
    siteOpportunity?.clientConfirmed
    && siteOpportunity.status !== 'not-fit'
    && siteOpportunity.clientConfirmationNote.trim()
    && (qualification?.interestStatus === 'need-confirmed' || qualification?.interestStatus === 'proposal-requested')
    && qualification.interestEvidence.trim()
    && qualification.interestDate,
  )
  const hours = parseAmount(setupHours)
  const rate = parseAmount(hourlyRate)
  const careHours = parseAmount(maintenanceHours)
  const validity = Number(validityDays)
  const setupPrice = hours * rate
  const maintenancePrice = careHours * rate
  const hostingMonthly = parseAmount(hostingMonthlyValue)
  const domainAnnual = parseAmount(domainAnnualValue)
  const recurringMonthly = maintenancePrice + hostingMonthly + domainAnnual / 12
  const canGenerate = Boolean(
    selectedLead
    && manuallyVerified
    && confirmedNeed
    && scope.trim()
    && hours > 0
    && rate > 0
    && careHours > 0
    && Number.isInteger(validity)
    && validity > 0,
  )
  const readinessMessage = !selectedLead
    ? 'Selecione o lead que recebeu a proposta.'
    : !manuallyVerified
      ? 'Para liberar, confira identidade e contato na ficha do lead.'
      : !confirmedNeed
        ? 'Para liberar, registre que o cliente confirmou a necessidade de site/landing page, com evidência e data da conversa.'
        : !canGenerate
          ? 'Preencha o escopo, as horas estimadas, sua taxa por hora e a validade para calcular os valores.'
          : 'Ficha, necessidade e valores revisados. Você pode gerar o rascunho para conferir antes de enviar.'

  function generateQuote() {
    if (!selectedLead || !qualification || !canGenerate) return
    const quote = [
      `PROPOSTA COMERCIAL · ${selectedLead.name}`,
      '',
      `Com base na necessidade confirmada em nossa conversa, proponho: ${scope.trim()}`,
      '',
      `Implantação (pagamento único): ${formatCurrency(setupPrice)} (${hours} horas estimadas × ${formatCurrency(rate)}/hora).`,
      `Manutenção técnica mensal: ${formatCurrency(maintenancePrice)} para até ${careHours} hora(s) de acompanhamento, dentro do escopo combinado. Demandas extras serão avaliadas e aprovadas antes de qualquer cobrança.`,
      '',
      'Custos de terceiros, pagos pelo cliente diretamente ao fornecedor:',
      `• Hospedagem: referência de ${formatCurrency(hostingMonthly)}/mês no valor de renovação consultado.`,
      `• Domínio .br: referência de ${formatCurrency(domainAnnual)}/ano.`,
      `• Estimativa mensal equivalente de hospedagem + domínio: ${formatCurrency(hostingMonthly + domainAnnual / 12)}. Confirme os preços e condições antes da contratação.`,
      '',
      `Validade desta proposta: ${validity} dias.`,
      'O início depende da aprovação do escopo, do acesso aos materiais necessários e da contratação dos serviços de terceiros em nome do cliente. Esta proposta não garante resultados comerciais.',
    ].join('\n')
    setGeneratedQuote(quote)
  }

  return (
    <section className="panel quote-builder">
      <div className="quote-heading">
        <div className="quote-icon"><CircleDollarSign size={19} /></div>
        <div>
          <h3>Orçamento para landing page/site institucional</h3>
          <p>Estime custos externos, mão de obra e manutenção. Gere o rascunho somente após conferir os dados e confirmar a necessidade com o cliente.</p>
        </div>
      </div>

      <div className="quote-costs">
        <article className="quote-cost-card">
          <span>Hospedagem · referência de renovação</span>
          <strong>{formatCurrency(hostingMonthly)}<small>/mês</small></strong>
          <label className="quote-cost-input">Atualizar valor mensal (R$)
            <input type="number" min="0" step="0.01" value={hostingMonthlyValue} onChange={(event) => { setHostingMonthlyValue(event.target.value); setGeneratedQuote('') }} />
          </label>
          <a href={hostingSource} target="_blank" rel="noreferrer">Hostinger · preço e condições atuais <ExternalLink size={12} /></a>
        </article>
        <article className="quote-cost-card">
          <span>Domínio .br · Registro.br</span>
          <strong>{formatCurrency(domainAnnual)}<small>/ano</small></strong>
          <label className="quote-cost-input">Atualizar valor anual (R$)
            <input type="number" min="0" step="0.01" value={domainAnnualValue} onChange={(event) => { setDomainAnnualValue(event.target.value); setGeneratedQuote('') }} />
          </label>
          <a href={domainSource} target="_blank" rel="noreferrer">Consultar valor oficial <ExternalLink size={12} /></a>
        </article>
        <article className="quote-cost-card quote-cost-total">
          <span>Custos externos estimados</span>
          <strong>{formatCurrency(hostingMonthly + domainAnnual / 12)}<small>/mês equivalente</small></strong>
          <small>Domínio convertido de valor anual; soma não inclui manutenção nem implantação.</small>
        </article>
      </div>
      <div className="quote-caution"><ShieldCheck size={15} /><span>Valores consultados em 12/10/2026 como referência. A hospedagem exibida é o valor de renovação do plano de entrada, não a promoção de contratação longa. Confira plano, prazo, impostos e domínio disponível antes de enviar.</span></div>

      <div className="quote-form">
        <label className="field-label">Cliente
          <select value={leadId} onChange={(event) => { setLeadId(event.target.value); setGeneratedQuote('') }}>
            <option value="">Selecione um lead</option>
            {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.name}</option>)}
          </select>
        </label>
        <label className="field-label quote-scope">Escopo confirmado com o cliente
          <textarea value={scope} onChange={(event) => { setScope(event.target.value); setGeneratedQuote('') }} rows={3} />
        </label>
        <label className="field-label">Horas estimadas para implantação
          <input type="number" min="0" step="0.5" value={setupHours} onChange={(event) => { setSetupHours(event.target.value); setGeneratedQuote('') }} placeholder="Preencha após avaliar o escopo" />
        </label>
        <label className="field-label">Sua taxa por hora (R$)
          <input type="number" min="0" step="0.01" value={hourlyRate} onChange={(event) => { setHourlyRate(event.target.value); setGeneratedQuote('') }} placeholder="Defina sua taxa" />
        </label>
        <label className="field-label">Horas incluídas na manutenção mensal
          <input type="number" min="0" step="0.5" value={maintenanceHours} onChange={(event) => { setMaintenanceHours(event.target.value); setGeneratedQuote('') }} />
        </label>
        <label className="field-label">Validade da proposta (dias)
          <input type="number" min="1" step="1" value={validityDays} onChange={(event) => { setValidityDays(event.target.value); setGeneratedQuote('') }} />
        </label>
      </div>

      <div className="quote-estimate" aria-live="polite">
        <span>Implantação sugerida <strong>{formatCurrency(setupPrice)}</strong></span>
        <span>Manutenção mensal sugerida <strong>{formatCurrency(maintenancePrice)}</strong></span>
        <span>Recorrência estimada total <strong>{formatCurrency(recurringMonthly)}/mês</strong></span>
      </div>
      <p className="quote-formula">Regra inicial: implantação = horas estimadas × sua taxa; manutenção = horas mensais combinadas × sua taxa. Custos de hospedagem e domínio ficam separados e, de preferência, contratados em nome do cliente. A manutenção não tem preço universal: defina as tarefas e limites antes de fechar o valor.</p>

      <div className={`quote-readiness ${canGenerate ? 'quote-ready' : ''}`} aria-live="polite">
        {canGenerate ? <BadgeCheck size={16} /> : <ShieldCheck size={16} />}
        <span>{readinessMessage}</span>
      </div>

      <div className="quote-actions">
        <button className="button-primary" type="button" disabled={!canGenerate} onClick={generateQuote}><FileText size={15} /> Gerar rascunho da proposta</button>
        {generatedQuote && <button className="button-outline" type="button" onClick={() => onCopy(generatedQuote)}>Copiar proposta para revisar</button>}
      </div>
      {generatedQuote && <pre className="quote-preview">{generatedQuote}</pre>}
    </section>
  )
}
