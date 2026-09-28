import type { LayerId, RelationType } from './schema'

export interface Layer {
  id: LayerId
  index: number
  title: string
  /** One-word label for compact navigation. */
  short: string
  subtitle: string
  /** CSS variable holding the layer hue (theme-aware). */
  color: string
}

export const LAYERS: readonly Layer[] = [
  {
    id: 'fundamentals',
    index: 0,
    title: 'Fundamentos',
    short: 'Fundamentos',
    subtitle: 'Cómo funciona un LLM por dentro',
    color: 'var(--l0)',
  },
  {
    id: 'models',
    index: 1,
    title: 'Modelos y ecosistema',
    short: 'Modelos',
    subtitle: 'Qué modelos existen y cómo elegir',
    color: 'var(--l1)',
  },
  {
    id: 'inference',
    index: 2,
    title: 'Inferencia y despliegue',
    short: 'Inferencia',
    subtitle: 'Ejecutar modelos en local, en servidor y a qué coste',
    color: 'var(--l2)',
  },
  {
    id: 'adaptation',
    index: 3,
    title: 'Adaptar el modelo',
    short: 'Adaptación',
    subtitle: 'Prompting, salidas estructuradas y fine-tuning',
    color: 'var(--l3)',
  },
  {
    id: 'knowledge',
    index: 4,
    title: 'Conocimiento y memoria',
    short: 'Conocimiento',
    subtitle: 'RAG, búsqueda vectorial y memoria de agentes',
    color: 'var(--l4)',
  },
  {
    id: 'tools',
    index: 5,
    title: 'Herramientas y protocolos',
    short: 'Herramientas',
    subtitle: 'Tool calling, MCP y actuar en el mundo',
    color: 'var(--l5)',
  },
  {
    id: 'agents',
    index: 6,
    title: 'Agentes y orquestación',
    short: 'Agentes',
    subtitle: 'Bucles, grafos con estado y multi-agente',
    color: 'var(--l6)',
  },
  {
    id: 'production',
    index: 7,
    title: 'Producción',
    short: 'Producción',
    subtitle: 'Evals, observabilidad, seguridad y coste',
    color: 'var(--l7)',
  },
]

export const LAYER_BY_ID = Object.fromEntries(LAYERS.map((l) => [l.id, l])) as Record<
  LayerId,
  Layer
>

export const RELATION_LABELS: Record<RelationType | 'requires', { label: string; verb: string }> = {
  requires: { label: 'Prerrequisito', verb: 'requiere' },
  uses: { label: 'Usa', verb: 'usa' },
  implements: { label: 'Implementa', verb: 'implementa' },
  alternative: { label: 'Alternativa', verb: 'es alternativa a' },
  improves: { label: 'Mejora', verb: 'mejora' },
  'part-of': { label: 'Parte de', verb: 'es parte de' },
  enables: { label: 'Habilita', verb: 'habilita' },
  mitigates: { label: 'Mitiga', verb: 'mitiga' },
  evaluates: { label: 'Evalúa', verb: 'evalúa' },
}

export const KIND_LABELS = {
  concept: 'Concepto',
  technique: 'Técnica',
  tool: 'Herramienta',
  protocol: 'Protocolo',
  pattern: 'Patrón',
} as const

export const LEVEL_LABELS = { 1: 'Base', 2: 'Intermedio', 3: 'Avanzado' } as const

/** Build phase in which each layer's content is written (see docs/VISION.md). */
export const CONTENT_PHASE: Record<LayerId, number> = {
  fundamentals: 1,
  models: 2,
  inference: 2,
  knowledge: 2,
  adaptation: 3,
  tools: 3,
  agents: 3,
  production: 4,
}
