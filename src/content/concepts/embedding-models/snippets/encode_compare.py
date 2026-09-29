# Embeddings con Sentence Transformers: prefijos, Matryoshka y cuantización.
import numpy as np
from sentence_transformers import SentenceTransformer
from sentence_transformers.quantization import quantize_embeddings

model = SentenceTransformer("intfloat/multilingual-e5-small")

docs = [
    "passage: Los envíos a Canarias tardan de 5 a 7 días laborables.",
    "passage: La verificación en dos pasos es obligatoria para administradores.",
]
query = "query: ¿Cuánto tarda un paquete en llegar a Tenerife?"

D = model.encode(docs, normalize_embeddings=True)
q = model.encode(query, normalize_embeddings=True)
print(D.shape, D @ q)  # (2, 384) y el coseno con cada documento

# Cuantización binaria: 1 bit por dimensión (32 veces menos memoria).
# Se busca con distancia de Hamming y se reordenan los mejores con los vectores completos.
D_bin = quantize_embeddings(D, precision="ubinary")
print(D.nbytes, "bytes →", D_bin.nbytes, "bytes")

# Matryoshka: solo en modelos entrenados para ello (este no lo está). Por ejemplo:
# SentenceTransformer("nomic-ai/nomic-embed-text-v1.5", trust_remote_code=True, truncate_dim=256)
