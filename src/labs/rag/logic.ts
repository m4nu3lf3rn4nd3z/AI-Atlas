import { Bm25, cosine, rrf } from '@/lib/retrieval'
import { PASSAGES, passageText, type Passage, type RagQuestion } from './corpus'

/* The retrieval half of a RAG pipeline, computed for real: lexical (BM25),
   dense (cosine over embeddings), hybrid (RRF) and cross-encoder reranking. */

export type RetrieverId = 'bm25' | 'dense' | 'hybrid'

export const RETRIEVERS: readonly { id: RetrieverId; label: string; short: string }[] = [
  { id: 'bm25', label: 'BM25', short: 'Palabras en común, ponderadas por lo raras que son.' },
  { id: 'dense', label: 'Denso', short: 'Similitud coseno entre embeddings: significado.' },
  { id: 'hybrid', label: 'Híbrido (RRF)', short: 'Fusiona los dos rankings por posición.' },
]

export interface Ranked {
  id: string
  score: number
}

export interface PipelineOptions {
  retriever: RetrieverId
  /** Remove documents marked as outdated before searching (metadata filter). */
  onlyCurrent: boolean
  rerank: boolean
  /** Candidates passed to the reranker. */
  candidates: number
  k: number
  /** Minimum reranker score for a passage to reach the prompt (0 = no threshold). */
  threshold: number
}

export const DEFAULT_OPTIONS: PipelineOptions = {
  retriever: 'hybrid',
  onlyCurrent: false,
  rerank: false,
  candidates: 10,
  k: 3,
  threshold: 0,
}

export interface Index {
  passages: readonly Passage[]
  bm25: Bm25
  vectors: ReadonlyMap<string, Float32Array>
}

export function buildIndex(passages: readonly Passage[], vectors: ReadonlyMap<string, Float32Array>): Index {
  return { passages, bm25: new Bm25(passages.map(passageText)), vectors }
}

export function rankBm25(index: Index, query: string): Ranked[] {
  return index.bm25.search(query).map((h) => ({ id: index.passages[h.index]!.id, score: h.score }))
}

export function rankDense(index: Index, qv: Float32Array): Ranked[] {
  return index.passages
    .map((p) => ({ id: p.id, score: cosine(qv, index.vectors.get(p.id)!) }))
    .sort((a, b) => b.score - a.score)
}

export function rankHybrid(bm25: Ranked[], dense: Ranked[]): Ranked[] {
  const ids = [...new Set([...bm25, ...dense].map((r) => r.id))]
  const pos = (list: Ranked[]) => list.map((r) => ids.indexOf(r.id))
  // BM25 results with score 0 did not match any term: they carry no signal.
  const fused = rrf([pos(bm25.filter((r) => r.score > 0)), pos(dense)])
  return fused.map((f) => ({ id: ids[f.index]!, score: f.score }))
}

export interface PipelineResult {
  bm25: Ranked[]
  dense: Ranked[] | null
  hybrid: Ranked[] | null
  /** Ranking of the chosen retriever (before reranking). */
  retrieved: Ranked[]
  /** Reranked candidates, when reranking is on and scores exist. */
  reranked: Ranked[] | null
  /** Passages that reach the prompt. */
  context: Ranked[]
  excluded: string[]
}

export function runPipeline(
  index: Index,
  query: string,
  qv: Float32Array | null,
  opts: PipelineOptions,
  rerankScores: Record<string, number> | null,
): PipelineResult {
  const allowed = new Set(index.passages.filter((p) => !opts.onlyCurrent || !p.outdated).map((p) => p.id))
  const excluded = index.passages.filter((p) => !allowed.has(p.id)).map((p) => p.id)
  const keep = (list: Ranked[]) => list.filter((r) => allowed.has(r.id))

  const bm25 = keep(rankBm25(index, query))
  const dense = qv ? keep(rankDense(index, qv)) : null
  const hybrid = dense ? rankHybrid(bm25, dense) : null
  const retrieved = (opts.retriever === 'bm25' ? bm25 : opts.retriever === 'dense' ? dense : hybrid) ?? bm25

  let reranked: Ranked[] | null = null
  let context: Ranked[]
  if (opts.rerank && rerankScores) {
    reranked = retrieved
      .slice(0, opts.candidates)
      .map((r) => ({ id: r.id, score: rerankScores[r.id] ?? 0 }))
      .sort((a, b) => b.score - a.score)
    context = reranked.filter((r) => r.score >= opts.threshold).slice(0, opts.k)
  } else {
    context = retrieved.filter((r) => opts.retriever !== 'bm25' || r.score > 0).slice(0, opts.k)
  }
  return { bm25, dense, hybrid, retrieved, reranked, context, excluded }
}

/** 1-based rank of the first gold passage in a ranking, or null. */
export function goldRank(ranking: Ranked[], gold: readonly string[]): number | null {
  const i = ranking.findIndex((r) => gold.includes(r.id))
  return i < 0 ? null : i + 1
}

export interface Metrics {
  /** Share of answerable questions whose answer reaches the prompt. */
  recall: number
  /** Mean reciprocal rank of the first correct passage (within the top 10). */
  mrr: number
  /** Share of unanswerable questions that end with an empty context. */
  abstention: number | null
}

export function evaluate(
  index: Index,
  questions: readonly RagQuestion[],
  vectorOf: (q: RagQuestion) => Float32Array | null,
  rerankOf: (qi: number) => Record<string, number> | null,
  opts: PipelineOptions,
): Metrics {
  let hits = 0
  let rr = 0
  let answerable = 0
  let abstained = 0
  let unanswerable = 0
  questions.forEach((q, qi) => {
    const r = runPipeline(index, q.q, vectorOf(q), opts, rerankOf(qi))
    if (!q.gold.length) {
      unanswerable++
      if (!r.context.length) abstained++
      return
    }
    answerable++
    if (r.context.some((c) => q.gold.includes(c.id))) hits++
    const ranking = (r.reranked ?? r.retrieved).slice(0, 10)
    const rank = goldRank(ranking, q.gold)
    if (rank) rr += 1 / rank
  })
  return {
    recall: answerable ? hits / answerable : 0,
    mrr: answerable ? rr / answerable : 0,
    abstention: unanswerable ? abstained / unanswerable : null,
  }
}

export const passageById = (id: string) => PASSAGES.find((p) => p.id === id)!

/** The prompt the model would receive: instructions, numbered sources, question. */
export function buildPrompt(question: string, context: Ranked[]): string {
  const sources = context.map((c, i) => {
    const p = passageById(c.id)
    return `[${i + 1}] ${p.title} (actualizado ${p.updated})\n${p.text}`
  })
  return [
    'Responde a la pregunta usando solo las fuentes. Cita las fuentes con [n]. Si las fuentes no contienen la respuesta, di que no lo sabes.',
    '',
    '<fuentes>',
    sources.length ? sources.join('\n\n') : '(ninguna fuente supera el umbral de relevancia)',
    '</fuentes>',
    '',
    `Pregunta: ${question}`,
  ].join('\n')
}
