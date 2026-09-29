import type { ConceptDetails } from '../../schema'
import measureStream from './snippets/measure_stream.py?raw'
import percentiles from './snippets/percentiles.ts?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Medir TTFT, velocidad y coste con streaming',
      lang: 'python',
      code: measureStream,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Necesita ANTHROPIC_API_KEY. Mide varias veces: una sola petición no dice nada de los percentiles.',
    },
    {
      title: 'Percentiles frente a media',
      lang: 'typescript',
      code: percentiles,
      deps: {},
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Tu asistente tarda 12 segundos en completar las respuestas, pero los usuarios dicen que «va rápido». ¿Qué lo explica mejor?',
      options: [
        'Que los usuarios no miran el reloj.',
        'Que usa streaming y el primer token llega enseguida: la latencia percibida es el TTFT, no la total.',
        'Que el modelo es pequeño.',
        'Que el coste es bajo.',
      ],
      answer: 1,
      explain: 'Con streaming el usuario empieza a leer en el TTFT. Por eso TTFT y velocidad de salida se miden por separado.',
    },
    {
      q: 'Tu p50 de TTFT es 0,5 s y tu p95 es 4 s. ¿Qué indica?',
      options: [
        'Una cola de peticiones lentas (colas del servidor, prompts muy largos, reintentos) que la media o la mediana esconden.',
        'Que el sistema funciona bien para todos.',
        'Un error en el cálculo: p95 no puede ser 8 veces el p50.',
        'Que hay que bajar la temperatura.',
      ],
      answer: 0,
      explain: 'El p95 describe lo que sufre 1 de cada 20 usuarios. Hay que investigar esa cola: suele venir de colas de espera, prompts largos o reintentos.',
    },
    {
      q: 'Un agente da 30 vueltas y cada vuelta reenvía un system prompt de 8.000 tokens con las herramientas. ¿Qué reduce más el coste de entrada?',
      options: [
        'Subir la temperatura.',
        'Pedir respuestas más cortas.',
        'Usar un modelo con más contexto.',
        'Prompt caching del prefijo estable: se escribe una vez y en las vueltas siguientes se lee a una fracción del precio.',
      ],
      answer: 3,
      explain: 'El prefijo idéntico (instrucciones y herramientas) se paga entero en cada vuelta sin caché. Con caché, las lecturas cuestan una fracción.',
    },
    {
      q: '¿Por qué un modelo de razonamiento puede costar mucho más que otro con el mismo precio por token?',
      options: [
        'Porque cobra por segundo.',
        'Porque sus tokens de entrada son más caros.',
        'Porque genera tokens de pensamiento que se facturan como salida aunque no se muestren.',
        'Porque no admite caché.',
      ],
      answer: 2,
      explain: 'El razonamiento son tokens de salida. Regular el esfuerzo de razonamiento es una palanca directa de coste y latencia.',
    },
  ],
  misconceptions: [
    {
      myth: 'El coste de un LLM depende sobre todo de la longitud de las respuestas.',
      reality: 'En RAG y agentes suele dominar la entrada: contexto recuperado, historial y herramientas se reenvían en cada llamada.',
    },
    {
      myth: 'La latencia media describe la experiencia de los usuarios.',
      reality: 'La media mezcla la mayoría rápida con una cola lenta. Los objetivos se fijan en percentiles (p95, p99).',
    },
  ],
  sources: [
    {
      title: 'NVIDIA NIM · LLM benchmarking metrics (TTFT, ITL, throughput)',
      url: 'https://docs.nvidia.com/nim/benchmarking/llm/latest/metrics.html',
      kind: 'docs',
    },
    {
      title: 'Claude docs · Prompt caching',
      url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      kind: 'docs',
    },
    {
      title: 'Claude docs · Batch processing',
      url: 'https://platform.claude.com/docs/en/build-with-claude/batch-processing',
      kind: 'docs',
    },
    {
      title: 'Claude docs · Streaming messages',
      url: 'https://platform.claude.com/docs/en/build-with-claude/streaming',
      kind: 'docs',
    },
  ],
}

export default details
