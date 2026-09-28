import type { ConceptDetails } from '../../schema'
import cosine from './snippets/cosine.py?raw'
import embeddingsTs from './snippets/embeddings.ts?raw'
import sentenceEmbeddings from './snippets/sentence_embeddings.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Embeddings de frases y similitud',
      lang: 'python',
      code: sentenceEmbeddings,
      deps: { 'sentence-transformers': '>=3.0' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Coseno y búsqueda top-k desde cero',
      lang: 'python',
      code: cosine,
      deps: { numpy: '>=1.26' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Embeddings en TypeScript con transformers.js',
      lang: 'typescript',
      code: embeddingsTs,
      deps: { '@huggingface/transformers': '>=3.0' },
      verifiedAt: '2026-09',
      note: 'transformers.js ejecuta modelos ONNX con WebAssembly o WebGPU. Es lo que usará el lab de embeddings de esta app.',
    },
  ],
  quiz: [
    {
      q: 'En «me senté en el banco» y «abrí una cuenta en el banco», ¿el token « banco» entra al modelo con el mismo vector?',
      options: [
        'No: la tabla de embeddings ya distingue ambos sentidos.',
        'Sí: la tabla de embeddings no tiene contexto; son las capas de atención las que separan los dos sentidos.',
        'Depende de la temperatura.',
        'No, porque cada aparición de un token tiene su propia fila en la tabla.',
      ],
      answer: 1,
      explain:
        'La tabla de embeddings asigna un único vector por token, sin mirar alrededor. El significado contextual aparece en los estados internos, después de que la atención mezcle información de los tokens vecinos.',
    },
    {
      q: 'Indexas tus documentos con el modelo de embeddings A y luego haces las consultas con el modelo B, de la misma dimensión. ¿Qué pasa?',
      options: [
        'Funciona igual, porque las dimensiones coinciden.',
        'Funciona algo peor, pero es aceptable.',
        'Los resultados no tienen sentido: cada modelo define su propio espacio vectorial.',
        'La base de datos convierte automáticamente los vectores.',
      ],
      answer: 2,
      explain:
        'Que dos vectores tengan 768 números no significa que esos números signifiquen lo mismo. Cada modelo aprende sus propios ejes. Siempre hay que usar el mismo modelo (y la misma versión) para indexar y para consultar.',
    },
    {
      q: '¿Por qué muchas bases de datos vectoriales normalizan los vectores al indexar?',
      options: [
        'Porque con vectores de longitud 1, la similitud coseno es simplemente el producto escalar, que es más barato de calcular.',
        'Porque así ocupan la mitad de memoria.',
        'Porque los modelos de embeddings no funcionan sin normalizar.',
        'Porque la normalización elimina el ruido semántico.',
      ],
      answer: 0,
      explain:
        'cos(a,b) = a·b / (‖a‖‖b‖). Si ‖a‖ = ‖b‖ = 1, el denominador desaparece. La normalización no ahorra memoria ni cambia el significado, pero simplifica y acelera la comparación.',
    },
    {
      q: 'Un buscador semántico devuelve «No recomiendo este portátil» para la consulta «recomiendo este portátil». ¿Qué ilustra?',
      options: [
        'Un fallo del tokenizador.',
        'Que el índice está corrupto.',
        'Que hace falta aumentar la dimensión del vector.',
        'Que los embeddings capturan bien el tema pero mal la polaridad y la negación.',
      ],
      answer: 3,
      explain:
        'Ambas frases hablan de lo mismo con casi las mismas palabras, así que quedan cerca en el espacio. Para esos matices se combinan vectores con búsqueda léxica, re-ranking con cross-encoders o filtros.',
    },
  ],
  misconceptions: [
    {
      myth: 'Cada dimensión de un embedding significa algo concreto («es un animal», «es positivo»…).',
      reality:
        'El significado está repartido entre muchas dimensiones a la vez. Hay direcciones interpretables, pero casi nunca coinciden con un eje individual.',
    },
    {
      myth: 'Si dos textos tienen embeddings muy parecidos, dicen lo mismo.',
      reality:
        'Suelen tratar del mismo tema, pero pueden afirmar lo contrario. La similitud vectorial mide cercanía temática, no equivalencia lógica ni verdad.',
    },
    {
      myth: 'Más dimensiones siempre dan mejores resultados.',
      reality:
        'La calidad depende sobre todo del entrenamiento del modelo y de lo bien que encaje con tus datos. Más dimensiones implican más memoria y búsquedas más lentas.',
    },
  ],
  sources: [
    {
      title: 'Mikolov et al. (2013) · Efficient Estimation of Word Representations in Vector Space (word2vec)',
      url: 'https://arxiv.org/abs/1301.3781',
      kind: 'paper',
    },
    {
      title: 'Reimers & Gurevych (2019) · Sentence-BERT',
      url: 'https://arxiv.org/abs/1908.10084',
      kind: 'paper',
    },
    {
      title: 'Muennighoff et al. (2022) · MTEB: Massive Text Embedding Benchmark',
      url: 'https://arxiv.org/abs/2210.07316',
      kind: 'paper',
    },
    {
      title: 'Kusupati et al. (2022) · Matryoshka Representation Learning',
      url: 'https://arxiv.org/abs/2205.13147',
      kind: 'paper',
    },
    {
      title: 'Jay Alammar · The Illustrated Word2vec',
      url: 'https://jalammar.github.io/illustrated-word2vec/',
      kind: 'blog',
    },
  ],
}

export default details
