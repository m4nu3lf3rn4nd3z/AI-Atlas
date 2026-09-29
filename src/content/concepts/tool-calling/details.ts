import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Bucle básico de tool calling (Claude)',
      lang: 'python',
      code: `import anthropic
import json

client = anthropic.Anthropic()

# Herramienta de ejemplo: convertidor de divisas simulado
def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    rates = {"USD_EUR": 0.91, "USD_GBP": 0.78, "EUR_USD": 1.10}
    return rates.get(f"{from_currency}_{to_currency}", 0)

tools = [{
    "name": "get_exchange_rate",
    "description": "Devuelve el tipo de cambio actual entre dos divisas.",
    "input_schema": {
        "type": "object",
        "properties": {
            "from_currency": {"type": "string", "description": "Divisa origen (ej. USD)"},
            "to_currency": {"type": "string", "description": "Divisa destino (ej. EUR)"},
        },
        "required": ["from_currency", "to_currency"],
    },
}]

messages = [{"role": "user", "content": "¿Cuánto son 150 USD en EUR?"}]

while True:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=512,
        tools=tools,
        messages=messages,
    )
    messages.append({"role": "assistant", "content": response.content})

    if response.stop_reason == "end_turn":
        # El modelo respondió sin usar herramientas (o terminó tras usarlas)
        for block in response.content:
            if hasattr(block, "text"):
                print(block.text)
        break

    # Ejecutar las herramientas solicitadas
    tool_results = []
    for block in response.content:
        if block.type == "tool_use":
            result = get_exchange_rate(**block.input)
            tool_results.append({
                "type": "tool_result",
                "tool_use_id": block.id,
                "content": str(result),
            })

    messages.append({"role": "user", "content": tool_results})
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El bucle while continúa hasta stop_reason == "end_turn". En producción, añade un límite de iteraciones.',
    },
    {
      title: 'Herramientas múltiples en paralelo',
      lang: 'python',
      code: `import anthropic
import concurrent.futures

client = anthropic.Anthropic()

def get_weather(city: str) -> dict:
    # Simulado; en producción llama a una API real
    data = {"Madrid": {"temp": 28, "sky": "soleado"}, "Barcelona": {"temp": 24, "sky": "nublado"}}
    return data.get(city, {"error": "ciudad no encontrada"})

tools = [{
    "name": "get_weather",
    "description": "Obtiene el tiempo actual de una ciudad.",
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
    },
}]

messages = [{"role": "user", "content": "¿Qué tiempo hace en Madrid y Barcelona ahora mismo?"}]
response = client.messages.create(
    model="claude-opus-5-5", max_tokens=512, tools=tools, messages=messages
)
messages.append({"role": "assistant", "content": response.content})

# El modelo puede emitir varias tool_use en un turno → ejecutarlas en paralelo
tool_calls = [b for b in response.content if b.type == "tool_use"]
with concurrent.futures.ThreadPoolExecutor() as ex:
    futures = {ex.submit(get_weather, b.input["city"]): b for b in tool_calls}
    results = [
        {"type": "tool_result", "tool_use_id": b.id, "content": str(futures[f].result())}
        for f, b in futures.items()
    ]

messages.append({"role": "user", "content": results})
final = client.messages.create(
    model="claude-opus-5-5", max_tokens=512, tools=tools, messages=messages
)
print(final.content[0].text)
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: '¿Qué parte del sistema ejecuta la herramienta cuando el modelo emite un tool_use?',
      options: [
        'El propio modelo.',
        'El servidor de Anthropic.',
        'Tu código (la aplicación cliente).',
        'Un sandbox gestionado por el proveedor.',
      ],
      answer: 2,
      explain:
        'El modelo solo emite una petición estructurada (el tool_use). Tu código es el que realmente ejecuta la función, valida el input, maneja errores, y devuelve el resultado. El modelo no ejecuta nada.',
    },
    {
      q: '¿Por qué es tan importante la descripción de una herramienta?',
      options: [
        'Para que el JSON Schema sea válido.',
        'Para documentación interna del equipo.',
        'Porque el modelo decide cuándo usar la herramienta basándose únicamente en su nombre y descripción.',
        'Para que la herramienta sea más rápida.',
      ],
      answer: 2,
      explain:
        'El modelo no ve el código de la función: solo el nombre y la descripción. Una descripción imprecisa produce llamadas incorrectas o innecesarias. Incluye qué hace, cuándo usarla y qué NO hace.',
    },
    {
      q: 'El modelo emite dos tool_use en el mismo turno. ¿Qué significa esto?',
      options: [
        'Ha ocurrido un error; el modelo solo puede emitir una herramienta por turno.',
        'El modelo necesita los resultados de la primera antes de emitir la segunda.',
        'Las dos tareas son independientes y se pueden ejecutar en paralelo.',
        'Hay que ignorar la segunda.',
      ],
      answer: 2,
      explain:
        'Cuando el modelo emite múltiples tool_use en un turno, indica que las puede ejecutar en paralelo. Tu código debería ejecutarlas concurrentemente para reducir la latencia total.',
    },
    {
      q: '¿Cuál es la diferencia principal entre tool calling y MCP?',
      options: [
        'MCP solo funciona con Claude.',
        'Tool calling define las herramientas en el cliente; MCP añade un protocolo para que las herramientas vivan en servidores separados con descubrimiento dinámico.',
        'Son exactamente lo mismo.',
        'MCP no usa JSON-RPC.',
      ],
      answer: 1,
      explain:
        'Tool calling es el mecanismo de la API (defines las herramientas en tu código). MCP es un protocolo (JSON-RPC 2.0) que permite que las herramientas vivan en servidores externos, con descubrimiento automático y transporte estándar.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo ejecuta las funciones que defino en las herramientas.',
      reality:
        'El modelo solo emite una petición estructurada (tool_use). Tu código ejecuta la función real, valida el input y devuelve el resultado. El modelo no tiene acceso a tu código ni a tu sistema.',
    },
    {
      myth: 'Con tool_choice: "auto", el modelo siempre usa una herramienta.',
      reality:
        '"auto" significa que el modelo decide. Si la pregunta no requiere ninguna herramienta, responde directamente sin usarlas.',
    },
    {
      myth: 'Cuantas más herramientas defina, mejor responderá el agente.',
      reality:
        'Demasiadas herramientas confunden al modelo y llenan el contexto de descripciones. 5–10 herramientas bien definidas funcionan mejor que 50 vagamente descritas.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Tool use (function calling)',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
      kind: 'docs',
    },
    {
      title: 'Anthropic · Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
    {
      title: 'OpenAI · Function calling',
      url: 'https://platform.openai.com/docs/guides/function-calling',
      kind: 'docs',
    },
  ],
}

export default details
