import { ArrowDown, ArrowUp, BarChart3, CircleCheck, CircleX, FileText, Loader2, MessageSquareText, Search, TriangleAlert } from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { Badge } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { embed, loadEmbedder, MODEL_MB, useEmbedder } from '@/lib/embedder'
import { loadTokenizer, type Tokenizer } from '@/lib/tokenizers'
import { decodeVectors, type PackedVectors } from '@/lib/vectors'
import { E5_PASSAGE, E5_QUERY } from '../embeddings/data'
import { Field, Panel, Segmented } from '../kit'
import { PASSAGES, passageText, QUESTION_KINDS, QUESTIONS, type RagQuestion } from './corpus'
import {
  buildIndex,
  buildPrompt,
  DEFAULT_OPTIONS,
  evaluate,
  passageById,
  RETRIEVERS,
  runPipeline,
  type PipelineOptions,
  type PipelineResult,
  type Ranked,
} from './logic'
import rerankData from './rerank.json'
import packed from './vectors.json'

const nf = (d: number) => new Intl.NumberFormat('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d })
const DEC = decodeVectors(packed as PackedVectors)
const INDEX = buildIndex(PASSAGES, new Map(PASSAGES.map((p) => [p.id, DEC.get(E5_PASSAGE + passageText(p))!])))
const SCORES = rerankData.scores as Record<string, Record<string, number>>
const THRESHOLDS = [0, 0.001, 0.01, 0.05, 0.2] as const

type Query = { kind: 'sample'; index: number } | { kind: 'custom'; text: string; vector: Float32Array | null }

export default function RagLab() {
  const [query, setQuery] = useState<Query>({ kind: 'sample', index: 0 })
  const [opts, setOpts] = useState<PipelineOptions>(DEFAULT_OPTIONS)
  const set = (patch: Partial<PipelineOptions>) => setOpts((o) => ({ ...o, ...patch }))

  const sample = query.kind === 'sample' ? QUESTIONS[query.index]! : null
  const text = sample ? sample.q : query.kind === 'custom' ? query.text : ''
  const qv = sample ? DEC.get(E5_QUERY + sample.q)! : query.kind === 'custom' ? query.vector : null
  const scores = sample ? SCORES[query.kind === 'sample' ? query.index : -1] ?? null : null
  const result = useMemo(() => runPipeline(INDEX, text, qv, opts, scores), [text, qv, opts, scores])

  return (
    <div className="space-y-5">
      <Panel title="1 · La pregunta" icon={<Search />}>
        <QuestionPicker query={query} onPick={setQuery} />
      </Panel>

      <Panel title="Configuración del pipeline">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Recuperador">
            <Segmented label="Recuperador" value={opts.retriever} onChange={(retriever) => set({ retriever })} options={RETRIEVERS.map((r) => ({ value: r.id, label: r.label, title: r.short }))} />
          </Field>
          <Field label="Fragmentos al prompt (k)" hint={`top ${opts.k}`}>
            <Segmented label="k" value={opts.k} onChange={(k) => set({ k })} options={[1, 2, 3, 5, 8].map((k) => ({ value: k, label: k }))} />
          </Field>
          <Field label="Filtro por metadatos">
            <Toggle checked={opts.onlyCurrent} onChange={(onlyCurrent) => set({ onlyCurrent })}>
              Solo documentos vigentes
            </Toggle>
          </Field>
          <Field label="Re-ranking" hint={opts.rerank ? `${opts.candidates} candidatos` : undefined}>
            <Toggle checked={opts.rerank} onChange={(rerank) => set({ rerank })} disabled={!sample}>
              Cross-encoder bge-reranker-v2-m3
            </Toggle>
            {!sample && <p className="mt-1 text-[11.5px] text-subtle">Precalculado solo para las preguntas de ejemplo (el modelo pesa 571 MB).</p>}
          </Field>
        </div>
        {opts.rerank && sample && (
          <div className="mt-4">
            <Field label="Umbral de relevancia del reranker" hint={opts.threshold ? `≥ ${opts.threshold}` : 'sin umbral'}>
              <Segmented
                label="Umbral"
                value={opts.threshold}
                onChange={(threshold) => set({ threshold })}
                options={THRESHOLDS.map((t) => ({ value: t, label: t === 0 ? 'ninguno' : String(t).replace('.', ',') }))}
              />
              <p className="mt-1.5 text-[12px] text-subtle">Los fragmentos con una puntuación menor no llegan al prompt. Sin contexto, el modelo debe decir que no lo sabe.</p>
            </Field>
          </div>
        )}
      </Panel>

      <Panel title="2 · Recuperación" icon={<Search />}>
        <Retrieval result={result} opts={opts} question={sample} hasDense={!!qv} />
      </Panel>

      {result.reranked && (
        <Panel title="3 · Re-ranking">
          <Reranking result={result} opts={opts} question={sample} />
        </Panel>
      )}

      <Panel title={`${result.reranked ? 4 : 3} · El contexto y el prompt`} icon={<FileText />}>
        <ContextView result={result} question={sample} text={text} />
      </Panel>

      <Panel title="Evaluación con todas las preguntas de ejemplo" icon={<BarChart3 />}>
        <Evaluation k={opts.k} current={opts} />
      </Panel>
    </div>
  )
}

function Toggle({ checked, onChange, disabled, children }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean; children: ReactNode }) {
  return (
    <label className={cn('flex min-h-8 cursor-pointer items-center gap-2 text-[13px] text-muted', disabled && 'cursor-not-allowed opacity-50')}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--accent)]" />
      {children}
    </label>
  )
}

function QuestionPicker({ query, onPick }: { query: Query; onPick: (q: Query) => void }) {
  const { status, loaded, total } = useEmbedder()
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setBusy(true)
    const vector = status === 'ready' ? (await embed([E5_QUERY + text]))[0]! : null
    onPick({ kind: 'custom', text, vector })
    setBusy(false)
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {QUESTIONS.map((q, i) => (
          <button
            key={q.q}
            type="button"
            onClick={() => onPick({ kind: 'sample', index: i })}
            className={cn(
              'cursor-pointer rounded-lg border px-2.5 py-1 text-left text-[12.5px] transition-colors',
              query.kind === 'sample' && query.index === i ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
            )}
          >
            {q.q}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="mt-3 flex flex-wrap gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="O escribe tu propia pregunta sobre la base de conocimiento…"
          className="h-9 min-w-56 flex-1 rounded-lg border border-border bg-bg px-3 text-[13.5px] outline-none focus:border-accent"
        />
        <button type="submit" disabled={busy || !draft.trim()} className="h-9 cursor-pointer rounded-lg bg-accent px-3 text-[13px] font-medium text-accent-fg disabled:opacity-50">
          {busy ? <Loader2 className="size-4 animate-spin" /> : 'Preguntar'}
        </button>
      </form>
      {status !== 'ready' && (
        <p className="mt-2 text-[12px] text-subtle">
          Tus preguntas usan BM25 de inmediato. Para la búsqueda densa hace falta el modelo de embeddings:{' '}
          <button type="button" onClick={loadEmbedder} disabled={status === 'loading'} className="cursor-pointer text-accent underline underline-offset-2">
            {status === 'loading' ? `descargando… ${total ? Math.round((loaded / total) * 100) : 0} %` : `descargar (${MODEL_MB} MB)`}
          </button>
          .
        </p>
      )}
      {query.kind === 'sample' && (
        <p className="mt-3 text-[12.5px] text-muted">
          Tipo: <Badge>{QUESTION_KINDS[QUESTIONS[query.index]!.kind]}</Badge>{' '}
          {QUESTIONS[query.index]!.gold.length ? (
            <>
              · la respuesta está en <b className="text-fg">{QUESTIONS[query.index]!.gold.map((g) => passageById(g).title).join(', ')}</b>
            </>
          ) : (
            '· ningún documento contiene la respuesta'
          )}
        </p>
      )}
    </div>
  )
}

function RankList({ title, list, gold, active, limit, format }: { title: string; list: Ranked[] | null; gold: string[]; active: boolean; limit: number; format: (s: number) => string }) {
  return (
    <div className={cn('min-w-0 rounded-xl border p-3', active ? 'border-accent/60 bg-accent-soft/40' : 'border-border')}>
      <p className="mb-2 flex items-center gap-2 text-[13px] font-medium">
        {title}
        {active && <Badge color="var(--accent)">en uso</Badge>}
      </p>
      {!list ? (
        <p className="text-[12px] text-subtle">Necesita el modelo de embeddings.</p>
      ) : (
        <ol className="space-y-1">
          {list.slice(0, limit).map((r, i) => {
            const p = passageById(r.id)
            const isGold = gold.includes(r.id)
            return (
              <li key={r.id} className={cn('flex items-center gap-2 rounded-md px-1.5 py-1 text-[12px]', isGold && 'bg-ok/10')}>
                <span className="w-3 shrink-0 font-mono text-subtle">{i + 1}</span>
                <span className={cn('min-w-0 flex-1 truncate', p.outdated && 'text-subtle line-through')} title={p.title}>
                  {p.title}
                </span>
                {isGold && <CircleCheck className="size-3.5 shrink-0 text-ok" aria-label="contiene la respuesta" />}
                <span className="shrink-0 font-mono text-[11px] text-subtle tabular-nums">{format(r.score)}</span>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

function Retrieval({ result, opts, question, hasDense }: { result: PipelineResult; opts: PipelineOptions; question: RagQuestion | null; hasDense: boolean }) {
  const gold = question?.gold ?? []
  const bm25 = result.bm25.filter((r) => r.score > 0)
  return (
    <div>
      <div className="grid gap-3 lg:grid-cols-3">
        <RankList title="BM25" list={bm25} gold={gold} active={opts.retriever === 'bm25'} limit={6} format={(s) => nf(1).format(s)} />
        <RankList title="Denso (coseno)" list={hasDense ? result.dense : null} gold={gold} active={opts.retriever === 'dense'} limit={6} format={(s) => nf(3).format(s)} />
        <RankList title="Híbrido (RRF)" list={hasDense ? result.hybrid : null} gold={gold} active={opts.retriever === 'hybrid'} limit={6} format={(s) => nf(4).format(s)} />
      </div>
      {bm25.length === 0 && <p className="mt-2 text-[12.5px] text-muted">BM25 no encuentra ningún documento con palabras de la pregunta.</p>}
      {result.excluded.length > 0 && (
        <p className="mt-3 text-[12.5px] text-muted">
          Filtrado por metadatos: {result.excluded.map((id) => passageById(id).title).join(', ')} no participa en la búsqueda.
        </p>
      )}
      <p className="mt-3 text-[12.5px] leading-relaxed text-muted">
        Las puntuaciones no son comparables entre columnas: BM25 suma pesos de términos, el denso es un coseno y RRF solo usa la
        posición (1 / (60 + rango) en cada lista). Por eso la fusión se hace por rangos y no sumando puntuaciones.
      </p>
    </div>
  )
}

function Reranking({ result, opts, question }: { result: PipelineResult; opts: PipelineOptions; question: RagQuestion | null }) {
  const gold = question?.gold ?? []
  const before = result.retrieved.slice(0, opts.candidates).map((r) => r.id)
  return (
    <div>
      <p className="-mt-1 mb-3 max-w-3xl text-[13.5px] leading-relaxed text-muted">
        El cross-encoder lee la pregunta y cada candidato <b className="text-fg">juntos</b> y puntúa su relevancia de 0 a 1. Es más
        preciso que comparar vectores calculados por separado, pero mucho más lento: por eso solo reordena los {opts.candidates} primeros.
      </p>
      <ol className="space-y-1">
        {result.reranked!.map((r, i) => {
          const p = passageById(r.id)
          const move = before.indexOf(r.id) - i
          const passes = r.score >= opts.threshold && result.context.some((c) => c.id === r.id)
          return (
            <li key={r.id} className={cn('flex items-center gap-2 rounded-md px-2 py-1.5 text-[12.5px]', gold.includes(r.id) && 'bg-ok/10', !passes && 'opacity-55')}>
              <span className="w-4 shrink-0 font-mono text-subtle">{i + 1}</span>
              <span className="w-10 shrink-0 font-mono text-[11px]">
                {move > 0 ? (
                  <span className="text-ok">
                    <ArrowUp className="inline size-3" />
                    {move}
                  </span>
                ) : move < 0 ? (
                  <span className="text-subtle">
                    <ArrowDown className="inline size-3" />
                    {-move}
                  </span>
                ) : (
                  <span className="text-subtle">=</span>
                )}
              </span>
              <span className={cn('min-w-0 flex-1 truncate', p.outdated && 'line-through')}>{p.title}</span>
              {gold.includes(r.id) && <CircleCheck className="size-3.5 shrink-0 text-ok" aria-label="contiene la respuesta" />}
              <span className="h-1.5 w-20 shrink-0 rounded-full bg-surface-3">
                <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.max(2, r.score * 100)}%` }} />
              </span>
              <span className="w-12 shrink-0 text-right font-mono text-[11.5px] tabular-nums">{nf(3).format(r.score)}</span>
            </li>
          )
        })}
      </ol>
      <p className="mt-2 text-[12px] text-subtle">Las flechas indican cuántos puestos sube o baja cada documento respecto al recuperador.</p>
    </div>
  )
}

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

function ContextView({ result, question, text }: { result: PipelineResult; question: RagQuestion | null; text: string }) {
  const tok = useTokenizer()
  const [showPrompt, setShowPrompt] = useState(false)
  const prompt = buildPrompt(text, result.context)
  const tokens = tok?.encode(prompt).length
  const gold = question?.gold ?? []
  const hasGold = result.context.some((c) => gold.includes(c.id))
  const hasOutdated = result.context.some((c) => passageById(c.id).outdated)
  const outdatedFirst = result.context[0] && passageById(result.context[0].id).outdated

  let verdict: { tone: 'ok' | 'warn' | 'bad'; title: string; body: string } | null = null
  if (question) {
    if (!question.gold.length) {
      verdict = result.context.length
        ? {
            tone: 'warn',
            title: 'Riesgo de alucinación',
            body: 'Ningún documento responde a esta pregunta, pero el prompt lleva fragmentos que se le parecen. Un modelo complaciente puede construir una respuesta con ellos. Prueba el re-ranking con un umbral.',
          }
        : { tone: 'ok', title: 'Contexto vacío: correcto', body: 'No hay información sobre esto, así que no llega nada al prompt y el modelo debe responder que no lo sabe.' }
    } else if (!hasGold) {
      verdict = {
        tone: 'bad',
        title: 'La respuesta no llega al modelo',
        body: 'El fragmento correcto no está en el contexto. Con estas fuentes, el modelo solo puede decir que no lo sabe… o inventárselo.',
      }
    } else if (hasOutdated) {
      verdict = {
        tone: 'warn',
        title: outdatedFirst ? 'El documento obsoleto va primero' : 'El contexto mezcla versiones',
        body: 'Llegan la política vigente y la de 2024, con datos contradictorios. El modelo puede elegir el dato antiguo. Activa el filtro «Solo documentos vigentes».',
      }
    } else verdict = { tone: 'ok', title: 'La respuesta está en el contexto', body: question.answer }
  }

  return (
    <div className="space-y-4">
      {result.context.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border-strong p-4 text-[13px] text-muted">Ningún fragmento llega al prompt.</p>
      ) : (
        <ol className="space-y-2">
          {result.context.map((c, i) => {
            const p = passageById(c.id)
            return (
              <li key={c.id} className={cn('rounded-xl border px-3 py-2.5', gold.includes(c.id) ? 'border-ok/50' : 'border-border')}>
                <p className="flex flex-wrap items-center gap-2 text-[13px] font-medium">
                  <span className="font-mono text-accent">[{i + 1}]</span>
                  {p.title}
                  <span className="font-mono text-[11px] font-normal text-subtle">
                    {p.section} · {p.updated}
                  </span>
                  {p.outdated && <Badge color="var(--warn)">obsoleto</Badge>}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-muted">{p.text}</p>
              </li>
            )
          })}
        </ol>
      )}

      {verdict && (
        <div
          className={cn(
            'flex gap-3 rounded-xl px-4 py-3 text-[13.5px] leading-relaxed',
            verdict.tone === 'ok' && 'bg-ok/10',
            verdict.tone === 'warn' && 'bg-warn/10',
            verdict.tone === 'bad' && 'bg-bad/10',
          )}
        >
          {verdict.tone === 'ok' ? (
            <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-ok" />
          ) : verdict.tone === 'warn' ? (
            <TriangleAlert className="mt-0.5 size-4.5 shrink-0 text-warn" />
          ) : (
            <CircleX className="mt-0.5 size-4.5 shrink-0 text-bad" />
          )}
          <div>
            <p className="font-semibold">{verdict.title}</p>
            <p className="mt-0.5 text-muted">{verdict.tone === 'ok' && question?.gold.length ? <>Respuesta de referencia (escrita a mano): {verdict.body}</> : verdict.body}</p>
          </div>
        </div>
      )}
      {!question && (
        <p className="text-[12.5px] text-muted">
          Con tus propias preguntas no hay respuesta de referencia: revisa si los fragmentos recuperados la contienen.
        </p>
      )}

      <div>
        <button type="button" onClick={() => setShowPrompt(!showPrompt)} className="flex cursor-pointer items-center gap-2 text-[13px] font-medium text-accent">
          <MessageSquareText className="size-4" />
          {showPrompt ? 'Ocultar el prompt' : 'Ver el prompt completo'}
          <span className="font-mono text-[12px] font-normal text-subtle">{tokens ? `${tokens} tokens (o200k)` : '…'}</span>
        </button>
        {showPrompt && (
          <pre className="mt-2 max-h-80 overflow-auto rounded-xl bg-surface-2 p-3 font-mono text-[12px] leading-relaxed whitespace-pre-wrap">{prompt}</pre>
        )}
      </div>
    </div>
  )
}

const CONFIGS: { label: string; opts: Partial<PipelineOptions> }[] = [
  { label: 'BM25', opts: { retriever: 'bm25' } },
  { label: 'Denso', opts: { retriever: 'dense' } },
  { label: 'Híbrido', opts: { retriever: 'hybrid' } },
  { label: 'Híbrido + filtro', opts: { retriever: 'hybrid', onlyCurrent: true } },
  { label: 'Híbrido + filtro + reranker', opts: { retriever: 'hybrid', onlyCurrent: true, rerank: true } },
  { label: '… + umbral 0,01', opts: { retriever: 'hybrid', onlyCurrent: true, rerank: true, threshold: 0.01 } },
]

function Evaluation({ k, current }: { k: number; current: PipelineOptions }) {
  const rows = useMemo(
    () =>
      CONFIGS.map((c) => {
        const opts = { ...DEFAULT_OPTIONS, ...c.opts, k }
        const m = evaluate(
          INDEX,
          QUESTIONS,
          (q) => DEC.get(E5_QUERY + q.q)!,
          (qi) => SCORES[qi]!,
          opts,
        )
        const isCurrent =
          opts.retriever === current.retriever &&
          opts.onlyCurrent === current.onlyCurrent &&
          opts.rerank === current.rerank &&
          (!opts.rerank || opts.threshold === current.threshold)
        return { ...c, m, isCurrent }
      }),
    [k, current],
  )
  const answerable = QUESTIONS.filter((q) => q.gold.length).length
  return (
    <div>
      <p className="-mt-1 mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
        Las {QUESTIONS.length} preguntas de ejemplo son un pequeño conjunto de evaluación: {answerable} con respuesta conocida y{' '}
        {QUESTIONS.length - answerable} sin respuesta. Con k = {k}:
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="border-b border-border text-left text-[11.5px] text-subtle">
              <th className="py-2 pr-3 font-medium">Configuración</th>
              <th className="px-3 py-2 font-medium">Recall@{k}</th>
              <th className="px-3 py-2 text-right font-medium">MRR@10</th>
              <th className="py-2 pl-3 text-right font-medium">Se abstiene</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className={cn('border-b border-border last:border-0', r.isCurrent && 'bg-accent-soft')}>
                <td className="py-2 pr-3 font-medium">{r.label}</td>
                <td className="px-3 py-2">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-28 rounded-full bg-surface-3">
                      <span className="block h-full rounded-full bg-accent" style={{ width: `${r.m.recall * 100}%` }} />
                    </span>
                    <span className="font-mono tabular-nums">{nf(0).format(r.m.recall * 100)} %</span>
                  </span>
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{nf(2).format(r.m.mrr)}</td>
                <td className="py-2 pl-3 text-right font-mono tabular-nums">{r.m.abstention === null ? '—' : `${nf(0).format(r.m.abstention * 100)} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-1.5 text-[13px] leading-relaxed text-muted">
        <li>
          <b className="text-fg">Recall@k</b>: en qué proporción de preguntas llega al prompt el fragmento con la respuesta. Si no llega, el
          modelo no puede acertar.
        </li>
        <li>
          <b className="text-fg">MRR</b>: media de 1 / posición del primer fragmento correcto. Premia tenerlo arriba, que es donde el modelo
          más lo aprovecha.
        </li>
        <li>
          <b className="text-fg">Lo que enseña este corpus</b>: la búsqueda densa ya es muy buena aquí, y la fusión con BM25 puede empeorarla
          cuando BM25 aporta ruido. El filtro de metadatos quita la política obsoleta y el reranker recoloca los fragmentos correctos. Son
          resultados de este corpus: en el tuyo hay que medirlos.
        </li>
      </ul>
    </div>
  )
}
