import { Activity, ArrowRight, Check, Wrench } from 'lucide-react'
import { Link } from 'react-router'
import { ToolChip } from '@/components/ToolChip'
import { Badge, Card, SectionLabel } from '@/components/ui/primitives'
import { BLOCK_KINDS, BLOCKS } from '@/cases/blocks'
import { CASES } from '@/cases'
import { LEVEL_LABELS } from '@/content/layers'
import { TOOLS } from '@/content/tools'
import { cn } from '@/lib/cn'
import { caseStatusOf, useProgress } from '@/stores/progress'

const STATUS_LABEL = { new: null, visited: 'visitado', completed: 'simulado', explored: 'explorado' } as const

export default function CasesPage() {
  const progress = useProgress((s) => s.cases)

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Casos de uso</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          Seis sistemas reales, de los que más se construyen hoy. En cada uno hay un laboratorio: eliges las
          decisiones de diseño, ejecutas el sistema paso a paso sobre un escenario concreto y ves qué pasa (y cuánto
          cuesta) cuando falta una pieza.
        </p>
      </header>

      <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {CASES.map((uc) => {
          const status = caseStatusOf(progress[uc.id])
          const tools = [...new Set(uc.components.flatMap((c) => c.tools))].slice(0, 5)
          return (
            <Link
              key={uc.id}
              to={`/cases/${uc.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
            >
              <div className="flex items-center gap-2">
                <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent">
                  <uc.icon className="size-4.5" />
                </span>
                <Badge>{LEVEL_LABELS[uc.level]}</Badge>
                {STATUS_LABEL[status] && (
                  <span className={cn('ml-auto flex items-center gap-1 font-mono text-[10.5px]', status === 'explored' ? 'text-ok' : 'text-subtle')}>
                    {status === 'explored' && <Check className="size-3" />}
                    {STATUS_LABEL[status]}
                  </span>
                )}
              </div>
              <h2 className="mt-4 text-[16px] font-semibold">{uc.title}</h2>
              <p className="mt-1.5 flex-1 text-[13.5px] leading-relaxed text-muted">{uc.tagline}</p>
              <div className="mt-4 flex flex-wrap gap-1" onClick={(e) => e.preventDefault()}>
                {tools.map((t) => (
                  <ToolChip key={t} id={t} />
                ))}
              </div>
              <span className="mt-4 flex items-center gap-1 text-[12.5px] text-subtle group-hover:text-fg">
                Abrir el laboratorio <ArrowRight className="size-3.5" />
              </span>
            </Link>
          )
        })}
      </div>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <SectionLabel>Bloques de construcción</SectionLabel>
            <h2 className="mt-1 text-xl font-semibold">Las piezas con las que se monta cualquier sistema de IA</h2>
          </div>
          <Link to="/tools" className="flex items-center gap-1.5 text-[13px] text-muted hover:text-fg">
            <Wrench className="size-4" /> Ver las {TOOLS.length} herramientas del catálogo
          </Link>
        </div>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {BLOCK_KINDS.map((k) => {
            const b = BLOCKS[k]
            return (
              <Card key={k} className="p-4">
                <div className="flex items-center gap-2">
                  <b.icon className="size-4 text-accent" />
                  <span className="text-[14px] font-medium">{b.label}</span>
                  {b.concept && (
                    <Link to={`/c/${b.concept}`} className="ml-auto text-[11.5px] text-subtle hover:text-fg">
                      concepto →
                    </Link>
                  )}
                </div>
                <p className="mt-1.5 text-[12.5px] leading-snug text-muted">{b.description}</p>
                {b.tools.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1">
                    {b.tools.slice(0, 5).map((t) => (
                      <ToolChip key={t} id={t} />
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </section>

      <Link
        to="/journey"
        className="mt-12 flex items-center gap-4 rounded-2xl border border-dashed border-border-strong p-5 hover:bg-surface"
      >
        <Activity className="size-5 text-l6" style={{ color: 'var(--l6)' }} />
        <span className="flex-1">
          <span className="block text-[14.5px] font-medium">Anatomía de una petición</span>
          <span className="block text-[13px] text-muted">
            Una pregunta recorriendo todas las capas del stack, con el mismo motor de simulación. Llega en la fase 3.
          </span>
        </span>
        <ArrowRight className="size-4 text-subtle" />
      </Link>
    </div>
  )
}
