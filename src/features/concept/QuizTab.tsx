import { Check, RotateCcw, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { QuizQuestion } from '@/content/schema'
import { cn } from '@/lib/cn'
import { PASS_RATIO, useProgress } from '@/stores/progress'

/* Retrieval practice: one question at a time, immediate feedback with the
   reasoning, and the concept is marked as learned when the score passes. */
export function QuizTab({ conceptId, questions }: { conceptId: string; questions: QuizQuestion[] }) {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [correct, setCorrect] = useState(0)
  const [done, setDone] = useState(false)
  const recordQuiz = useProgress((s) => s.recordQuiz)
  const best = useProgress((s) => s.concepts[conceptId]?.quizBest)
  const learned = useProgress((s) => !!s.concepts[conceptId]?.learnedAt)

  const q = questions[index]!
  const answered = picked !== null

  const choose = (i: number) => {
    if (answered) return
    setPicked(i)
    if (i === q.answer) setCorrect((c) => c + 1)
  }

  const next = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
    } else {
      recordQuiz(conceptId, correct, questions.length)
      setDone(true)
    }
  }

  const restart = () => {
    setIndex(0)
    setPicked(null)
    setCorrect(0)
    setDone(false)
  }

  if (done) {
    const ratio = correct / questions.length
    const passed = ratio >= PASS_RATIO
    return (
      <div className="rounded-2xl border border-border bg-surface p-6 text-center">
        <div
          className={cn(
            'mx-auto mb-3 flex size-12 items-center justify-center rounded-full',
            passed ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn',
          )}
        >
          {passed ? <Check className="size-6" /> : <RotateCcw className="size-5" />}
        </div>
        <p className="text-2xl font-semibold tabular-nums">
          {correct} / {questions.length}
        </p>
        <p className="mt-2 text-[13.5px] text-muted">
          {passed
            ? 'Concepto marcado como aprendido. Aparecerá con un check en el mapa.'
            : `Necesitas un ${Math.round(PASS_RATIO * 100)}% para marcarlo como aprendido. Repasa la teoría y vuelve a intentarlo.`}
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={restart}>
          <RotateCcw /> Repetir
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {questions.map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full',
                i < index || (i === index && answered) ? 'bg-accent' : 'bg-surface-3',
              )}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-subtle">
          {index + 1}/{questions.length}
          {best !== undefined && ` · mejor ${Math.round(best * 100)}%`}
          {learned && ' · ✓'}
        </span>
      </div>

      <p className="mb-4 text-[15px] leading-relaxed font-medium">{q.q}</p>
      <div className="space-y-2">
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
                'flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-[13.5px] leading-relaxed transition-colors',
                !answered && 'cursor-pointer border-border hover:border-border-strong hover:bg-surface-2',
                answered && isRight && 'border-ok/60 bg-ok/10',
                answered && isPicked && !isRight && 'border-bad/60 bg-bad/10',
                answered && !isRight && !isPicked && 'border-border opacity-60',
              )}
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border border-border font-mono text-[11px] text-subtle">
                {answered && isRight ? (
                  <Check className="size-3 text-ok" />
                ) : answered && isPicked ? (
                  <X className="size-3 text-bad" />
                ) : (
                  String.fromCharCode(65 + i)
                )}
              </span>
              {opt}
            </button>
          )
        })}
      </div>

      {answered && (
        <div className="mt-4 rounded-xl border border-border bg-surface-2/60 px-4 py-3">
          <p className={cn('mb-1 text-[12px] font-semibold', picked === q.answer ? 'text-ok' : 'text-bad')}>
            {picked === q.answer ? 'Correcto' : 'No exactamente'}
          </p>
          <p className="text-[13.5px] leading-relaxed text-muted">{q.explain}</p>
          <Button size="sm" variant="primary" className="mt-3" onClick={next}>
            {index + 1 < questions.length ? 'Siguiente' : 'Ver resultado'}
          </Button>
        </div>
      )}
    </div>
  )
}
