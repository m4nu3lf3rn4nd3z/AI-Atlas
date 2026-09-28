import { describe, expect, it } from 'vitest'
import {
  cachedValues,
  contextSteps,
  kvBytesPerTokenLongContext,
  linearStateBytes,
  decodeSpeed,
  DEVICE_BY_ID,
  fit,
  GIB,
  kvBytesPerSequence,
  kvBytesPerToken,
  maxContextThatFits,
  memory,
  MODEL_BY_ID,
  MODELS,
  weightBytes,
  WEIGHT_FORMATS,
  type Setup,
} from './logic'
import { histogram, levelsOf, quantize, stats } from './quant'
import weights from './weights.json'

const m = (id: string) => MODEL_BY_ID.get(id)!
const setup = (over: Partial<Setup> = {}): Setup => ({
  model: m('llama-3.1-8b'),
  weightBits: 4.89,
  kvBits: 16,
  context: 8192,
  batch: 1,
  device: DEVICE_BY_ID.get('rtx-4090')!,
  count: 1,
  ...over,
})

describe('memory model', () => {
  it('weights: params × bits / 8', () => {
    expect(weightBytes(m('llama-3.1-8b'), 16)).toBeCloseTo(8.03e9 * 2, -2)
    expect(weightBytes(m('llama-3.1-8b'), 16) / GIB).toBeCloseTo(14.96, 2)
  })

  it('KV cache matches the known figures for Llama 3.1', () => {
    // 32 layers × 2 (K,V) × 8 heads × 128 dims × 2 bytes = 128 KiB per token
    expect(kvBytesPerToken(m('llama-3.1-8b'), 16)).toBe(128 * 1024)
    // 128k tokens → 16 GiB for 8B, 40 GiB for 70B
    expect(kvBytesPerSequence(m('llama-3.1-8b'), 131072, 16) / GIB).toBe(16)
    expect(kvBytesPerSequence(m('llama-3.3-70b'), 131072, 16) / GIB).toBe(40)
  })

  it('sliding-window layers stop growing past the window', () => {
    const g = m('gemma-3-27b')
    const perLayer = 2 * 16 * 128
    expect(cachedValues(g, 512)).toBe(62 * perLayer * 512)
    expect(cachedValues(g, 131072)).toBe(perLayer * (10 * 131072 + 52 * 1024))
    expect(kvBytesPerTokenLongContext(g, 16)).toBe(10 * perLayer * 2)
  })

  it('MLA caches one latent per token and layer', () => {
    expect(kvBytesPerToken(m('deepseek-v3'), 16)).toBe(61 * 576 * 2)
  })

  it('linear-attention layers add a fixed state instead of a KV cache', () => {
    const q = m('qwen3.6-35b-a3b')
    // 30 layers × 32 heads × 128 × 128 FP32 values = 60 MiB per sequence
    expect(linearStateBytes(q)).toBe(60 * 2 ** 20)
    // 10 full-attention layers × 2 × 2 KV heads × 256 × 2 bytes = 20 KiB per token
    expect(kvBytesPerToken(q, 16)).toBe(20 * 1024)
    expect(kvBytesPerSequence(q, 262144, 16)).toBe(5 * GIB + 60 * 2 ** 20)
  })

  it('KV scales with batch and precision', () => {
    const a = memory(setup({ batch: 1 })).kv
    expect(memory(setup({ batch: 8 })).kv).toBeCloseTo(a * 8)
    expect(memory(setup({ kvBits: 8 })).kv).toBeCloseTo(a / 2)
  })

  it('an 8B model in Q4_K_M fits a 24 GB card; 70B in BF16 does not', () => {
    expect(fit(memory(setup()))).toBe('fits')
    expect(fit(memory(setup({ model: m('llama-3.3-70b'), weightBits: 16 })))).toBe('no')
  })

  it('unified memory only counts the usable share', () => {
    const mac = DEVICE_BY_ID.get('m4-max')!
    expect(memory(setup({ device: mac })).capacity).toBe(96)
  })

  it('maxContextThatFits is the boundary', () => {
    const s = setup({ model: m('llama-3.1-8b'), weightBits: 16 })
    const ctx = maxContextThatFits(s)
    expect(ctx).toBeGreaterThan(0)
    expect(ctx).toBeLessThan(s.model.maxContext)
    expect(memory({ ...s, context: ctx }).total).toBeLessThanOrEqual(memory(s).capacity)
    expect(memory({ ...s, context: ctx + 1 }).total).toBeGreaterThan(memory(s).capacity)
    expect(maxContextThatFits(setup({ model: m('deepseek-v3') }))).toBe(0)
  })

  it('decode speed is bandwidth / bytes read per token', () => {
    const { perSequence } = decodeSpeed(setup({ context: 1 }))
    // 1008 GB/s × 0.7 / (8.03e9 × 4.89 / 8 bytes) ≈ 144 tokens/s
    expect(perSequence).toBeGreaterThan(130)
    expect(perSequence).toBeLessThan(150)
    // MoE: speed follows active parameters, not total
    const moe = decodeSpeed(setup({ model: m('qwen3-30b-a3b'), context: 1 })).perSequence
    expect(moe).toBeGreaterThan(perSequence * 2)
    // Batching raises total throughput but slows each sequence
    const b = decodeSpeed(setup({ batch: 16, context: 32768 }))
    expect(b.total).toBeGreaterThan(perSequence)
    expect(b.perSequence).toBeLessThan(perSequence)
  })

  it('every preset is consistent', () => {
    for (const model of MODELS) {
      expect(model.active ?? model.params).toBeLessThanOrEqual(model.params)
      expect(contextSteps(model.maxContext).at(-1)).toBe(model.maxContext)
      const layers = model.attention.reduce((s, g) => s + g.layers, 0) + (model.linear?.layers ?? 0)
      expect(layers, model.id).toBe(model.layers)
    }
    const bits = WEIGHT_FORMATS.map((f) => f.bits)
    expect([...bits].sort((a, b) => b - a)).toEqual(bits)
  })
})

describe('quantization', () => {
  const values = weights.values

  it('uses a real tensor slice', () => {
    expect(values).toHaveLength(4096)
    expect(weights.dtype).toBe('BF16')
    const s = stats(values)
    expect(Math.abs(s.mean)).toBeLessThan(s.std)
  })

  it('more bits → less error', () => {
    const snr = [8, 6, 4, 3, 2].map((bits) => quantize(values, { bits, groupSize: 64, symmetric: true }).snrDb)
    for (let i = 1; i < snr.length; i++) expect(snr[i]!).toBeLessThan(snr[i - 1]!)
    // Rule of thumb: ~6 dB per bit
    expect(snr[0]! - snr[2]!).toBeGreaterThan(20)
  })

  it('smaller groups → less error but more bits per weight', () => {
    const tensor = quantize(values, { bits: 4, groupSize: 0, symmetric: true })
    const g32 = quantize(values, { bits: 4, groupSize: 32, symmetric: true })
    expect(g32.snrDb).toBeGreaterThan(tensor.snrDb)
    expect(g32.bitsPerWeight).toBe(4.5)
    expect(tensor.bitsPerWeight).toBe(4)
    expect(quantize(values, { bits: 4, groupSize: 32, symmetric: false }).bitsPerWeight).toBe(5)
  })

  it('an outlier hurts per-tensor scaling far more than grouped scaling', () => {
    const withOutlier = [...values]
    withOutlier[5] = stats(values).std * 40
    const drop = (groupSize: number) =>
      quantize(values, { bits: 4, groupSize, symmetric: true }).snrDb -
      quantize(withOutlier, { bits: 4, groupSize, symmetric: true }).snrDb
    expect(drop(0)).toBeGreaterThan(drop(32) + 3)
  })

  it('round-to-nearest error is at most half a step', () => {
    for (const symmetric of [true, false]) {
      const r = quantize(values, { bits: 4, groupSize: 32, symmetric })
      for (const g of r.groups) {
        for (let i = g.start; i < g.end; i++) {
          expect(Math.abs(values[i]! - r.dequantized[i]!)).toBeLessThanOrEqual(g.scale / 2 + 1e-9)
        }
      }
    }
  })

  it('exposes 2^bits levels and a complete histogram', () => {
    const r = quantize(values, { bits: 3, groupSize: 0, symmetric: true })
    expect(levelsOf(r.groups[0]!, 3, true)).toHaveLength(8)
    const s = stats(values)
    const bins = histogram(values, 40, -s.absmax, s.absmax)
    expect(bins.reduce((a, b) => a + b.count, 0)).toBe(values.length)
  })
})
