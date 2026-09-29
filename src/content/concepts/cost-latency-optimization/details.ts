import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Prompt caching con Anthropic (reducción de coste)',
      lang: 'python',
      code: `import anthropic
import time

client = anthropic.Anthropic()

# Sistema con un system prompt largo que se reutiliza en muchas llamadas
LONG_SYSTEM_PROMPT = """Eres un asistente jurídico especializado en derecho mercantil español.
Conocimiento de referencia:
[...10.000 tokens de normativa, casos y precedentes...]
"""  # En producción, este sería el contenido real

def ask_with_cache(question: str, use_cache: bool = True) -> dict:
    system_content = [{"type": "text", "text": LONG_SYSTEM_PROMPT}]
    if use_cache:
        # Marca este bloque para que Anthropic lo cachee
        system_content[0]["cache_control"] = {"type": "ephemeral"}

    t0 = time.perf_counter()
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=512,
        system=system_content,
        messages=[{"role": "user", "content": question}],
    )
    latency = time.perf_counter() - t0

    usage = response.usage
    print(f"Latencia: {latency:.2f}s")
    print(f"Tokens input: {usage.input_tokens} | Output: {usage.output_tokens}")
    if hasattr(usage, 'cache_read_input_tokens'):
        print(f"Tokens desde caché: {usage.cache_read_input_tokens} (ahorro ~90%)")
    return {"answer": response.content[0].text, "latency": latency}

# Primera llamada: llena la caché (~mismo coste que sin caché)
result = ask_with_cache("¿Qué es un pacto de socios?")

# Siguientes llamadas: los tokens del system prompt cuestan ~10% del precio normal
result = ask_with_cache("¿Qué es una cláusula drag-along?")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El prompt caching de Anthropic tiene TTL de 5 minutos. Si las llamadas se espacian más, la caché expira. Los precios de cache hit son ~10% del precio de input normal. cache_creation_input_tokens tienen un pequeño premium.',
    },
    {
      title: 'Tracking de coste por feature con context variables',
      lang: 'python',
      code: `import anthropic
from contextvars import ContextVar
from dataclasses import dataclass, field
from collections import defaultdict

client = anthropic.Anthropic()

# Contexto de coste para rastrear por feature/usuario
current_feature: ContextVar[str] = ContextVar("current_feature", default="unknown")

# Precios Claude Opus (sep 2026) — verificar siempre los precios actuales
PRICES = {
    "claude-opus-5-5": {"input": 15.0 / 1_000_000, "output": 75.0 / 1_000_000},
    "claude-sonnet-5-5": {"input": 3.0 / 1_000_000, "output": 15.0 / 1_000_000},
    "claude-haiku-4-5-20251001": {"input": 0.25 / 1_000_000, "output": 1.25 / 1_000_000},
}

cost_tracker: dict[str, float] = defaultdict(float)

def tracked_call(model: str, messages: list, system: str = "", max_tokens: int = 1024) -> str:
    response = client.messages.create(
        model=model, max_tokens=max_tokens, system=system, messages=messages
    )
    usage = response.usage
    prices = PRICES.get(model, PRICES["claude-opus-5-5"])
    cost = usage.input_tokens * prices["input"] + usage.output_tokens * prices["output"]

    feature = current_feature.get()
    cost_tracker[feature] += cost

    return response.content[0].text

# Uso
current_feature.set("contract-analysis")
result = tracked_call("claude-opus-5-5", [{"role": "user", "content": "Analiza este contrato..."}])

current_feature.set("summary")
result = tracked_call("claude-sonnet-5-5", [{"role": "user", "content": "Resume este documento..."}])

# Ver coste por feature
for feature, cost in sorted(cost_tracker.items(), key=lambda x: -x[1]):
    print(f"{feature}: \${cost:.4f}")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Rastrear coste por feature es el primer paso para optimizar: permite identificar qué funcionalidades consumen más dinero y priorizar las optimizaciones con mayor impacto.',
    },
  ],
  quiz: [
    {
      q: '¿Qué es TTFT y por qué es la métrica de latencia más importante para usuarios?',
      options: [
        'Time To First Token — el tiempo que el usuario espera antes de ver la primera palabra. En streaming, define la percepción de rapidez: un TTFT bajo de 500ms se percibe como respuesta instantánea aunque la respuesta completa tarde más.',

        'Time To Finish Task — el tiempo total del agente.',

        'Total Tokens For Task — el conteo de tokens.',
        'No es la métrica más importante; la latencia total lo es.',
      ],
      answer: 0,
      explain:
        'En interfaces de streaming, el usuario empieza a leer con el primer token. Con TTFT de 500ms y velocidad de 50 tokens/segundo, el usuario percibe la respuesta como inmediata aunque dure 10 segundos en total. Los proveedores optimizan TTFT específicamente para mejorar esta percepción.',
    },
    {
      q: '¿Cómo funciona el prompt caching y qué ahorro produce?',
      options: [
        'Guarda las respuestas para no llamar al LLM de nuevo.',
        'Almacena partes del prompt (system prompt, documentos) en caché en los servidores del proveedor, de modo que en llamadas posteriores esos tokens se procesen a ~10% del coste normal. Es diferente a cachear respuestas: el modelo sigue generando una respuesta nueva.',
        'Comprime el prompt para usar menos tokens.',
        'No existe el prompt caching.',
      ],
      answer: 1,
      explain:
        'El prompt caching almacena el KV cache de los tokens del sistema o documentos en los servidores del proveedor. Las llamadas posteriores con el mismo prefijo leen el KV cache (cache hit) en lugar de recalcularlo. Anthropic cobra los cache hits a ~10% del precio normal. Ideal para system prompts largos o documentos que se envían en cada llamada.',
    },
    {
      q: '¿Cuál es el lever de optimización con mejor ratio impacto/esfuerzo?',
      options: [
        'Cambiar al modelo más pequeño disponible.',
        'Reducir el max_tokens.',

        'Prompt caching para system prompts o documentos que se reutilizan en muchas llamadas — reduce el coste de esos tokens en ~90% con solo añadir cache_control al bloque.',

        'Cambiar de proveedor.',
      ],
      answer: 2,
      explain:
        'El prompt caching requiere solo añadir `cache_control: {"type": "ephemeral"}` al bloque a cachear — pocos minutos de implementación. El ahorro para un system prompt de 5.000 tokens reutilizado en 1.000 llamadas: de 5M de tokens procesados a solo 5.000 en caché + 5.000 creación. ~90% de ahorro con esfuerzo mínimo.',
    },
    {
      q: '¿Cuándo es apropiado usar la Batch API?',
      options: [
        'Para todas las llamadas, siempre es más barato.',
        'Para procesamiento de grandes volúmenes de requests que no necesitan respuesta inmediata — análisis de documentos, generación de embeddings, evaluaciones masivas. Descuento ~50% con latencia de hasta 24h.',
        'Solo para fine-tuning.',
        'Solo para modelos pequeños.',
      ],
      answer: 1,
      explain:
        'La Batch API es ideal para tareas de procesamiento offline: analizar 10.000 documentos, calcular embeddings para un corpus, ejecutar evals masivas. El ~50% de descuento justifica la espera de hasta 24 horas en estas tareas. No usar para casos que necesitan respuesta en tiempo real.',
    },
  ],
  misconceptions: [
    {
      myth: 'Reducir max_tokens reduce el coste de la llamada.',
      reality:
        'max_tokens solo limita la longitud máxima del output; el coste depende de los tokens realmente generados. Si el modelo naturalmente genera respuestas cortas, reducir max_tokens no cambia el coste. Para reducir el coste del output, pide respuestas más concisas en el prompt.',
    },
    {
      myth: 'Bajar a un modelo más pequeño siempre reduce el coste total del sistema.',
      reality:
        'Un modelo más pequeño puede necesitar más iteraciones del agente, o producir resultados que requieren reprocesamiento. Si 3 llamadas a Haiku son necesarias donde 1 llamada a Opus habría bastado, el ahorro puede ser nulo o negativo. Mide el coste por "tarea completada", no por llamada individual.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Prompt caching',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching',
      kind: 'docs',
    },
    {
      title: 'Anthropic · Message Batches API',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/message-batches',
      kind: 'docs',
    },
    {
      title: 'Ainslie et al. (2023) · GQA: Training Generalized Multi-Query Transformer Models from Multi-Head Checkpoints',
      url: 'https://arxiv.org/abs/2305.13245',
      kind: 'paper',
    },
  ],
}

export default details
