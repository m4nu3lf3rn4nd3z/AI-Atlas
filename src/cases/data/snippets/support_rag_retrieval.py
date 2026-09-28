# pip install cohere
import cohere

CHUNKS = {
    "A": "Plazo general: dispones de 30 días naturales desde la entrega para devolver cualquier producto.",
    "B": "Excepciones por higiene: auriculares intraurales (…) solo se aceptan con el precinto intacto, salvo defecto.",
    "C": "Garantía legal de 3 años para defectos de fabricación.",
    "D": "Para solicitar una devolución entra en Mis pedidos > Devolver.",
    "E": "Las devoluciones de pedidos nacionales no tienen coste de envío.",
    "F": "Los cambios de talla son gratuitos durante 30 días.",
}


def rrf(rankings: list[list[str]], k: int = 60) -> list[str]:
    """Reciprocal Rank Fusion: combina rankings sin calibrar sus puntuaciones.

    Cada documento suma 1 / (k + posición) en cada lista en la que aparece.
    """
    scores: dict[str, float] = {}
    for ranking in rankings:
        for pos, doc_id in enumerate(ranking, start=1):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1 / (k + pos)
    return sorted(scores, key=lambda d: scores[d], reverse=True)


vector_hits = ["A", "D", "E", "C", "F"]  # ids devueltos por el vector store
bm25_hits = ["B", "A", "D", "E", "C"]    # ids devueltos por BM25
candidates = rrf([vector_hits, bm25_hits])[:10]
print("tras RRF:", candidates)            # ['A', 'D', 'E', 'C', 'B', 'F']: B solo está en una lista

co = cohere.ClientV2()  # lee CO_API_KEY del entorno
reranked = co.rerank(
    model="rerank-v3.5",
    query="¿Puedo devolver unos auriculares abiertos después de 20 días?",
    documents=[CHUNKS[i] for i in candidates],
    top_n=3,
)
context_ids = [candidates[r.index] for r in reranked.results]
print("contexto final:", context_ids)    # el cross-encoder sube B al primer puesto
