import { Binary } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useElementWidth } from '@/lib/hooks'
import { Field, LegendItem, Panel, Segmented, Stat } from '../kit'
import { levelsOf, quantize, stats } from './quant'
import weights from './weights.json'

const nf = (d: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d })
const BITS = [8, 6, 5, 4, 3, 2] as const
const GROUPS = [0, 128, 64, 32] as const
const ZOOM = 64
/** Outside the zoom window, but in the same group when groups are large. */
const OUTLIER_AT = 70
const OUTLIER_SIGMAS = 30

const BASE = weights.values
const BASE_STATS = stats(BASE)

export function QuantExplorer() {
  const [bits, setBits] = useState<number>(4)
  const [group, setGroup] = useState<number>(0)
  const [symmetric, setSymmetric] = useState(true)
  const [outlier, setOutlier] = useState(false)

  const values = useMemo(() => {
    if (!outlier) return BASE
    const v = [...BASE]
    v[OUTLIER_AT] = BASE_STATS.std * OUTLIER_SIGMAS
    return v
  }, [outlier])

  const r = useMemo(() => quantize(values, { bits, groupSize: group, symmetric }), [values, bits, group, symmetric])
  const byBits = useMemo(
    () => BITS.map((b) => ({ bits: b, snr: quantize(values, { bits: b, groupSize: group, symmetric }).snrDb })),
    [values, group, symmetric],
  )

  return (
    <Panel title="Qué pierdes al cuantizar" icon={<Binary />}>
      <p className="-mt-1 mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
        Pesos reales: los primeros {nf(0).format(BASE.length)} valores de <code className="font-mono text-[12px]">{weights.tensor}</code> de{' '}
        {weights.repo} ({weights.dtype}). Cada peso se redondea al nivel más cercano de una rejilla de 2<sup>bits</sup> valores; la escala
        de la rejilla se ajusta al rango de cada grupo.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Bits por peso">
          <Segmented label="Bits por peso" value={bits} onChange={setBits} options={BITS.map((b) => ({ value: b, label: `${b} bits` }))} />
        </Field>
        <Field label="Una escala por…">
          <Segmented
            label="Tamaño de grupo"
            value={group}
            onChange={setGroup}
            options={GROUPS.map((g) => ({ value: g, label: g === 0 ? 'tensor' : `grupo de ${g}` }))}
          />
        </Field>
        <Field label="Rejilla">
          <Segmented
            label="Tipo de rejilla"
            value={symmetric ? 'sym' : 'asym'}
            onChange={(v) => setSymmetric(v === 'sym')}
            options={[
              { value: 'sym', label: 'simétrica (absmax)', title: 'Escala = máx |x| / (2^(b−1) − 1). El cero siempre es representable.' },
              { value: 'asym', label: 'asimétrica (mín–máx)', title: 'Usa todo el rango [mín, máx] con un punto cero; necesita guardar también el cero.' },
            ]}
          />
        </Field>
        <Field label="Valor atípico">
          <label className="flex h-8 cursor-pointer items-center gap-2 text-[13px] text-muted">
            <input type="checkbox" checked={outlier} onChange={(e) => setOutlier(e.target.checked)} className="size-4 accent-[var(--accent)]" />
            Añadir un outlier de {OUTLIER_SIGMAS}σ en la posición {OUTLIER_AT}
          </label>
        </Field>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Relación señal/ruido" value={`${nf(1).format(r.snrDb)} dB`} sub="más alto es mejor; ~6 dB por bit" strong />
        <Stat label="Error medio (RMS)" value={`${nf(1).format(r.relativeRmse * 100)} %`} sub="de la desviación típica de los pesos" />
        <Stat label="Bits por peso reales" value={nf(2).format(r.bitsPerWeight)} sub={group ? `incluye ${symmetric ? 'la escala' : 'escala y cero'} de cada grupo` : 'una sola escala: despreciable'} />
        <Stat label="Memoria frente a BF16" value={`${nf(0).format((r.bitsPerWeight / 16) * 100)} %`} sub={`${nf(1).format(16 / r.bitsPerWeight)}× más pequeño`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="min-w-0">
          <p className="mb-2 text-[13px] font-medium">Zoom a los primeros {ZOOM} pesos</p>
          <ZoomPlot values={values} dequantized={r.dequantized} levels={levelsOf(r.groups[0]!, bits, symmetric)} group={group} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <LegendItem color="var(--fg-muted)">Original</LegendItem>
            <LegendItem color="var(--accent)">Tras cuantizar</LegendItem>
            <LegendItem color="var(--border-strong)">Niveles del primer grupo</LegendItem>
          </div>
        </div>
        <div className="min-w-0">
          <p className="mb-2 text-[13px] font-medium">Relación señal/ruido según los bits</p>
          <SnrBars data={byBits} current={bits} />
          <p className="mt-2 text-[12px] text-subtle">
            Con {group ? `grupos de ${group}` : 'una escala por tensor'} y rejilla {symmetric ? 'simétrica' : 'asimétrica'}.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-[13.5px] leading-relaxed text-muted">
        <p>
          <b className="text-fg">Por qué importan los grupos.</b> Activa el outlier con una escala por tensor: un solo valor extremo estira
          la rejilla y el resto de pesos cae en muy pocos niveles. Con grupos pequeños el daño se queda en su grupo, a cambio de guardar
          más escalas. Por eso Q4_0 y Q8_0 usan bloques de 32 y AWQ/GPTQ grupos de 128.
        </p>
        <p>
          <b className="text-fg">Lo que este lab no muestra.</b> Los métodos modernos no redondean a ciegas: GPTQ corrige el error de cada
          peso ajustando los siguientes, AWQ protege los canales que más pesan en las activaciones y los k-quants de llama.cpp dan más
          bits a los tensores más sensibles. Por eso un Q4 real pierde menos de lo que sugiere este redondeo simple.
        </p>
      </div>
      {bits <= 3 && (
        <p className="mt-3 rounded-lg bg-warn/10 px-3 py-2 text-[13px] text-warn">
          Por debajo de 4 bits la pérdida se nota en tareas exigentes, sobre todo en modelos pequeños.
        </p>
      )}
    </Panel>
  )
}

const ZH = 220
const ZM = { l: 8, r: 8, t: 10, b: 10 }

function ZoomPlot({ values, dequantized, levels, group }: { values: ArrayLike<number>; dequantized: Float32Array; levels: number[]; group: number }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(520)
  let absmax = 0
  for (let i = 0; i < ZOOM; i++) absmax = Math.max(absmax, Math.abs(values[i]!), Math.abs(dequantized[i]!))
  const lim = absmax * 1.1
  const iw = width - ZM.l - ZM.r
  const ih = ZH - ZM.t - ZM.b
  const x = (i: number) => ZM.l + ((i + 0.5) / ZOOM) * iw
  const y = (v: number) => ZM.t + ih / 2 - (v / lim) * (ih / 2)
  const visibleLevels = levels.filter((l) => Math.abs(l) <= lim)
  const boundaries = group > 0 && group < ZOOM ? Array.from({ length: ZOOM / group - 1 }, (_, k) => (k + 1) * group) : []

  return (
    <div ref={ref}>
      <svg width={width} height={ZH} role="img" aria-label="Pesos originales y cuantizados" className="rounded-lg bg-surface-2">
        {visibleLevels.length < 80 &&
          visibleLevels.map((l) => <line key={l} x1={ZM.l} x2={ZM.l + iw} y1={y(l)} y2={y(l)} stroke="var(--border-strong)" strokeWidth={0.75} />)}
        <line x1={ZM.l} x2={ZM.l + iw} y1={y(0)} y2={y(0)} stroke="var(--fg-subtle)" strokeWidth={0.75} />
        {boundaries.map((b) => (
          <line key={b} x1={ZM.l + (b / ZOOM) * iw} x2={ZM.l + (b / ZOOM) * iw} y1={ZM.t} y2={ZM.t + ih} stroke="var(--fg-subtle)" strokeDasharray="3 3" />
        ))}
        {Array.from({ length: ZOOM }, (_, i) => (
          <g key={i}>
            <line x1={x(i)} x2={x(i)} y1={y(values[i]!)} y2={y(dequantized[i]!)} stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={1.5} />
            <circle cx={x(i)} cy={y(values[i]!)} r={2.6} fill="var(--fg-muted)" />
            <line x1={x(i) - 3.5} x2={x(i) + 3.5} y1={y(dequantized[i]!)} y2={y(dequantized[i]!)} stroke="var(--accent)" strokeWidth={2.5} strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {boundaries.length > 0 && <p className="mt-1 text-[11.5px] text-subtle">Las líneas verticales separan grupos: cada uno tiene su propia rejilla.</p>}
    </div>
  )
}

function SnrBars({ data, current }: { data: { bits: number; snr: number }[]; current: number }) {
  const max = Math.max(...data.map((d) => d.snr), 1)
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.bits} className="flex items-center gap-2">
          <span className="w-12 shrink-0 font-mono text-[12px] text-muted">{d.bits} bits</span>
          <div className="h-5 flex-1 rounded bg-surface-2">
            <div
              className="h-full rounded-r"
              style={{ width: `${Math.max(0, d.snr / max) * 100}%`, background: d.bits === current ? 'var(--accent)' : 'var(--border-strong)' }}
            />
          </div>
          <span className="w-14 shrink-0 text-right font-mono text-[12px] tabular-nums">{nf(1).format(d.snr)} dB</span>
        </div>
      ))}
    </div>
  )
}
