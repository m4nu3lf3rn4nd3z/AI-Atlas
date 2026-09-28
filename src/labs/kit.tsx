import type { ReactNode } from 'react'
import { SectionLabel } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'

/* Shared building blocks for labs: panels, fields and compact controls. */

export function Panel({
  title,
  icon,
  actions,
  children,
  className,
}: {
  title?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-surface p-4 sm:p-5', className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {title && (
            <SectionLabel className="flex items-center gap-2 [&_svg]:size-3.5">
              {icon}
              {title}
            </SectionLabel>
          )}
          {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export function Field({ label, hint, children, className }: { label: ReactNode; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium">{label}</span>
        {hint && <span className="font-mono text-[12px] text-muted tabular-nums">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

export interface Option<T> {
  value: T
  label: ReactNode
  title?: string
}

export function Segmented<T extends string | number>({
  value,
  options,
  onChange,
  label,
  wrap = true,
}: {
  value: T
  options: readonly Option<T>[]
  onChange: (v: T) => void
  label: string
  wrap?: boolean
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('flex gap-1', wrap ? 'flex-wrap' : 'overflow-x-auto')}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={cn(
            'h-8 shrink-0 cursor-pointer rounded-lg border px-2.5 font-mono text-[12px] transition-colors',
            value === o.value ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:border-border-strong hover:text-fg',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Select<T extends string>({
  value,
  onChange,
  groups,
  label,
}: {
  value: T
  onChange: (v: T) => void
  groups: readonly { label: string; options: readonly Option<T>[] }[]
  label: string
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="h-9 w-full cursor-pointer rounded-lg border border-border bg-bg px-2.5 text-[13.5px] outline-none focus:border-accent"
    >
      {groups.map((g) => (
        <optgroup key={g.label} label={g.label}>
          {g.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  )
}

export function Range({
  value,
  min,
  max,
  step = 1,
  onChange,
  label,
}: {
  value: number
  min: number
  max: number
  step?: number
  onChange: (v: number) => void
  label: string
}) {
  return (
    <input
      type="range"
      aria-label={label}
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 w-full cursor-pointer accent-[var(--accent)]"
    />
  )
}

export function Stat({
  label,
  value,
  sub,
  strong,
}: {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  strong?: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2.5">
      <div className="text-[11.5px] text-subtle">{label}</div>
      <div className={cn('mt-0.5 font-mono tabular-nums', strong ? 'text-xl font-semibold' : 'text-[15px]')}>{value}</div>
      {sub && <div className="mt-0.5 text-[11.5px] text-subtle">{sub}</div>}
    </div>
  )
}

/** Swatch + label, for chart legends. */
export function LegendItem({ color, children, dashed }: { color: string; children: ReactNode; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-muted">
      {dashed ? (
        <span className="h-0 w-4 border-t-2 border-dashed" style={{ borderColor: color }} />
      ) : (
        <span className="size-2.5 rounded-[3px]" style={{ background: color }} />
      )}
      {children}
    </span>
  )
}
