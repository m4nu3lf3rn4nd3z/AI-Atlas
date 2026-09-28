import { useCallback, useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { CONCEPT_BY_ID } from '@/content'
import { EDGES, type EdgeType } from '@/content/graph'
import { RELATION_LABELS } from '@/content/layers'
import { useUi } from '@/stores/ui'
import { EDGE_DASH } from './edgeStyle'
import { connect, type Point, type Rect } from './geometry'
import { useHighlight } from './highlight'

interface Line {
  id: string
  type: EdgeType
  d: string
  mid: Point
}

/* Draws only the connections of the active concept (hovered or selected).
   The SVG sits under the cards (z-0) so lines run through the gaps; the
   relation labels sit on top (z-20). Positions are measured from the DOM,
   and a concept inside a collapsed layer is anchored to the layer header. */
export function Connections({ contentRef }: { contentRef: RefObject<HTMLDivElement | null> }) {
  const edges = useHighlight((s) => s.edges)
  const showLines = useUi((s) => s.showLines)
  const collapsed = useUi((s) => s.collapsedLayers)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [lines, setLines] = useState<Line[]>([])

  const measure = useCallback(() => {
    const root = contentRef.current
    if (!root) return
    setSize({ w: root.scrollWidth, h: root.scrollHeight })
    if (!edges || !showLines) {
      setLines([])
      return
    }
    const base = root.getBoundingClientRect()
    const rectOf = (id: string): Rect | null => {
      const el =
        root.querySelector(`[data-concept="${id}"]`) ??
        root.querySelector(`[data-layer-header="${CONCEPT_BY_ID.get(id)?.layer}"]`)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }
    }
    const next: Line[] = []
    for (const e of EDGES) {
      if (!edges.has(e.id)) continue
      const a = rectOf(e.source)
      const b = rectOf(e.target)
      if (!a || !b || (a.x === b.x && a.y === b.y)) continue
      next.push({ id: e.id, type: e.type, ...connect(a, b) })
    }
    setLines(next)
  }, [contentRef, edges, showLines])

  useLayoutEffect(() => {
    measure()
  }, [measure, collapsed])

  useEffect(() => {
    const root = contentRef.current
    if (!root) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(root)
    return () => ro.disconnect()
  }, [contentRef, measure])

  return (
    <>
      <svg
        className="pointer-events-none absolute top-0 left-0 z-0 overflow-visible"
        width={size.w}
        height={size.h}
        aria-hidden
      >
        <defs>
          <marker id="map-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 1 L9 5 L0 9z" style={{ fill: 'var(--accent)' }} />
          </marker>
        </defs>
        {lines.map((l) => (
          <path
            key={l.id}
            d={l.d}
            fill="none"
            strokeWidth={1.75}
            strokeDasharray={EDGE_DASH[l.type]}
            markerEnd="url(#map-arrow)"
            className="atlas-fade"
            style={{ stroke: 'var(--accent)' }}
          />
        ))}
      </svg>
      <div className="pointer-events-none absolute top-0 left-0 z-20" aria-hidden>
        {lines.map((l) => (
          <span
            key={l.id}
            className="atlas-fade absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] whitespace-nowrap text-muted shadow-sm"
            style={{ left: l.mid.x, top: l.mid.y }}
          >
            {RELATION_LABELS[l.type].verb}
          </span>
        ))}
      </div>
    </>
  )
}
