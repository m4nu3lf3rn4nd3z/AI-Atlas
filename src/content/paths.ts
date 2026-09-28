import type { LearningPath } from './schema'

export const PATHS: LearningPath[] = [
  {
    id: 'how-llms-think',
    title: 'Cómo piensa un LLM',
    description:
      'De texto a tokens, de tokens a vectores, de vectores a una probabilidad. Todo lo que pasa dentro del modelo entre tu prompt y su respuesta.',
    steps: [
      { concept: 'tokenization', why: 'Lo primero que le pasa a tu texto, y la unidad en la que pagas.' },
      { concept: 'embeddings', why: 'Cómo un número de token se convierte en significado.' },
      { concept: 'attention', why: 'El mecanismo que relaciona cada palabra con su contexto.' },
      { concept: 'next-token', why: 'Lo único que hace un LLM: predecir el siguiente token.' },
      { concept: 'sampling', why: 'Cómo se elige ese token, y qué hace de verdad la temperatura.' },
      { concept: 'context-window', why: 'Por qué el contexto es limitado y cuesta memoria.' },
      { concept: 'training', why: 'Cómo un predictor de texto se convierte en un asistente.' },
      { concept: 'reasoning-models', why: 'Pensar antes de responder: el salto de 2024-2025.' },
      { concept: 'mixture-of-experts', why: 'Cómo se escalan los modelos sin disparar el coste.' },
    ],
  },
  {
    id: 'first-rag',
    title: 'Tu primer RAG',
    description: 'Construye mentalmente un sistema que responde con tus documentos, y aprende dónde falla.',
    steps: [
      { concept: 'embeddings', why: 'La base de la búsqueda semántica.' },
      { concept: 'context-window', why: 'Dónde acaban los documentos recuperados.' },
      { concept: 'rag', why: 'La arquitectura completa.' },
      { concept: 'chunking', why: 'La decisión que más influye en la calidad.' },
      { concept: 'embedding-models', why: 'Elegir el modelo que vectoriza.' },
      { concept: 'vector-databases', why: 'Dónde viven los vectores.' },
      { concept: 'hybrid-search', why: 'Cuando las palabras exactas importan.' },
      { concept: 'reranking', why: 'Precisión en el top-k.' },
      { concept: 'evals', why: 'Cómo saber si tu RAG funciona.' },
    ],
  },
  {
    id: 'chatbot-to-agent',
    title: 'De chatbot a agente',
    description: 'Del modelo que habla al sistema que actúa: herramientas, protocolos, bucles y orquestación.',
    steps: [
      { concept: 'llm-apis', why: 'El contrato con el modelo.' },
      { concept: 'structured-outputs', why: 'Salidas que tu código puede parsear.' },
      { concept: 'tool-calling', why: 'El modelo pide, tu código ejecuta.' },
      { concept: 'mcp', why: 'Herramientas reutilizables entre aplicaciones.' },
      { concept: 'agent-loop', why: 'El bucle que convierte llamadas en autonomía.' },
      { concept: 'workflow-patterns', why: 'Cuándo NO necesitas un agente.' },
      { concept: 'stateful-graphs', why: 'Control, persistencia y humanos en el bucle.' },
      { concept: 'multi-agent', why: 'Dividir el trabajo entre especialistas.' },
      { concept: 'prompt-injection', why: 'El precio de dar herramientas a un modelo.' },
    ],
  },
  {
    id: 'local-ai',
    title: 'IA local en tu PC',
    description: 'Qué modelo cabe en tu hardware, en qué formato y con qué runtime.',
    steps: [
      { concept: 'open-vs-closed', why: 'Qué significa "open weights".' },
      { concept: 'hugging-face', why: 'Dónde encontrar modelos.' },
      { concept: 'quantization', why: 'Hacer que quepa en tu GPU.' },
      { concept: 'weight-formats', why: 'GGUF, safetensors y compañía.' },
      { concept: 'context-window', why: 'El KV cache también ocupa memoria.' },
      { concept: 'local-runtimes', why: 'Ollama, llama.cpp y LM Studio.' },
      { concept: 'latency-cost-metrics', why: 'Medir si va lo bastante rápido.' },
    ],
  },
  {
    id: 'production',
    title: 'Llevar a producción',
    description: 'Lo que separa una demo de un sistema fiable: medir, observar, proteger y optimizar.',
    steps: [
      { concept: 'evals', why: 'Tests para sistemas no deterministas.' },
      { concept: 'llm-as-judge', why: 'Evaluar a escala.' },
      { concept: 'observability', why: 'Ver qué pasa en cada petición.' },
      { concept: 'prompt-injection', why: 'El riesgo principal.' },
      { concept: 'guardrails', why: 'Controles de entrada y salida.' },
      { concept: 'owasp-llm-top10', why: 'El mapa completo de riesgos.' },
      { concept: 'cost-latency-optimization', why: 'Pagar menos, responder antes.' },
    ],
  },
]

export const PATH_BY_ID: ReadonlyMap<string, LearningPath> = new Map(PATHS.map((p) => [p.id, p]))
