import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  useReactFlow,
  type Edge,
  type Node,
} from '@xyflow/react'
import { useEffect, useMemo, useRef } from 'react'
import { CONCEPT_BY_ID } from '@/content'
import { EDGES } from '@/content/graph'
import { useUi } from '@/stores/ui'
import { BandNode, type BandNodeType } from './BandNode'
import { ConceptNode, type ConceptNodeType } from './ConceptNode'
import { EdgeMarkers, FloatingEdge, type AtlasEdgeType } from './FloatingEdge'
import { computeHighlight, useHighlight } from './highlight'
import { BAND_W, computeLayout, NODE_H, NODE_W } from './layout'

const nodeTypes = { concept: ConceptNode, band: BandNode }
const edgeTypes = { floating: FloatingEdge }
const LAYOUT = computeLayout()

interface Props {
  selected: string | null
  onOpen: (id: string) => void
  onClose: () => void
}

export function AtlasCanvas({ selected, onOpen, onClose }: Props) {
  const hovered = useUi((s) => s.hovered)
  const prereqMode = useUi((s) => s.prereqMode)
  const hiddenEdgeTypes = useUi((s) => s.hiddenEdgeTypes)
  const flow = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)

  // Stable callback for node data, so nodes never need to be rebuilt.
  const openRef = useRef(onOpen)
  useEffect(() => {
    openRef.current = onOpen
  }, [onOpen])

  const nodes = useMemo<(ConceptNodeType | BandNodeType)[]>(() => {
    const open = (id: string) => openRef.current(id)
    const bands: BandNodeType[] = LAYOUT.bands.map((b) => ({
      id: `band-${b.layer}`,
      type: 'band',
      position: { x: 0, y: b.y },
      data: { layer: b.layer, width: BAND_W, height: b.height },
      width: BAND_W,
      height: b.height,
      draggable: false,
      selectable: false,
      focusable: false,
      zIndex: -1,
    }))
    const concepts: ConceptNodeType[] = LAYOUT.nodes.map((p) => ({
      id: p.id,
      type: 'concept',
      position: { x: p.x, y: p.y },
      data: { concept: CONCEPT_BY_ID.get(p.id)!, onOpen: open },
      width: NODE_W,
      height: NODE_H,
      draggable: false,
      focusable: false,
    }))
    return [...bands, ...concepts]
  }, [])

  const visibleEdges = useMemo(
    () => EDGES.filter((e) => !hiddenEdgeTypes.includes(e.type)),
    [hiddenEdgeTypes],
  )
  const edges = useMemo<AtlasEdgeType[]>(
    () =>
      visibleEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'floating',
        data: { type: e.type, note: e.note },
        focusable: false,
        selectable: false,
      })),
    [visibleEdges],
  )

  useEffect(() => {
    useHighlight.setState({
      ...computeHighlight(hovered ?? selected, prereqMode, visibleEdges),
      selected,
    })
  }, [hovered, selected, prereqMode, visibleEdges])

  // Bring the selected concept into view if it is off-screen (e.g. opened from search).
  useEffect(() => {
    if (!selected) return
    const node = flow.getNode(selected)
    const box = containerRef.current?.getBoundingClientRect()
    if (!node || !box) return
    const tl = flow.flowToScreenPosition(node.position)
    const br = flow.flowToScreenPosition({ x: node.position.x + NODE_W, y: node.position.y + NODE_H })
    const inside = tl.x >= box.left && tl.y >= box.top && br.x <= box.right && br.y <= box.bottom
    if (!inside) {
      const { zoom } = flow.getViewport()
      void flow.setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, {
        zoom: Math.max(zoom, 0.8),
        duration: 450,
      })
    }
  }, [selected, flow])

  return (
    <div ref={containerRef} className="h-full w-full">
      <EdgeMarkers />
      <ReactFlow<Node, Edge>
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: { top: '60px', bottom: '16px', x: '16px' } }}
        minZoom={0.25}
        maxZoom={1.75}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        onPaneClick={onClose}
        proOptions={{ hideAttribution: true }}
        aria-label="Mapa del ecosistema de IA"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="var(--grid)" />
        <Controls showInteractive={false} position="bottom-left" />
      </ReactFlow>
    </div>
  )
}
