import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Llamada básica a Claude API (cerrada)',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY del entorno

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Explica la cuantización en dos frases."}],
)
print(message.content[0].text)
print(f"tokens usados: {message.usage.input_tokens} entrada / {message.usage.output_tokens} salida")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Requiere ANTHROPIC_API_KEY. Los tokens de entrada y salida determinan el coste.',
    },
    {
      title: 'Mismo modelo open-weights con Ollama (local)',
      lang: 'python',
      code: `import ollama

# Requiere: ollama pull qwen2.5:7b
response = ollama.chat(
    model='qwen2.5:7b',
    messages=[{"role": "user", "content": "Explica la cuantización en dos frases."}],
)
print(response['message']['content'])
# Sin coste por token; el dato nunca sale de tu máquina.
`,
      deps: { ollama: '>=0.3' },
      verifiedAt: '2026-09',
      note: 'Con la API de Ollama, el modelo corre en local. Necesitas ~5 GB de RAM/VRAM para el 7B.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la principal ventaja de un modelo open-weights frente a una API cerrada?',
      options: [
        'Siempre es más potente.',
        'El dato no sale de tu infraestructura y puedes hacer fine-tuning completo.',
        'Es gratis en cualquier escenario.',
        'No necesita GPU.',
      ],
      answer: 1,
      explain:
        'El control de datos y la customización profunda son las ventajas reales. El coste de hardware puede superar el de la API, y las capacidades suelen ser menores.',
    },
    {
      q: 'Una startup con datos de pacientes quiere usar un LLM para resúmenes médicos. ¿Qué opción es más razonable?',
      options: [
        'API de OpenAI sin más configuración.',
        'API cerrada con acuerdo BAA/HIPAA o modelo open-weights en su propio cloud.',
        'Cualquier API; HIPAA no aplica a LLMs.',
        'Siempre open-weights, el dato nunca sale.',
      ],
      answer: 1,
      explain:
        'Los datos de salud requieren cumplir HIPAA. Esto se puede lograr con una API que tenga acuerdo BAA (algunos proveedores lo ofrecen en sus planes enterprise) o con un modelo desplegado en su propia infraestructura.',
    },
    {
      q: 'Apache 2.0 permite uso comercial sin restricciones de tamaño de empresa. ¿Cuál de estos modelos NO usa Apache 2.0?',
      options: ['Qwen3-235B-A22B', 'Mistral 7B v0.3', 'Llama 3.3 70B', 'Falcon 7B'],
      answer: 2,
      explain:
        'Llama 3 usa la "Llama 3 Community License" de Meta, que restringe el uso a empresas con más de 700 M de usuarios activos mensuales. Qwen3 y Mistral 7B usan Apache 2.0.',
    },
    {
      q: 'Open-weights NO garantiza que puedas ver el código de entrenamiento. ¿Qué sí garantiza?',
      options: [
        'Que el modelo es de uso gratuito.',
        'Que los pesos están disponibles para descarga, inferencia y (según licencia) derivados.',
        'Que el modelo es de código abierto completo.',
        'Que no hay restricciones de uso.',
      ],
      answer: 1,
      explain:
        'Open-weights solo significa que los parámetros están disponibles. No incluye el código de entrenamiento, los datos ni garantiza libertad comercial (eso depende de la licencia).',
    },
  ],
  misconceptions: [
    {
      myth: 'Open-weights = open source = gratis para todo.',
      reality:
        'Open-weights solo significa que los pesos están disponibles. La licencia determina si puedes usarlos comercialmente, distribuirlos o hacer derivados. Lee siempre la model card.',
    },
    {
      myth: 'Usar una API cerrada significa que el proveedor entrena con tus datos.',
      reality:
        'La mayoría de los contratos enterprise de OpenAI, Anthropic y Google excluyen el uso de tus datos para entrenamiento por defecto. Verifica el DPA/MSA antes de asumir.',
    },
    {
      myth: 'Los modelos open-weights siempre son más baratos.',
      reality:
        'Sumar coste de hardware (GPUs), MLOps, actualizaciones y el coste de oportunidad hace que la API cerrada sea más barata para la mayoría de empresas hasta un volumen alto de inferencia.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Usage Policy',
      url: 'https://www.anthropic.com/legal/aup',
      kind: 'docs',
    },
    {
      title: 'Meta · Llama 3 Community License',
      url: 'https://llama.meta.com/llama3/license/',
      kind: 'docs',
    },
    {
      title: 'Hugging Face · Model Cards and Licenses',
      url: 'https://huggingface.co/docs/hub/model-cards',
      kind: 'docs',
    },
  ],
}

export default details
