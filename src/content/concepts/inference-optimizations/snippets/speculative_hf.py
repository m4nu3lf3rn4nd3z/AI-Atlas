# Decodificación especulativa (assisted generation) con Transformers:
# un modelo pequeño propone tokens y el grande los verifica. Mismo tokenizador.
import time

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

target_id, draft_id = "Qwen/Qwen2.5-7B-Instruct", "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(target_id)
target = AutoModelForCausalLM.from_pretrained(target_id, torch_dtype=torch.bfloat16, device_map="auto")
draft = AutoModelForCausalLM.from_pretrained(draft_id, torch_dtype=torch.bfloat16, device_map="auto")

prompt = tok.apply_chat_template(
    [{"role": "user", "content": "Escribe una función en Python que valide un IBAN español."}],
    add_generation_prompt=True,
    return_tensors="pt",
).to(target.device)

for name, kwargs in [("normal", {}), ("especulativa", {"assistant_model": draft})]:
    t = time.perf_counter()
    out = target.generate(prompt, max_new_tokens=300, do_sample=False, **kwargs)
    n = out.shape[1] - prompt.shape[1]
    print(f"{name:<13} {n / (time.perf_counter() - t):.1f} tokens/s")
# Con do_sample=False, las dos salidas son idénticas: solo cambia la velocidad.
