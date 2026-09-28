import { ExternalLink, ShieldAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Card, SectionLabel } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { ATTACKS } from '@/security/attacks'
import { CHECKLIST_ITEMS } from '@/security/checklist'
import { FRAMEWORKS, INCIDENTS, PATTERNS, PATTERNS_SOURCE, PRINCIPLES, REDTEAM_TOOLS, THREAT_MODEL_STEPS } from '@/security/meta'
import { SURFACES } from '@/security/surfaces'
import { OWASP_LLM } from '@/security/types'
import { AttackCatalog } from './AttackCatalog'
import { ReviewChecklist } from './ReviewChecklist'
import { SurfaceMap } from './SurfaceMap'
import { TrifectaCheck } from './TrifectaCheck'

const SECTIONS = [
  { id: 'principios', label: 'Principios' },
  { id: 'trifecta', label: 'Trifecta' },
  { id: 'superficies', label: 'Superficies' },
  { id: 'ataques', label: 'Ataques' },
  { id: 'patrones', label: 'Patrones' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'incidentes', label: 'Casos reales' },
  { id: 'marcos', label: 'Marcos' },
]

export default function SecurityPage() {
  const [surface, setSurface] = useState<string | null>(null)
  const [attackFocus, setAttackFocus] = useState<{ id: string; key: number } | null>(null)

  const goToSurface = (id: string) => {
    setSurface(id)
    setTimeout(() => document.getElementById('superficies')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }
  const goToAttack = (id: string) => setAttackFocus({ id, key: Date.now() })
  const critical = ATTACKS.filter((a) => a.severity === 'critical').length

  return (
    <div>
      <header className="relative overflow-hidden border-b border-border">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(700px 260px at 15% 0%, color-mix(in oklab, var(--bad) 14%, transparent), transparent)' }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-8 sm:px-8">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-bad/40 bg-bad/10 px-2.5 py-1 text-[11.5px] font-semibold text-bad">
            <ShieldAlert className="size-3.5" /> Importante
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">Seguridad: revisión de arquitectura</h1>
          <p className="mt-3 max-w-3xl text-[15.5px] leading-relaxed text-muted">
            Lo que un arquitecto de seguridad debe revisar en un sistema con LLMs, RAG, herramientas o agentes: superficies de ataque,
            técnicas conocidas, patrones de diseño que las neutralizan y una checklist para la revisión.
          </p>
          <div className="mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4">
            <Figure value={SURFACES.length} label="superficies de ataque" />
            <Figure value={ATTACKS.length} label={`técnicas (${critical} críticas)`} />
            <Figure value={PATTERNS.length} label="patrones de diseño" />
            <Figure value={CHECKLIST_ITEMS.length} label="controles a revisar" />
          </div>
        </div>
      </header>
      <nav className="sticky top-0 z-20 border-b border-border bg-bg/85 backdrop-blur-md" aria-label="Secciones">
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-5 py-2 sm:px-8">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="shrink-0 rounded-lg px-2.5 py-1.5 text-[12.5px] text-muted hover:bg-surface-2 hover:text-fg"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="mx-auto max-w-6xl space-y-16 px-5 py-10 sm:px-8">
        <Section id="principios" kicker="Punto de partida" title="Ocho principios que cambian con los LLMs">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PRINCIPLES.map((p, i) => (
              <Card key={p.title} className="p-4">
                <span className="font-mono text-[11px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-1 text-[14.5px] leading-snug font-semibold">{p.title}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{p.text}</p>
              </Card>
            ))}
          </div>
          <div className="mt-6">
            <SectionLabel className="mb-3">Modelo de amenazas en seis pasos</SectionLabel>
            <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {THREAT_MODEL_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-xl border border-border bg-surface p-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-[11px] text-accent">{i + 1}</span>
                  <span>
                    <span className="block text-[13.5px] font-medium">{s.title}</span>
                    <span className="block text-[12.5px] leading-snug text-muted">{s.text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section id="trifecta" kicker="La comprobación más importante" title="La trifecta letal">
          <TrifectaCheck />
        </Section>

        <Section id="superficies" kicker="Dónde atacar" title={`${SURFACES.length} superficies de ataque en 6 zonas de confianza`}>
          <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
            Cada borde discontinuo es una frontera de confianza: lo que la cruza debe validarse. Elige una superficie para ver qué la
            compone, por qué está expuesta, qué ataques la afectan, qué controles aplicar y qué preguntar en la revisión.
          </p>
          <SurfaceMap selected={surface} onSelect={setSurface} onAttack={goToAttack} />
        </Section>

        <Section id="ataques" kicker="Cómo se ataca" title="Catálogo de técnicas de ataque">
          <AttackCatalog focus={attackFocus} onSurface={goToSurface} />
        </Section>

        <Section id="patrones" kicker="Cómo se diseña" title="Patrones de diseño seguro para agentes">
          <p className="mb-4 max-w-3xl text-[13.5px] leading-relaxed text-muted">
            Los guardrails reducen la probabilidad de éxito de un ataque; estos patrones limitan lo que un ataque exitoso puede
            conseguir. La mayoría proceden de{' '}
            <a href={PATTERNS_SOURCE.url} target="_blank" rel="noreferrer" className="underline decoration-border-strong underline-offset-2 hover:text-fg">
              {PATTERNS_SOURCE.title}
            </a>
            .
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            {PATTERNS.map((p) => (
              <Card key={p.id} className="p-4">
                <p className="text-[15px] font-semibold">{p.title}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed">{p.text}</p>
                <p className="mt-2 text-[12.5px] leading-relaxed text-muted">
                  <span className="text-subtle">Trade-off: </span>
                  {p.tradeoff}
                </p>
                {p.refs && (
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    {p.refs.map((r) => (
                      <a key={r.title} href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11.5px] text-subtle hover:text-fg">
                        {r.title} <ExternalLink className="size-3" />
                      </a>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Section>

        <Section id="checklist" kicker="Para la revisión" title="Checklist de revisión de arquitectura">
          <ReviewChecklist />
        </Section>

        <Section id="incidentes" kicker="No es teoría" title="Casos reales">
          <ol className="relative space-y-3 border-l border-border pl-5">
            {INCIDENTS.map((inc) => (
              <li key={inc.title} className="relative">
                <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-bg bg-bad" />
                <p className="font-mono text-[11px] text-subtle">{inc.year}</p>
                <p className="text-[14.5px] font-medium">{inc.title}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{inc.text}</p>
                <p className="mt-1 text-[13px] leading-relaxed">
                  <span className="text-subtle">Lección: </span>
                  {inc.lesson}
                  {inc.ref?.url && (
                    <a href={inc.ref.url} target="_blank" rel="noreferrer" className="ml-2 inline-flex items-center gap-1 text-[11.5px] text-subtle hover:text-fg">
                      {inc.ref.title} <ExternalLink className="size-3" />
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="marcos" kicker="Referencias" title="Marcos, normativa y herramientas">
          <SectionLabel className="mb-3">OWASP Top 10 para aplicaciones con LLM (2025)</SectionLabel>
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-surface-2 text-[11.5px] text-subtle uppercase">
                <tr>
                  <th className="px-4 py-2">Id</th>
                  <th className="px-4 py-2">Riesgo</th>
                  <th className="px-4 py-2">Qué es</th>
                  <th className="px-4 py-2 text-right">Técnicas</th>
                </tr>
              </thead>
              <tbody>
                {OWASP_LLM.map((o) => (
                  <tr key={o.id} className="border-t border-border bg-surface">
                    <td className="px-4 py-2.5 font-mono text-[12px]">{o.id}</td>
                    <td className="px-4 py-2.5 font-medium">
                      {o.es}
                      <span className="block text-[11.5px] font-normal text-subtle">{o.title}</span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">{o.text}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{ATTACKS.filter((a) => a.owasp.includes(o.id)).length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <SectionLabel className="mb-3">Marcos y normativa</SectionLabel>
              <ul className="space-y-2">
                {FRAMEWORKS.map((f) => (
                  <li key={f.title}>
                    <a href={f.url} target="_blank" rel="noreferrer" className="group block rounded-xl border border-border bg-surface px-4 py-3 hover:border-border-strong">
                      <span className="flex items-center gap-1.5 text-[14px] font-medium">
                        {f.title} <ExternalLink className="size-3 text-subtle opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{f.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel className="mb-3">Red teaming automatizado</SectionLabel>
              <ul className="space-y-2">
                {REDTEAM_TOOLS.map((t) => (
                  <li key={t.name}>
                    <a href={t.url} target="_blank" rel="noreferrer" className="group block rounded-xl border border-border bg-surface px-4 py-3 hover:border-border-strong">
                      <span className="flex items-center gap-1.5 text-[14px] font-medium">
                        {t.name} <ExternalLink className="size-3 text-subtle opacity-0 group-hover:opacity-100" />
                      </span>
                      <span className="mt-0.5 block text-[12.5px] leading-snug text-muted">{t.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-[12.5px] leading-relaxed text-muted">
                Automatiza lo repetible en CI (inyecciones conocidas, fugas, jailbreaks, abuso de herramientas) y reserva a personas
                expertas para lo creativo: cadenas de ataque que combinan varias superficies de tu sistema concreto.
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ id, kicker, title, children }: { id: string; kicker: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-16">
      <SectionLabel>{kicker}</SectionLabel>
      <h2 className="mt-1 mb-5 text-2xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  )
}

function Figure({ value, label }: { value: number; label: string }) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface/70 px-3 py-2.5 backdrop-blur')}>
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-[12px] text-muted">{label}</p>
    </div>
  )
}
