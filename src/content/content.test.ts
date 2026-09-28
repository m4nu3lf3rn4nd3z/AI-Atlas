import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DIAGRAMS } from '@/components/diagrams'
import { LAB_BY_ID, LABS } from '@/labs/registry'
import { GLOSSARY, GLOSSARY_BY_ID } from './glossary'
import { EDGES, topologicalOrder } from './graph'
import {
  CONCEPT_BY_ID,
  CONCEPTS,
  CONTENT_FOLDER_IDS,
  hasContent,
  loadDetails,
  loadTheory,
  WRITTEN_COUNT,
} from './index'
import { LAYERS } from './layers'
import { PATHS } from './paths'
import { conceptDetailsSchema, conceptMetaSchema, glossaryTermSchema, learningPathSchema } from './schema'

describe('concept metadata', () => {
  it.each(CONCEPTS.map((c) => [c.id, c] as const))('%s matches the schema', (_, c) => {
    expect(() => conceptMetaSchema.parse(c)).not.toThrow()
  })

  it('has unique ids', () => {
    expect(CONCEPT_BY_ID.size).toBe(CONCEPTS.length)
  })

  it('every prerequisite and relation points to an existing concept', () => {
    for (const c of CONCEPTS) {
      for (const p of c.prerequisites) expect(CONCEPT_BY_ID.has(p), `${c.id} → ${p}`).toBe(true)
      for (const r of c.relations) expect(CONCEPT_BY_ID.has(r.to), `${c.id} → ${r.to}`).toBe(true)
    }
  })

  it('has no self references', () => {
    for (const c of CONCEPTS) {
      expect(c.prerequisites).not.toContain(c.id)
      expect(c.relations.map((r) => r.to)).not.toContain(c.id)
    }
  })

  it('has no prerequisite cycles', () => {
    expect(() => topologicalOrder()).not.toThrow()
    expect(topologicalOrder()).toHaveLength(CONCEPTS.length)
  })

  it('every layer has concepts', () => {
    for (const l of LAYERS) expect(CONCEPTS.some((c) => c.layer === l.id), l.id).toBe(true)
  })

  it('every concept is connected to the graph', () => {
    const connected = new Set(EDGES.flatMap((e) => [e.source, e.target]))
    for (const c of CONCEPTS) expect(connected.has(c.id), c.id).toBe(true)
  })
})

describe('labs', () => {
  it('every labId is registered and points back to a concept', () => {
    for (const c of CONCEPTS) if (c.labId) expect(LAB_BY_ID.has(c.labId), c.labId).toBe(true)
    for (const l of LABS) expect(CONCEPT_BY_ID.has(l.concept), l.id).toBe(true)
  })
})

describe('written content', () => {
  it('every content folder belongs to a concept', () => {
    for (const id of CONTENT_FOLDER_IDS) expect(CONCEPT_BY_ID.has(id), id).toBe(true)
  })

  it('every content folder has both theory.mdx and details.ts', () => {
    for (const id of CONTENT_FOLDER_IDS) expect(hasContent(id), id).toBe(true)
  })

  it('the whole fundamentals layer is written', () => {
    for (const c of CONCEPTS.filter((c) => c.layer === 'fundamentals')) {
      expect(hasContent(c.id), c.id).toBe(true)
    }
    expect(WRITTEN_COUNT).toBeGreaterThanOrEqual(9)
  })

  const written = CONCEPTS.filter((c) => hasContent(c.id)).map((c) => [c.id] as const)

  it.each(written)('%s details match the schema', async (id) => {
    const details = await loadDetails(id)
    expect(() => conceptDetailsSchema.parse(details)).not.toThrow()
  })

  it.each(written)('%s quiz answers are spread across options', async (id) => {
    const details = (await loadDetails(id))!
    const answers = new Set(details.quiz.map((q) => q.answer))
    // Guard against every correct answer sitting in the same position.
    expect(answers.size).toBeGreaterThan(1)
  })

  it.each(written)('%s theory compiles to a component', async (id) => {
    expect(typeof (await loadTheory(id))).toBe('function')
  })

  it.each(written)('%s theory only references existing terms, concepts and diagrams', (id) => {
    const dir = join(import.meta.dirname, 'concepts', id)
    const src = readFileSync(join(dir, 'theory.mdx'), 'utf8')
    for (const [, term] of src.matchAll(/<Term id="([^"]+)"/g)) {
      expect(GLOSSARY_BY_ID.has(term!), `Term ${term}`).toBe(true)
    }
    for (const [, ref] of src.matchAll(/<Concept id="([^"]+)"/g)) {
      expect(CONCEPT_BY_ID.has(ref!), `Concept ${ref}`).toBe(true)
    }
    for (const [, name] of src.matchAll(/<Diagram name="([^"]+)"/g)) {
      expect(name! in DIAGRAMS, `Diagram ${name}`).toBe(true)
    }
    // Every snippet file in the folder is actually used by details.ts
    const detailsSrc = readFileSync(join(dir, 'details.ts'), 'utf8')
    for (const file of readdirSync(join(dir, 'snippets'))) {
      expect(detailsSrc.includes(`./snippets/${file}?raw`), `snippet sin usar: ${file}`).toBe(true)
    }
  })
})

describe('glossary and paths', () => {
  it('glossary entries are valid and unique', () => {
    const ids = new Set<string>()
    for (const g of GLOSSARY) {
      expect(() => glossaryTermSchema.parse(g)).not.toThrow()
      expect(ids.has(g.id), g.id).toBe(false)
      ids.add(g.id)
      if (g.concept) expect(CONCEPT_BY_ID.has(g.concept), g.id).toBe(true)
    }
  })

  it('paths reference existing concepts', () => {
    for (const p of PATHS) {
      expect(() => learningPathSchema.parse(p)).not.toThrow()
      for (const s of p.steps) expect(CONCEPT_BY_ID.has(s.concept), `${p.id}: ${s.concept}`).toBe(true)
    }
  })
})
