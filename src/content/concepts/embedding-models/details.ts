import type { ConceptDetails } from '../../schema'
import browserEmbeddings from './snippets/browser_embeddings.ts?raw'
import encodeCompare from './snippets/encode_compare.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Prefijos, similitud y cuantización binaria',
      lang: 'python',
      code: encodeCompare,
      deps: { 'sentence-transformers': '>=3.0', numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Descarga el modelo (unos 470 MB en float32) la primera vez.',
    },
    {
      title: 'Embeddings en el navegador con Transformers.js',
      lang: 'typescript',
      code: browserEmbeddings,
      deps: { '@huggingface/transformers': '^4.0' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Cambias tu modelo de embeddings por uno mejor. ¿Qué tienes que hacer con el índice?',
      options: [
        'Nada: los vectores son compatibles entre modelos.',
        'Solo recalcular los documentos nuevos.',
        'Recalcular los vectores de todos los documentos con el modelo nuevo.',
        'Normalizar los vectores antiguos.',
      ],
      answer: 2,
      explain:
        'Cada modelo define su propio espacio: un vector de un modelo no significa nada en el espacio de otro. Por eso conviene guardar con cada vector qué modelo lo generó.',
    },
    {
      q: 'Usas multilingual-e5 y has indexado los documentos sin el prefijo «passage: ». ¿Qué pasa?',
      options: [
        'La búsqueda sigue funcionando, pero peor: el modelo espera ese prefijo y sin él la calidad baja sin que haya ningún error.',
        'La librería lanza una excepción.',
        'Los vectores salen vacíos.',
        'No influye: el prefijo solo afecta a las preguntas.',
      ],
      answer: 0,
      explain:
        'Los modelos asimétricos se entrenan con prefijos o instrucciones distintas para preguntas y documentos. Omitirlos no rompe nada visible: simplemente recupera peor.',
    },
    {
      q: '¿Por qué un bi-encoder permite buscar en millones de documentos en milisegundos?',
      options: [
        'Porque lee la pregunta y cada documento juntos.',
        'Porque usa BM25 por debajo.',
        'Porque solo compara la primera palabra.',
        'Porque los vectores de los documentos se calculan una vez por adelantado y en cada consulta solo hay que codificar la pregunta y comparar vectores.',
      ],
      answer: 3,
      explain:
        'Pregunta y documento se codifican por separado. Esa independencia permite precalcular e indexar; a cambio, el modelo no ve las interacciones finas entre ambos, que es lo que aporta un reranker.',
    },
    {
      q: 'Tu índice ocupa demasiada memoria. ¿Qué opción reduce su tamaño sin cambiar de modelo?',
      options: [
        'Subir la temperatura.',
        'Cuantizar los embeddings (int8 o binario) y, si el modelo lo admite, truncar dimensiones (Matryoshka).',
        'Usar fragmentos más grandes siempre.',
        'Quitar la normalización.',
      ],
      answer: 1,
      explain:
        'int8 divide la memoria por 4 y el binario por 32; se suele reordenar a los mejores candidatos con los vectores completos. Matryoshka permite quedarse con las primeras dimensiones en modelos entrenados para ello.',
    },
  ],
  misconceptions: [
    {
      myth: 'El primero de MTEB es el mejor modelo para mi caso.',
      reality:
        'MTEB promedia muchas tareas y conjuntos públicos. Tu idioma, tu dominio, el coste y la latencia importan; decide con una evaluación sobre tus preguntas.',
    },
    {
      myth: 'Una similitud de 0,8 significa «muy relacionado».',
      reality:
        'La escala depende del modelo. En E5 casi todo supera 0,7. Lo fiable es el orden relativo, no el valor absoluto.',
    },
    {
      myth: 'Más dimensiones siempre es mejor.',
      reality:
        'Más dimensiones cuestan memoria y latencia, y a partir de cierto punto aportan poco. Modelos de 384 dimensiones rinden muy bien en muchos casos.',
    },
  ],
  sources: [
    {
      title: 'Muennighoff et al. (2022) · MTEB: Massive Text Embedding Benchmark',
      url: 'https://arxiv.org/abs/2210.07316',
      kind: 'paper',
    },
    {
      title: 'Enevoldsen et al. (2025) · MMTEB: Massive Multilingual Text Embedding Benchmark',
      url: 'https://arxiv.org/abs/2502.13595',
      kind: 'paper',
    },
    {
      title: 'Wang et al. (2024) · Multilingual E5 Text Embeddings: A Technical Report',
      url: 'https://arxiv.org/abs/2402.05672',
      kind: 'paper',
    },
    {
      title: 'Kusupati et al. (2022) · Matryoshka Representation Learning',
      url: 'https://arxiv.org/abs/2205.13147',
      kind: 'paper',
    },
    {
      title: 'Reimers y Gurevych (2019) · Sentence-BERT',
      url: 'https://arxiv.org/abs/1908.10084',
      kind: 'paper',
    },
    {
      title: 'MTEB Leaderboard',
      url: 'https://huggingface.co/spaces/mteb/leaderboard',
      kind: 'docs',
    },
    {
      title: 'Sentence Transformers · Embedding Quantization',
      url: 'https://sbert.net/examples/sentence_transformer/applications/embedding-quantization/README.html',
      kind: 'docs',
    },
  ],
}

export default details
