# pip install torch
import torch
import torch.nn as nn
import torch.nn.functional as F


class Expert(nn.Module):
    """Una FFN normal: lo que sería la capa feed-forward de un modelo denso."""

    def __init__(self, d_model: int, d_hidden: int):
        super().__init__()
        self.net = nn.Sequential(nn.Linear(d_model, d_hidden), nn.GELU(), nn.Linear(d_hidden, d_model))

    def forward(self, x):
        return self.net(x)


class MoELayer(nn.Module):
    def __init__(self, d_model=64, d_hidden=256, n_experts=8, top_k=2):
        super().__init__()
        self.experts = nn.ModuleList(Expert(d_model, d_hidden) for _ in range(n_experts))
        self.router = nn.Linear(d_model, n_experts, bias=False)
        self.top_k = top_k

    def forward(self, x):                                   # x: (n_tokens, d_model)
        scores = F.softmax(self.router(x), dim=-1)          # (n_tokens, n_experts)
        weights, chosen = scores.topk(self.top_k, dim=-1)   # los k mejores por token
        weights = weights / weights.sum(dim=-1, keepdim=True)

        out = torch.zeros_like(x)
        for e, expert in enumerate(self.experts):
            token_idx, slot = (chosen == e).nonzero(as_tuple=True)
            if token_idx.numel() == 0:
                continue                                    # este experto no trabaja en este lote
            out[token_idx] += weights[token_idx, slot, None] * expert(x[token_idx])
        return out, chosen


layer = MoELayer()
x = torch.randn(10, 64)                                     # 10 tokens
y, chosen = layer(x)
print(y.shape)                                              # (10, 64)
print(chosen)                                               # qué 2 expertos usó cada token

total = sum(p.numel() for p in layer.parameters())
per_expert = sum(p.numel() for p in layer.experts[0].parameters())
active = per_expert * layer.top_k + layer.router.weight.numel()
print(f"parámetros totales {total:,} · activos por token {active:,}")
