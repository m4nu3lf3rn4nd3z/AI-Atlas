import type { ConceptDetails } from '../../schema'
import contextualChunks from './snippets/contextual_chunks.py?raw'
import semanticChunks from './snippets/semantic_chunks.py?raw'
import splitters from './snippets/splitters.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Recursivo y por estructura con LangChain',
      lang: 'python',
      code: splitters,
      deps: { 'langchain-text-splitters': '>=0.3', tiktoken: '>=0.7' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Chunking semántico con embeddings',
      lang: 'python',
      code: semanticChunks,
      deps: { 'sentence-transformers': '>=3.0', numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Descarga un modelo de embeddings multilingüe de unos 470 MB la primera vez.',
    },
    {
      title: 'Contextual retrieval con Claude',
      lang: 'python',
      code: contextualChunks,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Necesita ANTHROPIC_API_KEY. Una llamada por fragmento: con prompt caching, el documento solo se paga entero una vez.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué no se suele indexar un documento de 40 páginas como un único vector?',
      options: [
        'Porque las bases vectoriales no admiten vectores tan grandes.',
        'Porque tardaría demasiado en generarse.',
        'Porque el vector sería una media de muchos temas, se parecería poco a cualquier pregunta concreta, y además habría que meter el documento entero en el prompt.',
        'Porque los embeddings solo funcionan con frases sueltas.',
      ],
      answer: 2,
      explain:
        'Un solo vector resume todo el documento y pierde precisión; además, recuperar el documento completo gasta contexto. Los fragmentos permiten encontrar y enviar solo lo relevante.',
    },
    {
      q: 'Trabajas con fragmentos de 40 tokens. ¿Qué problema es más probable?',
      options: [
        'Fragmentos sin contexto suficiente: «el plazo es de 5 días» sin decir de qué plazo se trata.',
        'Que el índice ocupe demasiado poco.',
        'Que el modelo de embeddings los rechace.',
        'Ninguno: cuanto más pequeños, más precisos.',
      ],
      answer: 0,
      explain:
        'Los fragmentos muy pequeños casan bien con preguntas concretas, pero pierden el contexto que los hace útiles y aumentan el riesgo de partir una respuesta en dos.',
    },
    {
      q: '¿Qué resuelve el solape entre fragmentos y qué cuesta?',
      options: [
        'Elimina la necesidad de elegir un tamaño.',
        'Mejora siempre el recall sin coste.',
        'Evita tener que guardar metadatos.',
        'Reduce la información que se pierde justo en los cortes, a cambio de duplicar texto en el índice y en el prompt.',
      ],
      answer: 3,
      explain:
        'El solape ayuda cuando una idea cae en la frontera entre dos fragmentos, pero duplica contenido y no sustituye a cortar por los límites naturales del texto.',
    },
    {
      q: '¿En qué consiste contextual retrieval?',
      options: [
        'En recuperar más fragmentos y dejar que el modelo elija.',
        'En que un LLM escribe un contexto breve para cada fragmento, que se antepone antes de calcular el embedding y el índice BM25.',
        'En usar la ventana de contexto completa en lugar de RAG.',
        'En guardar el historial de la conversación en la base vectorial.',
      ],
      answer: 1,
      explain:
        'Cada fragmento pasa a llevar una o dos frases que lo sitúan en su documento. Anthropic midió una reducción de fallos de recuperación del 49 % (embeddings + BM25) y del 67 % añadiendo re-ranking.',
    },
    {
      q: '¿Cuál es la mejor forma de elegir el tamaño y la estrategia de chunking?',
      options: [
        'Usar siempre 512 tokens, que es el estándar.',
        'Copiar la configuración por defecto del framework.',
        'Medir la recuperación con preguntas reales de tu dominio y comparar configuraciones.',
        'Elegir el tamaño máximo que admita el modelo de embeddings.',
      ],
      answer: 2,
      explain:
        'Depende del tipo de documento, del modelo de embeddings y de las preguntas. Un conjunto pequeño de preguntas con su fragmento correcto permite comparar opciones con números.',
    },
  ],
  misconceptions: [
    {
      myth: 'Hay un tamaño de chunk óptimo universal, como 512 tokens.',
      reality:
        'Depende del contenido, del modelo de embeddings y de las preguntas. Los valores por defecto de algunos frameworks rinden mal en ciertos corpus: hay que medir.',
    },
    {
      myth: 'Cuanto más solape, mejor.',
      reality:
        'El solape duplica texto en el índice y en el prompt. En la evaluación de Chroma (2024) no mejoró el recall frente a un splitter recursivo sin solape.',
    },
    {
      myth: 'El chunking es un detalle de implementación.',
      reality:
        'Determina qué puede encontrar la búsqueda y qué ve el modelo. Junto con la extracción del texto, es de lo que más influye en la calidad de un RAG.',
    },
  ],
  sources: [
    {
      title: 'Chroma Research (2024) · Evaluating Chunking Strategies for Retrieval',
      url: 'https://research.trychroma.com/evaluating-chunking',
      kind: 'blog',
    },
    {
      title: 'Anthropic (2024) · Introducing Contextual Retrieval',
      url: 'https://www.anthropic.com/news/contextual-retrieval',
      kind: 'blog',
    },
    {
      title: 'Günther et al. (2024) · Late Chunking: Contextual Chunk Embeddings Using Long-Context Embedding Models',
      url: 'https://arxiv.org/abs/2409.04701',
      kind: 'paper',
    },
    {
      title: 'Chen et al. (2023) · Dense X Retrieval: What Retrieval Granularity Should We Use?',
      url: 'https://arxiv.org/abs/2312.06648',
      kind: 'paper',
    },
    {
      title: 'LangChain · Text splitters',
      url: 'https://docs.langchain.com/oss/python/integrations/splitters',
      kind: 'docs',
    },
    {
      title: 'Anthropic Cookbook · Contextual embeddings',
      url: 'https://github.com/anthropics/claude-cookbooks/blob/main/capabilities/contextual-embeddings/guide.ipynb',
      kind: 'repo',
    },
  ],
}

export default details
