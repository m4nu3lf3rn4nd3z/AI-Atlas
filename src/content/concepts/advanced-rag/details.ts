import type { ConceptDetails } from '../../schema'
import agenticRag from './snippets/agentic_rag.py?raw'
import multiQuery from './snippets/multi_query.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Agentic RAG con tool use de Claude',
      lang: 'python',
      code: agenticRag,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Necesita ANTHROPIC_API_KEY. El bucle repite mientras el modelo pida búsquedas.',
    },
    {
      title: 'Múltiples consultas fusionadas con RRF',
      lang: 'python',
      code: multiQuery,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'En un chat, el usuario pregunta «¿y para Canarias?» después de preguntar por los plazos de entrega. ¿Qué técnica resuelve la recuperación?',
      options: [
        'GraphRAG.',
        'Subir k a 50.',
        'Reescribir la consulta con el historial para convertirla en una pregunta completa antes de buscar.',
        'Cambiar de base vectorial.',
      ],
      answer: 2,
      explain: '«¿Y para Canarias?» no contiene la información necesaria para buscar. La reescritura con el contexto del chat es el primer paso de cualquier RAG conversacional.',
    },
    {
      q: '¿En qué tipo de pregunta aporta más GraphRAG?',
      options: [
        'Preguntas globales sobre todo el corpus, como «¿cuáles son los temas principales de estos tickets?».',
        'Preguntas sobre un dato concreto de un documento.',
        'Preguntas con un código de error exacto.',
        'Preguntas en otro idioma.',
      ],
      answer: 0,
      explain: 'Ningún fragmento individual responde a una pregunta global. Los resúmenes de comunidades del grafo sí. Para datos concretos, un RAG normal es más barato y suficiente.',
    },
    {
      q: '¿Cuál es el principal coste de pasar de un RAG fijo a un agentic RAG?',
      options: [
        'Que ya no se pueden usar embeddings.',
        'Más latencia, más coste y menos previsibilidad: el modelo decide cuántas búsquedas hace.',
        'Que no admite preguntas de varios pasos.',
        'Que hay que reentrenar el modelo.',
      ],
      answer: 1,
      explain: 'Ganas flexibilidad para preguntas de varios saltos, pero cada búsqueda es una vuelta más del bucle. Conviene limitar las iteraciones y medir.',
    },
    {
      q: '¿Qué riesgo tiene HyDE?',
      options: [
        'Que no funciona con modelos multilingües.',
        'Que necesita un índice ANN especial.',
        'Que duplica el tamaño del índice.',
        'Que si la respuesta hipotética que escribe el modelo es incorrecta, la búsqueda se va hacia documentos equivocados.',
      ],
      answer: 3,
      explain: 'HyDE busca con el embedding de una respuesta inventada. Funciona cuando esa respuesta «suena» como los documentos correctos; si el modelo se equivoca de tema, arrastra la búsqueda.',
    },
  ],
  misconceptions: [
    {
      myth: 'Cuantas más técnicas avanzadas, mejor RAG.',
      reality: 'Cada técnica añade latencia, coste y puntos de fallo. Se aplican para corregir fallos medidos, no por defecto.',
    },
    {
      myth: 'Agentic RAG sustituye a una buena recuperación.',
      reality: 'Un agente que busca con una recuperación mala solo hace más búsquedas malas. La calidad de cada búsqueda sigue siendo la base.',
    },
  ],
  sources: [
    {
      title: 'Gao et al. (2022) · Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)',
      url: 'https://arxiv.org/abs/2212.10496',
      kind: 'paper',
    },
    {
      title: 'Edge et al. (2024) · From Local to Global: A Graph RAG Approach to Query-Focused Summarization',
      url: 'https://arxiv.org/abs/2404.16130',
      kind: 'paper',
    },
    {
      title: 'Sarthi et al. (2024) · RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval',
      url: 'https://arxiv.org/abs/2401.18059',
      kind: 'paper',
    },
    {
      title: 'Asai et al. (2023) · Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection',
      url: 'https://arxiv.org/abs/2310.11511',
      kind: 'paper',
    },
    {
      title: 'Yan et al. (2024) · Corrective Retrieval Augmented Generation',
      url: 'https://arxiv.org/abs/2401.15884',
      kind: 'paper',
    },
    {
      title: 'Anthropic (2024) · Introducing Contextual Retrieval',
      url: 'https://www.anthropic.com/news/contextual-retrieval',
      kind: 'blog',
    },
  ],
}

export default details
