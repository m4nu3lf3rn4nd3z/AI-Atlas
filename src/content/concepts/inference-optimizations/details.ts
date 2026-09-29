import type { ConceptDetails } from '../../schema'
import promptCaching from './snippets/prompt_caching.py?raw'
import speculativeHf from './snippets/speculative_hf.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Prompt caching con Claude',
      lang: 'python',
      code: promptCaching,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Necesita ANTHROPIC_API_KEY. Si el prefijo es más corto que el mínimo cacheable del modelo, cache_creation_input_tokens será 0.',
    },
    {
      title: 'Decodificación especulativa con Transformers',
      lang: 'python',
      code: speculativeHf,
      deps: { transformers: '>=4.45', torch: '>=2.2', accelerate: '>=0.34' },
      verifiedAt: '2026-09',
      note: 'Necesita una GPU con memoria para ambos modelos (unos 17 GB en BF16).',
    },
  ],
  quiz: [
    {
      q: 'Tu prompt empieza con la fecha y hora actuales y después lleva 20.000 tokens de instrucciones fijas. El prompt caching no te ahorra nada. ¿Por qué?',
      options: [
        'Porque la caché funciona por prefijo y el principio cambia en cada petición: hay que mover lo variable al final.',
        'Porque 20.000 tokens son demasiados para cachear.',
        'Porque las fechas no se pueden tokenizar.',
        'Porque la caché solo funciona con streaming.',
      ],
      answer: 0,
      explain: 'Un solo carácter distinto al principio invalida todo lo que viene detrás. Lo estable va primero; lo variable, al final.',
    },
    {
      q: '¿Cambia FlashAttention el resultado de la atención?',
      options: [
        'Sí: es una aproximación más rápida.',
        'Sí: solo atiende a los tokens cercanos.',
        'No: calcula exactamente lo mismo, pero por bloques y sin escribir la matriz completa en la memoria lenta.',
        'Solo cuando el modelo está cuantizado.',
      ],
      answer: 2,
      explain: 'Es una implementación consciente de la jerarquía de memoria de la GPU. Mismo resultado, menos tráfico de memoria, más velocidad.',
    },
    {
      q: 'En la decodificación especulativa, ¿qué pasa con la calidad de la salida?',
      options: [
        'Empeora un poco, porque parte de los tokens los escribe el modelo pequeño.',
        'Mejora, porque dos modelos piensan más que uno.',
        'Depende de la temperatura.',
        'Con el esquema de verificación adecuado, la salida sigue exactamente la distribución del modelo grande: solo cambia la velocidad.',
      ],
      answer: 3,
      explain: 'El modelo grande verifica cada propuesta y rechaza las que no habría generado. El borrador solo decide cuánto se acelera.',
    },
    {
      q: '¿Qué optimización reduce el KV cache por diseño del modelo y no por configuración del runtime?',
      options: ['Prompt caching', 'Grouped-query attention (GQA)', 'Continuous batching', 'Streaming'],
      answer: 1,
      explain: 'GQA comparte keys y values entre cabezas de atención: está en la arquitectura. Las demás son técnicas del runtime o del servidor.',
    },
  ],
  misconceptions: [
    {
      myth: 'Cachear el prompt significa guardar las respuestas.',
      reality: 'El prompt caching guarda el estado interno (KV cache) del prefijo; la respuesta se genera de nuevo en cada petición. Guardar respuestas es la caché semántica, con otros riesgos.',
    },
    {
      myth: 'Las optimizaciones de inferencia siempre sacrifican calidad.',
      reality: 'FlashAttention, el prompt caching, el continuous batching y la decodificación especulativa bien hecha dan el mismo resultado. La cuantización sí intercambia precisión por memoria.',
    },
  ],
  sources: [
    {
      title: 'Dao et al. (2022) · FlashAttention: Fast and Memory-Efficient Exact Attention with IO-Awareness',
      url: 'https://arxiv.org/abs/2205.14135',
      kind: 'paper',
    },
    {
      title: 'Leviathan et al. (2022) · Fast Inference from Transformers via Speculative Decoding',
      url: 'https://arxiv.org/abs/2211.17192',
      kind: 'paper',
    },
    {
      title: 'Chen et al. (2023) · Accelerating Large Language Model Decoding with Speculative Sampling',
      url: 'https://arxiv.org/abs/2302.01318',
      kind: 'paper',
    },
    {
      title: 'Ainslie et al. (2023) · GQA: Training Generalized Multi-Query Transformer Models',
      url: 'https://arxiv.org/abs/2305.13245',
      kind: 'paper',
    },
    {
      title: 'Claude docs · Prompt caching',
      url: 'https://platform.claude.com/docs/en/build-with-claude/prompt-caching',
      kind: 'docs',
    },
    {
      title: 'Hugging Face · Assisted Generation',
      url: 'https://huggingface.co/blog/assisted-generation',
      kind: 'blog',
    },
  ],
}

export default details
