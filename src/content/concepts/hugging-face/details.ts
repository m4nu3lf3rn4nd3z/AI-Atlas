import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Usar un modelo del Hub con transformers',
      lang: 'python',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch

# Opción 1: Pipeline de alto nivel (más sencillo)
# Descarga automáticamente el modelo al primer uso (~15GB para 7B en BF16)
generator = pipeline(
    "text-generation",
    model="Qwen/Qwen2.5-7B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto",  # distribuye automáticamente entre GPUs disponibles
)

messages = [
    {"role": "system", "content": "Eres un asistente técnico."},
    {"role": "user", "content": "Explica el KV cache en dos frases."},
]
result = generator(messages, max_new_tokens=200)
print(result[0]["generated_text"][-1]["content"])

# Opción 2: API de bajo nivel (más control)
model_id = "Qwen/Qwen2.5-7B-Instruct"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map="auto")

# Aplicar chat template
text = tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
inputs = tokenizer([text], return_tensors="pt").to(model.device)
output = model.generate(**inputs, max_new_tokens=200)
# Decodificar solo los tokens nuevos (sin el prompt)
new_tokens = output[0][inputs.input_ids.shape[1]:]
print(tokenizer.decode(new_tokens, skip_special_tokens=True))
`,
      deps: { transformers: '>=4.45', torch: '>=2.2', accelerate: '>=0.34' },
      verifiedAt: '2026-09',
      note: 'Los modelos de 7B en BF16 pesan ~15GB. Con 4-bit (AWQ o GGUF), bajan a ~4-5GB. device_map="auto" distribuye el modelo entre GPUs o usa CPU+RAM si no hay suficiente VRAM.',
    },
    {
      title: 'Descargar modelos con la CLI de Hugging Face',
      lang: 'bash',
      code: `# Instalar la CLI de Hugging Face
pip install huggingface_hub

# Autenticarse (necesario para modelos con gate como Llama, Gemma)
huggingface-cli login

# Descargar un modelo completo
huggingface-cli download Qwen/Qwen2.5-7B-Instruct --local-dir ./modelos/qwen-7b

# Descargar solo la versión GGUF para Ollama/llama.cpp
huggingface-cli download bartowski/Qwen2.5-7B-Instruct-GGUF \\
    --include "*Q4_K_M*" \\
    --local-dir ./modelos/gguf/

# Descargar un dataset
huggingface-cli download HuggingFaceH4/ultrachat_200k \\
    --repo-type dataset \\
    --local-dir ./datasets/ultrachat

# Ver qué hay en la caché local
huggingface-cli scan-cache
`,
      deps: { huggingface_hub: '>=0.25' },
      verifiedAt: '2026-09',
      note: 'Los modelos se cachean en ~/.cache/huggingface/hub. Puedes cambiar la ubicación con la variable de entorno HF_HOME.',
    },
  ],
  quiz: [
    {
      q: '¿Qué información ESENCIAL debe incluir un Model Card de Hugging Face antes de usar un modelo en producción?',
      options: [
        'Intended uses y limitaciones (para qué fue creado y para qué no), datos de entrenamiento, sesgos documentados, benchmarks de evaluación, y la licencia.',

        'Solo el número de parámetros.',

        'Solo la fecha de creación.',
        'Solo el nombre del modelo.',
      ],
      answer: 0,
      explain:
        'El model card es el contrato del modelo con los usuarios. Las limitaciones y sesgos son especialmente importantes para producción: un modelo entrenado principalmente en inglés puede tener rendimiento pobre en español. La licencia determina si puedes usarlo comercialmente.',
    },
    {
      q: '¿Por qué algunos modelos del Hub requieren "aceptar condiciones" antes de descargarse?',
      options: [
        'Para monetización exclusiva de Hugging Face.',
        'Los "gated models" (Llama, Gemma, Mistral) requieren que el usuario acepte explícitamente los términos de la licencia en huggingface.co antes de acceder a los pesos, lo que permite a los creadores rastrear el uso y hacer cumplir las condiciones.',
        'Por problemas técnicos de la plataforma.',
        'Para modelos muy grandes.',
      ],
      answer: 1,
      explain:
        'Los creadores de modelos como Meta (Llama), Google (Gemma) y Mistral usan el gating para implementar sus licencias, que pueden incluir restricciones de uso, reportes de incidentes, o límites para servicios de escala masiva. Necesitas login con HF token y haber aceptado las condiciones en el perfil del modelo.',
    },
    {
      q: '¿Cuál es la diferencia entre Inference API e Inference Endpoints en Hugging Face?',
      options: [
        'Son lo mismo con diferente nombre.',
        'Inference Endpoints son gratuitos.',

        'Inference API es un servicio compartido (serverless) con rate limits, bueno para prototipos. Inference Endpoints son despliegues dedicados de cualquier modelo del Hub, con recursos garantizados, para producción.',

        'Solo Inference API soporta modelos open-weights.',
      ],
      answer: 2,
      explain:
        'Inference API (serverless) es gratuita con límites estrictos — ideal para probar modelos rápidamente. Inference Endpoints despliegan el modelo en infraestructura dedicada con la GPU que elijas — para producción donde necesitas SLA, latencia predecible, y sin rate limits compartidos.',
    },
    {
      q: '¿Qué es `device_map="auto"` en `AutoModelForCausalLM.from_pretrained()`?',
      options: [
        'Descarga el modelo automáticamente.',
        'Distribuye automáticamente las capas del modelo entre las GPUs disponibles (o CPU+RAM si no hay suficiente VRAM), permitiendo cargar modelos que no caben en una sola GPU.',
        'Selecciona automáticamente el tipo de datos (float16/bfloat16).',
        'Activa el modo de bajo consumo.',
      ],
      answer: 1,
      explain:
        'device_map="auto" usa el paquete `accelerate` para calcular cómo distribuir el modelo: capas asignadas a GPU 0, GPU 1, y/o CPU según la VRAM disponible. Sin esto, si el modelo no cabe en una GPU, falla con OOM. Con device_map="auto", puede cargar modelos mucho más grandes repartidos entre GPUs y RAM del sistema.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo más descargado en Hugging Face es el mejor para mi uso.',
      reality:
        'Las descargas reflejan popularidad y visibilidad, no calidad para tu caso específico. Los modelos base sin instrucción tienen millones de descargas pero son difíciles de usar directamente. Siempre busca versiones `-Instruct` para chat y evalúa con tus propios datos.',
    },
    {
      myth: 'Apache 2.0 o MIT en Hugging Face significa que puedo usar el modelo sin restricciones.',
      reality:
        'La licencia del código (safetensors, scripts) puede ser Apache 2.0, pero algunos modelos tienen términos adicionales sobre el uso de los pesos del modelo que pueden diferir. Leer el model card y el fichero LICENSE en el repositorio, no asumir.',
    },
  ],
  sources: [
    {
      title: 'Hugging Face · Documentación de transformers',
      url: 'https://huggingface.co/docs/transformers/',
      kind: 'docs',
    },
    {
      title: 'Hugging Face · Model Hub',
      url: 'https://huggingface.co/models',
      kind: 'docs',
    },
  ],
}

export default details
