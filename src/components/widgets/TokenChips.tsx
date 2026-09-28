import { cn } from '@/lib/cn'
import { visible, type TokenPiece } from '@/lib/tokenizers'

const HUES = ['var(--l0)', 'var(--l2)', 'var(--l4)', 'var(--l3)', 'var(--l6)', 'var(--l1)']

export function TokenChips({
  pieces,
  showIds = false,
  className,
}: {
  pieces: TokenPiece[]
  showIds?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap gap-y-1.5 font-mono text-[13px] leading-none', className)}>
      {pieces.map((p, i) => {
        const hue = HUES[i % HUES.length]
        return (
          <span
            key={i}
            title={`id ${p.ids.join(' + ')}${p.ids.length > 1 ? ` · 1 carácter repartido en ${p.ids.length} tokens` : ''}`}
            className="relative mr-[2px] inline-flex items-center rounded-[5px] px-[3px] py-[4px] whitespace-pre"
            style={{
              background: `color-mix(in oklab, ${hue} 20%, transparent)`,
              boxShadow: `inset 0 -2px 0 color-mix(in oklab, ${hue} 55%, transparent)`,
            }}
          >
            {showIds ? p.ids.join('·') : visible(p.text)}
            {p.ids.length > 1 && (
              <sup className="ml-0.5 text-[9px] text-subtle">×{p.ids.length}</sup>
            )}
          </span>
        )
      })}
    </div>
  )
}
