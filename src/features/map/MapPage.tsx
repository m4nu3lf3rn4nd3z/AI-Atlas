import { AnimatePresence } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { useLocation, useSearchParams } from 'react-router'
import { getConcept } from '@/content'
import { EDGES } from '@/content/graph'
import { LAYERS } from '@/content/layers'
import type { LayerId } from '@/content/schema'
import { useUi } from '@/stores/ui'
import { isConceptTab, type ConceptTab } from '../concept/tabs'
import { Connections } from './Connections'
import { computeHighlight, useHighlight } from './highlight'
import { InspectorDrawer } from './InspectorDrawer'
import { LayerBand } from './LayerBand'
import { MapControls } from './MapControls'

/* The atlas: the eight layers of the stack from top (fundamentals) to
   bottom (production). Connections are only drawn for the concept you are
   pointing at or have open, so the map stays readable. */
export default function MapPage() {
  const [params, setParams] = useSearchParams()
  const selected = getConcept(params.get('c'))?.id ?? null
  const tabParam = params.get('tab')
  const tab: ConceptTab = isConceptTab(tabParam) ? tabParam : 'learn'

  const hovered = useUi((s) => s.hovered)
  const setHovered = useUi((s) => s.setHovered)
  const prereqMode = useUi((s) => s.prereqMode)
  const hiddenEdgeTypes = useUi((s) => s.hiddenEdgeTypes)

  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState<LayerId>('fundamentals')

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
  const close = useCallback(() => {
    // Touch screens never fire mouseleave, so a tapped card would stay "hovered".
    setHovered(null)
    update((p) => {
      p.delete('c')
      p.delete('tab')
    })
  }, [update, setHovered])

  // Highlight: the hovered concept wins; otherwise the one open in the inspector.
  const visibleEdges = useMemo(() => EDGES.filter((e) => !hiddenEdgeTypes.includes(e.type)), [hiddenEdgeTypes])
  useEffect(() => {
    useHighlight.setState({ ...computeHighlight(hovered ?? selected, prereqMode, visibleEdges), selected })
  }, [hovered, selected, prereqMode, visibleEdges])
  useEffect(() => () => useHighlight.setState({ active: null, selected: null, nodes: null, edges: null }), [])

  // Scrollspy for the layer navigation.
  useEffect(() => {
    const root = scrollRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setCurrent(visible[0].target.id as LayerId)
      },
      { root, rootMargin: '-110px 0px -55% 0px' },
    )
    root.querySelectorAll('section[data-layer]').forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  const jump = useCallback((id: LayerId) => {
    if (useUi.getState().collapsedLayers.includes(id)) useUi.getState().toggleCollapsed(id)
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }, [])

  // /map#knowledge jumps straight to a layer.
  const { hash } = useLocation()
  useEffect(() => {
    const id = hash.slice(1)
    if (LAYERS.some((l) => l.id === id)) jump(id as LayerId)
  }, [hash, jump])

  // Opened from search or a link: unfold its layer and bring the card into view.
  useEffect(() => {
    if (!selected) return
    const layer = getConcept(selected)!.layer
    if (useUi.getState().collapsedLayers.includes(layer)) useUi.getState().toggleCollapsed(layer)
    requestAnimationFrame(() => {
      const el = contentRef.current?.querySelector(`[data-concept="${selected}"]`)
      const box = scrollRef.current?.getBoundingClientRect()
      if (!el || !box) return
      const r = el.getBoundingClientRect()
      if (r.top < box.top + 110 || r.bottom > box.bottom) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    })
  }, [selected])

  useEffect(() => {
    if (!selected) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, close])

  // A click on empty space closes the inspector, like clicking the background of a canvas.
  const onBackgroundClick = (e: MouseEvent) => {
    if (selected && !(e.target as HTMLElement).closest('button, a')) close()
  }

  return (
    <div className="flex h-full">
      <div ref={scrollRef} className="relative min-w-0 flex-1 overflow-y-auto" onClick={onBackgroundClick}>
        <MapControls current={current} onJump={jump} />
        <div className="px-4 pt-5 pb-20 sm:px-6">
          <p className="mx-auto mb-4 max-w-[1400px] text-[13.5px] text-muted">
            El stack de IA en 8 capas, de cómo funciona un modelo por dentro hasta llevarlo a producción. Pasa el
            ratón o toca un concepto para ver con qué se conecta; ábrelo para estudiarlo.
          </p>
          <div ref={contentRef} className="relative mx-auto max-w-[1400px] space-y-3">
            <Connections contentRef={contentRef} />
            {LAYERS.map((layer) => (
              <LayerBand key={layer.id} layer={layer} onOpen={open} />
            ))}
          </div>
        </div>
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
