import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Bucle agéntico básico con límite de pasos',
      lang: 'python',
      code: `import anthropic
import json

client = anthropic.Anthropic()

# Herramientas del agente
def search_web(query: str) -> str:
    return f"[Resultado simulado para '{query}']: el tipo de cambio EUR/USD es 1.09"

def calculate(expression: str) -> str:
    try:
        return str(eval(expression, {"__builtins__": {}}, {}))  # eval limitado
    except Exception as e:
        return f"Error: {e}"

TOOLS = {
    "search_web": search_web,
    "calculate": calculate,
}

TOOL_DEFS = [
    {"name": "search_web", "description": "Busca información en la web.",
     "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]}},
    {"name": "calculate", "description": "Evalúa una expresión matemática.",
     "input_schema": {"type": "object", "properties": {"expression": {"type": "string"}}, "required": ["expression"]}},
]

def run_agent(task: str, max_steps: int = 10) -> str:
    messages = [{"role": "user", "content": task}]

    for step in range(max_steps):
        response = client.messages.create(
            model="claude-opus-5-5",
            max_tokens=1024,
            tools=TOOL_DEFS,
            messages=messages,
        )
        messages.append({"role": "assistant", "content": response.content})

        if response.stop_reason == "end_turn":
            return next(b.text for b in response.content if hasattr(b, "text"))

        # Ejecutar herramientas
        results = []
        for block in response.content:
            if block.type == "tool_use":
                fn = TOOLS.get(block.name)
                result = fn(**block.input) if fn else "herramienta no encontrada"
                print(f"  → {block.name}({block.input}) = {result}")
                results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})

        messages.append({"role": "user", "content": results})

    return "El agente alcanzó el límite de pasos."

answer = run_agent("¿Cuánto son 500 EUR en USD? Busca el tipo de cambio y calcula.")
print("\\nRespuesta final:", answer)
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'En producción, usa un sandbox para calculate y no eval() directo. El parámetro max_steps es crítico.',
    },
  ],
  quiz: [
    {
      q: '¿Qué ocurre cuando el stop_reason de la respuesta es "tool_use"?',
      options: [
        'El agente ha terminado y hay que mostrar la respuesta al usuario.',
        'El modelo quiere usar una herramienta: tu código debe ejecutarla y devolver el resultado.',
        'Ha ocurrido un error en la API.',
        'El modelo no pudo completar la tarea.',
      ],
      answer: 1,
      explain:
        '"tool_use" como stop_reason indica que el modelo emitió uno o más bloques tool_use y espera los resultados. Tu código ejecuta las herramientas y añade los tool_result al historial para el siguiente turno.',
    },
    {
      q: '¿Por qué es obligatorio establecer un MAX_ITERATIONS en un bucle agéntico?',
      options: [
        'Para ahorrar tokens en cada paso.',
        'La API lo requiere.',
        'Sin límite, un agente que no consigue terminar la tarea puede quedarse en bucle infinito acumulando coste.',
        'Para que el modelo sea más creativo.',
      ],
      answer: 2,
      explain:
        'Sin límite de iteraciones, un agente que falla repetidamente puede generar cientos de pasos, consumir el contexto completo y acumular un coste muy alto antes de que intervengas.',
    },
    {
      q: '¿Cuándo es preferible un workflow determinista sobre un agente?',
      options: [
        'Cuando la tarea es abierta y el camino no se conoce de antemano.',
        'Cuando la secuencia de pasos es predecible y fija.',
        'Cuando necesitas maximizar la creatividad del modelo.',
        'Siempre: los agentes son más costosos sin excepción.',
      ],
      answer: 1,
      explain:
        'Los workflows son más predecibles, más baratos y más fáciles de depurar. Si conoces los pasos de antemano, define un workflow. Solo usa agentes cuando la tarea requiere exploración genuinamente abierta.',
    },
    {
      q: 'En un bucle largo, el contexto crece con cada paso. ¿Cuál es la estrategia más sofisticada para manejarlo?',
      options: [
        'Eliminar todo el historial y empezar de cero.',
        'Guardar en memoria externa lo relevante y recuperarlo bajo demanda.',
        'Truncar siempre los últimos 1000 tokens.',
        'No hay forma de manejar contextos largos.',
      ],
      answer: 1,
      explain:
        'La memoria externa (BD vectorial, BD key-value) permite guardar los pasos más relevantes y recuperarlos cuando son necesarios, manteniendo el contexto activo pequeño sin perder información importante.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un agente autónomo no necesita supervisión humana.',
      reality:
        'Para acciones irreversibles (borrar archivos, enviar emails, hacer transacciones), el human-in-the-loop es una guardrail necesaria. Los mejores agentes en producción piden confirmación antes de acciones destructivas.',
    },
    {
      myth: 'ReAct requiere que el modelo muestre su razonamiento explícito.',
      reality:
        'El paper original de ReAct usaba razonamiento explícito (CoT). Con los modelos modernos, el razonamiento es interno (tokens de thinking). El patrón Thought→Action→Observation sigue siendo conceptualmente correcto aunque el "Thought" sea invisible.',
    },
    {
      myth: 'Cuantos más pasos de bucle, mejor trabaja el agente.',
      reality:
        'Más pasos = más coste y más latencia. Los agentes eficientes descomponen la tarea en pasos necesarios, no en todos los pasos posibles. Herramientas que devuelven más información de una vez (una query SQL vs 10 queries) reducen las iteraciones.',
    },
  ],
  sources: [
    {
      title: 'Yao et al. (2022) · ReAct: Synergizing Reasoning and Acting in Language Models',
      url: 'https://arxiv.org/abs/2210.03629',
      kind: 'paper',
    },
    {
      title: 'Anthropic · Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
  ],
}

export default details
