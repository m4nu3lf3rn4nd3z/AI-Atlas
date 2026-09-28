import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/primitives'
import { getConcept, hasContent } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'

/* Phase 1 shows the outline of the trace. Phase 3 turns each stage into an
   interactive step with real payloads, token counts, latency and cost, plus
   architecture switches that change the outcome. */

const STAGES = [
  { concept: 'guardrails', title: 'Guardrail de entrada', what: 'Se clasifica la petición: ¿intento de inyección?, ¿datos sensibles?, ¿fuera de alcance?' },
  { concept: 'workflow-patterns', title: 'Router', what: 'Decide el camino: responder directamente, buscar en documentos o usar herramientas.' },
  { concept: 'embedding-models', title: 'Embedding de la consulta', what: 'La pregunta se convierte en un vector con el mismo modelo que indexó los documentos.' },
  { concept: 'hybrid-search', title: 'Recuperación', what: 'Búsqueda vectorial + BM25 sobre la base de conocimiento; se fusionan los rankings.' },
  { concept: 'reranking', title: 'Re-ranking', what: 'Un cross-encoder reordena los candidatos y se quedan los mejores fragmentos.' },
  { concept: 'prompt-engineering', title: 'Ensamblado del contexto', what: 'System prompt + fragmentos recuperados + historial + definición de herramientas.' },
  { concept: 'tokenization', title: 'Tokenización', what: 'Todo el contexto se convierte en tokens: aquí se decide el coste de entrada.' },
  { concept: 'context-window', title: 'Prefill', what: 'El modelo procesa el prompt completo en paralelo y llena el KV cache (TTFT).' },
  { concept: 'tool-calling', title: 'Tool call', what: 'El modelo decide que necesita reservar un día y emite una petición estructurada.' },
  { concept: 'mcp', title: 'Servidor MCP', what: 'La app host ejecuta la herramienta de calendario a través de un servidor MCP (JSON-RPC).' },
  { concept: 'sampling', title: 'Decode', what: 'Con el resultado de la herramienta, el modelo genera la respuesta token a token.' },
  { concept: 'guardrails', title: 'Guardrail de salida', what: 'Se valida la respuesta: formato, datos sensibles, afirmaciones sin fuente.' },
  { concept: 'observability', title: 'Traza y evaluación', what: 'Cada paso queda registrado con tokens, latencia y coste; la traza alimenta los evals.' },
]

export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
      <Badge color="var(--l6)">Fase 3 · en construcción</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Anatomía de una petición</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted">
        Una sola pregunta de un empleado a un asistente interno,{' '}
        <i className="text-fg">«¿Cuántos días de vacaciones me quedan? Resérvame el viernes»</i>, recorriendo
        todas las capas del stack. En la versión interactiva verás el JSON real de cada paso, los tokens, la
        latencia y el coste, y podrás cambiar la arquitectura (sin RAG, sin reranker, modelo pequeño,
        cuantizado, sin guardrails…) para ver qué cambia en el resultado.
      </p>
      <p className="mt-3 text-[13.5px] text-subtle">De momento, este es el recorrido completo:</p>

      <ol className="relative mt-8 space-y-1 before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-0.5 before:bg-gradient-to-b before:from-[var(--l7)] before:via-[var(--l4)] before:to-[var(--l6)]">
        {STAGES.map((s, i) => {
          const c = getConcept(s.concept)!
          const color = LAYER_BY_ID[c.layer].color
          return (
            <li key={`${s.title}-${i}`} className="relative flex gap-4" style={{ '--layer': color } as CSSProperties}>
              <span className="relative z-10 mt-4 size-6 shrink-0 rounded-full border-2 border-bg bg-[var(--layer)]" />
              <div className="flex-1 rounded-xl px-3 py-3">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[10.5px] text-subtle">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-[14.5px] font-medium">{s.title}</span>
                  <Link
                    to={`/c/${c.id}`}
                    className="text-[12px] text-[var(--layer)] hover:underline"
                    title={hasContent(c.id) ? undefined : 'Concepto en preparación'}
                  >
                    {c.title}
                  </Link>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted">{s.what}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
