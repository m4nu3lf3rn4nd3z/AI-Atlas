import { motion } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import { useMediaQuery } from '@/lib/hooks'
import { useUi } from '@/stores/ui'
import { ConceptView } from '../concept/ConceptView'
import type { ConceptTab } from '../concept/tabs'

const MIN_W = 400
const MAX_W = 960

interface Props {
  id: string
  tab: ConceptTab
  onTabChange: (tab: ConceptTab) => void
  onNavigate: (id: string) => void
  onClose: () => void
}

/* Resizable side panel on desktop, full-screen sheet on mobile. */
export function InspectorDrawer({ id, tab, onTabChange, onNavigate, onClose }: Props) {
  const width = useUi((s) => s.drawerWidth)
  const setWidth = useUi((s) => s.setDrawerWidth)
  const narrow = useMediaQuery('(max-width: 767px)')
  const dragging = useRef(false)

  const onPointerDown = (e: PointerEvent) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: PointerEvent) => {
    if (!dragging.current) return
    const max = Math.min(MAX_W, window.innerWidth * 0.75)
    setWidth(Math.round(Math.min(max, Math.max(MIN_W, window.innerWidth - e.clientX))))
  }
  const onPointerUp = (e: PointerEvent) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
      className="relative z-20 flex h-full shrink-0 flex-col border-l border-border bg-bg max-md:fixed max-md:inset-0 max-md:top-12"
      style={{ width: narrow ? '100%' : width }}
      aria-label="Inspector de concepto"
    >
      {!narrow && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar panel"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onDoubleClick={() => setWidth(560)}
          className="group absolute inset-y-0 -left-1.5 z-10 w-3 cursor-col-resize"
        >
          <div className="mx-auto h-full w-px bg-transparent transition-colors group-hover:bg-accent/60" />
        </div>
      )}
      <ConceptView
        id={id}
        tab={tab}
        onTabChange={onTabChange}
        onNavigate={onNavigate}
        onClose={onClose}
        variant="drawer"
      />
    </motion.aside>
  )
}
