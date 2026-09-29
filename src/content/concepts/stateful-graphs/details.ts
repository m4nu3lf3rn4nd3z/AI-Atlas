import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Grafo con estado y checkpoint en LangGraph (Python)',
      lang: 'python',
      code: `from typing import TypedDict, Annotated
import operator
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.sqlite import SqliteSaver
import anthropic

client = anthropic.Anthropic()

# 1. Definir el estado tipado
class ResearchState(TypedDict):
    messages: Annotated[list, operator.add]  # append-only
    draft: str
    iteration: int
    approved: bool

# 2. Definir los nodos (funciones que transforman el estado)
def researcher(state: ResearchState) -> dict:
    response = client.messages.create(
        model="claude-sonnet-5-5",
        max_tokens=1024,
        messages=[
            *state["messages"],
            {"role": "user", "content": "Investiga y escribe un borrador sobre el tema"},
        ],
    )
    return {
        "messages": [{"role": "assistant", "content": response.content[0].text}],
        "draft": response.content[0].text,
        "iteration": state.get("iteration", 0) + 1,
    }

def reviewer(state: ResearchState) -> dict:
    if state.get("approved"):
        return {}  # Ya aprobado, no hacer nada
    # Revisar el borrador
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=512,
        messages=[{"role": "user", "content": f"Revisa este borrador y di si está listo (sí/no) y por qué:\\n{state['draft']}"}],
    )
    verdict = "sí" in response.content[0].text.lower()
    return {"approved": verdict}

def should_continue(state: ResearchState) -> str:
    if state.get("approved") or state.get("iteration", 0) >= 3:
        return END
    return "researcher"

# 3. Construir el grafo
workflow = StateGraph(ResearchState)
workflow.add_node("researcher", researcher)
workflow.add_node("reviewer", reviewer)
workflow.set_entry_point("researcher")
workflow.add_edge("researcher", "reviewer")
workflow.add_conditional_edges("reviewer", should_continue)

# 4. Compilar con checkpoint para persistencia
memory = SqliteSaver.from_conn_string("research.db")
graph = workflow.compile(
    checkpointer=memory,
    interrupt_before=["researcher"],  # pausa antes de cada iteración
)

config = {"configurable": {"thread_id": "proyecto-abc"}}
state = graph.invoke({"messages": [{"role": "user", "content": "Escribe sobre LLMs en educación"}]}, config)
print(f"Borrador:\\n{state['draft']}")
print(f"Aprobado: {state['approved']}")
`,
      deps: { langgraph: '>=0.2', anthropic: '>=0.40', 'aiosqlite': '>=0.20' },
      verifiedAt: '2026-09',
      note: 'interrupt_before=["researcher"] hace que el grafo se detenga antes de cada nueva iteración del investigador, permitiendo revisión humana. Reanudar con graph.invoke(None, config).',
    },
  ],
  quiz: [
    {
      q: '¿Qué ventaja tiene el patrón `Annotated[list, operator.add]` en el estado de LangGraph?',
      options: [
        'Define que cuando el nodo devuelva un valor para ese campo, se añadirá al final de la lista en lugar de reemplazarla — comportamiento append-only que es ideal para historial de mensajes.',

        'Hace el estado más rápido.',

        'Limita el número de mensajes.',
        'Es solo para compatibilidad con Python 3.8.',
      ],
      answer: 0,
      explain:
        'Por defecto en LangGraph, cuando un nodo devuelve un valor, reemplaza el campo en el estado. Con `Annotated[list, operator.add]`, el valor devuelto se añade (append) a la lista existente. Esto es crucial para el historial de mensajes: cada nodo puede añadir mensajes sin sobreescribir los anteriores.',
    },
    {
      q: '¿Qué permite hacer el "time-travel" de LangGraph?',
      options: [
        'Ejecutar el agente más rápido.',
        'Ver el historial completo de estados, reproducir una ejecución pasada desde cualquier checkpoint, o editar el estado en un punto anterior y relanzar desde ahí.',
        'Reducir el coste de las llamadas.',
        'Compartir el agente con otros usuarios.',
      ],
      answer: 1,
      explain:
        'LangGraph guarda el estado completo en cada checkpoint. Time-travel permite: visualizar cómo evolucionó el estado, reproducir bugs exactamente como ocurrieron, y hacer "simulaciones" editando el estado en un punto anterior ("¿qué hubiera pasado si el agente hubiera tomado la decisión B en el paso 3?").',
    },
    {
      q: '¿Para qué sirve `interrupt_before` al compilar el grafo?',
      options: [
        'Para cancelar el grafo si hay un error.',
        'Para ejecutar ese nodo más rápido.',

        'Para pausar la ejecución justo antes de ese nodo y esperar que el usuario o código externo decida si continuar — es el mecanismo principal de human-in-the-loop.',

        'Para saltarse ese nodo.',
      ],
      answer: 2,
      explain:
        '`interrupt_before=["execute_action"]` hace que el grafo guarde el checkpoint justo antes de ese nodo y detenga la ejecución. El sistema externo puede entonces: revisar el estado pendiente, aprobarlo o cancelarlo, modificar el estado, y luego reanudar con `graph.invoke(None, config)` pasando el mismo thread_id.',
    },
    {
      q: '¿Cuándo es preferible usar LangGraph en lugar de un bucle ReAct simple?',
      options: [
        'Siempre — LangGraph es siempre mejor.',
        'Cuando la tarea es larga y puede interrumpirse (persistencia), necesitas aprobación humana en pasos críticos, o quieres capacidad de debugging con historial de estados.',
        'Solo para tareas de más de 100 pasos.',
        'Cuando no tienes acceso a la API de Anthropic.',
      ],
      answer: 1,
      explain:
        'Para tareas cortas y sin necesidad de persistencia, un bucle while con llamadas al LLM es más simple y suficiente. LangGraph añade valor cuando la tarea puede interrumpirse, necesitas persistir el estado entre sesiones, quieres HITL en acciones críticas, o necesitas capacidad de debugging.',
    },
  ],
  misconceptions: [
    {
      myth: 'Los grafos con estado son solo para LangGraph/LangChain.',
      reality:
        'El concepto de máquinas de estados con checkpoints es general. Temporal.io, Prefect, y Dagster ofrecen capacidades similares con mejor soporte para sistemas distribuidos y fault tolerance. Para TypeScript, hay implementaciones propias y XState. LangGraph es solo la implementación más popular en el ecosistema Python LLM.',
    },
    {
      myth: 'Guardar el estado completo en cada paso es siempre necesario.',
      reality:
        'El checkpointing tiene un coste de almacenamiento y latencia. Para tareas cortas (<10 pasos) donde la persistencia no es un requisito, un bucle simple sin checkpoints es más eficiente. Habilita checkpoints cuando realmente necesitas reanudar, depurar, o hacer HITL.',
    },
  ],
  sources: [
    {
      title: 'LangGraph · Documentación oficial',
      url: 'https://langchain-ai.github.io/langgraph/',
      kind: 'docs',
    },
    {
      title: 'Anthropic · Building effective agents — Workflows and agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
  ],
}

export default details
