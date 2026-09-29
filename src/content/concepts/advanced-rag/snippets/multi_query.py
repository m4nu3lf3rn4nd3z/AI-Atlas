# Múltiples consultas + RRF: un modelo rápido reformula la pregunta y se fusionan los resultados.
import anthropic

client = anthropic.Anthropic()


def rewrite(question: str, n: int = 3) -> list[str]:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # tarea sencilla: un modelo pequeño basta
        max_tokens=300,
        messages=[
            {
                "role": "user",
                "content": f"Escribe {n} formas distintas de buscar la respuesta a esta pregunta en una base de "
                f"conocimiento, una por línea, sin numerar:\n\n{question}",
            }
        ],
    )
    lines = response.content[0].text.strip().splitlines()
    return [question, *[l.strip() for l in lines if l.strip()][:n]]


def rrf(rankings: list[list[str]], k: int = 60) -> list[str]:
    scores: dict[str, float] = {}
    for ranking in rankings:
        for pos, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + pos + 1)
    return sorted(scores, key=scores.get, reverse=True)


def search(query: str) -> list[str]:
    ...  # tu recuperación: devuelve ids de fragmentos ordenados


queries = rewrite("Me han rechazado la tarjeta, ¿se van a quedar parados mis envíos?")
# p. ej. «pago fallido de la cuota», «qué pasa si no se cobra la suscripción», …
fused = rrf([search(q) for q in queries])
