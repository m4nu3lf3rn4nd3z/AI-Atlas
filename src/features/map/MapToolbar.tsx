import { LayoutGrid, ListTree, Network, SlidersHorizontal } from 'lucide-react'
import { Popover } from 'radix-ui'
import type { EdgeType } from '@/content/graph'
import { RELATION_LABELS } from '@/content/layers'
import { cn } from '@/lib/cn'
import { useUi } from '@/stores/ui'

const EDGE_TYPES = Object.keys(RELATION_LABELS) as EdgeType[]
const DASH: Partial<Record<EdgeType, string>> = {
  alternative: '6 5',
  'part-of': '2 4',
  mitigates: '8 4 2 4',
  evaluates: '2 4',
}

interface Props {
  view: 'graph' | 'list'
  onViewChange: (v: 'graph' | 'list') => void
  showGraphTools: boolean
}

const pill =
  'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors [&_svg]:size-3.5'

export function MapToolbar({ view, onViewChange, showGraphTools }: Props) {
  const prereqMode = useUi((s) => s.prereqMode)
  const setPrereqMode = useUi((s) => s.setPrereqMode)
  const hidden = useUi((s) => s.hiddenEdgeTypes)
  const toggleEdgeType = useUi((s) => s.toggleEdgeType)

  return (
    <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2">
      <div className="pointer-events-auto flex rounded-xl border border-border bg-surface/90 p-0.5 backdrop-blur">
        {(
          [
            ['graph', 'Grafo', Network],
            ['list', 'Índice', LayoutGrid],
          ] as const
        ).map(([v, label, Icon]) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            aria-pressed={view === v}
            className={cn(pill, view === v ? 'bg-surface-3 text-fg' : 'text-muted hover:text-fg')}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>

      {showGraphTools && (
        <>
          <button
            type="button"
            onClick={() => setPrereqMode(!prereqMode)}
            aria-pressed={prereqMode}
            className={cn(
              pill,
              'pointer-events-auto border backdrop-blur',
              prereqMode
                ? 'border-accent/50 bg-accent-soft text-fg'
                : 'border-border bg-surface/90 text-muted hover:text-fg',
            )}
            title="Al pasar el ratón, resalta toda la cadena de prerrequisitos en lugar de los vecinos directos"
          >
            <ListTree />
            ¿Qué necesito antes?
          </button>

          <Popover.Root>
            <Popover.Trigger asChild>
              <button
                type="button"
                className={cn(
                  pill,
                  'pointer-events-auto border border-border bg-surface/90 text-muted backdrop-blur hover:text-fg',
                )}
              >
                <SlidersHorizontal />
                Relaciones
                {hidden.length > 0 && (
                  <span className="rounded bg-surface-3 px-1 font-mono text-[10px]">
                    {EDGE_TYPES.length - hidden.length}/{EDGE_TYPES.length}
                  </span>
                )}
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                align="start"
                sideOffset={6}
                className="z-40 w-64 rounded-xl border border-border bg-surface p-2 shadow-xl shadow-black/30"
              >
                <p className="px-2 pt-1 pb-2 text-[11.5px] leading-snug text-subtle">
                  Las flechas apuntan a aquello de lo que depende o sobre lo que actúa el origen.
                </p>
                {EDGE_TYPES.map((t) => {
                  const on = !hidden.includes(t)
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleEdgeType(t)}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-left text-[12.5px] hover:bg-surface-2"
                    >
                      <span
                        className={cn(
                          'flex size-4 items-center justify-center rounded border',
                          on ? 'border-accent bg-accent text-accent-fg' : 'border-border-strong',
                        )}
                      >
                        {on && <span className="text-[10px] leading-none">✓</span>}
                      </span>
                      <svg width="28" height="8" aria-hidden>
                        <line
                          x1="0"
                          y1="4"
                          x2="28"
                          y2="4"
                          strokeWidth="1.5"
                          strokeDasharray={DASH[t]}
                          style={{ stroke: 'var(--fg-muted)' }}
                        />
                      </svg>
                      <span className={on ? 'text-fg' : 'text-subtle'}>{RELATION_LABELS[t].label}</span>
                    </button>
                  )
                })}
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>

          <span className="pointer-events-none hidden text-[12px] text-subtle xl:inline">
            Pasa el ratón por un concepto para ver sus conexiones · clic para abrirlo
          </span>
        </>
      )}
    </div>
  )
}
