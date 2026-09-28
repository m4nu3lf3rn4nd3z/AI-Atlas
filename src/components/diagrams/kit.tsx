import type { ReactNode, SVGProps } from 'react'

/* Tiny SVG vocabulary shared by the hand-drawn diagrams. Colours come
   from CSS variables so every diagram follows the light/dark theme. */

export function Svg({ children, ...props }: SVGProps<SVGSVGElement> & { children: ReactNode }) {
  return (
    <svg
      role="img"
      className="mx-auto block h-auto w-full min-w-[520px]"
      style={{ fontFamily: 'var(--font-sans)' }}
      {...props}
    >
      {children}
    </svg>
  )
}

export function Box({
  x,
  y,
  w,
  h,
  label,
  sub,
  color,
  strong,
}: {
  x: number
  y: number
  w: number
  h: number
  label: string
  sub?: string
  color?: string
  strong?: boolean
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={10}
        style={{
          fill: color ? `color-mix(in oklab, ${color} ${strong ? 18 : 8}%, var(--surface))` : 'var(--surface-2)',
          stroke: color ? `color-mix(in oklab, ${color} ${strong ? 80 : 45}%, transparent)` : 'var(--border-strong)',
        }}
      />
      <text
        x={x + w / 2}
        y={y + h / 2 + (sub ? -3 : 4)}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={600}
        style={{ fill: 'var(--fg)' }}
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + w / 2}
          y={y + h / 2 + 13}
          textAnchor="middle"
          fontSize={10.5}
          style={{ fill: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}
        >
          {sub}
        </text>
      )}
    </g>
  )
}

export function Arrow({
  x1,
  y1,
  x2,
  y2,
  dashed,
  color = 'var(--fg-subtle)',
  curve = 0,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  dashed?: boolean
  color?: string
  curve?: number
}) {
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 + curve
  const d = curve ? `M${x1},${y1} Q${mx},${my} ${x2},${y2}` : `M${x1},${y1} L${x2},${y2}`
  return (
    <path
      d={d}
      fill="none"
      strokeWidth={1.5}
      strokeDasharray={dashed ? '4 4' : undefined}
      markerEnd="url(#dg-arrow)"
      style={{ stroke: color }}
    />
  )
}

export function ArrowDefs() {
  return (
    <defs>
      <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 1 L9 5 L0 9z" style={{ fill: 'var(--fg-subtle)' }} />
      </marker>
    </defs>
  )
}

export function Label({
  x,
  y,
  children,
  anchor = 'middle',
  size = 11,
  mono,
  color = 'var(--fg-muted)',
  weight,
}: {
  x: number
  y: number
  children: ReactNode
  anchor?: 'start' | 'middle' | 'end'
  size?: number
  mono?: boolean
  color?: string
  weight?: number
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      style={{ fill: color, fontFamily: mono ? 'var(--font-mono)' : undefined }}
    >
      {children}
    </text>
  )
}
