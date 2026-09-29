/* Precomputed embeddings are shipped as int8 with one scale per vector
   (see scripts/gen-embeddings.mjs). This module decodes them and offers
   the small linear algebra the labs need. */

export interface PackedVectors {
  model: string
  dtype: string
  dims: number
  items: Record<string, { s: number; v: string }>
}

export function normalizeVector(v: Float32Array): Float32Array {
  let n = 0
  for (let i = 0; i < v.length; i++) n += v[i]! * v[i]!
  n = Math.sqrt(n) || 1
  for (let i = 0; i < v.length; i++) v[i]! /= n
  return v
}

function fromBase64(b64: string): Int8Array {
  const bin = atob(b64)
  const out = new Int8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = (bin.charCodeAt(i) << 24) >> 24
  return out
}

export function decodeVectors(packed: PackedVectors): Map<string, Float32Array> {
  const out = new Map<string, Float32Array>()
  for (const [text, { s, v }] of Object.entries(packed.items)) {
    out.set(text, normalizeVector(Float32Array.from(fromBase64(v), (q) => q * s)))
  }
  return out
}

/**
 * First two principal components, computed on the N×N Gram matrix (cheap
 * when there are far fewer points than dimensions). Returns 2D coordinates
 * and the share of variance each component explains.
 */
export function pca2(vectors: readonly ArrayLike<number>[]): { points: [number, number][]; explained: [number, number] } {
  const n = vectors.length
  if (n === 0) return { points: [], explained: [0, 0] }
  const d = vectors[0]!.length
  const mean = new Float64Array(d)
  for (const v of vectors) for (let k = 0; k < d; k++) mean[k]! += v[k]! / n
  const X = vectors.map((v) => Float64Array.from({ length: d }, (_, k) => v[k]! - mean[k]!))
  const K = X.map((a) => X.map((b) => a.reduce((s, x, k) => s + x * b[k]!, 0)))
  const trace = K.reduce((s, row, i) => s + row[i]!, 0) || 1

  const components: { u: Float64Array; lambda: number }[] = []
  for (let c = 0; c < 2; c++) {
    let u = Float64Array.from({ length: n }, (_, i) => 1 + ((i * 7 + c * 3) % 5) / 10)
    let lambda = 0
    for (let it = 0; it < 300; it++) {
      const next = new Float64Array(n)
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) next[i]! += K[i]![j]! * u[j]!
      const norm = Math.hypot(...next) || 1
      next.forEach((x, i) => (next[i] = x / norm))
      lambda = norm
      u = next
    }
    // Deterministic sign: the largest component is positive.
    const big = u.reduce((best, x, i) => (Math.abs(x) > Math.abs(u[best]!) ? i : best), 0)
    if (u[big]! < 0) u = u.map((x) => -x)
    components.push({ u, lambda })
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) K[i]![j]! -= lambda * u[i]! * u[j]!
  }
  const [a, b] = components as [{ u: Float64Array; lambda: number }, { u: Float64Array; lambda: number }]
  return {
    points: Array.from({ length: n }, (_, i) => [a.u[i]! * Math.sqrt(a.lambda), b.u[i]! * Math.sqrt(b.lambda)]),
    explained: [a.lambda / trace, b.lambda / trace],
  }
}
