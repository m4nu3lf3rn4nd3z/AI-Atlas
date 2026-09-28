import { useState } from 'react'
import { Arrow, ArrowDefs, Label, Svg } from './kit'

/* A router scores 8 experts per token and only the top-2 run.
   Scores are illustrative; the top-k + renormalisation is exact. */

const TOKENS: Record<string, number[]> = {
  ' def': [0.02, 0.61, 0.04, 0.03, 0.22, 0.03, 0.02, 0.03],
  ' París': [0.05, 0.02, 0.48, 0.03, 0.04, 0.31, 0.04, 0.03],
  ' 3.14': [0.03, 0.08, 0.02, 0.57, 0.03, 0.04, 0.2, 0.03],
}

export function MoeDiagram() {
  const [token, setToken] = useState(' def')
  const scores = TOKENS[token]!
  const top = scores
    .map((s, i) => ({ s, i }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
  const topSum = top.reduce((a, b) => a + b.s, 0)
  const chosen = new Map(top.map((t) => [t.i, t.s / topSum]))

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-[12px] text-muted">
        Token de entrada:
        {Object.keys(TOKENS).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setToken(t)}
            className={`cursor-pointer rounded-md border px-2 py-0.5 font-mono text-[12px] ${t === token ? 'border-accent bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg'}`}
          >
            {JSON.stringify(t)}
          </button>
        ))}
      </div>
      <Svg viewBox="0 0 740 250" aria-label="Router de Mixture of Experts">
        <ArrowDefs />
        <rect x={20} y={100} width={90} height={40} rx={8} style={{ fill: 'color-mix(in oklab, var(--l0) 15%, var(--surface))', stroke: 'var(--l0)' }} />
        <Label x={65} y={125} size={12} mono color="var(--fg)">
          {token.trim()}
        </Label>
        <Arrow x1={112} y1={120} x2={168} y2={120} />
        <rect x={170} y={92} width={96} height={56} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--border-strong)' }} />
        <Label x={218} y={116} size={12.5} weight={600} color="var(--fg)">
          Router
        </Label>
        <Label x={218} y={133} size={10} mono color="var(--fg-subtle)">
          softmax(W·x)
        </Label>
        {scores.map((s, i) => {
          const y = 14 + i * 28
          const on = chosen.has(i)
          return (
            <g key={i} opacity={on ? 1 : 0.4}>
              <path
                d={`M268,120 C320,120 320,${y + 11} 372,${y + 11}`}
                fill="none"
                strokeWidth={on ? 2 : 1}
                style={{ stroke: on ? 'var(--l6)' : 'var(--border-strong)' }}
              />
              <rect x={374} y={y} width={120} height={22} rx={6} style={{ fill: on ? 'color-mix(in oklab, var(--l6) 18%, var(--surface))' : 'var(--surface-2)', stroke: on ? 'var(--l6)' : 'var(--border)' }} />
              <Label x={384} y={y + 15} anchor="start" size={11} color="var(--fg)">
                Experto {i + 1}
              </Label>
              <Label x={486} y={y + 15} anchor="end" size={10.5} mono color="var(--fg-subtle)">
                {s.toFixed(2)}
              </Label>
              {on && (
                <>
                  <path d={`M496,${y + 11} C560,${y + 11} 560,120 612,120`} fill="none" strokeWidth={2} style={{ stroke: 'var(--l6)' }} />
                  <Label x={520} y={y + 7} anchor="start" size={10} mono color="var(--l6)">
                    ×{chosen.get(i)!.toFixed(2)}
                  </Label>
                </>
              )}
            </g>
          )
        })}
        <rect x={614} y={98} width={110} height={44} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--border-strong)' }} />
        <Label x={669} y={118} size={12} weight={600} color="var(--fg)">
          Suma ponderada
        </Label>
        <Label x={669} y={133} size={10} mono color="var(--fg-subtle)">
          2 de 8 expertos
        </Label>
      </Svg>
      <p className="mt-2 text-[12px] text-subtle">
        Puntuaciones del router ilustrativas. Solo los 2 expertos con mayor puntuación se ejecutan y sus
        salidas se combinan con los pesos renormalizados.
      </p>
    </div>
  )
}
