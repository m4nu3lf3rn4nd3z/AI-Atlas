# Estima la memoria que necesita un modelo a partir de su config.json en Hugging Face.
# Vale para modelos con GQA estándar (Llama, Qwen3, Mistral…); las arquitecturas
# híbridas o con MLA necesitan su propia fórmula de KV cache.
import json

from huggingface_hub import hf_hub_download

GiB = 1024**3


def estimate(repo: str, params_b: float, bits: float, context: int, kv_bits: int = 16, batch: int = 1):
    cfg = json.load(open(hf_hub_download(repo, "config.json")))
    cfg = cfg.get("text_config", cfg)  # los modelos multimodales anidan la config de texto
    layers = cfg["num_hidden_layers"]
    kv_heads = cfg.get("num_key_value_heads", cfg["num_attention_heads"])
    head_dim = cfg.get("head_dim") or cfg["hidden_size"] // cfg["num_attention_heads"]

    weights = params_b * 1e9 * bits / 8
    kv_per_token = 2 * layers * kv_heads * head_dim * kv_bits / 8  # K y V en cada capa
    kv = kv_per_token * context * batch
    return weights / GiB, kv / GiB, kv_per_token / 1024


w, kv, per_token = estimate("Qwen/Qwen3-8B", params_b=8.19, bits=4.89, context=32_768)
print(f"pesos {w:.1f} GiB · KV {kv:.1f} GiB ({per_token:.0f} KiB/token) · total ≈ {w + kv + 1:.1f} GiB")
# pesos 4.7 GiB · KV 4.5 GiB (144 KiB/token) · total ≈ 10.2 GiB   (Q4_K_M ≈ 4,89 bits/peso)
