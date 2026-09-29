import { describe, expect, it } from 'vitest'
import { encode } from 'gpt-tokenizer/encoding/o200k_base'
import { DOCUMENTS } from './documents'
import { answerSpan, chunkText, coverage, flagsOf, retrieve, sections, STRATEGIES, summarize } from './logic'

const count = (t: string) => encode(t).length

describe('documents', () => {
  it('every answer is an exact span of its document', () => {
    for (const d of DOCUMENTS) for (const q of d.questions) expect(() => answerSpan(d.text, q.answer)).not.toThrow()
  })
})

describe.each(STRATEGIES.map((s) => [s.id] as const))('%s', (strategy) => {
  it.each(DOCUMENTS.map((d) => [d.id, d] as const))('covers %s in order, within the size', (_, doc) => {
    for (const size of [64, 200, 500]) {
      const chunks = chunkText(doc.text, strategy, size, 0, count)
      expect(chunks.length).toBeGreaterThan(0)
      // In order and without overlap when overlap = 0
      for (let i = 1; i < chunks.length; i++) expect(chunks[i]!.start).toBeGreaterThanOrEqual(chunks[i - 1]!.end)
      // Every non-space character belongs to some chunk
      const covered = new Uint8Array(doc.text.length)
      for (const c of chunks) covered.fill(1, c.start, c.end)
      for (let i = 0; i < doc.text.length; i++) if (doc.text[i]!.trim()) expect(covered[i], `${strategy} ${size} @${i}`).toBe(1)
      // Size is respected except for units that cannot be split (flagged as over)
      for (const c of chunks) if (!flagsOf(c, doc.text, size, chunks.length).over) expect(c.tokens).toBeLessThanOrEqual(size * 1.05)
    }
  })
})

describe('strategy behaviour', () => {
  const policy = DOCUMENTS.find((d) => d.id === 'policy')!

  it('overlap repeats the end of each chunk at the start of the next', () => {
    const chunks = chunkText(policy.text, 'fixed', 100, 20, count)
    for (let i = 1; i < chunks.length; i++) {
      expect(chunks[i]!.start).toBeLessThan(chunks[i - 1]!.end)
      const repeated = count(policy.text.slice(chunks[i]!.start, chunks[i - 1]!.end))
      expect(repeated).toBeLessThanOrEqual(22)
    }
    const s = summarize(chunks, policy.text, 100, count)
    expect(s.overheadPct).toBeGreaterThan(10)
  })

  it('fills chunks close to the target size', () => {
    for (const strategy of ['fixed', 'recursive'] as const) {
      const chunks = chunkText(policy.text, strategy, 128, 0, count)
      const full = chunks.slice(0, -1)
      const avg = full.reduce((s, c) => s + c.tokens, 0) / full.length
      expect(avg, strategy).toBeGreaterThan(128 * (strategy === 'fixed' ? 0.9 : 0.6))
    }
    // Unit counts add up to (almost) the real count of the whole text
    const chunks = chunkText(policy.text, 'fixed', 100000, 0, count)
    expect(chunks).toHaveLength(1)
    expect(Math.abs(chunks[0]!.tokens - count(policy.text.trim()))).toBeLessThanOrEqual(2)
  })

  it('sentence chunking never cuts a sentence', () => {
    for (const d of DOCUMENTS) {
      const chunks = chunkText(d.text, 'sentences', 120, 0, count)
      for (const c of chunks) expect(flagsOf(c, d.text, 120, chunks.length).cut, c.text.slice(-40)).toBe(false)
    }
  })

  it('fixed-size chunking cuts sentences', () => {
    const chunks = chunkText(policy.text, 'fixed', 100, 0, count)
    expect(summarize(chunks, policy.text, 100, count).cutPct).toBeGreaterThan(50)
  })

  it('structure-aware chunks carry their heading path', () => {
    expect(sections(policy.text).map((s) => s.path.at(-1))).toContain('3. Días no disfrutados')
    const chunks = chunkText(policy.text, 'markdown', 200, 0, count)
    const days = chunks.find((c) => c.text.includes('31 de marzo'))!
    expect(days.header).toBe('Política de vacaciones y ausencias › 3. Días no disfrutados')
  })

  it('ignores # lines inside code fences', () => {
    const md = '# A\n\ntexto\n\n```bash\n# comentario\necho hola\n```\n\n## B\n\nmás'
    expect(sections(md).map((s) => s.path.join('/'))).toEqual(['A', 'A/B'])
  })
})

describe('retrieval', () => {
  it('coverage classifies spans', () => {
    expect(coverage({ start: 0, end: 10 }, [2, 8])).toBe('full')
    expect(coverage({ start: 5, end: 10 }, [2, 8])).toBe('partial')
    expect(coverage({ start: 9, end: 10 }, [2, 8])).toBe('none')
  })

  it('structure-aware chunks of ~200 tokens answer every sample question', () => {
    for (const d of DOCUMENTS) {
      const chunks = chunkText(d.text, 'markdown', 200, 0, count)
      for (const q of d.questions) {
        const r = retrieve(chunks, q.q, answerSpan(d.text, q.answer))
        expect(r.coverage, `${d.id}: ${q.q}`).toBe('full')
      }
    }
  })

  it('tiny fixed-size chunks split some answers', () => {
    const results = DOCUMENTS.flatMap((d) => {
      const chunks = chunkText(d.text, 'fixed', 40, 0, count)
      return d.questions.map((q) => retrieve(chunks, q.q, answerSpan(d.text, q.answer)).coverage)
    })
    expect(results.filter((c) => c !== 'full').length).toBeGreaterThan(2)
  })
})
