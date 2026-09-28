import { motion } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import { cn } from '@/lib/cn'
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

/* Resizable side panel on wide screens (it pushes the map), a floating
   panel over the map on tablets, and a full-screen sheet on phones. */
export function InspectorDrawer({ id, tab, onTabChange, onNavigate, onClose }: Props) {
  const width = useUi((s) => s.drawerWidth)
  const setWidth = useUi((s) => s.setDrawerWidth)
  const narrow = useMediaQuery('(max-width: 767px)')
  const overlay = useMediaQuery('(max-width: 1023px)')
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
      className={cn(
        'relative z-20 flex h-full shrink-0 flex-col border-l border-border bg-bg',
        overlay && 'fixed top-12 right-0 bottom-0 z-40 h-auto shadow-2xl shadow-black/40',
        narrow && 'left-0',
      )}
      style={{ width: narrow ? '100%' : overlay ? 'min(560px, 88vw)' : width }}
      aria-label="Inspector de concepto"
    >
      {!overlay && (
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
