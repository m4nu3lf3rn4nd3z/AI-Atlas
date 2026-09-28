from dataclasses import dataclass


@dataclass
class ModelConfig:
    name: str
    layers: int
    kv_heads: int      # con GQA, menos que las cabezas de query
    head_dim: int


def kv_cache_bytes(cfg: ModelConfig, tokens: int, bytes_per_value: float = 2, batch: int = 1) -> float:
    """Memoria del KV cache: 2 (K y V) × capas × kv_heads × head_dim × bytes × tokens × batch."""
    return 2 * cfg.layers * cfg.kv_heads * cfg.head_dim * bytes_per_value * tokens * batch


GiB = 1024**3
models = [
    ModelConfig("Llama-3-8B", layers=32, kv_heads=8, head_dim=128),
    ModelConfig("Llama-3-70B", layers=80, kv_heads=8, head_dim=128),
]

for cfg in models:
    per_token = kv_cache_bytes(cfg, 1) / 1024
    print(f"{cfg.name}: {per_token:.0f} KiB por token")
    for ctx in (8_192, 32_768, 131_072):
        print(f"  {ctx:>7} tokens → {kv_cache_bytes(cfg, ctx) / GiB:5.1f} GiB (FP16, 1 petición)")

# Llama-3-8B: 128 KiB/token → 32k tokens ≈ 4 GiB, además de los ~16 GiB de pesos en FP16.
# Por eso servir contextos largos a muchos usuarios a la vez es caro.
