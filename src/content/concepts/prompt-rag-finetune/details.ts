import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Árbol de decisión en código',
      lang: 'python',
      code: `from enum import Enum
from dataclasses import dataclass

class Approach(Enum):
    PROMPT = "prompt"
    RAG = "rag"
    FINE_TUNING = "fine_tuning"
    RAG_PLUS_FINE_TUNING = "rag_plus_fine_tuning"
    BIGGER_MODEL = "bigger_model"

@dataclass
class ApproachRecommendation:
    approach: Approach
    reason: str
    estimated_effort: str  # "horas" | "días" | "semanas"

def decide_approach(
    base_model_works: bool,          # ¿el modelo base hace bien la tarea con buen prompt?
    needs_fresh_knowledge: bool,     # ¿necesita información que cambia frecuentemente?
    behavior_problem: bool,          # ¿el problema es el comportamiento, no el conocimiento?
    knowledge_problem: bool,         # ¿el problema es falta de información específica?
    cognitive_problem: bool,         # ¿el problema es capacidad cognitiva insuficiente?
) -> ApproachRecommendation:

    if base_model_works and not needs_fresh_knowledge:
        return ApproachRecommendation(
            approach=Approach.PROMPT,
            reason="El modelo base es suficiente. Itera el prompt antes de añadir complejidad.",
            estimated_effort="horas",
        )
    if needs_fresh_knowledge and not behavior_problem:
        return ApproachRecommendation(
            approach=Approach.RAG,
            reason="RAG para conocimiento externo actualizable.",
            estimated_effort="días",
        )
    if behavior_problem and not knowledge_problem:
        return ApproachRecommendation(
            approach=Approach.FINE_TUNING,
            reason="Fine-tuning para adaptar comportamiento, tono o formato.",
            estimated_effort="semanas",
        )
    if behavior_problem and knowledge_problem:
        return ApproachRecommendation(
            approach=Approach.RAG_PLUS_FINE_TUNING,
            reason="Combinación: fine-tuning para comportamiento + RAG para conocimiento.",
            estimated_effort="semanas",
        )
    if cognitive_problem:
        return ApproachRecommendation(
            approach=Approach.BIGGER_MODEL,
            reason="El modelo base no tiene la capacidad cognitiva necesaria. Prueba un modelo más grande.",
            estimated_effort="horas (cambio de modelo)",
        )
    return ApproachRecommendation(
        approach=Approach.PROMPT,
        reason="Empieza siempre por el prompt. Itera antes de añadir complejidad.",
        estimated_effort="horas",
    )
`,
      deps: {},
      verifiedAt: '2026-09',
      note: 'Este árbol es una simplificación. En la práctica, la decisión requiere probar empíricamente con evals. Pero sirve como guía para evitar los errores más comunes (hacer fine-tuning cuando el problema era el prompt).',
    },
  ],
  quiz: [
    {
      q: '¿Por qué siempre se debe empezar por el prompt antes de considerar RAG o fine-tuning?',
      options: [
        'Porque el prompt es el enfoque más rápido de iterar (horas vs días/semanas), el más barato, y el más fácil de mantener. Un buen prompt resuelve ~80% de los casos que parecen requerir algo más complejo.',

        'Porque el prompt es siempre suficiente.',

        'Porque RAG es muy difícil de implementar.',
        'Por requisitos regulatorios.',
      ],
      answer: 0,
      explain:
        'El coste de iteración del prompt es horas; el de RAG es días; el de fine-tuning es semanas. Si el problema se puede resolver con el prompt, ir a RAG o fine-tuning directamente es desperdiciar tiempo y dinero. Además, el prompt es el más fácil de actualizar cuando cambian los requisitos.',
    },
    {
      q: '¿Cuál es el caso de uso donde RAG claramente supera al fine-tuning?',
      options: [
        'Cuando se necesita un tono formal específico.',
        'Cuando la información que necesita el modelo cambia frecuentemente (precios, noticias, políticas, documentos internos actualizados). Fine-tuning "congela" el conocimiento en el momento del entrenamiento.',
        'Cuando el modelo falla en razonamiento.',
        'Cuando el dataset de fine-tuning es pequeño.',
      ],
      answer: 1,
      explain:
        'Fine-tuning no es un mecanismo de actualización de conocimiento: los pesos se fijan en el momento del entrenamiento. Para datos que cambian (catálogo de productos, normativa legal vigente, base de conocimiento corporativa actualizada), RAG es la arquitectura correcta porque recupera en tiempo real.',
    },
    {
      q: '¿Cuándo tiene sentido la combinación RAG + fine-tuning?',
      options: [
        'Siempre es mejor que solo uno de los dos.',
        'Solo para modelos muy grandes.',

        'Cuando el problema tiene dos dimensiones distintas: necesitas que el modelo tenga comportamiento/terminología de dominio específica (fine-tuning) Y acceso a información actualizable (RAG).',

        'Nunca tiene sentido la combinación.',
      ],
      answer: 2,
      explain:
        'Un asistente médico es el ejemplo clásico: fine-tuning para que use terminología clínica correcta y siga protocolos de respuesta + RAG para acceder a guías clínicas actualizadas y al historial del paciente. Los dos problemas son distintos y requieren soluciones distintas.',
    },
    {
      q: '¿Qué indica que el problema es de "capacidad cognitiva" y no de comportamiento ni conocimiento?',
      options: [
        'Que el modelo es lento.',
        'Que el modelo falla en razonamiento multi-paso, matemáticas complejas, o comprensión profunda incluso con un prompt perfecto y toda la información relevante.',
        'Que el dataset de fine-tuning es pequeño.',
        'Que el modelo no conoce el dominio.',
      ],
      answer: 1,
      explain:
        'Si el modelo falla aunque el prompt sea perfecto y proporciones toda la información necesaria, el problema es la capacidad cognitiva del modelo base. Fine-tuning no mejora el razonamiento subyacente; ni RAG añade capacidades que el modelo no tiene. La solución es un modelo más grande o con razonamiento extendido.',
    },
  ],
  misconceptions: [
    {
      myth: 'El fine-tuning siempre es necesario para casos de uso de empresa/dominio.',
      reality:
        'La mayoría de casos de uso empresariales se resuelven con un buen prompt + RAG para el conocimiento de dominio. Fine-tuning aporta valor cuando el comportamiento del modelo no se puede ajustar suficientemente con prompts, lo que es menos frecuente de lo que parece al principio.',
    },
    {
      myth: 'RAG elimina las alucinaciones.',
      reality:
        'RAG reduce las alucinaciones por falta de conocimiento, pero el modelo puede alucinar *dentro* del contexto proporcionado (inventar detalles, mal interpretar documentos, hacer inferencias incorrectas). RAG + verificación de faithfulness + evals es lo que realmente reduce las alucinaciones.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Build with Claude — Choose the right approach',
      url: 'https://docs.anthropic.com/en/docs/about-claude/use-case-identification',
      kind: 'docs',
    },
    {
      title: 'Lewis et al. (2020) · Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      kind: 'paper',
    },
  ],
}

export default details
