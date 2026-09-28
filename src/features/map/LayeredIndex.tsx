import { Check, FlaskConical } from 'lucide-react'
import type { CSSProperties } from 'react'
import { conceptsInLayer, hasContent } from '@/content'
import { KIND_LABELS, LAYERS } from '@/content/layers'
import { cn } from '@/lib/cn'
import { statusOf, useProgress } from '@/stores/progress'
import { LevelBars } from './ConceptNode'

/* Accessible, mobile-friendly alternative to the graph: the same layers,
   top to bottom in learning order. */
export function LayeredIndex({
  selected,
  onOpen,
}: {
  selected: string | null
  onOpen: (id: string) => void
}) {
  const progress = useProgress((s) => s.concepts)

  return (
    <div className="h-full overflow-y-auto px-4 pt-6 pb-12 sm:px-6 md:pt-16">
      <div className="mx-auto max-w-5xl space-y-8">
        {LAYERS.map((layer) => (
          <section
            key={layer.id}
            id={layer.id}
            className="scroll-mt-16"
            style={{ '--layer': layer.color } as CSSProperties}
          >
            <header className="mb-3 flex items-baseline gap-3">
              <span className="font-mono text-[11px] tracking-[0.12em] text-[var(--layer)]">
                CAPA {layer.index}
              </span>
              <h2 className="text-[15px] font-semibold">{layer.title}</h2>
              <span className="hidden text-[12.5px] text-subtle sm:inline">{layer.subtitle}</span>
            </header>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {conceptsInLayer(layer.id).map((c) => {
                const written = hasContent(c.id)
                const status = statusOf(progress[c.id])
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onOpen(c.id)}
                    className={cn(
                      'relative flex cursor-pointer flex-col gap-1 overflow-hidden rounded-xl border bg-surface py-3 pr-3 pl-4 text-left transition-colors hover:border-[var(--layer)]',
                      written ? 'border-border' : 'border-dashed border-border-strong',
                      selected === c.id && 'border-[var(--layer)]',
                    )}
                  >
                    <span
                      className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-[var(--layer)]"
                      style={{ opacity: written ? 1 : 0.4 }}
                    />
                    <span className="flex items-center gap-2">
                      <span className={cn('text-[13.5px] font-medium', !written && 'text-muted')}>
                        {c.title}
                      </span>
                      {status === 'learned' && <Check className="size-3.5 text-ok" />}
                    </span>
                    <span className="line-clamp-2 text-[12.5px] leading-snug text-subtle">{c.short}</span>
                    <span className="mt-1 flex items-center gap-2 font-mono text-[10px] text-subtle">
                      {KIND_LABELS[c.kind]}
                      <LevelBars level={c.level} />
                      {c.labId && <FlaskConical className="size-3" />}
                      {!written && <span className="ml-auto">pronto</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
