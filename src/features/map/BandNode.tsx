import type { Node, NodeProps } from '@xyflow/react'
import { memo } from 'react'
import { conceptsInLayer, hasContent } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'
import type { LayerId } from '@/content/schema'
import { useProgress } from '@/stores/progress'
import { useHighlight } from './highlight'

export type BandNodeType = Node<{ layer: LayerId; width: number; height: number }, 'band'>

function BandNodeImpl({ data }: NodeProps<BandNodeType>) {
  const layer = LAYER_BY_ID[data.layer]
  const concepts = conceptsInLayer(data.layer)
  const learned = useProgress((s) => concepts.filter((c) => s.concepts[c.id]?.learnedAt).length)
  const dimmed = useHighlight((s) => !!s.nodes)
  const written = concepts.filter((c) => hasContent(c.id)).length

  return (
    <div
      className="pointer-events-none relative rounded-2xl border transition-opacity duration-300"
      style={{
        width: data.width,
        height: data.height,
        borderColor: `color-mix(in oklab, ${layer.color} 16%, transparent)`,
        background: `linear-gradient(90deg, color-mix(in oklab, ${layer.color} 9%, transparent), color-mix(in oklab, ${layer.color} 2.5%, transparent) 30%)`,
        opacity: dimmed ? 0.55 : 1,
      }}
    >
      <div className="absolute top-1/2 left-5 w-[172px] -translate-y-1/2">
        <div className="font-mono text-[10.5px] font-medium tracking-[0.12em]" style={{ color: layer.color }}>
          CAPA {layer.index}
        </div>
        <div className="mt-0.5 text-[15px] leading-tight font-semibold text-fg">{layer.title}</div>
        <div className="mt-1 text-[11.5px] leading-snug text-subtle">{layer.subtitle}</div>
        <div className="mt-2 flex items-center gap-2 font-mono text-[10px] text-subtle">
          <span>
            {learned}/{written} aprendidos
          </span>
          {written < concepts.length && <span>· {concepts.length - written} pronto</span>}
        </div>
      </div>
    </div>
  )
}

export const BandNode = memo(BandNodeImpl)
