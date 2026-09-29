import { CircleCheck, CircleDashed, CircleX, FileText, Scissors, Search, Table2 } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Bm25 } from '@/lib/retrieval'
import { loadTokenizer, type Tokenizer } from '@/lib/tokenizers'
import { Field, Panel, Range, Segmented, Stat } from '../kit'
import { DOCUMENTS, type Question } from './documents'
import {
  answerSpan,
  chunkText,
  flagsOf,
  indexedText,
  retrieve,
  STRATEGIES,
  summarize,
  type Chunk,
  type Count,
  type Coverage,
  type RetrievalResult,
  type StrategyId,
} from './logic'

const nf = (d: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d })
const SIZES = [32, 48, 64, 96, 128, 160, 200, 256, 320, 400, 512, 768, 1024] as const
const COLORS = ['var(--l1)', 'var(--l3)', 'var(--l5)', 'var(--l6)']
const colorOf = (i: number) => COLORS[i % COLORS.length]!
const tint = (c: string, pct: number) => `color-mix(in oklab, ${c} ${pct}%, transparent)`
const NO_QUESTIONS: Question[] = []

function useTokenizer(): Tokenizer | null {
  const [tok, setTok] = useState<Tokenizer | null>(null)
  useEffect(() => {
    let alive = true
    loadTokenizer('o200k_base').then((t) => alive && setTok(t))
    return () => {
      alive = false
    }
  }, [])
  return tok
}

export default function ChunkingLab() {
  const tok = useTokenizer()
  const [docId, setDocId] = useState<string>('policy')
  const [custom, setCustom] = useState<string>(DOCUMENTS[0]!.text)
  const [strategy, setStrategy] = useState<StrategyId>('fixed')
  const [sizeIndex, setSizeIndex] = useState<number>(SIZES.indexOf(200))
  const [overlapPct, setOverlapPct] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [question, setQuestion] = useState<number | null>(null)

  const doc = DOCUMENTS.find((d) => d.id === docId)
  const text = doc ? doc.text : custom
  const questions: Question[] = doc?.questions ?? NO_QUESTIONS
  const size = SIZES[sizeIndex]!
  const overlap = Math.round((size * overlapPct) / 100)
  const count: Count | null = useMemo(() => (tok ? (t: string) => tok.encode(t).length : null), [tok])

  const chunks = useMemo(() => (count ? chunkText(text, strategy, size, overlap, count) : []), [text, strategy, size, overlap, count])
  const summary = useMemo(() => (count && chunks.length ? summarize(chunks, text, size, count) : null), [chunks, text, size, count])
  const results = useMemo(
    () => questions.map((q) => retrieve(chunks, q.q, answerSpan(text, q.answer))),
    [chunks, questions, text],
  )
  const span = question !== null && questions[question] ? answerSpan(text, questions[question].answer) : null
  const how = STRATEGIES.find((s) => s.id === strategy)!

  const pickDoc = (id: string) => {
    setDocId(id)
    setSelected(null)
    setQuestion(null)
  }

  return (
    <div className="space-y-5">
      <Panel title="Documento y estrategia" icon={<Scissors />}>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Documento">
            <Segmented
              label="Documento"
              value={docId}
              onChange={pickDoc}
              options={[...DOCUMENTS.map((d) => ({ value: d.id, label: d.title, title: d.kind })), { value: 'custom', label: 'Tu texto' }]}
            />
            <p className="mt-1.5 text-[12px] text-subtle">
              {doc ? doc.kind : 'Pega cualquier texto; si usa encabezados Markdown (#, ##) la estrategia por estructura los aprovecha.'}
              {count && ` · ${nf(0).format(count(text))} tokens`}
            </p>
          </Field>
          <Field label="Estrategia">
            <Segmented label="Estrategia" value={strategy} onChange={setStrategy} options={STRATEGIES.map((s) => ({ value: s.id, label: s.label, title: s.short }))} />
            <p className="mt-1.5 text-[12px] leading-relaxed text-subtle">{how.how}</p>
          </Field>
          <Field label="Tamaño máximo" hint={`${size} tokens`}>
            <Range label="Tamaño máximo en tokens" min={0} max={SIZES.length - 1} value={sizeIndex} onChange={setSizeIndex} />
            <div className="flex justify-between font-mono text-[11px] text-subtle">
              <span>{SIZES[0]}</span>
              <span>{SIZES.at(-1)}</span>
            </div>
          </Field>
          <Field label="Solape" hint={overlap ? `${overlapPct} % · ${overlap} tokens` : 'sin solape'}>
            <Range label="Solape en porcentaje" min={0} max={50} step={5} value={overlapPct} onChange={setOverlapPct} />
            <p className="text-[12px] text-subtle">Repite el final de cada fragmento al principio del siguiente para no perder el contexto en el corte.</p>
          </Field>
        </div>
        {!doc && (
          <textarea
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value)
              setSelected(null)
            }}
            rows={6}
            aria-label="Tu texto"
            className="mt-4 block w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 font-mono text-[12.5px] leading-relaxed outline-none focus:border-accent"
          />
        )}
      </Panel>

      {!count ? (
        <div className="h-60 animate-pulse rounded-2xl bg-surface-2" />
      ) : (
        <>
          {summary && (
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Stat label="Fragmentos" value={summary.chunks} strong />
              <Stat label="Tokens por fragmento" value={nf(0).format(summary.avg)} sub={`mín. ${summary.min} · máx. ${summary.max}`} />
              <Stat label="Cortan una frase" value={`${nf(0).format(summary.cutPct)} %`} sub="terminan a mitad de frase" />
              <Stat label="Tokens extra en el índice" value={`${nf(0).format(summary.overheadPct)} %`} sub="por solape y encabezados" />
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[1.35fr_1fr]">
            <Panel title="El documento troceado" icon={<FileText />} className="min-w-0">
              <DocView text={text} chunks={chunks} selected={selected} onSelect={setSelected} span={span} />
            </Panel>
            <Panel title={`${chunks.length} fragmentos`} className="min-w-0">
              <ChunkList chunks={chunks} text={text} size={size} selected={selected} onSelect={setSelected} />
            </Panel>
          </div>

          <Panel title="¿Encuentra la respuesta?" icon={<Search />}>
            <p className="-mt-1 mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
              Cada pregunta se busca con BM25 (búsqueda léxica real) entre los fragmentos. Lo que importa es si el primer fragmento
              recuperado contiene <b className="text-fg">la respuesta completa</b>: si está partida entre dos, el modelo recibe media
              respuesta. Pulsa una pregunta para subrayar su respuesta en el documento.
            </p>
            {questions.length > 0 && (
              <ul className="space-y-1.5">
                {questions.map((q, i) => {
                  const r = results[i]!
                  return (
                    <li key={q.q}>
                      <button
                        type="button"
                        onClick={() => {
                          setQuestion(question === i ? null : i)
                          setSelected(r.top)
                        }}
                        aria-pressed={question === i}
                        className={cn(
                          'flex w-full cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-3 py-2.5 text-left transition-colors',
                          question === i ? 'border-accent/60 bg-accent-soft' : 'border-border hover:border-border-strong',
                        )}
                      >
                        <span className="min-w-0 flex-1 text-[13.5px]">{q.q}</span>
                        <CoverageBadge result={r} />
                        <Diagnosis result={r} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <FreeQuery chunks={chunks} onSelect={setSelected} />
          </Panel>

          <Panel title="Comparar estrategias con el mismo tamaño" icon={<Table2 />}>
            <Comparison text={text} questions={questions} size={size} overlap={overlap} count={count} current={strategy} onPick={setStrategy} />
          </Panel>
        </>
      )}
    </div>
  )
}

const COVERAGE: Record<Coverage, { icon: typeof CircleCheck; label: string; cls: string }> = {
  full: { icon: CircleCheck, label: 'Respuesta completa', cls: 'text-ok' },
  partial: { icon: CircleDashed, label: 'Solo una parte', cls: 'text-warn' },
  none: { icon: CircleX, label: 'Sin la respuesta', cls: 'text-bad' },
}

function CoverageBadge({ result }: { result: RetrievalResult }) {
  const m = COVERAGE[result.coverage]
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-medium', m.cls)}>
      <m.icon className="size-4" aria-hidden />
      {m.label}
      <span className="font-mono text-[11.5px] font-normal text-subtle">recupera #{result.top + 1}</span>
    </span>
  )
}

/** Why retrieval failed: the chunking cut the answer, or the search picked another chunk. */
function Diagnosis({ result: r }: { result: RetrievalResult }) {
  if (r.coverage === 'full') return null
  let text: string
  if (!r.anyFull) text = `El corte parte la respuesta: ningún fragmento la contiene entera (la mayor parte está en #${r.answerChunk + 1}).`
  else if (r.coverage === 'partial') text = `La respuesta entera está en #${r.answerChunk + 1}, pero la búsqueda prefirió #${r.top + 1}, que solo tiene un trozo.`
  else
    text = `La respuesta está entera en #${r.answerChunk + 1}, pero la búsqueda léxica eligió #${r.top + 1}: la pregunta usa palabras distintas a las del texto. Los embeddings y los títulos de sección ayudan aquí.`
  return <span className="w-full text-[12px] leading-relaxed text-subtle">{text}</span>
}

function DocView({
  text,
  chunks,
  selected,
  onSelect,
  span,
}: {
  text: string
  chunks: Chunk[]
  selected: number | null
  onSelect: (i: number | null) => void
  span: [number, number] | null
}) {
  const segments = useMemo(() => {
    const cuts = new Set<number>([0, text.length])
    // Badges go on the first visible character, not on the leading whitespace.
    const badgeAt = chunks.map((c) => c.start + c.text.length - c.text.trimStart().length)
    for (const [k, c] of chunks.entries()) {
      cuts.add(c.start)
      cuts.add(c.end)
      cuts.add(badgeAt[k]!)
    }
    if (span) {
      cuts.add(span[0])
      cuts.add(span[1])
    }
    const sorted = [...cuts].sort((a, b) => a - b)
    const out: { a: number; b: number; owners: number[]; starts: number[] }[] = []
    for (let i = 0; i < sorted.length - 1; i++) {
      const a = sorted[i]!
      const b = sorted[i + 1]!
      const owners = chunks.flatMap((c, k) => (c.start <= a && c.end >= b ? [k] : []))
      const starts = badgeAt.flatMap((p, k) => (p === a ? [k] : []))
      out.push({ a, b, owners, starts })
    }
    return out
  }, [text, chunks, span])

  return (
    <div className="max-h-[560px] overflow-auto rounded-lg bg-bg p-3 text-[13px] leading-[1.9] whitespace-pre-wrap" onMouseLeave={() => onSelect(null)}>
      {segments.map(({ a, b, owners, starts }) => {
        const inSpan = span && a >= span[0] && b <= span[1]
        const active = selected !== null && owners.includes(selected)
        const alpha = active ? 34 : selected !== null ? 8 : 16
        let style: CSSProperties = {}
        if (owners.length === 1) style = { background: tint(colorOf(owners[0]!), alpha) }
        if (owners.length > 1)
          style = {
            background: `repeating-linear-gradient(135deg, ${tint(colorOf(owners[0]!), alpha + 10)} 0 5px, ${tint(colorOf(owners[1]!), alpha + 10)} 5px 10px)`,
          }
        if (inSpan) style = { ...style, textDecoration: 'underline', textDecorationColor: 'var(--accent)', textDecorationThickness: 2, textUnderlineOffset: 3 }
        return (
          <span key={a} style={style} onMouseEnter={() => owners.length && onSelect(owners.at(-1)!)} className="rounded-[3px] transition-colors">
            {starts.map((k) => (
              <span
                key={k}
                className="mr-1 inline-block rounded px-1 align-[1px] font-mono text-[10px] leading-4 font-semibold text-bg"
                style={{ background: colorOf(k) }}
              >
                {k + 1}
              </span>
            ))}
            {text.slice(a, b)}
          </span>
        )
      })}
    </div>
  )
}

function ChunkList({
  chunks,
  text,
  size,
  selected,
  onSelect,
}: {
  chunks: Chunk[]
  text: string
  size: number
  selected: number | null
  onSelect: (i: number | null) => void
}) {
  const max = Math.max(size, ...chunks.map((c) => c.tokens))
  return (
    <div className="max-h-[560px] space-y-2 overflow-auto pr-1" onMouseLeave={() => onSelect(null)}>
      {chunks.map((c, i) => {
        const f = flagsOf(c, text, size, chunks.length)
        const preview = c.text.replace(/\s+/g, ' ').trim()
        return (
          <div
            key={`${c.start}-${c.end}`}
            onMouseEnter={() => onSelect(i)}
            className={cn('rounded-xl border px-3 py-2.5 transition-colors', selected === i ? 'border-accent/60 bg-surface-2' : 'border-border')}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded px-1.5 font-mono text-[11px] font-semibold text-bg" style={{ background: colorOf(i) }}>
                {i + 1}
              </span>
              <span className="font-mono text-[12px] text-muted tabular-nums">{c.tokens} tokens</span>
              <span className="h-1.5 w-16 rounded-full bg-surface-3" aria-hidden>
                <span className="block h-full rounded-full" style={{ width: `${(c.tokens / max) * 100}%`, background: colorOf(i) }} />
              </span>
              {f.cut && <Flag tone="warn">corta una frase</Flag>}
              {f.tiny && <Flag tone="muted">muy pequeño</Flag>}
              {f.over && <Flag tone="bad">excede el tamaño</Flag>}
            </div>
            {c.header && <p className="mt-1.5 truncate font-mono text-[11px] text-accent">{c.header}</p>}
            <p className="mt-1 line-clamp-3 text-[12.5px] leading-relaxed text-muted">{preview}</p>
          </div>
        )
      })}
    </div>
  )
}

function Flag({ tone, children }: { tone: 'warn' | 'bad' | 'muted'; children: ReactNode }) {
  return (
    <span
      className={cn(
        'rounded-md px-1.5 py-0.5 text-[11px]',
        tone === 'warn' && 'bg-warn/10 text-warn',
        tone === 'bad' && 'bg-bad/10 text-bad',
        tone === 'muted' && 'bg-surface-3 text-muted',
      )}
    >
      {children}
    </span>
  )
}

function FreeQuery({ chunks, onSelect }: { chunks: Chunk[]; onSelect: (i: number | null) => void }) {
  const [q, setQ] = useState('')
  const hits = useMemo(() => {
    if (!q.trim()) return []
    return new Bm25(chunks.map(indexedText)).search(q, 3).filter((h) => h.score > 0)
  }, [q, chunks])
  return (
    <div className="mt-5">
      <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-bg px-3 focus-within:border-accent">
        <Search className="size-4 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Haz tu propia pregunta sobre el documento…"
          className="h-full flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-subtle"
        />
      </label>
      {q.trim() && (
        <ol className="mt-2 space-y-1.5">
          {hits.length === 0 && <li className="text-[13px] text-subtle">Ningún fragmento comparte palabras con la pregunta: la búsqueda léxica no encuentra sinónimos.</li>}
          {hits.map((h, rank) => (
            <li key={h.index} onMouseEnter={() => onSelect(h.index)} className="rounded-lg bg-surface-2 px-3 py-2 text-[12.5px]">
              <span className="font-mono text-subtle">
                {rank + 1}. fragmento #{h.index + 1} · BM25 {nf(2).format(h.score)} · coincide: {h.matched.join(', ')}
              </span>
              <span className="mt-0.5 line-clamp-2 block text-muted">{chunks[h.index]!.text.replace(/\s+/g, ' ').trim()}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function Comparison({
  text,
  questions,
  size,
  overlap,
  count,
  current,
  onPick,
}: {
  text: string
  questions: Question[]
  size: number
  overlap: number
  count: Count
  current: StrategyId
  onPick: (s: StrategyId) => void
}) {
  const rows = useMemo(
    () =>
      STRATEGIES.map((s) => {
        const chunks = chunkText(text, s.id, size, overlap, count)
        const sum = summarize(chunks, text, size, count)
        const full = questions.filter((q) => retrieve(chunks, q.q, answerSpan(text, q.answer)).coverage === 'full').length
        return { s, sum, full }
      }),
    [text, questions, size, overlap, count],
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-[13px]">
        <thead>
          <tr className="border-b border-border text-left text-[11.5px] text-subtle">
            <th className="py-2 pr-3 font-medium">Estrategia</th>
            <th className="px-3 py-2 text-right font-medium">Fragmentos</th>
            <th className="px-3 py-2 text-right font-medium">Tokens medios</th>
            <th className="px-3 py-2 text-right font-medium">Cortan frase</th>
            {questions.length > 0 && <th className="py-2 pl-3 text-right font-medium">Respuestas completas</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ s, sum, full }) => (
            <tr
              key={s.id}
              onClick={() => onPick(s.id)}
              className={cn('cursor-pointer border-b border-border last:border-0 hover:bg-surface-2', s.id === current && 'bg-accent-soft')}
            >
              <td className="py-2 pr-3 font-medium">{s.label}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{sum.chunks}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{nf(0).format(sum.avg)}</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{nf(0).format(sum.cutPct)} %</td>
              {questions.length > 0 && (
                <td className="py-2 pl-3 text-right font-mono tabular-nums">
                  {full} / {questions.length}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        No hay una estrategia ganadora universal: depende del tipo de documento, del modelo de embeddings y de las preguntas. Por eso
        el tamaño y la estrategia se eligen midiendo la recuperación con preguntas reales, no a ojo.
      </p>
    </div>
  )
}
