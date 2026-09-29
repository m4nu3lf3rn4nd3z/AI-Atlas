import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Llamar a un agente A2A desde otro agente',
      lang: 'python',
      code: `import httpx
import json
import time

# Cliente A2A simplificado
class A2AClient:
    def __init__(self, agent_url: str):
        self.agent_url = agent_url.rstrip("/")
        self.client = httpx.Client(timeout=60.0)

    def discover(self) -> dict:
        """Obtener el Agent Card del agente remoto."""
        response = self.client.get(f"{self.agent_url}/.well-known/agent.json")
        response.raise_for_status()
        return response.json()

    def delegate_task(self, text: str) -> str:
        """Delegar una tarea y esperar el resultado."""
        # Crear la tarea
        task_response = self.client.post(
            f"{self.agent_url}/tasks",
            json={
                "message": {
                    "role": "user",
                    "parts": [{"type": "text", "text": text}],
                }
            },
        )
        task_response.raise_for_status()
        task_id = task_response.json()["id"]

        # Polling hasta completar (en producción, usar SSE o webhooks)
        for _ in range(30):
            status_response = self.client.get(f"{self.agent_url}/tasks/{task_id}")
            task = status_response.json()
            if task["status"]["state"] == "completed":
                # Extraer el texto del resultado
                for part in task.get("artifacts", [{}])[0].get("parts", []):
                    if part["type"] == "text":
                        return part["text"]
            elif task["status"]["state"] == "failed":
                raise RuntimeError(f"Tarea fallida: {task['status'].get('message')}")
            time.sleep(1)

        raise TimeoutError("El agente no respondió en 30 segundos")

# Uso en un agente orquestador
research_agent = A2AClient("https://research-agent.example.com")
card = research_agent.discover()
print(f"Agente: {card['name']} — {card['description']}")

result = research_agent.delegate_task("Investiga los últimos avances en LLMs multimodales")
print(result)
`,
      deps: { httpx: '>=0.27' },
      verifiedAt: '2026-09',
      note: 'Este es un cliente A2A simplificado con polling. En producción, usa Server-Sent Events (SSE) para streaming incremental del resultado, o webhooks para tareas de muy larga duración.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es la diferencia fundamental entre A2A y MCP?',
      options: [
        'A2A conecta agentes entre sí para delegar tareas completas (con estado y lifecycle); MCP conecta un agente con herramientas y recursos sin estado. Son complementarios: MCP para herramientas, A2A para delegación entre agentes.',

        'A2A es más nuevo que MCP.',

        'MCP solo funciona con Claude.',
        'No hay diferencia práctica.',
      ],
      answer: 0,
      explain:
        'MCP da al agente acceso a herramientas (funciones sin estado que el agente invoca). A2A permite delegar una tarea completa a otro agente que tiene su propio razonamiento, herramientas y estado. En un sistema complejo, cada agente puede usar MCP para sus herramientas locales y A2A para delegar partes del trabajo a agentes especializados.',
    },
    {
      q: '¿Qué información contiene un "Agent Card" de A2A?',
      options: [
        'Los pesos del modelo del agente.',
        'La descripción del agente, sus capacidades (streaming, notificaciones), y los "skills" que ofrece con sus inputs y outputs esperados — es el descriptor que permite que otros agentes lo descubran y usen.',
        'El historial de tareas ejecutadas.',
        'La API key del agente.',
      ],
      answer: 1,
      explain:
        'El Agent Card (`/.well-known/agent.json`) es el "contrato" público del agente: dice qué puede hacer (skills), qué formatos de input acepta, qué formatos de output produce, y qué capacidades soporta (streaming, etc.). Es lo que permite la interoperabilidad entre frameworks.',
    },
    {
      q: '¿Por qué A2A es importante para el ecosistema de agentes a largo plazo?',
      options: [
        'Porque hace los agentes más rápidos.',
        'Porque reduce el coste de inferencia.',

        'Porque permite que agentes construidos con diferentes frameworks (LangGraph, CrewAI, AutoGen) colaboren sin integración ad-hoc, creando un ecosistema donde cada proveedor puede contribuir agentes especializados interoperables.',

        'Porque solo funciona con modelos de Google.',
      ],
      answer: 2,
      explain:
        'Sin estándares, cada integración multi-agente es un silo incompatible. A2A busca hacer con los agentes lo que HTTP hizo con los servicios web: cualquier agente puede llamar a cualquier otro si ambos hablan el protocolo, independientemente del framework, lenguaje o proveedor.',
    },
    {
      q: '¿Cuál es el ciclo de vida de una tarea en A2A?',
      options: [
        'Solo dos estados: activa o terminada.',
        'submitted → working → completed (o failed, cancelled). El cliente puede consultar el estado, recibir actualizaciones vía SSE durante el working, y obtener los artifacts cuando completed.',
        'La tarea se procesa en paralelo con otras.',
        'No hay lifecycle; el resultado llega de inmediato.',
      ],
      answer: 1,
      explain:
        'A2A modela las tareas como objetos con ciclo de vida explícito porque el agente remoto puede tardar en completarlas (puede necesitar múltiples pasos, llamadas a herramientas, etc.). Los estados permiten al cliente saber si esperar, monitorizar el progreso, o gestionar un fallo.',
    },
  ],
  misconceptions: [
    {
      myth: 'A2A y MCP compiten entre sí y no se pueden usar juntos.',
      reality:
        'Son complementarios y diseñados para usarse juntos. Un agente puede usar MCP para conectarse con sus herramientas (base de datos, APIs) y A2A para delegar subtareas a agentes especializados. Google (A2A) y Anthropic/Microsoft (MCP) colaboran en hacer los dos protocolos interoperables.',
    },
    {
      myth: 'A2A solo funciona con agentes de Google.',
      reality:
        'A2A es un protocolo abierto con soporte declarado de Atlassian, Cohere, Salesforce, y muchos otros en el anuncio de 2025. El protocolo está basado en HTTP y JSON estándar, lo que facilita la implementación en cualquier stack tecnológico.',
    },
  ],
  sources: [
    {
      title: 'Google · Agent-to-Agent (A2A) — especificación oficial',
      url: 'https://google.github.io/A2A/',
      kind: 'docs',
    },
    {
      title: 'Google Developers Blog · A2A: A new era of agent interoperability',
      url: 'https://developers.googleblog.com/en/a2a-a-new-era-of-agent-interoperability/',
      kind: 'blog',
    },
  ],
}

export default details
