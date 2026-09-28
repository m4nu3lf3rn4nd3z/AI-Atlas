import { Arrow, ArrowDefs, Label, Svg } from './kit'

/** Prefill fills the cache in parallel; decode appends one K/V pair per step. */
export function KvCacheDiagram() {
  const prompt = ['Resume', 'este', 'texto', ':']
  const gen = ['El', 'autor', 'dice']
  const cw = 52
  const step = cw + 4
  const ch = 26
  const decodeX = 410

  const tokenRow = (tokens: string[], x0: number, y: number, color: string) =>
    tokens.map((t, i) => (
      <g key={`${t}-${i}`}>
        <rect
          x={x0 + i * step}
          y={y}
          width={cw}
          height={ch}
          rx={6}
          style={{
            fill: `color-mix(in oklab, ${color} 14%, var(--surface))`,
            stroke: `color-mix(in oklab, ${color} 50%, transparent)`,
          }}
        />
        <text x={x0 + i * step + cw / 2} y={y + 17} textAnchor="middle" fontSize={11} style={{ fill: 'var(--fg)' }}>
          {t}
        </text>
      </g>
    ))

  const cacheRow = (n: number, x0: number, y: number, highlightLast: boolean) =>
    Array.from({ length: n }, (_, i) => (
      <g key={i}>
        <rect
          x={x0 + i * step}
          y={y}
          width={cw}
          height={20}
          rx={5}
          style={{
            fill:
              highlightLast && i === n - 1
                ? 'color-mix(in oklab, var(--l2) 35%, var(--surface))'
                : 'var(--surface-3)',
            stroke: 'var(--border-strong)',
          }}
        />
        <text
          x={x0 + i * step + cw / 2}
          y={y + 14}
          textAnchor="middle"
          fontSize={10}
          style={{ fill: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}
        >
          K,V
        </text>
      </g>
    ))

  return (
    <Svg viewBox="0 0 810 250" aria-label="Prefill y decode con KV cache">
      <ArrowDefs />
      <Label x={20} y={22} anchor="start" mono size={10.5} color="var(--fg-subtle)">
        1 · PREFILL: TODO EL PROMPT EN PARALELO
      </Label>
      {tokenRow(prompt, 20, 34, 'var(--l0)')}
      {prompt.map((_, i) => (
        <Arrow key={i} x1={20 + i * step + cw / 2} y1={62} x2={20 + i * step + cw / 2} y2={88} />
      ))}
      {cacheRow(4, 20, 92, false)}
      <Label x={20} y={132} anchor="start" size={11}>
        Coste ∝ longitud del prompt → determina el TTFT
      </Label>

      <Label x={decodeX} y={22} anchor="start" mono size={10.5} color="var(--fg-subtle)">
        2 · DECODE: UN TOKEN POR PASO
      </Label>
      {tokenRow(gen, decodeX, 34, 'var(--l4)')}
      <Arrow
        x1={decodeX + 2 * step + cw / 2}
        y1={62}
        x2={decodeX + 6 * step + cw / 2}
        y2={88}
        color="var(--l2)"
      />
      {cacheRow(7, decodeX, 92, true)}
      <Label x={decodeX} y={132} anchor="start" size={11}>
        Cada paso lee toda la caché y añade 1 par K,V
      </Label>

      <rect x={20} y={158} width={770} height={74} rx={10} style={{ fill: 'var(--surface-2)', stroke: 'var(--border)' }} />
      <Label x={36} y={182} anchor="start" mono size={11} color="var(--fg)">
        memoria KV = 2 × capas × kv_heads × head_dim × bytes × tokens
      </Label>
      <Label x={36} y={204} anchor="start" size={11}>
        Ej.: modelo tipo Llama-3-8B (32 capas, 8 kv_heads, head_dim 128) en FP16 → 128 KiB por token
      </Label>
      <Label x={36} y={221} anchor="start" size={11}>
        → 32k tokens de contexto ≈ 4 GiB solo de caché, por cada petición concurrente.
      </Label>
    </Svg>
  )
}
