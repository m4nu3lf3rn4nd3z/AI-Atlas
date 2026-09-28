import { CONCEPT_BY_ID, CONCEPTS } from './index'
import type { RelationType } from './schema'

/* Graph derived from concept metadata. Every edge points at what the source
   depends on or acts upon, like a dependency diagram: prerequisites become
   'requires' edges (concept → prereq); typed relations keep their direction. */

export type EdgeType = RelationType | 'requires'

export interface GraphEdge {
  id: string
  source: string
  target: string
  type: EdgeType
  note?: string
}

function buildEdges(): GraphEdge[] {
  const edges: GraphEdge[] = []
  const pairs = new Set<string>()
  const pairKey = (a: string, b: string) => [a, b].sort().join('|')

  for (const c of CONCEPTS) {
    for (const r of c.relations) {
      edges.push({ id: `${c.id}>${r.to}:${r.type}`, source: c.id, target: r.to, type: r.type, note: r.note })
      pairs.add(pairKey(c.id, r.to))
    }
  }
  // A prerequisite already expressed as a typed relation doesn't need a second line.
  for (const c of CONCEPTS) {
    for (const p of c.prerequisites) {
      if (pairs.has(pairKey(c.id, p))) continue
      edges.push({ id: `${c.id}>${p}:requires`, source: c.id, target: p, type: 'requires' })
    }
  }
  return edges
}

export const EDGES: readonly GraphEdge[] = buildEdges()

const adjacency = new Map<string, Set<string>>()
for (const e of EDGES) {
  if (!adjacency.has(e.source)) adjacency.set(e.source, new Set())
  if (!adjacency.has(e.target)) adjacency.set(e.target, new Set())
  adjacency.get(e.source)!.add(e.target)
  adjacency.get(e.target)!.add(e.source)
}

export function neighbors(id: string): Set<string> {
  return adjacency.get(id) ?? new Set()
}

export function edgesOf(id: string): GraphEdge[] {
  return EDGES.filter((e) => e.source === id || e.target === id)
}

/** Transitive closure of prerequisites (everything to know before `id`). */
export function ancestors(id: string): Set<string> {
  const out = new Set<string>()
  const stack = [...(CONCEPT_BY_ID.get(id)?.prerequisites ?? [])]
  while (stack.length) {
    const next = stack.pop()!
    if (out.has(next)) continue
    out.add(next)
    stack.push(...(CONCEPT_BY_ID.get(next)?.prerequisites ?? []))
  }
  return out
}

/** Concepts that list `id` as a direct prerequisite. */
export function dependents(id: string): string[] {
  return CONCEPTS.filter((c) => c.prerequisites.includes(id)).map((c) => c.id)
}

/**
 * Topological order over prerequisites, stable w.r.t. declaration order.
 * Throws on cycles so the integrity test can catch them.
 */
export function topologicalOrder(): string[] {
  const state = new Map<string, 'visiting' | 'done'>()
  const order: string[] = []
  const visit = (id: string, trail: string[]) => {
    const s = state.get(id)
    if (s === 'done') return
    if (s === 'visiting') throw new Error(`Ciclo de prerrequisitos: ${[...trail, id].join(' → ')}`)
    state.set(id, 'visiting')
    for (const p of CONCEPT_BY_ID.get(id)?.prerequisites ?? []) visit(p, [...trail, id])
    state.set(id, 'done')
    order.push(id)
  }
  for (const c of CONCEPTS) visit(c.id, [])
  return order
}
