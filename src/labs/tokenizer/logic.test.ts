import { describe, expect, it } from 'vitest'
import { encode as o200k } from 'gpt-tokenizer/encoding/o200k_base'
import { textStats, tokenCost } from './logic'

describe('textStats', () => {
  it('counts code points, not UTF-16 units', () => {
    expect(textStats('👋🚀', 2).chars).toBe(2)
  })

  it('computes ratios', () => {
    const s = textStats('hola mundo', 4)
    expect(s.words).toBe(2)
    expect(s.charsPerToken).toBeCloseTo(10 / 4)
    expect(s.tokensPerWord).toBe(2)
  })

  it('handles empty text', () => {
    expect(textStats('', 0)).toMatchObject({ chars: 0, words: 0, charsPerToken: 0 })
  })
})

describe('tokenCost', () => {
  it('prices per million tokens', () => {
    expect(tokenCost(500_000, 3)).toBeCloseTo(1.5)
  })
})

describe('real tokenizer facts used in the content', () => {
  it('matches the ids shown in the pipeline diagram', () => {
    expect(o200k('El cielo es')).toEqual([4422, 84743, 878])
  })

  it('Spanish needs more tokens than English for the same sentence', () => {
    const es = o200k('La tokenización no es trivial').length
    const en = o200k('Tokenization is not trivial').length
    expect(es).toBeGreaterThan(en)
  })

  it('splits "strawberry" into sub-word pieces', () => {
    expect(o200k('strawberry').length).toBeGreaterThan(1)
  })
})
