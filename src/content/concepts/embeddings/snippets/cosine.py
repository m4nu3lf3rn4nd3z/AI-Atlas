import numpy as np


def cosine(a: np.ndarray, b: np.ndarray) -> float:
    """Similitud coseno entre dos vectores."""
    return float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))


def top_k(query: np.ndarray, matrix: np.ndarray, k: int = 3) -> list[tuple[int, float]]:
    """Búsqueda exacta por fuerza bruta: compara la consulta con todas las filas.

    Es lo que hace un índice "flat". Con millones de vectores se usan índices
    aproximados (ANN) como HNSW, que no comparan con todo.
    """
    q = query / np.linalg.norm(query)
    m = matrix / np.linalg.norm(matrix, axis=1, keepdims=True)
    scores = m @ q
    best = np.argsort(-scores)[:k]
    return [(int(i), float(scores[i])) for i in best]


rng = np.random.default_rng(0)
docs = rng.normal(size=(1000, 384))           # 1000 "documentos" de 384 dimensiones
query = docs[42] + rng.normal(scale=0.3, size=384)  # una consulta parecida al documento 42
print(top_k(query, docs))                      # el 42 aparece primero
