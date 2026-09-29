import { BookOpenCheck, Brain, Check, ChevronRight, ExternalLink, RotateCcw, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitives'
import { CONCEPTS, hasContent, loadDetails } from '@/content'
import { LAYER_BY_ID, LAYERS } from '@/content/layers'
import { cn } from '@/lib/cn'

type EnrichedQ = {
  q: string
  options: string[]
  answer: number
  explain: string
  conceptId: string
  conceptTitle: string
  conceptShort: string
  layerTitle: string
  layerColor: string
  layerIndex: number
}

type Phase = 'loading' | 'lobby' | 'quiz' | 'finished'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

const SIZE_OPTIONS = [
  { value: '10', label: '10 preguntas — repaso rápido' },
  { value: '20', label: '20 preguntas — sesión estándar' },
  { value: '40', label: '40 preguntas — sesión larga' },
  { value: 'all', label: 'Todas — modo maratón' },
]

export default function QuizPage() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [allQuestions, setAllQuestions] = useState<EnrichedQ[]>([])
  const [session, setSession] = useState<EnrichedQ[]>([])
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [layerFilter, setLayerFilter] = useState('all')
  const [sessionSize, setSessionSize] = useState('20')
  const answerRef = useRef<HTMLDivElement>(null)

  // Load all quiz data from all concepts
  useEffect(() => {
    Promise.all(
      CONCEPTS.filter((c) => hasContent(c.id)).map(async (concept) => {
        const details = await loadDetails(concept.id)
        if (!details) return []
        const layer = LAYER_BY_ID[concept.layer]!
        return details.quiz.map<EnrichedQ>((q) => ({
          ...q,
          conceptId: concept.id,
          conceptTitle: concept.title,
          conceptShort: concept.short,
          layerTitle: layer.title,
          layerColor: layer.color,
          layerIndex: layer.index,
        }))
      }),
    ).then((all) => {
      setAllQuestions(shuffle(all.flat()))
      setPhase('lobby')
    })
  }, [])

  const startSession = () => {
    const pool =
      layerFilter === 'all'
        ? allQuestions
        : allQuestions.filter((q) => {
            const concept = CONCEPTS.find((c) => c.id === q.conceptId)
            return concept?.layer === layerFilter
          })
    const n = sessionSize === 'all' ? pool.length : Math.min(Number(sessionSize), pool.length)
    setSession(shuffle(pool).slice(0, n))
    setCurrent(0)
    setPicked(null)
    setScore(0)
    setPhase('quiz')
  }

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === session[current]!.answer) setScore((s) => s + 1)
    // Scroll to feedback panel
    requestAnimationFrame(() => answerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
  }

  const next = () => {
    if (current + 1 >= session.length) {
      setPhase('finished')
    } else {
      setCurrent((c) => c + 1)
      setPicked(null)
    }
  }

  const restart = () => {
    setLayerFilter('all')
    setSessionSize('20')
    setPhase('lobby')
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Brain className="size-8 animate-pulse text-accent" />
        <p className="text-[14px] text-muted">Cargando banco de preguntas…</p>
      </div>
    )
  }

  // ── Lobby ──────────────────────────────────────────────────────────────
  if (phase === 'lobby') {
    const poolSize =
      layerFilter === 'all'
        ? allQuestions.length
        : allQuestions.filter((q) => {
            const concept = CONCEPTS.find((c) => c.id === q.conceptId)
            return concept?.layer === layerFilter
          }).length

    const n = sessionSize === 'all' ? poolSize : Math.min(Number(sessionSize), poolSize)

    return (
      <div className="mx-auto max-w-xl px-5 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-accent/10">
            <BookOpenCheck className="size-7 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Práctica de recuperación</h1>
          <p className="mt-2 text-[14px] text-muted">
            {allQuestions.length} preguntas de {CONCEPTS.filter((c) => hasContent(c.id)).length} conceptos.
            Responde y ve al instante la explicación y el concepto completo.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-muted">Capa temática</label>
            <Select value={layerFilter} onValueChange={setLayerFilter}>
              <SelectTrigger active={layerFilter !== 'all'} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las capas</SelectItem>
                {LAYERS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block size-2 rounded-full"
                        style={{ background: l.color }}
                      />
                      {l.index} · {l.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-muted">Duración de la sesión</label>
            <Select value={sessionSize} onValueChange={setSessionSize}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="primary"
            className="mt-2 w-full"
            onClick={startSession}
            disabled={poolSize === 0}
          >
            Empezar · {n} preguntas
            <ChevronRight className="ml-1 size-4" />
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          {LAYERS.map((l) => {
            const count = allQuestions.filter((q) => {
              const c = CONCEPTS.find((cc) => cc.id === q.conceptId)
              return c?.layer === l.id
            }).length
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setLayerFilter(l.id)}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface p-3 text-center transition-colors hover:bg-surface-2"
                style={{ borderColor: layerFilter === l.id ? l.color : undefined }}
              >
                <span className="font-mono text-[11px] font-semibold" style={{ color: l.color }}>
                  {l.index}
                </span>
                <span className="text-[11px] leading-tight text-muted">{l.short}</span>
                <span className="font-mono text-[10px] text-subtle">{count}p</span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Finished ───────────────────────────────────────────────────────────
  if (phase === 'finished') {
    const pct = Math.round((score / session.length) * 100)
    const passed = pct >= 75

    return (
      <div className="mx-auto max-w-xl px-5 py-12 text-center">
        <div
          className={cn(
            'mx-auto mb-4 flex size-16 items-center justify-center rounded-full',
            passed ? 'bg-ok/15 text-ok' : 'bg-accent/10 text-accent',
          )}
        >
          {passed ? <Check className="size-8" strokeWidth={2.5} /> : <Brain className="size-8" />}
        </div>
        <p className="font-mono text-4xl font-bold tabular-nums">
          {score}/{session.length}
        </p>
        <p className="mt-1 font-mono text-xl text-muted">{pct}%</p>
        <p className="mt-3 text-[14px] text-muted">
          {passed
            ? '¡Excelente! Dominas bien estos conceptos.'
            : 'Buen intento. Repasa los conceptos que fallaste y vuelve a intentarlo.'}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button variant="outline" onClick={restart}>
            <RotateCcw className="size-3.5" />
            Nueva sesión
          </Button>
          <Button variant="primary" onClick={startSession}>
            Repetir esta sesión
          </Button>
        </div>
      </div>
    )
  }

  // ── Quiz ───────────────────────────────────────────────────────────────
  const q = session[current]!
  const answered = picked !== null

  return (
    <div className="mx-auto max-w-2xl px-5 py-8">
      {/* Progress */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex flex-1 gap-0.5">
          {session.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                i < current
                  ? 'bg-ok'
                  : i === current
                    ? 'bg-accent'
                    : 'bg-surface-3',
              )}
            />
          ))}
        </div>
        <span className="font-mono text-[12px] text-subtle">
          {current + 1}/{session.length}
        </span>
        <span className="font-mono text-[12px] text-ok">
          {score} ✓
        </span>
      </div>

      {/* Layer badge */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-medium"
          style={{
            background: `color-mix(in oklab, ${q.layerColor} 12%, transparent)`,
            color: q.layerColor,
          }}
        >
          <span className="size-1.5 rounded-full" style={{ background: q.layerColor }} />
          {q.layerIndex} · {q.layerTitle}
        </span>
      </div>

      {/* Question */}
      <p className="mb-5 text-[16px] font-medium leading-relaxed">{q.q}</p>

      {/* Options */}
      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isRight = i === q.answer
          const isPicked = i === picked
          return (
            <button
              key={i}
              type="button"
              onClick={() => choose(i)}
              disabled={answered}
              className={cn(
                'flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left text-[14px] leading-relaxed transition-all',
                !answered && 'cursor-pointer border-border hover:border-border-strong hover:bg-surface-2',
                answered && isRight && 'border-ok/60 bg-ok/10',
                answered && isPicked && !isRight && 'border-bad/60 bg-bad/10',
                answered && !isRight && !isPicked && 'border-border opacity-50',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold transition-colors',
                  !answered && 'border-border text-subtle',
                  answered && isRight && 'border-ok/40 bg-ok/15 text-ok',
                  answered && isPicked && !isRight && 'border-bad/40 bg-bad/15 text-bad',
                  answered && !isRight && !isPicked && 'border-border text-subtle',
                )}
              >
                {answered && isRight ? (
                  <Check className="size-3.5" strokeWidth={2.5} />
                ) : answered && isPicked ? (
                  <X className="size-3.5" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              <span>{opt}</span>
            </button>
          )
        })}
      </div>

      {/* Feedback panel */}
      {answered && (
        <div ref={answerRef} className="mt-5 space-y-3">
          {/* Result + explanation */}
          <div
            className={cn(
              'rounded-xl border px-4 py-4',
              picked === q.answer
                ? 'border-ok/40 bg-ok/8'
                : 'border-bad/40 bg-bad/8',
            )}
          >
            <p
              className={cn(
                'mb-2 flex items-center gap-1.5 text-[13px] font-semibold',
                picked === q.answer ? 'text-ok' : 'text-bad',
              )}
            >
              {picked === q.answer ? (
                <><Check className="size-4" strokeWidth={2.5} /> Correcto</>
              ) : (
                <><X className="size-4" /> No exactamente</>
              )}
            </p>
            <p className="text-[13.5px] leading-relaxed text-muted">{q.explain}</p>
          </div>

          {/* Concept card */}
          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
            <span
              className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg font-mono text-[13px] font-bold"
              style={{
                background: `color-mix(in oklab, ${q.layerColor} 14%, transparent)`,
                color: q.layerColor,
              }}
            >
              {q.layerIndex}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold">{q.conceptTitle}</p>
              <p className="mt-0.5 line-clamp-2 text-[12.5px] leading-snug text-muted">{q.conceptShort}</p>
            </div>
            <Link
              to={`/c/${q.conceptId}`}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[12px] text-muted transition-colors hover:bg-surface-2 hover:text-fg"
            >
              Ver <ExternalLink className="size-3" />
            </Link>
          </div>

          <div className="flex justify-end">
            <Button variant="primary" onClick={next}>
              {current + 1 < session.length ? 'Siguiente pregunta' : 'Ver resultado'}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
