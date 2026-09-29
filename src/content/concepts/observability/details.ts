import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Instrumentación con Langfuse y el SDK de Anthropic',
      lang: 'python',
      code: `import anthropic
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

client = anthropic.Anthropic()
langfuse = Langfuse()  # Lee LANGFUSE_PUBLIC_KEY y LANGFUSE_SECRET_KEY del entorno

@observe(as_type="generation")
def call_llm(messages: list[dict], system: str = "") -> str:
    # Langfuse captura automáticamente el input y output
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system=system,
        messages=messages,
    )
    # Registrar tokens usados para calcular coste
    langfuse_context.update_current_observation(
        usage={
            "input": response.usage.input_tokens,
            "output": response.usage.output_tokens,
        },
        model="claude-opus-5-5",
    )
    return response.content[0].text

@observe()  # Crea una traza padre que agrupa las llamadas LLM
def rag_pipeline(question: str, chunks: list[str]) -> str:
    context = "\\n\\n".join(chunks)
    answer = call_llm(
        messages=[{"role": "user", "content": f"Contexto:\\n{context}\\n\\nPregunta: {question}"}],
        system="Responde solo basándote en el contexto proporcionado.",
    )
    # Asociar metadata útil para debugging
    langfuse_context.update_current_trace(
        metadata={"num_chunks": len(chunks), "question_length": len(question)},
        tags=["rag", "production"],
    )
    return answer

# Las trazas aparecen en https://cloud.langfuse.com agrupadas por @observe()
`,
      deps: { langfuse: '>=2.0', anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Langfuse auto-detecta el SDK de Anthropic si instalas el paquete `langfuse[anthropic]`. Las variables de entorno son LANGFUSE_PUBLIC_KEY y LANGFUSE_SECRET_KEY.',
    },
    {
      title: 'Métricas de latencia con OpenTelemetry',
      lang: 'python',
      code: `from opentelemetry import trace
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
import anthropic
import time

# Configurar OTel (una vez al iniciar la app)
provider = TracerProvider()
provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint="http://otel-collector:4317")))
trace.set_tracer_provider(provider)
tracer = trace.get_tracer("ai-atlas.llm")

client = anthropic.Anthropic()

def instrumented_call(prompt: str) -> str:
    with tracer.start_as_current_span("llm.chat") as span:
        # Atributos OTel GenAI (convención estándar)
        span.set_attribute("gen_ai.system", "anthropic")
        span.set_attribute("gen_ai.request.model", "claude-opus-5-5")
        span.set_attribute("gen_ai.operation.name", "chat")

        t0 = time.perf_counter()
        first_token_time = None

        with client.messages.stream(
            model="claude-opus-5-5",
            max_tokens=512,
            messages=[{"role": "user", "content": prompt}],
        ) as stream:
            result = ""
            for text in stream.text_stream:
                if first_token_time is None:
                    first_token_time = time.perf_counter()
                    ttft = first_token_time - t0
                    span.set_attribute("gen_ai.ttft_seconds", ttft)
                result += text

        usage = stream.get_final_message().usage
        span.set_attribute("gen_ai.usage.input_tokens", usage.input_tokens)
        span.set_attribute("gen_ai.usage.output_tokens", usage.output_tokens)

        return result
`,
      deps: { 'opentelemetry-sdk': '>=1.25', 'opentelemetry-exporter-otlp-proto-grpc': '>=1.25', anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'TTFT (Time To First Token) es la métrica de latencia más importante para la experiencia del usuario en streaming. El colector OTel puede enviar trazas a Jaeger, Grafana Tempo, Honeycomb o Datadog.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué no es suficiente usar logs estándar (print/logging) para observabilidad de sistemas LLM?',
      options: [
        'Los logs capturan texto plano pero no las relaciones entre pasos (traza), el uso de tokens, la latencia por componente, ni permiten queries sobre prompts y respuestas.',

        'Los logs son demasiado lentos.',

        'Los LLMs no pueden generar logs.',
        'Los logs no funcionan en producción.',
      ],
      answer: 0,
      explain:
        'Los logs tradicionales capturan eventos lineales. Los sistemas LLM necesitan trazas distribuidas (ver el árbol de llamadas), métricas de tokens, latencia granular por componente, y la capacidad de buscar y comparar prompts. Las plataformas de observabilidad LLM añaden todas estas capacidades.',
    },
    {
      q: '¿Qué es TTFT y por qué importa más que la latencia total para streaming?',
      options: [
        'Total Time For Translation — tiempo que tarda en traducir.',
        'Time To First Token — cuánto tiempo espera el usuario antes de ver la primera palabra. En streaming, el usuario percibe la respuesta como "rápida" si el TTFT es bajo, aunque la respuesta completa tarde más.',
        'Time To Finish Task — latencia total del agente.',
        'No importa más; la latencia total es la única métrica relevante.',
      ],
      answer: 1,
      explain:
        'En interfaces de streaming, el usuario empieza a leer con el primer token. Un TTFT bajo (< 1s) hace que la respuesta se perciba como inmediata incluso si la respuesta completa tarda 10 segundos. Los proveedores optimizan TTFT específicamente para mejorar la UX.',
    },
    {
      q: '¿Cuál es la ventaja de usar OpenTelemetry (OTel) en lugar de la SDK de Langfuse directamente?',
      options: [
        'OTel es más barato.',
        'Langfuse no es compatible con Anthropic.',

        'OTel es el estándar de industria: una traza unificada incluye el span LLM junto a los spans de la base de datos, el servicio HTTP y la cola de mensajes, en el mismo backend de trazas que ya usa el equipo.',

        'OTel tiene mejor UI.',
      ],
      answer: 2,
      explain:
        'OTel permite correlacionar la llamada LLM con el resto del sistema: ver que la latencia alta se debe a la consulta a la base de datos vectorial, no al modelo. El estándar GenAI Semantic Conventions de OTel define atributos estandarizados para spans LLM.',
    },
    {
      q: '¿Qué información CRÍTICA debe aparecer en las trazas de un sistema en producción?',
      options: [
        'Solo los errores.',
        'El prompt exacto enviado, tokens input/output, latencia TTFT y total, coste estimado, y (cuando aplique) la cadena de llamadas del agente con sus herramientas.',
        'Solo el coste.',
        'Solo la latencia total.',
      ],
      answer: 1,
      explain:
        'Para reproducir y depurar errores LLM se necesita el prompt exacto (el mismo mensaje puede generar respuestas muy distintas). El uso de tokens es necesario para calcular el coste real. La cadena de llamadas del agente es fundamental para entender por qué el agente tomó una decisión.',
    },
  ],
  misconceptions: [
    {
      myth: 'La observabilidad LLM es solo para detectar errores técnicos (timeouts, 500s).',
      reality:
        'Los errores técnicos son solo una parte. Los problemas más difíciles de detectar son los de calidad: el modelo responde pero mal, el agente llama herramientas incorrectas, o la calidad se degrada silenciosamente tras un cambio de modelo. Para eso se necesitan evals online, no solo monitoreo de errores.',
    },
    {
      myth: 'Guardar todos los prompts en producción es una práctica recomendada.',
      reality:
        'Los prompts pueden contener PII (datos personales) que deben ser tratados con cuidado legal (GDPR, CCPA). Configura redacción de PII antes de enviar trazas a plataformas externas, o usa logging local/self-hosted. El derecho al olvido también aplica.',
    },
  ],
  sources: [
    {
      title: 'OpenTelemetry · Semantic Conventions for GenAI',
      url: 'https://opentelemetry.io/docs/specs/semconv/gen-ai/',
      kind: 'docs',
    },
    {
      title: 'Langfuse · Documentación oficial',
      url: 'https://langfuse.com/docs',
      kind: 'docs',
    },
    {
      title: 'Arize Phoenix · LLM Observability',
      url: 'https://docs.arize.com/phoenix',
      kind: 'docs',
    },
  ],
}

export default details
