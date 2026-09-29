# Ollama desde Python: modelo local, contexto ampliado y streaming.
# Antes: `ollama pull qwen3:8b` (≈ 5 GB en Q4_K_M).
import ollama

stream = ollama.chat(
    model="qwen3:8b",
    messages=[{"role": "user", "content": "Resume en tres frases qué es la cuantización."}],
    options={"num_ctx": 16384, "temperature": 0.7},  # el contexto por defecto (4.096) trunca en silencio
    stream=True,
)
for chunk in stream:
    print(chunk["message"]["content"], end="", flush=True)
