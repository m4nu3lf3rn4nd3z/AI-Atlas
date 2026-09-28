# pip install ollama   ·   ollama pull qwen3:4b
# Un modelo de razonamiento abierto en tu PC: aquí sí ves el razonamiento completo.
import ollama

response = ollama.chat(
    model="qwen3:4b",
    messages=[{"role": "user", "content": "¿Cuántos viernes 13 tiene 2027?"}],
    think=True,   # separa el razonamiento de la respuesta
)

print("RAZONAMIENTO:\n", response.message.thinking)
print("\nRESPUESTA:\n", response.message.content)
