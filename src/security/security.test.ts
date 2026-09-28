import { describe, expect, it } from 'vitest'
import { CASE_BY_ID } from '@/cases'
import { CONCEPT_BY_ID } from '@/content'
import { ATTACKS } from './attacks'
import { CHECKLIST, CHECKLIST_ITEMS } from './checklist'
import { FRAMEWORKS, INCIDENTS, PATTERNS } from './meta'
import { SURFACE_BY_ID, SURFACES } from './surfaces'
import { ATTACK_CATEGORIES, OWASP_LLM, ZONES } from './types'

const owaspIds = new Set<string>(OWASP_LLM.map((o) => o.id))

describe('security content', () => {
  it('surfaces are numbered 1..n, unique and in known zones', () => {
    expect(SURFACE_BY_ID.size).toBe(SURFACES.length)
    expect(SURFACES.map((s) => s.n)).toEqual(SURFACES.map((_, i) => i + 1))
    const zones = new Set<string>(ZONES.map((z) => z.id))
    for (const s of SURFACES) {
      expect(zones.has(s.zone), s.id).toBe(true)
      expect(s.controls.length, s.id).toBeGreaterThan(0)
      expect(s.review.length, s.id).toBeGreaterThan(0)
      for (const c of s.concepts) expect(CONCEPT_BY_ID.has(c), `${s.id}: ${c}`).toBe(true)
      for (const c of s.cases) expect(CASE_BY_ID.has(c), `${s.id}: ${c}`).toBe(true)
    }
  })

  it('attacks reference existing surfaces, categories and OWASP ids', () => {
    const ids = new Set(ATTACKS.map((a) => a.id))
    expect(ids.size).toBe(ATTACKS.length)
    const cats = new Set<string>(ATTACK_CATEGORIES.map((c) => c.id))
    for (const a of ATTACKS) {
      expect(cats.has(a.category), a.id).toBe(true)
      expect(a.surfaces.length, a.id).toBeGreaterThan(0)
      for (const s of a.surfaces) expect(SURFACE_BY_ID.has(s), `${a.id}: ${s}`).toBe(true)
      expect(a.owasp.length, a.id).toBeGreaterThan(0)
      for (const o of a.owasp) expect(owaspIds.has(o), `${a.id}: ${o}`).toBe(true)
      expect(a.mitigations.length, a.id).toBeGreaterThanOrEqual(2)
      for (const r of a.refs ?? []) if (r.url) expect(r.url.startsWith('https://'), a.id).toBe(true)
    }
  })

  it('every surface is hit by at least one attack', () => {
    for (const s of SURFACES) expect(ATTACKS.some((a) => a.surfaces.includes(s.id)), s.id).toBe(true)
  })

  it('every OWASP LLM Top 10 risk is covered by some attack', () => {
    for (const o of OWASP_LLM) expect(ATTACKS.some((a) => a.owasp.includes(o.id)), o.id).toBe(true)
  })

  it('checklist items are unique and every section has critical items', () => {
    expect(new Set(CHECKLIST_ITEMS.map((i) => i.id)).size).toBe(CHECKLIST_ITEMS.length)
    for (const s of CHECKLIST) expect(s.items.some((i) => i.critical), s.id).toBe(true)
  })

  it('references use https', () => {
    for (const f of FRAMEWORKS) expect(f.url.startsWith('https://')).toBe(true)
    for (const p of PATTERNS) for (const r of p.refs ?? []) expect(r.url?.startsWith('https://')).toBe(true)
    for (const i of INCIDENTS) if (i.ref?.url) expect(i.ref.url.startsWith('https://')).toBe(true)
  })
})
