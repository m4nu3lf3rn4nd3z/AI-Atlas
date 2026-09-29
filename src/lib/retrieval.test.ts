import { describe, expect, it } from 'vitest'
import { Bm25, cosine, normalize, rrf, terms } from './retrieval'

describe('terms', () => {
  it('normalizes accents, drops stopwords and strips plurals', () => {
    expect(normalize('Vacación ÚNICA')).toBe('vacacion unica')
    expect(terms('¿Cuántos días de vacaciones tengo?')).toEqual(['dia', 'vacacion', 'tengo'])
    expect(terms('la vacación')).toEqual(terms('las vacaciones'))
  })
})

describe('Bm25', () => {
  const docs = [
    'El gato duerme en el sofá.',
    'Los límites de la API: 600 peticiones por minuto y error 429.',
    'La API de pedidos usa JSON. La API responde rápido.',
  ]
  const bm25 = new Bm25(docs)

  it('ranks the document with the query terms first', () => {
    const [top] = bm25.search('¿Qué pasa con el error 429?')
    expect(top!.index).toBe(1)
    expect(top!.matched).toContain('429')
  })

  it('rare terms weigh more than common ones', () => {
    expect(bm25.idf('429')).toBeGreaterThan(bm25.idf('api'))
  })

  it('scores zero when nothing matches', () => {
    expect(bm25.score('ornitorrinco', 0).score).toBe(0)
  })
})

describe('rrf', () => {
  it('sums 1/(k + rank) across rankings', () => {
    const fused = rrf([
      [2, 0, 1],
      [0, 2, 1],
    ])
    expect(fused[0]!.score).toBeCloseTo(1 / 61 + 1 / 62)
    expect(fused.at(-1)!.index).toBe(1)
    expect(fused.at(-1)!.score).toBeCloseTo(2 / 63)
  })
})

describe('cosine', () => {
  it('is 1 for parallel vectors and 0 for orthogonal ones', () => {
    expect(cosine([1, 2, 3], [2, 4, 6])).toBeCloseTo(1)
    expect(cosine([1, 0], [0, 1])).toBe(0)
  })
})
