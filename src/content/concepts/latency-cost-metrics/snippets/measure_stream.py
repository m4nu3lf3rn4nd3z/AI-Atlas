# Medir TTFT, velocidad de salida y coste de una petición real con streaming.
import time

import anthropic

client = anthropic.Anthropic()
PRICE_IN, PRICE_OUT = 1.0, 5.0  # $/M tokens de ejemplo: consulta los precios vigentes

start = time.perf_counter()
first = None
with client.messages.stream(
    model="claude-haiku-4-5-20251001",
    max_tokens=600,
    messages=[{"role": "user", "content": "Explica en 150 palabras qué es el KV cache."}],
) as stream:
    for text in stream.text_stream:
        if first is None:
            first = time.perf_counter()  # primer token visible
        print(text, end="", flush=True)
    final = stream.get_final_message()
end = time.perf_counter()

u = final.usage
ttft = first - start
tps = u.output_tokens / (end - first)
cost = (u.input_tokens * PRICE_IN + u.output_tokens * PRICE_OUT) / 1e6
print(f"\n\nTTFT {ttft:.2f} s · {tps:.0f} tokens/s · total {end - start:.2f} s")
print(f"{u.input_tokens} tokens de entrada, {u.output_tokens} de salida · {cost:.5f} $")
# Con un modelo de razonamiento, el TTFT visible incluye el tiempo de pensar.
