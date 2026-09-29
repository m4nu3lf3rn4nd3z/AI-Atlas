import type { ConceptDetails } from '../../schema'
import chromaQuickstart from './snippets/chroma_quickstart.py?raw'
import qdrantFilter from './snippets/qdrant_filter.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Búsqueda filtrada por cliente y vigencia con Qdrant',
      lang: 'python',
      code: qdrantFilter,
      deps: { 'qdrant-client': '>=1.12', 'sentence-transformers': '>=3.0' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Chroma embebido para prototipos',
      lang: 'python',
      code: chromaQuickstart,
      deps: { chromadb: '>=0.5' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Tu aplicación ya usa PostgreSQL y vas a indexar unos 2 millones de fragmentos. ¿Cuál es un buen punto de partida?',
      options: [
        'pgvector en la base de datos que ya tienes, y medir antes de añadir otra pieza.',
        'Una base vectorial dedicada desde el primer día.',
        'Guardar los vectores en ficheros JSON.',
        'Un índice FAISS en memoria sin persistencia.',
      ],
      answer: 0,
      explain:
        'pgvector evita operar y sincronizar otro sistema, y rinde bien en ese volumen. Una base dedicada compensa cuando la escala, la latencia o los filtros lo exigen.',
    },
    {
      q: 'Varios clientes comparten la misma colección. ¿Dónde debe aplicarse el filtro de cliente?',
      options: [
        'En el prompt, pidiendo al modelo que ignore los documentos de otros clientes.',
        'En la interfaz, ocultando resultados.',
        'En la consulta a la base vectorial, en el servidor, siempre.',
        'No hace falta si los embeddings están normalizados.',
      ],
      answer: 2,
      explain: 'Lo que llega al contexto puede acabar en la respuesta. El aislamiento entre clientes se garantiza en la recuperación, no con instrucciones al modelo.',
    },
    {
      q: '¿Por qué conviene guardar en los metadatos la versión del modelo de embeddings?',
      options: [
        'Porque la base vectorial lo exige.',
        'Porque los vectores de modelos distintos no son comparables y hay que evitar mezclarlos al migrar.',
        'Para calcular el coste.',
        'Para acelerar la búsqueda.',
      ],
      answer: 1,
      explain: 'Al cambiar de modelo hay que recalcular todo. Saber qué modelo generó cada vector permite migrar de forma controlada y detectar mezclas.',
    },
    {
      q: '¿Son los embeddings de tus documentos un dato «anonimizado»?',
      options: [
        'Sí: son solo números.',
        'Sí, si tienen más de 1.000 dimensiones.',
        'Solo si están cuantizados.',
        'No: se ha demostrado que se puede reconstruir buena parte del texto a partir de ellos.',
      ],
      answer: 3,
      explain: 'Los ataques de inversión de embeddings recuperan gran parte del texto original. Deben protegerse como el propio texto.',
    },
  ],
  misconceptions: [
    {
      myth: 'Para hacer RAG necesito una base de datos vectorial dedicada.',
      reality:
        'Con pocos documentos basta la búsqueda exacta en memoria; con Postgres, pgvector; con un buscador, su búsqueda vectorial. La dedicada es una opción para escala o requisitos concretos.',
    },
    {
      myth: 'La base vectorial es la fuente de verdad.',
      reality: 'Es un índice derivado de tus documentos. Debe poder reconstruirse desde ellos, y actualizarse o borrarse cuando cambian.',
    },
  ],
  sources: [
    {
      title: 'pgvector · Open-source vector similarity search for Postgres',
      url: 'https://github.com/pgvector/pgvector',
      kind: 'repo',
    },
    {
      title: 'Qdrant · Multitenancy',
      url: 'https://qdrant.tech/documentation/guides/multiple-partitions/',
      kind: 'docs',
    },
    {
      title: 'Qdrant · Filtering',
      url: 'https://qdrant.tech/documentation/concepts/filtering/',
      kind: 'docs',
    },
    {
      title: 'Morris et al. (2023) · Text Embeddings Reveal (Almost) As Much As Text',
      url: 'https://arxiv.org/abs/2310.06816',
      kind: 'paper',
    },
    {
      title: 'OWASP · LLM08:2025 Vector and Embedding Weaknesses',
      url: 'https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/',
      kind: 'docs',
    },
    {
      title: 'Chroma Docs · Introduction',
      url: 'https://docs.trychroma.com/docs/overview/introduction',
      kind: 'docs',
    },
  ],
}

export default details
