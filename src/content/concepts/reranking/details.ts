import type { ConceptDetails } from '../../schema'
import crossEncoder from './snippets/cross_encoder.py?raw'
import rerankJs from './snippets/rerank_js.ts?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Cross-encoder con umbral de relevancia',
      lang: 'python',
      code: crossEncoder,
      deps: { 'sentence-transformers': '>=3.0' },
      verifiedAt: '2026-09',
      note: 'Descarga bge-reranker-v2-m3 (unos 2,3 GB en float32) la primera vez.',
    },
    {
      title: 'Reranker en JavaScript con Transformers.js',
      lang: 'typescript',
      code: rerankJs,
      deps: { '@huggingface/transformers': '^4.0' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: '¿Por qué no se usa un cross-encoder directamente para buscar en todo el índice?',
      options: [
        'Porque no admite textos en español.',
        'Porque habría que ejecutar el modelo una vez por cada documento del índice en cada consulta: no se puede precalcular.',
        'Porque solo funciona con BM25.',
        'Porque devuelve vectores demasiado grandes.',
      ],
      answer: 1,
      explain: 'El cross-encoder necesita la pareja pregunta + documento. Por eso se aplica solo a los candidatos que devuelve una búsqueda rápida.',
    },
    {
      q: 'Añades un reranker y el recall@20 no cambia, pero el MRR sube mucho. ¿Tiene sentido?',
      options: [
        'Sí: el reranker no trae documentos nuevos, reordena los candidatos y sube el correcto a las primeras posiciones.',
        'No: si el MRR sube, el recall también tiene que subir.',
        'No: el reranker debería bajar el MRR.',
        'Solo si el reranker es un LLM.',
      ],
      answer: 0,
      explain: 'Si el reranker trabaja sobre los mismos 20 candidatos, el recall@20 es el mismo. Lo que cambia es el orden, y con él el recall@3 y el MRR.',
    },
    {
      q: '¿Qué ofrece la interacción tardía (ColBERT) frente a un bi-encoder y un cross-encoder?',
      options: [
        'Es más rápida que un bi-encoder y más precisa que un cross-encoder.',
        'Solo sirve para imágenes.',
        'No necesita índice.',
        'Guarda un vector por token del documento: precalculable como un bi-encoder y más precisa, a cambio de índices mucho más grandes.',
      ],
      answer: 3,
      explain: 'Compara cada token de la pregunta con los del documento (MaxSim). Es un punto intermedio entre precisión y coste.',
    },
    {
      q: 'Tu reranker devuelve 0,0004 como mejor puntuación para una pregunta. ¿Qué haces?',
      options: [
        'Pasar igualmente los tres primeros fragmentos al modelo.',
        'Subir la temperatura.',
        'Si está por debajo del umbral calibrado, no pasar contexto y que el sistema responda que no tiene esa información.',
        'Repetir la búsqueda con otro índice ANN.',
      ],
      answer: 2,
      explain: 'Una puntuación tan baja indica que ningún candidato responde. Pasar contexto irrelevante invita a inventar.',
    },
  ],
  misconceptions: [
    {
      myth: 'Con un buen reranker da igual cómo recupere.',
      reality: 'El reranker solo reordena lo que recibe. Si el fragmento correcto no está entre los candidatos, no puede rescatarlo.',
    },
    {
      myth: 'La puntuación del reranker es una probabilidad calibrada de que el documento sea correcto.',
      reality: 'Es una señal de relevancia cuya escala depende del modelo y del dominio. Los umbrales se calibran con datos propios.',
    },
  ],
  sources: [
    {
      title: 'Nogueira y Cho (2019) · Passage Re-ranking with BERT',
      url: 'https://arxiv.org/abs/1901.04085',
      kind: 'paper',
    },
    {
      title: 'Khattab y Zaharia (2020) · ColBERT: Efficient and Effective Passage Search via Contextualized Late Interaction',
      url: 'https://arxiv.org/abs/2004.12832',
      kind: 'paper',
    },
    {
      title: 'Sun et al. (2023) · Is ChatGPT Good at Search? LLMs as Re-Ranking Agents',
      url: 'https://arxiv.org/abs/2304.09542',
      kind: 'paper',
    },
    {
      title: 'BAAI · bge-reranker-v2-m3 (model card)',
      url: 'https://huggingface.co/BAAI/bge-reranker-v2-m3',
      kind: 'docs',
    },
    {
      title: 'Sentence Transformers · Cross-Encoder usage',
      url: 'https://sbert.net/docs/cross_encoder/usage/usage.html',
      kind: 'docs',
    },
    {
      title: 'Cohere · Rerank overview',
      url: 'https://docs.cohere.com/docs/rerank-overview',
      kind: 'docs',
    },
  ],
}

export default details
