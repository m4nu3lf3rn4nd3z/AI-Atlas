import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Coins,
  Hash,
  Pause,
  Play,
  RotateCcw,
  Undo2,
  UserCheck,
  Wrench,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ToolChip } from '@/components/ToolChip'
import { Button } from '@/components/ui/button'
import { SectionLabel } from '@/components/ui/primitives'
import { getConcept } from '@/content'
import { cn } from '@/lib/cn'
import { formatDuration, formatTokens, formatUsd } from '@/lib/format'
import { useProgress } from '@/stores/progress'
import { ArchitectureDiagram } from './ArchitectureDiagram'
import { BLOCKS } from './blocks'
import {
  activeSteps,
  computeMetrics,
  configKey,
  defaultState,
  improvingToggles,
  notesFor,
  pickOutcome,
  PRICES,
  stepCost,
} from './engine'
import type { CaseStep, ToggleState, UseCase } from './types'
import { STATUS, VERDICT } from './verdicts'

/* The generic use-case lab: choose design decisions, then step through a
   scripted run of the system and see the outcome and its cost. */
export function CaseLab({ uc }: { uc: UseCase }) {
  const [state, setState] = useState<ToggleState>(() => defaultState(uc))
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const recordCaseRun = useProgress((s) => s.recordCaseRun)

  const steps = useMemo(() => activeSteps(uc, state), [uc, state])
  const step = steps[Math.min(index, steps.length - 1)]!
  const finished = index >= steps.length - 1
  const soFar = useMemo(() => computeMetrics(steps.slice(0, index + 1), state), [steps, index, state])
  const total = useMemo(() => computeMetrics(steps, state), [steps, state])

  useEffect(() => {
    if (finished) recordCaseRun(uc.id, configKey(state))
  }, [finished, uc.id, state, recordCaseRun])

  // Autoplay stops by itself at the last step.
  const running = playing && !finished
  useEffect(() => {
    if (!running) return
    const t = setTimeout(() => setIndex((i) => i + 1), 1600)
    return () => clearTimeout(t)
  }, [running, index])

  const apply = (next: ToggleState) => {
    setState(next)
    setIndex(0)
    setPlaying(false)
  }

  return (
    <div className="space-y-4">
      <DecisionPanel uc={uc} state={state} onChange={apply} />

      <ArchitectureDiagram uc={uc} state={state} current={step.component} selected={selected} onSelect={(id) => setSelected(selected === id ? null : id)} />
      {selected && <ComponentInfo uc={uc} id={selected} onClose={() => setSelected(null)} />}

      <div className="grid gap-4 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.6fr)]">
        {/* On narrow screens the current step goes first, the list of steps after it. */}
        <div className="order-2 lg:order-1">
          <Timeline steps={steps} index={index} onSelect={(i) => { setIndex(i); setPlaying(false) }} />
        </div>

        <div className="order-1 min-w-0 space-y-3 lg:order-2">
          <StepCard uc={uc} step={step} index={index} total={steps.length} />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
              <ChevronLeft /> Anterior
            </Button>
            <Button size="sm" variant="primary" onClick={() => setIndex(Math.min(steps.length - 1, index + 1))} disabled={finished}>
              Siguiente <ChevronRight />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (finished) {
                  setIndex(0)
                  setPlaying(true)
                } else setPlaying(!running)
              }}
            >
              {running ? <Pause /> : <Play />}
              {running ? 'Pausa' : 'Reproducir'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setIndex(0); setPlaying(false) }}>
              <RotateCcw /> Reiniciar
            </Button>
          </div>
          <Metrics m={finished ? total : soFar} final={finished} />
        </div>
      </div>

      {finished && (
        <OutcomeCard
          uc={uc}
          state={state}
          onFlip={(id) => apply({ ...state, [id]: !state[id] })}
          onRecommended={() => apply({ ...uc.presets.find((p) => p.id === 'recommended')!.toggles })}
        />
      )}

      <p className="text-[11.5px] leading-snug text-subtle">
        Simulación guionizada: los pasos y los datos son representativos de un sistema real; las latencias son
        estimaciones y los costes usan precios de referencia aproximados ({PRICES.large.label}: {PRICES.large.input} $ /{' '}
        {PRICES.large.output} $ por millón de tokens de entrada / salida; {PRICES.small.label}: {PRICES.small.input} $ /{' '}
        {PRICES.small.output} $).
      </p>
    </div>
  )
}

function DecisionPanel({ uc, state, onChange }: { uc: UseCase; state: ToggleState; onChange: (s: ToggleState) => void }) {
  const current = uc.presets.find((p) => uc.toggles.every((t) => !!p.toggles[t.id] === !!state[t.id]))
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <SectionLabel className="mr-1">Decisiones de diseño</SectionLabel>
        {uc.presets.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange({ ...p.toggles })}
            title={p.description}
            className={cn(
              'cursor-pointer rounded-lg border px-2.5 py-1 text-[12px] transition-colors',
              current?.id === p.id ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
            )}
          >
            {p.label}
          </button>
        ))}
        {!current && <span className="font-mono text-[10.5px] text-subtle">configuración personalizada</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {uc.toggles.map((t) => {
          const on = !!state[t.id]
          const concept = getConcept(t.concept)
          return (
            <div
              key={t.id}
              className={cn('flex gap-3 rounded-xl border p-3 transition-colors', on ? 'border-accent/40 bg-accent-soft/40' : 'border-border')}
            >
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t.label}
                onClick={() => onChange({ ...state, [t.id]: !on })}
                className={cn('relative mt-0.5 h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors', on ? 'bg-accent' : 'bg-surface-3')}
              >
                <span className={cn('absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform', on && 'translate-x-4')} />
              </button>
              <div className="min-w-0">
                <button type="button" onClick={() => onChange({ ...state, [t.id]: !on })} className="cursor-pointer text-left text-[13.5px] font-medium">
                  {t.label}
                </button>
                <p className="mt-0.5 text-[12.5px] leading-snug text-muted">{t.description}</p>
                {concept && (
                  <Link to={`/c/${concept.id}`} className="mt-1 inline-block text-[11.5px] text-subtle hover:text-fg">
                    Concepto: {concept.title} →
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepCard({ uc, step, index, total }: { uc: UseCase; step: CaseStep; index: number; total: number }) {
  const comp = uc.components.find((c) => c.id === step.component)!
  const block = BLOCKS[comp.kind]
  const Icon = block.icon
  const status = step.status ? STATUS[step.status] : null
  const cost = stepCost(step)
  return (
    <div key={step.id} className="atlas-fade rounded-2xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center gap-2 font-mono text-[10.5px] text-subtle">
        <span>
          PASO {index + 1} / {total}
        </span>
        <span className="flex items-center gap-1 rounded-md bg-surface-2 px-1.5 py-0.5 normal-case">
          <Icon className="size-3" /> {comp.label}
        </span>
        {status && (
          <span className="ml-auto flex items-center gap-1 text-[11px]" style={{ color: status.color }}>
            <status.icon className="size-3.5" /> <span className="text-muted">{status.label}</span>
          </span>
        )}
      </div>
      <h3 className="text-[16px] leading-snug font-semibold">{step.title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{step.detail}</p>
      {step.payload && <CodeBlock code={step.payload.content} lang={step.payload.lang} title={step.payload.label} className="mt-3" />}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-subtle">
        {step.ms > 0 && <span>{step.human ? 'espera humana' : 'tiempo'} {formatDuration(step.ms)}</span>}
        {step.llm && (
          <span>
            {step.llm.tier === 'large' ? 'modelo grande' : 'modelo pequeño'} · {formatTokens(step.llm.input)} → {formatTokens(step.llm.output)} tokens
          </span>
        )}
        {cost > 0 && <span>{formatUsd(cost)}</span>}
        {step.toolCall && <span>llamada a herramienta</span>}
      </div>
    </div>
  )
}

function Timeline({ steps, index, onSelect }: { steps: CaseStep[]; index: number; onSelect: (i: number) => void }) {
  return (
    <ol className="self-start rounded-2xl border border-border bg-surface p-2" aria-label="Pasos de la simulación">
      {steps.map((s, i) => {
        const st = s.status ? STATUS[s.status] : null
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={i === index ? 'step' : undefined}
              className={cn(
                'flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[12.5px] transition-colors',
                i === index ? 'bg-surface-3 text-fg' : i < index ? 'text-muted hover:bg-surface-2' : 'text-subtle hover:bg-surface-2',
              )}
            >
              <span className="w-5 shrink-0 text-right font-mono text-[10.5px] text-subtle">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              {s.human && <UserCheck className="size-3.5 shrink-0 text-subtle" aria-label="interviene una persona" />}
              {st && i <= index && <st.icon className="size-3.5 shrink-0" style={{ color: st.color }} aria-label={st.label} />}
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function Metrics({ m, final }: { m: ReturnType<typeof computeMetrics>; final: boolean }) {
  const items: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Clock, label: 'Tiempo de máquina', value: formatDuration(m.ms) },
    { icon: Hash, label: 'Tokens', value: `${formatTokens(m.inputTokens)} → ${formatTokens(m.outputTokens)}` },
    { icon: Coins, label: 'Coste estimado', value: formatUsd(m.costUsd) },
    { icon: Wrench, label: 'Llamadas a herramientas', value: String(m.toolCalls) },
  ]
  if (m.humanSteps) items.push({ icon: UserCheck, label: 'Espera humana', value: formatDuration(m.humanMs) })
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <SectionLabel className="mb-2">{final ? 'Total de la ejecución' : 'Acumulado hasta este paso'}</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg bg-surface-2 px-2.5 py-2">
            <div className="flex items-center gap-1.5 text-[11px] text-subtle">
              <it.icon className="size-3" /> {it.label}
            </div>
            <div className="mt-0.5 text-[15px] font-semibold">{it.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OutcomeCard({
  uc,
  state,
  onFlip,
  onRecommended,
}: {
  uc: UseCase
  state: ToggleState
  onFlip: (toggleId: string) => void
  onRecommended: () => void
}) {
  const outcome = pickOutcome(uc, state)
  const v = VERDICT[outcome.verdict]
  const notes = notesFor(uc, state)
  const better = improvingToggles(uc, state)
  return (
    <div
      className="atlas-fade rounded-2xl border p-5"
      style={{ borderColor: `color-mix(in oklab, ${v.color} 45%, transparent)`, background: `color-mix(in oklab, ${v.color} 7%, var(--surface))` }}
    >
      <div className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: v.color }}>
        <v.icon className="size-4" /> <span className="text-fg">Resultado: {v.label}</span>
      </div>
      <h3 className="mt-2 text-[19px] leading-snug font-semibold">{outcome.title}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-muted">{outcome.text}</p>
      <p className="mt-3 rounded-xl bg-surface/70 px-3 py-2 text-[13.5px] leading-relaxed">
        <b>Lección:</b> {outcome.lesson}
      </p>
      {notes.length > 0 && (
        <ul className="mt-3 space-y-1 text-[13px] text-muted">
          {notes.map((n) => (
            <li key={n} className="flex gap-2">
              <span className="text-subtle">·</span>
              {n}
            </li>
          ))}
        </ul>
      )}
      {outcome.verdict !== 'success' && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[12.5px] text-subtle">Prueba a cambiar:</span>
          {better.map((id) => {
            const t = uc.toggles.find((x) => x.id === id)!
            return (
              <Button key={id} size="sm" variant="outline" onClick={() => onFlip(id)}>
                <Undo2 /> {state[id] ? 'Desactivar' : 'Activar'} «{t.label}»
              </Button>
            )
          })}
          <Button size="sm" variant="ghost" onClick={onRecommended}>
            Configuración recomendada
          </Button>
        </div>
      )}
    </div>
  )
}

function ComponentInfo({ uc, id, onClose }: { uc: UseCase; id: string; onClose: () => void }) {
  const c = uc.components.find((x) => x.id === id)!
  const block = BLOCKS[c.kind]
  const concept = getConcept(block.concept)
  return (
    <div className="atlas-fade rounded-2xl border border-accent/40 bg-surface p-4">
      <div className="flex items-start gap-3">
        <block.icon className="mt-0.5 size-5 shrink-0 text-accent" />
        <div className="min-w-0 flex-1">
          <div className="font-mono text-[10.5px] tracking-wide text-subtle uppercase">{block.label}</div>
          <div className="text-[15px] font-semibold">{c.label}</div>
          <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.role}</p>
          <p className="mt-1 text-[12.5px] text-subtle">{block.description}</p>
          {c.tools.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.tools.map((t) => (
                <ToolChip key={t} id={t} />
              ))}
            </div>
          )}
          {concept && (
            <Link to={`/c/${concept.id}`} className="mt-2 inline-block text-[12px] text-subtle hover:text-fg">
              Concepto: {concept.title} →
            </Link>
          )}
        </div>
        <button type="button" onClick={onClose} className="cursor-pointer text-[12px] text-subtle hover:text-fg">
          Cerrar
        </button>
      </div>
    </div>
  )
}
