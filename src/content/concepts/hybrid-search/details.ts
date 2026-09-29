import type { ConceptDetails } from '../../schema'
import postgresHybrid from './snippets/postgres_hybrid.sql?raw'
import qdrantHybrid from './snippets/qdrant_hybrid.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Híbrida en PostgreSQL con RRF en SQL',
      lang: 'sql',
      code: postgresHybrid,
      deps: { pgvector: '>=0.7', postgresql: '>=15' },
      verifiedAt: '2026-09',
      note: 'Basado en el ejemplo oficial de pgvector-python, con el analizador de español.',
    },
    {
      title: 'Híbrida en Qdrant: denso + BM25 disperso',
      lang: 'python',
      code: qdrantHybrid,
      deps: { 'qdrant-client': '>=1.12', fastembed: '>=0.4', 'sentence-transformers': '>=3.0' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'En BM25, ¿por qué el término «E-4012» pesa mucho más que «envío» en una base de conocimiento de logística?',
      options: [
        'Porque es más largo.',
        'Porque aparece en muy pocos documentos, así que su IDF es alto; «envío» aparece en casi todos.',
        'Porque contiene números.',
        'Porque BM25 da más peso a las mayúsculas.',
      ],
      answer: 1,
      explain: 'La IDF premia los términos raros: distinguen mejor unos documentos de otros. Por eso la búsqueda léxica brilla con códigos e identificadores.',
    },
    {
      q: '¿Por qué no se pueden sumar sin más la puntuación de BM25 y la similitud coseno?',
      options: [
        'Porque están en escalas distintas: BM25 no tiene techo y el coseno se mueve en un rango estrecho, así que una dominaría a la otra.',
        'Porque una es positiva y la otra negativa.',
        'Porque la base de datos no lo permite.',
        'Sí se pueden sumar directamente.',
      ],
      answer: 0,
      explain: 'Hay que normalizar las puntuaciones y ponderarlas (con un α ajustado con datos) o fusionar por posiciones con RRF.',
    },
    {
      q: '¿Qué aporta un modelo disperso aprendido como SPLADE frente a BM25?',
      options: [
        'Nada: es BM25 con otro nombre.',
        'Vectores densos de 1.024 dimensiones.',
        'Pesos por palabra aprendidos y expansión a términos relacionados, manteniendo la eficiencia de un índice invertido.',
        'Un reranker integrado.',
      ],
      answer: 2,
      explain: 'Sigue siendo un vector disperso sobre el vocabulario, pero incluye términos que no aparecen en el texto y pondera mejor los que sí.',
    },
    {
      q: 'Tras añadir BM25 a tu búsqueda densa, el recall empeora. ¿Qué revisas primero?',
      options: [
        'El tamaño de los vectores densos.',
        'La temperatura del LLM.',
        'El número de réplicas de la base de datos.',
        'El analizador de texto de BM25 (idioma, stemming) y si la parte léxica aporta algo en tus preguntas.',
      ],
      answer: 3,
      explain:
        'Un analizador en inglés sobre textos en español, o preguntas sin términos distintivos, hacen que BM25 aporte ruido. Y con RRF, ese ruido empuja hacia abajo los aciertos del denso.',
    },
  ],
  misconceptions: [
    {
      myth: 'La búsqueda híbrida siempre es mejor que la densa.',
      reality: 'Suele ayudar con términos exactos, pero puede empeorar si la parte léxica es ruidosa para tus preguntas. Hay que medirlo.',
    },
    {
      myth: 'BM25 está obsoleto desde que existen los embeddings.',
      reality: 'Sigue siendo una base muy fuerte, barata y explicable, y en muchos benchmarks de recuperación es difícil de batir en dominios con vocabulario específico.',
    },
  ],
  sources: [
    {
      title: 'Robertson y Zaragoza (2009) · The Probabilistic Relevance Framework: BM25 and Beyond',
      url: 'https://www.staff.city.ac.uk/~sbrp622/papers/foundations_bm25_review.pdf',
      kind: 'paper',
    },
    {
      title: 'Cormack, Clarke y Büttcher (2009) · Reciprocal Rank Fusion',
      url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf',
      kind: 'paper',
    },
    {
      title: 'Bruch et al. (2022) · An Analysis of Fusion Functions for Hybrid Retrieval',
      url: 'https://arxiv.org/abs/2210.11934',
      kind: 'paper',
    },
    {
      title: 'Formal et al. (2021) · SPLADE: Sparse Lexical and Expansion Model for First Stage Ranking',
      url: 'https://arxiv.org/abs/2107.05720',
      kind: 'paper',
    },
    {
      title: 'Qdrant · Hybrid Queries',
      url: 'https://qdrant.tech/documentation/concepts/hybrid-queries/',
      kind: 'docs',
    },
    {
      title: 'Elasticsearch · Reciprocal rank fusion',
      url: 'https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion',
      kind: 'docs',
    },
    {
      title: 'pgvector-python · Hybrid search with RRF',
      url: 'https://github.com/pgvector/pgvector-python/blob/master/examples/hybrid_search/rrf.py',
      kind: 'repo',
    },
  ],
}

export default details
