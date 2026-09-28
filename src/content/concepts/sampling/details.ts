import type { ConceptDetails } from '../../schema'
import hfGenerate from './snippets/hf_generate.py?raw'
import ollamaOptions from './snippets/ollama_options.py?raw'
import sampler from './snippets/sampler.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Un sampler completo en 25 líneas',
      lang: 'python',
      code: sampler,
      deps: { numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Misma lógica que el widget de la teoría (src/lib/sampling.ts), con los tests en sampling.test.ts.',
    },
    {
      title: 'Parámetros de sampling en Ollama',
      lang: 'python',
      code: ollamaOptions,
      deps: { ollama: '>=0.4' },
      verifiedAt: '2026-09',
      note: 'Necesitas Ollama en marcha y el modelo descargado (unos 2 GB).',
    },
    {
      title: 'generate() de transformers: greedy vs muestreo',
      lang: 'python',
      code: hfGenerate,
      deps: { torch: '>=2.2', transformers: '>=4.45' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Subes la temperatura de 0,7 a 1,5. ¿Qué le ocurre a la distribución del siguiente token?',
      options: [
        'Se concentra más en el token favorito.',
        'Se aplana: los tokens menos probables ganan peso relativo.',
        'No cambia; la temperatura solo afecta a la velocidad.',
        'El modelo usa más capas para pensar.',
      ],
      answer: 1,
      explain:
        'Dividir los logits por un número mayor reduce las diferencias entre ellos antes del softmax. El resultado es una distribución más uniforme y, por tanto, más variedad y más riesgo de incoherencia.',
    },
    {
      q: '¿Qué ventaja tiene top-p sobre top-k?',
      options: [
        'Es más rápido de calcular.',
        'Elimina la necesidad de temperatura.',
        'Adapta el número de candidatos a la confianza del modelo: pocos si está seguro, muchos si duda.',
        'Garantiza respuestas deterministas.',
      ],
      answer: 2,
      explain:
        'Con top-k = 40 siempre hay 40 candidatos, aunque el modelo tenga un 99 % en uno solo. Top-p recorta según la probabilidad acumulada, así que el tamaño del conjunto se adapta a cada paso.',
    },
    {
      q: 'Llamas dos veces a una API con temperature = 0 y el mismo prompt, y obtienes respuestas ligeramente distintas. ¿Por qué es posible?',
      options: [
        'El servidor procesa tu petición en lotes de tamaño variable y la aritmética en coma flotante no es asociativa; el orden de las operaciones cambia el resultado.',
        'Es imposible: temperature 0 siempre es determinista.',
        'Porque la API ignora la temperatura.',
        'Porque el modelo aprende de cada llamada.',
      ],
      answer: 0,
      explain:
        'Los kernels de inferencia pueden sumar en distinto orden según el tamaño del lote, y eso produce diferencias diminutas en los logits que a veces cambian el argmax. Con MoE, además, puede variar el enrutado entre expertos.',
    },
    {
      q: 'Estás extrayendo campos de facturas a JSON. ¿Qué configuración tiene más sentido?',
      options: [
        'Temperatura 1,5 para que el modelo explore formatos.',
        'Top-k = 1000 para no perder candidatos.',
        'Temperatura alta y min-p alto.',
        'Temperatura baja (≈0) o greedy: quieres la opción más probable, no variedad.',
      ],
      answer: 3,
      explain:
        'En tareas con una respuesta correcta, la variedad solo añade errores. La creatividad del muestreo es útil en tareas abiertas. Para garantizar el formato JSON, además, existen las salidas estructuradas.',
    },
    {
      q: 'Con un modelo de razonamiento reciente vía API, envías temperature = 0,2 y recibes un error. ¿Qué indica?',
      options: [
        'Que la temperatura debe ser un entero.',
        'Que tu clave de API no tiene permisos.',
        'Que ese modelo no expone los parámetros de sampling; el control pasa a ser el nivel de esfuerzo.',
        'Que hay que enviar también top_k.',
      ],
      answer: 2,
      explain:
        'Varios proveedores han retirado temperature/top_p en sus modelos de razonamiento (los Claude actuales devuelven un 400). La profundidad del razonamiento se controla con parámetros como effort. En local sigues teniendo todos los controles.',
    },
  ],
  misconceptions: [
    {
      myth: 'La temperatura controla lo "creativo" o "inteligente" que es el modelo.',
      reality:
        'Solo cambia la forma de la distribución de la que se muestrea. No añade ideas: hace más probable elegir opciones que el modelo ya consideraba menos probables, buenas o malas.',
    },
    {
      myth: 'Greedy (temperatura 0) siempre da la mejor respuesta.',
      reality:
        'Da la secuencia de elecciones localmente más probables, que en textos largos tiende a repetirse y a quedar plana. Para tareas con respuesta única funciona bien; para generación abierta, no.',
    },
    {
      myth: 'Con temperatura 0 la salida es 100 % reproducible.',
      reality:
        'En local con el mismo hardware y seed suele serlo; en una API compartida, el batching y la aritmética en coma flotante introducen pequeñas variaciones.',
    },
  ],
  sources: [
    {
      title: 'Holtzman et al. (2019) · The Curious Case of Neural Text Degeneration (nucleus sampling)',
      url: 'https://arxiv.org/abs/1904.09751',
      kind: 'paper',
    },
    {
      title: 'Nguyen et al. (2024) · Turning Up the Heat: Min-p Sampling',
      url: 'https://arxiv.org/abs/2407.01082',
      kind: 'paper',
    },
    {
      title: 'Hugging Face · Generation strategies',
      url: 'https://huggingface.co/docs/transformers/generation_strategies',
      kind: 'docs',
    },
    {
      title: 'Hugging Face blog · How to generate text',
      url: 'https://huggingface.co/blog/how-to-generate',
      kind: 'blog',
    },
    {
      title: 'Thinking Machines · Defeating Nondeterminism in LLM Inference',
      url: 'https://thinkingmachines.ai/blog/defeating-nondeterminism-in-llm-inference/',
      kind: 'blog',
    },
  ],
}

export default details
