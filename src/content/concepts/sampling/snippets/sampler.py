import numpy as np


def sample_next(logits: np.ndarray, temperature=1.0, top_k=0, top_p=1.0, min_p=0.0, rng=None) -> int:
    """Elige el siguiente token. Mismo orden que Hugging Face: T → top-k → top-p → min-p."""
    rng = rng or np.random.default_rng()
    if temperature <= 0:
        return int(np.argmax(logits))                  # greedy

    z = logits / temperature
    p = np.exp(z - z.max())
    p /= p.sum()

    if top_k > 0:                                      # los k más probables
        p[p < np.sort(p)[-top_k]] = 0
    if top_p < 1.0:                                    # núcleo que acumula top_p
        order = np.argsort(-p)
        cum = np.cumsum(p[order])
        cutoff = np.searchsorted(cum, top_p * p.sum()) + 1
        p[order[cutoff:]] = 0
    if min_p > 0:                                      # umbral relativo al favorito
        p[p < min_p * p.max()] = 0

    p /= p.sum()                                       # renormalizar lo que queda
    return int(rng.choice(len(p), p=p))


logits = np.array([6.1, 4.9, 3.8, 3.5, 3.2, 2.4, 2.2, 2.0, 1.5, 0.8])
rng = np.random.default_rng(0)
for T in (0.2, 1.0, 1.8):
    picks = [sample_next(logits, T, top_p=0.9, rng=rng) for _ in range(1000)]
    print(f"T={T}:", np.bincount(picks, minlength=len(logits)))
