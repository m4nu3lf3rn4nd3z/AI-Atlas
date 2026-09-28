import { describe, expect, it } from 'vitest'
import { distribution, entropy, minP, sample, softmax, topK, topP } from './sampling'

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)
const LOGITS = [4, 3, 2, 1, 0]

describe('softmax', () => {
  it('produces a probability distribution', () => {
    const p = softmax(LOGITS)
    expect(sum(p)).toBeCloseTo(1, 10)
    expect(p[0]).toBeGreaterThan(p[1]!)
  })

  it('is numerically stable with large logits', () => {
    const p = softmax([1000, 999])
    expect(p[0]).toBeCloseTo(1 / (1 + Math.exp(-1)), 10)
  })

  it('low temperature sharpens, high temperature flattens', () => {
    const cold = softmax(LOGITS, 0.3)
    const hot = softmax(LOGITS, 2)
    expect(cold[0]).toBeGreaterThan(softmax(LOGITS, 1)[0]!)
    expect(hot[0]).toBeLessThan(softmax(LOGITS, 1)[0]!)
    expect(entropy(hot)).toBeGreaterThan(entropy(cold))
  })

  it('temperature 0 is greedy', () => {
    expect(softmax(LOGITS, 0)).toEqual([1, 0, 0, 0, 0])
  })
})

describe('filters', () => {
  const p = softmax(LOGITS)

  it('top-k keeps exactly k tokens', () => {
    const f = topK(p, 2)
    expect(f.filter((x) => x > 0)).toHaveLength(2)
    expect(sum(f)).toBeCloseTo(1, 10)
  })

  it('top-p keeps the smallest set reaching p', () => {
    // p ≈ [0.636, 0.234, 0.086, 0.032, 0.012]
    expect(topP(p, 0.5).filter((x) => x > 0)).toHaveLength(1)
    expect(topP(p, 0.8).filter((x) => x > 0)).toHaveLength(2)
    expect(sum(topP(p, 0.8))).toBeCloseTo(1, 10)
  })

  it('min-p scales with the top probability', () => {
    // threshold = 0.1 * 0.636 ≈ 0.064 → keeps the first three
    expect(minP(p, 0.1).filter((x) => x > 0)).toHaveLength(3)
  })

  it('pipeline combines temperature and filters', () => {
    const d = distribution(LOGITS, { temperature: 1, topK: 3, topP: 0.9 })
    expect(d.filter((x) => x > 0)).toHaveLength(2)
    expect(sum(d)).toBeCloseTo(1, 10)
  })
})

describe('sample', () => {
  it('follows the distribution (inverse CDF)', () => {
    const probs = [0.2, 0.5, 0.3]
    expect(sample(probs, () => 0.1)).toBe(0)
    expect(sample(probs, () => 0.6)).toBe(1)
    expect(sample(probs, () => 0.95)).toBe(2)
  })
})
