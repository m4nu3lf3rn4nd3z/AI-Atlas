import { Bm25 } from '@/lib/retrieval'

/* Chunking strategies. Every chunk is a [start, end) range of the original
   text, so the UI can highlight it and overlaps are explicit. Sizes are in
   tokens, measured with whatever `count` function the caller provides. */

export type Count = (text: string) => number

export interface Chunk {
  start: number
  end: number
  text: string
  tokens: number
  /** Heading path, prepended when indexing (structure-aware chunking). */
  header?: string
}

export type StrategyId = 'fixed' | 'recursive' | 'sentences' | 'markdown'

export interface Strategy {
  id: StrategyId
  label: string
  short: string
  how: string
}

export const STRATEGIES: readonly Strategy[] = [
  {
    id: 'fixed',
    label: 'Tamaño fijo',
    short: 'Corta cada N tokens, sin mirar el contenido.',
    how: 'Recorre el texto palabra a palabra y cierra el fragmento al llegar al tamaño. Es lo más simple y predecible, pero corta frases, listas y bloques de código por la mitad.',
  },
  {
    id: 'recursive',
    label: 'Recursivo',
    short: 'Prueba separadores de mayor a menor: párrafo, línea, frase, palabra.',
    how: 'Divide por párrafos; si un trozo sigue siendo demasiado grande, lo divide por líneas, luego por frases y por último por palabras. Después junta trozos consecutivos hasta llenar el tamaño. Es el RecursiveCharacterTextSplitter de LangChain y el punto de partida más habitual.',
  },
  {
    id: 'sentences',
    label: 'Por frases',
    short: 'Agrupa frases completas hasta llenar el tamaño.',
    how: 'Segmenta el texto en frases (Intl.Segmenter) y las agrupa sin partir ninguna. El solape repite frases enteras. Una frase más larga que el tamaño se queda sola en un fragmento.',
  },
  {
    id: 'markdown',
    label: 'Por estructura',
    short: 'Corta por encabezados y añade la ruta de títulos a cada fragmento.',
    how: 'Cada sección del documento (según sus encabezados Markdown) es una unidad; si no cabe, se divide de forma recursiva dentro de la sección. Cada fragmento lleva la ruta de títulos («Política › 3. Días no disfrutados»), que se indexa con él y le da contexto.',
  },
]

interface Unit {
  start: number
  end: number
  tokens: number
}

function memoCount(text: string, count: Count) {
  const cache = new Map<string, number>()
  return (start: number, end: number) => {
    const key = `${start}:${end}`
    let n = cache.get(key)
    if (n === undefined) {
      n = count(text.slice(start, end))
      cache.set(key, n)
    }
    return n
  }
}

/** Words with their trailing whitespace; together they cover the text after any leading whitespace. */
function wordRanges(text: string, start = 0, end = text.length): [number, number][] {
  const out: [number, number][] = []
  const re = /\S+\s*/g
  re.lastIndex = start
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) && m.index < end) out.push([m.index, Math.min(end, m.index + m[0].length)])
  return out
}

/**
 * Greedily packs consecutive units into chunks of at most `size` tokens.
 * A unit larger than `size` becomes a chunk on its own. Each new chunk
 * starts with the trailing units of the previous one, up to `overlap` tokens.
 */
function pack(units: Unit[], size: number, overlap: number): [number, number][] {
  const out: [number, number][] = []
  let i = 0
  while (i < units.length) {
    let j = i
    let t = 0
    while (j < units.length && (j === i || t + units[j]!.tokens <= size)) t += units[j++]!.tokens
    out.push([units[i]!.start, units[j - 1]!.end])
    if (j >= units.length) break
    let back = j
    let o = 0
    while (back > i + 1 && o + units[back - 1]!.tokens <= overlap) o += units[--back]!.tokens
    i = back
  }
  return out
}

const SEPARATORS = ['\n\n', '\n', '. ', ' '] as const

/** Recursively splits [start, end) until every piece fits in `size` tokens. */
function recursivePieces(text: string, start: number, end: number, size: number, tokens: (a: number, b: number) => number, seps: readonly string[] = SEPARATORS): [number, number][] {
  if (tokens(start, end) <= size) return [[start, end]]
  const [sep, ...rest] = seps
  if (sep === undefined) return wordRanges(text, start, end)
  const pieces: [number, number][] = []
  let pos = start
  while (pos < end) {
    const k = text.indexOf(sep, pos)
    if (k === -1 || k + sep.length >= end) {
      pieces.push([pos, end])
      break
    }
    pieces.push([pos, k + sep.length])
    pos = k + sep.length
  }
  if (pieces.length === 1) return recursivePieces(text, start, end, size, tokens, rest)
  return pieces.flatMap(([a, b]) => (tokens(a, b) <= size ? [[a, b] as [number, number]] : recursivePieces(text, a, b, size, tokens, rest)))
}

function sentenceRanges(text: string, start = 0, end = text.length): [number, number][] {
  const seg = new Intl.Segmenter('es', { granularity: 'sentence' })
  const out: [number, number][] = []
  for (const s of seg.segment(text.slice(start, end))) {
    if (s.segment.trim()) out.push([start + s.index, start + s.index + s.segment.length])
  }
  return out
}

interface Section {
  start: number
  end: number
  path: string[]
}

/** Sections delimited by Markdown headings (ignoring `#` inside code fences). */
export function sections(text: string): Section[] {
  const heads: { at: number; level: number; title: string }[] = []
  let inFence = false
  let pos = 0
  for (const line of text.split('\n')) {
    if (line.startsWith('```')) inFence = !inFence
    const m = !inFence && /^(#{1,6})\s+(.+)$/.exec(line)
    if (m) heads.push({ at: pos, level: m[1]!.length, title: m[2]!.trim() })
    pos += line.length + 1
  }
  if (!heads.length || heads[0]!.at > 0) heads.unshift({ at: 0, level: 0, title: '' })
  const stack: { level: number; title: string }[] = []
  return heads.map((h, i) => {
    while (stack.length && stack.at(-1)!.level >= h.level) stack.pop()
    if (h.title) stack.push({ level: h.level, title: h.title })
    return { start: h.at, end: i + 1 < heads.length ? heads[i + 1]!.at : text.length, path: stack.map((s) => s.title) }
  }).filter((s) => text.slice(s.start, s.end).trim())
}

export function chunkText(text: string, strategy: StrategyId, size: number, overlap: number, count: Count): Chunk[] {
  const tokens = memoCount(text, count)
  /* Whitespace is moved to the start of the following unit, the way BPE
     pre-tokenizers attach a space to the next word. Counting units that
     end in whitespace separately would overestimate the total. */
  const toUnits = (ranges: [number, number][]): Unit[] => {
    const units: Unit[] = []
    let from = ranges[0]?.[0] ?? 0
    for (const [s, e] of ranges) {
      let end = e
      while (end > s && /\s/.test(text[end - 1]!)) end--
      if (end === s) continue
      units.push({ start: from, end, tokens: tokens(from, end) })
      from = end
    }
    return units
  }
  const build = (ranges: [number, number][], header?: string): Chunk[] =>
    ranges.map(([start, end]) => {
      const t = text.slice(start, end)
      return { start, end, text: t, tokens: count(t), header }
    })

  switch (strategy) {
    case 'fixed':
      return build(pack(toUnits(wordRanges(text)), size, overlap))
    case 'recursive':
      return build(pack(toUnits(recursivePieces(text, 0, text.length, size, tokens)), size, overlap))
    case 'sentences':
      return build(pack(toUnits(sentenceRanges(text)), size, overlap))
    case 'markdown':
      return sections(text).flatMap((s) =>
        build(pack(toUnits(recursivePieces(text, s.start, s.end, size, tokens)), size, overlap), s.path.join(' › ') || undefined),
      )
  }
}

export interface ChunkFlags {
  /** Ends in the middle of a sentence. */
  cut: boolean
  /** Much smaller than the target size: little context on its own. */
  tiny: boolean
  /** Larger than the target size (a unit that could not be split further). */
  over: boolean
}

export function flagsOf(chunk: Chunk, full: string, size: number, total: number): ChunkFlags {
  const body = chunk.text.trimEnd()
  const atEnd = chunk.start + body.length >= full.trimEnd().length
  const endsLine = /\n\s*$/.test(chunk.text) || full[chunk.start + body.length] === '\n'
  // A closing quote or bracket only ends a sentence if a full stop comes right before it.
  const tail = body.replace(/[»"'”’)\]}`*]+$/, '')
  const cut = !atEnd && !endsLine && !/[.!?…:;]$/.test(tail)
  return { cut, tiny: total > 1 && chunk.tokens < size * 0.25, over: chunk.tokens > size * 1.05 }
}

export type Coverage = 'full' | 'partial' | 'none'

export function coverage(chunk: { start: number; end: number }, span: [number, number]): Coverage {
  if (chunk.start <= span[0] && chunk.end >= span[1]) return 'full'
  if (chunk.start < span[1] && chunk.end > span[0]) return 'partial'
  return 'none'
}

export function answerSpan(text: string, answer: string): [number, number] {
  const i = text.indexOf(answer)
  if (i < 0) throw new Error(`Respuesta no encontrada en el documento: ${answer.slice(0, 40)}…`)
  return [i, i + answer.length]
}

/** The text actually indexed for a chunk: heading path + body. */
export const indexedText = (c: Chunk) => (c.header ? `${c.header}\n${c.text}` : c.text)

export interface RetrievalResult {
  /** Index of the top BM25 chunk. */
  top: number
  score: number
  matched: string[]
  coverage: Coverage
  /** Does any chunk contain the whole answer? */
  anyFull: boolean
  /** The chunk that holds the answer (whole if possible, else the largest part). */
  answerChunk: number
}

export function retrieve(chunks: Chunk[], question: string, span: [number, number]): RetrievalResult {
  const bm25 = new Bm25(chunks.map(indexedText))
  const [hit] = bm25.search(question, 1)
  const top = hit?.index ?? 0
  const overlapWith = (c: Chunk) => Math.max(0, Math.min(c.end, span[1]) - Math.max(c.start, span[0]))
  const answerChunk = chunks.reduce((best, c, i) => (overlapWith(c) > overlapWith(chunks[best]!) ? i : best), 0)
  return {
    top,
    score: hit?.score ?? 0,
    matched: hit?.matched ?? [],
    coverage: chunks[top] ? coverage(chunks[top], span) : 'none',
    anyFull: chunks.some((c) => coverage(c, span) === 'full'),
    answerChunk,
  }
}

export interface Summary {
  chunks: number
  avg: number
  min: number
  max: number
  cutPct: number
  /** Extra tokens indexed because of overlap and headers, as a share of the document. */
  overheadPct: number
}

export function summarize(chunks: Chunk[], full: string, size: number, count: Count): Summary {
  const sizes = chunks.map((c) => c.tokens)
  const indexed = chunks.reduce((s, c) => s + c.tokens + (c.header ? count(c.header) : 0), 0)
  const doc = count(full)
  const cuts = chunks.filter((c) => flagsOf(c, full, size, chunks.length).cut).length
  return {
    chunks: chunks.length,
    avg: sizes.reduce((a, b) => a + b, 0) / Math.max(1, sizes.length),
    min: Math.min(...sizes),
    max: Math.max(...sizes),
    cutPct: chunks.length ? (cuts / chunks.length) * 100 : 0,
    overheadPct: doc ? Math.max(0, (indexed / doc - 1) * 100) : 0,
  }
}
