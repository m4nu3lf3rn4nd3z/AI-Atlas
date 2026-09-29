# RAG mínimo de principio a fin: embeddings locales, búsqueda por coseno y
# respuesta de Claude con citas estructuradas.
import anthropic
import numpy as np
from sentence_transformers import SentenceTransformer

docs = [
    {"title": "Política de devoluciones", "text": "Tus clientes pueden devolver un pedido en los 14 días naturales siguientes a la recepción..."},
    {"title": "Plazos de entrega", "text": "Los envíos a la Península se entregan en 24–48 horas laborables. A Canarias, de 5 a 7..."},
    {"title": "Códigos de error de la API", "text": "E-4012: el código postal no corresponde a la provincia indicada..."},
]

# 1. Indexar: E5 espera el prefijo "passage: " en los documentos y "query: " en las preguntas
embedder = SentenceTransformer("intfloat/multilingual-e5-small")
doc_vecs = embedder.encode([f"passage: {d['title']}. {d['text']}" for d in docs], normalize_embeddings=True)


def retrieve(question: str, k: int = 2) -> list[dict]:
    q = embedder.encode(f"query: {question}", normalize_embeddings=True)
    scores = doc_vecs @ q  # coseno, porque los vectores están normalizados
    return [docs[i] for i in np.argsort(-scores)[:k]]


# 2. Generar: cada fragmento va como documento con citas activadas
client = anthropic.Anthropic()
question = "¿Cuánto tarda un paquete en llegar a Tenerife?"

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    system="Responde solo con la información de los documentos. Si no está, di que no lo sabes.",
    messages=[
        {
            "role": "user",
            "content": [
                *[
                    {
                        "type": "document",
                        "source": {"type": "text", "media_type": "text/plain", "data": d["text"]},
                        "title": d["title"],
                        "citations": {"enabled": True},
                    }
                    for d in retrieve(question)
                ],
                {"type": "text", "text": question},
            ],
        }
    ],
)

for block in response.content:
    if block.type == "text":
        print(block.text, end="")
        for c in block.citations or []:
            print(f" [{c.document_title}: «{c.cited_text.strip()}»]", end="")
print()
