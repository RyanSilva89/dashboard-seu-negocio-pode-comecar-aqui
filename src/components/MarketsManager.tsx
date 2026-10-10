import { useState, type ComponentType, type FormEvent } from 'react'
import { ArrowRight, MapPin, ShieldCheck, Tags, X } from 'lucide-react'
import type { Lead } from '../data/leads'
import { leadMatchesCity, leadMatchesNiche } from '../data/targets'

type Props = {
  cities: string[]
  niches: string[]
  leads: Lead[]
  onAddCity: (value: string) => boolean
  onAddNiche: (value: string) => boolean
  onRemoveCity: (value: string) => void
  onRemoveNiche: (value: string) => void
  onSelectCity: (value: string) => void
  onSelectNiche: (value: string) => void
}

type IconType = ComponentType<{ size?: number; strokeWidth?: number; className?: string }>

type TargetEditorProps = {
  title: string
  kind: 'city' | 'niche'
  items: string[]
  leads: Lead[]
  icon: IconType
  onAdd: (value: string) => boolean
  onRemove: (value: string) => void
  onSelect: (value: string) => void
}

export default function MarketsManager({ cities, niches, leads, onAddCity, onAddNiche, onRemoveCity, onRemoveNiche, onSelectCity, onSelectNiche }: Props) {
  return (
    <>
      <div className="market-note"><ShieldCheck size={17} /><div><strong>Defina seus próximos mercados</strong><span>Os alvos ficam salvos neste navegador. Adicionar uma cidade ou nicho não pesquisa nem cria leads automaticamente; a busca pública ainda depende de conectar uma fonte de dados. Remover um alvo também não apaga fichas já cadastradas.</span></div></div>
      <div className="market-grid">
        <TargetEditor title="Cidades" kind="city" items={cities} leads={leads} icon={MapPin} onAdd={onAddCity} onRemove={onRemoveCity} onSelect={onSelectCity} />
        <TargetEditor title="Nichos" kind="niche" items={niches} leads={leads} icon={Tags} onAdd={onAddNiche} onRemove={onRemoveNiche} onSelect={onSelectNiche} />
      </div>
      <div className="data-note"><ShieldCheck size={16} /><span>Selecione a seta ao lado de uma cidade ou nicho para abrir os leads desse recorte. As fichas pesquisadas e as importadas são identificadas separadamente; alvos sem registros mostram zero leads.</span></div>
    </>
  )
}

function TargetEditor({ title, kind, items, leads, icon: Icon, onAdd, onRemove, onSelect }: TargetEditorProps) {
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const isCity = kind === 'city'
  const label = isCity ? 'cidade' : 'nicho'

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = draft.trim()
    if (!value) return
    if (!onAdd(value)) {
      setMessage(`“${value}” já está na lista.`)
      return
    }
    setDraft('')
    setMessage(isCity ? 'Cidade adicionada.' : 'Nicho adicionado.')
  }

  function countMatches(value: string) {
    return leads.filter((lead) => isCity ? leadMatchesCity(lead, value) : leadMatchesNiche(lead, value)).length
  }

  return (
    <section className="panel market-card">
      <div className="market-card-heading"><div className={`market-icon ${isCity ? 'city' : 'niche'}`}><Icon size={19} /></div><div><h2>{title}</h2><p>Alvos ativos: {items.length}</p></div></div>
      <form className="target-form" onSubmit={submit}>
        <label className="field-label" htmlFor={`${kind}-target-input`}>Adicionar {label}<input id={`${kind}-target-input`} className="target-input" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={isCity ? 'Ex.: São Paulo, SP' : 'Ex.: Odontologia'} maxLength={64} required /></label>
        <button className="button-primary target-add" type="submit">Adicionar</button>
      </form>
      {message && <p className="target-feedback" role="status">{message}</p>}
      <ul className="target-list">
        {items.map((item) => {
          const count = countMatches(item)
          return <li className="target-row" key={`${kind}-${item}`}><button type="button" className="target-select" aria-label={`Ver leads de ${item} — ${count} mapeados`} onClick={() => onSelect(item)}><span className="target-copy"><strong>{item}</strong><small>{count ? `${count} ${count === 1 ? 'lead mapeado' : 'leads mapeados'}` : 'Sem leads mapeados ainda'}</small></span><ArrowRight size={15} /></button><button type="button" className="target-remove" aria-label={`Remover ${label} ${item}`} onClick={() => onRemove(item)}><X size={16} /></button></li>
        })}
        {!items.length && <li className="target-empty">Nenhum alvo cadastrado. Adicione o primeiro acima.</li>}
      </ul>
    </section>
  )
}
