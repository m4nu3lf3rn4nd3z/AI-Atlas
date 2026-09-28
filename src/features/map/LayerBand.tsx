import { ChevronDown } from 'lucide-react'
import type { CSSProperties } from 'react'
import { conceptsInLayer, hasContent } from '@/content'
import type { Layer } from '@/content/layers'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { PROGRESS_STYLE, progressState } from '../progress/status'
import { ConceptCard } from './ConceptCard'
import { useHighlight } from './highlight'

/* One layer of the stack: a collapsible band with its concepts. */
export function LayerBand({ layer, onOpen }: { layer: Layer; onOpen: (id: string) => void }) {
  const concepts = conceptsInLayer(layer.id)
  const collapsed = useUi((s) => s.collapsedLayers.includes(layer.id))
  const toggle = useUi((s) => s.toggleCollapsed)
  const progress = useProgress((s) => s.concepts)
  const dimmed = useHighlight((s) => !!s.nodes && !concepts.some((c) => s.nodes!.has(c.id)))
  const written = concepts.filter((c) => hasContent(c.id)).length
  const learned = concepts.filter((c) => progress[c.id]?.learnedAt).length

  return (
    <section
      id={layer.id}
      data-layer={layer.id}
      aria-labelledby={`${layer.id}-title`}
      className={cn('scroll-mt-28 rounded-2xl border transition-opacity duration-300', dimmed && 'opacity-60')}
      style={
        {
          '--layer': layer.color,
          borderColor: `color-mix(in oklab, ${layer.color} 18%, transparent)`,
          background: `linear-gradient(180deg, color-mix(in oklab, ${layer.color} 7%, transparent), color-mix(in oklab, ${layer.color} 2%, transparent))`,
        } as CSSProperties
      }
    >
      <button
        type="button"
        data-layer-header={layer.id}
        onClick={() => toggle(layer.id)}
        aria-expanded={!collapsed}
        className="relative z-10 flex w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3 text-left"
      >
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-xl font-mono text-[15px] font-semibold"
          style={{ background: `color-mix(in oklab, ${layer.color} 16%, transparent)`, color: layer.color }}
        >
          {layer.index}
        </span>
        <span className="min-w-0 flex-1">
          <span id={`${layer.id}-title`} className="block text-[15.5px] leading-tight font-semibold">
            {layer.title}
          </span>
          <span className="block truncate text-[12.5px] text-subtle">{layer.subtitle}</span>
        </span>
        <span className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
          <span className="font-mono text-[10.5px] text-subtle">
            {learned}/{written} aprendidos
            {written < concepts.length && ` · ${concepts.length - written} pronto`}
          </span>
          <span className="flex h-1.5 w-40 gap-[2px]" aria-hidden>
            {concepts.map((c) => {
              const style = PROGRESS_STYLE[progressState(c.id, progress[c.id])]
              return (
                <span
                  key={c.id}
                  className="flex-1 rounded-full"
                  style={{ background: style.background, border: style.border }}
                />
              )
            })}
          </span>
        </span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-subtle transition-transform duration-200', collapsed && '-rotate-90')}
        />
      </button>

      {!collapsed && (
        <div className="grid gap-2.5 px-4 pb-4 [grid-template-columns:repeat(auto-fill,minmax(min(100%,220px),1fr))]">
          {concepts.map((c) => (
            <ConceptCard key={c.id} concept={c} onOpen={onOpen} />
          ))}
        </div>
      )}
    </section>
  )
}
