/* Decoding math shared by the Sampling widget and lab.
   Order follows Hugging Face transformers (temperature first, then top-k,
   top-p, min-p). llama.cpp's default chain applies temperature last,
   which changes results when combined with the filters. */

export interface SamplingParams {
  temperature: number
  topK?: number
  topP?: number
  minP?: number
}

export function argmax(xs: readonly number[]): number {
  let best = 0
  for (let i = 1; i < xs.length; i++) if (xs[i]! > xs[best]!) best = i
  return best
}

/** Softmax with temperature. T = 0 is treated as greedy (one-hot on the argmax). */
export function softmax(logits: readonly number[], temperature = 1): number[] {
  if (logits.length === 0) return []
  if (temperature <= 0) {
    const m = argmax(logits)
    return logits.map((_, i) => (i === m ? 1 : 0))
  }
  const scaled = logits.map((l) => l / temperature)
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

function renormalize(probs: number[]): number[] {
  const sum = probs.reduce((a, b) => a + b, 0)
  return sum > 0 ? probs.map((p) => p / sum) : probs
}

/** Keep the k most probable tokens. */
export function topK(probs: readonly number[], k: number): number[] {
  if (k <= 0 || k >= probs.length) return [...probs]
  const threshold = [...probs].sort((a, b) => b - a)[k - 1]!
  let kept = 0
  return renormalize(
    probs.map((p) => {
      if (p >= threshold && kept < k) {
        kept++
        return p
      }
      return 0
    }),
  )
}

/** Keep the smallest set of tokens whose cumulative probability reaches p. */
export function topP(probs: readonly number[], p: number): number[] {
  if (p >= 1) return [...probs]
  const order = probs.map((prob, i) => ({ prob, i })).sort((a, b) => b.prob - a.prob)
  const keep = new Set<number>()
  let cumulative = 0
  for (const { prob, i } of order) {
    keep.add(i)
    cumulative += prob
    if (cumulative >= p) break
  }
  return renormalize(probs.map((prob, i) => (keep.has(i) ? prob : 0)))
}

/** Drop tokens with probability below minP × max probability. */
export function minP(probs: readonly number[], m: number): number[] {
  if (m <= 0) return [...probs]
  const max = Math.max(...probs)
  return renormalize(probs.map((p) => (p >= m * max ? p : 0)))
}

/** Full pipeline: logits → final distribution the sampler draws from. */
export function distribution(logits: readonly number[], params: SamplingParams): number[] {
  let probs = softmax(logits, params.temperature)
  if (params.topK) probs = topK(probs, params.topK)
  if (params.topP !== undefined && params.topP < 1) probs = topP(probs, params.topP)
  if (params.minP) probs = minP(probs, params.minP)
  return probs
}

/** Draw an index from a distribution using inverse-CDF sampling. */
export function sample(probs: readonly number[], rand: () => number = Math.random): number {
  const r = rand()
  let acc = 0
  for (let i = 0; i < probs.length; i++) {
    acc += probs[i]!
    if (r < acc) return i
  }
  return argmax(probs)
}

/** Shannon entropy in bits: how "undecided" the distribution is. */
export function entropy(probs: readonly number[]): number {
  return -probs.reduce((h, p) => (p > 0 ? h + p * Math.log2(p) : h), 0)
}
