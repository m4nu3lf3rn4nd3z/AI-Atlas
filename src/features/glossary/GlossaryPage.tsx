import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { getConcept } from '@/content'
import { GLOSSARY } from '@/content/glossary'
import { LAYER_BY_ID } from '@/content/layers'
import { cn } from '@/lib/cn'

const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

export default function GlossaryPage() {
  const [q, setQ] = useState('')
  const { hash } = useLocation()
  const target = hash.slice(1)

  const terms = useMemo(() => {
    const nq = norm(q)
    return [...GLOSSARY]
      .sort((a, b) => a.term.localeCompare(b.term, 'es'))
      .filter((g) => !nq || norm(`${g.term} ${g.definition}`).includes(nq))
  }, [q])

  useEffect(() => {
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'center' })
  }, [target])

  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Glosario</h1>
      <p className="mt-3 text-[15px] text-muted">
        Definiciones cortas y precisas. En la teoría, los términos subrayados con puntos muestran su
        definición al pasar el ratón.
      </p>
      <label className="mt-6 flex h-10 items-center gap-2 rounded-xl border border-border bg-surface px-3 focus-within:border-accent">
        <Search className="size-4 text-subtle" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Filtrar ${GLOSSARY.length} términos…`}
          className="h-full flex-1 bg-transparent text-[14px] outline-none placeholder:text-subtle"
        />
      </label>
      <dl className="mt-6 divide-y divide-border">
        {terms.map((g) => {
          const c = getConcept(g.concept)
          return (
            <div
              key={g.id}
              id={g.id}
              className={cn('scroll-mt-20 py-4', target === g.id && 'rounded-xl bg-accent-soft px-3')}
            >
              <dt className="flex flex-wrap items-baseline gap-3">
                <span className="text-[15px] font-semibold">{g.term}</span>
                {c && (
                  <Link
                    to={`/c/${c.id}`}
                    className="text-[12px] hover:underline"
                    style={{ color: LAYER_BY_ID[c.layer].color }}
                  >
                    {c.title} →
                  </Link>
                )}
              </dt>
              <dd className="mt-1 text-[14px] leading-relaxed text-muted">{g.definition}</dd>
            </div>
          )
        })}
        {terms.length === 0 && <p className="py-8 text-center text-subtle">Sin resultados</p>}
      </dl>
    </div>
  )
}
