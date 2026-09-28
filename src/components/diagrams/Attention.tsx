import { useState } from 'react'
import { cn } from '@/lib/cn'

/* Causal self-attention as a heatmap. Weights are illustrative (a real
   model has dozens of heads per layer, each with its own pattern), but
   the structure — lower-triangular, rows summing to 1 — is exact. */

const TOKENS = ['El', 'gato', 'se', 'sentó', 'porque', 'estaba', 'cansado']
const W = [
  [1],
  [0.35, 0.65],
  [0.1, 0.5, 0.4],
  [0.05, 0.45, 0.25, 0.25],
  [0.05, 0.15, 0.05, 0.45, 0.3],
  [0.03, 0.4, 0.05, 0.22, 0.2, 0.1],
  [0.02, 0.55, 0.03, 0.1, 0.08, 0.17, 0.05],
]

export function AttentionDiagram() {
  const [row, setRow] = useState(6)
  const cell = 46

  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-start">
      <div className="shrink-0">
        <div className="mb-2 font-mono text-[10.5px] tracking-widest text-subtle">
          QUERY (fila) → KEYS (columnas)
        </div>
        <div className="inline-grid" style={{ gridTemplateColumns: `72px repeat(${TOKENS.length}, ${cell}px)` }}>
          <span />
          {TOKENS.map((t) => (
            <span key={t} className="truncate pb-1 text-center font-mono text-[10.5px] text-subtle">
              {t}
            </span>
          ))}
          {TOKENS.map((q, i) => (
            <div key={q} className="contents">
              <button
                type="button"
                onMouseEnter={() => setRow(i)}
                onFocus={() => setRow(i)}
                className={cn(
                  'cursor-pointer pr-2 text-right font-mono text-[11px]',
                  row === i ? 'text-fg' : 'text-subtle',
                )}
              >
                {q}
              </button>
              {TOKENS.map((_, j) => {
                const w = W[i]?.[j]
                return (
                  <div
                    key={j}
                    onMouseEnter={() => setRow(i)}
                    className={cn(
                      'm-[1.5px] flex items-center justify-center rounded-[5px] font-mono text-[10px] transition-all',
                      row === i ? 'ring-1 ring-accent/60' : '',
                    )}
                    style={{
                      height: cell - 3,
                      background:
                        w === undefined
                          ? 'repeating-linear-gradient(45deg, var(--surface-2), var(--surface-2) 3px, transparent 3px, transparent 6px)'
                          : `color-mix(in oklab, var(--l0) ${Math.round(8 + w * 92)}%, var(--surface))`,
                      color: w !== undefined && w > 0.4 ? 'var(--accent-fg)' : 'var(--fg-muted)',
                    }}
                  >
                    {w !== undefined ? w.toFixed(2) : ''}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-muted">
        <p>
          Fila <b className="text-fg">«{TOKENS[row]}»</b>: cómo reparte su atención entre los tokens
          anteriores. Cada fila suma 1 (es un softmax) y las celdas rayadas son el futuro, que la{' '}
          <b className="text-fg">máscara causal</b> oculta.
        </p>
        <div className="mt-3 space-y-1.5">
          {TOKENS.slice(0, row + 1).map((t, j) => (
            <div key={t} className="flex items-center gap-2">
              <span className="w-16 text-right font-mono text-[11px] text-subtle">{t}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${(W[row]![j] ?? 0) * 100}%`, background: 'var(--l0)' }}
                />
              </div>
              <span className="w-9 font-mono text-[11px] text-subtle">{(W[row]![j] ?? 0).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[12px] text-subtle">
          Pesos ilustrativos de una sola cabeza, con palabras en lugar de tokens reales. Pasa el ratón
          por las filas: «cansado» atiende sobre todo a «gato», que es quien está cansado.
        </p>
      </div>
    </div>
  )
}
