import { describe, expect, it } from 'vitest'
import { decodeVectors, type PackedVectors } from '@/lib/vectors'
import { E5_PASSAGE, E5_QUERY } from '../embeddings/data'
import { PASSAGES, passageText, QUESTIONS } from './corpus'
import { buildIndex, buildPrompt, DEFAULT_OPTIONS, evaluate, goldRank, rankHybrid, runPipeline } from './logic'
import rerank from './rerank.json'
import packed from './vectors.json'

const dec = decodeVectors(packed as PackedVectors)
const vectors = new Map(PASSAGES.map((p) => [p.id, dec.get(E5_PASSAGE + passageText(p))!]))
const index = buildIndex(PASSAGES, vectors)
const qv = (q: { q: string }) => dec.get(E5_QUERY + q.q)!
const scores = rerank.scores as Record<string, Record<string, number>>
const rr = (qi: number) => scores[qi]!

describe('data', () => {
  it('has embeddings and reranker scores for every passage and question', () => {
    for (const p of PASSAGES) expect(vectors.get(p.id), p.id).toBeDefined()
    for (const [qi, q] of QUESTIONS.entries()) {
      expect(qv(q), q.q).toBeDefined()
      for (const p of PASSAGES) expect(typeof scores[qi]![p.id], `${qi} ${p.id}`).toBe('number')
      for (const g of q.gold) expect(PASSAGES.some((p) => p.id === g), g).toBe(true)
    }
    expect(new Set(PASSAGES.map((p) => p.id)).size).toBe(PASSAGES.length)
  })
})

describe('pipeline', () => {
  const trap = QUESTIONS.findIndex((q) => q.kind === 'trap')
  const drones = QUESTIONS.findIndex((q) => q.kind === 'unanswerable')

  it('hybrid ranking fuses both lists', () => {
    const r = runPipeline(index, QUESTIONS[0]!.q, qv(QUESTIONS[0]!), DEFAULT_OPTIONS, null)
    const ids = new Set([...r.bm25.filter((x) => x.score > 0), ...r.dense!].map((x) => x.id))
    expect(new Set(r.hybrid!.map((x) => x.id))).toEqual(ids)
    expect(rankHybrid([], [{ id: 'a', score: 1 }])).toEqual([{ id: 'a', score: 1 / 61 }])
  })

  it('lexical search prefers the outdated policy until a metadata filter removes it', () => {
    const q = QUESTIONS[trap]!
    const bm = { ...DEFAULT_OPTIONS, retriever: 'bm25' as const, k: 1 }
    expect(runPipeline(index, q.q, qv(q), bm, null).context[0]!.id).toBe('dev-politica-2024')
    const filtered = runPipeline(index, q.q, qv(q), { ...bm, onlyCurrent: true }, null)
    expect(filtered.context[0]!.id).toBe('dev-politica')
    expect(filtered.excluded).toEqual(['dev-politica-2024'])
  })

  it('the reranker puts the right passage first for most questions', () => {
    const firsts = QUESTIONS.map((q, qi) => {
      const r = runPipeline(index, q.q, qv(q), { ...DEFAULT_OPTIONS, rerank: true, onlyCurrent: true }, rr(qi))
      return q.gold.length ? goldRank(r.reranked!, q.gold) === 1 : null
    }).filter((x) => x !== null)
    expect(firsts.filter(Boolean).length / firsts.length).toBeGreaterThan(0.7)
  })

  it('a relevance threshold makes the system abstain on unanswerable questions', () => {
    const q = QUESTIONS[drones]!
    const opts = { ...DEFAULT_OPTIONS, rerank: true, onlyCurrent: true, threshold: 0.01 }
    expect(runPipeline(index, q.q, qv(q), opts, rr(drones)).context).toHaveLength(0)
    const m = evaluate(index, QUESTIONS, qv, rr, { ...opts, k: 3 })
    expect(m.abstention).toBe(1)
    expect(m.recall).toBe(1)
  })

  it('metrics are proportions', () => {
    const m = evaluate(index, QUESTIONS, qv, rr, { ...DEFAULT_OPTIONS, retriever: 'bm25' })
    expect(m.recall).toBeGreaterThan(0)
    expect(m.recall).toBeLessThanOrEqual(1)
    expect(m.mrr).toBeLessThanOrEqual(1)
  })

  it('builds a prompt with numbered sources and an abstention instruction', () => {
    const p = buildPrompt('¿Pregunta?', [{ id: 'env-plazos', score: 1 }])
    expect(p).toContain('[1] Plazos de entrega')
    expect(p).toContain('di que no lo sabes')
    expect(buildPrompt('¿Nada?', [])).toContain('ninguna fuente')
  })
})
