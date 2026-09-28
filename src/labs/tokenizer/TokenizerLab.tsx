import { ArrowLeftRight, Hash, Type } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { TokenChips } from '@/components/widgets/TokenChips'
import { SectionLabel } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { ENCODINGS, loadTokenizer, toPieces, type EncodingName, type Tokenizer } from '@/lib/tokenizers'
import { PRESETS, textStats, tokenCost } from './logic'

type Loaded = Partial<Record<EncodingName, Tokenizer>>

function useTokenizers(): Loaded {
  const [loaded, setLoaded] = useState<Loaded>({})
  useEffect(() => {
    let alive = true
    for (const name of Object.keys(ENCODINGS) as EncodingName[]) {
      loadTokenizer(name).then((t) => alive && setLoaded((l) => ({ ...l, [name]: t })))
    }
    return () => {
      alive = false
    }
  }, [])
  return loaded
}

export default function TokenizerLab() {
  const tokenizers = useTokenizers()
  const [text, setText] = useState<string>(PRESETS[0].text)
  const [encoding, setEncoding] = useState<EncodingName>('o200k_base')
  const [showIds, setShowIds] = useState(false)
  const [price, setPrice] = useState(3)
  const tok = tokenizers[encoding]

  const result = useMemo(() => (tok ? toPieces(tok, text) : null), [tok, text])
  const stats = textStats(text, result?.count ?? 0)
  const otherName: EncodingName = encoding === 'o200k_base' ? 'cl100k_base' : 'o200k_base'
  const otherCount = useMemo(
    () => tokenizers[otherName]?.encode(text).length,
    [tokenizers, otherName, text],
  )

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-surface">
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2.5">
          <div className="flex rounded-lg border border-border p-0.5">
            {(Object.keys(ENCODINGS) as EncodingName[]).map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setEncoding(name)}
                title={`Usado por: ${ENCODINGS[name].models}`}
                className={cn(
                  'cursor-pointer rounded-md px-2.5 py-1 font-mono text-[12px]',
                  encoding === name ? 'bg-surface-3 text-fg' : 'text-muted hover:text-fg',
                )}
              >
                {ENCODINGS[name].label}
              </button>
            ))}
          </div>
          <span className="text-[11.5px] text-subtle">{ENCODINGS[encoding].models}</span>
          <button
            type="button"
            onClick={() => setShowIds(!showIds)}
            className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-muted hover:bg-surface-2 hover:text-fg"
          >
            {showIds ? <Type className="size-3.5" /> : <Hash className="size-3.5" />}
            {showIds ? 'Ver texto' : 'Ver IDs'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setText(p.text)}
              className={cn(
                'cursor-pointer rounded-md border px-2 py-0.5 text-[12px] transition-colors',
                text === p.text ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          spellCheck={false}
          className="block w-full resize-y bg-transparent px-4 py-3 font-mono text-[13.5px] leading-relaxed outline-none"
          aria-label="Texto a tokenizar"
        />

        <div className="min-h-16 border-t border-border px-4 py-4">
          {result ? (
            <TokenChips pieces={result.pieces} showIds={showIds} />
          ) : (
            <span className="text-[12.5px] text-subtle">Cargando vocabulario…</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Tokens" value={result ? String(stats.tokens) : '…'} strong />
        <Stat label="Caracteres" value={String(stats.chars)} />
        <Stat label="Caracteres / token" value={stats.charsPerToken ? stats.charsPerToken.toFixed(2) : '–'} />
        <Stat
          label={`Con ${ENCODINGS[otherName].label}`}
          value={otherCount === undefined ? '…' : `${otherCount} tokens`}
        />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <SectionLabel>Coste de entrada</SectionLabel>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[13.5px]">
          <label className="flex items-center gap-2 text-muted">
            Precio
            <input
              type="number"
              min={0}
              step={0.05}
              value={price}
              onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
              className="h-8 w-20 rounded-md border border-border bg-bg px-2 font-mono text-[13px] outline-none focus:border-accent"
            />
            $ / millón de tokens
          </label>
          <span className="text-muted">
            → este texto: <b className="font-mono text-fg">${tokenCost(stats.tokens, price).toFixed(6)}</b> · un
            millón de veces: <b className="font-mono text-fg">${tokenCost(stats.tokens * 1_000_000, price).toFixed(0)}</b>
          </span>
        </div>
        <p className="mt-2 text-[12px] text-subtle">
          El precio es editable: cambia según modelo y proveedor. La salida suele costar varias veces más que la
          entrada.
        </p>
      </div>

      <LanguageCompare tok={tok} />
    </div>
  )
}

function LanguageCompare({ tok }: { tok?: Tokenizer }) {
  const [a, setA] = useState<string>(PRESETS[0].text)
  const [b, setB] = useState<string>(PRESETS[1].text)
  const ca = tok?.encode(a).length ?? 0
  const cb = tok?.encode(b).length ?? 0
  const ratio = cb ? ca / cb : 0

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <SectionLabel className="flex items-center gap-2">
        <ArrowLeftRight className="size-3.5" /> Mismo significado, distinto número de tokens
      </SectionLabel>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {[
          [a, setA, ca],
          [b, setB, cb],
        ].map(([value, set, count], i) => (
          <label key={i} className="block">
            <textarea
              value={value as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
              rows={3}
              className="block w-full resize-none rounded-lg border border-border bg-bg px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-accent"
            />
            <span className="mt-1 block text-right font-mono text-[12px] text-muted">{count as number} tokens</span>
          </label>
        ))}
      </div>
      {ratio > 0 && (
        <p className="mt-2 text-[13.5px] text-muted">
          El texto de la izquierda usa <b className="font-mono text-fg">{ratio.toFixed(2)}×</b> los tokens del
          de la derecha. Los tokenizadores se entrenan con corpus mayoritariamente en inglés: en otros idiomas
          el mismo contenido cuesta más, ocupa más contexto y tarda más en generarse.
        </p>
      )}
    </div>
  )
}

function Stat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <div className="text-[11px] text-subtle">{label}</div>
      <div className={cn('mt-0.5 font-mono tabular-nums', strong ? 'text-xl font-semibold text-fg' : 'text-[15px] text-fg')}>
        {value}
      </div>
    </div>
  )
}
