import type { ConceptDetails } from '../../schema'
import dataFormats from './snippets/data_formats.json?raw'
import dpoTrl from './snippets/dpo_trl.py?raw'
import sftTrl from './snippets/sft_trl.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Cómo son los datos de SFT y de preferencias',
      lang: 'json',
      code: dataFormats,
      deps: {},
      verifiedAt: '2026-09',
    },
    {
      title: 'SFT con TRL',
      lang: 'python',
      code: sftTrl,
      deps: { trl: '>=0.12', datasets: '>=3.0' },
      verifiedAt: '2026-09',
    },
    {
      title: 'DPO con TRL',
      lang: 'python',
      code: dpoTrl,
      deps: { trl: '>=0.12', datasets: '>=3.0', transformers: '>=4.45' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Le preguntas a un modelo base (solo pre-entrenado) «¿Cuál es la capital de Francia?». ¿Qué es lo más probable?',
      options: [
        'Que responda «París» y se detenga, como un asistente.',
        'Que continúe el texto de forma plausible, por ejemplo con más preguntas, porque aún no ha aprendido a comportarse como asistente.',
        'Que se niegue a responder.',
        'Que devuelva un error.',
      ],
      answer: 1,
      explain:
        'El modelo base sabe que la capital es París, pero su único objetivo ha sido continuar texto. El formato de pregunta-respuesta y el rol de asistente llegan con el SFT.',
    },
    {
      q: '¿En qué fase adquiere el modelo la mayor parte de su conocimiento del mundo?',
      options: [
        'En el pre-training, con billones de tokens.',
        'En el SFT.',
        'En la optimización por preferencias.',
        'En la inferencia, al leer tus prompts.',
      ],
      answer: 0,
      explain:
        'El post-training usa muchos menos datos y moldea sobre todo el comportamiento. El conocimiento viene casi entero de la exposición masiva a texto durante el pre-training.',
    },
    {
      q: '¿Qué diferencia principal hay entre RLHF clásico y DPO?',
      options: [
        'DPO necesita más datos humanos.',
        'RLHF no usa preferencias humanas.',
        'DPO optimiza directamente con los pares preferido/rechazado, sin entrenar un modelo de recompensa ni ejecutar un bucle de RL.',
        'DPO solo sirve para modelos de visión.',
      ],
      answer: 2,
      explain:
        'RLHF entrena primero un modelo que predice preferencias y luego optimiza el LLM contra él con RL (p. ej. PPO). DPO reformula el problema para aprender directamente de los pares, lo que es más simple y estable.',
    },
    {
      q: 'Tu equipo quiere que el modelo conozca el catálogo de productos (que cambia cada semana). ¿Qué recomendarías primero?',
      options: [
        'Un fine-tuning semanal con el catálogo.',
        'Reentrenar el modelo desde cero.',
        'Aumentar la temperatura.',
        'RAG: recuperar la información del catálogo y dársela en el contexto.',
      ],
      answer: 3,
      explain:
        'El fine-tuning moldea comportamiento mucho mejor que añade hechos, y un catálogo cambiante lo dejaría obsoleto enseguida. Con RAG los datos están siempre actualizados y se pueden citar.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo sigue aprendiendo de mis conversaciones mientras lo uso.',
      reality:
        'Los pesos están congelados durante la inferencia. Un proveedor puede usar datos para entrenar versiones futuras (según sus condiciones), pero el modelo que te responde no cambia entre llamadas.',
    },
    {
      myth: 'RLHF enseña al modelo a decir la verdad.',
      reality:
        'Optimiza hacia lo que los evaluadores prefieren. Suele mejorar la utilidad y la honestidad, pero también puede premiar respuestas que suenan bien o que dan la razón al usuario.',
    },
    {
      myth: 'Un modelo "instruct" y su modelo base son modelos completamente distintos.',
      reality:
        'Comparten casi todo: el instruct es el base con un post-training relativamente pequeño encima. Por eso muchos proyectos abiertos publican ambos.',
    },
  ],
  sources: [
    {
      title: 'Ouyang et al. (2022) · Training language models to follow instructions with human feedback (InstructGPT)',
      url: 'https://arxiv.org/abs/2203.02155',
      kind: 'paper',
    },
    {
      title: 'Rafailov et al. (2023) · Direct Preference Optimization',
      url: 'https://arxiv.org/abs/2305.18290',
      kind: 'paper',
    },
    {
      title: 'Hoffmann et al. (2022) · Training Compute-Optimal Large Language Models (Chinchilla)',
      url: 'https://arxiv.org/abs/2203.15556',
      kind: 'paper',
    },
    {
      title: 'Bai et al. (2022) · Constitutional AI: Harmlessness from AI Feedback',
      url: 'https://arxiv.org/abs/2212.08073',
      kind: 'paper',
    },
    {
      title: 'Zhou et al. (2023) · LIMA: Less Is More for Alignment',
      url: 'https://arxiv.org/abs/2305.11206',
      kind: 'paper',
    },
    { title: 'Meta (2024) · The Llama 3 Herd of Models', url: 'https://arxiv.org/abs/2407.21783', kind: 'paper' },
  ],
}

export default details
