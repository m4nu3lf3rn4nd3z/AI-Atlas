import type { ConceptDetails } from '../../schema'
import kvCacheSpeed from './snippets/kv_cache_speed.py?raw'
import kvMemory from './snippets/kv_memory.py?raw'
import trimHistory from './snippets/trim_history.ts?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Calculadora de memoria del KV cache',
      lang: 'python',
      code: kvMemory,
      deps: {},
      verifiedAt: '2026-09',
    },
    {
      title: 'Recortar el historial a un presupuesto de tokens',
      lang: 'typescript',
      code: trimHistory,
      deps: { 'gpt-tokenizer': '^4.0' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Generar con y sin KV cache',
      lang: 'python',
      code: kvCacheSpeed,
      deps: { torch: '>=2.2', transformers: '>=4.45' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Un modelo anuncia una ventana de 200k tokens. Tu prompt ocupa 195k y pides max_tokens = 16k. ¿Qué pasa?',
      options: [
        'Funciona: la ventana solo cuenta la entrada.',
        'La ventana cuenta entrada + salida, así que no hay sitio para 16k tokens de respuesta y la petición falla o se trunca.',
        'El modelo comprime el prompt automáticamente.',
        'Se ignora el límite si pagas más.',
      ],
      answer: 1,
      explain:
        'La ventana de contexto es el total de tokens que el modelo maneja en la llamada: lo que envías más lo que genera. Hay que reservar espacio para la respuesta.',
    },
    {
      q: '¿Qué guarda exactamente el KV cache?',
      options: [
        'Las respuestas anteriores del modelo para reutilizarlas.',
        'Los embeddings de entrada de cada token.',
        'Las keys y values calculadas en cada capa para los tokens ya procesados, para no recalcularlas en cada paso de generación.',
        'Las probabilidades del siguiente token.',
      ],
      answer: 2,
      explain:
        'Cada token nuevo necesita comparar su query con las keys de todos los anteriores y mezclar sus values. Como esas keys y values no cambian, se guardan una vez y se reutilizan.',
    },
    {
      q: 'Tu aplicación tiene un TTFT alto con prompts muy largos, pero una vez empieza a generar va rápido. ¿Qué fase es el cuello de botella?',
      options: [
        'El prefill, que procesa todo el prompt antes de emitir el primer token.',
        'El decode.',
        'El sampling.',
        'La tokenización de la respuesta.',
      ],
      answer: 0,
      explain:
        'El tiempo hasta el primer token lo domina el prefill, que crece con la longitud del prompt. Reducir el prompt o reutilizar un prefijo cacheado (prompt caching) ataca directamente ese tiempo.',
    },
    {
      q: 'En un chat de muchos turnos, ¿por qué el coste por mensaje sube aunque cada pregunta sea corta?',
      options: [
        'Porque el modelo se cansa.',
        'Porque el proveedor cobra un recargo por antigüedad.',
        'Porque el KV cache se guarda entre llamadas y ocupa espacio.',
        'Porque la API no tiene estado: cada turno reenvía y reprocesa toda la conversación anterior.',
      ],
      answer: 3,
      explain:
        'Cada llamada incluye el historial completo como entrada. Por eso se recorta, se resume o se cachea el prefijo común.',
    },
    {
      q: 'Metes un contrato de 300 páginas en el contexto y preguntas por una cláusula de la página 150. ¿Cuál es el riesgo principal?',
      options: [
        'Ninguno: si cabe, el modelo lo usa igual de bien.',
        'Que el tokenizador falle.',
        'Que el modelo aproveche peor la información del centro de un contexto largo, además del coste y la latencia.',
        'Que la temperatura suba sola.',
      ],
      answer: 2,
      explain:
        'Caber no es lo mismo que usarse bien. La información en medio de contextos muy largos se aprovecha peor. Recuperar las secciones relevantes suele dar mejores respuestas con menos coste.',
    },
  ],
  misconceptions: [
    {
      myth: 'Si el documento cabe en la ventana de contexto, ya no necesito RAG.',
      reality:
        'Cabe, pero cuesta más, tarda más y el modelo puede aprovechar peor el centro del contexto. Para bases de conocimiento grandes o que cambian, recuperar lo relevante sigue siendo lo habitual.',
    },
    {
      myth: 'El modelo recuerda la conversación entre llamadas.',
      reality:
        'La API es stateless: la "memoria" es el historial que tu aplicación reenvía en cada petición. Lo que no envías, no existe para el modelo.',
    },
    {
      myth: 'El KV cache es lo mismo que el prompt caching del proveedor.',
      reality:
        'El KV cache vive dentro de una generación. El prompt caching guarda ese estado entre peticiones distintas que comparten un prefijo idéntico, y por eso abarata las llamadas repetidas.',
    },
  ],
  sources: [
    {
      title: 'Liu et al. (2023) · Lost in the Middle: How Language Models Use Long Contexts',
      url: 'https://arxiv.org/abs/2307.03172',
      kind: 'paper',
    },
    {
      title: 'Pope et al. (2022) · Efficiently Scaling Transformer Inference',
      url: 'https://arxiv.org/abs/2211.05102',
      kind: 'paper',
    },
    {
      title: 'Kwon et al. (2023) · Efficient Memory Management for LLM Serving with PagedAttention',
      url: 'https://arxiv.org/abs/2309.06180',
      kind: 'paper',
    },
    {
      title: 'Chroma Research · Context Rot: How Increasing Input Tokens Impacts LLM Performance',
      url: 'https://research.trychroma.com/context-rot',
      kind: 'blog',
    },
    {
      title: 'Anthropic docs · Prompt caching',
      url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      kind: 'docs',
    },
  ],
}

export default details
