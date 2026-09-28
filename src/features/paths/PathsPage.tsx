import { ArrowRight, Route } from 'lucide-react'
import { Link } from 'react-router'
import { hasContent } from '@/content'
import { PATHS } from '@/content/paths'
import { useProgress } from '@/stores/progress'

export default function PathsPage() {
  const progress = useProgress((s) => s.concepts)
  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Rutas de aprendizaje</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
        Recorridos ordenados según los prerrequisitos. Cada paso explica por qué va ahí.
      </p>
      <div className="mt-8 space-y-3">
        {PATHS.map((p) => {
          const learned = p.steps.filter((s) => progress[s.concept]?.learnedAt).length
          const published = p.steps.filter((s) => hasContent(s.concept)).length
          return (
            <Link
              key={p.id}
              to={`/paths/${p.id}`}
              className="group flex gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
            >
              <Route className="mt-0.5 size-5 shrink-0 text-accent" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-3">
                  <h2 className="text-[16px] font-semibold">{p.title}</h2>
                  <span className="font-mono text-[11px] text-subtle">{p.steps.length} pasos</span>
                </div>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{p.description}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex h-1.5 flex-1 gap-0.5">
                    {p.steps.map((s) => (
                      <span
                        key={s.concept}
                        className="flex-1 rounded-full"
                        style={{
                          background: progress[s.concept]?.learnedAt
                            ? 'var(--ok)'
                            : hasContent(s.concept)
                              ? 'var(--border-strong)'
                              : 'var(--surface-3)',
                        }}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[10.5px] text-subtle">
                    {learned}/{p.steps.length} · {published} publicados
                  </span>
                </div>
              </div>
              <ArrowRight className="size-4 shrink-0 self-center text-subtle group-hover:text-fg" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
