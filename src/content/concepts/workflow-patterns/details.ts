import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Prompt chaining con gate de calidad',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()

def llm(prompt: str, system: str = "") -> str:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text

def translate_and_review(text: str, target_lang: str) -> str:
    # Paso 1: Traducir
    translation = llm(
        f"Traduce al {target_lang}:\\n\\n{text}",
        system="Eres un traductor experto. Solo devuelves la traducción, sin explicaciones.",
    )

    # Gate: verificar que la traducción no está vacía ni tiene errores obvios
    if len(translation.strip()) < 10:
        raise ValueError(f"Traducción inválida: '{translation}'")

    # Paso 2: Revisar tono formal
    reviewed = llm(
        f"Texto original (referencia):\\n{text}\\n\\nTRADUCCIÓN A REVISAR:\\n{translation}\\n\\nRevisa que el tono sea formal y corrige si hace falta. Si está bien, devuelve el texto sin cambios.",
        system="Eres un editor especializado. Devuelves solo el texto revisado.",
    )

    return reviewed

result = translate_and_review(
    "Hello, we noticed an issue with your account and need to verify your identity.",
    "español",
)
print(result)
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El gate entre pasos puede ser una regla simple (len check), un LLM-as-judge, o validación con Pydantic. Siempre añade alguna verificación entre pasos críticos.',
    },
    {
      title: 'Parallelization con asyncio',
      lang: 'python',
      code: `import anthropic
import asyncio

client = anthropic.AsyncAnthropic()

async def analyze(text: str, aspect: str) -> dict:
    response = await client.messages.create(
        model="claude-opus-5-5",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"Analiza este contrato desde el punto de vista de {aspect}:\\n\\n{text}\\n\\nResponde en 2-3 frases.",
        }],
    )
    return {"aspect": aspect, "analysis": response.content[0].text}

async def full_contract_review(contract_text: str) -> dict:
    # Analizar múltiples aspectos en paralelo (4x más rápido que secuencial)
    aspects = ["riesgo legal", "obligaciones financieras", "plazos y penalizaciones", "cláusulas de rescisión"]
    results = await asyncio.gather(*[analyze(contract_text, a) for a in aspects])

    # Sintetizar con un último LLM
    summaries = "\\n".join(f"- {r['aspect']}: {r['analysis']}" for r in results)
    synthesis = await client.messages.create(
        model="claude-opus-5-5",
        max_tokens=300,
        messages=[{"role": "user", "content": f"Resume los puntos más críticos de este contrato:\\n{summaries}"}],
    )

    return {
        "details": results,
        "summary": synthesis.content[0].text,
    }

# result = asyncio.run(full_contract_review(contract_text))
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Con 4 aspectos en paralelo, el tiempo total es ~el de la llamada más lenta (no la suma). asyncio.gather() gestiona automáticamente las corrutinas concurrentes.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la diferencia clave entre un workflow y un agente?',
      options: [
        'En un workflow la lógica de orquestación está en el código (flujo predecible); en un agente el LLM decide dinámicamente qué hacer a continuación (flujo emergente).',

        'Los workflows son más lentos.',

        'Los agentes no usan LLMs.',
        'Los workflows no pueden llamar a herramientas.',
      ],
      answer: 0,
      explain:
        'La distinción es quién controla el flujo. En workflows, el programador define el grafo de ejecución (qué pasa después de qué). En agentes, el LLM decide en cada paso. Los workflows son más predecibles, auditables y baratos; los agentes son más flexibles pero menos controlables.',
    },
    {
      q: '¿Para qué sirve el patrón evaluator-optimizer?',
      options: [
        'Para ejecutar tareas en paralelo.',
        'Para iterar sobre una respuesta LLM hasta que un LLM evaluador considera que cumple los criterios de calidad.',
        'Para reducir el coste de inferencia.',
        'Para clasificar los inputs.',
      ],
      answer: 1,
      explain:
        'Evaluator-optimizer tiene un bucle generador→evaluador→feedback. Si el evaluador rechaza la respuesta, el generador recibe el feedback y mejora. Es efectivo cuando los criterios de calidad son claros y articulables, y cuando una iteración mejora el resultado.',
    },
    {
      q: '¿Cuándo es preferible usar self-consistency (voting) en lugar de una sola llamada?',
      options: [
        'Siempre, porque es más preciso.',
        'Solo para tareas de clasificación.',

        'Cuando la tarea tiene una respuesta correcta pero el modelo puede equivocarse en una sola ejecución, y el coste de múltiples llamadas es aceptable.',

        'Cuando el modelo no tiene acceso a herramientas.',
      ],
      answer: 2,
      explain:
        'Self-consistency (generar N respuestas y tomar la mayoría) mejora la fiabilidad en tareas donde el modelo puede razonar correctamente pero comete errores ocasionales. El coste es N veces mayor, así que solo vale si la fiabilidad extra justifica el gasto.',
    },
    {
      q: '¿Cuál es el patrón más adecuado cuando diferentes tipos de input requieren prompts muy distintos?',
      options: [
        'Prompt chaining.',
        'Routing: un clasificador inicial dirige cada input al handler más apropiado.',
        'Parallelization.',
        'Evaluator-optimizer.',
      ],
      answer: 1,
      explain:
        'El routing usa un primer LLM (o regla) para clasificar el input y enviarlo al handler especializado. Esto permite tener prompts optimizados para cada tipo de input y usar modelos de diferente coste según la complejidad del caso.',
    },
  ],
  misconceptions: [
    {
      myth: 'Los agentes autónomos son siempre superiores a los workflows.',
      reality:
        'Los agentes son más difíciles de depurar, más costosos, menos predecibles y más difíciles de auditar. La mayoría de casos de uso empresariales se resuelven mejor con workflows bien diseñados. Solo usa agentes cuando el problema genuinamente requiere decisiones dinámicas que no pueden codificarse de antemano.',
    },
    {
      myth: 'Prompt chaining secuencial es siempre la arquitectura más simple.',
      reality:
        'Para tareas con partes independientes, la paralelización puede ser más simple de razonar sobre ella (cada parte es independiente) y mucho más rápida. La "simplicidad" del código secuencial a veces oculta que estás desaprovechando paralelismo natural.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
    {
      title: 'Wang et al. (2022) · Self-Consistency Improves Chain of Thought Reasoning',
      url: 'https://arxiv.org/abs/2203.11171',
      kind: 'paper',
    },
  ],
}

export default details
