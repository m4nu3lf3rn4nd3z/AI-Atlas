# Búsqueda híbrida en Qdrant: vector denso (e5) + vector disperso BM25 en el mismo punto,
# fusionados con RRF en una sola consulta.
from fastembed import SparseTextEmbedding
from qdrant_client import QdrantClient, models
from sentence_transformers import SentenceTransformer

dense = SentenceTransformer("intfloat/multilingual-e5-small")
bm25 = SparseTextEmbedding("Qdrant/bm25", language="spanish")  # stemming y stopwords en español

client = QdrantClient(":memory:")
client.create_collection(
    "kb",
    vectors_config={"dense": models.VectorParams(size=384, distance=models.Distance.COSINE)},
    sparse_vectors_config={"bm25": models.SparseVectorParams(modifier=models.Modifier.IDF)},  # IDF lo calcula Qdrant
)

docs = [
    "E-4012: el código postal no corresponde a la provincia indicada.",
    "Si un paquete llega dañado, comunícalo en los 7 días siguientes a la entrega.",
]
points = []
for i, text in enumerate(docs):
    s = next(iter(bm25.embed([text])))
    points.append(
        models.PointStruct(
            id=i,
            vector={
                "dense": dense.encode(f"passage: {text}", normalize_embeddings=True).tolist(),
                "bm25": models.SparseVector(indices=s.indices.tolist(), values=s.values.tolist()),
            },
            payload={"text": text},
        )
    )
client.upsert("kb", points=points)


def hybrid(query: str, limit: int = 3):
    s = next(iter(bm25.query_embed(query)))
    return client.query_points(
        "kb",
        prefetch=[
            models.Prefetch(query=dense.encode(f"query: {query}", normalize_embeddings=True).tolist(), using="dense", limit=20),
            models.Prefetch(query=models.SparseVector(indices=s.indices.tolist(), values=s.values.tolist()), using="bm25", limit=20),
        ],
        query=models.FusionQuery(fusion=models.Fusion.RRF),
        limit=limit,
    ).points


for q in ["¿Qué significa E-4012?", "me ha llegado la caja rota"]:
    print(q, "→", hybrid(q)[0].payload["text"])
