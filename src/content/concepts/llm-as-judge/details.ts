import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'LLM-as-judge con rúbrica y JSON estructurado',
      lang: 'python',
      code: `import anthropic
import json
from dataclasses import dataclass

client = anthropic.Anthropic()

JUDGE_SYSTEM = """Eres un evaluador experto de respuestas de IA.
Evalúa la respuesta según esta rúbrica:

5/5 - Directa, factualmente correcta, sin relleno, con ejemplos relevantes.
4/5 - Correcta y concisa, pero omite un detalle menor.
3/5 - Correcta en lo esencial pero vaga o con imprecisiones menores.
2/5 - Parcialmente correcta, con al menos un error factual.
1/5 - Incorrecta, engañosa, o sin relación con la pregunta.

Sesgos a evitar:
- No puntúes más alto por respuestas más largas (verbosity bias).
- No puntúes más alto porque el tono sea formal.
- Evalúa el contenido, no la forma.

Responde SOLO con JSON: {"score": 1-5, "verdict": "pass" | "fail", "reasoning": "una oración concisa"}
"""

@dataclass
class JudgeResult:
    score: int
    verdict: str
    reasoning: str

def judge(question: str, answer: str, reference: str | None = None) -> JudgeResult:
    content = f"Pregunta evaluada: {question}\\n\\nRespuesta a evaluar: {answer}"
    if reference:
        content += f"\\n\\nRespuesta de referencia (solo como guía, no es la única correcta):\\n{reference}"

    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=256,
        system=JUDGE_SYSTEM,
        messages=[{"role": "user", "content": content}],
    )

    data = json.loads(response.content[0].text)
    return JudgeResult(**data)

# Ejemplo
result = judge(
    question="¿Qué es el KV cache en un LLM?",
    answer="El KV cache guarda resultados para no recalcularlos.",
    reference="Almacena las matrices de claves y valores de las capas de atención de tokens ya procesados, evitando recalcularlos en cada nuevo token generado.",
)
print(f"Score: {result.score}/5 | Veredicto: {result.verdict}")
print(f"Razonamiento: {result.reasoning}")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Usa un modelo diferente al sistema evaluado para evitar self-enhancement bias. Claude es bueno como juez de sistemas basados en GPT, y viceversa.',
    },
    {
      title: 'Comparación por pares (pairwise) con orden aleatorio',
      lang: 'python',
      code: `import anthropic
import json
import random
from typing import Literal

client = anthropic.Anthropic()

PAIRWISE_SYSTEM = """Eres un evaluador experto. Compara dos respuestas a la misma pregunta y determina cuál es mejor.

Criterios:
1. Corrección factual (lo más importante)
2. Completitud (cubre todos los aspectos relevantes)
3. Concisión (sin relleno innecesario)

Responde SOLO con JSON: {"winner": "A" | "B" | "tie", "reasoning": "una oración"}
"""

def pairwise_judge(question: str, response_a: str, response_b: str) -> dict:
    # Aleatorizar el orden para evitar recency bias
    if random.random() < 0.5:
        a, b = response_a, response_b
        swapped = False
    else:
        a, b = response_b, response_a
        swapped = True

    content = f"""Pregunta: {question}

Respuesta A:
{a}

Respuesta B:
{b}

¿Cuál es mejor?"""

    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=128,
        system=PAIRWISE_SYSTEM,
        messages=[{"role": "user", "content": content}],
    )
    result = json.loads(response.content[0].text)

    # Corregir si el orden fue intercambiado
    if swapped and result["winner"] in ("A", "B"):
        result["winner"] = "B" if result["winner"] == "A" else "A"

    return result

result = pairwise_judge(
    question="Explica el attention mechanism en transformers.",
    response_a="El attention calcula qué tokens son relevantes para cada posición.",
    response_b="El self-attention computa queries, keys y values para calcular una suma ponderada de valores, donde los pesos son la similitud entre cada query y todos los keys.",
)
print(f"Ganadora: Respuesta {result['winner']}")
print(f"Razón: {result['reasoning']}")
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Aleatorizar el orden entre llamadas y promediar múltiples comparaciones elimina el recency bias. Para comparaciones a escala, considera plataformas como Braintrust que automatizan esto.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué usar el mismo modelo como juez y como sistema evaluado es problemático?',
      options: [
        'Por self-enhancement bias: el modelo tiende a preferir sus propias respuestas, lo que sesga artificialmente las puntuaciones a favor del sistema evaluado.',

        'Porque sería muy lento.',

        'Porque no sería reproducible.',
        'No hay ningún problema.',
      ],
      answer: 0,
      explain:
        'Los modelos LLM tienden a preferir respuestas que coinciden con su propio estilo y conocimiento. GPT prefiere respuestas de GPT; Claude prefiere las suyas. Usar un juez distinto al sistema evaluado es fundamental para obtener evaluaciones imparciales.',
    },
    {
      q: '¿Qué es la calibración de un juez LLM y por qué es necesaria?',
      options: [
        'Ajustar el modelo del juez con fine-tuning.',
        'Validar que las puntuaciones del juez correlacionan con las anotaciones humanas en un golden dataset (~100 ejemplos). Sin calibración, no se sabe si el juez es fiable.',
        'Configurar el timeout de las llamadas API.',
        'Reducir el coste de las llamadas.',
      ],
      answer: 1,
      explain:
        'Un juez que no está calibrado puede tener sesgos sistemáticos (siempre da 4/5, ignora ciertos tipos de errores). Validar contra anotaciones humanas en un dataset representativo es el único modo de saber si el juez funciona para tu caso de uso.',
    },
    {
      q: '¿Cuál de estos es un ejemplo de "verbosity bias" en un juez LLM?',
      options: [
        'El juez prefiere respuestas en inglés.',
        'El juez tarda más en evaluar textos largos.',

        'El juez da una puntuación de 5/5 a una respuesta de 500 palabras que repite la información y otra de 3/5 a una de 50 palabras que responde directamente, siendo ambas igualmente correctas.',

        'El juez rechaza respuestas con código.',
      ],
      answer: 2,
      explain:
        'Verbosity bias es cuando el juez correlaciona longitud con calidad. Las respuestas más largas parecen más "completas" o "elaboradas" aunque contengan relleno. La mitigación es incluir explícitamente en la rúbrica "penalizar el relleno" o usar comparación por pares.',
    },
    {
      q: '¿Para qué se usa un "golden dataset" en el contexto de LLM-as-judge?',
      options: [
        'Es el dataset de entrenamiento del modelo.',
        'Es un conjunto de ~100 ejemplos con anotaciones humanas verificadas, usado para calibrar el juez (verificar que su correlación con el juicio humano es suficientemente alta).',
        'Es un dataset libre de sesgos.',
        'Es el dataset más grande disponible.',
      ],
      answer: 1,
      explain:
        'Un golden dataset es la "verdad" contra la que se valida el juez. Si la correlación (Spearman o Pearson) entre el juez y las anotaciones humanas en el golden set es alta (>0.8), el juez es fiable para ese dominio. Si no, hay que mejorar la rúbrica o cambiar de juez.',
    },
  ],
  misconceptions: [
    {
      myth: 'Un LLM-as-judge es objetivo porque no tiene opiniones personales.',
      reality:
        'Los LLMs tienen sesgos de entrenamiento que se manifiestan en el juicio: prefieren respuestas del mismo estilo, más largas, más formales, o del mismo proveedor. "Sin opiniones personales" no significa "imparcial". Siempre calibra y documenta los sesgos conocidos.',
    },
    {
      myth: 'Con un juez LLM potente (GPT-4o, Claude Opus), no hace falta un golden dataset.',
      reality:
        'Los modelos más potentes son mejores jueces en general, pero el rendimiento específico para tu dominio y tus criterios de calidad solo se puede verificar contra anotaciones humanas de ese dominio. Un juez potente pero sin calibrar puede dar falsa confianza.',
    },
    {
      myth: 'La comparación por pares siempre es mejor que la puntuación absoluta.',
      reality:
        'La comparación por pares es más fiable para elegir entre opciones, pero no da una puntuación absoluta que permita decir "este sistema es suficientemente bueno para producción". Ambos métodos son complementarios: comparación para A/B testing, puntuación absoluta para CI/CD gates.',
    },
  ],
  sources: [
    {
      title: 'Zheng et al. (2023) · Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena',
      url: 'https://arxiv.org/abs/2306.05685',
      kind: 'paper',
    },
    {
      title: 'Anthropic · Evals overview',
      url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/eval-overview',
      kind: 'docs',
    },
    {
      title: 'Braintrust · LLM eval platform',
      url: 'https://www.braintrust.dev/',
      kind: 'docs',
    },
  ],
}

export default details
