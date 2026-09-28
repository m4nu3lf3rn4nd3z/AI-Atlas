/* Memory and speed model for running an LLM.

   Memory = weights + KV cache + runtime overhead.
   Decode is memory-bandwidth bound: each generated token reads the active
   weights plus the whole KV cache once, so tokens/s ≈ bandwidth / bytes read.

   Architectures come from each model's config.json on Hugging Face
   (checked 2026-09). */

export const GIB = 2 ** 30

/** Layers that share the same attention layout. */
export interface AttentionGroup {
  layers: number
  kvHeads: number
  headDim: number
  /** Sliding window: only the last `window` tokens are cached. */
  window?: number
  /** Multi-head latent attention (DeepSeek): one compressed latent per token instead of K and V per head. */
  latent?: number
}

export interface ModelConfig {
  id: string
  name: string
  /** Total parameters, in billions. All of them must fit in memory. */
  params: number
  /** Parameters used per token (MoE), in billions. Defaults to `params`. */
  active?: number
  layers: number
  attention: readonly AttentionGroup[]
  /** Linear-attention layers (Gated DeltaNet) keep a fixed-size state per sequence instead of a KV cache. */
  linear?: { layers: number; heads: number; keyDim: number; valueDim: number; bytes: number }
  maxContext: number
  note?: string
}

const gqa = (layers: number, kvHeads: number, headDim: number): AttentionGroup[] => [{ layers, kvHeads, headDim }]

export const MODELS: readonly ModelConfig[] = [
  { id: 'llama-3.2-1b', name: 'Llama 3.2 1B', params: 1.24, layers: 16, attention: gqa(16, 8, 64), maxContext: 131072 },
  { id: 'llama-3.2-3b', name: 'Llama 3.2 3B', params: 3.21, layers: 28, attention: gqa(28, 8, 128), maxContext: 131072 },
  { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', params: 8.03, layers: 32, attention: gqa(32, 8, 128), maxContext: 131072 },
  {
    id: 'qwen3-8b',
    name: 'Qwen3 8B',
    params: 8.19,
    layers: 36,
    attention: gqa(36, 8, 128),
    maxContext: 131072,
    note: '32k nativo; 128k con escalado YaRN.',
  },
  {
    id: 'gemma-3-27b',
    name: 'Gemma 3 27B',
    params: 27.4,
    layers: 62,
    attention: [
      { layers: 10, kvHeads: 16, headDim: 128 },
      { layers: 52, kvHeads: 16, headDim: 128, window: 1024 },
    ],
    maxContext: 131072,
    note: '5 de cada 6 capas usan una ventana deslizante de 1.024 tokens.',
  },
  {
    id: 'gemma-4-31b',
    name: 'Gemma 4 31B',
    params: 31.3,
    layers: 60,
    attention: [
      { layers: 10, kvHeads: 4, headDim: 512 },
      { layers: 50, kvHeads: 16, headDim: 256, window: 1024 },
    ],
    maxContext: 262144,
    note: '5 de cada 6 capas usan una ventana deslizante de 1.024 tokens; las globales, 4 cabezas KV de 512.',
  },
  {
    id: 'qwen3-32b',
    name: 'Qwen3 32B',
    params: 32.8,
    layers: 64,
    attention: gqa(64, 8, 128),
    maxContext: 131072,
    note: '32k nativo; 128k con escalado YaRN.',
  },
  { id: 'llama-3.3-70b', name: 'Llama 3.3 70B', params: 70.6, layers: 80, attention: gqa(80, 8, 128), maxContext: 131072 },
  {
    id: 'gpt-oss-20b',
    name: 'gpt-oss-20b',
    params: 21,
    active: 3.6,
    layers: 24,
    attention: [
      { layers: 12, kvHeads: 8, headDim: 64 },
      { layers: 12, kvHeads: 8, headDim: 64, window: 128 },
    ],
    maxContext: 131072,
    note: 'MoE con 32 expertos (4 activos). Se publica en MXFP4. Alterna capas globales y de ventana de 128 tokens.',
  },
  {
    id: 'gemma-4-26b-a4b',
    name: 'Gemma 4 26B-A4B',
    params: 25.8,
    active: 3.8,
    layers: 30,
    attention: [
      { layers: 5, kvHeads: 2, headDim: 512 },
      { layers: 25, kvHeads: 8, headDim: 256, window: 1024 },
    ],
    maxContext: 262144,
    note: 'MoE con 128 expertos (8 activos + 1 compartido). 5 de cada 6 capas con ventana de 1.024 tokens.',
  },
  {
    id: 'qwen3-30b-a3b',
    name: 'Qwen3 30B-A3B',
    params: 30.5,
    active: 3.3,
    layers: 48,
    attention: gqa(48, 4, 128),
    maxContext: 131072,
    note: 'MoE con 128 expertos (8 activos).',
  },
  {
    id: 'qwen3.6-35b-a3b',
    name: 'Qwen3.6 35B-A3B',
    params: 36,
    active: 3,
    layers: 40,
    attention: gqa(10, 2, 256),
    linear: { layers: 30, heads: 32, keyDim: 128, valueDim: 128, bytes: 4 },
    maxContext: 262144,
    note: 'Híbrido: 3 de cada 4 capas usan atención lineal (Gated DeltaNet) con un estado fijo en lugar de KV cache. MoE con 256 expertos.',
  },
  {
    id: 'gpt-oss-120b',
    name: 'gpt-oss-120b',
    params: 117,
    active: 5.1,
    layers: 36,
    attention: [
      { layers: 18, kvHeads: 8, headDim: 64 },
      { layers: 18, kvHeads: 8, headDim: 64, window: 128 },
    ],
    maxContext: 131072,
    note: 'MoE con 128 expertos (4 activos). Se publica en MXFP4. Alterna capas globales y de ventana de 128 tokens.',
  },
  {
    id: 'qwen3.5-122b-a10b',
    name: 'Qwen3.5 122B-A10B',
    params: 125,
    active: 10,
    layers: 48,
    attention: gqa(12, 2, 256),
    linear: { layers: 36, heads: 64, keyDim: 128, valueDim: 128, bytes: 4 },
    maxContext: 262144,
    note: 'Híbrido: 3 de cada 4 capas usan atención lineal (Gated DeltaNet). MoE con 256 expertos.',
  },
  {
    id: 'qwen3-235b-a22b',
    name: 'Qwen3 235B-A22B',
    params: 235,
    active: 22,
    layers: 94,
    attention: gqa(94, 4, 128),
    maxContext: 131072,
    note: 'MoE con 128 expertos (8 activos).',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 / R1',
    params: 671,
    active: 37,
    layers: 61,
    attention: [{ layers: 61, kvHeads: 128, headDim: 128, latent: 576 }],
    maxContext: 131072,
    note: 'MoE con 256 expertos (8 activos). La atención latente (MLA) guarda 576 valores por token y capa.',
  },
]

export const MODEL_BY_ID: ReadonlyMap<string, ModelConfig> = new Map(MODELS.map((m) => [m.id, m]))

export interface NumberFormat {
  id: string
  label: string
  /** Effective bits per value, including scales and zero points. */
  bits: number
  note: string
}

/* GGUF sizes are the effective bits llama.cpp reports for Llama 3.1 8B
   (tools/quantize/README.md). k-quants mix precisions per tensor, so they
   vary a few percent between models. */
export const WEIGHT_FORMATS: readonly NumberFormat[] = [
  { id: 'bf16', label: 'BF16', bits: 16, note: 'El formato en que se publican casi todos los modelos. Sin pérdida.' },
  { id: 'q8_0', label: 'Q8_0', bits: 8.5, note: 'GGUF: 8 bits + una escala por bloque de 32. Pérdida inapreciable.' },
  { id: 'fp8', label: 'FP8', bits: 8, note: 'Nativo en GPUs Ada, Hopper y Blackwell. Calidad casi idéntica a BF16.' },
  { id: 'q6_k', label: 'Q6_K', bits: 6.56, note: 'GGUF k-quant. Prácticamente indistinguible de Q8_0.' },
  { id: 'q5_k_m', label: 'Q5_K_M', bits: 5.7, note: 'GGUF k-quant. Muy poca pérdida.' },
  { id: 'q4_k_m', label: 'Q4_K_M', bits: 4.89, note: 'El punto dulce habitual en local: ~¼ de la memoria de BF16 con poca pérdida.' },
  { id: 'int4', label: 'INT4 AWQ/GPTQ', bits: 4.25, note: '4 bits con escala por grupo de 128. Habitual en vLLM y TensorRT-LLM.' },
  { id: 'q3_k_m', label: 'Q3_K_M', bits: 4, note: 'Pérdida ya notable, sobre todo en modelos pequeños.' },
  { id: 'q2_k', label: 'Q2_K', bits: 3.16, note: 'Degradación clara. Solo compensa para meter un modelo enorme.' },
]

export const KV_FORMATS: readonly NumberFormat[] = [
  { id: 'f16', label: 'FP16', bits: 16, note: 'Por defecto en todos los runtimes.' },
  { id: 'fp8', label: 'FP8', bits: 8, note: 'vLLM y TensorRT-LLM. Mitad de memoria, pérdida pequeña.' },
  { id: 'q8_0', label: 'Q8_0', bits: 8.5, note: 'llama.cpp y Ollama (requiere flash attention).' },
  { id: 'q4_0', label: 'Q4_0', bits: 4.5, note: 'llama.cpp. Un cuarto de memoria; puede degradar contextos largos.' },
]

export interface Device {
  id: string
  name: string
  memory: number
  /** Memory bandwidth in GB/s. */
  bandwidth: number
  /** Shared CPU/GPU memory: the OS keeps part of it (≈25% by default). */
  unified?: boolean
  group: 'consumer' | 'unified' | 'datacenter'
}

export const DEVICES: readonly Device[] = [
  { id: 'rtx-3060', name: 'RTX 3060 12 GB', memory: 12, bandwidth: 360, group: 'consumer' },
  { id: 'rtx-4060ti', name: 'RTX 4060 Ti 16 GB', memory: 16, bandwidth: 288, group: 'consumer' },
  { id: 'rtx-3090', name: 'RTX 3090 24 GB', memory: 24, bandwidth: 936, group: 'consumer' },
  { id: 'rtx-4090', name: 'RTX 4090 24 GB', memory: 24, bandwidth: 1008, group: 'consumer' },
  { id: 'rtx-5090', name: 'RTX 5090 32 GB', memory: 32, bandwidth: 1792, group: 'consumer' },
  { id: 'cpu-ddr5', name: 'Solo CPU · 64 GB DDR5', memory: 64, bandwidth: 90, group: 'consumer' },
  { id: 'm4-pro', name: 'Mac M4 Pro 48 GB', memory: 48, bandwidth: 273, unified: true, group: 'unified' },
  { id: 'm4-max', name: 'Mac M4 Max 128 GB', memory: 128, bandwidth: 546, unified: true, group: 'unified' },
  { id: 'm3-ultra', name: 'Mac M3 Ultra 512 GB', memory: 512, bandwidth: 819, unified: true, group: 'unified' },
  { id: 'dgx-spark', name: 'DGX Spark 128 GB', memory: 128, bandwidth: 273, unified: true, group: 'unified' },
  { id: 'l4', name: 'NVIDIA L4 24 GB', memory: 24, bandwidth: 300, group: 'datacenter' },
  { id: 'a100', name: 'NVIDIA A100 80 GB', memory: 80, bandwidth: 2039, group: 'datacenter' },
  { id: 'h100', name: 'NVIDIA H100 80 GB', memory: 80, bandwidth: 3350, group: 'datacenter' },
  { id: 'h200', name: 'NVIDIA H200 141 GB', memory: 141, bandwidth: 4800, group: 'datacenter' },
  { id: 'mi300x', name: 'AMD MI300X 192 GB', memory: 192, bandwidth: 5300, group: 'datacenter' },
]

export const DEVICE_BY_ID: ReadonlyMap<string, Device> = new Map(DEVICES.map((d) => [d.id, d]))

/** Runtime overhead per device: CUDA/Metal context, activation and logit buffers. */
export const OVERHEAD_GIB = 1
/** Share of unified memory the GPU may use by default. */
export const UNIFIED_USABLE = 0.75
/** Real decode rarely exceeds ~70% of the theoretical bandwidth. */
export const BANDWIDTH_EFFICIENCY = 0.7

export interface Setup {
  model: ModelConfig
  weightBits: number
  kvBits: number
  context: number
  /** Sequences decoded at the same time (concurrent users). */
  batch: number
  device: Device
  count: number
}

export const weightBytes = (m: ModelConfig, bits: number) => (m.params * 1e9 * bits) / 8
export const activeWeightBytes = (m: ModelConfig, bits: number) => ((m.active ?? m.params) * 1e9 * bits) / 8

/** Values cached per token in one layer of the group: K and V for every KV head, or the MLA latent. */
export const groupValuesPerToken = (g: AttentionGroup) => g.latent ?? 2 * g.kvHeads * g.headDim

/** KV bytes one token adds across all layers of a group. */
export const groupBytesPerToken = (g: AttentionGroup, bits: number) => (g.layers * groupValuesPerToken(g) * bits) / 8

/** Values cached for one sequence of `context` tokens, summed over layers. */
export function cachedValues(m: ModelConfig, context: number): number {
  return m.attention.reduce((sum, g) => sum + g.layers * groupValuesPerToken(g) * Math.min(context, g.window ?? Infinity), 0)
}

/** Fixed recurrent state of the linear-attention layers, per sequence. */
export const linearStateBytes = (m: ModelConfig) =>
  m.linear ? m.linear.layers * m.linear.heads * m.linear.keyDim * m.linear.valueDim * m.linear.bytes : 0

/** KV cache (plus linear-attention state) for one sequence. */
export const kvBytesPerSequence = (m: ModelConfig, context: number, bits: number) =>
  (cachedValues(m, context) * bits) / 8 + linearStateBytes(m)

/** KV bytes each token adds while the context is shorter than every sliding window. */
export const kvBytesPerToken = (m: ModelConfig, bits: number) =>
  (m.attention.reduce((sum, g) => sum + g.layers * groupValuesPerToken(g), 0) * bits) / 8

/** KV bytes each token adds once the sliding windows are full (only global layers keep growing). */
export const kvBytesPerTokenLongContext = (m: ModelConfig, bits: number) =>
  (m.attention.filter((g) => !g.window).reduce((sum, g) => sum + g.layers * groupValuesPerToken(g), 0) * bits) / 8
export const capacityGiB = (d: Device, count: number) => d.memory * count * (d.unified ? UNIFIED_USABLE : 1)

export interface Breakdown {
  weights: number
  kv: number
  overhead: number
  total: number
  capacity: number
}

/** Memory in GiB. */
export function memory(s: Setup): Breakdown {
  const weights = weightBytes(s.model, s.weightBits) / GIB
  const kv = (kvBytesPerSequence(s.model, s.context, s.kvBits) * s.batch) / GIB
  const overhead = OVERHEAD_GIB * s.count
  return { weights, kv, overhead, total: weights + kv + overhead, capacity: capacityGiB(s.device, s.count) }
}

export type Fit = 'fits' | 'tight' | 'no'

export function fit(b: Breakdown): Fit {
  if (b.total <= b.capacity * 0.9) return 'fits'
  if (b.total <= b.capacity) return 'tight'
  return 'no'
}

/** Largest context (tokens) that fits, or 0 if not even the weights fit. */
export function maxContextThatFits(s: Setup): number {
  const at = (context: number) => memory({ ...s, context }).total <= memory(s).capacity
  if (!at(1)) return 0
  if (at(s.model.maxContext)) return s.model.maxContext
  let lo = 1
  let hi = s.model.maxContext
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2)
    if (at(mid)) lo = mid
    else hi = mid
  }
  return lo
}

/** The highest-quality weight format that fits with the current context. */
export function bestFormatThatFits(s: Setup): NumberFormat | undefined {
  return WEIGHT_FORMATS.find((f) => fit(memory({ ...s, weightBits: f.bits })) !== 'no')
}

/** Estimated decode speed, per sequence and aggregate, in tokens/s. */
export function decodeSpeed(s: Setup): { perSequence: number; total: number } {
  const bytesPerStep = activeWeightBytes(s.model, s.weightBits) + kvBytesPerSequence(s.model, s.context, s.kvBits) * s.batch
  const bandwidth = s.device.bandwidth * 1e9 * s.count * BANDWIDTH_EFFICIENCY
  const perSequence = bandwidth / bytesPerStep
  return { perSequence, total: perSequence * s.batch }
}

/** Context sizes offered by the slider: powers of two from 1k to the model's maximum. */
export function contextSteps(max: number): number[] {
  const steps: number[] = []
  for (let c = 1024; c <= max; c *= 2) steps.push(c)
  if (steps.at(-1) !== max) steps.push(max)
  return steps
}

export const BATCH_STEPS = [1, 2, 4, 8, 16, 32, 64] as const
export const GPU_COUNTS = [1, 2, 4, 8] as const

export function formatTokens(n: number): string {
  if (n >= 1024 * 1024) return `${+(n / (1024 * 1024)).toFixed(1)}M`
  if (n >= 1024) return `${Math.round(n / 1024)}k`
  return String(n)
}

export function formatGiB(n: number): string {
  if (n >= 100) return n.toFixed(0)
  if (n >= 10) return n.toFixed(1)
  return n.toFixed(2)
}
