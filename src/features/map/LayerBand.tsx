import { Check, ChevronDown, FlaskConical } from 'lucide-react'
import type { CSSProperties } from 'react'
import { conceptsInLayer, hasContent } from '@/content'
import type { Layer } from '@/content/layers'
import { cn } from '@/lib/cn'
import { statusOf, useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { PROGRESS_STYLE, progressState } from '../progress/status'
import { useHighlight } from './highlight'

/* One layer of the stack: a collapsible band with its concepts as a bullet list. */
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

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: collapsed ? '0fr' : '1fr' }}
        aria-hidden={collapsed}
      >
        <div className="overflow-hidden">
        <div className="px-4 pb-4">
          <div className="divide-y divide-border/40 rounded-xl border border-border/40 bg-bg/30">
            {concepts.map((c) => {
              const writ = hasContent(c.id)
              const status = statusOf(progress[c.id])
              return (
                <button
                  key={c.id}
                  type="button"
                  data-concept={c.id}
                  onClick={() => onOpen(c.id)}
                  aria-label={`${c.title}. ${c.short}`}
                  className="group flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left transition-colors first:rounded-t-xl last:rounded-b-xl hover:bg-surface-2"
                >
                  <span
                    className="mt-px size-2 shrink-0 rounded-full"
                    style={{
                      background: layer.color,
                      opacity: writ ? 0.85 : 0.25,
                    }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn('block text-[13.5px] font-medium leading-snug', writ ? 'text-fg' : 'text-muted')}>
                      {c.title}
                    </span>
                    <span className="block truncate text-[12px] leading-snug text-subtle">{c.short}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    {c.labId && (
                      <FlaskConical
                        className="size-3.5 text-subtle opacity-60 group-hover:opacity-100"
                        aria-label="Tiene lab"
                      />
                    )}
                    {status === 'learned' && (
                      <span className="flex size-4 items-center justify-center rounded-full bg-ok/15 text-ok" title="Aprendido">
                        <Check className="size-2.5" strokeWidth={3} />
                      </span>
                    )}
                    {status === 'visited' && (
                      <span className="size-2 rounded-full bg-[var(--layer)] opacity-70" title="Visitado" />
                    )}
                    {!writ && (
                      <span className="font-mono text-[10px] text-subtle">pronto</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        </div>
      </div>
    </section>
  )
}
