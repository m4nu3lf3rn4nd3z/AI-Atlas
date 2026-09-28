import { Dices, RotateCcw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { distribution, entropy, sample, softmax } from '@/lib/sampling'

/* Temperature / top-k / top-p / min-p on a small candidate set.
   The logits are illustrative; every probability shown is computed
   with the same code the Sampling lab uses. */

const CANDIDATES = [
  [' azul', 6.1],
  [' gris', 4.9],
  [' grande', 3.8],
  [' claro', 3.5],
  [' precioso', 3.2],
  [' el', 2.4],
  [' rojo', 2.2],
  [' infinito', 2.0],
  [' un', 1.5],
  [' verde', 0.8],
] as const

const LOGITS = CANDIDATES.map(([, l]) => l)

export function SoftmaxPlayground() {
  const [temperature, setTemperature] = useState(1)
  const [topK, setTopK] = useState(0)
  const [topP, setTopP] = useState(1)
  const [minP, setMinP] = useState(0)
  const [counts, setCounts] = useState<number[]>(() => LOGITS.map(() => 0))

  const base = useMemo(() => softmax(LOGITS, temperature), [temperature])
  const final = useMemo(
    () => distribution(LOGITS, { temperature, topK, topP, minP }),
    [temperature, topK, topP, minP],
  )
  const draws = counts.reduce((a, b) => a + b, 0)

  const draw = (n: number) => {
    const next = [...counts]
    for (let i = 0; i < n; i++) next[sample(final)]!++
    setCounts(next)
  }

  const reset = () => {
    setTemperature(1)
    setTopK(0)
    setTopP(1)
    setMinP(0)
    setCounts(LOGITS.map(() => 0))
  }

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10.5px] tracking-widest text-subtle">
          «El cielo es» → SIGUIENTE TOKEN
        </span>
        <button
          type="button"
          onClick={reset}
          className="flex cursor-pointer items-center gap-1 text-[11.5px] text-subtle hover:text-fg"
        >
          <RotateCcw className="size-3" /> Reiniciar
        </button>
      </div>

      <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        <Slider label="temperature" value={temperature} min={0} max={2} step={0.05} onChange={setTemperature} fmt={(v) => (v === 0 ? '0 (greedy)' : v.toFixed(2))} />
        <Slider label="top-k" value={topK} min={0} max={10} step={1} onChange={setTopK} fmt={(v) => (v === 0 ? 'off' : String(v))} />
        <Slider label="top-p" value={topP} min={0.05} max={1} step={0.05} onChange={setTopP} fmt={(v) => (v >= 1 ? 'off' : v.toFixed(2))} />
        <Slider label="min-p" value={minP} min={0} max={0.5} step={0.01} onChange={setMinP} fmt={(v) => (v === 0 ? 'off' : v.toFixed(2))} />
      </div>

      <div className="mt-4 space-y-1">
        {CANDIDATES.map(([tok], i) => {
          const p = final[i]!
          const cut = p === 0 && base[i]! > 0
          return (
            <div key={tok} className="flex items-center gap-2">
              <span className={cn('w-20 shrink-0 text-right font-mono text-[12px]', cut ? 'text-subtle line-through' : 'text-fg')}>
                {tok.replace(' ', '·')}
              </span>
              <div className="relative h-4 flex-1 overflow-hidden rounded bg-surface-2">
                <div className="absolute inset-y-0 left-0 rounded bg-border-strong/60" style={{ width: `${base[i]! * 100}%` }} />
                <div
                  className="absolute inset-y-0 left-0 rounded transition-[width] duration-300"
                  style={{ width: `${p * 100}%`, background: 'var(--l0)' }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[11px] text-muted">
                {(p * 100).toFixed(1)}%
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-[11px] text-subtle">
                {draws ? counts[i] : ''}
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => draw(1)} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 text-[12.5px] hover:bg-surface-2">
          <Dices className="size-3.5" /> Muestrear 1
        </button>
        <button type="button" onClick={() => draw(100)} className="h-8 cursor-pointer rounded-lg border border-border px-3 text-[12.5px] hover:bg-surface-2">
          Muestrear 100
        </button>
        <span className="ml-auto font-mono text-[11px] text-subtle">
          entropía {entropy(final).toFixed(2)} bits · {final.filter((p) => p > 0).length} candidatos
        </span>
      </div>
      <p className="mt-3 text-[11.5px] leading-snug text-subtle">
        Barra gris: softmax solo con temperatura. Barra de color: distribución final tras los filtros.
        Logits ilustrativos para 10 candidatos (un modelo real puntúa todo su vocabulario); la
        matemática es la real.
      </p>
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  fmt,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  fmt: (v: number) => string
}) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between font-mono text-[11.5px]">
        <span className="text-muted">{label}</span>
        <span className="text-fg">{fmt(value)}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--accent)]"
      />
    </label>
  )
}
