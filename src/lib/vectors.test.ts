import { describe, expect, it } from 'vitest'
import vectors from '@/labs/embeddings/vectors.json'
import { E5_QUERY, MATRIX, QUERIES, SENTENCES } from '@/labs/embeddings/data'
import { cosine } from './retrieval'
import { decodeVectors, pca2 } from './vectors'

describe('pca2', () => {
  it('recovers a line: one component explains everything', () => {
    const pts = [0, 1, 2, 3, 4].map((t) => [t, 2 * t, -t, 0])
    const { explained, points } = pca2(pts)
    expect(explained[0]).toBeCloseTo(1, 6)
    expect(Math.abs(points[4]![0] - points[0]![0])).toBeCloseTo(Math.hypot(4, 8, 4), 4)
  })

  it('preserves distances of data that is really 2D', () => {
    const base = [
      [0, 0],
      [3, 1],
      [-1, 4],
      [2, -2],
      [5, 5],
    ]
    const embedded = base.map(([x, y]) => [x!, y!, x! + y!, x! - y!, 0, 0])
    const { points, explained } = pca2(embedded)
    expect(explained[0] + explained[1]).toBeCloseTo(1, 6)
    const dist = (p: number[], q: number[]) => Math.hypot(...p.map((v, i) => v - q[i]!))
    for (let i = 0; i < base.length; i++)
      for (let j = 0; j < base.length; j++) expect(dist(points[i]!, points[j]!)).toBeCloseTo(dist(embedded[i]!, embedded[j]!), 4)
  })
})

describe('precomputed embeddings', () => {
  const map = decodeVectors(vectors)
  const v = (t: string) => map.get(E5_QUERY + t)!

  it('has a unit vector for every sentence and query', () => {
    expect(vectors.dims).toBe(384)
    for (const t of [...SENTENCES.map((s) => s.text), ...QUERIES, ...MATRIX]) {
      const x = v(t)
      expect(x, t).toBeDefined()
      expect(cosine(x, x)).toBeCloseTo(1, 5)
    }
  })

  it('captures meaning across languages', () => {
    const es = v('El gato duerme en el sofá.')
    expect(cosine(es, v('The cat is sleeping on the couch.'))).toBeGreaterThan(cosine(es, v('Hace un calor insoportable esta tarde.')))
  })

  it('finds pets for a query with no words in common', () => {
    const q = v('Mi mascota tiene miedo de los truenos')
    const ranked = SENTENCES.map((s) => ({ s: s.text, c: cosine(q, v(s.text)) })).sort((a, b) => b.c - a.c)
    expect(ranked[0]!.s).toBe('Mi perro se pone nervioso cuando hay tormenta.')
  })
})
