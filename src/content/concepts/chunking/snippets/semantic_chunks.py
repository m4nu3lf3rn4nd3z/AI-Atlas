# Chunking semántico: cortar donde cae la similitud entre frases consecutivas.
import re

import numpy as np
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")


def semantic_chunks(text: str, percentile: float = 90, max_sentences: int = 12) -> list[str]:
    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", text) if s.strip()]
    emb = model.encode(sentences, normalize_embeddings=True)
    # Distancia coseno entre cada frase y la siguiente
    distances = 1 - np.sum(emb[:-1] * emb[1:], axis=1)
    threshold = np.percentile(distances, percentile)  # cortes en el 10 % de saltos más grandes

    chunks, current = [], [sentences[0]]
    for sentence, dist in zip(sentences[1:], distances):
        if dist > threshold or len(current) >= max_sentences:
            chunks.append(" ".join(current))
            current = []
        current.append(sentence)
    chunks.append(" ".join(current))
    return chunks


for c in semantic_chunks(open("historia_transformer.txt", encoding="utf-8").read()):
    print("—", c[:90], "…")
