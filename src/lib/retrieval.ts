/* Retrieval building blocks shared by the chunking and RAG labs:
   lexical search (BM25), rank fusion (RRF) and vector similarity. */

const STOPWORDS = new Set(
  (
    'a al algo algun alguna algunas algunos ante antes aqui asi aun cada como con contra cual cuales cuando cuanto cuantos cuantas de del desde ' +
    'donde durante e el ella ellas ello ellos en entre era eran es esa esas ese eso esos esta estan estas este esto estos fue fueron ha han hasta hay ' +
    'la las le les lo los mas me mi mis mucho muy ni no nos o os otra otras otro otros para pero poco por porque puede pueden que quien se sea ser si ' +
    'sin sobre son su sus tambien te tiene tienen tu tus un una uno unos unas y ya yo ' +
    'the of and to in is are for on with as by an be it this that from or at'
  ).split(' '),
)

/** Lowercase and strip accents, so «Vacación» and «vacacion» match. */
export const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/** Very light Spanish plural stripping, applied equally to queries and documents. */
function stem(w: string): string {
  if (w.length > 4 && /[rnldzsj]es$/.test(w)) return w.slice(0, -2)
  if (w.length > 3 && w.endsWith('s')) return w.slice(0, -1)
  return w
}

/** Search terms of a text: normalized words without stopwords, lightly stemmed. */
export function terms(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w))
    .map(stem)
}

export interface Hit {
  index: number
  score: number
  /** Query terms found in the document. */
  matched: string[]
}

/** Okapi BM25 over a small in-memory collection. */
export class Bm25 {
  private readonly docs: string[][]
  private readonly tf: Map<string, number>[]
  private readonly df = new Map<string, number>()
  private readonly avgdl: number

  constructor(
    texts: readonly string[],
    private readonly k1 = 1.2,
    private readonly b = 0.75,
  ) {
    this.docs = texts.map(terms)
    this.tf = this.docs.map((d) => {
      const m = new Map<string, number>()
      for (const t of d) m.set(t, (m.get(t) ?? 0) + 1)
      for (const t of m.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1)
      return m
    })
    this.avgdl = this.docs.reduce((s, d) => s + d.length, 0) / Math.max(1, this.docs.length)
  }

  idf(term: string): number {
    const n = this.docs.length
    const df = this.df.get(term) ?? 0
    return Math.log(1 + (n - df + 0.5) / (df + 0.5))
  }

  score(query: string, index: number): Hit {
    const tf = this.tf[index]!
    const dl = this.docs[index]!.length
    let score = 0
    const matched: string[] = []
    for (const t of new Set(terms(query))) {
      const f = tf.get(t) ?? 0
      if (!f) continue
      matched.push(t)
      score += (this.idf(t) * f * (this.k1 + 1)) / (f + this.k1 * (1 - this.b + (this.b * dl) / this.avgdl))
    }
    return { index, score, matched }
  }

  search(query: string, k = this.docs.length): Hit[] {
    return this.docs
      .map((_, i) => this.score(query, i))
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, k)
  }
}

/**
 * Reciprocal Rank Fusion: score(d) = Σ 1 / (k + rank(d)), rank starting at 1.
 * Merges rankings from different retrievers without calibrating their scores.
 */
export function rrf(rankings: readonly (readonly number[])[], k = 60): { index: number; score: number }[] {
  const scores = new Map<number, number>()
  for (const ranking of rankings) {
    ranking.forEach((index, i) => scores.set(index, (scores.get(index) ?? 0) + 1 / (k + i + 1)))
  }
  return [...scores].map(([index, score]) => ({ index, score })).sort((a, b) => b.score - a.score || a.index - b.index)
}

export function dot(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i]! * b[i]!
  return s
}

export function cosine(a: ArrayLike<number>, b: ArrayLike<number>): number {
  const d = Math.sqrt(dot(a, a) * dot(b, b))
  return d ? dot(a, b) / d : 0
}
