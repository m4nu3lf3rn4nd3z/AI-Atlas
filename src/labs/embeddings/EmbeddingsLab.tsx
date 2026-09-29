import { Download, Grid3x3, Loader2, Map as MapIcon, Plus, Search, Sparkles } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { embed, loadEmbedder, MODEL_LABEL, MODEL_MB, useEmbedder } from '@/lib/embedder'
import { cn } from '@/lib/cn'
import { useElementWidth } from '@/lib/hooks'
import { Bm25, cosine } from '@/lib/retrieval'
import { decodeVectors, pca2, type PackedVectors } from '@/lib/vectors'
import { LegendItem, Panel } from '../kit'
import { E5_QUERY, MATRIX, QUERIES, SENTENCES, type Sentence } from './data'
import packed from './vectors.json'

const nf = (d: number) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d })
const PRECOMPUTED = decodeVectors(packed as PackedVectors)
const pre = (text: string) => PRECOMPUTED.get(E5_QUERY + text)

/** Sequential single-hue ramp: 0 → surface grey, 1 → accent. */
const ramp = (t: number) => `color-mix(in oklab, var(--accent) ${Math.round(18 + 82 * Math.max(0, Math.min(1, t)))}%, var(--surface-3))`

interface Item extends Sentence {
  vector: Float32Array
  custom?: boolean
}

const BASE: Item[] = SENTENCES.map((s) => ({ ...s, vector: pre(s.text)! }))

export default function EmbeddingsLab() {
  const [custom, setCustom] = useState<Item[]>([])
  const [selected, setSelected] = useState<string>(BASE[1]!.text)
  const items = useMemo(() => [...BASE, ...custom], [custom])
  const sel = items.find((i) => i.text === selected) ?? items[0]!

  return (
    <div className="space-y-5">
      <Panel title="El espacio de significados" icon={<MapIcon />}>
        <p className="-mt-1 mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
          Cada frase es un vector de {packed.dims} números calculado por <span className="font-mono text-[12.5px]">{MODEL_LABEL}</span>. Elige una
          frase: el color de las demás indica cuánto se le parecen. Los vectores de los ejemplos se calcularon con este mismo modelo y
          vienen incluidos, por eso el mapa aparece al instante.
        </p>
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="min-w-0">
            <SemanticMap items={items} selected={sel} onSelect={setSelected} />
          </div>
          <div className="min-w-0">
            <Neighbors items={items} selected={sel} onSelect={setSelected} />
          </div>
        </div>
      </Panel>

      <ModelPanel
        onAdd={(item) => {
          setCustom((c) => [...c.filter((x) => x.text !== item.text), item])
          setSelected(item.text)
        }}
      />

      <Panel title="Matriz de similitud" icon={<Grid3x3 />}>
        <SimilarityMatrix />
      </Panel>

      <Panel title="Búsqueda por significado frente a búsqueda por palabras" icon={<Search />}>
        <SearchCompare items={items} />
      </Panel>
    </div>
  )
}

const MH = 380
const PAD = 28

function SemanticMap({ items, selected, onSelect }: { items: Item[]; selected: Item; onSelect: (t: string) => void }) {
  const [ref, width] = useElementWidth<HTMLDivElement>(560)
  const [hover, setHover] = useState<number | null>(null)
  const { points, explained } = useMemo(() => pca2(items.map((i) => i.vector)), [items])

  const sims = items.map((i) => cosine(i.vector, selected.vector))
  const others = sims.filter((_, k) => items[k] !== selected)
  const lo = Math.min(...others)
  const hi = Math.max(...others)
  const neighbors = items
    .map((_, k) => ({ k, s: sims[k]! }))
    .filter(({ k }) => items[k] !== selected)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((n) => n.k)

  // Same scale on both axes, so distances are not distorted.
  const xs = points.map((p) => p[0])
  const ys = points.map((p) => p[1])
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
  const scale = Math.min((width - 2 * PAD - 90) / (x1 - x0 || 1), (MH - 2 * PAD) / (y1 - y0 || 1))
  const ox = (width - (x1 - x0) * scale) / 2 - 30
  const oy = (MH - (y1 - y0) * scale) / 2
  const px = (i: number) => ox + (points[i]![0] - x0) * scale
  const py = (i: number) => oy + (y1 - points[i]![1]) * scale
  const si = items.indexOf(selected)

  // Greedy label placement: selected and neighbours first; skip labels that would collide.
  const order = [si, ...neighbors, ...items.map((_, k) => k).filter((k) => k !== si && !neighbors.includes(k))]
  const boxes: [number, number, number, number][] = []
  const shown = new Set<number>()
  for (const k of order) {
    const w = items[k]!.short.length * 6.1
    const box: [number, number, number, number] = [px(k) + 8, py(k) - 7, px(k) + 8 + w, py(k) + 7]
    if (box[2] > width - 2) continue
    if (boxes.some((b) => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue
    boxes.push(box)
    shown.add(k)
  }
  const h = hover !== null ? items[hover] : null

  return (
    <div>
      <div ref={ref} className="relative">
        <svg width={width} height={MH} role="img" aria-label="Mapa 2D de las frases" className="rounded-xl bg-bg">
          {neighbors.map((k) => (
            <line key={k} x1={px(si)} y1={py(si)} x2={px(k)} y2={py(k)} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={1.5} strokeDasharray="4 3" />
          ))}
          {items.map((it, k) => {
            const isSel = k === si
            const t = hi > lo ? (sims[k]! - lo) / (hi - lo) : 1
            return (
              <g
                key={it.text}
                className="cursor-pointer"
                onClick={() => onSelect(it.text)}
                onPointerEnter={() => setHover(k)}
                onPointerLeave={() => setHover(null)}
              >
                <circle cx={px(k)} cy={py(k)} r={14} fill="transparent" />
                {it.custom ? (
                  <rect x={px(k) - 6} y={py(k) - 6} width={12} height={12} rx={2} fill={isSel ? 'var(--fg)' : ramp(t)} stroke="var(--fg)" strokeWidth={1.5} />
                ) : (
                  <circle cx={px(k)} cy={py(k)} r={isSel ? 7 : 5.5} fill={isSel ? 'var(--fg)' : ramp(t)} stroke="var(--bg)" strokeWidth={2} />
                )}
                {shown.has(k) && (
                  <text
                    x={px(k) + 9}
                    y={py(k)}
                    dy="0.33em"
                    className={cn('text-[11px]', isSel ? 'fill-[var(--fg)] font-semibold' : neighbors.includes(k) ? 'fill-[var(--fg)]' : 'fill-[var(--fg-subtle)]')}
                  >
                    {it.short}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        {h && (
          <div
            className="pointer-events-none absolute z-10 max-w-64 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] shadow-lg shadow-black/10"
            style={{ left: Math.min(px(hover!) + 12, width - 260), top: Math.max(4, py(hover!) - 50) }}
          >
            <div>{h.text}</div>
            {h !== selected && <div className="mt-0.5 font-mono text-subtle">coseno {nf(3).format(sims[hover!]!)}</div>}
          </div>
        )}
      </div>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted">
        <span className="inline-flex items-center gap-2">
          menos parecida
          <span className="h-2.5 w-24 rounded-full" style={{ background: `linear-gradient(90deg, ${ramp(0)}, ${ramp(0.5)}, ${ramp(1)})` }} />
          más parecida
        </span>
        <LegendItem color="var(--accent)" dashed>
          3 vecinas más cercanas
        </LegendItem>
        <LegendItem color="var(--fg)">frase elegida</LegendItem>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-subtle">
        Proyección con PCA: los dos ejes conservan el {nf(0).format((explained[0] + explained[1]) * 100)} % de la variación de los vectores.
        Dos puntos cercanos en el mapa pueden no serlo en {packed.dims} dimensiones; las similitudes de la lista se calculan con los
        vectores completos.
      </p>
    </div>
  )
}

function Neighbors({ items, selected, onSelect }: { items: Item[]; selected: Item; onSelect: (t: string) => void }) {
  const ranked = items
    .filter((i) => i !== selected)
    .map((i) => ({ i, s: cosine(i.vector, selected.vector) }))
    .sort((a, b) => b.s - a.s)
  const lo = ranked.at(-1)?.s ?? 0
  const hi = ranked[0]?.s ?? 1
  return (
    <div>
      <p className="text-[12px] text-subtle">Más parecidas a</p>
      <p className="mt-0.5 text-[14.5px] leading-snug font-medium">«{selected.text}»</p>
      {selected.note && <p className="mt-1 text-[12.5px] text-warn">{selected.note}</p>}
      <VectorStrip vector={selected.vector} />
      <ol className="mt-3 max-h-[300px] space-y-1 overflow-auto pr-1">
        {ranked.map(({ i, s }, rank) => (
          <li key={i.text}>
            <button
              type="button"
              onClick={() => onSelect(i.text)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-surface-2"
            >
              <span className="w-4 shrink-0 text-right font-mono text-[11px] text-subtle">{rank + 1}</span>
              <span className="min-w-0 flex-1 truncate text-[12.5px]">{i.text}</span>
              <span className="h-1.5 w-12 shrink-0 rounded-full bg-surface-3">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${hi > lo ? 15 + (85 * (s - lo)) / (hi - lo) : 100}%` }} />
              </span>
              <span className="w-10 shrink-0 text-right font-mono text-[11.5px] tabular-nums">{nf(3).format(s)}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

/** The first dimensions of the vector, to show what an embedding actually is. */
function VectorStrip({ vector }: { vector: Float32Array }) {
  const n = 64
  const max = Math.max(...Array.from(vector.slice(0, n), Math.abs)) || 1
  return (
    <div className="mt-3">
      <svg viewBox={`0 0 ${n * 4} 36`} className="h-9 w-full" preserveAspectRatio="none" aria-label="Primeras 64 dimensiones del vector">
        <line x1={0} x2={n * 4} y1={18} y2={18} stroke="var(--border-strong)" strokeWidth={0.5} />
        {Array.from(vector.slice(0, n), (v, k) => (
          <rect key={k} x={k * 4 + 0.5} width={3} y={v >= 0 ? 18 - (v / max) * 17 : 18} height={(Math.abs(v) / max) * 17} fill="var(--accent)" opacity={0.75} />
        ))}
      </svg>
      <p className="font-mono text-[11px] text-subtle">
        [{Array.from(vector.slice(0, 4), (v) => nf(3).format(v)).join('; ')}; …] · primeras 64 de {vector.length} dimensiones
      </p>
    </div>
  )
}

function SimilarityMatrix() {
  const rows = MATRIX.map((t) => ({ t, s: SENTENCES.find((s) => s.text === t)!.short, v: pre(t)! }))
  const m = rows.map((a) => rows.map((b) => cosine(a.v, b.v)))
  const off = m.flatMap((r, i) => r.filter((_, j) => j !== i))
  const lo = Math.min(...off)
  const hi = Math.max(...off)
  const at = (a: string, b: string) => m[MATRIX.indexOf(a)]![MATRIX.indexOf(b)]!
  const love = at('Me encanta este restaurante.', 'No me gusta nada este restaurante.')
  const cat = at('El gato duerme en el sofá.', 'The cat is sleeping on the couch.')
  const bank = at('Abrí una cuenta de ahorro en el banco.', 'Me senté a leer en un banco del parque.')

  return (
    <div className="grid gap-6 xl:grid-cols-[auto_1fr]">
      <div className="overflow-x-auto">
        <table className="border-separate border-spacing-[2px] text-[11.5px]">
          <thead>
            <tr>
              <th />
              {rows.map((_, j) => (
                <th key={j} className="w-12 pb-1 text-center font-mono font-normal text-subtle">
                  {j + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.t}>
                <th className="pr-2 text-right font-normal whitespace-nowrap text-muted" title={r.t}>
                  <span className="mr-1.5 font-mono text-subtle">{i + 1}</span>
                  {r.s}
                </th>
                {m[i]!.map((c, j) => {
                  const t = (c - lo) / (hi - lo)
                  return (
                    <td
                      key={j}
                      title={`${rows[i]!.t} · ${rows[j]!.t}`}
                      className={cn('h-9 w-12 rounded-[4px] text-center font-mono tabular-nums', i !== j && t > 0.55 ? 'text-accent-fg' : 'text-fg')}
                      style={{ background: i === j ? 'var(--surface-2)' : ramp(t) }}
                    >
                      {i === j ? '—' : nf(2).format(c)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 text-[13.5px] leading-relaxed">
        <p>
          <b>Tema, no opinión.</b> «Me encanta» y «No me gusta nada este restaurante» tienen una similitud de{' '}
          <b className="font-mono">{nf(2).format(love)}</b>
          {love >= hi - 1e-9 ? ', la más alta de la matriz' : ''}. Los embeddings capturan de qué se habla, no si se aprueba o se rechaza:
          para distinguir opiniones o negaciones hace falta otro enfoque.
        </p>
        <p>
          <b>Entre idiomas.</b> La frase del gato en español y en inglés: <b className="font-mono">{nf(2).format(cat)}</b>. Un modelo
          multilingüe coloca el mismo significado en el mismo sitio aunque cambie el idioma.
        </p>
        <p>
          <b>Palabras con dos sentidos.</b> El banco de ahorro y el banco del parque: <b className="font-mono">{nf(2).format(bank)}</b>.
          Un modelo pequeño se deja llevar por la palabra compartida; los modelos más grandes y los rerankers lo resuelven mejor.
        </p>
        <p className="text-muted">
          Todos los valores están entre {nf(2).format(lo)} y {nf(2).format(hi)}: en los modelos E5 las similitudes se concentran en un
          rango estrecho. Importa el orden, no el valor absoluto, y por eso los umbrales fijos del tipo «similitud ≥ 0,8» son frágiles.
        </p>
      </div>
    </div>
  )
}

function SearchCompare({ items }: { items: Item[] }) {
  const ready = useEmbedder((s) => s.status === 'ready')
  const [query, setQuery] = useState<string>(QUERIES[0]!)
  const [draft, setDraft] = useState('')
  const [custom, setCustom] = useState<{ q: string; v: Float32Array } | null>(null)
  const [busy, setBusy] = useState(false)

  const qv = custom?.q === query ? custom.v : pre(query)
  const dense = qv
    ? items
        .map((i) => ({ i, s: cosine(qv, i.vector) }))
        .sort((a, b) => b.s - a.s)
        .slice(0, 5)
    : []
  const bm25 = useMemo(() => new Bm25(items.map((i) => i.text)), [items])
  const lexical = bm25.search(query, 5)
  const anyLexical = lexical.some((h) => h.score > 0)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const q = draft.trim()
    if (!q || !ready) return
    setBusy(true)
    const [v] = await embed([E5_QUERY + q])
    setCustom({ q, v: v! })
    setQuery(q)
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {QUERIES.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQuery(q)}
            className={cn(
              'cursor-pointer rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors',
              query === q ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
            )}
          >
            {q}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={!ready}
          placeholder={ready ? 'Escribe tu propia búsqueda…' : 'Descarga el modelo (arriba) para escribir tus propias búsquedas'}
          className="h-9 flex-1 rounded-lg border border-border bg-bg px-3 text-[13.5px] outline-none focus:border-accent disabled:opacity-60"
        />
        <button type="submit" disabled={!ready || busy} className="h-9 cursor-pointer rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : 'Buscar'}
        </button>
      </form>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="mb-2 text-[13px] font-medium">Embeddings · similitud coseno</p>
          <ol className="space-y-1">
            {dense.map(({ i, s }, rank) => (
              <li key={i.text} className="flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1.5 text-[12.5px]">
                <span className="w-3 font-mono text-subtle">{rank + 1}</span>
                <span className="min-w-0 flex-1">{i.text}</span>
                <span className="font-mono tabular-nums">{nf(3).format(s)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium">BM25 · palabras en común</p>
          {anyLexical ? (
            <ol className="space-y-1">
              {lexical
                .filter((h) => h.score > 0)
                .map((h, rank) => (
                  <li key={h.index} className="flex items-center gap-2 rounded-md bg-surface-2 px-2.5 py-1.5 text-[12.5px]">
                    <span className="w-3 font-mono text-subtle">{rank + 1}</span>
                    <span className="min-w-0 flex-1">{items[h.index]!.text}</span>
                    <span className="font-mono tabular-nums">{nf(2).format(h.score)}</span>
                  </li>
                ))}
            </ol>
          ) : (
            <p className="rounded-md border border-dashed border-border-strong px-3 py-3 text-[12.5px] text-muted">
              Ninguna frase comparte palabras con la búsqueda: para BM25 no hay nada que devolver.
            </p>
          )}
        </div>
      </div>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        Los embeddings encuentran «perro y tormenta» para «mascota y truenos» sin una sola palabra en común; BM25 gana cuando importan
        los términos exactos (nombres propios, códigos, cifras). Por eso los sistemas de RAG suelen combinar ambos: es la{' '}
        <b className="text-fg">búsqueda híbrida</b>.
      </p>
    </div>
  )
}

function ModelPanel({ onAdd }: { onAdd: (item: Item) => void }) {
  const { status, loaded, total, error } = useEmbedder()
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const add = async (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setBusy(true)
    const [vector] = await embed([E5_QUERY + text])
    onAdd({ text, short: text.length > 28 ? `${text.slice(0, 26)}…` : text, group: 'custom', vector: vector!, custom: true })
    setDraft('')
    setBusy(false)
  }

  return (
    <Panel title="Tus propias frases" icon={<Sparkles />}>
      {status === 'ready' ? (
        <form onSubmit={add} className="flex flex-wrap gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe una frase y mira dónde cae en el mapa…"
            className="h-9 min-w-56 flex-1 rounded-lg border border-border bg-bg px-3 text-[13.5px] outline-none focus:border-accent"
          />
          <button type="submit" disabled={busy || !draft.trim()} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-50">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Añadir al mapa
          </button>
          <p className="w-full text-[12px] text-subtle">Las frases que añades aparecen como cuadrados. El modelo corre en tu navegador: nada sale de tu equipo.</p>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadEmbedder}
            disabled={status === 'loading'}
            className="flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-60"
          >
            {status === 'loading' ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {status === 'loading' ? 'Descargando…' : `Descargar el modelo (${MODEL_MB} MB)`}
          </button>
          {status === 'loading' && total > 0 && (
            <div className="flex min-w-48 flex-1 items-center gap-2">
              <div className="h-2 flex-1 rounded-full bg-surface-3">
                <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${(loaded / total) * 100}%` }} />
              </div>
              <span className="font-mono text-[12px] text-muted tabular-nums">
                {nf(0).format(loaded / 1e6)} / {nf(0).format(total / 1e6)} MB
              </span>
            </div>
          )}
          <p className="w-full text-[12.5px] leading-relaxed text-muted">
            Para escribir tus propias frases y búsquedas hace falta el modelo. Se descarga una vez desde Hugging Face, se ejecuta en tu
            navegador con WebAssembly y queda en la caché: tus textos no salen de tu equipo.
          </p>
          {status === 'error' && <p className="w-full text-[12.5px] text-bad">No se pudo cargar el modelo: {error}</p>}
        </div>
      )}
    </Panel>
  )
}
