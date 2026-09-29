import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Sistema supervisor-worker con Anthropic SDK',
      lang: 'python',
      code: `import anthropic
import asyncio
from dataclasses import dataclass

client = anthropic.AsyncAnthropic()

@dataclass
class WorkerResult:
    worker: str
    output: str

async def worker(role: str, task: str, context: str = "") -> WorkerResult:
    """Worker especializado que ejecuta una subtarea."""
    system = f"Eres un especialista en {role}. Sé conciso y directo."
    content = f"{context}\\n\\nTarea: {task}" if context else task

    response = await client.messages.create(
        model="claude-sonnet-5-5",  # Workers usan modelo eficiente
        max_tokens=1024,
        system=system,
        messages=[{"role": "user", "content": content}],
    )
    return WorkerResult(worker=role, output=response.content[0].text)

async def supervisor(objective: str) -> str:
    """Orquestador que planifica y delega a workers."""
    # Paso 1: Planificar
    plan_response = await client.messages.create(
        model="claude-opus-5-5",  # Supervisor usa modelo más capaz
        max_tokens=512,
        system="Eres un planificador. Divide la tarea en máximo 3 subtareas paralelas.",
        messages=[{"role": "user", "content": f"Objetivo: {objective}\\n\\nGenera las subtareas como lista JSON: [{{'role': 'especialidad', 'task': 'descripción'}}]"}],
    )

    import json
    subtasks = json.loads(plan_response.content[0].text)

    # Paso 2: Ejecutar workers en paralelo
    results = await asyncio.gather(*[worker(s["role"], s["task"]) for s in subtasks])

    # Paso 3: Sintetizar resultados
    synthesis_input = "\\n\\n".join(f"[{r.worker}]:\\n{r.output}" for r in results)
    synthesis = await client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system="Integra los resultados de los especialistas en una respuesta coherente.",
        messages=[{"role": "user", "content": f"Objetivo original: {objective}\\n\\nResultados:\\n{synthesis_input}"}],
    )
    return synthesis.content[0].text

# result = asyncio.run(supervisor("Analiza las ventajas y riesgos de usar LLMs en diagnóstico médico"))
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Los workers usan Sonnet (más rápido y barato); el supervisor usa Opus (más capaz para planificación y síntesis). Este patrón reduce coste sin sacrificar calidad en las decisiones de alto nivel.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la ventaja principal de un sistema multi-agente con workers paralelos respecto a un solo agente secuencial?',
      options: [
        'Cuando las subtareas son independientes, el tiempo total es ~el de la tarea más lenta, no la suma de todas. Además permite usar modelos especializados por subtarea.',

        'Es siempre más barato.',

        'Los sistemas multi-agente nunca fallan.',
        'Los workers no necesitan instrucciones.',
      ],
      answer: 0,
      explain:
        'Con asyncio.gather() o equivalentes, N workers paralelos terminan en el tiempo de la tarea más lenta, no N×t. Para tareas divisibles (análisis de múltiples secciones de un documento, investigación en paralelo), esto puede suponer reducciones de tiempo de 4-10x.',
    },
    {
      q: '¿Por qué la prompt injection es especialmente peligrosa en sistemas multi-agente?',
      options: [
        'Porque hay más modelos que pueden ser atacados.',
        'Porque una injection en un worker puede propagarse al supervisor y a otros workers a través de los mensajes inter-agente, permitiendo que instrucciones maliciosas de datos externos controlen todo el sistema.',
        'Porque los sistemas multi-agente no tienen guardrails.',
        'No es más peligrosa que en sistemas de un solo agente.',
      ],
      answer: 1,
      explain:
        'Si un worker procesa contenido externo (emails, documentos, resultados de búsqueda) y es inyectado, su output contaminado puede llegar al supervisor como "resultado de un worker de confianza". Sin validación de los mensajes entre agentes, la injection se amplifica a través del sistema.',
    },
    {
      q: '¿Cuándo NO tiene sentido usar un sistema multi-agente?',
      options: [
        'Cuando la tarea es compleja.',
        'Nunca; multi-agente siempre es mejor.',

        'Cuando un único agente bien diseñado puede hacer la tarea, o cuando el flujo es lineal y predecible — en esos casos, el overhead de coordinación multi-agente es solo complejidad sin beneficio.',

        'Cuando el presupuesto de tokens es limitado.',
      ],
      answer: 2,
      explain:
        'Multi-agente tiene overhead: coordinación, mensajes entre agentes, debugging más complejo, mayor superficie de ataque. Si un solo agente o un workflow pueden hacer la tarea, son la opción más simple y mantenible. Añade complejidad solo cuando hay evidencia clara de que es necesaria.',
    },
    {
      q: '¿Qué protocolo estándar permite que agentes de diferentes frameworks se comuniquen?',
      options: [
        'REST API directa.',
        'A2A (Agent-to-Agent): el protocolo de Google para delegar tareas entre agentes como servicios HTTP, independientemente del framework que los implementa.',
        'WebSockets.',
        'No existe ningún estándar.',
      ],
      answer: 1,
      explain:
        'A2A (Agent-to-Agent) define cómo un agente puede descubrir las capacidades de otro y delegarle tareas, independientemente de si está implementado en LangGraph, AutoGen, CrewAI o código propio. Complementa a MCP (que conecta agentes con herramientas).',
    },
  ],
  misconceptions: [
    {
      myth: 'Más agentes en paralelo siempre produce mejores resultados.',
      reality:
        'La calidad del resultado no mejora por añadir más agentes — mejora por tener agentes con prompts más especializados y mejores herramientas. Agentes adicionales pueden introducir inconsistencias si sus outputs contradictorios son difíciles de sintetizar.',
    },
    {
      myth: 'En sistemas multi-agente, los mensajes entre agentes son de confianza.',
      reality:
        'Un agente que procesa datos externos puede ser inyectado y producir outputs maliciosos que parecen legítimos al siguiente agente en la cadena. Trata los outputs de otros agentes con el mismo nivel de desconfianza que los inputs externos.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Multi-agent systems',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/tool-use/computer-use',
      kind: 'docs',
    },
    {
      title: 'Google · Agent-to-Agent (A2A) protocol',
      url: 'https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/',
      kind: 'blog',
    },
  ],
}

export default details
