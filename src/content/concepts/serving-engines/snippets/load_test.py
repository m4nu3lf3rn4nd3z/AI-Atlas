# Prueba de carga: throughput del servidor frente a velocidad por usuario al subir la concurrencia.
import asyncio
import time

from openai import AsyncOpenAI  # cliente de Chat Completions; el servidor es vLLM, no OpenAI

client = AsyncOpenAI(base_url="http://localhost:8000/v1", api_key="no-hace-falta")


async def one(prompt: str) -> tuple[float, int, float]:
    start = time.perf_counter()
    first, tokens = None, 0
    stream = await client.chat.completions.create(
        model="Qwen/Qwen3-8B", messages=[{"role": "user", "content": prompt}], max_tokens=256, stream=True
    )
    async for chunk in stream:
        if chunk.choices and chunk.choices[0].delta.content:
            first = first or time.perf_counter()
            tokens += 1  # aproximado: un fragmento ≈ un token
    return (first or time.perf_counter()) - start, tokens, time.perf_counter() - start


async def run(concurrency: int):
    t = time.perf_counter()
    results = await asyncio.gather(*[one(f"Cuenta una historia corta #{i}") for i in range(concurrency)])
    wall = time.perf_counter() - t
    ttfts = sorted(r[0] for r in results)
    total = sum(r[1] for r in results)
    per_user = sum(r[1] / (r[2] - r[0]) for r in results) / concurrency
    print(f"{concurrency:>3} usuarios · TTFT p50 {ttfts[len(ttfts) // 2]:.2f} s · {per_user:.0f} tok/s por usuario · {total / wall:.0f} tok/s en total")


for c in (1, 8, 32, 64):
    asyncio.run(run(c))
