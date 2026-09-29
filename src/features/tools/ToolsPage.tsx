import { ExternalLink, Search } from 'lucide-react'
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link, useLocation } from 'react-router'
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/primitives'
import { casesUsingTool } from '@/cases'
import { getConcept } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'
import { TOOL_CATEGORIES, TOOL_KIND_LABELS, TOOLS, TOOLS_AS_OF, type ToolCategoryId, type ToolKind } from '@/content/tools'
import { cn } from '@/lib/cn'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function ToolsPage() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState<ToolCategoryId | 'all'>('all')
  const [kind, setKind] = useState<ToolKind | 'all'>('all')
  const { hash } = useLocation()
  const target = hash.slice(1)

  // Available kinds change when the category filter changes.
  const availableKinds = useMemo<ToolKind[]>(() => {
    const pool = category === 'all' ? TOOLS : TOOLS.filter((t) => t.categories.includes(category))
    return [...new Set(pool.map((t) => t.kind))].sort() as ToolKind[]
  }, [category])

  const visible = useMemo(() => {
    const nq = norm(q)
    return TOOLS.filter(
      (t) =>
        (category === 'all' || t.categories.includes(category)) &&
        (kind === 'all' || t.kind === kind) &&
        (!nq || norm(`${t.name} ${t.description} ${t.choose ?? ''}`).includes(nq)),
    )
  }, [q, category, kind])

  // Arriving at /tools#id clears the filters so the card is visible…
  const [prevTarget, setPrevTarget] = useState(target)
  if (target !== prevTarget) {
    setPrevTarget(target)
    setQ('')
    setCategory('all')
    setKind('all')
  }
  // …and scrolls to it.
  useEffect(() => {
    if (target) requestAnimationFrame(() => document.getElementById(target)?.scrollIntoView({ block: 'center' }))
  }, [target])

  // With no filter each tool is listed once, under its main category.
  const sections =
    category === 'all' && kind === 'all'
      ? TOOL_CATEGORIES.map((c) => ({ ...c, tools: visible.filter((t) => t.categories[0] === c.id) })).filter((s) => s.tools.length > 0)
      : category !== 'all'
        ? TOOL_CATEGORIES.filter((c) => c.id === category && visible.length > 0).map((c) => ({ ...c, tools: visible }))
        : [{ id: 'filtered' as ToolCategoryId, title: TOOL_KIND_LABELS[kind as ToolKind], description: '', tools: visible }]

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Herramientas del ecosistema</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {TOOLS.length} frameworks, protocolos, servicios y patrones, con qué hace cada uno, cuándo elegirlo y en qué
          casos de uso aparece. Descripciones a fecha de {TOOLS_AS_OF}: este ecosistema cambia deprisa.
        </p>
      </header>

      <div className="sticky top-0 z-10 -mx-5 mt-6 border-b border-border bg-bg/85 px-5 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
        <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent">
          <Search className="size-4 text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar: vector, MCP, evals, Temporal…"
            className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-subtle"
          />
        </label>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Select
            value={category}
            onValueChange={(v) => {
              setCategory(v as ToolCategoryId | 'all')
              setKind('all')
            }}
          >
            <SelectTrigger active={category !== 'all'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {TOOL_CATEGORIES.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={kind} onValueChange={(v) => setKind(v as ToolKind | 'all')}>
            <SelectTrigger active={kind !== 'all'}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los tipos</SelectItem>
              {availableKinds.map((k) => (
                <SelectItem key={k} value={k}>{TOOL_KIND_LABELS[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(category !== 'all' || kind !== 'all') && (
            <button
              type="button"
              onClick={() => { setCategory('all'); setKind('all') }}
              className="text-[12px] text-subtle hover:text-fg"
            >
              Limpiar filtros
            </button>
          )}
          <span className="ml-auto font-mono text-[12px] text-subtle">{visible.length} herramientas</span>
        </div>
      </div>

      <div className="mt-6 space-y-10">
        {sections.map((s) => (
          <section key={s.id}>
            <h2 className="text-[17px] font-semibold">{s.title}</h2>
            <p className="mt-0.5 text-[13px] text-subtle">{s.description}</p>
            <div className="mt-4 grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
              {s.tools.map((t) => {
                const cases = casesUsingTool(t.id)
                return (
                  <article
                    key={t.id}
                    id={t.id}
                    className={cn(
                      'flex scroll-mt-40 flex-col rounded-2xl border bg-surface p-4 transition-colors',
                      target === t.id ? 'border-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_22%,transparent)]' : 'border-border',
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <h3 className="flex-1 text-[15px] leading-snug font-semibold">{t.name}</h3>
                      <Badge>{TOOL_KIND_LABELS[t.kind]}</Badge>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{t.description}</p>
                    {t.choose && (
                      <p className="mt-2 text-[12.5px] leading-snug">
                        <span className="text-subtle">Elígelo si: </span>
                        {t.choose}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
                      {t.concepts?.map((id) => {
                        const c = getConcept(id)
                        if (!c) return null
                        return (
                          <Link
                            key={id}
                            to={`/c/${id}`}
                            className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted hover:text-fg"
                            style={{ '--layer': LAYER_BY_ID[c.layer].color } as CSSProperties}
                          >
                            <span className="size-1.5 rounded-full bg-[var(--layer)]" />
                            {c.title}
                          </Link>
                        )
                      })}
                      {cases.map((uc) => (
                        <Link
                          key={uc.id}
                          to={`/cases/${uc.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 text-[11px] text-fg hover:underline"
                          title="Aparece en este caso de uso"
                        >
                          <uc.icon className="size-3" /> {uc.title}
                        </Link>
                      ))}
                      {t.url && (
                        <a
                          href={t.url}
                          target="_blank"
                          rel="noreferrer"
                          className="ml-auto flex items-center gap-1 text-[11.5px] text-subtle hover:text-fg"
                          aria-label={`Web de ${t.name}`}
                        >
                          web <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        ))}
        {sections.length === 0 && <p className="py-12 text-center text-subtle">Sin resultados</p>}
      </div>
    </div>
  )
}
