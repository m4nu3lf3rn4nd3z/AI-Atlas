import type { ConceptDetails } from '../../schema'
import budget from './snippets/budget.ts?raw'
import chatTemplate from './snippets/chat_template.py?raw'
import countTokens from './snippets/count_tokens.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Contar y ver tokens',
      lang: 'python',
      code: countTokens,
      deps: { tiktoken: '>=0.7' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Tokenizador y plantilla de chat de un modelo abierto',
      lang: 'python',
      code: chatTemplate,
      deps: { transformers: '>=4.45' },
      verifiedAt: '2026-09',
      note: 'La primera ejecución descarga el tokenizador desde Hugging Face (unos pocos MB, sin los pesos del modelo).',
    },
    {
      title: 'Presupuesto de tokens en TypeScript',
      lang: 'typescript',
      code: budget,
      deps: { 'gpt-tokenizer': '^4.0' },
      verifiedAt: '2026-09',
      note: 'Es la misma librería que usa el lab de tokenización de esta app.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué la misma frase suele costar más tokens en español que en inglés?',
      options: [
        'Porque las APIs aplican un recargo a los idiomas distintos del inglés.',
        'Porque el vocabulario se aprende sobre corpus dominados por el inglés, y hay menos fusiones útiles para otros idiomas.',
        'Porque cada acento ocupa siempre un token propio.',
        'Porque el español tiene más palabras por frase y cada palabra es un token.',
      ],
      answer: 1,
      explain:
        'BPE fusiona los pares más frecuentes del corpus. Si el corpus es mayoritariamente inglés, las secuencias inglesas acaban como tokens completos y las de otros idiomas se trocean más. Ni hay recargo por idioma ni una palabra equivale a un token.',
    },
    {
      q: 'Un modelo falla al contar las erres de «strawberry». ¿Cuál es la causa más directa?',
      options: [
        'Le faltan datos de entrenamiento sobre frutas.',
        'La temperatura está demasiado alta.',
        'Recibe tokens como «st», «raw», «berry», no letras individuales.',
        'Su vocabulario no contiene la letra «r».',
      ],
      answer: 2,
      explain:
        'El modelo solo ve ids de tokens. Saber qué letras hay dentro de cada token es algo que tiene que haber aprendido de forma indirecta, y por eso deletrear y contar caracteres le resulta difícil.',
    },
    {
      q: '¿Qué ventaja tiene que BPE parta de bytes en lugar de caracteres o palabras?',
      options: [
        'Cualquier texto (emojis, idiomas poco comunes, código) se puede representar sin un token «desconocido».',
        'Garantiza exactamente un token por palabra.',
        'Hace que el vocabulario sea más pequeño que el alfabeto.',
        'Elimina la necesidad de embeddings.',
      ],
      answer: 0,
      explain:
        'Con los 256 bytes como base, todo texto UTF-8 es representable: en el peor caso, byte a byte. Por eso un emoji raro no rompe el modelo, aunque ocupe varios tokens.',
    },
    {
      q: 'Si un equipo pasa de un vocabulario de 50k a uno de 200k tokens, ¿qué ocurre?',
      options: [
        'Nada relevante: el tamaño del vocabulario solo afecta al entrenamiento.',
        'El modelo tiene menos parámetros.',
        'Las secuencias se acortan (más texto por token), pero crecen la matriz de embeddings y la capa de salida.',
        'El modelo deja de necesitar tokens especiales.',
      ],
      answer: 2,
      explain:
        'Es un trade-off: más tokens en el vocabulario significa más texto por token, así que el mismo contenido ocupa menos contexto y se genera en menos pasos. A cambio hay una fila más en los embeddings y una salida más en el softmax por cada token añadido.',
    },
    {
      q: 'Cuentas tokens con tiktoken para estimar el coste de un modelo de otra familia (Llama, Claude…). ¿Qué obtienes?',
      options: [
        'El número exacto, porque todos los tokenizadores BPE son equivalentes.',
        'Siempre el doble del valor real.',
        'Un error, porque tiktoken solo acepta inglés.',
        'Una aproximación: cada familia usa su propio vocabulario y trocea distinto.',
      ],
      answer: 3,
      explain:
        'Cada modelo se entrena con su propio tokenizador y su tabla de embeddings depende de él. Otro tokenizador da un orden de magnitud razonable, pero para cifras exactas usa el del modelo o el endpoint de conteo del proveedor.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un token es una palabra.',
      reality:
        'Es un fragmento: una palabra común, un trozo de palabra, un signo, un espacio o incluso parte de un carácter. En inglés la media ronda los 4 caracteres por token; en español es algo menos eficiente.',
    },
    {
      myth: 'Todos los modelos cuentan los tokens igual.',
      reality:
        'Cada familia tiene su tokenizador. La misma frase puede ocupar un número distinto de tokens en GPT, Llama o Claude, y por tanto costar y ocupar contexto de forma distinta.',
    },
    {
      myth: 'Si el modelo "ve" una palabra, puede deletrearla sin problema.',
      reality:
        'Solo ve ids. Deletrear, contar letras o hacer aritmética con números largos exige conocer la composición interna de cada token, que el modelo solo aprende de forma indirecta.',
    },
  ],
  sources: [
    {
      title: 'Sennrich et al. (2016) · Neural Machine Translation of Rare Words with Subword Units',
      url: 'https://arxiv.org/abs/1508.07909',
      kind: 'paper',
    },
    {
      title: 'Radford et al. (2019) · Language Models are Unsupervised Multitask Learners (BPE a nivel de byte, GPT-2)',
      url: 'https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf',
      kind: 'paper',
    },
    { title: 'OpenAI · tiktoken', url: 'https://github.com/openai/tiktoken', kind: 'repo' },
    {
      title: 'Hugging Face · Summary of the tokenizers',
      url: 'https://huggingface.co/docs/transformers/tokenizer_summary',
      kind: 'docs',
    },
    {
      title: "Andrej Karpathy · Let's build the GPT Tokenizer",
      url: 'https://www.youtube.com/watch?v=zduSFxRajkE',
      kind: 'video',
    },
  ],
}

export default details
