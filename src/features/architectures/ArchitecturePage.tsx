import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Card, SectionLabel } from '@/components/ui/primitives'
import { getConcept } from '@/content'
import { ARCH_BY_ID, ARCH_CATEGORIES, ARCHITECTURES } from './arch-data'

export default function ArchitecturePage() {
  const { archId } = useParams<{ archId: string }>()
  const arch = archId ? ARCH_BY_ID[archId] : undefined

  if (!arch) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32">
        <p className="text-muted">Arquitectura no encontrada.</p>
        <Link to="/architectures" className="text-[13px] text-accent underline underline-offset-2">
          ← Volver a arquitecturas
        </Link>
      </div>
    )
  }

  const cat = ARCH_CATEGORIES[arch.category]
  const idx = ARCHITECTURES.findIndex((a) => a.id === arch.id)
  const prev = ARCHITECTURES[idx - 1]
  const next = ARCHITECTURES[idx + 1]
  const relatedConcepts = arch.relatedConceptIds.map(getConcept).filter(Boolean)

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
      {/* breadcrumb */}
      <Link
        to="/architectures"
        className="mb-8 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-fg"
      >
        <ArrowLeft className="size-3.5" />
        Arquitecturas
      </Link>

      {/* header */}
      <div className="mb-8">
        <span
          className="inline-block rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
          style={{
            background: `color-mix(in oklab, ${cat.color} 12%, transparent)`,
            color: cat.color,
          }}
        >
          {cat.label}
        </span>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{arch.title}</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-muted">{arch.description}</p>
      </div>

      {/* full diagram */}
      <Card className="mb-10 overflow-hidden p-0">
        <div className="border-b border-border bg-surface-2 px-6 py-2">
          <span className="font-mono text-[11px] tracking-wide text-subtle">DIAGRAMA</span>
        </div>
        <div className="px-6 py-6">
          <arch.Diagram />
        </div>
      </Card>

      {/* 2-col layout: components + use cases */}
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* components */}
        <section>
          <SectionLabel>Componentes</SectionLabel>
          <div className="mt-4 space-y-3">
            {arch.components.map((c) => (
              <div key={c.name} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-[13.5px] font-semibold">{c.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{c.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* use cases + tradeoffs */}
        <div className="space-y-8">
          <section>
            <SectionLabel>Casos de uso</SectionLabel>
            <ul className="mt-4 space-y-2">
              {arch.useCases.map((uc) => (
                <li key={uc} className="flex items-start gap-2.5 text-[13.5px] text-muted">
                  <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-accent/60" />
                  {uc}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <SectionLabel>Trade-offs</SectionLabel>
            <ul className="mt-4 space-y-2">
              {arch.tradeoffs.map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[13.5px] text-muted">
                  <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-warn/60" />
                  {t}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {/* related concepts */}
      {relatedConcepts.length > 0 && (
        <section className="mt-10">
          <SectionLabel>Conceptos relacionados en el atlas</SectionLabel>
          <div className="mt-4 flex flex-wrap gap-2">
            {relatedConcepts.map((c) => (
              <Link
                key={c!.id}
                to={`/c/${c!.id}`}
                className="rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] transition-colors hover:border-accent hover:text-accent"
              >
                {c!.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* prev / next navigation */}
      <div className="mt-12 flex justify-between gap-4 border-t border-border pt-8">
        {prev ? (
          <Link
            to={`/architectures/${prev.id}`}
            className="flex items-center gap-2 text-[13px] text-muted hover:text-fg"
          >
            <ArrowLeft className="size-4" />
            <span>
              <span className="block text-[11px] text-subtle">Anterior</span>
              {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/architectures/${next.id}`}
            className="flex items-center gap-2 text-right text-[13px] text-muted hover:text-fg"
          >
            <span>
              <span className="block text-[11px] text-subtle">Siguiente</span>
              {next.title}
            </span>
            <ArrowRight className="size-4" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
