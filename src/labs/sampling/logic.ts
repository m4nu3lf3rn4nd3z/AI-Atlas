/* Decoding over a real next-token distribution.

   Each step stores the top logits exactly and the rest of the vocabulary as
   a histogram (logit bin centre → number of tokens). Every token in a bin
   has the same probability, which is enough to apply temperature, top-k,
   top-p and min-p over the full ~150k-token vocabulary.

   Order of the filters as in Hugging Face transformers: temperature, then
   top-k, top-p and min-p. */

export interface TopToken {
  id: number
  /** Decoded text of the token (may be a piece of a word). */
  t: string
  /** Logit. */
  l: number
}

export interface Step {
  top: TopToken[]
  tail: [number, number][]
}

export interface Params {
  temperature: number
  /** 0 = off. */
  topK: number
  /** 1 = off. */
  topP: number
  /** 0 = off. */
  minP: number
}

export const DEFAULT_PARAMS: Params = { temperature: 1, topK: 0, topP: 1, minP: 0 }

export interface TokenProb {
  token: TopToken
  /** Probability before filters (after temperature). */
  base: number
  /** Probability the sampler actually uses (0 if filtered out). */
  p: number
}

export interface Distribution {
  tokens: TokenProb[]
  /** The rest of the vocabulary, aggregated. */
  rest: { count: number; base: number; p: number; kept: number }
  /** Tokens that can still be drawn. */
  candidates: number
  /** Shannon entropy of the final distribution, in bits. */
  entropy: number
}

interface Unit {
  /** Unnormalized weight of ONE token. */
  w: number
  count: number
  index: number // ≥ 0: top token; < 0: tail bin
}

export function distribution(step: Step, params: Params): Distribution {
  const T = params.temperature
  const lmax = step.top[0]!.l
  const units: Unit[] = [
    ...step.top.map((t, i) => ({ w: T <= 0 ? (i === 0 ? 1 : 0) : Math.exp((t.l - lmax) / T), count: 1, index: i })),
    ...step.tail.map(([c, n], b) => ({ w: T <= 0 ? 0 : Math.exp((c - lmax) / T), count: n, index: -1 - b })),
  ]
  const z = units.reduce((s, u) => s + u.w * u.count, 0)
  const base = units.map((u) => u.w / z) // per token

  // Kept tokens per unit (0..count). Units are already sorted by weight.
  let kept = units.map((u, i) => (base[i]! > 0 ? u.count : 0))
  if (params.topK > 0) {
    let left = params.topK
    kept = kept.map((c) => {
      const k = Math.min(c, left)
      left -= k
      return k
    })
  }
  if (params.topP < 1) {
    let cum = 0
    kept = kept.map((c, i) => {
      if (cum >= params.topP || c === 0) return 0
      const per = base[i]!
      const need = Math.min(c, Math.ceil((params.topP - cum) / per - 1e-12))
      cum += need * per
      return need
    })
  }
  if (params.minP > 0) {
    const threshold = params.minP * base[0]!
    kept = kept.map((c, i) => (base[i]! >= threshold ? c : 0))
  }

  const mass = kept.reduce((s, c, i) => s + c * base[i]!, 0)
  const final = base.map((b, i) => (kept[i]! > 0 ? b / mass : 0))

  let entropy = 0
  units.forEach((_, i) => {
    const p = final[i]!
    if (p > 0) entropy -= kept[i]! * p * Math.log2(p)
  })

  const topCount = step.top.length
  const tailIdx = units.map((_, i) => i).filter((i) => i >= topCount)
  return {
    tokens: step.top.map((token, i) => ({ token, base: base[i]!, p: kept[i]! ? final[i]! : 0 })),
    rest: {
      count: tailIdx.reduce((s, i) => s + units[i]!.count, 0),
      base: tailIdx.reduce((s, i) => s + base[i]! * units[i]!.count, 0),
      p: tailIdx.reduce((s, i) => s + final[i]! * kept[i]!, 0),
      kept: tailIdx.reduce((s, i) => s + kept[i]!, 0),
    },
    candidates: kept.reduce((s, c) => s + c, 0),
    entropy,
  }
}

/** Small seeded PRNG (mulberry32), so a set of samples can be replayed. */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Draw n tokens; returns counts per top token index, plus draws from the rest of the vocabulary. */
export function drawMany(d: Distribution, n: number, seed: number): { counts: number[]; rest: number } {
  const rand = rng(seed)
  const counts = d.tokens.map(() => 0)
  let rest = 0
  for (let k = 0; k < n; k++) {
    let r = rand()
    let hit = -1
    for (let i = 0; i < d.tokens.length; i++) {
      r -= d.tokens[i]!.p
      if (r < 0) {
        hit = i
        break
      }
    }
    if (hit >= 0) counts[hit]!++
    else rest++
  }
  return { counts, rest }
}

/** Show whitespace inside tokens. */
export const visibleToken = (t: string) => t.replace(/ /g, '·').replace(/\n/g, '↵')
