import numpy as np


def softmax(x: np.ndarray, axis: int = -1) -> np.ndarray:
    x = x - x.max(axis=axis, keepdims=True)  # estabilidad numérica
    e = np.exp(x)
    return e / e.sum(axis=axis, keepdims=True)


def causal_self_attention(x: np.ndarray, Wq, Wk, Wv) -> tuple[np.ndarray, np.ndarray]:
    """Una cabeza de atención causal. x: (n_tokens, d_model)."""
    Q, K, V = x @ Wq, x @ Wk, x @ Wv                 # (n, d_head) cada una
    d = Q.shape[-1]
    scores = Q @ K.T / np.sqrt(d)                    # (n, n): relevancia de j para i
    mask = np.triu(np.ones_like(scores), k=1)        # 1 por encima de la diagonal = futuro
    scores = np.where(mask == 1, -np.inf, scores)    # el futuro queda prohibido
    weights = softmax(scores, axis=-1)               # cada fila suma 1
    return weights @ V, weights                      # media ponderada de los values


rng = np.random.default_rng(0)
n, d_model, d_head = 5, 16, 8
x = rng.normal(size=(n, d_model))                    # 5 tokens ya convertidos en embeddings
Wq, Wk, Wv = (rng.normal(size=(d_model, d_head)) / np.sqrt(d_model) for _ in range(3))

out, w = causal_self_attention(x, Wq, Wk, Wv)
print(out.shape)          # (5, 8): un vector nuevo por token, ahora con contexto
print(np.round(w, 2))     # triangular inferior; cada fila suma 1
