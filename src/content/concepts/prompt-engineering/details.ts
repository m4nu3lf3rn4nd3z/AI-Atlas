import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'System prompt con delimitadores XML (Claude)',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()

SYSTEM = """Eres un asistente de soporte técnico para una tienda online.

<instrucciones>
- Responde solo con la información del documento de políticas.
- Si la respuesta no está en el documento, di exactamente: "Esa información no está en mis documentos."
- Responde siempre en español, en un máximo de 3 oraciones.
</instrucciones>"""

def ask(context: str, question: str) -> str:
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=512,
        system=SYSTEM,
        messages=[
            {
                "role": "user",
                "content": f"<documento>\\n{context}\\n</documento>\\n\\n<pregunta>{question}</pregunta>",
            }
        ],
    )
    return response.content[0].text

policy = "Los pedidos se envían en 2-5 días hábiles. Devoluciones: 30 días con embalaje original."
print(ask(policy, "¿Cuánto tarda el envío?"))
print(ask(policy, "¿Tenéis tallas grandes?"))  # → "Esa información no está en mis documentos."
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Few-shot para clasificación con criterios propios',
      lang: 'python',
      code: `import anthropic

client = anthropic.Anthropic()

FEW_SHOT = """Clasifica si este ticket de soporte es urgente (requiere respuesta en < 1h) o normal.

Ejemplos:
Ticket: "La web está caída para todos los usuarios" → urgente
Ticket: "¿Cómo cambio mi contraseña?" → normal
Ticket: "Error 500 en checkout con Visa" → urgente
Ticket: "¿Cuándo sale el feature X?" → normal

Responde con una sola palabra: urgente o normal."""

def classify(ticket: str) -> str:
    resp = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=10,
        messages=[{"role": "user", "content": f"{FEW_SHOT}\\n\\nTicket: \\"{ticket}\\""}],
    )
    return resp.content[0].text.strip().lower()

print(classify("El módulo de pagos no procesa tarjetas desde hace 30 min"))  # → urgente
print(classify("Necesito acceso a los informes del mes pasado"))              # → normal
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'max_tokens=10 evita respuestas largas en tareas de clasificación: ahorra coste y acelera la respuesta.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la primera técnica que deberías probar antes de considerar fine-tuning?',
      options: [
        'Entrenar un modelo desde cero.',
        'Optimizar el prompt con few-shot examples y chain-of-thought.',
        'Aumentar max_tokens.',
        'Cambiar de proveedor de LLM.',
      ],
      answer: 1,
      explain:
        'El prompt engineering es rápido, barato y reversible. Agota las técnicas de prompting (few-shot, CoT, structured outputs) antes de invertir en fine-tuning, que es costoso y añade complejidad.',
    },
    {
      q: 'Tienes un system prompt de 2000 tokens que no cambia entre peticiones. ¿Qué optimización reduce drásticamente el coste?',
      options: [
        'Reducir el system prompt a menos de 100 tokens.',
        'Enviar el system prompt en un mensaje separado previo.',
        'Usar prompt caching para que el prefill se compute una vez y se reutilice.',
        'Usar temperature=0.',
      ],
      answer: 2,
      explain:
        'El prompt caching (disponible en Claude, Gemini y algunos modelos de OpenAI) almacena el KV cache del prefijo estático. Las peticiones siguientes pagan un coste mínimo por ese prefijo, con ahorros de hasta el 90 %.',
    },
    {
      q: '¿Qué hace el chain-of-thought prompting?',
      options: [
        'Encadena varias peticiones al modelo.',
        'Pide al modelo que razone paso a paso antes de dar la respuesta final, lo que mejora tareas complejas.',
        'Usa varios modelos en cadena.',
        'Divide el prompt en fragmentos.',
      ],
      answer: 1,
      explain:
        'CoT (Wei et al., 2022) mostró que pedir al modelo que explique su razonamiento intermedio mejora la precisión en tareas matemáticas, de código y de razonamiento lógico.',
    },
    {
      q: 'En un contexto muy largo, ¿qué posición tiende a recordar mejor el modelo?',
      options: [
        'Exactamente el centro del contexto.',
        'El principio y el final del contexto.',
        'Los últimos 512 tokens siempre.',
        'La posición no importa.',
      ],
      answer: 1,
      explain:
        'El "lost in the middle" (Liu et al., 2023) mostró que los modelos recuerdan mejor lo que está al inicio y al final del contexto. Pon la información más crítica en esas posiciones.',
    },
  ],
  misconceptions: [
    {
      myth: 'Más instrucciones en el system prompt siempre da mejores resultados.',
      reality:
        'Un system prompt demasiado largo o con instrucciones contradictorias confunde al modelo. Prioriza claridad y concisión: pocas instrucciones, muy claras, con ejemplos.',
    },
    {
      myth: 'El prompt engineering es una habilidad que se domina con trucos mágicos.',
      reality:
        'Es ingeniería iterativa: define una métrica, cambia una variable, mide. Los "trucos" sin evaluación son anécdotas, no ingeniería.',
    },
    {
      myth: 'Los modelos modernos no necesitan few-shot examples.',
      reality:
        'Zero-shot funciona bien en tareas comunes. Para criterios específicos del dominio, formatos no convencionales o comportamientos difíciles de verbalizar, los few-shot examples siguen siendo la herramienta más efectiva.',
    },
  ],
  sources: [
    {
      title: 'Wei et al. (2022) · Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      kind: 'paper',
    },
    {
      title: 'Liu et al. (2023) · Lost in the Middle: How Language Models Use Long Contexts',
      url: 'https://arxiv.org/abs/2307.03172',
      kind: 'paper',
    },
    {
      title: 'Anthropic · Prompt engineering overview',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview',
      kind: 'docs',
    },
  ],
}

export default details
