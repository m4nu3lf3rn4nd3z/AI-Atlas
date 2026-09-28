# pip install langgraph
import operator
from typing import Annotated, TypedDict

from langgraph.graph import END, START, StateGraph
from langgraph.types import Send


class ResearchState(TypedDict):
    question: str
    subtasks: list[str]
    findings: Annotated[list[dict], operator.add]  # cada subagente AÑADE sus hallazgos
    report: str


class SubtaskState(TypedDict):
    subtask: str


def plan(state: ResearchState) -> dict:
    # En un sistema real: un LLM grande descompone la pregunta
    return {"subtasks": ["precios de APIs", "coste de GPUs", "coste de operación"]}


def fan_out(state: ResearchState) -> list[Send]:
    # Un Send por subtarea: LangGraph ejecuta los subagentes en paralelo
    return [Send("research", {"subtask": s}) for s in state["subtasks"]]


def research(state: SubtaskState) -> dict:
    # Aquí iría el subagente: buscar, abrir páginas, calcular…, con un límite de pasos
    finding = {"subtask": state["subtask"], "dato": "…", "fuente": "https://…", "fecha": "2026-09"}
    return {"findings": [finding]}


def synthesize(state: ResearchState) -> dict:
    # Un LLM grande redacta con las notas (y un crítico lo revisaría después)
    return {"report": f"Informe con {len(state['findings'])} hallazgos con fuente y fecha."}


graph = StateGraph(ResearchState)
graph.add_node("plan", plan)
graph.add_node("research", research)
graph.add_node("synthesize", synthesize)
graph.add_edge(START, "plan")
graph.add_conditional_edges("plan", fan_out, ["research"])
graph.add_edge("research", "synthesize")
graph.add_edge("synthesize", END)
app = graph.compile()

print(app.invoke({"question": "¿Local o API para 2 M de peticiones/mes?", "findings": []})["report"])
