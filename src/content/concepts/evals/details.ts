import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Pipeline de eval con LLM-as-judge (Anthropic)',
      lang: 'python',
      code: `import anthropic
import json
from dataclasses import dataclass

client = anthropic.Anthropic()

@dataclass
class EvalCase:
    input: str
    expected: str  # ground truth (puede ser None para evals abiertas)

@dataclass
class EvalResult:
    input: str
    output: str
    score: float
    justification: str

JUDGE_PROMPT = """Eres un evaluador experto. Puntúa la respuesta del asistente del 0 al 1.

Criterios:
- 1.0: Correcta, completa y clara
- 0.7: Correcta pero incompleta o poco clara
- 0.3: Parcialmente correcta o con errores menores
- 0.0: Incorrecta o engañosa

Responde en JSON: {{"score": float, "justification": "una oración"}}"""

def judge(question: str, answer: str, reference: str | None = None) -> tuple[float, str]:
    content = f"Pregunta: {question}\\nRespuesta: {answer}"
    if reference:
        content += f"\\nRespuesta de referencia: {reference}"
    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=256,
        system=JUDGE_PROMPT,
        messages=[{"role": "user", "content": content}],
    )
    data = json.loads(resp.content[0].text)
    return data["score"], data["justification"]

def run_eval(system_under_test: callable, cases: list[EvalCase]) -> list[EvalResult]:
    results = []
    for case in cases:
        output = system_under_test(case.input)
        score, justification = judge(case.input, output, case.expected)
        results.append(EvalResult(case.input, output, score, justification))
    return results

# Ejemplo de uso
dataset = [
    EvalCase("¿Qué es el KV cache?", "Almacena las claves y valores de atención para evitar recalcularlos."),
    EvalCase("¿Cuándo usar RAG vs fine-tuning?", "RAG para conocimiento actualizable; fine-tuning para comportamiento."),
]

def my_system(question: str) -> str:
    # Tu sistema bajo evaluación
    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=200,
        messages=[{"role": "user", "content": question}],
    )
    return resp.content[0].text

results = run_eval(my_system, dataset)
avg_score = sum(r.score for r in results) / len(results)
print(f"Score promedio: {avg_score:.2f}")
for r in results:
    print(f"  [{r.score:.1f}] {r.justification}")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Para evals a escala, usa promptfoo, Ragas o Braintrust en lugar de reimplementar el runner.',
    },
    {
      title: 'Métricas de RAG con Ragas',
      lang: 'python',
      code: `from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision
from datasets import Dataset

# Dataset de evaluación de RAG
data = {
    "question": [
        "¿Cuál es la política de devoluciones?",
        "¿Cuánto tarda el envío?",
    ],
    "answer": [
        "Puedes devolver cualquier producto en 30 días con el embalaje original.",
        "El envío tarda entre 3 y 5 días hábiles.",
    ],
    "contexts": [
        [["Devoluciones: 30 días con embalaje original. Reembolso en 5-7 días."]],
        [["Envíos estándar: 3-5 días hábiles. Envío express: 1-2 días."]],
    ],
    "ground_truth": [
        "La política de devoluciones permite devolver productos en 30 días con embalaje original.",
        "El envío estándar tarda entre 3 y 5 días hábiles.",
    ],
}

dataset = Dataset.from_dict(data)
results = evaluate(dataset, metrics=[faithfulness, answer_relevancy, context_precision])
print(results)
# faithfulness: 0.95  (¿la respuesta está fundamentada en el contexto?)
# answer_relevancy: 0.88  (¿responde a la pregunta?)
# context_precision: 0.90  (¿el contexto recuperado es relevante?)
`,
      deps: { ragas: '>=0.1', datasets: '>=2.0' },
      verifiedAt: '2026-09',
      note: 'Ragas usa LLMs internamente para calcular las métricas. Necesita una API key de tu proveedor.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué no basta con "probar en el demo" para validar un sistema LLM?',
      options: [
        'Porque los LLMs son no deterministas y el rendimiento en el demo no predice el rendimiento sobre la distribución real de inputs.',

        'Porque el demo siempre falla.',

        'Por razones regulatorias.',
        'Porque los demos son lentos.',
      ],
      answer: 0,
      explain:
        'Los LLMs producen respuestas diferentes en cada ejecución y su comportamiento varía mucho según el input. "Funciona en el demo" con 3 ejemplos no garantiza que funcione en los miles de casos reales con variaciones inesperadas.',
    },
    {
      q: '¿Qué mide la métrica "faithfulness" en RAG?',
      options: [
        'Si el modelo responde rápido.',
        'Si la respuesta está fundamentada en los fragmentos recuperados y no inventa información.',
        'Si el usuario quedó satisfecho.',
        'Si el contexto recuperado es suficiente.',
      ],
      answer: 1,
      explain:
        'Faithfulness mide si cada afirmación de la respuesta tiene soporte en el contexto recuperado. Un score bajo indica que el modelo "alucina" información no presente en los documentos.',
    },
    {
      q: '¿Cuál es la forma más valiosa de construir un dataset de eval?',
      options: [
        'Generar 10.000 casos sintéticos con un LLM.',
        'Copiar benchmarks académicos.',

        'Usar inputs y fallos reales del sistema en producción, anotados.',

        'Generar casos aleatorios.',
      ],
      answer: 2,
      explain:
        'Los casos reales de producción reflejan la distribución real de tus usuarios. Los fallos ya conocidos son los más valiosos porque apuntan exactamente donde el sistema falla. Un dataset pequeño y representativo supera a uno grande y genérico.',
    },
    {
      q: '¿Cuál es la diferencia entre evals offline y evals online?',
      options: [
        'Las offline usan LLMs; las online no.',
        'Las offline se ejecutan sobre un dataset fijo antes del despliegue; las online muestrean el tráfico real en producción.',
        'Las online son más baratas.',
        'Las offline solo miden velocidad.',
      ],
      answer: 1,
      explain:
        'Offline: dataset fijo, antes de desplegar, para CI/CD. Online: tráfico real en producción, con muestreo, para detectar degradación silenciosa cuando la distribución de inputs cambia.',
    },
  ],
  misconceptions: [
    {
      myth: 'Una puntuación alta en benchmarks académicos (MMLU, HumanEval) garantiza buen rendimiento en mi caso.',
      reality:
        'Los benchmarks académicos miden el modelo en condiciones generales. Tu caso de uso, tu distribución de inputs, tu dominio y tus criterios de calidad son distintos. Siempre construye evals propias.',
    },
    {
      myth: 'Las evals son caras y lentas: solo para proyectos grandes.',
      reality:
        'Un dataset de 50 casos y un LLM-as-judge básico se implementa en pocas horas y cuesta pocos dólares por ejecución. El coste de no tener evals (regresar a una versión peor sin saberlo) es mayor.',
    },
    {
      myth: 'Un LLM-as-judge es objetivo.',
      reality:
        'Los jueces LLM tienen sesgos: prefieren respuestas más largas, más formales, o del mismo proveedor que ellos. Usa rúbricas explícitas, jueces distintos al sistema evaluado, y compara con anotaciones humanas periódicamente.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Building effective agents',
      url: 'https://www.anthropic.com/research/building-effective-agents',
      kind: 'blog',
    },
    {
      title: 'Ragas · RAG evaluation framework',
      url: 'https://docs.ragas.io/',
      kind: 'docs',
    },
    {
      title: 'promptfoo · LLM testing and red-teaming',
      url: 'https://promptfoo.dev/',
      kind: 'docs',
    },
    {
      title: 'Zheng et al. (2023) · Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena',
      url: 'https://arxiv.org/abs/2306.05685',
      kind: 'paper',
    },
  ],
}

export default details
