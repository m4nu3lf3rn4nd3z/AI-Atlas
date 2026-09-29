import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Conversación multi-turno con Anthropic SDK',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()
history: list[dict] = []

def chat(user_input: str) -> str:
    history.append({"role": "user", "content": user_input})
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system="Eres un asistente técnico. Responde en español.",
        messages=history,
    )
    reply = response.content[0].text
    history.append({"role": "assistant", "content": reply})
    return reply

print(chat("¿Qué es el KV cache?"))
print(chat("¿Cuánta memoria ocupa?"))  # el historial se envía completo en cada turno
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El historial crece con cada turno. En producción necesitas truncarlo o resumirlo para no superar el contexto.',
    },
    {
      title: 'Streaming con el SDK de TypeScript',
      lang: 'typescript',
      code: `import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const stream = await client.messages.stream({
  model: 'claude-opus-5-5',
  max_tokens: 512,
  messages: [{ role: 'user', content: 'Describe el self-attention en tres pasos.' }],
})

// Imprime cada fragmento según llega
for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text)
  }
}

// O espera al mensaje completo:
const final = await stream.finalMessage()
console.log('\\nTokens usados:', final.usage)
`,
      deps: { '@anthropic-ai/sdk': '>=0.30' },
      verifiedAt: '2026-09',
      note: 'stream.finalMessage() espera a que termine y devuelve el mensaje completo con métricas de uso.',
    },
    {
      title: 'Compatible con OpenAI Chat Completions (Ollama local)',
      lang: 'python',
      code: `from openai import OpenAI

# Apunta a Ollama o a cualquier runtime con endpoint /v1
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")

response = client.chat.completions.create(
    model="qwen2.5:7b",  # requiere: ollama pull qwen2.5:7b
    messages=[
        {"role": "system", "content": "Responde en español."},
        {"role": "user", "content": "¿Qué es el KV cache?"},
    ],
    stream=True,
)
for chunk in response:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
`,
      deps: { openai: '>=1.50' },
      verifiedAt: '2026-09',
      note: 'El mismo código funciona apuntando a vLLM, LM Studio o cualquier otro runtime compatible.',
    },
  ],
  quiz: [
    {
      q: '¿Qué pasa con el historial de conversación entre dos llamadas separadas a la API?',
      options: [
        'El modelo lo recuerda automáticamente.',
        'Se guarda en el servidor del proveedor.',
        'Se pierde: tu app tiene que incluirlo en cada petición.',
        'Solo se pierde si no usas el mismo session ID.',
      ],
      answer: 2,
      explain:
        'Los LLMs son stateless. No hay sesión persistente: cada petición es independiente. Tu aplicación es responsable de mantener el historial y enviarlo completo en cada turno.',
    },
    {
      q: '¿Qué ventaja tiene activar streaming (`stream: true`) en la petición?',
      options: [
        'Reduce el coste por token.',
        'El modelo genera más tokens.',
        'El usuario ve texto antes, porque los tokens llegan de uno en uno en vez de esperar al final.',
        'Aumenta la calidad de la respuesta.',
      ],
      answer: 2,
      explain:
        'Con streaming, el TTFT (time to first token) se reduce drásticamente porque el texto aparece conforme se genera. El coste y la calidad no cambian.',
    },
    {
      q: 'En la API de Anthropic, ¿dónde va el system prompt?',
      options: [
        'Como primer mensaje con role "system" en el array messages.',
        'En un campo system a nivel raíz de la petición.',
        'En el parámetro instructions.',
        'No existe system prompt en Anthropic.',
      ],
      answer: 1,
      explain:
        'Anthropic usa un campo system separado del array messages. OpenAI usa un mensaje con role: "system" dentro del array. Es una diferencia importante al migrar código.',
    },
    {
      q: 'Los tokens de salida suelen costar más que los de entrada. ¿Cuál es la razón principal?',
      options: [
        'El modelo trabaja más para generar que para leer.',
        'Los tokens de salida contienen más información.',
        'Es una decisión arbitraria de precios.',
        'Los tokens de salida se generan uno a uno en el decode, que es más lento; los de entrada se procesan en paralelo durante el prefill.',
      ],
      answer: 3,
      explain:
        'El prefill (procesar la entrada) usa toda la paralelización del transformer. El decode genera token a token, autoregresivamente, y requiere múltiples pasadas. La diferencia de precio refleja el mayor uso de compute.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo recuerda lo que le dijiste en la conversación anterior.',
      reality:
        'No existe memoria entre llamadas. Para continuidad, tu app debe incluir el historial completo en cada petición. Esto es lo que hace que el coste crezca con el número de turnos.',
    },
    {
      myth: 'Con streaming recibes más tokens o más rápido.',
      reality:
        'El número de tokens y la velocidad de generación son idénticos. Solo cambia cuándo los recibe tu cliente: token a token (streaming) o todos al final (no streaming).',
    },
    {
      myth: 'max_tokens controla la longitud de la respuesta.',
      reality:
        'Es un límite máximo, no un objetivo. El modelo para cuando termina naturalmente (stop sequence, EOS token) o cuando alcanza max_tokens. Para respuestas más cortas, usa instrucciones en el prompt.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Messages API reference',
      url: 'https://docs.anthropic.com/en/api/messages',
      kind: 'docs',
    },
    {
      title: 'OpenAI · Chat Completions API',
      url: 'https://platform.openai.com/docs/api-reference/chat',
      kind: 'docs',
    },
    {
      title: 'Ollama · OpenAI compatibility',
      url: 'https://ollama.com/blog/openai-compatibility',
      kind: 'docs',
    },
  ],
}

export default details
