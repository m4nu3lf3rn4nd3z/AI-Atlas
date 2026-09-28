/* Real BPE tokenizers (tiktoken-compatible), loaded on demand because
   each vocabulary weighs a few MB. */

export const ENCODINGS = {
  o200k_base: {
    label: 'o200k_base',
    models: 'GPT-4o, o-series, GPT-4.1/5',
    load: () => import('gpt-tokenizer/encoding/o200k_base'),
  },
  cl100k_base: {
    label: 'cl100k_base',
    models: 'GPT-4, GPT-3.5, text-embedding-3',
    load: () => import('gpt-tokenizer/encoding/cl100k_base'),
  },
} as const

export type EncodingName = keyof typeof ENCODINGS

export interface Tokenizer {
  encode: (text: string) => number[]
  decode: (ids: number[]) => string
  vocabularySize: number
}

const cache = new Map<EncodingName, Promise<Tokenizer>>()

export function loadTokenizer(name: EncodingName): Promise<Tokenizer> {
  let p = cache.get(name)
  if (!p) {
    p = ENCODINGS[name].load().then((m) => ({
      encode: (t: string) => m.encode(t),
      decode: (ids: number[]) => m.decode(ids),
      vocabularySize: m.vocabularySize,
    }))
    cache.set(name, p)
  }
  return p
}

/** One or more token ids that decode to a displayable string. */
export interface TokenPiece {
  ids: number[]
  text: string
}

/**
 * Split text into displayable pieces. Byte-level BPE can cut a multi-byte
 * character (an emoji, some accents) across tokens; such a token decodes
 * to U+FFFD on its own, so consecutive ids are grouped until they decode
 * cleanly. `count` is always the true number of tokens.
 */
export function toPieces(tok: Tokenizer, text: string): { pieces: TokenPiece[]; count: number } {
  const ids = tok.encode(text)
  const pieces: TokenPiece[] = []
  let pending: number[] = []
  for (const id of ids) {
    pending.push(id)
    const decoded = tok.decode(pending)
    if (!decoded.includes('�') || pending.length >= 4) {
      pieces.push({ ids: pending, text: decoded })
      pending = []
    }
  }
  if (pending.length) pieces.push({ ids: pending, text: tok.decode(pending) })
  return { pieces, count: ids.length }
}

/** Make whitespace visible inside token chips. */
export function visible(text: string): string {
  return text.replace(/ /g, '·').replace(/\n/g, '↵').replace(/\t/g, '→')
}
