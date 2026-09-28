import { Arrow, ArrowDefs, Box, Label, Svg } from './kit'

/** End-to-end view of one generation step, with the autoregressive loop. */
export function PipelineDiagram() {
  const y = 40
  const h = 58
  const steps = [
    { label: 'Texto', sub: '"El cielo es"', color: 'var(--l0)' },
    { label: 'Tokens → IDs', sub: '[4422, 84743, 878]' },
    { label: 'Embeddings', sub: '3 × d_model' },
    { label: 'N bloques', sub: 'atención + FFN', color: 'var(--l0)', strong: true },
    { label: 'Logits', sub: '1 por token del vocab' },
    { label: 'Softmax', sub: 'probabilidades' },
    { label: 'Sampling', sub: '→ " azul"', color: 'var(--l4)' },
  ]
  const w = 92
  const gap = 12
  return (
    <Svg viewBox="0 0 760 170" aria-label="Pipeline de inferencia de un LLM">
      <ArrowDefs />
      {steps.map((s, i) => {
        const x = 10 + i * (w + gap)
        return (
          <g key={s.label}>
            <Box x={x} y={y} w={w} h={h} label={s.label} sub={s.sub} color={s.color} strong={s.strong} />
            {i < steps.length - 1 && <Arrow x1={x + w + 1} y1={y + h / 2} x2={x + w + gap - 1} y2={y + h / 2} />}
          </g>
        )
      })}
      <Arrow x1={10 + 6 * (w + gap) + w / 2} y1={y + h + 2} x2={10 + w / 2 + 20} y2={y + h + 2} curve={70} dashed color="var(--l4)" />
      <Label x={380} y={158} color="var(--l4)" size={11.5}>
        el token elegido se añade a la entrada y se repite: generación autorregresiva
      </Label>
      <Label x={10} y={22} anchor="start" size={10.5} mono color="var(--fg-subtle)">
        UN PASO DE GENERACIÓN
      </Label>
    </Svg>
  )
}
