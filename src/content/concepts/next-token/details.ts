import type { ConceptDetails } from '../../schema'
import greedyLoop from './snippets/greedy_loop.py?raw'
import nextToken from './snippets/next_token.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Ver la distribución del siguiente token',
      lang: 'python',
      code: nextToken,
      deps: { torch: '>=2.2', transformers: '>=4.45' },
      verifiedAt: '2026-09',
      note: 'Descarga un modelo de ~1 GB la primera vez. Funciona en CPU.',
    },
    {
      title: 'Bucle autorregresivo manual y perplejidad',
      lang: 'python',
      code: greedyLoop,
      deps: { torch: '>=2.2', transformers: '>=4.45' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'En cada paso de generación, ¿qué produce exactamente el modelo?',
      options: [
        'Una frase completa candidata.',
        'El siguiente token ya elegido.',
        'Un logit por cada token del vocabulario, que el softmax convierte en una distribución de probabilidad.',
        'Una lista de las palabras más probables del diccionario.',
      ],
      answer: 2,
      explain:
        'El modelo solo produce puntuaciones para todo el vocabulario. Elegir un token concreto es un paso posterior (el sampling), que ni siquiera forma parte de la red.',
    },
    {
      q: '¿Por qué los tokens de salida suelen costar más y tardar más que los de entrada?',
      options: [
        'Porque la entrada se procesa en paralelo en una sola pasada, mientras que la salida exige una pasada completa por cada token generado.',
        'Porque los tokens de salida son más largos.',
        'Porque la salida pasa por filtros de seguridad adicionales.',
        'Porque el modelo usa más capas para generar que para leer.',
      ],
      answer: 0,
      explain:
        'El prefill aprovecha el paralelismo de la GPU; el decode es secuencial por naturaleza: el token n+1 depende del n. Esa diferencia de eficiencia se refleja en el precio y la latencia.',
    },
    {
      q: 'Un modelo afirma con total fluidez una cita que no existe. ¿Cuál es la explicación de fondo?',
      options: [
        'Un bug en el tokenizador.',
        'Que la temperatura era 0.',
        'Que el modelo consultó una base de datos desactualizada.',
        'El modelo maximiza la probabilidad de un texto plausible, no su veracidad; una cita inventada puede ser muy plausible.',
      ],
      answer: 3,
      explain:
        'El objetivo de entrenamiento premia continuar el texto de forma verosímil. Nada en la predicción del siguiente token verifica hechos. Por eso se ancla la respuesta con fuentes (RAG) o se añaden herramientas y comprobaciones.',
    },
    {
      q: 'Durante el pre-training, ¿cómo se mide el error del modelo en cada posición?',
      options: [
        'Con la distancia coseno entre la frase generada y la real.',
        'Con −log de la probabilidad que asignó al token que realmente venía (cross-entropy).',
        'Con el número de palabras correctas en la frase.',
        'Con una puntuación humana de calidad.',
      ],
      answer: 1,
      explain:
        'Si el modelo daba un 90 % al token correcto, −log(0,9) ≈ 0,1; si daba un 0,1 %, −log(0,001) ≈ 6,9. Minimizar esa pérdida media sobre billones de tokens es todo el objetivo del pre-training.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo planifica toda la frase y luego la escribe.',
      reality:
        'Genera token a token, y cada token es una elección irreversible. Internamente puede haber cierta anticipación, pero no puede reescribir lo que ya emitió; por eso ayuda que primero razone o haga un borrador.',
    },
    {
      myth: 'El modelo busca las respuestas en una base de datos interna.',
      reality:
        'No hay consulta: el conocimiento está codificado de forma difusa en miles de millones de pesos. No puede citar de dónde aprendió algo ni saber lo que ocurrió después de su entrenamiento.',
    },
    {
      myth: 'Una probabilidad alta significa que la respuesta es correcta.',
      reality:
        'Significa que es plausible para el modelo. Los modelos pueden estar muy seguros de algo falso, sobre todo después del ajuste con preferencias humanas, que tiende a hacerlos más asertivos.',
    },
  ],
  sources: [
    {
      title: 'Radford et al. (2018) · Improving Language Understanding by Generative Pre-Training (GPT-1)',
      url: 'https://cdn.openai.com/research-covers/language-unsupervised/language_understanding_paper.pdf',
      kind: 'paper',
    },
    {
      title: 'Brown et al. (2020) · Language Models are Few-Shot Learners (GPT-3)',
      url: 'https://arxiv.org/abs/2005.14165',
      kind: 'paper',
    },
    { title: 'Andrej Karpathy · nanoGPT', url: 'https://github.com/karpathy/nanoGPT', kind: 'repo' },
    {
      title: '3Blue1Brown · Transformers, the tech behind LLMs',
      url: 'https://www.youtube.com/watch?v=wjZofJX0v4M',
      kind: 'video',
    },
  ],
}

export default details
