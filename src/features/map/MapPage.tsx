import { ReactFlowProvider } from '@xyflow/react'
import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { getConcept } from '@/content'
import { useMediaQuery } from '@/lib/hooks'
import { isConceptTab, type ConceptTab } from '../concept/tabs'
import { AtlasCanvas } from './AtlasCanvas'
import { InspectorDrawer } from './InspectorDrawer'
import { LayeredIndex } from './LayeredIndex'
import { MapToolbar } from './MapToolbar'

export default function MapPage() {
  const [params, setParams] = useSearchParams()
  const selected = getConcept(params.get('c'))?.id ?? null
  const tabParam = params.get('tab')
  const tab: ConceptTab = isConceptTab(tabParam) ? tabParam : 'learn'
  const narrow = useMediaQuery('(max-width: 767px)')
  const view = narrow || params.get('view') === 'list' ? 'list' : 'graph'

  const update = useCallback(
    (mutate: (p: URLSearchParams) => void, replace = false) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          mutate(next)
          return next
        },
        { replace },
      ),
    [setParams],
  )

  const open = useCallback(
    (id: string) =>
      update((p) => {
        if (p.get('c') === id) return
        p.set('c', id)
        p.delete('tab')
      }),
    [update],
  )
  const close = useCallback(
    () =>
      update((p) => {
        p.delete('c')
        p.delete('tab')
      }),
    [update],
  )

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, close])

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1">
        {view === 'graph' ? (
          <ReactFlowProvider>
            <AtlasCanvas selected={selected} onOpen={open} onClose={close} />
          </ReactFlowProvider>
        ) : (
          <LayeredIndex selected={selected} onOpen={open} />
        )}
        {!narrow && (
          <MapToolbar
            view={view}
            onViewChange={(v) => update((p) => (v === 'list' ? p.set('view', 'list') : p.delete('view')), true)}
            showGraphTools={view === 'graph'}
          />
        )}
      </div>
      <AnimatePresence>
        {selected && (
          <InspectorDrawer
            key="inspector"
            id={selected}
            tab={tab}
            onTabChange={(t) => update((p) => p.set('tab', t), true)}
            onNavigate={open}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
