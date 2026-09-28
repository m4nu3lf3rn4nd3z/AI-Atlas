import { useEffect, useState } from 'react'
import { loadTokenizer, toPieces, type TokenPiece } from '@/lib/tokenizers'
import { TokenChips } from './TokenChips'

/** Inline, real tokenizer (o200k_base) for theory pages. */
export function TokenPreview({ text: initial = 'La tokenización no es trivial' }: { text?: string }) {
  const [text, setText] = useState(initial)
  const [result, setResult] = useState<{ pieces: TokenPiece[]; count: number } | null>(null)

  useEffect(() => {
    let alive = true
    loadTokenizer('o200k_base').then((tok) => alive && setResult(toPieces(tok, text)))
    return () => {
      alive = false
    }
  }, [text])

  return (
    <div className="not-prose my-6 rounded-xl border border-border bg-surface p-4">
      <div className="mb-2 flex items-center justify-between font-mono text-[10.5px] tracking-widest text-subtle">
        <span>TOKENIZADOR REAL · o200k_base</span>
        <span>
          {result ? `${result.count} tokens · ${[...text].length} caracteres` : 'cargando…'}
        </span>
      </div>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="mb-3 h-9 w-full rounded-lg border border-border bg-bg px-3 text-[14px] outline-none focus:border-accent"
        aria-label="Texto a tokenizar"
      />
      {result && <TokenChips pieces={result.pieces} />}
    </div>
  )
}
