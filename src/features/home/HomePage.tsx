import { Activity, ArrowRight, FlaskConical, Network, Route, Sparkles } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card, SectionLabel } from '@/components/ui/primitives'
import { CONCEPTS, conceptsInLayer, getConcept, hasContent, WRITTEN_COUNT } from '@/content'
import { LAYER_BY_ID, LAYERS } from '@/content/layers'
import { LABS } from '@/labs/registry'
import { useProgress } from '@/stores/progress'
import { recommendNext } from '../progress/recommend'

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
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] opacity-70"
        style={{
          background:
            'radial-gradient(600px 260px at 20% 0%, color-mix(in oklab, var(--l0) 16%, transparent), transparent), radial-gradient(500px 240px at 85% 10%, color-mix(in oklab, var(--l2) 12%, transparent), transparent)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8">
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
              Un mapa interactivo del stack moderno de IA: qué hace cada pieza, de qué depende, cómo se
              ve en código y qué pasa cuando la tocas. Con labs que calculan de verdad, no animaciones
              guionizadas.
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

        <section className="mt-20 grid gap-4 md:grid-cols-3">
          <Feature
            to="/labs"
            icon={FlaskConical}
            title="Labs que calculan"
            color="var(--l2)"
            text={`Tokenizadores reales, softmax real, embeddings reales en tu navegador. ${labsReady} de ${LABS.length} labs disponibles.`}
          />
          <Feature
            to="/journey"
            icon={Activity}
            title="Anatomía de una petición"
            color="var(--l6)"
            text="Sigue una pregunta real a través de todas las capas y cambia la arquitectura para ver qué cambia. Llega en la fase 3."
          />
          <Feature
            to="/paths"
            icon={Route}
            title="Rutas de aprendizaje"
            color="var(--l4)"
            text="Recorridos ordenados por prerrequisitos: cómo piensa un LLM, tu primer RAG, de chatbot a agente…"
          />
        </section>

        <section className="mt-16">
          <Card className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
            <Sparkles className="size-6 text-accent" />
            <div>
              <SectionLabel>Estado del atlas</SectionLabel>
              <p className="mt-2 text-[14px] leading-relaxed text-muted">
                <b className="text-fg">{WRITTEN_COUNT}</b> de {CONCEPTS.length} conceptos publicados (capa
                Fundamentos completa). El resto ya está en el mapa con sus relaciones y prerrequisitos, marcado
                como <span className="font-mono text-[12px]">pronto</span>. Cada concepto indica cuándo se
                revisó y en qué fuentes primarias se basa.
              </p>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}

function StackPreview() {
  const progress = useProgress((s) => s.concepts)
  return (
    <div className="space-y-1.5" aria-label="Capas del ecosistema">
      {[...LAYERS].reverse().map((layer) => {
        const concepts = conceptsInLayer(layer.id)
        const written = concepts.filter((c) => hasContent(c.id)).length
        const learned = concepts.filter((c) => progress[c.id]?.learnedAt).length
        return (
          <Link
            key={layer.id}
            to={`/map?view=list#${layer.id}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-surface/70 px-4 py-2.5 backdrop-blur transition-colors hover:border-[var(--layer)]"
            style={{ '--layer': layer.color } as CSSProperties}
          >
            <span className="w-5 font-mono text-[11px] text-[var(--layer)]">{layer.index}</span>
            <span className="flex-1 text-[13.5px] font-medium">{layer.title}</span>
            <span className="flex gap-[3px]">
              {concepts.map((c, i) => (
                <span
                  key={c.id}
                  className="h-2.5 w-1.5 rounded-sm"
                  style={{
                    background:
                      i < learned
                        ? 'var(--ok)'
                        : hasContent(c.id)
                          ? LAYER_BY_ID[layer.id].color
                          : 'var(--border-strong)',
                    opacity: hasContent(c.id) ? 1 : 0.6,
                  }}
                />
              ))}
            </span>
            <span className="w-10 text-right font-mono text-[10.5px] text-subtle">
              {written}/{concepts.length}
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
