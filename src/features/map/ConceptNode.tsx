import { Handle, Position, type Node, type NodeProps } from '@xyflow/react'
import { Check, FlaskConical } from 'lucide-react'
import { memo, type CSSProperties } from 'react'
import { hasContent } from '@/content'
import { KIND_LABELS, LAYER_BY_ID, LEVEL_LABELS } from '@/content/layers'
import type { ConceptMeta } from '@/content/schema'
import { cn } from '@/lib/cn'
import { statusOf, useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { useHighlight, useNodeHighlight } from './highlight'

export type ConceptNodeType = Node<{ concept: ConceptMeta; onOpen: (id: string) => void }, 'concept'>

const hidden = '!pointer-events-none !opacity-0 !border-0 !bg-transparent'

function ConceptNodeImpl({ data }: NodeProps<ConceptNodeType>) {
  const { concept, onOpen } = data
  const state = useNodeHighlight(concept.id)
  const isActive = useHighlight((s) => s.active === concept.id)
  const isSelected = useHighlight((s) => s.selected === concept.id)
  const status = useProgress((s) => statusOf(s.concepts[concept.id]))
  const setHovered = useUi((s) => s.setHovered)
  const written = hasContent(concept.id)
  const color = LAYER_BY_ID[concept.layer].color

  return (
    <div
      className="relative h-[58px] w-[192px]"
      style={{ '--layer': color } as CSSProperties}
      onMouseEnter={() => setHovered(concept.id)}
      onMouseLeave={() => setHovered(null)}
    >
      <Handle type="target" position={Position.Top} className={hidden} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} className={hidden} isConnectable={false} />
      <button
        type="button"
        onClick={() => onOpen(concept.id)}
        onFocus={() => setHovered(concept.id)}
        onBlur={() => setHovered(null)}
        title={concept.short}
        aria-label={`${concept.title}. ${concept.short}`}
        className={cn(
          'nodrag nopan group flex h-full w-full cursor-pointer flex-col justify-center overflow-hidden rounded-xl border bg-surface pr-3 pl-4 text-left transition-[opacity,box-shadow,border-color,transform] duration-200',
          written ? 'border-border' : 'border-dashed border-border-strong',
          state === 'dim' && 'opacity-25',
          state === 'lit' && 'border-[color-mix(in_oklab,var(--layer)_55%,transparent)]',
          (isActive || isSelected) &&
            'border-[var(--layer)] shadow-[0_0_0_1px_var(--layer),0_8px_30px_-8px_var(--layer)]',
          'hover:-translate-y-px',
        )}
      >
        <span
          className="absolute top-3 bottom-3 left-0 w-[3px] rounded-r-full"
          style={{ background: color, opacity: written ? 1 : 0.4 }}
        />
        <span
          className={cn(
            'line-clamp-2 text-[13px] leading-[1.25] font-medium',
            written ? 'text-fg' : 'text-muted',
          )}
        >
          {concept.title}
        </span>
        <span className="mt-1 flex items-center gap-1.5 font-mono text-[10px] text-subtle">
          <span>{KIND_LABELS[concept.kind]}</span>
          <LevelBars level={concept.level} />
          {concept.labId && <FlaskConical className="size-3" aria-label="Tiene lab" />}
          {!written && <span className="ml-auto text-subtle/80">pronto</span>}
        </span>
        {status === 'learned' && (
          <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-ok/15 text-ok">
            <Check className="size-2.5" strokeWidth={3} />
          </span>
        )}
        {status === 'visited' && (
          <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[var(--layer)] opacity-70" />
        )}
      </button>
    </div>
  )
}

export function LevelBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-[2px]" aria-label={`Nivel ${LEVEL_LABELS[level]}`}>
      {[1, 2, 3].map((l) => (
        <span
          key={l}
          className={cn('w-[3px] rounded-full', l <= level ? 'bg-muted' : 'bg-border-strong')}
          style={{ height: 3 + l * 2 }}
        />
      ))}
    </span>
  )
}

export const ConceptNode = memo(ConceptNodeImpl)
