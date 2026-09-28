import {
  Activity,
  ArrowDownUp,
  Bot,
  Box,
  Boxes,
  Brain,
  Database,
  FileText,
  Gauge,
  Globe,
  Inbox,
  ListChecks,
  MessagesSquare,
  Network,
  Plug,
  Search,
  Server,
  ShieldCheck,
  Split,
  User,
  UserCheck,
  Users,
  Webhook,
  Workflow,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

/* The building blocks every AI system is assembled from. Use-case diagrams
   are made of these; each block names the tools that usually implement it. */

export const BLOCK_KINDS = [
  'user',
  'ui',
  'llm',
  'agent',
  'subagent',
  'planner',
  'router',
  'tool',
  'mcp-client',
  'mcp-server',
  'memory',
  'retriever',
  'reranker',
  'vector-store',
  'workflow',
  'queue',
  'sandbox',
  'browser',
  'api',
  'database',
  'evaluator',
  'tracer',
  'hitl',
  'guardrail',
  'parser',
  'gateway',
] as const

export type BlockKind = (typeof BLOCK_KINDS)[number]

export interface Block {
  label: string
  description: string
  icon: LucideIcon
  concept?: string
  tools: string[]
}

export const BLOCKS: Record<BlockKind, Block> = {
  user: { label: 'Usuario', description: 'Quien inicia la tarea: una persona, un evento o un sistema.', icon: User, tools: [] },
  ui: { label: 'Interfaz', description: 'Chat, widget o app donde se conversa y se ven los pasos del agente.', icon: MessagesSquare, tools: ['vercel-ai-sdk', 'copilotkit', 'ag-ui', 'chainlit', 'streamlit', 'gradio'] },
  llm: { label: 'LLM', description: 'El modelo que razona y genera: la pieza más cara y la menos determinista.', icon: Brain, concept: 'next-token', tools: ['litellm', 'openrouter', 'portkey'] },
  agent: { label: 'Agente', description: 'Un LLM en bucle que decide qué herramientas usar hasta cumplir el objetivo.', icon: Bot, concept: 'agent-loop', tools: ['claude-agent-sdk', 'openai-agents-sdk', 'langgraph', 'pydantic-ai', 'mastra', 'crewai'] },
  subagent: { label: 'Subagente', description: 'Agente con una subtarea acotada y su propio contexto; devuelve un resultado condensado.', icon: Users, concept: 'multi-agent', tools: ['supervisor', 'langgraph', 'openai-agents-sdk', 'claude-agent-sdk'] },
  planner: { label: 'Planificador', description: 'Descompone el objetivo en pasos o subtareas antes de actuar.', icon: ListChecks, concept: 'workflow-patterns', tools: ['planner', 'plan-execute'] },
  router: { label: 'Router', description: 'Clasifica la petición y la envía al camino, modelo o agente adecuado.', icon: Split, concept: 'workflow-patterns', tools: ['router', 'litellm'] },
  tool: { label: 'Herramienta', description: 'Una función que tu sistema ejecuta cuando el modelo la pide.', icon: Wrench, concept: 'tool-calling', tools: ['function-calling', 'json-schema', 'openapi-tools'] },
  'mcp-client': { label: 'Cliente MCP', description: 'Conecta el host con un servidor MCP y enruta las llamadas.', icon: Plug, concept: 'mcp', tools: ['mcp-client', 'mcp'] },
  'mcp-server': { label: 'Servidor MCP', description: 'Expone herramientas, recursos y prompts de un sistema externo.', icon: Server, concept: 'mcp', tools: ['mcp-server', 'mcp-tools', 'mcp-resources'] },
  memory: { label: 'Memoria', description: 'Lo que el sistema recuerda entre pasos y entre sesiones.', icon: Database, concept: 'agent-memory', tools: ['mem0', 'zep', 'letta', 'redis', 'langgraph-memory'] },
  retriever: { label: 'Retriever', description: 'Convierte la pregunta en una búsqueda y devuelve fragmentos candidatos.', icon: Search, concept: 'rag', tools: ['llamaindex', 'langchain', 'haystack'] },
  reranker: { label: 'Reranker', description: 'Reordena los candidatos leyendo pregunta y fragmento juntos.', icon: ArrowDownUp, concept: 'reranking', tools: ['cohere-rerank', 'voyage', 'jina'] },
  'vector-store': { label: 'Vector store', description: 'Guarda embeddings y busca los más parecidos a la consulta.', icon: Boxes, concept: 'vector-databases', tools: ['pgvector', 'qdrant', 'pinecone', 'weaviate', 'chroma', 'milvus'] },
  workflow: { label: 'Workflow duradero', description: 'Ejecuta los pasos con reintentos y estado persistente: sobrevive a caídas y espera a personas.', icon: Workflow, concept: 'stateful-graphs', tools: ['temporal', 'inngest', 'restate', 'hatchet', 'trigger-dev'] },
  queue: { label: 'Cola', description: 'Desacopla quién produce el trabajo de quién lo procesa y absorbe picos.', icon: Inbox, tools: ['kafka', 'rabbitmq', 'nats', 'redis'] },
  sandbox: { label: 'Sandbox', description: 'Entorno aislado donde ejecutar código o comandos sin riesgo para tu sistema.', icon: Box, concept: 'code-sandboxes', tools: ['e2b', 'daytona', 'modal', 'docker', 'pyodide'] },
  browser: { label: 'Navegador', description: 'Un navegador que el agente controla para leer o actuar en webs.', icon: Globe, concept: 'computer-use', tools: ['playwright', 'browserbase', 'browser-use', 'puppeteer', 'cdp'] },
  api: { label: 'API externa', description: 'Un sistema de terceros con el que se integra el flujo.', icon: Webhook, tools: ['openapi', 'stripe', 'salesforce', 'gmail'] },
  database: { label: 'Base de datos', description: 'Datos estructurados que el sistema consulta o actualiza.', icon: Database, tools: ['postgresql', 'sqlite', 'mongodb', 'elasticsearch'] },
  evaluator: { label: 'Evaluador', description: 'Comprueba o puntúa un resultado: tests, reglas, métricas o un LLM juez.', icon: Gauge, concept: 'evals', tools: ['evaluator', 'ragas', 'deepeval', 'promptfoo', 'braintrust'] },
  tracer: { label: 'Trazas', description: 'Registra cada paso con tokens, latencia y coste para depurar y evaluar.', icon: Activity, concept: 'observability', tools: ['langfuse', 'langsmith', 'phoenix', 'opentelemetry', 'helicone'] },
  hitl: { label: 'Humano en el bucle', description: 'Una persona aprueba, corrige o toma el relevo en un punto concreto.', icon: UserCheck, concept: 'stateful-graphs', tools: ['human-in-the-loop', 'slack', 'teams', 'zendesk'] },
  guardrail: { label: 'Guardrail', description: 'Control automático sobre lo que entra o sale del modelo.', icon: ShieldCheck, concept: 'guardrails', tools: ['nemo-guardrails', 'llama-guard', 'guardrails-ai'] },
  parser: { label: 'Parser', description: 'Extrae texto y estructura de PDFs, imágenes y otros documentos.', icon: FileText, concept: 'chunking', tools: ['unstructured', 'llamaparse'] },
  gateway: { label: 'Gateway', description: 'Capa entre tu código y los proveedores de modelos: routing, fallbacks, caché y costes.', icon: Network, concept: 'cost-latency-optimization', tools: ['litellm', 'portkey', 'openrouter', 'helicone'] },
}
