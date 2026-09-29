import type { ConceptDetails } from '../../schema'
import faissRecall from './snippets/faiss_recall.py?raw'
import pgvectorHnsw from './snippets/pgvector_hnsw.sql?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Recall frente a velocidad con FAISS',
      lang: 'python',
      code: faissRecall,
      deps: { 'faiss-cpu': '>=1.8', numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Con vectores aleatorios los números son peores que con embeddings reales, que tienen estructura; la tendencia es la misma.',
    },
    {
      title: 'Índice HNSW en PostgreSQL con pgvector',
      lang: 'sql',
      code: pgvectorHnsw,
      deps: { pgvector: '>=0.7' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Tienes 20.000 fragmentos. ¿Necesitas un índice ANN?',
      options: [
        'Sí, siempre.',
        'Probablemente no: la búsqueda exacta sobre 20.000 vectores tarda milisegundos y siempre acierta.',
        'Sí, porque la búsqueda exacta no admite coseno.',
        'Solo si los vectores tienen más de 1.024 dimensiones.',
      ],
      answer: 1,
      explain: 'Los índices ANN compensan con volúmenes grandes o latencias muy exigentes. Por debajo, la búsqueda exacta es más simple y precisa.',
    },
    {
      q: '¿Qué parámetro de HNSW cambias para ganar recall a costa de latencia, sin reconstruir el índice?',
      options: ['M', 'ef_construction', 'La dimensión de los vectores', 'ef_search'],
      answer: 3,
      explain: 'ef_search controla cuántos candidatos se exploran en cada consulta. M y ef_construction se fijan al construir el grafo.',
    },
    {
      q: '¿Qué mide el recall@10 de un índice ANN?',
      options: [
        'Qué fracción de los 10 vecinos verdaderos (los de la búsqueda exacta) devuelve el índice.',
        'Si la respuesta final del LLM es correcta.',
        'Cuántas consultas por segundo soporta.',
        'La similitud media de los resultados.',
      ],
      answer: 0,
      explain:
        'Se compara con la búsqueda exacta. Ojo: es el recall del índice respecto al vecino matemático, no la calidad de la recuperación para tus preguntas, que depende también del modelo de embeddings.',
    },
    {
      q: 'Buscas los vecinos de un cliente concreto que tiene el 0,1 % de los documentos. Filtras después de buscar los 10 más cercanos. ¿Qué puede pasar?',
      options: [
        'Nada: el filtro posterior siempre es exacto.',
        'Que el índice se corrompa.',
        'Que entre los 10 más cercanos no haya ninguno de ese cliente y la búsqueda devuelva cero resultados.',
        'Que devuelva documentos de otros clientes.',
      ],
      answer: 2,
      explain:
        'Con filtros muy selectivos, el post-filtrado se queda sin resultados. Las bases vectoriales combinan índices de metadatos y búsqueda exacta sobre el subconjunto para resolverlo.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un índice ANN devuelve los vecinos exactos.',
      reality: 'Devuelve casi siempre los mismos, pero no siempre. Por eso se mide su recall frente a la búsqueda exacta y se ajusta.',
    },
    {
      myth: 'La calidad de un RAG depende sobre todo del índice.',
      reality:
        'Con un recall del índice del 95–99 %, lo que más influye es el modelo de embeddings, el chunking y los filtros. El índice decide sobre todo latencia, memoria y coste.',
    },
  ],
  sources: [
    {
      title: 'Malkov y Yashunin (2016) · Efficient and robust approximate nearest neighbor search using HNSW graphs',
      url: 'https://arxiv.org/abs/1603.09320',
      kind: 'paper',
    },
    {
      title: 'Douze et al. (2024) · The Faiss library',
      url: 'https://arxiv.org/abs/2401.08281',
      kind: 'paper',
    },
    {
      title: 'ANN-Benchmarks: comparativa de algoritmos de vecinos aproximados',
      url: 'https://ann-benchmarks.com',
      kind: 'docs',
    },
    {
      title: 'pgvector · índices HNSW e IVFFlat',
      url: 'https://github.com/pgvector/pgvector',
      kind: 'repo',
    },
    {
      title: 'Qdrant · Filtering',
      url: 'https://qdrant.tech/documentation/concepts/filtering/',
      kind: 'docs',
    },
  ],
}

export default details
