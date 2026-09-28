import { ArrowRight, FlaskConical } from 'lucide-react'
import { Link } from 'react-router'
import { getConcept } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'
import { LABS } from '@/labs/registry'
import { cn } from '@/lib/cn'
import { RealityBadge } from '../concept/LabTab'

export default function LabsPage() {
  const sorted = [...LABS].sort((a, b) => Number(!a.Component) - Number(!b.Component) || a.phase - b.phase)
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight">Labs</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Experimentos interactivos. Cada lab dice qué parte es cálculo real y qué parte está guionizada:
          aquí no hay animaciones que finjan ser un modelo.
        </p>
      </header>
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((lab) => {
          const concept = getConcept(lab.concept)
          const color = concept ? LAYER_BY_ID[concept.layer].color : 'var(--accent)'
          const ready = !!lab.Component
          return (
            <Link
              key={lab.id}
              to={`/labs/${lab.id}`}
              className={cn(
                'group flex flex-col rounded-2xl border bg-surface p-5 transition-colors',
                ready ? 'border-border hover:border-border-strong' : 'border-dashed border-border-strong/70',
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex size-8 items-center justify-center rounded-lg"
                  style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
                >
                  <FlaskConical className="size-4" />
                </span>
                <RealityBadge lab={lab} />
                <span className={cn('ml-auto font-mono text-[10.5px]', ready ? 'text-ok' : 'text-subtle')}>
                  {ready ? 'disponible' : `fase ${lab.phase}`}
                </span>
              </div>
              <h2 className={cn('mt-4 text-[15px] font-semibold', !ready && 'text-muted')}>{lab.title}</h2>
              <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-muted">{lab.short}</p>
              {concept && (
                <span className="mt-4 flex items-center gap-1.5 text-[12px] text-subtle">
                  <span className="size-1.5 rounded-full" style={{ background: color }} />
                  {concept.title}
                  <ArrowRight className="ml-auto size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
