import {
  EdgeLabelRenderer,
  getBezierPath,
  Position,
  useInternalNode,
  type Edge,
  type EdgeProps,
  type InternalNode,
} from '@xyflow/react'
import { memo } from 'react'
import type { EdgeType } from '@/content/graph'
import { RELATION_LABELS } from '@/content/layers'
import { useEdgeHighlight } from './highlight'

export type AtlasEdgeType = Edge<{ type: EdgeType; note?: string }, 'floating'>

const DASH: Partial<Record<EdgeType, string>> = {
  alternative: '6 5',
  'part-of': '2 4',
  mitigates: '8 4 2 4',
  evaluates: '2 4',
}

/* Edges attach to the node border along the line between centres, so the
   layered layout reads cleanly in every direction. */
function FloatingEdgeImpl({ id, source, target, data }: EdgeProps<AtlasEdgeType>) {
  const s = useInternalNode(source)
  const t = useInternalNode(target)
  const state = useEdgeHighlight(id)
  if (!s || !t || !data) return null

  const { sx, sy, tx, ty, sourcePos, targetPos } = edgeParams(s, t)
  const [path, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    sourcePosition: sourcePos,
    targetX: tx,
    targetY: ty,
    targetPosition: targetPos,
    curvature: 0.35,
  })
  const lit = state === 'lit'

  return (
    <>
      <path
        d={path}
        fill="none"
        strokeWidth={lit ? 1.75 : 1}
        strokeDasharray={DASH[data.type]}
        markerEnd={`url(#atlas-arrow${lit ? '-lit' : ''})`}
        style={{
          stroke: lit ? 'var(--accent)' : 'var(--border-strong)',
          opacity: state === 'dim' ? 0.04 : lit ? 1 : 0.22,
          transition: 'opacity 200ms, stroke 200ms',
        }}
      />
      {lit && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan pointer-events-none absolute rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted shadow-sm"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)` }}
            title={data.note}
          >
            {RELATION_LABELS[data.type].verb}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

export const FloatingEdge = memo(FloatingEdgeImpl)

/** Arrow markers shared by every edge (rendered once per map). */
export function EdgeMarkers() {
  return (
    <svg className="absolute size-0" aria-hidden>
      <defs>
        {[
          ['atlas-arrow', 'var(--border-strong)'],
          ['atlas-arrow-lit', 'var(--accent)'],
        ].map(([markerId, color]) => (
          <marker
            key={markerId}
            id={markerId}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" style={{ fill: color }} />
          </marker>
        ))}
      </defs>
    </svg>
  )
}

function center(n: InternalNode) {
  const w = n.measured.width ?? 0
  const h = n.measured.height ?? 0
  return { x: n.internals.positionAbsolute.x + w / 2, y: n.internals.positionAbsolute.y + h / 2, w, h }
}

/** Point where the line from a's centre towards b's centre leaves a's box. */
function intersection(a: InternalNode, b: InternalNode) {
  const ca = center(a)
  const cb = center(b)
  const dx = cb.x - ca.x
  const dy = cb.y - ca.y
  if (dx === 0 && dy === 0) return { x: ca.x, y: ca.y }
  const scale = 1 / Math.max(Math.abs(dx) / (ca.w / 2), Math.abs(dy) / (ca.h / 2))
  return { x: ca.x + dx * scale, y: ca.y + dy * scale }
}

function sideOf(n: InternalNode, p: { x: number; y: number }): Position {
  const { x, y } = n.internals.positionAbsolute
  const w = n.measured.width ?? 0
  const h = n.measured.height ?? 0
  if (p.x <= x + 1) return Position.Left
  if (p.x >= x + w - 1) return Position.Right
  if (p.y <= y + 1) return Position.Top
  if (p.y >= y + h - 1) return Position.Bottom
  return Position.Top
}

function edgeParams(source: InternalNode, target: InternalNode) {
  const sp = intersection(source, target)
  const tp = intersection(target, source)
  return {
    sx: sp.x,
    sy: sp.y,
    tx: tp.x,
    ty: tp.y,
    sourcePos: sideOf(source, sp),
    targetPos: sideOf(target, tp),
  }
}
