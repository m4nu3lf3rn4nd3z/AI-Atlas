import { ArrowRight, CornerDownLeft } from 'lucide-react'
import { CONCEPTS, getConcept, hasContent } from '@/content'
import { dependents } from '@/content/graph'
import { LAYER_BY_ID, RELATION_LABELS } from '@/content/layers'
import type { ConceptMeta } from '@/content/schema'
import { SectionLabel } from '@/components/ui/primitives'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'

function Chip({ id, onNavigate, prefix }: { id: string; onNavigate: (id: string) => void; prefix?: string }) {
  const c = getConcept(id)
  const learned = useProgress((s) => !!s.concepts[id]?.learnedAt)
  if (!c) return null
  const color = LAYER_BY_ID[c.layer].color
  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      className={cn(
        'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border bg-surface px-2 py-1 text-[12.5px] transition-colors hover:bg-surface-2',
        hasContent(id) ? 'border-border' : 'border-dashed border-border-strong text-muted',
      )}
    >
      <span className="size-1.5 rounded-full" style={{ background: color }} />
      {prefix && <span className="font-mono text-[10.5px] text-subtle">{prefix}</span>}
      {c.title}
      {learned && <span className="text-[10px] text-ok">✓</span>}
    </button>
  )
}

export function RelationsPanel({ concept, onNavigate }: { concept: ConceptMeta; onNavigate: (id: string) => void }) {
  const incoming = CONCEPTS.flatMap((c) =>
    c.relations.filter((r) => r.to === concept.id).map((r) => ({ from: c.id, type: r.type, note: r.note })),
  )
  const next = dependents(concept.id)

  return (
    <div className="space-y-5">
      {concept.prerequisites.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Necesitas antes</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {concept.prerequisites.map((p) => (
              <Chip key={p} id={p} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
      {(concept.relations.length > 0 || incoming.length > 0) && (
        <div>
          <SectionLabel className="mb-2">Cómo se conecta</SectionLabel>
          <ul className="space-y-1.5 text-[13px]">
            {concept.relations.map((r) => (
              <li key={`o-${r.to}-${r.type}`} className="flex flex-wrap items-center gap-2">
                <ArrowRight className="size-3.5 text-subtle" />
                <span className="text-muted">{RELATION_LABELS[r.type].verb}</span>
                <Chip id={r.to} onNavigate={onNavigate} />
                {r.note && <span className="text-[12px] text-subtle">· {r.note}</span>}
              </li>
            ))}
            {incoming.map((r) => (
              <li key={`i-${r.from}-${r.type}`} className="flex flex-wrap items-center gap-2">
                <CornerDownLeft className="size-3.5 text-subtle" />
                <Chip id={r.from} onNavigate={onNavigate} />
                <span className="text-muted">{RELATION_LABELS[r.type].verb} este concepto</span>
                {r.note && <span className="text-[12px] text-subtle">· {r.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {next.length > 0 && (
        <div>
          <SectionLabel className="mb-2">Siguientes pasos</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {next.map((id) => (
              <Chip key={id} id={id} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
