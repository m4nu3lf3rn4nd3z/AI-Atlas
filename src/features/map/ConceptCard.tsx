import { Check, FlaskConical } from 'lucide-react'
import { memo } from 'react'
import { LevelBars } from '@/components/LevelBars'
import { hasContent } from '@/content'
import { KIND_LABELS } from '@/content/layers'
import type { ConceptMeta } from '@/content/schema'
import { cn } from '@/lib/cn'
import { statusOf, useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { useHighlight, useNodeHighlight } from './highlight'

/* A concept on the map. `data-concept` lets the connection layer find it. */
function ConceptCardImpl({ concept, onOpen }: { concept: ConceptMeta; onOpen: (id: string) => void }) {
  const state = useNodeHighlight(concept.id)
  const isFocus = useHighlight((s) => s.active === concept.id || s.selected === concept.id)
  const status = useProgress((s) => statusOf(s.concepts[concept.id]))
  const setHovered = useUi((s) => s.setHovered)
  const written = hasContent(concept.id)

  return (
    <button
      type="button"
      data-concept={concept.id}
      onClick={() => onOpen(concept.id)}
      onMouseEnter={() => setHovered(concept.id)}
      onMouseLeave={() => setHovered(null)}
      onFocus={() => setHovered(concept.id)}
      onBlur={() => setHovered(null)}
      aria-label={`${concept.title}. ${concept.short}`}
      className={cn(
        'group relative z-10 flex h-full min-h-[104px] cursor-pointer flex-col overflow-hidden rounded-xl border bg-surface py-3 pr-3 pl-4 text-left transition-[opacity,box-shadow,border-color,transform] duration-200 hover:-translate-y-px',
        written ? 'border-border' : 'border-dashed border-border-strong',
        state === 'dim' && 'opacity-30',
        state === 'lit' && !isFocus && 'border-[color-mix(in_oklab,var(--layer)_55%,transparent)]',
        isFocus && 'border-[var(--layer)] shadow-[0_0_0_1px_var(--layer),0_10px_30px_-10px_var(--layer)]',
      )}
    >
      <span
        className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full bg-[var(--layer)]"
        style={{ opacity: written ? 1 : 0.35 }}
      />
      <span className="flex items-start gap-2">
        <span className={cn('flex-1 text-[14px] leading-snug font-medium', written ? 'text-fg' : 'text-muted')}>
          {concept.title}
        </span>
        {status === 'learned' && (
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-ok/15 text-ok" title="Aprendido">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        )}
        {status === 'visited' && (
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--layer)] opacity-70" title="Visitado" />
        )}
      </span>
      <span className="mt-1 line-clamp-2 text-[12.5px] leading-snug text-subtle">{concept.short}</span>
      <span className="mt-auto flex items-center gap-1.5 pt-2 font-mono text-[10px] text-subtle">
        <span>{KIND_LABELS[concept.kind]}</span>
        <LevelBars level={concept.level} />
        {concept.labId && <FlaskConical className="size-3" aria-label="Tiene lab" />}
        {!written && <span className="ml-auto">pronto</span>}
      </span>
    </button>
  )
}

export const ConceptCard = memo(ConceptCardImpl)
