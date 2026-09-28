import { ArrowLeft, Check } from 'lucide-react'
import { Link, useParams } from 'react-router'
import NotFound from '@/app/NotFound'
import { getConcept, hasContent } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'
import { PATH_BY_ID } from '@/content/paths'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'

export default function PathPage() {
  const { pathId } = useParams()
  const path = pathId ? PATH_BY_ID.get(pathId) : undefined
  const progress = useProgress((s) => s.concepts)
  if (!path) return <NotFound />

  const firstPending = path.steps.find((s) => hasContent(s.concept) && !progress[s.concept]?.learnedAt)

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <Link to="/paths" className="mb-6 flex items-center gap-1 text-[12.5px] text-subtle hover:text-fg">
        <ArrowLeft className="size-3.5" /> Rutas
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">{path.title}</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">{path.description}</p>

      <ol className="relative mt-10 space-y-2 before:absolute before:top-3 before:bottom-3 before:left-[15px] before:w-px before:bg-border">
        {path.steps.map((step, i) => {
          const c = getConcept(step.concept)!
          const written = hasContent(c.id)
          const learned = !!progress[c.id]?.learnedAt
          const current = firstPending?.concept === c.id
          const color = LAYER_BY_ID[c.layer].color
          return (
            <li key={c.id} className="relative flex gap-4">
              <span
                className={cn(
                  'relative z-10 mt-3 flex size-[31px] shrink-0 items-center justify-center rounded-full border font-mono text-[11px]',
                  learned ? 'border-ok/50 bg-ok/15 text-ok' : current ? 'border-accent bg-accent-soft text-fg' : 'border-border bg-bg text-subtle',
                )}
              >
                {learned ? <Check className="size-3.5" /> : i + 1}
              </span>
              <Link
                to={`/c/${c.id}`}
                className={cn(
                  'flex-1 rounded-xl border p-4 transition-colors hover:bg-surface',
                  current ? 'border-accent/40 bg-surface' : 'border-transparent',
                  !written && 'opacity-60',
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  <span className="text-[14.5px] font-medium">{c.title}</span>
                  {!written && <span className="font-mono text-[10px] text-subtle">pronto</span>}
                  {current && <span className="ml-auto font-mono text-[10px] text-accent">SIGUIENTE</span>}
                </span>
                <span className="mt-1 block text-[13px] leading-relaxed text-muted">{step.why}</span>
              </Link>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
