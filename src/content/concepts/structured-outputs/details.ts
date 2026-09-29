import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Extracción estructurada con tool_use (Claude)',
      lang: 'python',
      code: `import anthropic
import json

client = anthropic.Anthropic()

extract_tool = {
    "name": "extraer_contacto",
    "description": "Extrae los datos de contacto del texto.",
    "input_schema": {
        "type": "object",
        "properties": {
            "nombre": {"type": "string", "description": "Nombre completo"},
            "email": {"type": "string", "description": "Dirección de email"},
            "empresa": {"type": "string", "description": "Nombre de la empresa, si aparece"},
        },
        "required": ["nombre", "email"],
    },
}

def extract(text: str) -> dict:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=256,
        tools=[extract_tool],
        tool_choice={"type": "tool", "name": "extraer_contacto"},  # fuerza el uso de esta tool
        messages=[{"role": "user", "content": text}],
    )
    for block in response.content:
        if block.type == "tool_use":
            return block.input  # JSON siempre válido según el esquema
    return {}

data = extract("Hola, soy Ana García de Acme Corp. Puedes escribirme a ana@acme.com.")
print(data)  # {"nombre": "Ana García", "email": "ana@acme.com", "empresa": "Acme Corp"}
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'tool_choice fuerza al modelo a usar esa herramienta. El JSON resultante siempre cumple el input_schema.',
    },
    {
      title: 'JSON mode estricto con OpenAI SDK',
      lang: 'python',
      code: `from openai import OpenAI
import json

client = OpenAI()

schema = {
    "type": "object",
    "properties": {
        "titulo": {"type": "string"},
        "puntuacion": {"type": "number", "minimum": 0, "maximum": 10},
        "recomendado": {"type": "boolean"},
    },
    "required": ["titulo", "puntuacion", "recomendado"],
    "additionalProperties": False,
}

response = client.chat.completions.create(
    model="gpt-4o-mini",
    response_format={
        "type": "json_schema",
        "json_schema": {"name": "resena", "strict": True, "schema": schema},
    },
    messages=[
        {"role": "user", "content": "Analiza esta película: 'Inception'. ¿La recomendarías?"}
    ],
)

result = json.loads(response.choices[0].message.content)
print(result)  # {"titulo": "Inception", "puntuacion": 9.2, "recomendado": True}
`,
      deps: { openai: '>=1.50' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Structured outputs locales con Ollama + Pydantic',
      lang: 'python',
      code: `from pydantic import BaseModel
import ollama

class Analisis(BaseModel):
    sentimiento: str  # "positivo" | "negativo" | "neutro"
    confianza: float  # 0.0 - 1.0
    resumen: str

# Ollama convierte el esquema Pydantic a JSON Schema y aplica grammar sampling
response = ollama.chat(
    model="qwen2.5:7b",
    messages=[{"role": "user", "content": "Analiza: 'El producto llegó antes de lo esperado y funciona perfecto.'"}],
    format=Analisis.model_json_schema(),
)
result = Analisis.model_validate_json(response.message.content)
print(result.sentimiento, result.confianza)  # positivo  0.97
`,
      deps: { ollama: '>=0.4', pydantic: '>=2.7' },
      verifiedAt: '2026-09',
      note: 'Requiere: ollama pull qwen2.5:7b. Ollama usa llama.cpp grammar sampling para garantizar el esquema.',
    },
  ],
  quiz: [
    {
      q: '¿Qué garantiza la decodificación con restricciones de gramática?',
      options: [
        'Que la respuesta sea correcta semánticamente.',
        'Que la respuesta sea siempre más corta.',
        'Que la salida sea un JSON sintácticamente válido según el esquema dado.',
        'Que el modelo no alucine.',
      ],
      answer: 2,
      explain:
        'La decodificación restringida garantiza validez estructural (JSON bien formado, que cumple el esquema). No garantiza que los valores sean correctos semánticamente: el modelo puede seguir inventando datos.',
    },
    {
      q: 'En la API de Anthropic, ¿cómo se obtienen structured outputs garantizados?',
      options: [
        'Con el parámetro response_format.',
        'Con tool_use y definiendo el input_schema de la herramienta.',
        'Con structured_output: true.',
        'No es posible con Anthropic.',
      ],
      answer: 1,
      explain:
        'Anthropic garantiza JSON válido a través del mecanismo de tool_use. Define una herramienta con el JSON Schema que quieres y usa tool_choice para forzar su uso. El resultado siempre cumple el schema.',
    },
    {
      q: 'Añadir structured outputs puede hacer la inferencia un poco más lenta. ¿Por qué?',
      options: [
        'Porque el modelo genera más tokens.',
        'Porque se aplica una máscara de tokens válidos antes de cada sampling, lo que añade cómputo.',
        'Porque el JSON es más largo que el texto libre.',
        'Porque se activa el modo de razonamiento.',
      ],
      answer: 1,
      explain:
        'En cada paso de sampling se recalcula qué tokens son válidos según el estado actual de la gramática. Esto añade un overhead pequeño (~5–15 %) que es despreciable frente a la fiabilidad que aporta.',
    },
    {
      q: '¿Cuándo sería suficiente pedir JSON "en el prompt" sin usar structured outputs?',
      options: [
        'Cuando el JSON tiene menos de 5 campos.',
        'Cuando el código que procesa la respuesta tiene reintentos y manejo de errores robusto, y se usa en prototipos.',
        'Siempre es suficiente con modelos grandes.',
        'Nunca: siempre hay que usar structured outputs.',
      ],
      answer: 1,
      explain:
        'Para prototipos o cuando los fallos ocasionales son aceptables (con reintentos), pedir JSON en el prompt puede funcionar. En producción donde el siguiente paso depende de la estructura, usa siempre structured outputs.',
    },
  ],
  misconceptions: [
    {
      myth: 'Structured outputs garantiza que el modelo no alucina.',
      reality:
        'Solo garantiza que el JSON es válido estructuralmente. El modelo puede seguir generando valores incorrectos (nombre inventado, precio equivocado). Valida el contenido semántico por separado.',
    },
    {
      myth: 'Pedir "responde en JSON" en el prompt es igual de fiable.',
      reality:
        'Con instrucciones en el prompt, el modelo a veces añade texto antes del JSON, cierra mal los objetos o cambia el esquema. En producción esto produce fallos intermitentes difíciles de depurar.',
    },
  ],
  sources: [
    {
      title: 'Willard & Louf (2023) · Efficient Guided Generation for Large Language Models',
      url: 'https://arxiv.org/abs/2307.09702',
      kind: 'paper',
    },
    {
      title: 'Anthropic · Tool use (function calling)',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use',
      kind: 'docs',
    },
    {
      title: 'OpenAI · Structured outputs',
      url: 'https://platform.openai.com/docs/guides/structured-outputs',
      kind: 'docs',
    },
    {
      title: 'Outlines · Grammar-based text generation',
      url: 'https://dottxt-ai.github.io/outlines/',
      kind: 'repo',
    },
  ],
}

export default details
