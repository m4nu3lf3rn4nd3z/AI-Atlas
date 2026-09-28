"""¿Cabe y a qué velocidad irá? Memoria por parámetros totales, cómputo por activos."""

MODELS = {
    # nombre: (parámetros totales en miles de millones, activos por token)
    "Mixtral 8x7B": (46.7, 12.9),
    "Qwen3-30B-A3B": (30.5, 3.3),
    "gpt-oss-20b": (21.0, 3.6),
    "Llama-3-8B (denso)": (8.0, 8.0),
}

BYTES_PER_PARAM = {"FP16": 2.0, "Q8": 1.06, "Q4": 0.56}   # aproximado, incluye escalas de cuantización

for name, (total_b, active_b) in MODELS.items():
    mem = {q: total_b * b for q, b in BYTES_PER_PARAM.items()}
    print(
        f"{name:22} memoria FP16 {mem['FP16']:6.1f} GB · Q4 {mem['Q4']:5.1f} GB"
        f" · cómputo por token ≈ modelo denso de {active_b:.1f}B"
    )
# Sin contar el KV cache ni la sobrecarga del runtime: añade un margen del 10–20 %.
