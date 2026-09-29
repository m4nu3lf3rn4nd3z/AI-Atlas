import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Benchmark de modelos con tus propios casos de uso',
      lang: 'python',
      code: `import anthropic
import json
import time
from dataclasses import dataclass, field

client = anthropic.Anthropic()

@dataclass
class ModelBenchmark:
    model: str
    scores: list[float] = field(default_factory=list)
    latencies: list[float] = field(default_factory=list)
    costs: list[float] = field(default_factory=list)

# Precios aproximados (verificar en la web del proveedor)
PRICES_PER_1M = {
    "claude-opus-5-5": {"input": 15.0, "output": 75.0},
    "claude-sonnet-5-5": {"input": 3.0, "output": 15.0},
    "claude-haiku-4-5-20251001": {"input": 0.25, "output": 1.25},
}

def judge_response(question: str, answer: str, reference: str) -> float:
    """LLM-as-judge para evaluar respuestas (0.0-1.0)."""
    resp = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=50,
        system="Evalúa del 0 al 10 si la respuesta es correcta y útil. Responde solo el número.",
        messages=[{"role": "user", "content": f"Pregunta: {question}\\nRespuesta: {answer}\\nReferencia: {reference}"}],
    )
    try:
        return float(resp.content[0].text.strip()) / 10
    except (ValueError, IndexError):
        return 0.5

def benchmark_models(
    eval_cases: list[dict],
    models: list[str],
    system: str = "",
) -> dict[str, ModelBenchmark]:
    results = {m: ModelBenchmark(model=m) for m in models}

    for case in eval_cases:
        for model in models:
            prices = PRICES_PER_1M.get(model, PRICES_PER_1M["claude-opus-5-5"])
            t0 = time.perf_counter()
            response = client.messages.create(
                model=model, max_tokens=512, system=system,
                messages=[{"role": "user", "content": case["input"]}],
            )
            latency = time.perf_counter() - t0
            answer = response.content[0].text
            usage = response.usage
            cost = (usage.input_tokens * prices["input"] + usage.output_tokens * prices["output"]) / 1_000_000
            score = judge_response(case["input"], answer, case.get("reference", ""))
            results[model].scores.append(score)
            results[model].latencies.append(latency)
            results[model].costs.append(cost)

    # Imprimir resultados
    for model, bench in results.items():
        avg_score = sum(bench.scores) / len(bench.scores)
        avg_latency = sum(bench.latencies) / len(bench.latencies)
        total_cost = sum(bench.costs)
        print(f"{model}:")
        print(f"  Score medio: {avg_score:.2f} | Latencia media: {avg_latency:.2f}s | Coste total: \${total_cost:.4f}")

    return results

# Tus casos de evaluación
eval_cases = [
    {"input": "Clasifica si este email es spam o no: 'Has ganado 1M de euros'", "reference": "spam"},
    {"input": "Extrae el nombre y email de: 'Me llamo Ana García, ana@example.com'", "reference": "Ana García, ana@example.com"},
]

benchmark_models(eval_cases, ["claude-haiku-4-5-20251001", "claude-sonnet-5-5"])
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Adapta eval_cases a tus casos reales de producción. Un benchmark con 50-100 casos representativos es suficiente para elegir entre modelos.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué el "coste por token" no es la métrica correcta para comparar modelos?',
      options: [
        'Porque lo que importa es el coste por "tarea completada con éxito". Un modelo más barato pero con menor tasa de éxito puede resultar más caro en total que uno más caro con mayor tasa de éxito.',

        'Porque no incluye el IVA.',

        'Porque el coste por token es siempre igual entre proveedores.',
        'Porque solo aplica a modelos de OpenAI.',
      ],
      answer: 0,
      explain:
        'Si Haiku cuesta 10x menos por token pero solo resuelve bien el 50% de los casos (vs 95% de Opus), el coste real por tarea exitosa puede ser similar o mayor para Haiku. Siempre calcula coste / tasa de éxito para comparaciones honestas.',
    },
    {
      q: '¿Qué es el patrón de "routing por complejidad" en selección de modelos?',
      options: [
        'Usar siempre el modelo más caro.',
        'Un clasificador enruta cada request al modelo más adecuado según su complejidad: modelo barato para tareas simples, modelo caro para tareas complejas. Puede reducir el coste total sin sacrificar calidad.',
        'Usar el mismo modelo para todo.',
        'Routing de red entre servidores.',
      ],
      answer: 1,
      explain:
        'El routing por complejidad aprovecha que la mayoría de requests son simples y no necesitan el modelo más potente. Un clasificador ligero (o heurística) enruta el tráfico: Haiku para clasificación y extracción simple, Opus para razonamiento complejo. Los ahorros pueden ser del 60-80% con pérdida de calidad mínima.',
    },
    {
      q: '¿Qué información DEBES obtener antes de elegir un modelo para producción?',
      options: [
        'Solo el precio por token.',
        'Solo el ranking en MMLU.',

        'Resultados de evals con tu distribución real de inputs, coste por tarea exitosa, latencia en tus condiciones de uso, y soporte del idioma/dominio que necesitas.',

        'Solo la fecha de lanzamiento del modelo.',
      ],
      answer: 2,
      explain:
        'Los benchmarks públicos son una señal general, no la respuesta para tu caso. Necesitas: datos de tu dominio específico, criterio de éxito claro, y mediciones en condiciones reales (token count real, latencia real, coste real con tus prompts).',
    },
    {
      q: '¿Cuándo tiene sentido usar la Batch API para la selección de modelos?',
      options: [
        'Para todos los requests de usuarios en tiempo real.',
        'Para ejecutar benchmarks masivos de evaluación, procesar documentos offline, o calcular embeddings para un corpus — tareas donde el resultado puede esperarse hasta 24 horas a cambio de ~50% de descuento.',
        'Solo para modelos pequeños.',
        'Cuando la latencia es crítica.',
      ],
      answer: 1,
      explain:
        'Ejecutar un benchmark con 1.000 casos en 3 modelos puede costar mucho con la API normal. Con la Batch API, el mismo benchmark cuesta ~50% menos y los resultados llegan en horas. Ideal para evaluaciones periódicas o procesos de selección de modelos.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo que lidera el leaderboard de Hugging Face es siempre el mejor para mi caso.',
      reality:
        'Los leaderboards miden rendimiento en benchmarks académicos estándar. Tu caso de uso tiene su propia distribución de inputs, sus propios criterios de calidad y sus propias restricciones de idioma y dominio. Un modelo del top 5 puede ser mejor que el número 1 para tu aplicación específica.',
    },
    {
      myth: 'Una vez elegido el modelo, no hace falta reevaluar.',
      reality:
        'Los proveedores actualizan los modelos (a veces con cambios de comportamiento no anunciados). Nuevos modelos más capaces y más baratos salen regularmente. Re-evaluar cada 3-6 meses con las mismas evals permite detectar degradaciones y aprovechar mejoras del ecosistema.',
    },
  ],
  sources: [
    {
      title: 'LMSYS Chatbot Arena · Human evaluation leaderboard',
      url: 'https://chat.lmsys.org/?leaderboard',
      kind: 'docs',
    },
    {
      title: 'Anthropic · Model overview',
      url: 'https://docs.anthropic.com/en/docs/about-claude/models/overview',
      kind: 'docs',
    },
  ],
}

export default details
