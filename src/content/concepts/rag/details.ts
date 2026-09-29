import type { ConceptDetails } from '../../schema'
import evalRetrieval from './snippets/eval_retrieval.py?raw'
import hybridRrf from './snippets/hybrid_rrf.ts?raw'
import ragMinimal from './snippets/rag_minimal.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'RAG mínimo con citas de Claude',
      lang: 'python',
      code: ragMinimal,
      deps: { anthropic: '>=0.40', 'sentence-transformers': '>=3.0', numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Necesita ANTHROPIC_API_KEY. El modelo de embeddings (unos 470 MB) se descarga la primera vez.',
    },
    {
      title: 'Búsqueda híbrida con Reciprocal Rank Fusion',
      lang: 'typescript',
      code: hybridRrf,
      deps: {},
      verifiedAt: '2026-09',
    },
    {
      title: 'Evaluar la recuperación: recall@k y MRR',
      lang: 'python',
      code: evalRetrieval,
      deps: {},
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Tu base de conocimiento son 40 páginas que cambian una vez al año. ¿Qué es probablemente lo más sencillo?',
      options: [
        'Montar una base vectorial con búsqueda híbrida y re-ranking.',
        'Hacer fine-tuning del modelo con esas páginas.',
        'Meter las 40 páginas en el prompt y cachear ese prefijo.',
        'Entrenar un modelo de embeddings propio.',
      ],
      answer: 2,
      explain:
        'Si todo cabe holgadamente en el contexto, pegarlo con prompt caching evita la complejidad de la recuperación y sus fallos. RAG compensa cuando el volumen crece, cambia a menudo o hay permisos por usuario.',
    },
    {
      q: 'Un usuario pregunta «¿qué significa el error E-4012?». ¿Qué recuperador tiene más papeletas de acertar a la primera?',
      options: [
        'BM25, porque el código es un término exacto y poco frecuente.',
        'Solo el denso, porque entiende el significado.',
        'Ninguno: los códigos no se pueden buscar.',
        'El reranker sin recuperación previa.',
      ],
      answer: 0,
      explain:
        'Los identificadores exactos son el terreno de la búsqueda léxica: un término raro pesa mucho en BM25. Los embeddings suelen acertar también, pero con códigos parecidos entre sí se confunden más. Por eso se combinan.',
    },
    {
      q: 'Tras activar la búsqueda híbrida, el recall baja respecto a la búsqueda densa sola. ¿Qué explicación es plausible?',
      options: [
        'RRF tiene un error de implementación seguro.',
        'La búsqueda híbrida siempre es peor.',
        'Los embeddings dejan de funcionar al combinarlos.',
        'BM25 aporta ruido en este corpus y, al fusionar por posiciones, empuja hacia abajo documentos que el denso tenía primeros.',
      ],
      answer: 3,
      explain:
        'RRF da el mismo peso a las dos listas. Si una de ellas es mala para tu tipo de preguntas, la fusión puede empeorar a la mejor. Por eso hay que medir con tus preguntas en lugar de asumir que híbrido siempre gana.',
    },
    {
      q: '¿Cómo debe impedirse que un usuario vea en las respuestas información de documentos a los que no tiene acceso?',
      options: [
        'Pidiendo al modelo en el system prompt que no revele información confidencial.',
        'Filtrando por permisos en la búsqueda, para que esos documentos nunca lleguen a su prompt.',
        'Usando un modelo más grande.',
        'Cifrando los embeddings.',
      ],
      answer: 1,
      explain:
        'Lo que está en el contexto puede acabar en la respuesta, sobre todo ante una prompt injection. El control de acceso se aplica antes, en la recuperación.',
    },
    {
      q: 'Preguntan algo que tu base de conocimiento no cubre. ¿Qué comportamiento buscas?',
      options: [
        'Que el sistema siempre pase los 5 fragmentos más parecidos, por si acaso.',
        'Que el modelo improvise con su conocimiento general sin avisar.',
        'Que un umbral de relevancia deje el contexto vacío y el modelo responda que no tiene esa información.',
        'Que se devuelva un error HTTP.',
      ],
      answer: 2,
      explain:
        'Pasar fragmentos irrelevantes invita al modelo a construir una respuesta con ellos. Un umbral (por ejemplo, sobre la puntuación del reranker) y la instrucción de decir «no lo sé» reducen las respuestas inventadas.',
    },
  ],
  misconceptions: [
    {
      myth: 'Con RAG el modelo ya no alucina.',
      reality:
        'Las alucinaciones bajan si la recuperación trae el fragmento correcto. Si no llega, o llega uno parecido pero equivocado, el modelo puede inventar con mucha seguridad.',
    },
    {
      myth: 'RAG es lo mismo que una base de datos vectorial.',
      reality:
        'La base vectorial es una pieza. Un RAG que funciona depende tanto o más de la extracción del texto, el chunking, los metadatos, el re-ranking, el prompt y la evaluación.',
    },
    {
      myth: 'La búsqueda híbrida siempre mejora a la densa.',
      reality:
        'Suele ayudar, sobre todo con términos exactos, pero la fusión puede empeorar el resultado si una de las dos listas es mala para tus preguntas. Se decide midiendo.',
    },
  ],
  sources: [
    {
      title: 'Lewis et al. (2020) · Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      kind: 'paper',
    },
    {
      title: 'Cormack, Clarke y Büttcher (2009) · Reciprocal Rank Fusion outperforms Condorcet and individual Rank Learning Methods',
      url: 'https://plg.uwaterloo.ca/~gvcormac/cormacksigir09-rrf.pdf',
      kind: 'paper',
    },
    {
      title: 'Es et al. (2023) · Ragas: Automated Evaluation of Retrieval Augmented Generation',
      url: 'https://arxiv.org/abs/2309.15217',
      kind: 'paper',
    },
    {
      title: 'Gao et al. (2023) · Retrieval-Augmented Generation for Large Language Models: A Survey',
      url: 'https://arxiv.org/abs/2312.10997',
      kind: 'paper',
    },
    {
      title: 'Anthropic (2024) · Introducing Contextual Retrieval',
      url: 'https://www.anthropic.com/news/contextual-retrieval',
      kind: 'blog',
    },
    {
      title: 'Claude docs · Citations',
      url: 'https://platform.claude.com/docs/en/build-with-claude/citations',
      kind: 'docs',
    },
    {
      title: 'OWASP · LLM08:2025 Vector and Embedding Weaknesses',
      url: 'https://genai.owasp.org/llmrisk/llm082025-vector-and-embedding-weaknesses/',
      kind: 'docs',
    },
  ],
}

export default details
