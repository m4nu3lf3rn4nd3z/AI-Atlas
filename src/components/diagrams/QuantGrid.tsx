import { Label, Svg } from './kit'

/* The same weights snapped to 4-bit and 2-bit grids (symmetric absmax). */
const W = [-0.83, -0.52, -0.37, -0.2, -0.08, 0.03, 0.11, 0.24, 0.31, 0.47, 0.66, 1]
const X0 = 150
const X1 = 780
const x = (v: number) => X0 + ((v + 1.05) / 2.1) * (X1 - X0)

function Row({ y, bits, title, sub }: { y: number; bits?: number; title: string; sub: string }) {
  const qmax = bits ? 2 ** (bits - 1) - 1 : 0
  const scale = bits ? 1 / qmax : 0
  const levels = bits ? Array.from({ length: 2 * qmax + 1 }, (_, i) => (i - qmax) * scale) : []
  const snap = (v: number) => (bits ? Math.round(v / scale) * scale : v)
  return (
    <g>
      <Label x={20} y={y - 4} anchor="start" size={12.5} weight={600} color="var(--fg)">
        {title}
      </Label>
      <Label x={20} y={y + 13} anchor="start" size={10.5} mono color="var(--fg-subtle)">
        {sub}
      </Label>
      <line x1={X0} x2={X1} y1={y} y2={y} style={{ stroke: 'var(--border-strong)' }} />
      {levels.map((l) => (
        <line key={l} x1={x(l)} x2={x(l)} y1={y - 9} y2={y + 9} strokeWidth={1.5} style={{ stroke: 'var(--l2)' }} />
      ))}
      {W.map((w) => {
        const s = snap(w)
        return (
          <g key={w}>
            {bits && Math.abs(s - w) > 0.005 && (
              <path d={`M${x(w)},${y - 16} Q${(x(w) + x(s)) / 2},${y - 26} ${x(s)},${y - 16}`} fill="none" strokeWidth={1.2} style={{ stroke: 'var(--l0)' }} />
            )}
            <circle cx={x(w)} cy={y - 16} r={3.5} style={{ fill: 'var(--fg-muted)' }} />
            {bits && <circle cx={x(s)} cy={y} r={4.5} style={{ fill: 'var(--l0)', stroke: 'var(--surface)' }} strokeWidth={1.5} />}
          </g>
        )
      })}
    </g>
  )
}

export function QuantGridDiagram() {
  return (
    <Svg viewBox="0 0 800 300" aria-label="Pesos redondeados a rejillas de 4 y 2 bits">
      <Row y={60} title="BF16" sub="65.536 valores" />
      <Row y={140} bits={4} title="4 bits" sub="15 niveles útiles" />
      <Row y={220} bits={2} title="2 bits" sub="3 niveles útiles" />
      <Label x={x(-1)} y={262} size={10.5} mono color="var(--fg-subtle)">
        −máx
      </Label>
      <Label x={x(0)} y={262} size={10.5} mono color="var(--fg-subtle)">
        0
      </Label>
      <Label x={x(1)} y={262} size={10.5} mono color="var(--fg-subtle)">
        +máx
      </Label>
      <Label x={400} y={288} size={11.5}>
        escala s = máx|w| ÷ (2^(bits−1) − 1) · se guarda q = round(w ÷ s) · al usarlo, w ≈ q × s
      </Label>
    </Svg>
  )
}
