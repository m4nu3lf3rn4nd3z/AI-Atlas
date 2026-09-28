import { useState } from 'react'
import { CodeBlock } from '@/components/CodeBlock'
import { Badge } from '@/components/ui/primitives'
import type { Snippet } from '@/content/schema'
import { cn } from '@/lib/cn'

const LANG_LABEL: Record<Snippet['lang'], string> = {
  python: 'Python',
  typescript: 'TypeScript',
  bash: 'Shell',
  json: 'JSON',
  sql: 'SQL',
}

export function CodeTab({ snippets }: { snippets: Snippet[] }) {
  const [active, setActive] = useState(0)
  const s = snippets[active] ?? snippets[0]!

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-muted">
        Ejemplos mínimos y comentados, no código de producción: las librerías de IA cambian cada pocos
        meses, así que cada snippet indica las versiones con las que se escribió.
      </p>
      {snippets.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {snippets.map((sn, i) => (
            <button
              key={sn.title}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                'cursor-pointer rounded-lg border px-2.5 py-1 text-[12.5px] transition-colors',
                i === active ? 'border-accent/60 bg-accent-soft text-fg' : 'border-border text-muted hover:text-fg',
              )}
            >
              <span className="mr-1.5 font-mono text-[10.5px] text-subtle">{LANG_LABEL[sn.lang]}</span>
              {sn.title}
            </button>
          ))}
        </div>
      )}
      <CodeBlock code={s.code} lang={s.lang} title={s.title} />
      <div className="flex flex-wrap items-center gap-1.5">
        {Object.entries(s.deps).map(([pkg, v]) => (
          <Badge key={pkg} className="font-mono">
            {pkg} {v}
          </Badge>
        ))}
        <span className="ml-auto font-mono text-[10.5px] text-subtle">revisado {s.verifiedAt}</span>
      </div>
      {s.note && <p className="text-[12.5px] leading-relaxed text-subtle">{s.note}</p>}
    </div>
  )
}
