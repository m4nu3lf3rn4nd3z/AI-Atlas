# pip install torch
import torch
import torch.nn.functional as F

torch.manual_seed(0)
batch, heads, n, d_head = 1, 4, 6, 16
q = torch.randn(batch, heads, n, d_head)
k = torch.randn(batch, heads, n, d_head)
v = torch.randn(batch, heads, n, d_head)

# Implementación manual
scores = q @ k.transpose(-2, -1) / d_head**0.5
mask = torch.triu(torch.ones(n, n, dtype=torch.bool), diagonal=1)
manual = torch.softmax(scores.masked_fill(mask, float("-inf")), dim=-1) @ v

# La versión optimizada que usan los modelos reales (usa kernels tipo
# FlashAttention cuando el hardware lo permite): mismo resultado.
fused = F.scaled_dot_product_attention(q, k, v, is_causal=True)

print(torch.allclose(manual, fused, atol=1e-5))  # True
