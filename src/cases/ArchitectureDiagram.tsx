import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { connect, type Rect } from '@/features/map/geometry'
import { cn } from '@/lib/cn'
import { BLOCKS } from './blocks'
import { activeComponents, evalCond } from './engine'
import type { ToggleState, UseCase } from './types'

interface Props {
  uc: UseCase
  state: ToggleState
  /** Component doing the work in the current step. */
  current?: string
  selected?: string | null
  onSelect: (id: string) => void
}

/* The architecture of a use case on a small grid. Components switched off by
   the current decisions stay visible but faded, so you see what is missing. */
export function ArchitectureDiagram({ uc, state, current, selected, onSelect }: Props) {
  const markerId = useId().replace(/:/g, '')
  const gridRef = useRef<HTMLDivElement>(null)
  const [paths, setPaths] = useState<{ key: string; d: string }[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })
  const active = activeComponents(uc, state)
  const cols = Math.max(...uc.components.map((c) => c.col)) + 1
  const rows = Math.max(...uc.components.map((c) => c.row)) + 1

  const measure = useCallback(() => {
    const root = gridRef.current
    if (!root) return
    const base = root.getBoundingClientRect()
    setSize({ w: root.scrollWidth, h: root.scrollHeight })
    const rectOf = (id: string): Rect | null => {
      const el = root.querySelector(`[data-node="${id}"]`)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }
    }
    const next: { key: string; d: string }[] = []
    for (const f of uc.flows) {
      if (!evalCond(f.when, state) || !active.has(f.from) || !active.has(f.to)) continue
      const a = rectOf(f.from)
      const b = rectOf(f.to)
      if (a && b) next.push({ key: `${f.from}>${f.to}`, d: connect(a, b).d })
    }
    setPaths(next)
    // `active` is derived from uc + state, which are already dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uc, state])

  useLayoutEffect(() => measure(), [measure])
  useEffect(() => {
    const root = gridRef.current
    if (!root) return
    const ro = new ResizeObserver(() => measure())
    ro.observe(root)
    return () => ro.disconnect()
  }, [measure])

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface p-3">
      <div
        ref={gridRef}
        className="relative grid gap-x-8 gap-y-5 p-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(118px, 1fr))`,
          gridTemplateRows: `repeat(${rows}, auto)`,
          minWidth: cols * 140,
        }}
      >
        <svg className="pointer-events-none absolute top-0 left-0 z-0" width={size.w} height={size.h} aria-hidden>
          <defs>
            <marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 1 L9 5 L0 9z" style={{ fill: 'var(--fg-subtle)' }} />
            </marker>
          </defs>
          {paths.map((p) => (
            <path
              key={p.key}
              d={p.d}
              fill="none"
              strokeWidth={1.5}
              markerEnd={`url(#${markerId})`}
              className="atlas-fade"
              style={{ stroke: 'var(--border-strong)' }}
            />
          ))}
        </svg>
        {uc.components.map((c) => {
          const block = BLOCKS[c.kind]
          const Icon = block.icon
          const on = active.has(c.id)
          const isCurrent = on && current === c.id
          return (
            <button
              key={c.id}
              type="button"
              data-node={c.id}
              onClick={() => onSelect(c.id)}
              aria-pressed={selected === c.id}
              title={on ? c.role : `${c.label}: desactivado por las decisiones actuales`}
              className={cn(
                'relative z-10 flex cursor-pointer flex-col items-start gap-1 rounded-xl border bg-surface px-3 py-2.5 text-left transition-all duration-300',
                on ? 'border-border-strong' : 'border-dashed border-border opacity-35',
                c.offline && on && 'border-dashed',
                selected === c.id && 'border-accent',
                isCurrent && 'border-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_28%,transparent)]',
              )}
              style={{ gridColumn: c.col + 1, gridRow: c.row + 1 }}
            >
              <span className="flex items-center gap-1.5 font-mono text-[9.5px] tracking-wide text-subtle uppercase">
                <Icon className={cn('size-3.5', isCurrent ? 'text-accent' : 'text-muted')} />
                {block.label}
                {c.offline && <span className="rounded bg-surface-3 px-1 normal-case">offline</span>}
              </span>
              <span className="text-[13px] leading-tight font-medium">{c.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
