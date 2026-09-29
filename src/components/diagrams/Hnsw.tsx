import { Label, Svg } from './kit'

/* HNSW: a stack of proximity graphs. Search starts at the sparse top layer,
   walks greedily towards the query and drops down a layer each time it
   cannot get closer. */

type P = [number, number]
const L2: P[] = [
  [120, 0],
  [420, 0],
  [640, 0],
]
const L1: P[] = [
  [120, 0],
  [250, 0],
  [420, 0],
  [530, 0],
  [640, 0],
  [720, 0],
]
const L0: P[] = [
  [80, 0],
  [120, 0],
  [180, 0],
  [250, 0],
  [310, 0],
  [360, 0],
  [420, 0],
  [470, 0],
  [530, 0],
  [575, 0],
  [610, 0],
  [640, 0],
  [680, 0],
  [720, 0],
]
const Q = 590
const layers = [
  { y: 60, nodes: L2, label: 'Capa 2', path: [120, 420, 640] },
  { y: 140, nodes: L1, label: 'Capa 1', path: [640] },
  { y: 220, nodes: L0, label: 'Capa 0 · todos los vectores', path: [640, 610, 575] },
]

export function HnswDiagram() {
  return (
    <Svg viewBox="0 0 800 290" aria-label="Búsqueda en un índice HNSW">
      {layers.map((layer, li) => (
        <g key={layer.label}>
          <rect x={60} y={layer.y - 24} width={700} height={48} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--border)' }} />
          <Label x={70} y={layer.y - 30} anchor="start" mono size={10.5} color="var(--fg-subtle)">
            {layer.label}
          </Label>
          {layer.nodes.slice(1).map(([x], i) => (
            <line key={i} x1={layer.nodes[i]![0]} x2={x} y1={layer.y} y2={layer.y} style={{ stroke: 'var(--border-strong)' }} />
          ))}
          {layer.path.slice(1).map((x, i) => (
            <line key={i} x1={layer.path[i]} x2={x} y1={layer.y} y2={layer.y} strokeWidth={3} style={{ stroke: 'var(--l4)' }} />
          ))}
          {layer.nodes.map(([x]) => (
            <circle key={x} cx={x} cy={layer.y} r={layer.path.includes(x) ? 6.5 : 5} style={{ fill: layer.path.includes(x) ? 'var(--l4)' : 'var(--fg-subtle)' }} />
          ))}
          {li < layers.length - 1 && (
            <line
              x1={layer.path.at(-1)}
              x2={layer.path.at(-1)}
              y1={layer.y + 7}
              y2={layers[li + 1]!.y - 7}
              strokeDasharray="4 3"
              strokeWidth={1.5}
              style={{ stroke: 'var(--l4)' }}
            />
          )}
        </g>
      ))}
      <line x1={Q} x2={Q} y1={200} y2={244} strokeWidth={1.5} style={{ stroke: 'var(--l0)' }} />
      <polygon points={`${Q},196 ${Q - 7},186 ${Q + 7},186`} style={{ fill: 'var(--l0)' }} />
      <Label x={Q} y={180} size={11} weight={600} color="var(--l0)">
        consulta
      </Label>
      <Label x={400} y={276} size={11.5}>
        Arriba, pocos nodos y saltos largos; abajo, todos los vectores y saltos cortos. Se visita una fracción mínima del total.
      </Label>
    </Svg>
  )
}
