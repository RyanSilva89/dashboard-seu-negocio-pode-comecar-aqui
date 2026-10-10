import { useEffect, useMemo, useState } from 'react'
import { Download, Palette, ShieldCheck, Sparkles } from 'lucide-react'

type MascotShape = 'estrela' | 'robo' | 'folha'
type MascotSettings = { name: string; tagline: string; color: string; shape: MascotShape }

const storageKey = 'site-start-mascot-settings'
const defaults: MascotSettings = { name: 'Lumi', tagline: 'Seu guia para começar', color: '#3478ed', shape: 'estrela' }
const validShapes: MascotShape[] = ['estrela', 'robo', 'folha']

function readSettings(): MascotSettings {
  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) return defaults
    const parsed = JSON.parse(saved) as Partial<MascotSettings>
    return {
      name: typeof parsed.name === 'string' ? parsed.name.slice(0, 32) : defaults.name,
      tagline: typeof parsed.tagline === 'string' ? parsed.tagline.slice(0, 48) : defaults.tagline,
      color: typeof parsed.color === 'string' && /^#[0-9a-f]{6}$/i.test(parsed.color) ? parsed.color : defaults.color,
      shape: validShapes.includes(parsed.shape as MascotShape) ? parsed.shape as MascotShape : defaults.shape,
    }
  } catch {
    return defaults
  }
}

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
}

function createMascotSvg(settings: MascotSettings) {
  const color = /^#[0-9a-f]{6}$/i.test(settings.color) ? settings.color : defaults.color
  const body = settings.shape === 'robo'
    ? `<path d="M120 37v13" stroke="${color}" stroke-width="7" stroke-linecap="round"/><circle cx="120" cy="30" r="9" fill="${color}"/><rect x="49" y="51" width="142" height="139" rx="35" fill="url(#body)" stroke="white" stroke-width="7"/><rect x="39" y="93" width="12" height="38" rx="6" fill="${color}" opacity=".72"/><rect x="189" y="93" width="12" height="38" rx="6" fill="${color}" opacity=".72"/>`
    : settings.shape === 'folha'
      ? `<path d="M120 33C171 38 193 73 187 117c-7 47-41 70-67 82-26-12-60-35-67-82-6-44 16-79 67-84Z" fill="url(#body)" stroke="white" stroke-width="7"/><path d="M120 54c-2 38-19 76-48 107" fill="none" stroke="white" stroke-opacity=".36" stroke-width="5" stroke-linecap="round"/>`
      : `<path d="m120 27 21 43 47 7-34 33 8 47-42-22-42 22 8-47-34-33 47-7 21-43Z" fill="url(#body)" stroke="white" stroke-width="7" stroke-linejoin="round"/>`
  const name = escapeXml(settings.name.trim() || 'Seu mascote')
  const tagline = escapeXml(settings.tagline.trim() || 'Uma ideia em movimento')
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 285" role="img" aria-labelledby="title description">
  <title id="title">${name}</title><desc id="description">Mascote vetorial personalizado: ${tagline}</desc>
  <defs><linearGradient id="body" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${color}" stop-opacity=".78"/></linearGradient></defs>
  <ellipse cx="120" cy="207" rx="59" ry="9" fill="#202637" opacity=".08"/>
  ${body}
  <circle cx="100" cy="106" r="10" fill="white"/><circle cx="140" cy="106" r="10" fill="white"/>
  <circle cx="102" cy="108" r="4" fill="#29354a"/><circle cx="142" cy="108" r="4" fill="#29354a"/>
  <circle cx="82" cy="127" r="7" fill="white" opacity=".55"/><circle cx="158" cy="127" r="7" fill="white" opacity=".55"/>
  <path d="M103 132q17 16 34 0" fill="none" stroke="#29354a" stroke-width="4" stroke-linecap="round"/>
  <path d="M172 54l4 9 9 4-9 4-4 9-4-9-9-4 9-4 4-9Z" fill="${color}" opacity=".52"/>
  <text x="120" y="247" text-anchor="middle" font-family="Manrope,Arial,sans-serif" font-size="18" font-weight="800" fill="#263248">${name}</text>
  <text x="120" y="267" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" fill="#778397">${tagline}</text>
</svg>`
}

function fileSlug(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mascote'
}

export default function MascotMaker() {
  const [settings, setSettings] = useState<MascotSettings>(readSettings)
  const [notice, setNotice] = useState('')
  const svg = useMemo(() => createMascotSvg(settings), [settings])
  const previewUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(settings))
  }, [settings])

  function update<K extends keyof MascotSettings>(key: K, value: MascotSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }))
    setNotice('')
  }

  function downloadSvg() {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${fileSlug(settings.name)}.svg`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    setNotice('SVG baixado. As configurações também ficam salvas neste navegador.')
  }

  return (
    <>
      <div className="market-note mascot-note"><Sparkles size={17} /><div><strong>Crie um mascote para a sua marca</strong><span>Personalize nome, formato, cor e frase. A prévia vetorial e o arquivo SVG são produzidos no navegador — nenhuma imagem ou configuração é enviada a terceiros.</span></div></div>
      <div className="mascot-layout">
        <section className="panel mascot-editor">
          <div className="panel-heading"><div><h3>Personalização</h3><p>Os campos e a prévia são salvos localmente.</p></div><Palette size={18} className="muted-icon" /></div>
          <div className="mascot-fields">
            <label className="field-label">Nome do mascote<input className="mascot-input" type="text" maxLength={32} value={settings.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex.: Lumi" /></label>
            <label className="field-label">Formato<select value={settings.shape} onChange={(event) => update('shape', event.target.value as MascotShape)}><option value="estrela">Estrela amigável</option><option value="robo">Robô criativo</option><option value="folha">Folha acolhedora</option></select></label>
            <label className="field-label">Frase curta<input className="mascot-input" type="text" maxLength={48} value={settings.tagline} onChange={(event) => update('tagline', event.target.value)} placeholder="Ex.: Seu guia para começar" /></label>
            <label className="field-label mascot-color-label">Cor principal<input className="mascot-color" type="color" value={settings.color} onChange={(event) => update('color', event.target.value)} /></label>
          </div>
          <div className="mascot-actions"><button className="button-primary" onClick={downloadSvg}><Download size={15} /> Baixar mascote em SVG</button></div>
          {notice && <div className="target-feedback" role="status">{notice}</div>}
          <small className="field-footnote"><ShieldCheck size={13} /> SVG editável, sem integração externa. Ajuste o arquivo baixado em um editor vetorial se quiser refiná-lo.</small>
        </section>
        <section className="panel mascot-preview-panel">
          <div className="panel-heading"><div><h3>Prévia do mascote</h3><p>Uma primeira versão vetorial da sua ideia.</p></div><span className="soft-badge">SVG</span></div>
          <div className="mascot-stage"><img src={previewUrl} alt={`Prévia do mascote ${settings.name || 'sem nome'}`} /></div>
          <div className="mascot-preview-caption"><strong>{settings.name || 'Seu mascote'}</strong><span>{settings.tagline || 'Uma ideia em movimento'}</span></div>
        </section>
      </div>
    </>
  )
}
