import { Label, Svg } from './kit'

/** Qualitative U-shaped curve from "Lost in the Middle" (Liu et al., 2023). */
export function LostInMiddleDiagram() {
  const pts = Array.from({ length: 41 }, (_, i) => {
    const t = i / 40
    const acc = 0.55 + 0.35 * (2 * t - 1) ** 2 + (t < 0.1 ? 0.05 * (1 - t / 0.1) : 0)
    return `${60 + t * 460},${200 - acc * 170}`
  }).join(' ')
  return (
    <Svg viewBox="0 0 560 240" aria-label="Precisión según la posición del dato en el contexto">
      <line x1={60} y1={200} x2={530} y2={200} style={{ stroke: 'var(--border-strong)' }} />
      <line x1={60} y1={200} x2={60} y2={20} style={{ stroke: 'var(--border-strong)' }} />
      <polyline points={pts} fill="none" strokeWidth={2.5} style={{ stroke: 'var(--l0)' }} />
      <Label x={60} y={218} anchor="start" size={11}>
        principio
      </Label>
      <Label x={295} y={218} size={11}>
        posición del dato relevante en el contexto
      </Label>
      <Label x={530} y={218} anchor="end" size={11}>
        final
      </Label>
      <Label x={68} y={32} anchor="start" size={10.5} color="var(--fg-subtle)">
        precisión (forma cualitativa)
      </Label>
      <Label x={295} y={170} size={11} color="var(--fg-muted)">
        el centro se «pierde»
      </Label>
    </Svg>
  )
}
