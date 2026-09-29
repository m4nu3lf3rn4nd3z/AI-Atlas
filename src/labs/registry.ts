import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

/* Every lab in the product. `load` is present once the lab is built;
   the rest are listed so the roadmap is visible in the UI. */

export type Reality = 'real' | 'mixed' | 'simulated'

export interface LabInfo {
  id: string
  title: string
  short: string
  concept: string
  reality: Reality
  realityNote: string
  phase: number
  Component?: LazyExoticComponent<ComponentType>
}

export const LABS: readonly LabInfo[] = [
  {
    id: 'tokenizer',
    title: 'Tokenizer',
    short: 'Escribe texto y mira cómo lo trocea un tokenizador real. Compara idiomas, código y emojis.',
    concept: 'tokenization',
    reality: 'real',
    realityNote: 'Tokenizadores BPE reales (o200k_base, cl100k_base) ejecutándose en tu navegador.',
    phase: 1,
    Component: lazy(() => import('./tokenizer/TokenizerLab')),
  },
  {
    id: 'sampling',
    title: 'Sampling',
    short: 'Temperature, top-k, top-p y min-p sobre la distribución real del siguiente token.',
    concept: 'sampling',
    reality: 'mixed',
    realityNote: 'Matemática real sobre distribuciones capturadas de un modelo real.',
    phase: 2,
  },
  {
    id: 'embeddings',
    title: 'Espacio de embeddings',
    short: 'Convierte frases en vectores, proyéctalas en 2D y mide su similitud.',
    concept: 'embeddings',
    reality: 'real',
    realityNote: 'Modelo de embeddings real ejecutándose en tu navegador.',
    phase: 2,
  },
  {
    id: 'chunking',
    title: 'Chunking',
    short: 'Trocea un documento con varias estrategias y comprueba si la búsqueda encuentra la respuesta completa.',
    concept: 'chunking',
    reality: 'real',
    realityNote: 'Algoritmos reales de chunking, tokens contados con o200k y recuperación con BM25.',
    phase: 2,
    Component: lazy(() => import('./chunking/ChunkingLab')),
  },
  {
    id: 'rag',
    title: 'Pipeline RAG',
    short: 'Indexa un corpus, consulta y compara recuperación vectorial, BM25 e híbrida.',
    concept: 'rag',
    reality: 'mixed',
    realityNote: 'Recuperación real; re-ranking precomputado.',
    phase: 2,
  },
  {
    id: 'vram',
    title: 'VRAM y cuantización',
    short: '¿Cabe este modelo en tu GPU? Pesos, KV cache, velocidad y el error de cuantizar.',
    concept: 'quantization',
    reality: 'real',
    realityNote: 'Cálculo real con las arquitecturas publicadas de cada modelo y pesos reales de Qwen2.5 para la cuantización.',
    phase: 2,
    Component: lazy(() => import('./vram/VramLab')),
  },
  {
    id: 'context',
    title: 'Contexto y caché',
    short: 'Llena la ventana de contexto y compara truncado, resumen y prompt caching.',
    concept: 'context-window',
    reality: 'mixed',
    realityNote: 'Conteo de tokens real; estrategias simuladas.',
    phase: 4,
  },
  {
    id: 'tool-calling',
    title: 'Tool calling',
    short: 'Recorre el bucle tool_use → ejecución → tool_result paso a paso.',
    concept: 'tool-calling',
    reality: 'mixed',
    realityNote: 'Bucle y funciones reales; respuestas del modelo guionizadas.',
    phase: 3,
  },
  {
    id: 'mcp',
    title: 'MCP Inspector',
    short: 'Mensajes JSON-RPC entre host, cliente y servidor MCP, incluido un servidor malicioso.',
    concept: 'mcp',
    reality: 'simulated',
    realityNote: 'Simulación fiel a la especificación del protocolo.',
    phase: 3,
  },
  {
    id: 'agent-graph',
    title: 'Agent Graph',
    short: 'Depura un grafo con estado: pasos, checkpoints, time-travel e interrupción humana.',
    concept: 'stateful-graphs',
    reality: 'mixed',
    realityNote: 'Motor de estado real; comportamiento de los nodos guionizado.',
    phase: 3,
  },
  {
    id: 'injection',
    title: 'Prompt injection',
    short: 'Ataca a un agente de email y activa defensas para ver cuáles funcionan.',
    concept: 'prompt-injection',
    reality: 'simulated',
    realityNote: 'Simulación basada en reglas.',
    phase: 4,
  },
  {
    id: 'evals',
    title: 'Evals',
    short: 'Compara variantes de un pipeline con métricas reales y un juez LLM.',
    concept: 'evals',
    reality: 'mixed',
    realityNote: 'Métricas reales sobre salidas precomputadas.',
    phase: 4,
  },
  {
    id: 'decision',
    title: '¿Prompt, RAG o fine-tuning?',
    short: 'Responde unas preguntas sobre tu caso y obtén una recomendación razonada.',
    concept: 'prompt-rag-finetune',
    reality: 'real',
    realityNote: 'Lógica de decisión explícita.',
    phase: 4,
  },
]

export const LAB_BY_ID: ReadonlyMap<string, LabInfo> = new Map(LABS.map((l) => [l.id, l]))

export const REALITY_LABELS: Record<Reality, string> = {
  real: 'Real',
  mixed: 'Real + guionizado',
  simulated: 'Simulación',
}
