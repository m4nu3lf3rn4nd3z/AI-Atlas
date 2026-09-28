/* Round-to-nearest integer quantization, the building block behind
   Q8_0, Q4_0, AWQ/GPTQ storage and friends.

   Symmetric (absmax): scale = max|x| / qmax, q = round(x / scale).
   Asymmetric (min-max): the range [min, max] is mapped onto [0, 2^b − 1]
   with a zero point, so no level is wasted when values are skewed.

   Values are grouped: each group of `groupSize` consecutive weights gets
   its own scale. Smaller groups track the local range better at the cost
   of storing more scales. */

export interface QuantOptions {
  bits: number
  /** 0 = one scale for the whole tensor. */
  groupSize: number
  symmetric: boolean
}

export interface QuantResult {
  dequantized: Float32Array
  /** Per group: scale and zero point (0 when symmetric). */
  groups: { scale: number; zero: number; start: number; end: number }[]
  mse: number
  /** Signal-to-noise ratio in dB: 10·log10(Σx² / Σ(x − x̂)²). */
  snrDb: number
  maxAbsError: number
  /** RMS error relative to the tensor's standard deviation. */
  relativeRmse: number
  /** Bits per weight including one FP16 scale (and zero point) per group. */
  bitsPerWeight: number
}

export function quantize(values: ArrayLike<number>, { bits, groupSize, symmetric }: QuantOptions): QuantResult {
  const n = values.length
  const size = groupSize > 0 ? groupSize : n
  const out = new Float32Array(n)
  const groups: QuantResult['groups'] = []

  for (let start = 0; start < n; start += size) {
    const end = Math.min(n, start + size)
    let min = Infinity
    let max = -Infinity
    for (let i = start; i < end; i++) {
      min = Math.min(min, values[i]!)
      max = Math.max(max, values[i]!)
    }

    if (symmetric) {
      const qmax = 2 ** (bits - 1) - 1
      const absmax = Math.max(Math.abs(min), Math.abs(max))
      const scale = absmax / qmax || 1
      for (let i = start; i < end; i++) {
        const q = Math.max(-qmax - 1, Math.min(qmax, Math.round(values[i]! / scale)))
        out[i] = q * scale
      }
      groups.push({ scale, zero: 0, start, end })
    } else {
      const levels = 2 ** bits - 1
      const scale = (max - min) / levels || 1
      const zero = Math.round(-min / scale)
      for (let i = start; i < end; i++) {
        const q = Math.max(0, Math.min(levels, Math.round(values[i]! / scale) + zero))
        out[i] = (q - zero) * scale
      }
      groups.push({ scale, zero, start, end })
    }
  }

  let signal = 0
  let noise = 0
  let maxAbsError = 0
  let mean = 0
  for (let i = 0; i < n; i++) mean += values[i]!
  mean /= n
  let variance = 0
  for (let i = 0; i < n; i++) {
    const e = values[i]! - out[i]!
    signal += values[i]! ** 2
    noise += e * e
    variance += (values[i]! - mean) ** 2
    maxAbsError = Math.max(maxAbsError, Math.abs(e))
  }
  const mse = noise / n
  const std = Math.sqrt(variance / n)
  const overhead = groupSize > 0 ? (symmetric ? 16 : 32) / groupSize : 0

  return {
    dequantized: out,
    groups,
    mse,
    snrDb: noise === 0 ? Infinity : 10 * Math.log10(signal / noise),
    maxAbsError,
    relativeRmse: std ? Math.sqrt(mse) / std : 0,
    bitsPerWeight: bits + overhead,
  }
}

/** Grid of representable values for one group, for plotting. */
export function levelsOf(group: QuantResult['groups'][number], bits: number, symmetric: boolean): number[] {
  const out: number[] = []
  if (symmetric) {
    const qmax = 2 ** (bits - 1) - 1
    for (let q = -qmax - 1; q <= qmax; q++) out.push(q * group.scale)
  } else {
    for (let q = 0; q <= 2 ** bits - 1; q++) out.push((q - group.zero) * group.scale)
  }
  return out
}

export interface Bin {
  x0: number
  x1: number
  count: number
}

export function histogram(values: ArrayLike<number>, bins: number, lo: number, hi: number): Bin[] {
  const width = (hi - lo) / bins
  const out: Bin[] = Array.from({ length: bins }, (_, i) => ({ x0: lo + i * width, x1: lo + (i + 1) * width, count: 0 }))
  for (let i = 0; i < values.length; i++) {
    const k = Math.floor((values[i]! - lo) / width)
    if (k >= 0 && k < bins) out[k]!.count++
    else if (values[i] === hi) out[bins - 1]!.count++
  }
  return out
}

export function stats(values: ArrayLike<number>) {
  let sum = 0
  let absmax = 0
  for (let i = 0; i < values.length; i++) {
    sum += values[i]!
    absmax = Math.max(absmax, Math.abs(values[i]!))
  }
  const mean = sum / values.length
  let v = 0
  for (let i = 0; i < values.length; i++) v += (values[i]! - mean) ** 2
  return { mean, std: Math.sqrt(v / values.length), absmax }
}
