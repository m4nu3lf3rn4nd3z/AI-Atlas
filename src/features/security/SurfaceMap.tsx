import { CircleQuestionMark, Eye, ShieldCheck, Siren } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { SectionLabel } from '@/components/ui/primitives'
import { CASE_BY_ID } from '@/cases'
import { getConcept } from '@/content'
import { cn } from '@/lib/cn'
import { ATTACKS } from '@/security/attacks'
import { SURFACE_BY_ID, SURFACES } from '@/security/surfaces'
import { SEVERITY, ZONES, type ControlKind, type ZoneId } from '@/security/types'

const ZONE_COLOR: Record<ZoneId, string> = {
  untrusted: 'var(--bad)',
  app: 'var(--l1)',
  model: 'var(--l0)',
  action: 'var(--l5)',
  data: 'var(--l4)',
  platform: 'var(--l2)',
}

const CONTROL: Record<ControlKind, { label: string; icon: typeof ShieldCheck }> = {
  prevent: { label: 'Prevenir', icon: ShieldCheck },
  detect: { label: 'Detectar', icon: Eye },
  respond: { label: 'Responder', icon: Siren },
}

const attacksOn = (surfaceId: string) =>
  ATTACKS.filter((a) => a.surfaces.includes(surfaceId)).sort((a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank)

/* Trust zones with their attack surfaces. Each zone boundary is a trust
   boundary: data crossing it must be validated. */
export function SurfaceMap({
  selected,
  onSelect,
  onAttack,
}: {
  selected: string | null
  onSelect: (id: string) => void
  onAttack: (id: string) => void
}) {
  const surface = selected ? SURFACE_BY_ID.get(selected) : undefined
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ZONES.map((zone) => (
          <div
            key={zone.id}
            className="rounded-2xl border-2 border-dashed p-3"
            style={{ borderColor: `color-mix(in oklab, ${ZONE_COLOR[zone.id]} 35%, transparent)` } as CSSProperties}
          >
            <div className="px-1 pb-2">
              <p className="flex items-center gap-2 text-[14px] font-semibold">
                <span className="size-2 rounded-full" style={{ background: ZONE_COLOR[zone.id] }} />
                {zone.title}
              </p>
              <p className="mt-0.5 text-[12px] text-subtle">{zone.text}</p>
            </div>
            <div className="space-y-1.5">
              {SURFACES.filter((s) => s.zone === zone.id).map((s) => {
                const atks = attacksOn(s.id)
                const critical = atks.filter((a) => a.severity === 'critical').length
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(s.id)}
                    aria-pressed={selected === s.id}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2.5 rounded-xl border bg-surface px-3 py-2 text-left transition-colors',
                      selected === s.id ? 'border-accent shadow-[0_0_0_2px_color-mix(in_oklab,var(--accent)_25%,transparent)]' : 'border-border hover:border-border-strong',
                    )}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-3 font-mono text-[11px] text-muted">{s.n}</span>
                    <span className="min-w-0 flex-1 text-[13px] leading-tight font-medium">{s.title}</span>
                    <span className="shrink-0 font-mono text-[10.5px] text-subtle" title={`${atks.length} ataques, ${critical} críticos`}>
                      {atks.length}
                      {critical > 0 && <span style={{ color: SEVERITY.critical.color }}> · {critical}!</span>}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {surface ? (
        <div className="atlas-fade rounded-2xl border border-accent/40 bg-surface p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-accent-soft font-mono text-[12px] text-accent">{surface.n}</span>
            <h3 className="text-[18px] font-semibold">{surface.title}</h3>
            <span className="rounded-md px-1.5 py-0.5 text-[11px]" style={{ color: ZONE_COLOR[surface.zone], background: `color-mix(in oklab, ${ZONE_COLOR[surface.zone]} 10%, transparent)` }}>
              {ZONES.find((z) => z.id === surface.zone)!.title}
            </span>
          </div>
          <p className="mt-2 text-[14px] leading-relaxed text-muted">{surface.short}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {surface.includes.map((i) => (
              <span key={i} className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[12px] text-muted">
                {i}
              </span>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-bad/5 px-3 py-2 text-[13.5px] leading-relaxed">
            <b>Por qué está expuesta:</b> {surface.exposure}
          </p>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div>
              <SectionLabel className="mb-2">Ataques sobre esta superficie</SectionLabel>
              <ul className="space-y-1">
                {attacksOn(surface.id).map((a) => (
                  <li key={a.id}>
                    <button type="button" onClick={() => onAttack(a.id)} className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] hover:bg-surface-2">
                      <span className="w-14 shrink-0 text-[11px] font-medium" style={{ color: SEVERITY[a.severity].color }}>
                        {SEVERITY[a.severity].label}
                      </span>
                      <span className="flex-1">{a.title}</span>
                      <span className="font-mono text-[10.5px] text-subtle">{a.owasp.join(' ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <SectionLabel className="mb-2">Controles</SectionLabel>
              <ul className="space-y-1.5">
                {surface.controls.map((c) => {
                  const k = CONTROL[c.kind]
                  return (
                    <li key={c.text} className="flex gap-2 text-[13px] leading-relaxed">
                      <k.icon className="mt-0.5 size-3.5 shrink-0 text-accent" aria-label={k.label} />
                      <span>
                        <span className="text-subtle">{k.label}: </span>
                        {c.text}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          <div className="mt-5">
            <SectionLabel className="mb-2">Preguntas de revisión</SectionLabel>
            <ul className="space-y-1.5">
              {surface.review.map((q) => (
                <li key={q} className="flex gap-2 text-[13.5px] leading-relaxed">
                  <CircleQuestionMark className="mt-0.5 size-4 shrink-0 text-warn" />
                  {q}
                </li>
              ))}
            </ul>
          </div>

          {(surface.concepts.length > 0 || surface.cases.length > 0) && (
            <div className="mt-5 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-subtle">Para aprender más:</span>
              {surface.concepts.map((id) => {
                const c = getConcept(id)
                return c ? (
                  <Link key={id} to={`/c/${id}`} className="rounded-md border border-border px-1.5 py-0.5 text-[12px] text-muted hover:text-fg">
                    {c.title}
                  </Link>
                ) : null
              })}
              {surface.cases.map((id) => {
                const uc = CASE_BY_ID.get(id)
                return uc ? (
                  <Link key={id} to={`/cases/${id}`} className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[12px] hover:underline">
                    <uc.icon className="size-3" /> {uc.title}
                  </Link>
                ) : null
              })}
            </div>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-border-strong p-5 text-center text-[13.5px] text-subtle">
          Elige una superficie para ver sus ataques, controles y preguntas de revisión. El número indica cuántos ataques la afectan
          y cuántos son críticos (!).
        </p>
      )}
    </div>
  )
}
