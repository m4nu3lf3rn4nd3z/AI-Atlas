# Agentic RAG: Claude decide cuándo y qué buscar, y puede encadenar varias búsquedas.
import anthropic

client = anthropic.Anthropic()


def search_kb(query: str) -> str:
    """Tu recuperación real: híbrida + reranker. Aquí, un ejemplo fijo."""
    kb = {
        "plan": "El plan Pro cuesta 149 € al mes e incluye acceso a la API.",
        "almacenaje": "El almacenaje cuesta 12 € por palé y mes; el primer mes es gratis en el plan Pro.",
    }
    hits = [text for key, text in kb.items() if key in query.lower()]
    return "\n".join(hits) or "Sin resultados."


tools = [
    {
        "name": "search_kb",
        "description": "Busca en la base de conocimiento de la empresa. Úsala una vez por cada dato que necesites; "
        "reformula la consulta si los resultados no responden.",
        "input_schema": {
            "type": "object",
            "properties": {"query": {"type": "string", "description": "Consulta concreta, con los términos clave"}},
            "required": ["query"],
        },
    }
]

messages = [{"role": "user", "content": "¿Qué plan necesito para usar la API y cuánto me costaría almacenar 3 palés el primer mes?"}]

while True:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=4096,
        thinking={"type": "adaptive"},
        system="Responde solo con información de la base de conocimiento y cita de qué búsqueda sale cada dato.",
        tools=tools,
        messages=messages,
    )
    messages.append({"role": "assistant", "content": response.content})
    if response.stop_reason != "tool_use":
        break
    results = []
    for block in response.content:
        if block.type == "tool_use":
            print("🔎", block.input["query"])
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": search_kb(block.input["query"])})
    messages.append({"role": "user", "content": results})

print("".join(b.text for b in response.content if b.type == "text"))
