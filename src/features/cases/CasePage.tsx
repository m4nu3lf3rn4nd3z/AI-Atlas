import { ArrowLeft, Check, CircleAlert, Gauge, Layers, Lightbulb } from 'lucide-react'
import { useEffect, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import NotFound from '@/app/NotFound'
import { ToolChip } from '@/components/ToolChip'
import { Badge, SectionLabel } from '@/components/ui/primitives'
import { CASE_BY_ID } from '@/cases'
import { BLOCKS } from '@/cases/blocks'
import { CaseLab } from '@/cases/CaseLab'
import { getConcept } from '@/content'
import { LAYER_BY_ID, LEVEL_LABELS } from '@/content/layers'
import { TOOL_BY_ID } from '@/content/tools'
import { caseStatusOf, EXPLORED_CONFIGS, useProgress } from '@/stores/progress'
import { CodeTab } from '../concept/CodeTab'

export default function CasePage() {
  const { caseId } = useParams()
  const uc = caseId ? CASE_BY_ID.get(caseId) : undefined
  const markCaseVisited = useProgress((s) => s.markCaseVisited)
  const progress = useProgress((s) => (caseId ? s.cases[caseId] : undefined))

  useEffect(() => {
    if (uc) markCaseVisited(uc.id)
  }, [uc, markCaseVisited])

  if (!uc) return <NotFound />
  const status = caseStatusOf(progress)
  const configs = progress?.configs?.length ?? 0

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Link to="/cases" className="mb-5 flex w-fit items-center gap-1 text-[12.5px] text-subtle hover:text-fg">
        <ArrowLeft className="size-3.5" /> Casos de uso
      </Link>

      <header className="max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
            <uc.icon className="size-5" />
          </span>
          <Badge>{LEVEL_LABELS[uc.level]}</Badge>
          {uc.patterns.map((p) => (
            <ToolChip key={p} id={p} />
          ))}
        </div>
        <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight">{uc.title}</h1>
        <p className="mt-2 text-[15.5px] leading-relaxed text-muted">{uc.tagline}</p>
        <p className="mt-3 font-mono text-[11px] text-subtle">
          {status === 'explored' ? (
            <span className="text-ok">
              <Check className="mr-1 inline size-3" />
              explorado con {configs} configuraciones
            </span>
          ) : (
            `Simulado con ${configs} de ${EXPLORED_CONFIGS} configuraciones para darlo por explorado`
          )}
        </p>
      </header>

      <section className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-border bg-surface p-5">
          <SectionLabel className="mb-2">El problema</SectionLabel>
          <p className="text-[14.5px] leading-relaxed">{uc.problem}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {uc.examples.map((e) => (
              <Badge key={e}>{e}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-warn/30 bg-warn/5 p-5">
          <SectionLabel className="mb-2 flex items-center gap-1.5">
            <CircleAlert className="size-3.5" /> Cuándo no hace falta
          </SectionLabel>
          <p className="text-[14px] leading-relaxed text-muted">{uc.whenNot}</p>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-wrap items-end gap-x-4 gap-y-2">
          <div>
            <SectionLabel>Laboratorio</SectionLabel>
            <h2 className="mt-1 text-xl font-semibold">Escenario: {uc.scenario.title}</h2>
          </div>
          <p className="basis-full rounded-xl border border-border bg-surface-2 px-4 py-3 text-[14px] leading-relaxed italic sm:basis-auto sm:flex-1">
            «{uc.scenario.input}»
          </p>
        </div>
        <CaseLab uc={uc} />
      </section>

      <section className="mt-12">
        <SectionLabel className="mb-3 flex items-center gap-1.5">
          <Layers className="size-3.5" /> Stacks recomendados
        </SectionLabel>
        <div className="grid gap-4 lg:grid-cols-2">
          {uc.stacks.map((s) => (
            <div key={s.name} className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-[15px] font-semibold">{s.name}</h3>
              <p className="mt-1 text-[13px] text-muted">{s.description}</p>
              <dl className="mt-4 space-y-2.5">
                {s.picks.map((p) => {
                  const comp = uc.components.find((c) => c.id === p.component)!
                  const Icon = BLOCKS[comp.kind].icon
                  return (
                    <div key={p.component} className="grid gap-1 sm:grid-cols-[160px_1fr]">
                      <dt className="flex items-center gap-1.5 text-[12.5px] text-subtle">
                        <Icon className="size-3.5" /> {comp.label}
                      </dt>
                      <dd className="flex flex-wrap items-center gap-1">
                        {p.tools.map((t) => (TOOL_BY_ID.has(t) ? <ToolChip key={t} id={t} /> : null))}
                        {p.note && <span className="text-[12px] text-subtle">· {p.note}</span>}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-4 lg:grid-cols-2">
        <div>
          <SectionLabel className="mb-3 flex items-center gap-1.5">
            <CircleAlert className="size-3.5" /> Riesgos
          </SectionLabel>
          <div className="space-y-2">
            {uc.risks.map((r) => (
              <div key={r.title} className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-[14px] font-medium">{r.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{r.text}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed">
                  <span className="text-ok">→</span> {r.mitigation}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionLabel className="mb-3 flex items-center gap-1.5">
            <Gauge className="size-3.5" /> Qué medir
          </SectionLabel>
          <div className="space-y-2">
            {uc.metrics.map((m) => (
              <div key={m.name} className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-[14px] font-medium">{m.name}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{m.why}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {uc.snippets.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <SectionLabel className="mb-3">Código</SectionLabel>
          <CodeTab snippets={uc.snippets} />
        </section>
      )}

      <section className="mt-12">
        <SectionLabel className="mb-3 flex items-center gap-1.5">
          <Lightbulb className="size-3.5" /> Conceptos del atlas que intervienen
        </SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {uc.concepts.map((id) => {
            const c = getConcept(id)
            if (!c) return null
            return (
              <Link
                key={id}
                to={`/c/${id}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1 text-[13px] hover:bg-surface-2"
                style={{ '--layer': LAYER_BY_ID[c.layer].color } as CSSProperties}
              >
                <span className="size-1.5 rounded-full bg-[var(--layer)]" />
                {c.title}
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
