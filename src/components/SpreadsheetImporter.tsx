import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { ArrowRight, FileSpreadsheet, ShieldCheck, Upload, X } from 'lucide-react'
import Papa from 'papaparse'
import readXlsxFile, { type Sheet } from 'read-excel-file/browser'
import type { Lead } from '../data/leads'
import { getLeadCity, getLeadNiche, normalizeTarget } from '../data/targets'

type ImportField = 'name' | 'city' | 'state' | 'niche' | 'address' | 'phone' | 'email' | 'website' | 'instagram' | 'services' | 'notes'
type FieldMapping = Record<ImportField, string>
type RowRecord = Record<string, string>
type SheetRows = { name: string; rows: unknown[][] }
type Candidate = { line: number; lead: Lead | null; city: string; niche: string; missingName: boolean; incomplete: boolean; duplicate: boolean }

const fieldLabels: Record<ImportField, string> = {
  name: 'Nome do negócio (obrigatório)',
  city: 'Cidade',
  state: 'Estado / UF',
  niche: 'Nicho / segmento',
  address: 'Endereço completo',
  phone: 'Telefone / WhatsApp',
  email: 'E-mail',
  website: 'Site / URL',
  instagram: 'Instagram',
  services: 'Serviços / especialidade',
  notes: 'Observações',
}

const fieldOrder: ImportField[] = ['name', 'city', 'state', 'niche', 'address', 'phone', 'email', 'website', 'instagram', 'services', 'notes']
const aliases: Record<ImportField, string[]> = {
  name: ['nome', 'empresa', 'negocio', 'business', 'name', 'estabelecimento', 'clinica', 'lead'],
  city: ['cidade', 'city', 'municipio', 'localidade'],
  state: ['uf', 'estado', 'state'],
  niche: ['nicho', 'segmento', 'categoria', 'ramo', 'setor', 'especialidade', 'specialty'],
  address: ['endereco', 'address', 'localizacao', 'logradouro', 'rua'],
  phone: ['telefone', 'celular', 'whatsapp', 'phone', 'fone', 'tel'],
  email: ['email', 'mail'],
  website: ['site', 'website', 'url', 'dominio', 'pagina web'],
  instagram: ['instagram', 'perfil social', 'rede social'],
  services: ['servico', 'servicos', 'atividade', 'description', 'descricao'],
  notes: ['observacao', 'observacoes', 'anotacao', 'anotacoes', 'nota', 'notas', 'comentario'],
}

const emptyMapping = (): FieldMapping => Object.fromEntries(fieldOrder.map((field) => [field, ''])) as FieldMapping
const MAX_FILE_BYTES = 12 * 1024 * 1024
const MAX_DATA_ROWS = 5000
const PREVIEW_PAGE_SIZE = 25

function cellText(value: unknown) {
  if (value === null || value === undefined) return ''
  if (value instanceof Date) return value.toLocaleDateString('pt-BR')
  return String(value).replace(/^\uFEFF/, '').trim()
}

function uniqueHeaders(values: unknown[]) {
  const seen = new Map<string, number>()
  return values.map((value, index) => {
    const base = cellText(value) || `Coluna ${index + 1}`
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    return count === 1 ? base : `${base} (${count})`
  })
}

function recordsFromMatrix(matrix: unknown[][]) {
  const nonEmptyRows = matrix.filter((row) => row.some((cell) => cellText(cell)))
  if (!nonEmptyRows.length) return { headers: [] as string[], rows: [] as RowRecord[] }
  const headers = uniqueHeaders(nonEmptyRows[0])
  const rows = nonEmptyRows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, cellText(cells[index])])) as RowRecord)
  return { headers, rows }
}

function suggestMapping(headers: string[]): FieldMapping {
  const mapping = emptyMapping()
  const claimed = new Set<string>()
  for (const field of fieldOrder) {
    const match = headers.find((header) => {
      if (claimed.has(header)) return false
      const normalized = normalizeTarget(header)
      return aliases[field].some((alias) => normalized === alias || normalized.includes(alias))
    })
    if (match) {
      mapping[field] = match
      claimed.add(match)
    }
  }
  return mapping
}

function columnValue(row: RowRecord, mapping: FieldMapping, field: ImportField) {
  const column = mapping[field]
  return column ? (row[column] ?? '').trim() : ''
}

function safeUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed || /\s/.test(trimmed)) return ''
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    return ['http:', 'https:'].includes(url.protocol) && url.hostname.includes('.') ? url.href : ''
  } catch {
    return ''
  }
}

function safeInstagram(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^@[\w.]+$/.test(trimmed)) return `https://www.instagram.com/${trimmed.slice(1)}/`
  return safeUrl(trimmed)
}

function cityFromAddress(address: string) {
  const dash = address.match(/([^,]+?)\s*[–-]\s*([A-Za-z]{2})\b/i)
  if (dash?.[1]?.trim() && dash[2]) return `${dash[1].trim()}, ${dash[2].toUpperCase()}`
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  const state = parts.at(-1)?.match(/^[A-Za-z]{2}$/)
  if (state && parts.length > 1) return `${parts.at(-2)}, ${state[0].toUpperCase()}`
  return ''
}

function slug(value: string) {
  return normalizeTarget(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'negocio'
}

function buildLead(row: RowRecord, mapping: FieldMapping, line: number): Lead | null {
  const name = columnValue(row, mapping, 'name')
  if (!name) return null
  const rawAddress = columnValue(row, mapping, 'address')
  const rawCity = columnValue(row, mapping, 'city')
  const rawState = columnValue(row, mapping, 'state')
  const state = rawState ? (rawState.length === 2 ? rawState.toUpperCase() : rawState) : ''
  const city = rawCity ? `${rawCity}${state ? `, ${state}` : ''}` : cityFromAddress(rawAddress)
  const address = rawAddress || (city ? city : 'Localização não informada na planilha')
  const niche = columnValue(row, mapping, 'niche') || 'Não informado'
  const rawWebsite = columnValue(row, mapping, 'website')
  const website = safeUrl(rawWebsite)
  const instagram = safeInstagram(columnValue(row, mapping, 'instagram'))
  const phone = columnValue(row, mapping, 'phone')
  const email = columnValue(row, mapping, 'email')
  const services = columnValue(row, mapping, 'services') || 'Serviços não informados na planilha.'
  const notes = columnValue(row, mapping, 'notes')
  const importedAt = new Date().toLocaleDateString('pt-BR')
  const suffix = globalThis.crypto?.randomUUID?.().slice(0, 8) ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const evidence = [`Dados fornecidos pelo usuário via planilha em ${importedAt}; não verificados de forma independente.`, 'O arquivo original não é guardado no dashboard.']
  if (notes) evidence.push(`Observação importada: ${notes}`)
  if (rawWebsite && !website) evidence.push('O valor da coluna de site não foi reconhecido como URL segura e não foi transformado em link.')
  const contacts: Lead['contacts'] = []
  if (phone) contacts.push({ label: 'Telefone / WhatsApp', value: phone, type: 'planilha' })
  if (email) contacts.push({ label: 'E-mail', value: email, type: 'planilha' })
  if (instagram) contacts.push({ label: 'Instagram', value: instagram, type: 'planilha' })
  const hasNiche = niche !== 'Não informado'
  return {
    id: `import-${slug(name)}-${line}-${suffix}`,
    name,
    specialty: niche,
    address,
    city: city || undefined,
    niche: hasNiche ? niche : undefined,
    contacts,
    website: website || null,
    websiteStatus: website ? 'Informado na planilha · não verificado' : 'Não informado na planilha',
    instagram: instagram || undefined,
    services,
    scheduling: 'Não analisado; os dados da planilha não confirmam a existência de agendamento online.',
    evidence,
    offer: website ? 'Há uma URL informada, ainda não verificada. Analise a experiência antes de sugerir melhoria de site, página ou automação.' : 'A planilha não informou um site. Confirme a presença digital e as necessidades do negócio antes de sugerir qualquer serviço.',
    priority: 'Baixa provisória',
    priorityReason: 'Registro importado; exige verificação e qualificação manual antes de ser priorizado.',
    confidence: 'Dados fornecidos pelo usuário por planilha; nomes, contatos, URLs e categorias não foram verificados de forma independente.',
    sources: [],
    origin: 'planilha',
    importedAt,
  }
}

function normalizeCity(value: string) {
  return normalizeTarget(value).replace(/,?\s*[a-z]{2}$/, '').trim()
}

function phoneDigits(lead: Lead) {
  return lead.contacts.filter((contact) => /telefone|whatsapp|celular/i.test(contact.label)).map((contact) => contact.value.replace(/\D/g, '')).filter(Boolean)
}

function isDuplicate(candidate: Lead, other: Lead) {
  const candidateCity = normalizeCity(getLeadCity(candidate))
  const otherCity = normalizeCity(getLeadCity(other))
  if (candidateCity && candidateCity !== 'nao informado' && candidateCity === otherCity && normalizeTarget(candidate.name) === normalizeTarget(other.name)) return true
  if (candidate.website && other.website && normalizeTarget(candidate.website.replace(/\/$/, '')) === normalizeTarget(other.website.replace(/\/$/, ''))) return true
  const candidatePhones = phoneDigits(candidate)
  const otherPhones = phoneDigits(other)
  return candidatePhones.some((phone) => otherPhones.includes(phone))
}

function createCandidates(rows: RowRecord[], mapping: FieldMapping, existingLeads: Lead[]): Candidate[] {
  const known = [...existingLeads]
  return rows.map((row, index) => {
    const lead = buildLead(row, mapping, index + 2)
    if (!lead) return { line: index + 2, lead: null, city: 'Não informado', niche: 'Não informado', missingName: true, incomplete: true, duplicate: false }
    const city = getLeadCity(lead)
    const niche = getLeadNiche(lead)
    const duplicate = known.some((other) => isDuplicate(lead, other))
    if (!duplicate) known.push(lead)
    return { line: index + 2, lead, city, niche, missingName: false, incomplete: city === 'Não informado' || niche === 'Não informado', duplicate }
  })
}

function countBy(values: string[]) {
  const counts = new Map<string, number>()
  values.filter((value) => value !== 'Não informado').forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
}

export default function SpreadsheetImporter({ existingLeads, onImport }: { existingLeads: Lead[]; onImport: (leads: Lead[]) => boolean }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [sheets, setSheets] = useState<SheetRows[]>([])
  const [activeSheet, setActiveSheet] = useState(0)
  const [selectedFile, setSelectedFile] = useState('')
  const [mapping, setMapping] = useState<FieldMapping>(emptyMapping)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const [parseWarnings, setParseWarnings] = useState(0)
  const [previewPage, setPreviewPage] = useState(0)
  const currentSheet = sheets[activeSheet]
  const parsed = useMemo(() => currentSheet ? recordsFromMatrix(currentSheet.rows) : { headers: [] as string[], rows: [] as RowRecord[] }, [currentSheet])

  const candidates = useMemo(() => createCandidates(parsed.rows, mapping, existingLeads), [parsed.rows, mapping, existingLeads])
  const validCandidates = candidates.filter((candidate) => candidate.lead)
  const readyLeads = validCandidates.filter((candidate) => !candidate.duplicate && candidate.lead).map((candidate) => candidate.lead as Lead)
  const missingNames = candidates.filter((candidate) => candidate.missingName).length
  const duplicates = validCandidates.filter((candidate) => candidate.duplicate).length
  const incomplete = validCandidates.filter((candidate) => candidate.incomplete).length
  const cityBreakdown = countBy(validCandidates.filter((candidate) => !candidate.duplicate).map((candidate) => candidate.city))
  const nicheBreakdown = countBy(validCandidates.filter((candidate) => !candidate.duplicate).map((candidate) => candidate.niche))
  const pageCount = Math.max(1, Math.ceil(candidates.length / PREVIEW_PAGE_SIZE))
  const currentPreviewPage = Math.min(previewPage, pageCount - 1)
  const previewStartIndex = currentPreviewPage * PREVIEW_PAGE_SIZE
  const previewEndIndex = Math.min(previewStartIndex + PREVIEW_PAGE_SIZE, candidates.length)
  const visibleCandidates = candidates.slice(previewStartIndex, previewEndIndex)

  async function loadFile(file: File) {
    clearTransient()
    setBusy(true)
    setSelectedFile(file.name)
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error('O arquivo ultrapassa o limite de 12 MB. Divida a planilha e tente novamente.')
      const extension = file.name.split('.').pop()?.toLocaleLowerCase('pt-BR') ?? ''
      let nextSheets: SheetRows[]
      let warnings = 0
      if (extension === 'xlsx') {
        const workbook: Sheet<number>[] = await readXlsxFile(file)
        nextSheets = workbook.map((sheet) => ({ name: sheet.sheet, rows: sheet.data as unknown[][] }))
      } else if (extension === 'ods') {
        const XLSX = await import('@e965/xlsx')
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true })
        nextSheets = workbook.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, defval: '', raw: false }),
        }))
      } else if (['csv', 'tsv', 'txt'].includes(extension)) {
        const text = (await file.text()).replace(/^\uFEFF/, '')
        const result = Papa.parse<string[]>(text, { header: false, delimiter: extension === 'tsv' ? '\t' : '', skipEmptyLines: 'greedy', dynamicTyping: false })
        warnings = result.errors.length
        nextSheets = [{ name: file.name, rows: result.data as unknown[][] }]
      } else {
        throw new Error('Formato não suportado. Escolha um arquivo .ods (LibreOffice), .xlsx, .csv ou .tsv.')
      }
      if (!nextSheets.length) throw new Error('Não encontrei abas de dados nesta planilha.')
      const firstUsableIndex = nextSheets.findIndex((sheet) => {
        const rowCount = recordsFromMatrix(sheet.rows).rows.length
        return rowCount > 0 && rowCount <= MAX_DATA_ROWS
      })
      if (firstUsableIndex < 0) throw new Error('Não encontrei uma aba com até 5.000 linhas de dados. Divida a planilha e tente novamente.')
      setSheets(nextSheets)
      setActiveSheet(firstUsableIndex)
      setParseWarnings(warnings)
      setNotice(extension === 'ods'
        ? 'Planilha do LibreOffice convertida localmente para análise. O arquivo não foi enviado nem salvo.'
        : 'Arquivo lido apenas nesta sessão. Ele não foi enviado nem salvo.')
      const first = recordsFromMatrix(nextSheets[firstUsableIndex].rows)
      setMapping(suggestMapping(first.headers))
    } catch (cause) {
      clearTransient()
      setError(cause instanceof Error ? cause.message : 'Não foi possível ler o arquivo. Verifique o formato e tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  function clearTransient() {
    setSheets([])
    setActiveSheet(0)
    setSelectedFile('')
    setMapping(emptyMapping())
    setParseWarnings(0)
    setPreviewPage(0)
    setNotice('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) void loadFile(file)
  }

  function onSheetChange(value: string) {
    const nextIndex = Number(value)
    const nextSheet = sheets[nextIndex]
    if ((nextSheet?.rows.length ?? 0) - 1 > MAX_DATA_ROWS) {
      setError('Esta aba tem mais de 5.000 linhas de dados. Escolha uma aba menor ou divida a planilha.')
      return
    }
    setActiveSheet(nextIndex)
    setPreviewPage(0)
    setError('')
    setMapping(suggestMapping(recordsFromMatrix(nextSheet?.rows ?? []).headers))
  }

  function onMappingChange(field: ImportField, column: string) {
    setMapping((current) => ({ ...current, [field]: column }))
  }

  function confirmImport() {
    if (!mapping.name) {
      setError('Selecione a coluna que contém o nome do negócio antes de importar.')
      return
    }
    if (!readyLeads.length) {
      setError('Não há novos leads prontos para importar. Revise os nomes e duplicatas detectados.')
      return
    }
    if (!onImport(readyLeads)) {
      setError('O navegador não conseguiu salvar os dados. Libere espaço no armazenamento local e tente novamente; o arquivo continua somente nesta sessão.')
      return
    }
    clearTransient()
  }

  return (
    <div className="importer-stack">
      <div className="market-note"><ShieldCheck size={17} /><div><strong>A planilha é só a entrada de análise</strong><span>O arquivo é processado no navegador, nunca enviado para um serviço. Ao confirmar, somente os campos escolhidos viram fichas de lead; o arquivo original não é guardado no dashboard, no código nem no GitHub.</span></div></div>
      {!sheets.length ? (
        <section className="panel import-empty">
          <div className="import-icon"><FileSpreadsheet size={26} /></div>
          <h2>Importe uma lista de prospects</h2>
          <p>Selecione uma planilha do LibreOffice, Excel ou CSV. Arquivos ODS são convertidos localmente para a prévia; depois você pode revisar os campos, separar por cidade e nicho e decidir quais registros entram na sua base.</p>
          <input ref={inputRef} className="visually-hidden-input" type="file" accept=".ods,.xlsx,.csv,.tsv,.txt" onChange={onFileChange} aria-label="Selecionar planilha de prospects" />
          <button className="button-primary" type="button" onClick={() => inputRef.current?.click()} disabled={busy}><Upload size={16} /> {busy ? 'Lendo planilha…' : 'Selecionar planilha'}</button>
          <small>Formatos: ODS (LibreOffice), XLSX, CSV ou TSV · até 12 MB e 5.000 linhas por análise · primeira linha com cabeçalhos</small>
          {error && <p className="import-error" role="alert">{error}</p>}
          <div className="import-privacy"><ShieldCheck size={15} /> Os leads importados ficam somente no armazenamento local deste navegador; não há sincronização com a nuvem.</div>
        </section>
      ) : (
        <>
          <section className="panel import-file-bar"><div className="import-file-symbol"><FileSpreadsheet size={19} /></div><div className="import-file-copy"><strong>{selectedFile}</strong><span>{parsed.rows.length} linhas de dados disponíveis para revisão · conteúdo temporário desta sessão</span></div>{sheets.length > 1 && <label className="field-label sheet-choice">Aba<select value={activeSheet} onChange={(event) => onSheetChange(event.target.value)}>{sheets.map((sheet, index) => <option value={index} key={`${sheet.name}-${index}`}>{sheet.name}</option>)}</select></label>}<button type="button" className="target-remove" aria-label="Descartar planilha e limpar análise" onClick={clearTransient}><X size={17} /></button></section>
          {error && <p className="import-error" role="alert">{error}</p>}
          {notice && <div className="import-inline-note"><ShieldCheck size={14} />{notice}</div>}
          {parseWarnings > 0 && <div className="import-inline-warning">A leitura identificou {parseWarnings} aviso(s) de formatação. Confira a prévia antes de importar.</div>}
          <div className="import-summary-grid"><div className="import-summary-card"><span>Linhas reconhecidas</span><strong>{parsed.rows.length}</strong></div><div className="import-summary-card"><span>Novos leads prontos</span><strong>{readyLeads.length}</strong></div><div className="import-summary-card"><span>Possíveis duplicatas</span><strong>{duplicates}</strong></div><div className="import-summary-card"><span>Sem nome / incompletos</span><strong>{missingNames} / {incomplete}</strong></div></div>
          <div className="import-workspace">
            <section className="panel import-map-panel"><div className="panel-heading"><div><h2>Mapeie as colunas</h2><p>Os campos são sugeridos automaticamente; ajuste antes de importar.</p></div><span className="soft-badge">Leitura local</span></div><div className="mapping-grid">{fieldOrder.map((field) => <label className={`field-label ${field === 'name' ? 'mapping-required' : ''}`} key={field}>{fieldLabels[field]}{field === 'name' && <em>Obrigatório</em>}<select value={mapping[field]} onChange={(event) => onMappingChange(field, event.target.value)}><option value="">Não importar</option>{parsed.headers.map((header) => <option value={header} key={`${field}-${header}`}>{header}</option>)}</select></label>)}</div><div className="import-breakdown"><div><strong>Por cidade</strong><span>{cityBreakdown.length ? cityBreakdown.slice(0, 5).map(([name, count]) => `${name} (${count})`).join(' · ') : 'Sem cidade identificada'}</span></div><div><strong>Por nicho</strong><span>{nicheBreakdown.length ? nicheBreakdown.slice(0, 5).map(([name, count]) => `${name} (${count})`).join(' · ') : 'Sem nicho identificado'}</span></div></div></section>
            <section className="panel import-preview-panel">
              <div className="panel-heading">
                <div><h2>Prévia e análise</h2><p>Revise todas as linhas nas páginas; duplicatas e registros sem nome não são importados.</p></div>
                <span className="soft-badge">{candidates.length ? `Itens ${previewStartIndex + 1}–${previewEndIndex} de ${candidates.length}` : 'Nenhuma linha'}</span>
              </div>
              <div className="import-preview-scroll">
                <table className="import-preview-table" id="spreadsheet-preview-table">
                  <thead><tr><th>Linha</th><th>Negócio</th><th>Cidade</th><th>Nicho</th><th>Resultado</th></tr></thead>
                  <tbody>{visibleCandidates.map((candidate) => <tr key={candidate.line}><td>{candidate.line}</td><td>{candidate.lead?.name || 'Nome ausente'}</td><td>{candidate.city}</td><td>{candidate.niche}</td><td><span className={`import-row-status ${candidate.duplicate || candidate.missingName ? 'warning' : candidate.incomplete ? 'incomplete' : 'ready'}`}>{candidate.duplicate ? 'Duplicata · ignorar' : candidate.missingName ? 'Sem nome · ignorar' : candidate.incomplete ? 'Importável · incompleto' : 'Novo lead'}</span></td></tr>)}</tbody>
                </table>
              </div>
              {pageCount > 1 && <nav className="import-pagination" aria-label="Paginação da prévia">
                <span>Mostrando {previewStartIndex + 1}–{previewEndIndex} de {candidates.length} linhas</span>
                <div className="import-page-controls" aria-controls="spreadsheet-preview-table">
                  <button type="button" className="import-page-button" onClick={() => setPreviewPage((page) => Math.max(0, page - 1))} disabled={currentPreviewPage === 0}>Anterior</button>
                  <span aria-live="polite">Página {currentPreviewPage + 1} de {pageCount}</span>
                  <button type="button" className="import-page-button" onClick={() => setPreviewPage((page) => Math.min(pageCount - 1, page + 1))} disabled={currentPreviewPage >= pageCount - 1}>Próxima</button>
                </div>
              </nav>}
              <div className="import-actions"><button type="button" className="button-outline" onClick={clearTransient}>Cancelar e descartar</button><button type="button" className="button-primary" onClick={confirmImport} disabled={!readyLeads.length}>Importar {readyLeads.length} {readyLeads.length === 1 ? 'lead' : 'leads'} <ArrowRight size={15} /></button></div>
              <div className="import-privacy"><ShieldCheck size={15} /> Confirme somente os leads que você quer guardar. O arquivo original é descartado; os campos importados ficam neste navegador.</div>
            </section>
          </div>
        </>
      )}
    </div>
  )
}
