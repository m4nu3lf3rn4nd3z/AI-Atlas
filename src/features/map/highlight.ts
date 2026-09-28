import { create } from 'zustand'
import { CONCEPT_BY_ID } from '@/content'
import { ancestors, type GraphEdge } from '@/content/graph'

/* Which nodes/edges are lit. Nodes and edges subscribe with boolean
   selectors, so a hover only re-renders the elements whose state changes. */

interface HighlightState {
  /** Concept whose neighbourhood is lit (hovered, focused or selected). */
  active: string | null
  /** Concept open in the inspector (mirrors the URL). */
  selected: string | null
  nodes: ReadonlySet<string> | null
  edges: ReadonlySet<string> | null
}

export const useHighlight = create<HighlightState>(() => ({
  active: null,
  selected: null,
  nodes: null,
  edges: null,
}))

const isPrereqLink = (a: string, b: string) =>
  !!CONCEPT_BY_ID.get(a)?.prerequisites.includes(b) || !!CONCEPT_BY_ID.get(b)?.prerequisites.includes(a)

export function computeHighlight(
  active: string | null,
  prereqMode: boolean,
  visibleEdges: readonly GraphEdge[],
): Omit<HighlightState, 'selected'> {
  if (!active) return { active: null, nodes: null, edges: null }

  if (prereqMode) {
    const nodes = ancestors(active)
    nodes.add(active)
    const edges = visibleEdges
      .filter((e) => nodes.has(e.source) && nodes.has(e.target) && isPrereqLink(e.source, e.target))
      .map((e) => e.id)
    return { active, nodes, edges: new Set(edges) }
  }

  const nodes = new Set([active])
  const edges = new Set<string>()
  for (const e of visibleEdges) {
    if (e.source === active || e.target === active) {
      edges.add(e.id)
      nodes.add(e.source)
      nodes.add(e.target)
    }
  }
  return { active, nodes, edges }
}

/** 'lit' | 'dim' | 'idle' for a node. */
export function useNodeHighlight(id: string) {
  return useHighlight((s) => (!s.nodes ? 'idle' : s.nodes.has(id) ? 'lit' : 'dim'))
}

export function useEdgeHighlight(id: string) {
  return useHighlight((s) => (!s.edges ? 'idle' : s.edges.has(id) ? 'lit' : 'dim'))
}
