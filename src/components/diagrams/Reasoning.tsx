import { Label, Svg } from './kit'

/** Token budget of a reasoning model and the qualitative accuracy curve. */
export function ReasoningDiagram() {
  const segs = [
    { w: 120, label: 'Prompt', color: 'var(--l1)' },
    { w: 420, label: 'Tokens de razonamiento (a menudo ocultos o resumidos)', color: 'var(--l4)' },
    { w: 150, label: 'Respuesta', color: 'var(--l3)' },
  ]
  let x = 20
  // Qualitative log-shaped curve: accuracy vs thinking budget.
  const pts = Array.from({ length: 40 }, (_, i) => {
    const t = i / 39
    return `${400 + t * 320},${226 - Math.log1p(t * 30) / Math.log1p(30) * 90}`
  }).join(' ')

  return (
    <Svg viewBox="0 0 740 250" aria-label="Presupuesto de tokens de un modelo de razonamiento">
      <Label x={20} y={22} anchor="start" mono size={10.5} color="var(--fg-subtle)">
        LO QUE PAGAS Y ESPERAS: TOKENS DE SALIDA
      </Label>
      {segs.map((s) => {
        const g = (
          <g key={s.label}>
            <rect x={x} y={34} width={s.w - 4} height={36} rx={8} style={{ fill: `color-mix(in oklab, ${s.color} 16%, var(--surface))`, stroke: `color-mix(in oklab, ${s.color} 55%, transparent)` }} />
            <Label x={x + (s.w - 4) / 2} y={57} size={11.5} color="var(--fg)">
              {s.label}
            </Label>
          </g>
        )
        x += s.w
        return g
      })}
      <foreignObject x={20} y={96} width={350} height={140}>
        <div style={{ fontSize: 11.5, lineHeight: 1.5, color: 'var(--fg-muted)' }}>
          El modelo genera primero una cadena de razonamiento y después la respuesta. Esos tokens
          <b style={{ color: 'var(--fg)' }}> se facturan como salida</b> y añaden latencia, aunque no los
          veas completos. A cambio, el modelo puede plantear, comprobar y corregir antes de responder.
        </div>
      </foreignObject>
      <line x1={400} y1={230} x2={728} y2={230} strokeWidth={1} style={{ stroke: 'var(--border-strong)' }} />
      <line x1={400} y1={230} x2={400} y2={112} strokeWidth={1} style={{ stroke: 'var(--border-strong)' }} />
      <polyline points={pts} fill="none" strokeWidth={2} style={{ stroke: 'var(--l4)' }} />
      <Label x={728} y={246} anchor="end" size={10} color="var(--fg-subtle)">
        presupuesto de razonamiento (escala log) →
      </Label>
      <Label x={406} y={108} anchor="start" size={10} color="var(--fg-subtle)">
        precisión en tareas difíciles (cualitativo)
      </Label>
    </Svg>
  )
}
