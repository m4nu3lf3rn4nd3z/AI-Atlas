import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Latency and cost of one LLM request, and of a month of traffic.
   E2E latency = TTFT + output tokens / decode speed.
   Cost = uncached input × input price + cached input × input price × 0.1
          + output × output price. Prices are editable examples. */

const nf = (d: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d })
const usd = (n: number) => (n >= 100 ? `${nf(0).format(n)} $` : n >= 1 ? `${nf(2).format(n)} $` : `${nf(4).format(n)} $`)

function Num({ label, value, onChange, step = 1, unit, min = 0 }: { label: string; value: number; onChange: (v: number) => void; step?: number; unit?: string; min?: number }) {
  return (
    <label className="block">
      <span className="text-[12px] text-subtle">{label}</span>
      <span className="mt-1 flex items-center gap-1.5">
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="h-8 w-full min-w-0 rounded-md border border-border bg-bg px-2 font-mono text-[13px] outline-none focus:border-accent"
        />
        {unit && <span className="shrink-0 text-[12px] text-subtle">{unit}</span>}
      </span>
    </label>
  )
}

function Out({ label, value, sub, strong }: { label: string; value: ReactNode; sub?: ReactNode; strong?: boolean }) {
  return (
    <div className="rounded-lg bg-surface-2 px-3 py-2">
      <div className="text-[11.5px] text-subtle">{label}</div>
      <div className={cn('font-mono tabular-nums', strong ? 'text-[17px] font-semibold' : 'text-[14px]')}>{value}</div>
      {sub && <div className="text-[11px] text-subtle">{sub}</div>}
    </div>
  )
}

export function CostLatencyCalculator() {
  const [input, setInput] = useState(6000)
  const [output, setOutput] = useState(500)
  const [cached, setCached] = useState(0)
  const [ttft, setTtft] = useState(0.8)
  const [speed, setSpeed] = useState(60)
  const [priceIn, setPriceIn] = useState(3)
  const [priceOut, setPriceOut] = useState(15)
  const [perDay, setPerDay] = useState(10000)

  const latency = ttft + output / Math.max(1, speed)
  const cachedTokens = (input * cached) / 100
  const costIn = ((input - cachedTokens) * priceIn + cachedTokens * priceIn * 0.1) / 1e6
  const costOut = (output * priceOut) / 1e6
  const perRequest = costIn + costOut
  const month = perRequest * perDay * 30
  const inShare = perRequest ? costIn / perRequest : 0

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-surface p-4">
      <p className="mb-3 text-[13px] font-semibold">Calculadora de latencia y coste por petición</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Num label="Tokens de entrada" value={input} onChange={setInput} step={500} />
        <Num label="Tokens de salida" value={output} onChange={setOutput} step={50} />
        <Num label="Entrada cacheada" value={cached} onChange={(v) => setCached(Math.min(100, v))} step={10} unit="%" />
        <Num label="Peticiones al día" value={perDay} onChange={setPerDay} step={1000} />
        <Num label="TTFT" value={ttft} onChange={setTtft} step={0.1} unit="s" />
        <Num label="Velocidad de salida" value={speed} onChange={setSpeed} step={10} unit="tok/s" min={1} />
        <Num label="Precio de entrada" value={priceIn} onChange={setPriceIn} step={0.25} unit="$/M" />
        <Num label="Precio de salida" value={priceOut} onChange={setPriceOut} step={1} unit="$/M" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Out label="Latencia total" value={`${nf(1).format(latency)} s`} sub={`${nf(1).format(ttft)} s hasta el primer token`} strong />
        <Out label="Coste por petición" value={usd(perRequest)} strong />
        <Out label="Coste al mes" value={usd(month)} sub="30 días" />
        <Out label="Parte de la entrada" value={`${nf(0).format(inShare * 100)} %`} sub="del coste por petición" />
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
        <div className="h-full bg-chart-1" style={{ width: `${inShare * 100}%` }} />
        <div className="h-full bg-chart-2" style={{ width: `${(1 - inShare) * 100}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-[11.5px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] bg-chart-1" /> entrada {usd(costIn)}
        </span>
        <span className="flex items-center gap-1.5">
          salida {usd(costOut)} <span className="size-2 rounded-[2px] bg-chart-2" />
        </span>
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-subtle">
        Precios de ejemplo, editables: consulta los de tu proveedor. La entrada cacheada se cobra aquí al 10 % (lecturas de caché
        de la API de Claude); escribir en caché cuesta algo más que la entrada normal. Los tokens de razonamiento se facturan como
        salida.
      </p>
    </div>
  )
}
