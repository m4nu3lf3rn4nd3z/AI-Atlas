import type { ConceptDetails } from '../../schema'
import loadTest from './snippets/load_test.py?raw'
import vllmServe from './snippets/vllm_serve.sh?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Servir un modelo con vLLM',
      lang: 'bash',
      code: vllmServe,
      deps: { vllm: '>=0.10' },
      verifiedAt: '2026-09',
      note: 'Necesita una GPU NVIDIA (o AMD con ROCm) con memoria para los pesos y el KV cache.',
    },
    {
      title: 'Prueba de carga: throughput frente a latencia',
      lang: 'python',
      code: loadTest,
      deps: { openai: '>=1.40' },
      verifiedAt: '2026-09',
      note: 'Usa el cliente de OpenAI solo como cliente HTTP del estándar Chat Completions que expone vLLM.',
    },
  ],
  quiz: [
    {
      q: '¿Qué resuelve el continuous batching frente al batching estático?',
      options: [
        'Que el modelo sea más preciso.',
        'Que los huecos que dejan las secuencias que terminan antes se rellenen con peticiones nuevas en cada paso, manteniendo la GPU ocupada.',
        'Que no haga falta KV cache.',
        'Que cada usuario tenga su propia GPU.',
      ],
      answer: 1,
      explain: 'El lote se recompone paso a paso: sale lo que termina y entra lo que espera. El throughput sube mucho sin cambiar el modelo.',
    },
    {
      q: '¿Qué idea toma PagedAttention de los sistemas operativos?',
      options: [
        'La memoria virtual: el KV cache se reparte en bloques de tamaño fijo asignados bajo demanda, en lugar de reservar el máximo por secuencia.',
        'La planificación de procesos por prioridad.',
        'El sistema de ficheros.',
        'Las interrupciones de hardware.',
      ],
      answer: 0,
      explain: 'Al asignar bloques según se necesitan, casi no se desperdicia memoria, caben más secuencias en el lote y los prefijos comunes se comparten.',
    },
    {
      q: 'Subes el tamaño de lote y el throughput total del servidor aumenta, pero los usuarios se quejan. ¿Qué ha pasado?',
      options: [
        'El modelo se ha degradado.',
        'Nada: más throughput siempre es mejor experiencia.',
        'Se ha llenado el disco.',
        'Cada usuario recibe menos tokens por segundo y espera más en la cola: el throughput subió a costa de la latencia.',
      ],
      answer: 3,
      explain: 'Throughput y latencia compiten. Se ajusta el lote para cumplir objetivos de TTFT y velocidad por usuario, no para maximizar tokens por segundo.',
    },
    {
      q: 'Un modelo de 140 GB en BF16 no cabe en una GPU de 80 GB. ¿Qué tipo de paralelismo lo resuelve dentro de un nodo?',
      options: ['Réplicas de datos', 'Streaming', 'Paralelismo tensorial: cada capa se reparte entre varias GPUs', 'Continuous batching'],
      answer: 2,
      explain: 'Las réplicas copian el modelo entero, así que no ayudan si no cabe. El paralelismo tensorial reparte las matrices de cada capa entre GPUs conectadas con enlaces rápidos.',
    },
  ],
  misconceptions: [
    {
      myth: 'Para servir a más usuarios hay que añadir GPUs proporcionalmente.',
      reality: 'Gracias al batching, una GPU atiende muchas conversaciones a la vez: el límite suele ser la memoria para el KV cache de todas ellas y los objetivos de latencia.',
    },
    {
      myth: 'Servir modelos propios siempre es más barato que una API.',
      reality: 'Solo con uso alto y constante. GPUs ociosas, arranques lentos y operación tienen coste; con tráfico variable, la API suele salir mejor.',
    },
  ],
  sources: [
    {
      title: 'Kwon et al. (2023) · Efficient Memory Management for LLM Serving with PagedAttention',
      url: 'https://arxiv.org/abs/2309.06180',
      kind: 'paper',
    },
    {
      title: 'Yu et al. (2022) · Orca: A Distributed Serving System for Transformer-Based Generative Models',
      url: 'https://www.usenix.org/conference/osdi22/presentation/yu',
      kind: 'paper',
    },
    {
      title: 'Zheng et al. (2023) · SGLang: Efficient Execution of Structured Language Model Programs',
      url: 'https://arxiv.org/abs/2312.07104',
      kind: 'paper',
    },
    {
      title: 'Zhong et al. (2024) · DistServe: Disaggregating Prefill and Decoding for Goodput-optimized LLM Serving',
      url: 'https://arxiv.org/abs/2401.09670',
      kind: 'paper',
    },
    {
      title: 'vLLM · Automatic Prefix Caching',
      url: 'https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html',
      kind: 'docs',
    },
  ],
}

export default details
