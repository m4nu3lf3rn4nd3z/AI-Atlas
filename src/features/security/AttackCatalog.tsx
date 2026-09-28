import { ChevronDown, ExternalLink, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { cn } from '@/lib/cn'
import { ATTACKS } from '@/security/attacks'
import { SURFACE_BY_ID } from '@/security/surfaces'
import { ATTACK_CATEGORIES, SEVERITY, type AttackCategoryId, type Severity } from '@/security/types'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

/* Filterable catalogue of attack techniques. `focus` expands and scrolls to
   one attack (used when coming from the surface map). */
export function AttackCatalog({
  focus: focusRequest,
  onSurface,
}: {
  /** `key` changes on every request, so the same attack can be focused twice. */
  focus: { id: string; key: number } | null
  onSurface: (id: string) => void
}) {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<AttackCategoryId | 'all'>('all')
  const [severity, setSeverity] = useState<Severity | 'all'>('all')
  const [open, setOpen] = useState<Set<string>>(new Set())
  const focus = focusRequest?.id ?? null

  // A new focus request clears the filters and opens that attack.
  const [prevKey, setPrevKey] = useState(focusRequest?.key)
  if (focusRequest && focusRequest.key !== prevKey) {
    setPrevKey(focusRequest.key)
    setQ('')
    setCategory('all')
    setSeverity('all')
    setOpen(new Set([...open, focusRequest.id]))
  }
  useEffect(() => {
    if (focusRequest) {
      setTimeout(() => document.getElementById(`atk-${focusRequest.id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 0)
    }
  }, [focusRequest])

  const list = useMemo(() => {
    const nq = norm(q)
    return ATTACKS.filter(
      (a) =>
        (category === 'all' || a.category === category) &&
        (severity === 'all' || a.severity === severity) &&
        (!nq || norm(`${a.title} ${a.how} ${a.example} ${a.owasp.join(' ')}`).includes(nq)),
    ).sort((a, b) => SEVERITY[a.severity].rank - SEVERITY[b.severity].rank)
  }, [q, category, severity])

  const toggle = (id: string) => {
    const next = new Set(open)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setOpen(next)
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-9 min-w-56 flex-1 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent">
          <Search className="size-4 text-subtle" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar: exfiltración, MCP, LLM05, Unicode…" className="h-full flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-subtle" />
        </label>
        {(['all', 'critical', 'high', 'medium'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSeverity(s)}
            className={cn('h-9 cursor-pointer rounded-lg border px-2.5 text-[12.5px]', severity === s ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg')}
          >
            {s === 'all' ? 'Toda severidad' : SEVERITY[s].label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1">
        {[{ id: 'all' as const, title: 'Todas las categorías' }, ...ATTACK_CATEGORIES].map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            className={cn('shrink-0 cursor-pointer rounded-lg border px-2.5 py-1 text-[12px]', category === c.id ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg')}
          >
            {c.title}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[12px] text-subtle">
        {list.length} de {ATTACKS.length} técnicas
      </p>

      <div className="mt-2 space-y-2">
        {list.map((a) => {
          const isOpen = open.has(a.id)
          const sev = SEVERITY[a.severity]
          return (
            <article key={a.id} id={`atk-${a.id}`} className={cn('scroll-mt-24 rounded-xl border bg-surface transition-colors', focus === a.id ? 'border-accent' : 'border-border')}>
              <button type="button" onClick={() => toggle(a.id)} aria-expanded={isOpen} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left">
                <span className="w-14 shrink-0 text-[11.5px] font-semibold" style={{ color: sev.color }}>
                  {sev.label}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14.5px] font-medium">{a.title}</span>
                  <span className="block text-[12px] text-subtle">{ATTACK_CATEGORIES.find((c) => c.id === a.category)!.title}</span>
                </span>
                <span className="hidden shrink-0 gap-1 sm:flex">
                  {a.owasp.map((o) => (
                    <span key={o} className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10.5px] text-muted">
                      {o}
                    </span>
                  ))}
                </span>
                <ChevronDown className={cn('size-4 shrink-0 text-subtle transition-transform', !isOpen && '-rotate-90')} />
              </button>
              {isOpen && (
                <div className="grid gap-4 border-t border-border px-4 py-4 lg:grid-cols-2">
                  <div className="space-y-3 text-[13.5px] leading-relaxed">
                    <p>
                      <b>Cómo funciona.</b> <span className="text-muted">{a.how}</span>
                    </p>
                    <p className="rounded-lg bg-surface-2 px-3 py-2">
                      <b>Ejemplo.</b> <span className="text-muted">{a.example}</span>
                    </p>
                    <p>
                      <b>Impacto.</b> <span className="text-muted">{a.impact}</span>
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[13.5px] font-semibold">Mitigaciones</p>
                      <ul className="mt-1 space-y-1.5">
                        {a.mitigations.map((m) => (
                          <li key={m} className="flex gap-2 text-[13px] leading-relaxed">
                            <span className="text-ok">✓</span>
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[12px] text-subtle">Superficies:</span>
                      {a.surfaces.map((s) => {
                        const surf = SURFACE_BY_ID.get(s)!
                        return (
                          <button key={s} type="button" onClick={() => onSurface(s)} className="cursor-pointer rounded-md border border-border px-1.5 py-0.5 text-[11.5px] text-muted hover:text-fg">
                            {surf.n}. {surf.title}
                          </button>
                        )
                      })}
                    </div>
                    {a.refs && (
                      <ul className="space-y-1">
                        {a.refs.map((r) => (
                          <li key={r.title}>
                            {r.url ? (
                              <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] text-subtle underline decoration-border-strong underline-offset-2 hover:text-fg">
                                {r.title} <ExternalLink className="size-3" />
                              </a>
                            ) : (
                              <span className="text-[12px] text-subtle">{r.title}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
