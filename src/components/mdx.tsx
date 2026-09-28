import { Lightbulb, Info, TriangleAlert, Scale } from 'lucide-react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'
import { Link } from 'react-router'
import { Tooltip } from '@/components/ui/primitives'
import { getConcept } from '@/content'
import { GLOSSARY_BY_ID } from '@/content/glossary'
import { LAYER_BY_ID } from '@/content/layers'
import { cn } from '@/lib/cn'
import { CodeBlock } from './CodeBlock'
import { DIAGRAMS } from './diagrams'

/* Components available inside every theory.mdx without importing them. */

const CALLOUTS = {
  insight: { icon: Lightbulb, label: 'Intuición', color: 'var(--l4)' },
  note: { icon: Info, label: 'Nota', color: 'var(--l1)' },
  warning: { icon: TriangleAlert, label: 'Cuidado', color: 'var(--bad)' },
  tradeoff: { icon: Scale, label: 'Trade-off', color: 'var(--l3)' },
} as const

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof CALLOUTS
  title?: string
  children: ReactNode
}) {
  const c = CALLOUTS[type]
  const Icon = c.icon
  return (
    <aside
      className="not-prose my-5 rounded-xl border px-4 py-3 text-[14px] leading-relaxed"
      style={{
        borderColor: `color-mix(in oklab, ${c.color} 30%, transparent)`,
        background: `color-mix(in oklab, ${c.color} 6%, transparent)`,
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold" style={{ color: c.color }}>
        <Icon className="size-3.5" />
        {title ?? c.label}
      </div>
      <div className="text-fg/90 [&>p+p]:mt-2">{children}</div>
    </aside>
  )
}

/** Inline glossary term with a hover definition. */
export function Term({ id, children }: { id: string; children?: ReactNode }) {
  const g = GLOSSARY_BY_ID.get(id)
  if (!g) return <>{children}</>
  return (
    <Tooltip
      content={
        <span>
          <b className="text-fg">{g.term}</b>
          <br />
          <span className="text-muted">{g.definition}</span>
        </span>
      }
    >
      <span className="cursor-help underline decoration-dotted decoration-subtle underline-offset-[3px]">
        {children ?? g.term}
      </span>
    </Tooltip>
  )
}

/** Inline link to another concept, coloured by its layer. */
export function Concept({ id, children }: { id: string; children?: ReactNode }) {
  const c = getConcept(id)
  if (!c) return <>{children}</>
  return (
    <Link
      to={`/c/${id}`}
      className="font-medium !no-underline"
      style={{ color: LAYER_BY_ID[c.layer].color }}
    >
      {children ?? c.title}
    </Link>
  )
}

/** Numbered, compact step list for mechanisms. */
export function Steps({ children }: { children: ReactNode }) {
  return <div className="atlas-steps my-5 space-y-3 [counter-reset:step]">{children}</div>
}

export function Step({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="relative rounded-xl border border-border bg-surface px-4 py-3 pl-12 [counter-increment:step] before:absolute before:top-3 before:left-4 before:flex before:size-5 before:items-center before:justify-center before:rounded-full before:bg-surface-3 before:font-mono before:text-[11px] before:text-muted before:content-[counter(step)]">
      <div className="text-[13.5px] font-semibold">{title}</div>
      <div className="mt-1 text-[13.5px] leading-relaxed text-muted [&_code]:text-fg">{children}</div>
    </div>
  )
}

export function Figure({ caption, children, className }: { caption?: string; children: ReactNode; className?: string }) {
  return (
    <figure className={cn('not-prose my-6', className)}>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-4">{children}</div>
      {caption && <figcaption className="mt-2 text-center text-[12px] text-subtle">{caption}</figcaption>}
    </figure>
  )
}

/** `<Diagram name="attention" />` renders one of the hand-drawn SVG diagrams. */
export function Diagram({ name, caption }: { name: keyof typeof DIAGRAMS; caption?: string }) {
  const D = DIAGRAMS[name]
  return (
    <Figure caption={caption}>
      <D />
    </Figure>
  )
}

/** Fenced code blocks in MDX render through the shared CodeBlock. */
export function Pre(props: ComponentProps<'pre'>) {
  const child = props.children
  if (isValidElement(child)) {
    const el = child as ReactElement<{ className?: string; children?: ReactNode }>
    const lang = el.props.className?.replace('language-', '')
    return <CodeBlock code={String(el.props.children ?? '')} lang={lang} className="my-5" />
  }
  return <pre {...props} />
}
