import { CONCEPTS } from '@/content'
import { EDGES } from '@/content/graph'
import { LAYERS } from '@/content/layers'
import type { LayerId } from '@/content/schema'

/* Deterministic layered layout: one horizontal band per layer, with the
   foundations at the bottom like a tech-stack diagram. Inside a band,
   nodes are ordered by the barycenter of their links to lower layers
   (one bottom-up sweep), which removes most edge crossings. */

export const NODE_W = 192
export const NODE_H = 58
const GAP_X = 18
const GAP_Y = 14
const MAX_PER_ROW = 7
const BAND_PAD_Y = 26
const BAND_GAP = 12
export const LABEL_W = 210
const CONTENT_W = MAX_PER_ROW * NODE_W + (MAX_PER_ROW - 1) * GAP_X
export const BAND_W = LABEL_W + CONTENT_W + 36

export interface Placed {
  id: string
  x: number
  y: number
}

export interface Band {
  layer: LayerId
  y: number
  height: number
}

export interface Layout {
  nodes: Placed[]
  bands: Band[]
}

function rowsFor(n: number) {
  const rows = Math.max(1, Math.ceil(n / MAX_PER_ROW))
  return { rows, perRow: Math.ceil(n / rows) }
}

export function computeLayout(): Layout {
  const neighbors = new Map<string, string[]>()
  for (const e of EDGES) {
    neighbors.set(e.source, [...(neighbors.get(e.source) ?? []), e.target])
    neighbors.set(e.target, [...(neighbors.get(e.target) ?? []), e.source])
  }
  const layerIndex = new Map(CONCEPTS.map((c) => [c.id, LAYERS.find((l) => l.id === c.layer)!.index]))

  // 1) Horizontal order, bottom-up.
  const xOf = new Map<string, number>()
  const ordered = new Map<LayerId, string[]>()
  for (const layer of LAYERS) {
    const ids = CONCEPTS.filter((c) => c.layer === layer.id).map((c) => c.id)
    const scored = ids.map((id, i) => {
      const below = (neighbors.get(id) ?? []).filter((n) => (layerIndex.get(n) ?? 99) < layer.index)
      const xs = below.map((n) => xOf.get(n)).filter((x): x is number => x !== undefined)
      const fallback = (i / Math.max(1, ids.length - 1)) * CONTENT_W
      return { id, score: xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback, i }
    })
    scored.sort((a, b) => a.score - b.score || a.i - b.i)
    const sortedIds = scored.map((s) => s.id)
    ordered.set(layer.id, sortedIds)
    placeRows(sortedIds, 0).forEach((p) => xOf.set(p.id, p.x))
  }

  // 2) Vertical placement, top-down (highest layer first).
  const nodes: Placed[] = []
  const bands: Band[] = []
  let y = 0
  for (const layer of [...LAYERS].reverse()) {
    const ids = ordered.get(layer.id)!
    const { rows } = rowsFor(ids.length)
    const height = rows * NODE_H + (rows - 1) * GAP_Y + 2 * BAND_PAD_Y
    bands.push({ layer: layer.id, y, height })
    nodes.push(...placeRows(ids, y + BAND_PAD_Y))
    y += height + BAND_GAP
  }
  return { nodes, bands }
}

function placeRows(ids: string[], top: number): Placed[] {
  const { perRow } = rowsFor(ids.length)
  const out: Placed[] = []
  for (let r = 0; r * perRow < ids.length; r++) {
    const row = ids.slice(r * perRow, (r + 1) * perRow)
    const rowW = row.length * NODE_W + (row.length - 1) * GAP_X
    const x0 = LABEL_W + (CONTENT_W - rowW) / 2
    row.forEach((id, i) =>
      out.push({ id, x: x0 + i * (NODE_W + GAP_X), y: top + r * (NODE_H + GAP_Y) }),
    )
  }
  return out
}
