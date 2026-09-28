# pip install torch transformers
import time

from transformers import AutoModelForCausalLM, AutoTokenizer

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)
inputs = tok("Explica qué es la fotosíntesis.", return_tensors="pt")

# Misma salida (greedy), distinta velocidad: sin caché, cada paso recalcula
# las keys/values de todo el prefijo.
for use_cache in (True, False):
    t0 = time.perf_counter()
    model.generate(**inputs, max_new_tokens=150, do_sample=False, use_cache=use_cache)
    print(f"use_cache={use_cache}: {time.perf_counter() - t0:.1f} s")
