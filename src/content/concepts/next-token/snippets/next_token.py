# pip install torch transformers
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Modelo base pequeño (~1 GB): sin ajuste de chat, solo predice texto
name = "Qwen/Qwen2.5-0.5B"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)

inputs = tok("El cielo es", return_tensors="pt")
with torch.no_grad():
    logits = model(**inputs).logits          # (1, n_tokens, vocab_size)

last = logits[0, -1]                          # solo interesa la última posición
probs = torch.softmax(last, dim=-1)
print("vocabulario:", probs.shape[0], "tokens")

top = torch.topk(probs, 10)
for p, i in zip(top.values, top.indices):
    print(f"{tok.decode(i)!r:>14}  {p.item():.3f}")
