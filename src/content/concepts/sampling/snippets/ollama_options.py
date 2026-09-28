# pip install ollama   ·   ollama pull llama3.2:3b
import ollama

prompt = "Propón un nombre para una cafetería junto a una biblioteca:"

# Con un modelo local tienes acceso a todos los parámetros de sampling
for temperature in (0.0, 0.7, 1.3):
    r = ollama.generate(
        model="llama3.2:3b",
        prompt=prompt,
        options={
            "temperature": temperature,
            "top_p": 0.9,
            "min_p": 0.05,
            "seed": 42,          # mismo seed + mismas opciones → misma salida en local
            "num_predict": 20,   # máximo de tokens a generar
        },
    )
    print(f"T={temperature}: {r.response.strip()}")
