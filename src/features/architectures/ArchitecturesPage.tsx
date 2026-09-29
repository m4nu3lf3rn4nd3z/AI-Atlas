import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { SectionLabel } from '@/components/ui/primitives'
import { ARCH_CATEGORIES, ARCHITECTURES } from './arch-data'

export default function ArchitecturesPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
      <header className="mb-10">
        <p className="font-mono text-[11px] tracking-[0.14em] text-subtle">ARQUITECTURAS DE REFERENCIA</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Patrones de implementación
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Diagramas de los patrones de arquitectura más habituales en sistemas con LLMs. Cada patrón
          incluye los componentes, sus roles, casos de uso reales y los trade-offs clave.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ARCHITECTURES.map((arch) => {
          const cat = ARCH_CATEGORIES[arch.category]
          return (
            <Link
              key={arch.id}
              to={`/architectures/${arch.id}`}
              className="group flex flex-col rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong"
            >
              {/* diagram preview */}
              <div className="rounded-t-2xl border-b border-border bg-surface-2 px-4 pt-5 pb-3">
                <arch.Diagram />
              </div>

              {/* metadata */}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold"
                    style={{
                      background: `color-mix(in oklab, ${cat.color} 12%, transparent)`,
                      color: cat.color,
                    }}
                  >
                    {cat.label}
                  </span>
                </div>
                <h2 className="text-[15px] font-semibold">{arch.title}</h2>
                <p className="text-[13px] leading-relaxed text-muted">{arch.subtitle}</p>
                <ul className="mt-1 space-y-0.5">
                  {arch.useCases.slice(0, 2).map((uc) => (
                    <li key={uc} className="flex items-start gap-1.5 text-[12.5px] text-subtle">
                      <span className="mt-[5px] size-1 shrink-0 rounded-full bg-border-strong" />
                      {uc}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto flex items-center gap-1 pt-2 text-[12.5px] text-subtle group-hover:text-fg">
                  Ver diagrama completo <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6">
        <SectionLabel>¿Qué son estos patrones?</SectionLabel>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted">
          Los patrones de arquitectura aquí recogidos representan las formas más frecuentes de estructurar
          sistemas con LLMs en producción. No son recetas rígidas: los sistemas reales suelen combinar varios
          (por ejemplo, un agente que usa RAG y produce output estructurado). Cada diagrama muestra el flujo
          de datos principal y los componentes clave, no la infraestructura completa de despliegue.
        </p>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-muted">
          Para entender los conceptos detrás de cada componente, explora el{' '}
          <Link to="/map" className="text-accent underline underline-offset-2 hover:no-underline">mapa del ecosistema</Link>{' '}
          o sigue una{' '}
          <Link to="/paths" className="text-accent underline underline-offset-2 hover:no-underline">ruta de aprendizaje</Link>.
        </p>
      </section>
    </div>
  )
}
