import { Check, ChevronsDownUp, ChevronsUpDown, ListTree, SlidersHorizontal, Spline } from 'lucide-react'
import { Popover } from 'radix-ui'
import { conceptsInLayer } from '@/content'
import type { EdgeType } from '@/content/graph'
import { LAYERS, RELATION_LABELS } from '@/content/layers'
import type { LayerId } from '@/content/schema'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'
import { EDGE_DASH } from './edgeStyle'

const EDGE_TYPES = Object.keys(RELATION_LABELS) as EdgeType[]

const pill =
  'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-medium transition-colors [&_svg]:size-3.5'
const pillOff = 'border-border bg-surface text-muted hover:text-fg'
const pillOn = 'border-accent/50 bg-accent-soft text-fg'

export function MapControls({ current, onJump }: { current: LayerId; onJump: (id: LayerId) => void }) {
  const progress = useProgress((s) => s.concepts)
  const prereqMode = useUi((s) => s.prereqMode)
  const setPrereqMode = useUi((s) => s.setPrereqMode)
  const showLines = useUi((s) => s.showLines)
  const setShowLines = useUi((s) => s.setShowLines)
  const hidden = useUi((s) => s.hiddenEdgeTypes)
  const toggleEdgeType = useUi((s) => s.toggleEdgeType)
  const collapsed = useUi((s) => s.collapsedLayers)
  const setCollapsed = useUi((s) => s.setCollapsed)
  const allCollapsed = collapsed.length === LAYERS.length

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md">
      <nav className="flex gap-1 overflow-x-auto px-4 pt-2.5 pb-2 sm:px-6" aria-label="Ir a una capa">
        {LAYERS.map((l) => {
          const cs = conceptsInLayer(l.id)
          const learned = cs.filter((c) => progress[c.id]?.learnedAt).length
          const active = current === l.id
          return (
            <button
              key={l.id}
              type="button"
              onClick={() => onJump(l.id)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2.5 text-[12.5px] transition-colors',
                active ? 'bg-surface-3 text-fg' : 'text-muted hover:bg-surface-2 hover:text-fg',
              )}
            >
              <span className="font-mono text-[11px]" style={{ color: l.color }}>
                {l.index}
              </span>
              {l.short}
              {learned > 0 && <span className="font-mono text-[10px] text-ok">{learned}✓</span>}
            </button>
          )
        })}
      </nav>
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2.5 sm:px-6">
        <button
          type="button"
          onClick={() => setPrereqMode(!prereqMode)}
          aria-pressed={prereqMode}
          className={cn(pill, prereqMode ? pillOn : pillOff)}
          title="Al seleccionar un concepto, resalta toda la cadena de conceptos que necesitas saber antes"
        >
          <ListTree />
          ¿Qué necesito antes?
        </button>
        <button
          type="button"
          onClick={() => setShowLines(!showLines)}
          aria-pressed={showLines}
          className={cn(pill, showLines ? pillOn : pillOff)}
          title="Dibujar líneas hacia los conceptos relacionados"
        >
          <Spline />
          Líneas
        </button>
        <Popover.Root>
          <Popover.Trigger asChild>
            <button type="button" className={cn(pill, pillOff)}>
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
                Qué tipos de relación se muestran. Las flechas apuntan a aquello de lo que depende o sobre lo
                que actúa el concepto de origen.
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
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <svg width="28" height="8" aria-hidden>
                      <line
                        x1="0"
                        y1="4"
                        x2="28"
                        y2="4"
                        strokeWidth="1.5"
                        strokeDasharray={EDGE_DASH[t]}
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
        <button
          type="button"
          onClick={() => setCollapsed(allCollapsed ? [] : LAYERS.map((l) => l.id))}
          className={cn(pill, pillOff)}
        >
          {allCollapsed ? <ChevronsUpDown /> : <ChevronsDownUp />}
          {allCollapsed ? 'Desplegar todo' : 'Plegar todo'}
        </button>
        <div className="ml-auto hidden items-center gap-3 text-[11.5px] text-subtle lg:flex" aria-label="Leyenda">
          <span className="flex items-center gap-1.5">
            <span className="flex size-3.5 items-center justify-center rounded-full bg-ok/15 text-ok">
              <Check className="size-2.5" strokeWidth={3} />
            </span>
            aprendido
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-accent opacity-70" /> visitado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded border border-dashed border-border-strong" /> pronto
          </span>
        </div>
      </div>
    </div>
  )
}
