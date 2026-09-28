import { Arrow, ArrowDefs, Label, Svg } from './kit'

const STAGES = [
  {
    title: 'Pre-training',
    data: 'Billones de tokens: web, libros, código',
    goal: 'Predecir el siguiente token',
    result: 'Modelo base: sabe mucho, completa texto',
    compute: 1,
    color: 'var(--l0)',
  },
  {
    title: 'SFT',
    data: 'Miles–millones de ejemplos instrucción → respuesta',
    goal: 'Imitar respuestas ideales',
    result: 'Sigue instrucciones y formato de chat',
    compute: 0.06,
    color: 'var(--l1)',
  },
  {
    title: 'Preferencias',
    data: 'Pares (mejor, peor) juzgados por personas o IA',
    goal: 'RLHF o DPO',
    result: 'Más útil, honesto y seguro',
    compute: 0.04,
    color: 'var(--l3)',
  },
  {
    title: 'RL verificable',
    data: 'Problemas con respuesta comprobable (mates, código)',
    goal: 'Recompensa si acierta',
    result: 'Razona paso a paso antes de responder',
    compute: 0.1,
    color: 'var(--l4)',
  },
]

export function TrainingDiagram() {
  const w = 168
  const gap = 18
  return (
    <Svg viewBox="0 0 760 250" aria-label="Fases de entrenamiento de un LLM">
      <ArrowDefs />
      {STAGES.map((s, i) => {
        const x = 12 + i * (w + gap)
        return (
          <g key={s.title}>
            <rect
              x={x}
              y={16}
              width={w}
              height={168}
              rx={12}
              style={{ fill: `color-mix(in oklab, ${s.color} 7%, var(--surface))`, stroke: `color-mix(in oklab, ${s.color} 45%, transparent)` }}
            />
            <Label x={x + 12} y={40} anchor="start" size={13} weight={600} color="var(--fg)">
              {s.title}
            </Label>
            <foreignObject x={x + 10} y={50} width={w - 20} height={130}>
              <div style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--fg-muted)' }}>
                <div style={{ color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.06em' }}>DATOS</div>
                <div>{s.data}</div>
                <div style={{ marginTop: 6, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)', fontSize: 9.5, letterSpacing: '0.06em' }}>OBJETIVO</div>
                <div>{s.goal}</div>
                <div style={{ marginTop: 6, color: s.color, fontWeight: 600 }}>{s.result}</div>
              </div>
            </foreignObject>
            {i < STAGES.length - 1 && <Arrow x1={x + w + 2} y1={100} x2={x + w + gap - 2} y2={100} />}
            <rect x={x} y={202} width={w * Math.max(s.compute, 0.03)} height={10} rx={5} style={{ fill: s.color }} />
          </g>
        )
      })}
      <Label x={12} y={232} anchor="start" size={10.5} color="var(--fg-subtle)">
        Cómputo relativo de cada fase (orden de magnitud aproximado)
      </Label>
    </Svg>
  )
}
