import { MDXProvider } from '@mdx-js/react'
import { BookOpen, CirclePlay, ExternalLink, FileText, FolderGit2, TriangleAlert } from 'lucide-react'
import type { ComponentType, CSSProperties } from 'react'
import { mdxComponents } from '@/components/mdxComponents'
import { SectionLabel } from '@/components/ui/primitives'
import { LAYER_BY_ID } from '@/content/layers'
import type { ConceptDetails, ConceptMeta, Source } from '@/content/schema'
import { RelationsPanel } from './RelationsPanel'

const SOURCE_ICON: Record<Source['kind'], ComponentType<{ className?: string }>> = {
  paper: FileText,
  docs: BookOpen,
  blog: FileText,
  video: CirclePlay,
  repo: FolderGit2,
}

export function TheoryTab({
  concept,
  details,
  Theory,
  onNavigate,
}: {
  concept: ConceptMeta
  details: ConceptDetails
  Theory: ComponentType
  onNavigate: (id: string) => void
}) {
  return (
    <div className="space-y-10">
      <article
        className="prose-atlas"
        style={{ '--layer': LAYER_BY_ID[concept.layer].color } as CSSProperties}
      >
        <MDXProvider components={mdxComponents}>
          <Theory />
        </MDXProvider>
      </article>

      <section>
        <SectionLabel className="mb-3 flex items-center gap-2">
          <TriangleAlert className="size-3.5" /> Errores comunes
        </SectionLabel>
        <div className="space-y-2">
          {details.misconceptions.map((m) => (
            <div key={m.myth} className="rounded-xl border border-border bg-surface px-4 py-3">
              <p className="text-[13.5px] text-muted line-through decoration-bad/60">{m.myth}</p>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-fg">{m.reality}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <RelationsPanel concept={concept} onNavigate={onNavigate} />
      </section>

      <section>
        <SectionLabel className="mb-3">Fuentes primarias</SectionLabel>
        <ul className="space-y-1.5">
          {details.sources.map((s) => {
            const Icon = SOURCE_ICON[s.kind]
            return (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-start gap-2 text-[13px] text-muted hover:text-fg"
                >
                  <Icon className="mt-0.5 size-3.5 shrink-0 text-subtle" />
                  <span className="underline decoration-border-strong underline-offset-2 group-hover:decoration-accent">
                    {s.title}
                  </span>
                  <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-0 group-hover:opacity-60" />
                </a>
              </li>
            )
          })}
        </ul>
        <p className="mt-3 font-mono text-[10.5px] text-subtle">
          Revisado {details.reviewedAt}
          {details.asOf && ` · datos a fecha de ${details.asOf}`}
        </p>
      </section>
    </div>
  )
}
