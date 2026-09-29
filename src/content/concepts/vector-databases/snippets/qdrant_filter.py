# Qdrant: colección, puntos con metadatos y búsqueda filtrada por cliente y vigencia.
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

embedder = SentenceTransformer("intfloat/multilingual-e5-small")
client = QdrantClient(":memory:")  # modo local; en producción, QdrantClient(url=...)

client.create_collection(
    collection_name="kb",
    vectors_config=models.VectorParams(size=384, distance=models.Distance.COSINE),
)
# Índice sobre el campo por el que siempre filtraremos
client.create_payload_index("kb", field_name="tenant", field_schema=models.PayloadSchemaType.KEYWORD)

chunks = [
    {"id": 1, "tenant": "acme", "outdated": False, "text": "Las devoluciones se aceptan durante 14 días."},
    {"id": 2, "tenant": "acme", "outdated": True, "text": "Las devoluciones se aceptan durante 30 días."},
    {"id": 3, "tenant": "globex", "outdated": False, "text": "Las devoluciones se aceptan durante 60 días."},
]
client.upsert(
    collection_name="kb",
    points=[
        models.PointStruct(
            id=c["id"],
            vector=embedder.encode(f"passage: {c['text']}", normalize_embeddings=True).tolist(),
            payload={"tenant": c["tenant"], "outdated": c["outdated"], "text": c["text"], "embedding_model": "e5-small"},
        )
        for c in chunks
    ],
)

hits = client.query_points(
    collection_name="kb",
    query=embedder.encode("query: ¿Cuántos días tengo para devolver?", normalize_embeddings=True).tolist(),
    query_filter=models.Filter(
        must=[models.FieldCondition(key="tenant", match=models.MatchValue(value="acme"))],  # nunca opcional
        must_not=[models.FieldCondition(key="outdated", match=models.MatchValue(value=True))],
    ),
    limit=3,
).points

for h in hits:
    print(round(h.score, 3), h.payload["text"])  # solo el fragmento vigente de acme
