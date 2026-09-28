import { Calculator, CircleCheck, CircleX, Cpu, TriangleAlert } from 'lucide-react'
import { useMemo, useState, type PointerEvent, type ReactNode } from 'react'
import { useElementWidth } from '@/lib/hooks'
import { Field, LegendItem, Panel, Range, Segmented, Select, Stat } from '../kit'
import {
  BATCH_STEPS,
  bestFormatThatFits,
  capacityGiB,
  contextSteps,
  decodeSpeed,
  DEVICE_BY_ID,
  DEVICES,
  fit,
  formatTokens,
  GIB,
  GPU_COUNTS,
  KV_FORMATS,
  kvBytesPerToken,
  kvBytesPerTokenLongContext,
  groupBytesPerToken,
  linearStateBytes,
  type ModelConfig,
  maxContextThatFits,
  memory,
  MODEL_BY_ID,
  MODELS,
  OVERHEAD_GIB,
  UNIFIED_USABLE,
  WEIGHT_FORMATS,
  activeWeightBytes,
  kvBytesPerSequence,
  weightBytes,
  BANDWIDTH_EFFICIENCY,
  type Breakdown,
  type Setup,
} from './logic'
import { QuantExplorer } from './QuantExplorer'

const nf = (digits: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: digits })
const gb = (n: number) => `${nf(n >= 100 ? 0 : n >= 10 ? 1 : 2).format(n)} GB`
const int = (n: number) => nf(0).format(n)

const COLORS = { weights: 'var(--chart-1)', kv: 'var(--chart-2)', overhead: 'var(--fg-subtle)' }

const MODEL_GROUPS = [
  { label: 'Densos', options: MODELS.filter((m) => !m.active).map((m) => ({ value: m.id, label: m.name })) },
  { label: 'Mixture of Experts', options: MODELS.filter((m) => m.active).map((m) => ({ value: m.id, label: m.name })) },
]
const DEVICE_GROUPS = [
  { label: 'Consumo', group: 'consumer' },
  { label: 'Memoria unificada', group: 'unified' },
  { label: 'Centro de datos', group: 'datacenter' },
].map((g) => ({ label: g.label, options: DEVICES.filter((d) => d.group === g.group).map((d) => ({ value: d.id, label: d.name })) }))

export default function VramLab() {
  const [modelId, setModelId] = useState('llama-3.1-8b')
  const [deviceId, setDeviceId] = useState('rtx-4090')
  const [count, setCount] = useState<number>(1)
  const [weightId, setWeightId] = useState('q4_k_m')
  const [kvId, setKvId] = useState('f16')
  const [context, setContext] = useState(32768)
  const [batch, setBatch] = useState<number>(1)

  const model = MODEL_BY_ID.get(modelId)!
  const device = DEVICE_BY_ID.get(deviceId)!
  const weightFormat = WEIGHT_FORMATS.find((f) => f.id === weightId)!
  const kvFormat = KV_FORMATS.find((f) => f.id === kvId)!
  const steps = contextSteps(model.maxContext)
  const ctx = Math.min(context, model.maxContext)
  const stepIndex = Math.max(0, steps.findIndex((s) => s >= ctx))

  const setup: Setup = { model, device, count, weightBits: weightFormat.bits, kvBits: kvFormat.bits, context: ctx, batch }
  const b = memory(setup)
  const verdict = fit(b)
  const speed = decodeSpeed(setup)
  const maxCtx = maxContextThatFits(setup)

  return (
    <div className="space-y-5">
      <Panel title="Configuración" icon={<Cpu />}>
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Modelo">
            <Select label="Modelo" value={modelId} onChange={setModelId} groups={MODEL_GROUPS} />
            <p className="mt-1.5 text-[12px] leading-relaxed text-subtle">
              {nf(2).format(model.params)} B parámetros
              {model.active && <> ({nf(1).format(model.active)} B activos por token)</>} · {model.layers} capas ·{' '}
              {describeAttention(model)} · hasta {formatTokens(model.maxContext)}{' '}
              tokens
              {model.note && <span className="block">{model.note}</span>}
            </p>
          </Field>
          <Field label="Hardware">
            <div className="flex gap-2">
              <div className="flex-1">
                <Select label="Hardware" value={deviceId} onChange={setDeviceId} groups={DEVICE_GROUPS} />
              </div>
              <Segmented
                label="Número de dispositivos"
                value={count}
                onChange={setCount}
                wrap={false}
                options={GPU_COUNTS.map((n) => ({ value: n, label: `×${n}` }))}
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-subtle">
              {int(device.memory * count)} GB · {int(device.bandwidth)} GB/s de ancho de banda
              {count > 1 && ' por dispositivo'}
              {device.unified && (
                <span className="block">
                  Memoria unificada: cuento el {UNIFIED_USABLE * 100} % como disponible para el modelo; el sistema se reserva
                  el resto.
                </span>
              )}
            </p>
          </Field>
          <Field label="Formato de los pesos" hint={`≈ ${nf(2).format(weightFormat.bits)} bits/peso`}>
            <Segmented
              label="Formato de los pesos"
              value={weightId}
              onChange={setWeightId}
              options={WEIGHT_FORMATS.map((f) => ({ value: f.id, label: f.label, title: f.note }))}
            />
            <p className="mt-1.5 text-[12px] text-subtle">{weightFormat.note}</p>
          </Field>
          <Field label="Formato del KV cache" hint={`${nf(1).format(kvFormat.bits)} bits/valor`}>
            <Segmented
              label="Formato del KV cache"
              value={kvId}
              onChange={setKvId}
              options={KV_FORMATS.map((f) => ({ value: f.id, label: f.label, title: f.note }))}
            />
            <p className="mt-1.5 text-[12px] text-subtle">{kvFormat.note}</p>
          </Field>
          <Field label="Contexto por secuencia" hint={`${formatTokens(ctx)} tokens`}>
            <Range label="Contexto" min={0} max={steps.length - 1} value={stepIndex} onChange={(i) => setContext(steps[i]!)} />
            <div className="flex justify-between font-mono text-[11px] text-subtle">
              <span>1k</span>
              <span>{formatTokens(model.maxContext)}</span>
            </div>
          </Field>
          <Field label="Secuencias simultáneas" hint={batch === 1 ? 'un usuario' : `${batch} usuarios`}>
            <Segmented label="Secuencias simultáneas" value={batch} onChange={setBatch} options={BATCH_STEPS.map((n) => ({ value: n, label: n }))} />
            <p className="mt-1.5 text-[12px] text-subtle">Cada conversación activa necesita su propio KV cache.</p>
          </Field>
        </div>
      </Panel>

      <Panel>
        <Verdict setup={setup} b={b} />
        <MemoryBar b={b} />
        <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
          <Stat label="Pesos" value={gb(b.weights)} sub={`${nf(2).format(model.params)} B × ${nf(2).format(weightFormat.bits)} bits`} />
          <Stat label="KV cache" value={gb(b.kv)} sub={`${formatTokens(ctx)} tokens × ${batch} ${batch === 1 ? 'secuencia' : 'secuencias'}`} />
          <Stat
            label="Velocidad de generación"
            value={verdict === 'no' ? '—' : `≈ ${int(speed.perSequence)} tok/s`}
            sub={verdict === 'no' ? 'no cabe en memoria' : batch > 1 ? `${int(speed.total)} tok/s en total` : 'límite por ancho de banda'}
          />
          <Stat
            label="Contexto máximo que cabe"
            value={maxCtx === 0 ? '—' : `${formatTokens(maxCtx)}`}
            sub={maxCtx === 0 ? 'ni los pesos caben' : batch > 1 ? `por secuencia, con ${batch}` : 'con esta configuración'}
          />
        </div>
      </Panel>

      <Panel title="Memoria según la longitud del contexto">
        <MemoryChart setup={setup} />
      </Panel>

      <Panel title="La cuenta, paso a paso" icon={<Calculator />}>
        <Formulas setup={setup} />
      </Panel>

      <QuantExplorer />
    </div>
  )
}

function Verdict({ setup, b }: { setup: Setup; b: Breakdown }) {
  const v = fit(b)
  const pct = Math.round((b.total / b.capacity) * 100)
  const used = `Necesita ${gb(b.total)} de ${gb(b.capacity)} disponibles (${pct} %).`
  const tips: ReactNode[] = []
  if (v === 'no') {
    const best = bestFormatThatFits(setup)
    if (best && best.bits < setup.weightBits) tips.push(<>Con pesos en <b>{best.label}</b> cabría.</>)
    const maxCtx = maxContextThatFits(setup)
    if (maxCtx > 0) tips.push(<>Con este formato cabe hasta <b>{formatTokens(maxCtx)}</b> tokens de contexto{setup.batch > 1 && ' por secuencia'}.</>)
    if (setup.kvBits > 8.5 && b.kv > b.weights * 0.25) tips.push(<>Cuantizar el KV cache a 8 bits reduce su parte a la mitad.</>)
    const more = GPU_COUNTS.find((n) => n > setup.count && fit(memory({ ...setup, count: n })) !== 'no')
    if (more && setup.device.group !== 'consumer') tips.push(<>Con {more} dispositivos en paralelo (tensor parallelism) cabría.</>)
    if (b.weights > b.capacity)
      tips.push(<>Ni los pesos caben. llama.cpp puede dejar capas en la RAM del sistema (offload), pero entonces la velocidad cae a la de la CPU.</>)
  }
  const Icon = v === 'fits' ? CircleCheck : v === 'tight' ? TriangleAlert : CircleX
  const tone = v === 'fits' ? 'text-ok' : v === 'tight' ? 'text-warn' : 'text-bad'
  const title = v === 'fits' ? 'Cabe con margen' : v === 'tight' ? 'Cabe muy justo' : 'No cabe'
  return (
    <div className="mb-5">
      <p className="flex items-center gap-2 text-[17px] font-semibold">
        <Icon className={`size-5 ${tone}`} aria-hidden />
        <span className={tone}>{title}</span>
      </p>
      <p className="mt-1 text-[13.5px] text-muted">
        {used}
        {v === 'tight' && ' Deja poco margen para picos de memoria u otras aplicaciones.'}
      </p>
      {tips.length > 0 && (
        <ul className="mt-2 space-y-1">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-[13px] text-muted">
              <span className="text-subtle">→</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function MemoryBar({ b }: { b: Breakdown }) {
  const scale = Math.max(b.total, b.capacity) * 1.04
  const pct = (v: number) => `${(v / scale) * 100}%`
  const capPct = (b.capacity / scale) * 100
  const parts = [
    { key: 'weights', v: b.weights },
    { key: 'kv', v: b.kv },
    { key: 'overhead', v: b.overhead },
  ] as const
  return (
    <div>
      <div className="relative pt-6">
        <div
          className="absolute top-0 font-mono text-[11px] whitespace-nowrap text-muted"
          style={{ left: `${capPct}%`, transform: capPct > 60 ? 'translateX(calc(-100% - 6px))' : 'translateX(6px)' }}
        >
          disponible · {gb(b.capacity)}
        </div>
        <div className="relative h-9 rounded-md bg-surface-2">
          <div className="absolute inset-y-0 left-0 flex gap-[2px]" style={{ width: pct(b.total) }}>
            {parts.map((p, i) => (
              <div
                key={p.key}
                className={`h-full ${i === 0 ? 'rounded-l-md' : ''} ${i === parts.length - 1 ? 'rounded-r-md' : ''}`}
                style={{ flexGrow: p.v, flexBasis: 0, minWidth: p.v > 0 ? 2 : 0, background: COLORS[p.key] }}
              />
            ))}
          </div>
          <div className="absolute -top-1.5 -bottom-1.5 border-l-2 border-dashed border-fg" style={{ left: `${capPct}%` }} />
        </div>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        <LegendItem color={COLORS.weights}>Pesos · {gb(b.weights)}</LegendItem>
        <LegendItem color={COLORS.kv}>KV cache · {gb(b.kv)}</LegendItem>
        <LegendItem color={COLORS.overhead}>Runtime y activaciones · ≈ {gb(b.overhead)}</LegendItem>
        <LegendItem color="var(--fg)" dashed>
          Memoria disponible
        </LegendItem>
      </div>
    </div>
  )
}

const H = 230
const M = { l: 48, r: 14, t: 26, b: 30 }

function MemoryChart({ setup }: { setup: Setup }) {
  const [ref, width] = useElementWidth<HTMLDivElement>()
  const [hover, setHover] = useState<number | null>(null)
  const { model } = setup

  const data = useMemo(() => {
    const lo = Math.log2(1024)
    const hi = Math.log2(model.maxContext)
    return Array.from({ length: 72 }, (_, i) => {
      const context = Math.round(2 ** (lo + ((hi - lo) * i) / 71))
      const m = memory({ ...setup, context })
      return { context, ...m }
    })
  }, [setup, model.maxContext])

  const capacity = capacityGiB(setup.device, setup.count)
  const { max: yMax, step: yStep } = niceScale(Math.max(capacity * 1.1, data.at(-1)!.total * 1.05))
  const iw = Math.max(10, width - M.l - M.r)
  const ih = H - M.t - M.b
  const lx = (c: number) => M.l + (Math.log2(c / 1024) / Math.log2(model.maxContext / 1024)) * iw
  const ly = (v: number) => M.t + ih - (v / yMax) * ih

  const area = (top: (d: (typeof data)[number]) => number, bottom: (d: (typeof data)[number]) => number) =>
    `M${data.map((d) => `${lx(d.context)},${ly(top(d))}`).join('L')}L${[...data]
      .reverse()
      .map((d) => `${lx(d.context)},${ly(bottom(d))}`)
      .join('L')}Z`

  const xTicks = contextSteps(model.maxContext).filter((_, i, arr) => (iw < 420 ? i % 2 === 0 || i === arr.length - 1 : true))
  const yTicks = Array.from({ length: Math.round(yMax / yStep) + 1 }, (_, i) => i * yStep)
  const h = hover !== null ? data[hover]! : null
  const current = memory(setup)

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    let best = 0
    for (let i = 1; i < data.length; i++) if (Math.abs(lx(data[i]!.context) - M.l - x) < Math.abs(lx(data[best]!.context) - M.l - x)) best = i
    setHover(best)
  }

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={H} role="img" aria-label="Memoria total según la longitud del contexto">
          {yTicks.map((t) => (
            <g key={t}>
              <line x1={M.l} x2={M.l + iw} y1={ly(t)} y2={ly(t)} stroke="var(--grid)" />
              <text x={M.l - 6} y={ly(t)} dy="0.32em" textAnchor="end" className="fill-[var(--fg-subtle)] font-mono text-[10.5px]">
                {nf(yStep < 1 ? 2 : 1).format(t)}
              </text>
            </g>
          ))}
          <text x={M.l - 6} y={M.t - 14} textAnchor="end" className="fill-[var(--fg-subtle)] text-[10.5px]">
            GB
          </text>
          {xTicks.map((c) => (
            <text key={c} x={lx(c)} y={H - 10} textAnchor="middle" className="fill-[var(--fg-subtle)] font-mono text-[10.5px]">
              {formatTokens(c)}
            </text>
          ))}

          <path d={area((d) => d.weights, () => 0)} fill={COLORS.weights} opacity={0.9} />
          <path d={area((d) => d.weights + d.overhead, (d) => d.weights)} fill={COLORS.overhead} opacity={0.6} />
          <path d={area((d) => d.total, (d) => d.weights + d.overhead)} fill={COLORS.kv} opacity={0.9} />
          <path
            d={`M${data.map((d) => `${lx(d.context)},${ly(d.weights + d.overhead)}`).join('L')}`}
            fill="none"
            stroke="var(--surface)"
            strokeWidth={2}
          />

          <line x1={M.l} x2={M.l + iw} y1={ly(capacity)} y2={ly(capacity)} stroke="var(--fg)" strokeWidth={1.5} strokeDasharray="5 4" />
          <text x={M.l + iw} y={ly(capacity) - 6} textAnchor="end" className="fill-[var(--fg)] text-[11px]">
            disponible · {gb(capacity)}
          </text>

          <line x1={lx(setup.context)} x2={lx(setup.context)} y1={M.t} y2={M.t + ih} stroke="var(--accent)" strokeWidth={1.5} />
          <circle cx={lx(setup.context)} cy={ly(current.total)} r={4.5} fill="var(--accent)" stroke="var(--surface)" strokeWidth={2} />

          {h && (
            <g pointerEvents="none">
              <line x1={lx(h.context)} x2={lx(h.context)} y1={M.t} y2={M.t + ih} stroke="var(--fg-muted)" strokeDasharray="2 3" />
              <circle cx={lx(h.context)} cy={ly(h.total)} r={4} fill="var(--fg)" stroke="var(--surface)" strokeWidth={2} />
            </g>
          )}
          <rect
            x={M.l}
            y={M.t}
            width={iw}
            height={ih}
            fill="transparent"
            onPointerMove={onMove}
            onPointerDown={onMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
        {h && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] shadow-lg shadow-black/10"
            style={lx(h.context) > width / 2 ? { right: width - lx(h.context) + 10 } : { left: lx(h.context) + 10 }}
          >
            <div className="font-mono font-medium">{formatTokens(h.context)} tokens</div>
            <div className="text-muted">Pesos {gb(h.weights)}</div>
            <div className="text-muted">KV cache {gb(h.kv)}</div>
            <div>
              Total <b className="font-mono">{gb(h.total)}</b> {h.total > h.capacity ? '· no cabe' : ''}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <LegendItem color={COLORS.weights}>Pesos</LegendItem>
        <LegendItem color={COLORS.overhead}>Runtime</LegendItem>
        <LegendItem color={COLORS.kv}>KV cache</LegendItem>
        <LegendItem color="var(--accent)">Tu contexto</LegendItem>
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-muted">
        Los pesos ocupan lo mismo siempre; el KV cache crece con cada token de contexto y con cada usuario simultáneo.
        {' '}
        {chartNote(model)}
      </p>
    </div>
  )
}

function chartNote(model: ModelConfig): string {
  const full = model.attention.filter((g) => !g.window).reduce((s, g) => s + g.layers, 0)
  const window = model.attention.find((g) => g.window)?.window
  if (window)
    return `En ${model.name} la curva se aplana: solo ${full} de ${model.layers} capas guardan todo el contexto; el resto guarda como mucho ${int(window)} tokens.`
  if (model.linear)
    return `En ${model.name} solo ${full} de ${model.layers} capas tienen KV cache: las de atención lineal guardan un estado fijo que no crece con el contexto.`
  return 'Con contextos largos el KV cache puede ocupar más que el propio modelo.'
}

/** Short description of the attention layout, for the model picker. */
function describeAttention(model: ModelConfig): string {
  const g = model.attention
  if (g.some((x) => x.latent)) return 'atención latente (MLA)'
  if (model.linear) return `híbrido: ${model.linear.layers} capas lineales + ${g.reduce((s, x) => s + x.layers, 0)} de atención`
  if (g.length > 1) return `${g.filter((x) => !x.window).reduce((s, x) => s + x.layers, 0)} capas globales + ${g.filter((x) => x.window).reduce((s, x) => s + x.layers, 0)} con ventana`
  return `${g[0]!.kvHeads} cabezas KV × ${g[0]!.headDim}`
}

/** Axis top and tick step: 3–5 ticks at 1, 2, 2.5 or 5 × 10^k. */
function niceScale(v: number): { max: number; step: number } {
  const exp = 10 ** Math.floor(Math.log10(v))
  for (const m of [0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10]) {
    const step = m * exp
    if (Math.ceil(v / step) <= 5) return { max: Math.ceil(v / step) * step, step }
  }
  return { max: 10 * exp, step: 2 * exp }
}

function Formulas({ setup }: { setup: Setup }) {
  const { model, weightBits, kvBits, context, batch, device, count } = setup
  const w = weightBytes(model, weightBits)
  const perToken = kvBytesPerToken(model, kvBits)
  const perTokenLong = kvBytesPerTokenLongContext(model, kvBits)
  const kv = kvBytesPerSequence(model, context, kvBits) * batch
  const active = activeWeightBytes(model, weightBits)
  const kvRead = kv
  const speed = decodeSpeed(setup)
  const bytes = kvBits / 8
  const state = linearStateBytes(model)
  const kb = (n: number) => nf(1).format(n / 1024)
  const latent = model.attention.some((g) => g.latent)
  const windowed = model.attention.some((g) => g.window)
  return (
    <div className="space-y-4 text-[13.5px] leading-relaxed">
      <Formula title="Pesos">
        {nf(2).format(model.params)} × 10⁹ parámetros × {nf(2).format(weightBits)} bits ÷ 8 = <b>{gb(w / GIB)}</b>
      </Formula>
      <Formula title="KV cache por token">
        {model.attention.map((g, i) => (
          <span key={i} className="block">
            {g.latent
              ? `${g.layers} capas × ${g.latent} valores latentes`
              : `2 (K y V) × ${g.layers} capas × ${g.kvHeads} cabezas KV × ${g.headDim} dims`}{' '}
            × {nf(3).format(bytes)} bytes = <b>{kb(groupBytesPerToken(g, kvBits))} KB</b>
            {g.window && <span className="font-sans text-subtle"> · ventana de {int(g.window)} tokens</span>}
          </span>
        ))}
        {model.attention.length > 1 && (
          <span className="block">
            Total: <b>{kb(perToken)} KB</b> por token; <b>{kb(perTokenLong)} KB</b> cuando las ventanas se llenan
          </span>
        )}
        <span className="mt-1 block font-sans text-[12.5px] text-subtle">
          {latent
            ? 'MLA comprime K y V de todas las cabezas en un vector latente: con atención estándar serían decenas de miles de valores por token y capa.'
            : 'Con grouped-query attention varias cabezas de query comparten la misma K y V: por eso cuentan las cabezas KV, no las de atención.'}
          {windowed && ' Las capas con ventana deslizante solo guardan los últimos tokens, así que dejan de crecer.'}
          {model.linear &&
            ` Las ${model.linear.layers} capas de atención lineal no tienen KV cache: guardan un estado fijo de ${model.linear.heads} × ${model.linear.keyDim} × ${model.linear.valueDim} valores en FP32 (${nf(0).format(state / 2 ** 20)} MB por secuencia).`}
        </span>
      </Formula>
      <Formula title="KV cache total">
        {model.attention.length > 1 && '('}
        {model.attention.map((g, i) => (
          <span key={i}>
            {i > 0 && ' + '}
            {kb(groupBytesPerToken(g, kvBits))} KB × {int(Math.min(context, g.window ?? Infinity))}
          </span>
        ))}
        {model.attention.length > 1 && ')'} tokens × {batch} {batch === 1 ? 'secuencia' : 'secuencias'}
        {state > 0 && ` + ${nf(0).format((state * batch) / 2 ** 20)} MB de estado lineal`} = <b>{gb(kv / GIB)}</b>
      </Formula>
      <Formula title="Runtime">
        ≈ {OVERHEAD_GIB} GB por dispositivo para el contexto de CUDA o Metal y los buffers de activaciones. Es una estimación: depende
        del runtime y del tamaño de lote.
      </Formula>
      <Formula title="Velocidad de generación">
        {int(device.bandwidth)} GB/s{count > 1 && ` × ${count}`} × {BANDWIDTH_EFFICIENCY * 100} % ÷ ({gb(active / GIB)} de pesos
        {model.active ? ' activos' : ''} + {gb(kvRead / GIB)} de KV) ≈ <b>{int(speed.perSequence)} tokens/s</b>
        {batch > 1 && ` por secuencia`}
        <span className="mt-1 block font-sans text-[12.5px] text-subtle">
          Para generar cada token hay que leer de memoria todos los pesos que se usan y todo el KV cache. Por eso en la fase de decode
          manda el ancho de banda, no la potencia de cálculo. El prefill (procesar el prompt) sí está limitado por cómputo y no se
          modela aquí.
          {model.active &&
            ` En un MoE hay que cargar los ${nf(1).format(model.params)} B parámetros, pero cada token solo lee los ${nf(1).format(model.active)} B activos: memoria de modelo grande, velocidad de modelo pequeño.`}
        </span>
      </Formula>
    </div>
  )
}

function Formula({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <div className="font-medium">{title}</div>
      <div className="font-mono text-[12.5px] text-muted [&_b]:text-fg">{children}</div>
    </div>
  )
}
