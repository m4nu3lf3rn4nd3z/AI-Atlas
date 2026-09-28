import { BookOpen, Code, FlaskConical, GraduationCap, Map, Maximize2, X } from 'lucide-react'
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Badge, Tabs, TabsContent, TabsList, TabsTrigger, Tooltip } from '@/components/ui/primitives'
import { getConcept } from '@/content'
import { CONTENT_PHASE, KIND_LABELS, LAYER_BY_ID, LEVEL_LABELS } from '@/content/layers'
import { cn } from '@/lib/cn'
import { useProgress } from '@/stores/progress'
import { LevelBars } from '@/components/LevelBars'
import { CodeTab } from './CodeTab'
import { LabTab } from './LabTab'
import { QuizTab } from './QuizTab'
import { RelationsPanel } from './RelationsPanel'
import { TheoryTab } from './TheoryTab'
import { isConceptTab, type ConceptTab } from './tabs'
import { useConceptContent } from './useConceptContent'

interface Props {
  id: string
  tab: ConceptTab
  onTabChange: (tab: ConceptTab) => void
  onNavigate: (id: string) => void
  variant: 'drawer' | 'page'
  onClose?: () => void
}

export function ConceptView({ id, tab, onTabChange, onNavigate, variant, onClose }: Props) {
  const concept = getConcept(id)!
  const layer = LAYER_BY_ID[concept.layer]
  const { status, details, Theory } = useConceptContent(id)
  const markVisited = useProgress((s) => s.markVisited)
  const learned = useProgress((s) => !!s.concepts[id]?.learnedAt)
  const toggleLearned = useProgress((s) => s.toggleLearned)

  useEffect(() => {
    markVisited(id)
  }, [id, markVisited])

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [id, tab])

  const isDraft = status === 'missing'

  return (
    <div className="flex min-h-0 flex-1 flex-col" style={{ '--layer': layer.color } as CSSProperties}>
      <header className={cn('shrink-0', variant === 'drawer' ? 'px-5 pt-4' : 'px-0 pt-2')}>
        <div className="flex items-center gap-2">
          <Badge color={layer.color}>
            Capa {layer.index} · {layer.title}
          </Badge>
          <span className="flex items-center gap-1.5 font-mono text-[10.5px] text-subtle">
            {KIND_LABELS[concept.kind]} · {LEVEL_LABELS[concept.level]}
            <LevelBars level={concept.level} />
          </span>
          <div className="ml-auto flex items-center gap-0.5">
            {variant === 'drawer' ? (
              <IconLink to={`/c/${id}/${tab}`} label="Abrir a página completa">
                <Maximize2 />
              </IconLink>
            ) : (
              <IconLink to={`/map?c=${id}`} label="Ver en el mapa">
                <Map />
              </IconLink>
            )}
            {onClose && (
              <Tooltip content="Cerrar (Esc)">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Cerrar"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-md text-subtle hover:bg-surface-2 hover:text-fg [&_svg]:size-4"
                >
                  <X />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
        <h1
          className={cn(
            'mt-3 font-semibold tracking-tight',
            variant === 'drawer' ? 'text-[22px] leading-tight' : 'text-3xl',
          )}
        >
          {concept.title}
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{concept.short}</p>
        {!isDraft && (
          <button
            type="button"
            onClick={() => toggleLearned(id)}
            className={cn(
              'mt-3 inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-1 text-[11.5px]',
              learned ? 'border-ok/40 bg-ok/10 text-ok' : 'border-border text-subtle hover:text-fg',
            )}
          >
            <GraduationCap className="size-3.5" />
            {learned ? 'Aprendido' : 'Marcar como aprendido'}
          </button>
        )}
      </header>

      <Tabs
        value={tab}
        onValueChange={(v) => isConceptTab(v) && onTabChange(v)}
        className="mt-4 flex min-h-0 flex-1 flex-col"
      >
        <TabsList className={cn('shrink-0', variant === 'drawer' && 'px-3')}>
          <TabsTrigger value="learn">
            <BookOpen /> Entender
          </TabsTrigger>
          <TabsTrigger value="code" disabled={isDraft}>
            <Code /> Código
          </TabsTrigger>
          <TabsTrigger value="lab">
            <FlaskConical /> Lab
            {concept.labId && <span className="size-1.5 rounded-full bg-[var(--layer)]" />}
          </TabsTrigger>
          <TabsTrigger value="quiz" disabled={isDraft}>
            <GraduationCap /> Comprueba
          </TabsTrigger>
        </TabsList>

        <div
          ref={scrollRef}
          className={cn('min-h-0 flex-1', variant === 'drawer' ? 'overflow-y-auto px-5 py-6' : 'py-8')}
        >
          {status === 'loading' ? (
            <Skeleton />
          ) : (
            <>
              <TabsContent value="learn">
                {isDraft || !details || !Theory ? (
                  <DraftNotice id={id} onNavigate={onNavigate} />
                ) : (
                  <TheoryTab concept={concept} details={details} Theory={Theory} onNavigate={onNavigate} />
                )}
              </TabsContent>
              <TabsContent value="code">{details && <CodeTab snippets={details.snippets} />}</TabsContent>
              <TabsContent value="lab">
                <LabTab labId={concept.labId} />
              </TabsContent>
              <TabsContent value="quiz">
                {details && <QuizTab key={id} conceptId={id} questions={details.quiz} />}
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  )
}

function IconLink({ to, label, children }: { to: string; label: string; children: ReactNode }) {
  return (
    <Tooltip content={label}>
      <Link
        to={to}
        aria-label={label}
        className="flex size-8 items-center justify-center rounded-md text-subtle hover:bg-surface-2 hover:text-fg [&_svg]:size-4"
      >
        {children}
      </Link>
    </Tooltip>
  )
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[80, 95, 70, 88, 60].map((w, i) => (
        <div key={i} className="h-3.5 animate-pulse rounded bg-surface-2" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

function DraftNotice({ id, onNavigate }: { id: string; onNavigate: (id: string) => void }) {
  const concept = getConcept(id)!
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-dashed border-border-strong p-5">
        <p className="font-mono text-[10.5px] tracking-widest text-subtle">
          EN PREPARACIÓN · FASE {CONTENT_PHASE[concept.layer]}
        </p>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          La teoría, el código y el quiz de este concepto se publican en una fase posterior. Ya puedes
          ver dónde encaja en el ecosistema y qué necesitas saber antes.
        </p>
      </div>
      <RelationsPanel concept={concept} onNavigate={onNavigate} />
    </div>
  )
}
