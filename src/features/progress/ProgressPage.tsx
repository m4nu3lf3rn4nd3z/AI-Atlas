import { ArrowRight, ChevronDown, Download, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, SectionLabel, Tooltip } from '@/components/ui/primitives'
import { CASES } from '@/cases'
import { CONCEPT_BY_ID, CONCEPTS, conceptsInLayer, hasContent } from '@/content'
import { LAYERS } from '@/content/layers'
import { PATHS } from '@/content/paths'
import { LABS } from '@/labs/registry'
import { copyText } from '@/lib/clipboard'
import { cn } from '@/lib/cn'
import { formatAgo } from '@/lib/format'
import { caseStatusOf, EXPLORED_CONFIGS, statusOf, useProgress } from '@/stores/progress'
import { recommendNext } from './recommend'
import { PROGRESS_STYLE, progressState, type ProgressState } from './status'

const LEGEND: ProgressState[] = ['learned', 'visited', 'pending', 'unpublished']

export default function ProgressPage() {
  const concepts = useProgress((s) => s.concepts)
  const cases = useProgress((s) => s.cases)
  const labs = useProgress((s) => s.labs)

  const published = CONCEPTS.filter((c) => hasContent(c.id))
  const learned = published.filter((c) => concepts[c.id]?.learnedAt)
  const inProgress = published.filter((c) => statusOf(concepts[c.id]) === 'visited')
  const ratio = published.length ? learned.length / published.length : 0
  const quizScores = Object.values(concepts).map((p) => p.quizBest).filter((v): v is number => v !== undefined)
  const avgQuiz = quizScores.length ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : null
  const explored = CASES.filter((uc) => caseStatusOf(cases[uc.id]) === 'explored').length
  const availableLabs = LABS.filter((l) => l.Component)
  const labsUsed = availableLabs.filter((l) => labs[l.id]).length

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Tu progreso</h1>
      <p className="mt-2 text-[15px] text-muted">
        Qué temas has recorrido y qué te queda. Un concepto cuenta como aprendido al superar su quiz con un 80 %
        (o si lo marcas a mano). Se guarda solo en este navegador.
      </p>

      <section className="mt-8 grid gap-3 lg:grid-cols-[280px_1fr]">
        <Card className="flex items-center gap-5 p-5">
          <Ring ratio={ratio} />
          <div>
            <p className="text-[13px] text-muted">Conceptos aprendidos</p>
            <p className="mt-1 text-[15px]">
              <b className="text-fg">{learned.length}</b> de {published.length} publicados
            </p>
            <p className="mt-1 text-[12px] text-subtle">{CONCEPTS.length} en el mapa en total</p>
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="En curso" value={String(inProgress.length)} hint="visitados sin aprobar el quiz" />
          <Stat label="Casos de uso explorados" value={`${explored} / ${CASES.length}`} hint={`simulados con ${EXPLORED_CONFIGS}+ configuraciones`} />
          <Stat label="Labs usados" value={`${labsUsed} / ${availableLabs.length}`} hint="de los disponibles" />
          <Stat label="Nota media en quizzes" value={avgQuiz === null ? '—' : `${Math.round(avgQuiz * 100)} %`} hint="mejor intento de cada quiz" />
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Recorrido por capas</SectionLabel>
            <p className="mt-1 text-[13px] text-subtle">Cada celda es un concepto. Toca una capa para ver el detalle.</p>
          </div>
          <Legend />
        </div>
        <div className="mt-4 space-y-2">
          {LAYERS.map((layer) => (
            <LayerRow key={layer.id} layerId={layer.id} />
          ))}
        </div>
      </section>

      <Gaps />

      <section className="mt-12 grid gap-6 lg:grid-cols-2">
        <div>
          <SectionLabel className="mb-3">Rutas de aprendizaje</SectionLabel>
          <div className="space-y-2">
            {PATHS.map((p) => {
              const done = p.steps.filter((s) => concepts[s.concept]?.learnedAt).length
              return (
                <Link key={p.id} to={`/paths/${p.id}`} className="block rounded-xl border border-border bg-surface px-4 py-3 hover:border-border-strong">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-medium">{p.title}</span>
                    <span className="text-[12px] text-subtle">
                      {done} / {p.steps.length}
                    </span>
                  </div>
                  <Segments ids={p.steps.map((s) => s.concept)} className="mt-2 h-2" />
                </Link>
              )
            })}
          </div>
        </div>
        <div>
          <SectionLabel className="mb-3">Casos de uso</SectionLabel>
          <div className="space-y-2">
            {CASES.map((uc) => {
              const st = caseStatusOf(cases[uc.id])
              const label = { new: 'Sin empezar', visited: 'Visitado', completed: 'Simulado una vez', explored: 'Explorado' }[st]
              return (
                <Link key={uc.id} to={`/cases/${uc.id}`} className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 hover:border-border-strong">
                  <uc.icon className="size-4 shrink-0 text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[14px]">{uc.title}</span>
                  <span className={cn('shrink-0 text-[12px]', st === 'explored' ? 'text-ok' : 'text-subtle')}>
                    {st === 'explored' && '✓ '}
                    {label}
                    {st === 'completed' && ` · ${cases[uc.id]?.configs?.length ?? 0}/${EXPLORED_CONFIGS}`}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <Activity />
      <DataSection />
    </div>
  )
}

function Ring({ ratio }: { ratio: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  return (
    <div className="relative size-28 shrink-0">
      <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden>
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="9" style={{ stroke: 'var(--prog-0)' }} />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700"
          style={{ stroke: 'var(--prog-2)' }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[30px] font-semibold tracking-tight">
        {Math.round(ratio * 100)}
        <span className="ml-0.5 text-[15px] text-muted">%</span>
      </span>
    </div>
  )
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <Card className="p-4">
      <p className="text-[12.5px] text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      <p className="mt-0.5 text-[11.5px] text-subtle">{hint}</p>
    </Card>
  )
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted" aria-label="Leyenda">
      {LEGEND.map((s) => (
        <span key={s} className="flex items-center gap-1.5">
          <span className="h-3 w-5 rounded-[3px]" style={{ background: PROGRESS_STYLE[s].background, border: PROGRESS_STYLE[s].border }} />
          {PROGRESS_STYLE[s].label}
        </span>
      ))}
    </div>
  )
}

/** One segment per concept, in the given order, with a hover label and a link. */
function Segments({ ids, className }: { ids: string[]; className?: string }) {
  const concepts = useProgress((s) => s.concepts)
  return (
    <div className={cn('flex gap-[2px]', className)}>
      {ids.map((id) => {
        const state = progressState(id, concepts[id])
        const style = PROGRESS_STYLE[state]
        const c = CONCEPT_BY_ID.get(id)!
        return (
          <Tooltip key={id} content={<span><b className="text-fg">{c.title}</b> · {style.label}</span>}>
            <Link
              to={`/c/${id}`}
              aria-label={`${c.title}: ${style.label}`}
              className="min-w-2 flex-1 rounded-[3px] transition-transform hover:scale-y-125"
              style={{ background: style.background, border: style.border }}
            />
          </Tooltip>
        )
      })}
    </div>
  )
}

function LayerRow({ layerId }: { layerId: (typeof LAYERS)[number]['id'] }) {
  const [open, setOpen] = useState(false)
  const concepts = useProgress((s) => s.concepts)
  const layer = LAYERS.find((l) => l.id === layerId)!
  const cs = conceptsInLayer(layerId)
  const published = cs.filter((c) => hasContent(c.id))
  const learned = published.filter((c) => concepts[c.id]?.learnedAt).length
  const pct = published.length ? Math.round((learned / published.length) * 100) : null

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="grid items-center gap-x-4 gap-y-2 px-4 py-3 sm:grid-cols-[220px_1fr_110px]">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex cursor-pointer items-center gap-2 text-left">
          <ChevronDown className={cn('size-3.5 shrink-0 text-subtle transition-transform', !open && '-rotate-90')} />
          <span className="font-mono text-[11px]" style={{ color: layer.color }}>
            {layer.index}
          </span>
          <span className="truncate text-[14px] font-medium">{layer.title}</span>
        </button>
        <Segments ids={cs.map((c) => c.id)} className="h-3" />
        <span className="text-right text-[12.5px] text-muted">
          {pct === null ? 'pronto' : `${pct} %`}
          <span className="ml-1.5 text-subtle">
            {learned}/{published.length}
          </span>
        </span>
      </div>
      {open && (
        <ul className="grid gap-x-6 border-t border-border px-4 py-3 sm:grid-cols-2 lg:grid-cols-3">
          {cs.map((c) => {
            const st = progressState(c.id, concepts[c.id])
            return (
              <li key={c.id}>
                <Link to={`/c/${c.id}`} className="flex items-center gap-2 py-1 text-[13px] hover:text-fg">
                  <span className="h-2.5 w-3.5 shrink-0 rounded-[2px]" style={{ background: PROGRESS_STYLE[st].background, border: PROGRESS_STYLE[st].border }} />
                  <span className={cn('min-w-0 flex-1 truncate', st === 'unpublished' ? 'text-subtle' : 'text-muted')}>{c.title}</span>
                  <span className="shrink-0 text-[11px] text-subtle">{PROGRESS_STYLE[st].label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Gaps() {
  const concepts = useProgress((s) => s.concepts)
  const learnedIds = new Set(CONCEPTS.filter((c) => concepts[c.id]?.learnedAt).map((c) => c.id))
  const unfinished = CONCEPTS.filter((c) => hasContent(c.id) && statusOf(concepts[c.id]) === 'visited')
  const skipped = CONCEPTS.filter((c) => learnedIds.has(c.id)).flatMap((c) =>
    c.prerequisites.filter((p) => hasContent(p) && !learnedIds.has(p)).map((p) => ({ concept: c, missing: CONCEPT_BY_ID.get(p)! })),
  )
  const ready: typeof CONCEPTS[number][] = []
  const next = recommendNext(concepts)
  for (const c of CONCEPTS) {
    if (ready.length >= 5) break
    if (!hasContent(c.id) || concepts[c.id]?.visitedAt) continue
    if (c.prerequisites.every((p) => learnedIds.has(p) || !hasContent(p))) ready.push(c)
  }

  return (
    <section className="mt-12">
      <SectionLabel>Lo que te has dejado</SectionLabel>
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <GapCard title="Empezados sin terminar" empty="Nada a medias: todo lo que abriste lo has completado.">
          {unfinished.map((c) => (
            <GapItem key={c.id} to={`/c/${c.id}/quiz`} title={c.title} note={concepts[c.id]?.quizBest !== undefined ? `mejor nota ${Math.round((concepts[c.id]!.quizBest ?? 0) * 100)} %` : 'quiz sin hacer'} />
          ))}
        </GapCard>
        <GapCard title="Prerrequisitos saltados" empty="Has respetado el orden: ningún concepto aprendido tiene prerrequisitos pendientes.">
          {skipped.map(({ concept, missing }) => (
            <GapItem key={`${concept.id}-${missing.id}`} to={`/c/${missing.id}`} title={missing.title} note={`lo necesita «${concept.title}»`} />
          ))}
        </GapCard>
        <GapCard
          title="Listos para empezar"
          empty="Todos los conceptos publicados que quedan necesitan antes alguno que tienes a medias: termínalos para desbloquearlos."
        >
          {ready.map((c) => (
            <GapItem key={c.id} to={`/c/${c.id}`} title={c.title} note={c.id === next?.id ? 'recomendado' : undefined} />
          ))}
        </GapCard>
      </div>
    </section>
  )
}

function GapCard({ title, empty, children }: { title: string; empty: string; children: ReactNode[] }) {
  return (
    <Card className="p-4">
      <p className="text-[14px] font-medium">
        {title}
        <span className="ml-2 text-[12px] font-normal text-subtle">{children.length}</span>
      </p>
      {children.length > 0 ? <ul className="mt-2 space-y-0.5">{children}</ul> : <p className="mt-2 text-[13px] text-subtle">{empty}</p>}
    </Card>
  )
}

function GapItem({ to, title, note }: { to: string; title: string; note?: string }) {
  return (
    <li>
      <Link to={to} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] hover:bg-surface-2">
        <span className="min-w-0 flex-1">
          <span className="block truncate">{title}</span>
          {note && <span className="block truncate text-[11.5px] text-subtle">{note}</span>}
        </span>
        <ArrowRight className="size-3.5 shrink-0 text-subtle opacity-0 group-hover:opacity-100" />
      </Link>
    </li>
  )
}

function Activity() {
  const concepts = useProgress((s) => s.concepts)
  const cases = useProgress((s) => s.cases)
  const events: { at: number; text: string; to: string }[] = []
  for (const [id, p] of Object.entries(concepts)) {
    const title = CONCEPT_BY_ID.get(id)?.title
    if (!title) continue
    if (p.learnedAt) events.push({ at: p.learnedAt, text: `Aprendiste «${title}»`, to: `/c/${id}` })
    if (p.visitedAt) events.push({ at: p.visitedAt, text: `Abriste «${title}»`, to: `/c/${id}` })
  }
  for (const [id, p] of Object.entries(cases)) {
    const uc = CASES.find((c) => c.id === id)
    if (!uc) continue
    if (p.completedAt) events.push({ at: p.completedAt, text: `Completaste la simulación de «${uc.title}»`, to: `/cases/${id}` })
    else if (p.visitedAt) events.push({ at: p.visitedAt, text: `Abriste el caso «${uc.title}»`, to: `/cases/${id}` })
  }
  events.sort((a, b) => b.at - a.at)
  if (events.length === 0) return null
  return (
    <section className="mt-12">
      <SectionLabel className="mb-3">Actividad reciente</SectionLabel>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface">
        {events.slice(0, 10).map((e) => (
          <li key={`${e.at}-${e.text}`}>
            <Link to={e.to} className="flex items-center gap-3 px-4 py-2.5 text-[13.5px] hover:bg-surface-2">
              <span className="min-w-0 flex-1 truncate">{e.text}</span>
              <span className="shrink-0 text-[12px] text-subtle">{formatAgo(e.at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function DataSection() {
  const state = useProgress()
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const exportJson = JSON.stringify({ app: 'ai-atlas', version: 2, concepts: state.concepts, cases: state.cases, labs: state.labs }, null, 2)

  const onImport = async (file: File) => {
    try {
      const ok = state.importData(JSON.parse(await file.text()))
      setMessage(ok ? 'Progreso importado.' : 'El fichero no tiene el formato esperado.')
    } catch {
      setMessage('No se pudo leer el fichero.')
    }
  }

  return (
    <Card className="mt-12 p-5">
      <SectionLabel>Tus datos</SectionLabel>
      <p className="mt-1 text-[12.5px] text-subtle">
        Copia tu progreso para llevarlo a otro dispositivo (por ejemplo, del PC al iPad) e impórtalo allí.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={async () =>
            setMessage((await copyText(exportJson)) ? 'Progreso copiado al portapapeles como JSON.' : 'No se pudo copiar en este navegador.')
          }
        >
          <Download /> Copiar como JSON
        </Button>
        <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
          <Upload /> Importar JSON
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
        />
        {confirming ? (
          <span className="flex items-center gap-2 text-[13px]">
            ¿Borrar todo el progreso?
            <Button
              size="sm"
              variant="outline"
              className="border-bad/50 text-bad"
              onClick={() => {
                state.reset()
                setConfirming(false)
                setMessage('Progreso borrado.')
              }}
            >
              Sí, borrar
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              Cancelar
            </Button>
          </span>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => setConfirming(true)}>
            <RotateCcw /> Reiniciar
          </Button>
        )}
      </div>
      {message && <p className="mt-3 text-[12.5px] text-muted">{message}</p>}
    </Card>
  )
}
