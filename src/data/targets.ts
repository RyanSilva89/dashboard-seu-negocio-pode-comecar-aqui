import type { Lead } from './leads'

export const cityTargetsStorageKey = 'site-start-target-cities'
export const nicheTargetsStorageKey = 'site-start-target-niches'
export const initialCityTargets = ['Campinas, SP', 'São Paulo, SP', 'Uberaba, MG']
export const initialNicheTargets = ['Fisioterapia', 'Buffet / restaurante por quilo', 'Estética avançada']

export function normalizeTarget(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('pt-BR')
}

export function uniqueTargets(values: string[]) {
  const seen = new Set<string>()
  return values.map((value) => value.trim()).filter((value) => {
    const key = normalizeTarget(value)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function readSavedTargets(key: string, fallback: string[]) {
  try {
    const migrationKey = `${key}-seed-v2`
    const saved = localStorage.getItem(key)
    const parsed: unknown = saved ? JSON.parse(saved) : []
    const strings = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : []
    if (localStorage.getItem(migrationKey) !== '2') {
      const migrated = uniqueTargets([...strings, ...fallback])
      localStorage.setItem(key, JSON.stringify(migrated))
      localStorage.setItem(migrationKey, '2')
      return migrated
    }
    return Array.isArray(parsed) ? uniqueTargets(strings) : fallback
  } catch {
    return fallback
  }
}

export function getLeadCity(lead: Lead) {
  if (lead.city?.trim()) return lead.city.trim()
  const match = lead.address.match(/([^,]+?)\s*[–-]\s*SP\b/i)
  if (match?.[1]?.trim()) return `${match[1].trim()}, SP`
  return 'Não informado'
}

export function getLeadNiche(lead: Lead) {
  const explicit = lead.niche?.trim()
  const normalizedExplicit = normalizeTarget(explicit ?? '')
  if (explicit && !['nao informado', 'nicho nao informado'].includes(normalizedExplicit)) return explicit
  const specialty = lead.specialty.split(/[;,]/)[0]?.trim() ?? ''
  const normalizedSpecialty = normalizeTarget(specialty)
  if (!normalizedSpecialty || ['nao informado', 'nicho nao informado'].includes(normalizedSpecialty)) return 'Não informado'
  if (normalizedSpecialty.includes('fisioterapia')) return 'Fisioterapia'
  return specialty
}

export function leadMatchesCity(lead: Lead, city: string) {
  const cityName = (value: string) => normalizeTarget(value).replace(/(?:,\s*|\s+)[a-z]{2}$/, '').trim()
  return cityName(getLeadCity(lead)) === cityName(city)
}

export function leadMatchesNiche(lead: Lead, niche: string) {
  const needle = normalizeTarget(niche)
  if (!needle) return false
  return normalizeTarget(`${lead.niche ?? ''} ${lead.specialty} ${lead.services}`).includes(needle)
}
