import { LEVEL_LABELS } from '@/content/layers'
import { cn } from '@/lib/cn'

export function LevelBars({ level }: { level: 1 | 2 | 3 }) {
  return (
    <span className="flex items-end gap-[2px]" aria-label={`Nivel ${LEVEL_LABELS[level]}`}>
      {[1, 2, 3].map((l) => (
        <span
          key={l}
          className={cn('w-[3px] rounded-full', l <= level ? 'bg-muted' : 'bg-border-strong')}
          style={{ height: 3 + l * 2 }}
        />
      ))}
    </span>
  )
}
