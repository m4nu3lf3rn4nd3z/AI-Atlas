import { Check, ChevronsDownUp, ChevronsUpDown, ListTree } from 'lucide-react'
import { conceptsInLayer } from '@/content'
import { LAYERS } from '@/content/layers'
import type { LayerId } from '@/content/schema'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'
import { useUi } from '@/stores/ui'

const pill =
  'flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 text-[12.5px] font-medium transition-colors [&_svg]:size-3.5'
const pillOff = 'border-border bg-surface text-muted hover:text-fg'
const pillOn = 'border-accent/50 bg-accent-soft text-fg'

export function MapControls({ current, onJump }: { current: LayerId; onJump: (id: LayerId) => void }) {
  const progress = useProgress((s) => s.concepts)
  const prereqMode = useUi((s) => s.prereqMode)
  const setPrereqMode = useUi((s) => s.setPrereqMode)
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
