import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Routing automático por coste y capacidad',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()

def route_by_complexity(prompt: str, context_length: int = 0) -> str:
    """Elige el modelo según la complejidad estimada de la tarea."""
    total_tokens = len(prompt.split()) * 1.3 + context_length  # estimación rápida

    # Tareas simples: modelo rápido y barato
    if total_tokens < 2_000 and "paso a paso" not in prompt.lower():
        model = "claude-haiku-4-5-20251001"
    # Tareas medianas: Sonnet
    elif total_tokens < 50_000:
        model = "claude-sonnet-5-5"
    # Tareas complejas o contexto largo: Opus
    else:
        model = "claude-opus-5-5"

    response = client.messages.create(
        model=model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return response.content[0].text

# Para razonamiento complejo, siempre el mejor modelo con thinking
def reason(prompt: str) -> str:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=8192,
        thinking={"type": "adaptive"},  # thinking adaptativo según dificultad
        messages=[{"role": "user", "content": prompt}],
    )
    # Extraer solo el texto final (no el thinking)
    for block in response.content:
        if block.type == "text":
            return block.text
    return ""
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'El routing por complejidad puede reducir el coste hasta un 80% en sistemas con mezcla de tareas simples y complejas. Calibra los umbrales con evals reales de tu carga de trabajo.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la diferencia entre un modelo "cerrado" y uno "open-weights"?',
      options: [
        'Los modelos cerrados solo son accesibles como API (los pesos no están disponibles); los open-weights permiten descargar y ejecutar los pesos, modificarlos y hacer fine-tuning.',

        'Los modelos cerrados son mejores.',

        'Los modelos open-weights son siempre gratuitos.',
        'Los modelos cerrados no se pueden usar comercialmente.',
      ],
      answer: 0,
      explain:
        'La distinción clave es el acceso a los pesos. Con open-weights puedes: correr el modelo localmente, hacer fine-tuning, inspeccionarlo, y desplegarlo sin depender de una API externa. Los modelos cerrados ofrecen inferencia como servicio pero el proveedor controla todo lo demás.',
    },
    {
      q: '¿Qué es Mixture of Experts (MoE) y cuál es su ventaja en inferencia?',
      options: [
        'Es una técnica de ensemble que combina múltiples modelos en producción.',
        'Una arquitectura donde el modelo tiene muchos "expertos" especializados pero solo activa una fracción de ellos por token, dando calidad de modelo grande al coste de uno más pequeño durante la inferencia.',
        'Es el mismo concepto que multi-agent.',
        'MoE siempre es más lento que un modelo denso equivalente.',
      ],
      answer: 1,
      explain:
        'En MoE (ej: Mixtral 8x7B tiene 56B parámetros totales pero activa ~14B por token), el gating network elige qué expertos usar para cada token. La calidad sube respecto a un modelo denso del mismo VRAM porque los expertos se especializan, pero el modelo carga todos los pesos en memoria.',
    },
    {
      q: '¿Por qué los benchmarks académicos (MMLU, HumanEval) no son suficientes para elegir un modelo para producción?',
      options: [
        'Porque son demasiado fáciles.',
        'Porque los benchmarks son costosos.',

        'Porque miden capacidades generales del modelo base, no su rendimiento en tu caso de uso específico, tu distribución de prompts, ni con tu sistema de prompts. Siempre construye evals propias.',

        'Porque solo miden velocidad.',
      ],
      answer: 2,
      explain:
        'Un modelo que lidera MMLU puede ser peor que otro en tu dominio específico (legal, médico, código). Los benchmarks son útiles como señal general, pero la decisión final debe basarse en evals propias con datos reales de tu caso de uso.',
    },
    {
      q: '¿Cuál es el principio de Pareto aplicado a la selección de modelos?',
      options: [
        'Siempre usar el modelo más grande disponible.',
        'Empezar con el modelo más barato que puedas probar, medir con evals, y subir de tamaño solo si los resultados no son suficientes.',
        'Usar solo modelos open-weights.',
        'Usar siempre el modelo más nuevo.',
      ],
      answer: 1,
      explain:
        'El modelo 7B más reciente supera al estado del arte de 2-3 años atrás. Empezar con el modelo más pequeño y barato permite iterar rápido y establecer un baseline. Subir a modelos más grandes solo cuando las evals demuestran que es necesario.',
    },
  ],
  misconceptions: [
    {
      myth: 'El modelo más grande siempre es el mejor para cualquier tarea.',
      reality:
        'Los modelos más grandes son mejores en tareas que requieren razonamiento complejo, pero para tareas de clasificación, extracción o formateado simple, un modelo pequeño puede ser igual de bueno a una fracción del coste y la latencia. La elección correcta depende de la tarea.',
    },
    {
      myth: 'Open-weights significa open-source.',
      reality:
        'Open-weights significa que los pesos del modelo están disponibles para descarga. Pero la licencia puede imponer restricciones en uso comercial, redistribución modificada o uso en servicios con muchos usuarios (Llama 3 tiene una licencia con restricciones para servicios con >700M de usuarios activos mensuales).',
    },
  ],
  sources: [
    {
      title: 'LMSYS Chatbot Arena · Human preference leaderboard',
      url: 'https://chat.lmsys.org/?leaderboard',
      kind: 'docs',
    },
    {
      title: 'Hugging Face · Open LLM Leaderboard',
      url: 'https://huggingface.co/spaces/open-llm-leaderboard/open_llm_leaderboard',
      kind: 'docs',
    },
    {
      title: 'Jiang et al. (2024) · Mixtral of Experts',
      url: 'https://arxiv.org/abs/2401.04088',
      kind: 'paper',
    },
  ],
}

export default details
