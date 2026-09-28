import { useState } from 'react'
import { Label, Svg } from './kit'

/* A 2-D cartoon of an embedding space (real ones have hundreds or thousands
   of dimensions). Clusters and positions are illustrative; the cosine
   similarity shown is computed exactly from the 2-D coordinates. */

const POINTS = [
  { t: 'perro', x: 120, y: 80, g: 'var(--l4)' },
  { t: 'gato', x: 150, y: 58, g: 'var(--l4)' },
  { t: 'cachorro', x: 98, y: 108, g: 'var(--l4)' },
  { t: 'manzana', x: 330, y: 190, g: 'var(--l3)' },
  { t: 'pera', x: 360, y: 214, g: 'var(--l3)' },
  { t: 'plátano', x: 300, y: 222, g: 'var(--l3)' },
  { t: 'Python', x: 420, y: 60, g: 'var(--l1)' },
  { t: 'JavaScript', x: 470, y: 84, g: 'var(--l1)' },
  { t: 'compilador', x: 440, y: 112, g: 'var(--l1)' },
]
const O = { x: 40, y: 250 }

function cos(a: (typeof POINTS)[number], b: (typeof POINTS)[number]) {
  const ax = a.x - O.x
  const ay = O.y - a.y
  const bx = b.x - O.x
  const by = O.y - b.y
  return (ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))
}

export function EmbeddingSpaceDiagram() {
  const [a, setA] = useState(0)
  const [b, setB] = useState(1)
  const pa = POINTS[a]!
  const pb = POINTS[b]!

  return (
    <div>
      <Svg viewBox="0 0 560 270" aria-label="Espacio de embeddings en 2D">
        <line x1={O.x} y1={O.y} x2={540} y2={O.y} style={{ stroke: 'var(--border-strong)' }} />
        <line x1={O.x} y1={O.y} x2={O.x} y2={20} style={{ stroke: 'var(--border-strong)' }} />
        {[pa, pb].map((p, i) => (
          <line key={i} x1={O.x} y1={O.y} x2={p.x} y2={p.y} strokeWidth={2} strokeDasharray={i ? '5 4' : undefined} style={{ stroke: 'var(--accent)' }} />
        ))}
        {POINTS.map((p, i) => (
          <g
            key={p.t}
            className="cursor-pointer"
            onClick={(e) => (e.shiftKey ? setB(i) : (setB(a), setA(i)))}
          >
            <circle cx={p.x} cy={p.y} r={i === a || i === b ? 6 : 4.5} style={{ fill: p.g }} />
            <Label x={p.x + 9} y={p.y + 4} anchor="start" size={11.5} color={i === a || i === b ? 'var(--fg)' : 'var(--fg-muted)'}>
              {p.t}
            </Label>
          </g>
        ))}
      </Svg>
      <p className="mt-1 text-[13px] text-muted">
        cos(«{pa.t}», «{pb.t}») ={' '}
        <b className="font-mono text-fg">{cos(pa, pb).toFixed(3)}</b>
        <span className="ml-2 text-[12px] text-subtle">
          Haz clic en dos puntos para compararlos. Posiciones ilustrativas en 2D; el coseno se calcula de verdad.
        </span>
      </p>
    </div>
  )
}
