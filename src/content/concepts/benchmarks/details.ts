import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Eval rápida con tus propios casos de prueba',
      lang: 'python',
      code: `import anthropic
import json

client = anthropic.Anthropic()

def run_mini_eval(test_cases: list[dict], model: str) -> dict:
    """
    Eval mínima: compara respuestas del modelo contra respuestas de referencia.
    Métrica: exact-match (útil para clasificación, extracción, sí/no).
    """
    correct = 0
    results = []

    for case in test_cases:
        response = client.messages.create(
            model=model,
            max_tokens=256,
            messages=[{"role": "user", "content": case["input"]}],
        )
        answer = response.content[0].text.strip()
        is_correct = case["expected"].lower() in answer.lower()
        correct += int(is_correct)
        results.append({"input": case["input"], "expected": case["expected"], "got": answer, "ok": is_correct})

    accuracy = correct / len(test_cases)
    print(f"Modelo: {model} | Accuracy: {accuracy:.1%} ({correct}/{len(test_cases)})")
    for r in results:
        status = "✓" if r["ok"] else "✗"
        print(f"  {status} {r['input'][:50]!r} → {r['got'][:40]!r}")
    return {"model": model, "accuracy": accuracy, "results": results}

# Tus casos de prueba propios — mucho más fiables que benchmarks genéricos
test_cases = [
    {"input": "Clasifica el sentimiento: 'El producto llegó roto y el servicio fue horrible'", "expected": "negativo"},
    {"input": "Clasifica el sentimiento: 'Me encantó, llegó antes de lo esperado'", "expected": "positivo"},
    {"input": "¿Es spam? 'Has ganado 1.000.000€ haz clic aquí'", "expected": "sí"},
    {"input": "¿Es spam? 'Recordatorio: tu cita es mañana a las 10:00'", "expected": "no"},
]

run_mini_eval(test_cases, "claude-haiku-4-5-20251001")
run_mini_eval(test_cases, "claude-sonnet-5-5")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Esta eval mínima es tu benchmark más relevante: usa TUS casos de uso reales, no los genéricos. 20-50 casos bien elegidos valen más que 10.000 ejemplos de MMLU.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué MMLU es menos útil para comparar modelos de 2025-2026?',
      options: [
        'Porque los mejores modelos han saturado el benchmark (>90%), por lo que deja de discriminar entre los modelos frontera. Un modelo con 91% y otro con 93% pueden ser muy distintos en la práctica, pero MMLU no lo captura.',

        'Porque es demasiado difícil.',

        'Porque solo mide código.',
        'Porque es muy caro de ejecutar.',
      ],
      answer: 0,
      explain:
        'La saturación ocurre cuando la mayoría de modelos frontier alcanzan >90% de precisión. En ese rango, la diferencia entre 91% y 93% puede ser ruido estadístico o variabilidad de evaluación, no diferencia real de capacidad. Los benchmarks saturados dejan de ser útiles para comparar los mejores modelos.',
    },
    {
      q: '¿Qué es la "contaminación de datos" en el contexto de benchmarks?',
      options: [
        'Cuando el dataset tiene errores.',
        'Cuando el conjunto de evaluación del benchmark estaba presente en los datos de entrenamiento del modelo, lo que hace que el modelo pueda "memorizar" respuestas en lugar de razonar genuinamente.',
        'Cuando el benchmark usa datos sintéticos.',
        'Cuando el benchmark mide múltiples capacidades.',
      ],
      answer: 1,
      explain:
        'La contaminación ocurre cuando preguntas o respuestas del benchmark aparecen en el corpus de entrenamiento. El modelo puede entonces recuperar la respuesta en lugar de razonarla. Es difícil de detectar sin acceso a los datos de entrenamiento, lo que hace que algunos resultados de benchmark sean dudosos.',
    },
    {
      q: '¿Por qué Chatbot Arena (LMSYS) es considerada una evaluación más fiable que los benchmarks académicos?',
      options: [
        'Porque usa más preguntas.',
        'Porque es más barata de ejecutar.',

        'Porque usa preferencias humanas reales en condiciones ciegas (los usuarios no saben qué modelo comparan), lo que correlaciona mejor con la satisfacción real de usuarios que los benchmarks académicos diseñados para medir capacidades concretas.',

        'Porque mide velocidad de respuesta.',
      ],
      answer: 2,
      explain:
        'Los benchmarks académicos miden capacidades específicas con métricas automáticas. Chatbot Arena mide "¿cuál respuesta preferiría un humano?", que es el criterio final para la mayoría de aplicaciones reales. Al ser ciego (los usuarios no ven de qué modelos vienen las respuestas), reduce el sesgo de marca.',
    },
    {
      q: '¿Qué hace SWE-bench diferente de HumanEval para evaluar capacidades de código?',
      options: [
        'SWE-bench es más antiguo.',
        'SWE-bench usa issues reales de GitHub que requieren navegar un codebase existente, entender contexto, modificar código sin romper tests existentes — mucho más cercano al trabajo real de ingeniería que completar funciones aisladas en HumanEval.',
        'HumanEval es más difícil.',
        'No hay diferencia práctica.',
      ],
      answer: 1,
      explain:
        'HumanEval mide si el modelo puede completar una función dada una docstring — una tarea aislada. SWE-bench mide si el modelo puede resolver un bug real en un proyecto real con todo su contexto: leer el issue, navegar el código, hacer el cambio correcto, pasar los tests. Es lo que hacen los ingenieros de verdad.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un modelo que lidera el leaderboard de Hugging Face es el mejor para cualquier tarea.',
      reality:
        'Los leaderboards combinan múltiples benchmarks con pesos que pueden no reflejar tu caso de uso. Un modelo puede liderar en matemáticas pero ser mediocre en español. Los rankings son señales de dirección, no verdades absolutas para tu aplicación específica.',
    },
    {
      myth: 'Los benchmarks de código como HumanEval predicen bien el rendimiento en tareas de ingeniería reales.',
      reality:
        'HumanEval y MBPP miden completar funciones Python aisladas, que es solo una fracción del trabajo de ingeniería real. SWE-bench, que mide resolución de issues en proyectos reales, tiene tasas de éxito mucho más bajas y predice mejor la utilidad práctica de un agente de código.',
    },
  ],
  sources: [
    {
      title: 'LMSYS · Chatbot Arena leaderboard',
      url: 'https://chat.lmsys.org/?leaderboard',
      kind: 'docs',
    },
    {
      title: 'Jimenez et al. (2023) · SWE-bench: Can Language Models Resolve Real-World GitHub Issues?',
      url: 'https://arxiv.org/abs/2310.06770',
      kind: 'paper',
    },
    {
      title: 'Hendrycks et al. (2020) · Measuring Massive Multitask Language Understanding',
      url: 'https://arxiv.org/abs/2009.03300',
      kind: 'paper',
    },
  ],
}

export default details
