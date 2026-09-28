import math

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

name = "Qwen/Qwen2.5-0.5B"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)

# 1) Generación autorregresiva escrita a mano (greedy: siempre el más probable)
ids = tok("La capital de Francia es", return_tensors="pt").input_ids
for _ in range(12):
    with torch.no_grad():
        next_id = model(ids).logits[0, -1].argmax()
    ids = torch.cat([ids, next_id.view(1, 1)], dim=1)   # el token elegido pasa a la entrada
    if next_id.item() == tok.eos_token_id:
        break
print(tok.decode(ids[0]))
# (model.generate hace esto mismo, pero reutiliza el KV cache en lugar de
#  recalcular todo el prefijo en cada paso)

# 2) Perplejidad de un texto: exp(pérdida media por token)
text = "El agua hierve a cien grados a nivel del mar."
enc = tok(text, return_tensors="pt")
with torch.no_grad():
    loss = model(**enc, labels=enc.input_ids).loss      # cross-entropy media
print(f"perplejidad: {math.exp(loss.item()):.1f}")
