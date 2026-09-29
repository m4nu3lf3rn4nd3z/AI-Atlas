# Contextual retrieval: un LLM sitúa cada fragmento en su documento antes de indexarlo.
# El documento va en un bloque cacheado, así que solo se paga entero la primera vez.
import anthropic

client = anthropic.Anthropic()

PROMPT = """Este es el fragmento que queremos situar dentro del documento completo:
<chunk>
{chunk}
</chunk>
Escribe un contexto breve y conciso que sitúe este fragmento dentro del documento, para mejorar su recuperación en una búsqueda. Responde solo con ese contexto."""


def contextualize(document: str, chunk: str) -> str:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # un modelo rápido y barato basta para esta tarea
        max_tokens=150,
        messages=[
            {
                "role": "user",
                "content": [
                    # Igual para todos los fragmentos del documento: se cachea
                    # (si supera el mínimo cacheable del modelo).
                    {"type": "text", "text": f"<document>\n{document}\n</document>", "cache_control": {"type": "ephemeral"}},
                    {"type": "text", "text": PROMPT.format(chunk=chunk)},
                ],
            }
        ],
    )
    return response.content[0].text.strip()


document = open("politica_vacaciones.md", encoding="utf-8").read()
chunk = "Se pueden trasladar al año siguiente hasta 5 días no disfrutados, que deberán usarse antes del 31 de marzo."
context = contextualize(document, chunk)
to_index = f"{context}\n\n{chunk}"  # esto es lo que se pasa al modelo de embeddings y a BM25
print(to_index)
