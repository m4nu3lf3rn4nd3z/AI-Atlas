import { ArrowRight, Briefcase, FlaskConical, LayoutTemplate, Network, Route, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, SectionLabel } from '@/components/ui/primitives'
import { CONCEPTS, conceptsInLayer, getConcept, WRITTEN_COUNT } from '@/content'
import { LAYERS } from '@/content/layers'
import { CASES } from '@/cases'
import { TOOLS } from '@/content/tools'
import { LABS } from '@/labs/registry'
import { ARCHITECTURES } from '@/features/architectures/arch-data'
import { useProgress } from '@/stores/progress'
import { recommendNext } from '../progress/recommend'
import { PROGRESS_STYLE, progressState } from '../progress/status'

export default function HomePage() {
  const progress = useProgress((s) => s.concepts)
  const lastVisited = getConcept(useProgress((s) => s.lastVisited))
  const next = recommendNext(progress)
  const learnedCount = CONCEPTS.filter((c) => progress[c.id]?.learnedAt).length
  const labsReady = LABS.filter((l) => l.Component).length

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[500px] opacity-60"
        style={{
          background:
            'radial-gradient(700px 300px at 15% 0%, color-mix(in oklab, var(--l0) 14%, transparent), transparent), radial-gradient(500px 280px at 90% 5%, color-mix(in oklab, var(--l2) 10%, transparent), transparent)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-10 pb-20 sm:px-8">

        {/* ── Hero ────────────────────────────────────────────────── */}
        <section className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] tracking-[0.14em] text-subtle">
              AI ATLAS · DE LOS TOKENS A PRODUCCIÓN
            </p>
            <h1 className="mt-4 text-4xl leading-[1.08] font-semibold tracking-tight sm:text-5xl">
              Entiende cómo encajan
              <br />
              <span className="bg-gradient-to-r from-[var(--l0)] via-[var(--l2)] to-[var(--l4)] bg-clip-text text-transparent">
                las piezas de la IA.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-muted">
              Un mapa interactivo del stack moderno: tokenización, embeddings, RAG, tool calling,
              agentes y producción. Labs que calculan de verdad, diagramas de arquitectura de
              referencia y rutas de aprendizaje ordenadas por prerrequisitos.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild variant="primary" size="lg">
                <Link to={next ? `/c/${next.id}` : '/paths/how-llms-think'}>
                  {learnedCount === 0 ? 'Empezar por los fundamentos' : `Siguiente: ${next?.title ?? 'ruta'}`}
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/map">
                  <Network /> Explorar el mapa
                </Link>
              </Button>
            </div>
            {lastVisited && (
              <p className="mt-5 text-[13px] text-subtle">
                Último visitado:{' '}
                <Link to={`/c/${lastVisited.id}`} className="text-muted underline underline-offset-2 hover:text-fg">
                  {lastVisited.title}
                </Link>
              </p>
            )}
          </div>

          <StackPreview />
        </section>

        {/* ── Stats bar ───────────────────────────────────────────── */}
        <div className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat value={String(WRITTEN_COUNT)} label="conceptos publicados" color="var(--l0)" />
          <Stat value={String(labsReady)}     label="labs interactivos"   color="var(--l2)" />
          <Stat value={String(CASES.length)}  label="casos de uso"        color="var(--l6)" />
          <Stat value={String(ARCHITECTURES.length)} label="arquitecturas de referencia" color="var(--l4)" />
        </div>

        {/* ── Features ────────────────────────────────────────────── */}
        <section className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Feature
            to="/labs"
            icon={FlaskConical}
            title="Labs que calculan"
            color="var(--l2)"
            text={`Tokenizadores reales, softmax real, embeddings en tu navegador. ${labsReady} de ${LABS.length} disponibles.`}
          />
          <Feature
            to="/architectures"
            icon={LayoutTemplate}
            title="Arquitecturas"
            color="var(--l4)"
            text={`${ARCHITECTURES.length} patrones de implementación con diagramas interactivos: RAG, agentes, producción y más.`}
          />
          <Feature
            to="/cases"
            icon={Briefcase}
            title="Casos de uso"
            color="var(--l6)"
            text={`${CASES.length} sistemas reales con laboratorio: cambia componentes y ve qué impacto tiene en la arquitectura.`}
          />
          <Feature
            to="/paths"
            icon={Route}
            title="Rutas de aprendizaje"
            color="var(--l5)"
            text="Recorridos ordenados por prerrequisitos: cómo piensa un LLM, tu primer RAG, de chatbot a agente…"
          />
        </section>

        {/* ── Atlas status ────────────────────────────────────────── */}
        <section className="mt-14">
          <Card className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-start">
            <Sparkles className="mt-0.5 size-5 text-accent" />
            <div>
              <SectionLabel>Qué cubre el atlas</SectionLabel>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                <b className="text-fg">{WRITTEN_COUNT}</b> de {CONCEPTS.length} conceptos publicados abarcando las{' '}
                <b className="text-fg">8 capas</b> del stack moderno de IA: desde tokenización y sampling hasta
                guardrails y observabilidad en producción. La capa de <b className="text-fg">Fundamentos</b> está
                completa. <b className="text-fg">{CASES.length}</b> casos de uso con laboratorio,{' '}
                <b className="text-fg">{TOOLS.length}</b> herramientas catalogadas y{' '}
                <b className="text-fg">{ARCHITECTURES.length}</b> patrones de arquitectura con diagramas de referencia.
              </p>
              <p className="mt-2 text-[13.5px] text-subtle">
                Los conceptos pendientes ya aparecen en el mapa con sus relaciones marcados como{' '}
                <span className="font-mono text-[12px]">pronto</span>. Todo el contenido indica fecha de revisión y fuentes.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div
      className="rounded-2xl border border-border bg-surface px-5 py-4"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <p className="text-2xl font-bold tracking-tight" style={{ color }}>{value}</p>
      <p className="mt-0.5 text-[12.5px] text-muted">{label}</p>
    </div>
  )
}

function StackPreview() {
  const progress = useProgress((s) => s.concepts)
  return (
    <div className="space-y-1.5" aria-label="Capas del ecosistema">
      {LAYERS.map((layer) => {
        const concepts = conceptsInLayer(layer.id)
        const learned = concepts.filter((c) => progress[c.id]?.learnedAt).length
        return (
          <Link
            key={layer.id}
            to={`/map#${layer.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface/70 px-4 py-2.5 backdrop-blur transition-colors hover:border-[var(--layer)]"
            style={{ '--layer': layer.color } as CSSProperties}
          >
            <span className="w-5 font-mono text-[11px] text-[var(--layer)]">{layer.index}</span>
            <span className="flex-1 text-[13.5px] font-medium">{layer.title}</span>
            <span className="flex gap-[2px]" aria-hidden>
              {concepts.map((c) => {
                const style = PROGRESS_STYLE[progressState(c.id, progress[c.id])]
                return (
                  <span
                    key={c.id}
                    className="h-2.5 w-1.5 rounded-sm"
                    style={{ background: style.background, border: style.border }}
                  />
                )
              })}
            </span>
            <span className="w-14 text-right font-mono text-[10.5px] text-subtle" title="aprendidos / conceptos de la capa">
              {learned}/{concepts.length}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function Feature({
  to,
  icon: Icon,
  title,
  text,
  color,
}: {
  to: string
  icon: typeof Network
  title: string
  text: string
  color: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
    >
      <span
        className="flex size-9 items-center justify-center rounded-lg"
        style={{ background: `color-mix(in oklab, ${color} 14%, transparent)`, color }}
      >
        <Icon className="size-4.5" />
      </span>
      <h3 className="mt-4 text-[15px] font-semibold">{title}</h3>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{text}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-subtle group-hover:text-fg">
        Abrir <ArrowRight className="size-3.5" />
      </span>
    </Link>
  )
}
