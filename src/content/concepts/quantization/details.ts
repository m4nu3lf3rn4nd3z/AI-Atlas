import type { ConceptDetails } from '../../schema'
import ggufQuantize from './snippets/gguf_quantize.sh?raw'
import groupwiseQuant from './snippets/groupwise_quant.py?raw'
import load4bit from './snippets/load_4bit.py?raw'
import vramEstimate from './snippets/vram_estimate.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Estimar la memoria desde config.json',
      lang: 'python',
      code: vramEstimate,
      deps: { huggingface_hub: '>=0.24' },
      verifiedAt: '2026-09',
      note: 'Solo descarga el config.json del modelo (unos KB), no los pesos.',
    },
    {
      title: 'Cuantización por grupos y el efecto de un outlier',
      lang: 'python',
      code: groupwiseQuant,
      deps: { numpy: '>=1.26' },
      verifiedAt: '2026-09',
      note: 'Es el mismo cálculo que hace el lab con pesos reales.',
    },
    {
      title: 'Cargar un modelo en 4 bits con bitsandbytes',
      lang: 'python',
      code: load4bit,
      deps: { transformers: '>=4.45', bitsandbytes: '>=0.43', accelerate: '>=0.34', torch: '>=2.2' },
      verifiedAt: '2026-09',
      note: 'Necesita una GPU NVIDIA y descarga los pesos completos (≈ 16 GB) antes de cuantizarlos al cargar.',
    },
    {
      title: 'GGUF con llama.cpp y cuantizaciones en Ollama',
      lang: 'bash',
      code: ggufQuantize,
      deps: { 'llama.cpp': 'master (2026)', ollama: '>=0.5' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: '¿Cuánta memoria ocupan aproximadamente los pesos de un modelo de 70B parámetros en Q4_K_M (≈ 4,9 bits por peso)?',
      options: ['Unos 17 GB', 'Unos 40 GB', 'Unos 70 GB', 'Unos 140 GB'],
      answer: 1,
      explain:
        '70 × 10⁹ × 4,9 bits ÷ 8 ≈ 43 × 10⁹ bytes ≈ 40 GB. A eso hay que sumar el KV cache y el runtime: en una sola GPU de 48 GB cabe con un contexto moderado.',
    },
    {
      q: 'Cuantizar de BF16 a 4 bits apenas cambia el número de operaciones. ¿Por qué entonces la generación va mucho más rápida?',
      options: [
        'Porque el modelo genera menos tokens.',
        'Porque se desactiva la atención.',
        'Porque el decode está limitado por el ancho de banda de memoria: cada token lee todos los pesos, y ahora son cuatro veces menos bytes.',
        'Porque los enteros siempre se multiplican más rápido que los decimales.',
      ],
      answer: 2,
      explain:
        'En el decode la GPU pasa la mayor parte del tiempo esperando a que lleguen los pesos desde la memoria. Con un cuarto de bytes, cada token llega mucho antes.',
    },
    {
      q: 'Qwen3 30B-A3B es un MoE con 30,5B parámetros totales y 3,3B activos por token. En Q4, ¿qué esperas?',
      options: [
        'Memoria de un modelo de 30B y velocidad cercana a la de uno de 3B.',
        'Memoria y velocidad de un modelo de 3B.',
        'Memoria y velocidad de un modelo de 30B.',
        'Memoria de un modelo de 3B y velocidad de uno de 30B.',
      ],
      answer: 0,
      explain:
        'Todos los expertos tienen que estar en memoria, porque cualquier token puede necesitar cualquiera. Pero cada token solo lee los expertos que elige el router, así que se genera tan rápido como un modelo pequeño.',
    },
    {
      q: 'Cuantizas un tensor a 4 bits con una sola escala y la calidad se desploma. Descubres que tiene unos pocos valores enormes. ¿Qué lo arregla mejor?',
      options: [
        'Subir la temperatura al generar.',
        'Borrar los valores grandes.',
        'Pasar a 3 bits.',
        'Usar una escala por grupo de 32–128 pesos, para que los outliers solo afecten a su grupo.',
      ],
      answer: 3,
      explain:
        'Con una sola escala, el valor extremo fija el tamaño del escalón y el resto de pesos cae en muy pocos niveles. Con grupos pequeños cada grupo ajusta su propia rejilla. AWQ va más allá y protege los canales importantes.',
    },
    {
      q: 'Tienes una GPU de 24 GB y quieres la mejor calidad posible. ¿Qué suele funcionar mejor?',
      options: [
        'Un modelo de 8B en BF16 (≈ 15 GB).',
        'Un modelo de 32B en Q4_K_M (≈ 19 GB), comprobándolo con tus evals.',
        'Un modelo de 70B en Q2_K para que quepa.',
        'Un modelo de 3B en FP32.',
      ],
      answer: 1,
      explain:
        'Con la misma memoria, un modelo más grande en 4 bits suele superar a uno más pequeño en 16 bits. Por debajo de 4 bits la degradación se acelera y la regla deja de cumplirse. En cualquier caso, compruébalo con tus propios casos.',
    },
  ],
  misconceptions: [
    {
      myth: 'GGUF es un tipo de cuantización.',
      reality:
        'GGUF es un formato de fichero de llama.cpp. Puede contener pesos en BF16, Q8_0, Q4_K_M… La cuantización es el tipo numérico de los pesos que van dentro.',
    },
    {
      myth: 'Cuantizar a 4 bits pierde el 75 % de la calidad.',
      reality:
        'Pierde el 75 % de la memoria. Con métodos modernos (k-quants, AWQ, GPTQ) la caída de calidad a 4 bits es pequeña, sobre todo en modelos grandes.',
    },
    {
      myth: 'Si el modelo cabe en la GPU, ya está.',
      reality:
        'También tiene que caber el KV cache, que crece con el contexto y con cada usuario simultáneo. Un 8B en Q4 ocupa 4,6 GB, pero con 128k tokens de contexto necesita 16 GB más.',
    },
    {
      myth: 'Un MoE de 30B con 3B activos solo necesita memoria para 3B.',
      reality:
        'Necesita memoria para los 30B: todos los expertos deben estar cargados. Lo que se reduce es lo que se lee por token, es decir, la velocidad.',
    },
  ],
  sources: [
    {
      title: 'Dettmers & Zettlemoyer (2022) · The case for 4-bit precision: k-bit Inference Scaling Laws',
      url: 'https://arxiv.org/abs/2212.09720',
      kind: 'paper',
    },
    {
      title: 'Frantar et al. (2022) · GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers',
      url: 'https://arxiv.org/abs/2210.17323',
      kind: 'paper',
    },
    {
      title: 'Lin et al. (2023) · AWQ: Activation-aware Weight Quantization for LLM Compression and Acceleration',
      url: 'https://arxiv.org/abs/2306.00978',
      kind: 'paper',
    },
    {
      title: 'Dettmers et al. (2022) · LLM.int8(): 8-bit Matrix Multiplication for Transformers at Scale',
      url: 'https://arxiv.org/abs/2208.07339',
      kind: 'paper',
    },
    {
      title: 'llama.cpp · quantize: tipos, bits por peso y medidas',
      url: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/quantize/README.md',
      kind: 'repo',
    },
    {
      title: 'Hugging Face Transformers · Quantization overview',
      url: 'https://huggingface.co/docs/transformers/main/en/quantization/overview',
      kind: 'docs',
    },
    {
      title: 'vLLM · Quantization',
      url: 'https://docs.vllm.ai/en/latest/features/quantization/index.html',
      kind: 'docs',
    },
  ],
}

export default details
