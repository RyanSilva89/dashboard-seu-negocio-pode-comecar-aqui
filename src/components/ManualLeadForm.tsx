import { useState, type FormEvent } from 'react'
import { Plus, UserRoundPlus, X } from 'lucide-react'
import type { Lead } from '../data/leads'

function normalizeInstagram(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return ''
  const handle = trimmed.startsWith('@') ? trimmed.slice(1) : trimmed
  if (/^[\w.]+$/.test(handle)) return `https://www.instagram.com/${handle}/`
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    const host = url.hostname.toLocaleLowerCase('en-US')
    if ((host !== 'instagram.com' && !host.endsWith('.instagram.com')) || !['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

export default function ManualLeadForm({ onAdd, onCancel }: { onAdd: (lead: Lead) => boolean; onCancel: () => void }) {
  const [error, setError] = useState('')

  function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const name = String(formData.get('name') ?? '').trim()
    const city = String(formData.get('city') ?? '').trim()
    const niche = String(formData.get('niche') ?? '').trim()
    const instagramInput = String(formData.get('instagram') ?? '').trim()
    const instagram = normalizeInstagram(instagramInput)
    const website = String(formData.get('website') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    const observation = String(formData.get('observation') ?? '').trim()
    setError('')
    if (!name || !city || !niche) {
      setError('Preencha o nome do negócio, a cidade e o nicho.')
      return
    }
    if (instagram === null) {
      setError('Informe um usuário do Instagram ou um link válido de instagram.com.')
      return
    }
    const createdAt = new Date().toLocaleDateString('pt-BR')
    const id = `manual-${crypto.randomUUID()}`
    const evidence = [`Lead cadastrado manualmente em ${createdAt}; dados ainda não verificados independentemente.`]
    if (observation) evidence.push(`Observação registrada pelo usuário: ${observation}`)

    const lead: Lead = {
      id,
      name,
      specialty: niche,
      address: `${city} · endereço não informado`,
      contacts: [
        ...(phone ? [{ label: 'WhatsApp / telefone informado', value: phone, type: 'manual' as const }] : []),
        ...(instagram ? [{ label: 'Instagram informado', value: instagram, type: 'manual' as const }] : []),
      ],
      website: website || null,
      websiteStatus: website ? 'URL informada · não verificada' : 'Não localizado nas fontes consultadas',
      city,
      niche,
      instagram: instagram || undefined,
      services: niche,
      scheduling: 'Atendimento e agendamento ainda não verificados.',
      evidence,
      offer: 'Validar em conversa se há interesse em melhorar a presença online ou o atendimento a novos clientes.',
      priority: 'Baixa provisória',
      priorityReason: 'Lead cadastrado manualmente; prioridade depende de validação e conversa de descoberta.',
      confidence: 'Dados informados pelo usuário; não foram verificados de forma independente.',
      sources: instagram ? [{ label: 'Perfil do Instagram informado pelo usuário', url: instagram, supports: 'Link registrado manualmente; conteúdo do perfil e do anúncio não foi extraído nem verificado.' }] : [],
      origin: 'manual',
      importedAt: createdAt,
    }

    if (!onAdd(lead)) return
    form.reset()
    setError('')
    onCancel()
  }

  return (
    <section className="panel manual-lead-panel" aria-labelledby="manual-lead-title">
      <div className="manual-lead-heading">
        <div className="quote-icon"><UserRoundPlus size={19} /></div>
        <div>
          <h2 id="manual-lead-title">Cadastrar lead manualmente</h2>
          <p>Registre um negócio encontrado em redes sociais ou por indicação. Os dados ficam neste navegador e começam como não verificados.</p>
        </div>
        <button className="icon-button" type="button" onClick={onCancel} aria-label="Fechar cadastro manual"><X size={18} /></button>
      </div>
      <form className="manual-lead-form" onSubmit={submitLead}>
        <label className="field-label">Nome do negócio
          <input name="name" required maxLength={120} autoFocus placeholder="Ex.: Studio Ana" />
        </label>
        <label className="field-label">Cidade
          <input name="city" required maxLength={100} placeholder="Ex.: Campinas, SP" />
        </label>
        <label className="field-label">Nicho
          <input name="niche" required maxLength={100} placeholder="Ex.: Estética" />
        </label>
        <label className="field-label">Instagram (perfil ou @usuário)
          <input name="instagram" type="text" maxLength={300} placeholder="@perfil ou link do anúncio/perfil" />
        </label>
        <label className="field-label">WhatsApp / telefone (opcional)
          <input name="phone" type="tel" maxLength={80} placeholder="Número público, se disponível" />
        </label>
        <label className="field-label">Site (opcional)
          <input name="website" type="url" maxLength={300} placeholder="https://..." />
        </label>
        <label className="field-label manual-lead-observation">O que você observou? (opcional)
          <textarea name="observation" maxLength={1000} rows={3} placeholder="Ex.: publicou um anúncio; não localizei site nem mensagem introdutória automática no WhatsApp." />
        </label>
        <p className="manual-lead-note">Não registre dados sensíveis. Uma observação sua é apenas uma hipótese, não confirmação de necessidade do cliente.</p>
        {error && <p className="manual-lead-error" role="alert">{error}</p>}
        <div className="manual-lead-actions">
          <button className="button-outline" type="button" onClick={onCancel}>Cancelar</button>
          <button className="button-primary" type="submit"><Plus size={15} /> Salvar lead</button>
        </div>
      </form>
    </section>
  )
}
