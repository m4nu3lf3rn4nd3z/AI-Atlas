# Evaluar la recuperación antes que la generación: recall@k y MRR sobre un
# conjunto de preguntas con el documento que debería encontrarse.
from typing import Callable


def evaluate(retrieve: Callable[[str, int], list[str]], golden: list[dict], k: int = 3) -> dict:
    hits, reciprocal_ranks = 0, []
    for item in golden:
        ranking = retrieve(item["question"], 10)  # ids de documentos, del más al menos relevante
        rank = next((i + 1 for i, doc_id in enumerate(ranking) if doc_id in item["gold"]), None)
        hits += rank is not None and rank <= k
        reciprocal_ranks.append(1 / rank if rank else 0)
    return {
        f"recall@{k}": hits / len(golden),
        "mrr@10": sum(reciprocal_ranks) / len(golden),
    }


golden = [
    {"question": "¿Cuántos días tengo para devolver un pedido?", "gold": {"dev-politica"}},
    {"question": "¿Qué significa el error E-4012?", "gold": {"api-errores"}},
    {"question": "Me ha llegado la caja rota", "gold": {"env-incidencia"}},
    # … decenas de preguntas reales de tus usuarios, con su documento correcto
]

# print(evaluate(bm25_retrieve, golden))
# print(evaluate(dense_retrieve, golden))
# print(evaluate(hybrid_retrieve, golden))
