/* Geometry for the connection lines drawn between concept cards.
   Rects are in the coordinate space of the map content (not the viewport). */

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Point {
  x: number
  y: number
}

export interface Connection {
  /** SVG path (cubic Bézier) from a to b. */
  d: string
  /** Point on the curve at t = 0.5, where the relation label goes. */
  mid: Point
}

const cx = (r: Rect) => r.x + r.w / 2
const cy = (r: Rect) => r.y + r.h / 2

/** Point of a cubic Bézier at t = 0.5. */
function bezierMid(p0: Point, c1: Point, c2: Point, p3: Point): Point {
  return {
    x: (p0.x + 3 * c1.x + 3 * c2.x + p3.x) / 8,
    y: (p0.y + 3 * c1.y + 3 * c2.y + p3.y) / 8,
  }
}

const f = (n: number) => Math.round(n * 10) / 10

function path(p0: Point, c1: Point, c2: Point, p3: Point): Connection {
  return {
    d: `M${f(p0.x)},${f(p0.y)} C${f(c1.x)},${f(c1.y)} ${f(c2.x)},${f(c2.y)} ${f(p3.x)},${f(p3.y)}`,
    mid: bezierMid(p0, c1, c2, p3),
  }
}

/**
 * Curve from card `a` to card `b`.
 * - Different rows: leave from the bottom/top edge and enter the facing edge.
 * - Same row: arc over the cards between them, from top edge to top edge,
 *   so the line never runs underneath its neighbours.
 */
export function connect(a: Rect, b: Rect): Connection {
  const sameRow = Math.abs(cy(a) - cy(b)) < Math.min(a.h, b.h) / 2

  if (!sameRow) {
    const down = cy(b) > cy(a)
    const p0 = { x: cx(a), y: down ? a.y + a.h : a.y }
    const p3 = { x: cx(b), y: down ? b.y : b.y + b.h }
    const bend = Math.max(24, Math.abs(p3.y - p0.y) * 0.45) * (down ? 1 : -1)
    return path(p0, { x: p0.x, y: p0.y + bend }, { x: p3.x, y: p3.y - bend }, p3)
  }

  const gap = Math.abs(cx(b) - cx(a)) - (a.w + b.w) / 2
  if (gap < 40) {
    // Neighbours: a short horizontal link between facing sides.
    const right = cx(b) > cx(a)
    const p0 = { x: right ? a.x + a.w : a.x, y: cy(a) }
    const p3 = { x: right ? b.x : b.x + b.w, y: cy(b) }
    const mx = (p0.x + p3.x) / 2
    return path(p0, { x: mx, y: p0.y }, { x: mx, y: p3.y }, p3)
  }

  const p0 = { x: cx(a), y: a.y }
  const p3 = { x: cx(b), y: b.y }
  const lift = Math.min(70, 18 + gap * 0.12)
  return path(p0, { x: p0.x, y: p0.y - lift }, { x: p3.x, y: p3.y - lift }, p3)
}
