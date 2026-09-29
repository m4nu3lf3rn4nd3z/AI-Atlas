import { describe, expect, it } from 'vitest'
import { distribution as reference } from '@/lib/sampling'
import data from './distributions.json'
import { DEFAULT_PARAMS, distribution, drawMany, type Step } from './logic'
import { PROMPTS } from './prompts'

const steps = (id: string) => data.prompts.find((p) => p.id === id)!.steps as Step[]
const total = (d: ReturnType<typeof distribution>) => d.tokens.reduce((s, t) => s + t.p, 0) + d.rest.p

describe('captured distributions', () => {
  it('exist for every prompt and cover the whole vocabulary', () => {
    for (const p of PROMPTS) {
      const s = steps(p.id)
      expect(s.length, p.id).toBeGreaterThan(1)
      const d = distribution(s[0]!, DEFAULT_PARAMS)
      expect(d.candidates).toBeGreaterThan(100_000) // Qwen2.5 vocabulary ≈ 151k tokens
      expect(total(d)).toBeCloseTo(1, 9)
    }
  })

  it('reflect what the model does: París is the favourite, other capitals are possible', () => {
    const d = distribution(steps('capital')[0]!, DEFAULT_PARAMS)
    const p = (t: string) => d.tokens.find((x) => x.token.t === t)?.p ?? 0
    expect(d.tokens[0]!.token.t).toBe(' Par')
    expect(p(' Par')).toBeGreaterThan(0.4)
    expect(p(' Roma')).toBeGreaterThan(0.005)
    // A high temperature flattens everything: the favourite loses mass and the
    // ~150k-token tail of junk gains a lot of it.
    const hot = distribution(steps('capital')[0]!, { ...DEFAULT_PARAMS, temperature: 1.5 })
    expect(hot.tokens[0]!.p).toBeLessThan(p(' Par'))
    expect(hot.rest.p).toBeGreaterThan(d.rest.p * 2)
    expect(hot.entropy).toBeGreaterThan(d.entropy)
    // …unless a filter cuts the tail: with min-p the alternatives are real words again
    const filtered = distribution(steps('capital')[0]!, { ...DEFAULT_PARAMS, temperature: 1.5, minP: 0.02 })
    expect(filtered.rest.p).toBe(0)
    expect(filtered.tokens.find((x) => x.token.t === ' Roma')!.p).toBeGreaterThan(p(' Roma'))
  })

  it('code is almost deterministic', () => {
    expect(distribution(steps('code')[0]!, DEFAULT_PARAMS).tokens[0]!.p).toBeGreaterThan(0.99)
  })
})

describe('filters', () => {
  const s = steps('story')[0]!

  it('temperature 0 is greedy', () => {
    const d = distribution(s, { ...DEFAULT_PARAMS, temperature: 0 })
    expect(d.tokens[0]!.p).toBe(1)
    expect(d.candidates).toBe(1)
    expect(d.entropy).toBe(0)
  })

  it('top-k keeps exactly k tokens', () => {
    const d = distribution(s, { ...DEFAULT_PARAMS, topK: 5 })
    expect(d.candidates).toBe(5)
    expect(d.tokens.filter((t) => t.p > 0)).toHaveLength(5)
    expect(total(d)).toBeCloseTo(1, 9)
  })

  it('top-p keeps the smallest set that reaches p', () => {
    const d = distribution(s, { ...DEFAULT_PARAMS, topP: 0.5 })
    const kept = d.tokens.filter((t) => t.p > 0)
    const mass = kept.reduce((a, t) => a + t.base, 0)
    expect(mass).toBeGreaterThanOrEqual(0.5)
    expect(mass - kept.at(-1)!.base).toBeLessThan(0.5)
  })

  it('min-p drops tokens below a fraction of the best one', () => {
    const d = distribution(s, { ...DEFAULT_PARAMS, minP: 0.1 })
    const best = d.tokens[0]!.base
    for (const t of d.tokens) expect(t.p > 0).toBe(t.base >= 0.1 * best)
    expect(d.rest.p).toBe(0)
  })

  it('matches the reference implementation when there is no tail', () => {
    const logits = [3, 2.5, 1, 0.2, -1, -2]
    const step: Step = { top: logits.map((l, i) => ({ id: i, t: String(i), l })), tail: [] }
    for (const params of [
      { temperature: 0.7, topK: 3, topP: 1, minP: 0 },
      { temperature: 1.3, topK: 0, topP: 0.8, minP: 0 },
      { temperature: 1, topK: 0, topP: 1, minP: 0.2 },
    ]) {
      const mine = distribution(step, params).tokens.map((t) => t.p)
      const ref = reference(logits, { temperature: params.temperature, topK: params.topK || undefined, topP: params.topP, minP: params.minP || undefined })
      mine.forEach((p, i) => expect(p).toBeCloseTo(ref[i]!, 9))
    }
  })
})

describe('drawMany', () => {
  it('draws in proportion to the probabilities, reproducibly', () => {
    const d = distribution(steps('sky')[0]!, DEFAULT_PARAMS)
    const a = drawMany(d, 4000, 7)
    expect(drawMany(d, 4000, 7)).toEqual(a)
    expect(a.counts[0]! / 4000).toBeCloseTo(d.tokens[0]!.p, 1)
  })
})
