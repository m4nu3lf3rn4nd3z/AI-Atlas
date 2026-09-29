import { Dices, MessageSquare, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { Field, LegendItem, Panel, Range, Segmented, Stat } from '../kit'
import data from './distributions.json'
import { DEFAULT_PARAMS, distribution, drawMany, visibleToken, type Params, type Step } from './logic'
import { PROMPTS } from './prompts'

const nf = (d: number) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d })
const pct = (p: number) => (p >= 0.1 ? `${nf(0).format(p * 100)} %` : p >= 0.001 ? `${nf(1).format(p * 100)} %` : p > 0 ? '< 0,1 %' : '—')
const ROWS = 15
const SAMPLES = 100

const PRESETS: { label: string; params: Params; note: string }[] = [
  { label: 'Greedy', params: { temperature: 0, topK: 0, topP: 1, minP: 0 }, note: 'Siempre el más probable. Determinista.' },
  { label: 'Qwen2.5 por defecto', params: { temperature: 0.7, topK: 20, topP: 0.8, minP: 0 }, note: 'Lo que publica el modelo en su generation_config.' },
  { label: 'Creativo', params: { temperature: 1.1, topK: 0, topP: 1, minP: 0.05 }, note: 'Más variedad, con min-p para cortar la basura.' },
  { label: 'Sin filtros, T = 1,5', params: { temperature: 1.5, topK: 0, topP: 1, minP: 0 }, note: 'Para ver qué pasa sin red.' },
]

const NOTES: Record<string, string> = {
  capital:
    'La favorita es « Par», el principio de «París»: los tokens son trozos de palabra. El resto se reparte entre « Paris» en inglés, otras capitales y ruido. Con temperatura 0 siempre acierta; con temperatura alta y sin filtros, no siempre.',
  sky: 'Dos opciones casi empatadas: aquí el muestreo decide cómo sigue la frase.',
  food: '« la» y « el» casi empatan: el modelo aún no ha decidido el plato, y el artículo condiciona todo lo que viene después.',
  story:
    'Muy repartida: una parte grande de la probabilidad está fuera de los 60 tokens más probables. Es donde más se nota la diferencia entre top-p y min-p.',
  math: 'El modelo prefiere repetir la operación («1» de «17 × 3 = 51») antes que dar el número directamente («5» de «51»). Las dos llegan bien; con temperatura alta aparecen cifras equivocadas.',
  code: 'Casi toda la probabilidad en un token: el código es muy predecible y la temperatura apenas importa.',
}

export default function SamplingLab() {
  const [promptId, setPromptId] = useState<string>(PROMPTS[0]!.id)
  const [stepIndex, setStepIndex] = useState(0)
  const [params, setParams] = useState<Params>(DEFAULT_PARAMS)
  const [seed, setSeed] = useState(1)
  const set = (patch: Partial<Params>) => setParams((p) => ({ ...p, ...patch }))

  const prompt = PROMPTS.find((p) => p.id === promptId)!
  const steps = data.prompts.find((p) => p.id === promptId)!.steps as Step[]
  const step = steps[Math.min(stepIndex, steps.length - 1)]!
  const d = useMemo(() => distribution(step, params), [step, params])
  const base = useMemo(() => distribution(step, DEFAULT_PARAMS), [step])
  const draws = useMemo(() => drawMany(d, SAMPLES, seed), [d, seed])

  const pick = (id: string) => {
    setPromptId(id)
    setStepIndex(0)
  }

  return (
    <div className="space-y-5">
      <Panel title="La conversación" icon={<MessageSquare />}>
        <Segmented label="Prompt" value={promptId} onChange={pick} options={PROMPTS.map((p) => ({ value: p.id, label: p.label }))} />
        <Chat prompt={prompt} steps={steps} stepIndex={stepIndex} onStep={setStepIndex} />
        <p className="mt-3 max-w-3xl text-[13px] leading-relaxed text-muted">{NOTES[prompt.id]}</p>
      </Panel>

      <Panel title="Parámetros de muestreo" icon={<SlidersHorizontal />} actions={<ResetButton onClick={() => setParams(DEFAULT_PARAMS)} />}>
        <div className="mb-4 flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              title={p.note}
              onClick={() => setParams(p.params)}
              className={cn(
                'cursor-pointer rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors',
                JSON.stringify(params) === JSON.stringify(p.params) ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Temperature" hint={params.temperature === 0 ? '0 · greedy' : nf(2).format(params.temperature)}>
            <Range label="Temperature" min={0} max={2} step={0.05} value={params.temperature} onChange={(temperature) => set({ temperature })} />
            <p className="text-[12px] text-subtle">Divide los logits: &lt; 1 concentra, &gt; 1 aplana.</p>
          </Field>
          <Field label="Top-k" hint={params.topK ? `${params.topK} tokens` : 'desactivado'}>
            <Segmented label="Top-k" value={params.topK} onChange={(topK) => set({ topK })} options={[0, 1, 5, 20, 50].map((k) => ({ value: k, label: k || 'off' }))} />
            <p className="mt-1.5 text-[12px] text-subtle">Solo los k más probables.</p>
          </Field>
          <Field label="Top-p" hint={params.topP < 1 ? nf(2).format(params.topP) : 'desactivado'}>
            <Range label="Top-p" min={0.05} max={1} step={0.05} value={params.topP} onChange={(topP) => set({ topP })} />
            <p className="text-[12px] text-subtle">El grupo mínimo que suma p.</p>
          </Field>
          <Field label="Min-p" hint={params.minP ? nf(2).format(params.minP) : 'desactivado'}>
            <Range label="Min-p" min={0} max={0.5} step={0.01} value={params.minP} onChange={(minP) => set({ minP })} />
            <p className="text-[12px] text-subtle">Fuera lo que no llegue a min-p × el favorito.</p>
          </Field>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        <Stat label="Tokens candidatos" value={new Intl.NumberFormat('es-ES').format(d.candidates)} sub={`de ${new Intl.NumberFormat('es-ES').format(base.candidates)} en el vocabulario`} strong />
        <Stat label="Entropía" value={`${nf(2).format(d.entropy)} bits`} sub={`sin filtros a T = 1: ${nf(2).format(base.entropy)} bits`} />
        <Stat label="Probabilidad del favorito" value={pct(d.tokens[0]!.p)} sub={`«${visibleToken(d.tokens[0]!.token.t)}»`} />
        <Stat label="Resto del vocabulario" value={pct(d.rest.p)} sub="probabilidad de un token fuera del top 60" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Distribución del siguiente token" className="min-w-0">
          <DistributionChart d={d} />
        </Panel>
        <Panel
          title={`${SAMPLES} muestras`}
          icon={<Dices />}
          className="min-w-0"
          actions={
            <button type="button" onClick={() => setSeed((s) => s + 1)} className="cursor-pointer rounded-md border border-border px-2 py-1 text-[12px] text-muted hover:text-fg">
              Otra tirada
            </button>
          }
        >
          <Samples d={d} draws={draws} />
        </Panel>
      </div>
    </div>
  )
}

function ResetButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-surface-2 hover:text-fg">
      <RotateCcw className="size-3.5" /> T = 1, sin filtros
    </button>
  )
}

function Chat({ prompt, steps, stepIndex, onStep }: { prompt: (typeof PROMPTS)[number]; steps: Step[]; stepIndex: number; onStep: (i: number) => void }) {
  const chosen = steps.map((s) => s.top[0]!.t)
  return (
    <div className="mt-4 space-y-2">
      <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-accent-soft px-3.5 py-2 text-[13.5px]">{prompt.user}</div>
      <div className="w-fit max-w-full rounded-2xl rounded-bl-md border border-border bg-surface-2 px-3.5 py-2 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
        <span>{prompt.prefix}</span>
        {chosen.map((t, i) => {
          const end = t === '<|im_end|>' || t === '<|endoftext|>'
          return (
            <button
              key={i}
              type="button"
              onClick={() => onStep(i)}
              title={`Paso ${i + 1}: ver la distribución en este punto`}
              className={cn(
                'cursor-pointer rounded-[4px] px-0.5 transition-colors',
                i === stepIndex ? 'bg-accent text-accent-fg' : i < stepIndex ? 'text-fg hover:bg-surface-3' : 'text-subtle hover:bg-surface-3',
                end && 'text-[11px]',
              )}
            >
              {i === stepIndex && !end ? '▍' : ''}
              {end ? '⟨fin⟩' : t}
            </button>
          )
        })}
      </div>
      <p className="text-[12px] leading-relaxed text-subtle">
        La continuación es la <i>greedy</i> (el token más probable en cada paso), capturada del modelo real. Pulsa cualquier token para ver
        qué otras opciones tenía en ese punto. Con muestreo, cada elección distinta cambiaría todo lo que viene después.
      </p>
    </div>
  )
}

function DistributionChart({ d }: { d: ReturnType<typeof distribution> }) {
  const rows = d.tokens.slice(0, ROWS)
  const max = Math.max(...rows.map((r) => Math.max(r.p, r.base)), d.rest.p, d.rest.base, 0.01)
  return (
    <div>
      <div className="space-y-1">
        {rows.map((r) => (
          <Row key={r.token.id} label={`«${visibleToken(r.token.t)}»`} p={r.p} base={r.base} max={max} />
        ))}
        <Row label={`resto (${new Intl.NumberFormat('es-ES').format(d.rest.count)} tokens)`} p={d.rest.p} base={d.rest.base} max={max} muted />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        <LegendItem color="var(--accent)">Probabilidad con estos parámetros</LegendItem>
        <LegendItem color="var(--fg-subtle)" dashed>
          Sin filtros, T = 1
        </LegendItem>
      </div>
      <p className="mt-2 text-[12px] text-subtle">
        Distribución real de Qwen2.5-0.5B-Instruct ({data.dtype === 'q8' ? 'int8' : '4 bits'}), sobre su vocabulario completo. Las filas grises quedan
        descartadas por los filtros.
      </p>
    </div>
  )
}

function Row({ label, p, base, max, muted }: { label: string; p: number; base: number; max: number; muted?: boolean }) {
  const dropped = p === 0
  return (
    <div className={cn('grid grid-cols-[minmax(0,9rem)_1fr_3.5rem] items-center gap-2', dropped && 'opacity-45')}>
      <span className={cn('truncate font-mono text-[12px]', muted ? 'text-subtle' : 'text-fg', dropped && 'line-through')}>{label}</span>
      <span className="relative h-4 rounded-sm">
        <span className="absolute inset-y-0 left-0 rounded-r-[3px] bg-accent" style={{ width: `${(p / max) * 100}%` }} />
        <span className="absolute inset-y-0 left-0 rounded-r-[3px] border border-dashed border-subtle" style={{ width: `${(base / max) * 100}%` }} />
      </span>
      <span className="text-right font-mono text-[12px] tabular-nums">{pct(p)}</span>
    </div>
  )
}

function Samples({ d, draws }: { d: ReturnType<typeof distribution>; draws: { counts: number[]; rest: number } }) {
  const items = d.tokens
    .map((t, i) => ({ label: `«${visibleToken(t.token.t)}»`, n: draws.counts[i]! }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
  if (draws.rest) items.push({ label: 'otro token del resto', n: draws.rest })
  const max = Math.max(...items.map((x) => x.n), 1)
  return (
    <div>
      <p className="mb-2 text-[12.5px] text-muted">
        {items.length === 1 ? 'Siempre sale el mismo token.' : `Han salido ${items.length} tokens distintos.`}
      </p>
      <div className="max-h-[360px] space-y-1 overflow-auto pr-1">
        {items.map((x) => (
          <div key={x.label} className="grid grid-cols-[minmax(0,8rem)_1fr_2rem] items-center gap-2">
            <span className="truncate font-mono text-[12px]">{x.label}</span>
            <span className="h-3.5 rounded-sm bg-surface-3">
              <span className="block h-full rounded-r-[3px] bg-accent" style={{ width: `${(x.n / max) * 100}%` }} />
            </span>
            <span className="text-right font-mono text-[12px] tabular-nums">{x.n}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
