import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Agente sin framework vs con framework (comparativa)',
      lang: 'python',
      code: `import anthropic
import json

client = anthropic.Anthropic()

# ===== SIN FRAMEWORK (~50 líneas) =====
def run_agent_raw(task: str, tools: list[dict], tool_executors: dict) -> str:
    """Bucle agéntico completo sin dependencias externas."""
    messages = [{"role": "user", "content": task}]

    for _ in range(10):  # límite de iteraciones
        response = client.messages.create(
            model="claude-opus-5-5",
            max_tokens=1024,
            tools=tools,
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            return response.content[0].text

        # Ejecutar herramientas
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                executor = tool_executors.get(block.name)
                result = executor(**block.input) if executor else f"Herramienta '{block.name}' no encontrada"
                tool_results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": str(result),
                })

        messages.extend([
            {"role": "assistant", "content": response.content},
            {"role": "user", "content": tool_results},
        ])

    return "Límite de iteraciones alcanzado"

# ===== CON LANGGRAPH (más código, más características) =====
# from langgraph.prebuilt import create_react_agent
# from langchain_anthropic import ChatAnthropic
# from langchain_core.tools import tool
#
# @tool
# def search(query: str) -> str:
#     """Busca información."""
#     return f"Resultados para: {query}"
#
# model = ChatAnthropic(model="claude-opus-5-5")
# agent = create_react_agent(model, tools=[search])
# result = agent.invoke({"messages": [{"role": "user", "content": task}]})

# Ejemplo de uso del agente sin framework
def search_tool(query: str) -> str:
    return f"[Simulado] Resultados para '{query}': LLMs en producción requieren observabilidad y evals."

tools_def = [{
    "name": "search",
    "description": "Busca información en la web",
    "input_schema": {"type": "object", "properties": {"query": {"type": "string"}}, "required": ["query"]},
}]

result = run_agent_raw("¿Qué es observabilidad en sistemas LLM?", tools_def, {"search": search_tool})
print(result)
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El bucle "sin framework" hace exactamente lo mismo que los frameworks para el caso básico. Usa un framework cuando necesites sus características específicas (LangSmith, grafos con estado, integraciones), no por defecto.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la principal razón para NO usar un framework de agentes por defecto?',
      options: [
        'Añaden una capa de abstracción que puede ocultar qué ocurre exactamente, complica el debugging, y puede introduce bugs difíciles de rastrear. La mayoría de casos simples son ~50 líneas de código propio.',

        'Son muy lentos.',

        'No son compatibles con Claude.',
        'Son muy caros.',
      ],
      answer: 0,
      explain:
        'Anthropic, en su guía Building Effective Agents, recomienda empezar con el código más simple posible. Los frameworks son útiles para sus características específicas (LangSmith, LangGraph, integraciones), no como base por defecto. La complejidad de la abstracción puede superar el valor añadido en proyectos simples.',
    },
    {
      q: '¿Para qué caso de uso específico de LangGraph es difícil encontrar una alternativa más simple?',
      options: [
        'Para llamar a Claude con herramientas.',
        'Para grafos con estado que necesitan persistencia, time-travel, y human-in-the-loop — características que requieren infraestructura de checkpoint y state machine que sería costoso implementar desde cero.',
        'Para hacer llamadas paralelas.',
        'Para parsear JSON.',
      ],
      answer: 1,
      explain:
        'El bucle ReAct básico no necesita LangGraph. Pero cuando necesitas persistir el estado entre sesiones, hacer time-travel para debugging, o interrumpir el grafo para aprobación humana, implementarlo desde cero es una tarea de ingeniería considerable. Ahí LangGraph aporta valor real.',
    },
    {
      q: '¿Cuál de estos frameworks está orientado a outputs tipados con Pydantic?',
      options: [
        'LangChain.',
        'AutoGen.',

        'Pydantic AI: diseñado para que el resultado del agente sea un objeto Pydantic tipado, integrándose naturalmente con APIs FastAPI y el ecosistema de validación de Python.',

        'CrewAI.',
      ],
      answer: 2,
      explain:
        'Pydantic AI es más reciente y apunta a una DX más limpia para quienes ya usan Pydantic/FastAPI: los resultados del agente son objetos tipados, no strings, lo que elimina el parsing manual y aprovecha la validación de Pydantic para asegurar que el LLM devuelve el schema correcto.',
    },
    {
      q: '¿Qué aporta CrewAI que lo diferencia de LangGraph?',
      options: [
        'Es más rápido que LangGraph.',
        'Una abstracción de alto nivel orientada a "equipos" de agentes con roles (investigador, redactor, revisor), más intuitiva para prototipos aunque con menos control fino del flujo que LangGraph.',
        'Solo funciona con GPT-4.',
        'Tiene su propio modelo de IA.',
      ],
      answer: 1,
      explain:
        'CrewAI hace que sea muy fácil definir múltiples agentes con roles y que colaboren en una tarea. Para prototipos de sistemas multi-agente, la abstracción de Agent+Task+Crew es muy productiva. LangGraph tiene más control y es más adecuado para sistemas de producción con flujos complejos.',
    },
  ],
  misconceptions: [
    {
      myth: 'Usar un framework hace el agente más inteligente o más capaz.',
      reality:
        'La inteligencia y capacidades del agente vienen del modelo LLM y del prompt, no del framework. Un agente construido con LangGraph no toma mejores decisiones que el mismo agente implementado con código propio si usan el mismo modelo y el mismo prompt.',
    },
    {
      myth: 'LangChain y LangGraph son lo mismo.',
      reality:
        'LangChain es la librería original (chains, LCEL, integraciones con docenas de servicios). LangGraph es una librería separada del mismo equipo, específicamente para grafos con estado y máquinas de estados para agentes. LangGraph es más nuevo, más maduro para agentes, y se puede usar sin LangChain.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
    {
      title: 'LangGraph · Documentación oficial',
      url: 'https://langchain-ai.github.io/langgraph/',
      kind: 'docs',
    },
    {
      title: 'Pydantic AI · Documentación',
      url: 'https://ai.pydantic.dev/',
      kind: 'docs',
    },
  ],
}

export default details
