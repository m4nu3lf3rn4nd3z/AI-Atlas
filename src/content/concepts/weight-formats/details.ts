import type { ConceptDetails } from '../../schema'
import ggufInspect from './snippets/gguf_inspect.py?raw'
import safetensorsHeader from './snippets/safetensors_header.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Leer la cabecera de un safetensors remoto',
      lang: 'python',
      code: safetensorsHeader,
      deps: { requests: '>=2.31' },
      verifiedAt: '2026-09',
      note: 'Descarga unos pocos KB, no los pesos. Es la misma técnica que usa scripts/extract-weights.mjs de esta app.',
    },
    {
      title: 'Inspeccionar un GGUF',
      lang: 'python',
      code: ggufInspect,
      deps: { gguf: '>=0.10' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Descargas un modelo de un repositorio desconocido que solo ofrece `pytorch_model.bin`. ¿Qué riesgo corres al cargarlo?',
      options: [
        'Ninguno: son solo números.',
        'Que tarde más en cargar.',
        'Que ocupe más memoria.',
        'Que ejecute código arbitrario al deserializarse, porque el formato pickle lo permite.',
      ],
      answer: 3,
      explain: 'Pickle puede incluir instrucciones que se ejecutan al cargar. safetensors solo contiene datos. Prefiere safetensors y fuentes de confianza.',
    },
    {
      q: '¿Qué formato usarías para ejecutar un modelo con Ollama o llama.cpp?',
      options: ['GGUF', 'ONNX', 'Un motor de TensorRT', 'safetensors en FP8'],
      answer: 0,
      explain: 'GGUF es el formato de llama.cpp, y Ollama y LM Studio lo usan. Incluye pesos, tokenizador, plantilla y metadatos en un solo fichero.',
    },
    {
      q: 'Un modelo instruct responde de forma incoherente en tu runtime, sin errores. ¿Qué es lo primero que comprobarías?',
      options: [
        'La velocidad del disco.',
        'Que la conversación se envía con la plantilla de chat del modelo.',
        'El número de GPUs.',
        'La versión de CUDA.',
      ],
      answer: 1,
      explain: 'Con una plantilla distinta de la del entrenamiento, el modelo recibe los turnos en un formato que no conoce. No falla: responde peor.',
    },
    {
      q: '¿Para qué sirve generation_config.json?',
      options: [
        'Para definir la arquitectura del modelo.',
        'Para guardar los pesos cuantizados.',
        'Para indicar los parámetros de generación recomendados por el autor, como la temperatura o top-p.',
        'Para la licencia.',
      ],
      answer: 2,
      explain: 'Por ejemplo, Qwen2.5 publica temperatura 0,7, top-p 0,8 y top-k 20. El lab de sampling lo usa como preset.',
    },
  ],
  misconceptions: [
    {
      myth: 'GGUF y cuantización son lo mismo.',
      reality: 'GGUF es el contenedor; la cuantización es el tipo numérico de los tensores que lleva dentro. Un GGUF puede estar en BF16.',
    },
    {
      myth: 'Un modelo de Hugging Face es seguro porque está en Hugging Face.',
      reality: 'El Hub escanea ficheros pickle y avisa, pero cualquiera puede subir modelos. Revisa el autor, el formato y fija la versión.',
    },
  ],
  sources: [
    {
      title: 'Hugging Face · Safetensors',
      url: 'https://huggingface.co/docs/safetensors/index',
      kind: 'docs',
    },
    {
      title: 'Hugging Face Hub · Pickle scanning',
      url: 'https://huggingface.co/docs/hub/security-pickle',
      kind: 'docs',
    },
    {
      title: 'GGUF · especificación del formato',
      url: 'https://github.com/ggml-org/ggml/blob/master/docs/gguf.md',
      kind: 'repo',
    },
    {
      title: 'ONNX · Open Neural Network Exchange',
      url: 'https://onnx.ai',
      kind: 'docs',
    },
  ],
}

export default details
