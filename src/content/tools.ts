/* Catalogue of the tools, protocols and patterns of the AI ecosystem.
   Descriptions are deliberately short and factual; ownership and licensing
   details change often, so only stable facts are stated. As of 2026-09. */

export const TOOLS_AS_OF = '2026-09'

export const TOOL_CATEGORIES = [
  { id: 'frameworks', title: 'Frameworks de agentes', description: 'Librerías para construir el bucle del agente, sus herramientas y su estado.' },
  { id: 'protocols', title: 'Protocolos e interoperabilidad', description: 'Estándares para que modelos, herramientas, agentes e interfaces se entiendan.' },
  { id: 'mcp', title: 'MCP por dentro', description: 'Las piezas del Model Context Protocol y quién controla cada una.' },
  { id: 'tool-calling', title: 'Tool calling y salidas estructuradas', description: 'Cómo un modelo pide ejecutar funciones y devuelve datos con forma garantizada.' },
  { id: 'patterns', title: 'Patrones de agentes', description: 'Bucles y roles que se repiten en casi todos los sistemas agénticos.' },
  { id: 'orchestration', title: 'Orquestación y ejecución duradera', description: 'Workflows que sobreviven a fallos, reintentan y esperan a personas.' },
  { id: 'memory', title: 'Memoria', description: 'Dónde guarda un agente lo que necesita recordar entre pasos y entre sesiones.' },
  { id: 'vector-db', title: 'Bases de datos vectoriales', description: 'Almacenes de embeddings con búsqueda por similitud, filtros y búsqueda híbrida.' },
  { id: 'rag', title: 'RAG: ingesta, embeddings y re-ranking', description: 'De documentos desordenados a fragmentos relevantes en el contexto.' },
  { id: 'browser', title: 'Navegador y computer use', description: 'Agentes que ven y manejan páginas web o escritorios.' },
  { id: 'code-exec', title: 'Ejecución de código', description: 'Sandboxes para que un agente ejecute código sin poner en riesgo tu sistema.' },
  { id: 'observability', title: 'Observabilidad y tracing', description: 'Ver qué hizo cada petición: llamadas, herramientas, tokens, latencia y coste.' },
  { id: 'evals', title: 'Evaluación', description: 'Medir la calidad de modelos, prompts, RAG y agentes de forma repetible.' },
  { id: 'guardrails', title: 'Guardrails', description: 'Controles automáticos sobre entradas y salidas.' },
  { id: 'gateways', title: 'Gateways y routing de LLMs', description: 'Una capa entre tu código y los proveedores: routing, fallbacks, caché y costes.' },
  { id: 'infra', title: 'Infraestructura', description: 'Las piezas clásicas sobre las que se despliega todo lo anterior.' },
  { id: 'ui', title: 'Interfaces de agentes', description: 'Cómo el usuario habla con el agente y ve lo que hace.' },
  { id: 'hitl', title: 'Humano en el bucle', description: 'Canales donde una persona aprueba, corrige o recibe el trabajo del agente.' },
  { id: 'saas', title: 'SaaS conectados vía MCP', description: 'Los servicios que más se conectan a asistentes y agentes.' },
] as const

export type ToolCategoryId = (typeof TOOL_CATEGORIES)[number]['id']

export type ToolKind =
  | 'open-source'
  | 'open-core'
  | 'managed'
  | 'protocol'
  | 'standard'
  | 'pattern'
  | 'building-block'
  | 'saas'

export const TOOL_KIND_LABELS: Record<ToolKind, string> = {
  'open-source': 'Open source',
  'open-core': 'Open source + cloud',
  managed: 'Servicio gestionado',
  protocol: 'Protocolo',
  standard: 'Estándar',
  pattern: 'Patrón',
  'building-block': 'Pieza',
  saas: 'SaaS',
}

export interface Tool {
  id: string
  name: string
  categories: ToolCategoryId[]
  kind: ToolKind
  description: string
  /** When it is the right choice. */
  choose?: string
  url?: string
  /** Atlas concepts that explain it. */
  concepts?: string[]
}

export const TOOLS: Tool[] = [
  // ── Frameworks de agentes ─────────────────────────────────────────────
  { id: 'langgraph', name: 'LangGraph', categories: ['frameworks'], kind: 'open-core', description: 'Orquesta agentes como grafos con estado: nodos, aristas condicionales, checkpoints, interrupciones humanas y streaming.', choose: 'Cuando necesitas control fino del flujo, persistencia y humanos en el bucle.', url: 'https://www.langchain.com/langgraph', concepts: ['stateful-graphs', 'agent-frameworks'] },
  { id: 'langchain', name: 'LangChain', categories: ['frameworks', 'rag'], kind: 'open-source', description: 'Integraciones con cientos de modelos, vector stores y herramientas, y abstracciones para cadenas y agentes (sus agentes corren sobre LangGraph).', choose: 'Para prototipar rápido aprovechando integraciones existentes.', url: 'https://www.langchain.com', concepts: ['agent-frameworks', 'rag'] },
  { id: 'crewai', name: 'CrewAI', categories: ['frameworks'], kind: 'open-core', description: 'Equipos de agentes con roles, objetivos y tareas («crews»), más flujos deterministas («flows»), en Python.', choose: 'Prototipos multi-agente basados en roles con poco código.', url: 'https://www.crewai.com', concepts: ['multi-agent', 'agent-frameworks'] },
  { id: 'autogen', name: 'AutoGen', categories: ['frameworks'], kind: 'open-source', description: 'Framework de Microsoft Research para conversaciones entre agentes. Microsoft lo está unificando con Semantic Kernel en Microsoft Agent Framework.', choose: 'Investigación y prototipos conversacionales; para proyectos nuevos en el ecosistema Microsoft, valora su sucesor.', url: 'https://github.com/microsoft/autogen', concepts: ['multi-agent'] },
  { id: 'openai-agents-sdk', name: 'OpenAI Agents SDK', categories: ['frameworks'], kind: 'open-source', description: 'SDK ligero (Python y TypeScript) con agentes, handoffs entre agentes, guardrails, sesiones y tracing integrado.', choose: 'Si usas modelos de OpenAI y quieres pocas abstracciones.', url: 'https://openai.github.io/openai-agents-python/', concepts: ['agent-loop', 'multi-agent'] },
  { id: 'claude-agent-sdk', name: 'Claude Agent SDK', categories: ['frameworks'], kind: 'open-source', description: 'El arnés de Claude Code como librería (Python y TypeScript): bucle de agente, herramientas de ficheros y terminal, subagentes, hooks, permisos y MCP.', choose: 'Agentes que trabajan sobre ficheros, código o una terminal.', url: 'https://code.claude.com/docs/en/agent-sdk', concepts: ['coding-agents', 'agent-loop'] },
  { id: 'llamaindex', name: 'LlamaIndex', categories: ['frameworks', 'rag'], kind: 'open-core', description: 'Conecta LLMs con tus datos: ingesta, índices, recuperación y agentes sobre documentos; LlamaCloud añade parsing e indexado gestionados.', choose: 'Cuando el núcleo del producto es RAG sobre documentos.', url: 'https://www.llamaindex.ai', concepts: ['rag', 'advanced-rag'] },
  { id: 'pydantic-ai', name: 'Pydantic AI', categories: ['frameworks'], kind: 'open-source', description: 'Agentes con tipado estricto: salidas validadas con modelos Pydantic, inyección de dependencias y soporte de MCP.', choose: 'Si valoras tipos, validación y Python idiomático.', url: 'https://ai.pydantic.dev', concepts: ['structured-outputs', 'agent-frameworks'] },
  { id: 'semantic-kernel', name: 'Semantic Kernel', categories: ['frameworks'], kind: 'open-source', description: 'SDK de Microsoft (C#, Python, Java) para integrar LLMs en aplicaciones empresariales con plugins y memoria.', choose: 'Stacks .NET y Azure.', url: 'https://github.com/microsoft/semantic-kernel', concepts: ['agent-frameworks'] },
  { id: 'haystack', name: 'Haystack', categories: ['frameworks', 'rag'], kind: 'open-core', description: 'Pipelines de búsqueda, RAG y agentes a partir de componentes composables, orientado a producción (deepset).', choose: 'Pipelines de RAG explícitos y auditables.', url: 'https://haystack.deepset.ai', concepts: ['rag'] },
  { id: 'dspy', name: 'DSPy', categories: ['frameworks'], kind: 'open-source', description: '«Programar, no escribir prompts»: defines módulos con firmas de entrada y salida, y sus optimizadores ajustan prompts y ejemplos contra una métrica.', choose: 'Cuando tienes una métrica y datos y quieres optimizar el pipeline de forma sistemática.', url: 'https://dspy.ai', concepts: ['prompt-engineering', 'evals'] },
  { id: 'mastra', name: 'Mastra', categories: ['frameworks'], kind: 'open-core', description: 'Framework de agentes en TypeScript con agentes, workflows, memoria, RAG y evals.', choose: 'Equipos que trabajan en TypeScript/Node.', url: 'https://mastra.ai', concepts: ['agent-frameworks'] },
  { id: 'vercel-ai-sdk', name: 'Vercel AI SDK', categories: ['gateways', 'ui'], kind: 'open-source', description: 'Toolkit de TypeScript con una API unificada para muchos proveedores, streaming, tool calling y componentes de UI para chat.', choose: 'Apps web con React o Next.js que hablan con uno o varios modelos.', url: 'https://ai-sdk.dev', concepts: ['llm-apis'] },

  // ── Protocolos ────────────────────────────────────────────────────────
  { id: 'mcp', name: 'Model Context Protocol (MCP)', categories: ['protocols'], kind: 'protocol', description: 'Protocolo abierto (JSON-RPC 2.0) con el que una aplicación host conecta con servidores que exponen herramientas, recursos y prompts. Transportes: stdio y Streamable HTTP.', url: 'https://modelcontextprotocol.io', concepts: ['mcp'] },
  { id: 'a2a', name: 'Agent2Agent (A2A)', categories: ['protocols'], kind: 'protocol', description: 'Protocolo para que agentes de distintos proveedores se descubran (Agent Cards) y se deleguen tareas. Gobernado por la Linux Foundation.', url: 'https://a2a-protocol.org', concepts: ['a2a'] },
  { id: 'acp', name: 'ACP', categories: ['protocols'], kind: 'protocol', description: 'Dos protocolos comparten siglas: Agent Communication Protocol (IBM/BeeAI), que en 2025 se integró en A2A, y Agent Client Protocol (Zed), que conecta editores de código con agentes de programación.', url: 'https://agentclientprotocol.com', concepts: ['a2a', 'coding-agents'] },
  { id: 'openapi', name: 'OpenAPI', categories: ['protocols'], kind: 'standard', description: 'Especificación estándar para describir APIs HTTP. Muchas plataformas convierten una definición OpenAPI en herramientas que el modelo puede llamar.', url: 'https://www.openapis.org', concepts: ['tool-calling'] },
  { id: 'json-schema', name: 'JSON Schema', categories: ['protocols', 'tool-calling'], kind: 'standard', description: 'Vocabulario para describir y validar la forma de un JSON. Es el lenguaje de los parámetros de herramientas y de las salidas estructuradas.', url: 'https://json-schema.org', concepts: ['structured-outputs', 'tool-calling'] },
  { id: 'ag-ui', name: 'AG-UI', categories: ['protocols', 'ui'], kind: 'protocol', description: 'Agent-User Interaction Protocol: eventos estándar (texto, llamadas a herramientas, estado) entre un agente backend y su interfaz.', url: 'https://docs.ag-ui.com', concepts: ['agent-frameworks'] },

  // ── MCP por dentro ────────────────────────────────────────────────────
  { id: 'mcp-host', name: 'Host MCP', categories: ['mcp'], kind: 'building-block', description: 'La aplicación que usa la persona (un chat, un IDE, un agente). Gestiona los clientes MCP, los permisos y lo que entra en el contexto del modelo.', concepts: ['mcp'] },
  { id: 'mcp-client', name: 'Cliente MCP', categories: ['mcp'], kind: 'building-block', description: 'Vive dentro del host y mantiene una conexión 1:1 con un servidor: negocia capacidades y enruta las peticiones.', concepts: ['mcp'] },
  { id: 'mcp-server', name: 'Servidor MCP', categories: ['mcp'], kind: 'building-block', description: 'Expone las capacidades de un sistema (GitHub, una base de datos, tu API) de forma estándar. Local (stdio) o remoto (HTTP con OAuth).', concepts: ['mcp'] },
  { id: 'mcp-tools', name: 'Tools', categories: ['mcp'], kind: 'building-block', description: 'Funciones que el modelo decide invocar, con parámetros en JSON Schema. Las controla el modelo, por eso las de escritura merecen confirmación.', concepts: ['mcp', 'tool-calling'] },
  { id: 'mcp-resources', name: 'Resources', categories: ['mcp'], kind: 'building-block', description: 'Datos que el servidor publica por URI (ficheros, registros, esquemas) para añadirlos al contexto. Los controla la aplicación.', concepts: ['mcp'] },
  { id: 'mcp-prompts', name: 'Prompts', categories: ['mcp'], kind: 'building-block', description: 'Plantillas reutilizables que el servidor ofrece y el usuario elige, a menudo como comandos. Las controla el usuario.', concepts: ['mcp'] },

  // ── Tool calling ──────────────────────────────────────────────────────
  { id: 'function-calling', name: 'Function / tool calling', categories: ['tool-calling'], kind: 'building-block', description: 'El modelo responde con el nombre de una función y sus argumentos en JSON; tu código la ejecuta y le devuelve el resultado. Son dos nombres para el mismo mecanismo.', concepts: ['tool-calling'] },
  { id: 'structured-outputs', name: 'Structured outputs', categories: ['tool-calling'], kind: 'building-block', description: 'Modo de la API que garantiza que la respuesta cumple un JSON Schema mediante decodificación restringida: ni JSON inválido ni campos inventados.', concepts: ['structured-outputs'] },
  { id: 'openapi-tools', name: 'Herramientas desde OpenAPI', categories: ['tool-calling'], kind: 'pattern', description: 'Generar las definiciones de herramientas a partir de una especificación OpenAPI para que un agente llame a una API REST existente.', concepts: ['tool-calling'] },

  // ── Patrones ──────────────────────────────────────────────────────────
  { id: 'react', name: 'ReAct', categories: ['patterns'], kind: 'pattern', description: 'Alternar razonamiento y acción: pensar, llamar a una herramienta, observar el resultado y repetir.', concepts: ['agent-loop'] },
  { id: 'plan-execute', name: 'Plan-and-Execute', categories: ['patterns'], kind: 'pattern', description: 'Un planificador genera el plan completo y un ejecutor lo recorre paso a paso, replanificando si algo falla.', concepts: ['workflow-patterns'] },
  { id: 'reflection', name: 'Reflection', categories: ['patterns'], kind: 'pattern', description: 'El modelo revisa su propia salida (o la de otro), detecta fallos y la mejora en otra pasada.', concepts: ['workflow-patterns'] },
  { id: 'self-consistency', name: 'Self-Consistency', categories: ['patterns'], kind: 'pattern', description: 'Generar varias respuestas independientes y quedarse con la mayoritaria: más coste a cambio de fiabilidad.', concepts: ['reasoning-models'] },
  { id: 'tree-of-thoughts', name: 'Tree of Thoughts', categories: ['patterns'], kind: 'pattern', description: 'Explorar varias ramas de razonamiento, evaluarlas y podar las peores, como una búsqueda en árbol.', concepts: ['reasoning-models'] },
  { id: 'retry-loop', name: 'Retry loop', categories: ['patterns'], kind: 'pattern', description: 'Validar la salida (esquema, tests, reglas de negocio) y, si falla, reintentar pasándole el error al modelo.', concepts: ['structured-outputs', 'agent-loop'] },
  { id: 'human-in-the-loop', name: 'Human-in-the-loop', categories: ['patterns'], kind: 'pattern', description: 'Pausar el flujo para que una persona apruebe, corrija o decida antes de una acción con consecuencias.', concepts: ['stateful-graphs', 'guardrails'] },
  { id: 'supervisor', name: 'Supervisor', categories: ['patterns'], kind: 'pattern', description: 'Un agente coordinador reparte subtareas entre agentes especializados y combina sus resultados.', concepts: ['multi-agent'] },
  { id: 'router', name: 'Router', categories: ['patterns'], kind: 'pattern', description: 'Un paso, a menudo con un modelo pequeño, clasifica la petición y la envía al flujo, modelo o agente adecuado.', concepts: ['workflow-patterns', 'cost-latency-optimization'] },
  { id: 'planner', name: 'Planner', categories: ['patterns'], kind: 'pattern', description: 'Rol que descompone un objetivo en pasos o subtareas.', concepts: ['workflow-patterns'] },
  { id: 'executor', name: 'Executor', categories: ['patterns'], kind: 'pattern', description: 'Rol que ejecuta los pasos del plan usando herramientas.', concepts: ['agent-loop'] },
  { id: 'critic', name: 'Critic', categories: ['patterns'], kind: 'pattern', description: 'Rol que revisa el trabajo de otro agente buscando errores, huecos o afirmaciones sin fuente.', concepts: ['llm-as-judge'] },
  { id: 'evaluator', name: 'Evaluator', categories: ['patterns'], kind: 'pattern', description: 'Rol que puntúa un resultado contra criterios y, en el patrón evaluator-optimizer, decide si hay que iterar.', concepts: ['workflow-patterns', 'llm-as-judge'] },

  // ── Orquestación ──────────────────────────────────────────────────────
  { id: 'temporal', name: 'Temporal', categories: ['orchestration'], kind: 'open-core', description: 'Ejecución duradera: los workflows sobreviven a caídas y reinicios, con reintentos, temporizadores y señales para esperar aprobaciones.', choose: 'Procesos largos y críticos donde no puedes perder ni duplicar pasos.', url: 'https://temporal.io', concepts: ['stateful-graphs'] },
  { id: 'inngest', name: 'Inngest', categories: ['orchestration'], kind: 'open-core', description: 'Funciones duraderas dirigidas por eventos: pasos con reintentos automáticos, esperas y control de concurrencia sin gestionar colas.', choose: 'Apps serverless que reaccionan a eventos.', url: 'https://www.inngest.com' },
  { id: 'prefect', name: 'Prefect', categories: ['orchestration'], kind: 'open-core', description: 'Orquestador de flujos en Python con reintentos, programación y observabilidad.', choose: 'Pipelines de datos y ML en Python.', url: 'https://www.prefect.io' },
  { id: 'airflow', name: 'Apache Airflow', categories: ['orchestration'], kind: 'open-source', description: 'El orquestador clásico de pipelines por lotes definidos como DAGs.', choose: 'ETL programados; no está pensado para flujos interactivos de baja latencia.', url: 'https://airflow.apache.org' },
  { id: 'dagster', name: 'Dagster', categories: ['orchestration'], kind: 'open-core', description: 'Orquestador orientado a los «assets» de datos, con linaje y tipado.', choose: 'Plataformas de datos donde importan los artefactos y su linaje.', url: 'https://dagster.io' },
  { id: 'trigger-dev', name: 'Trigger.dev', categories: ['orchestration'], kind: 'open-core', description: 'Tareas en segundo plano de larga duración para TypeScript, con colas, reintentos y ejecución duradera.', choose: 'Jobs de IA largos desde apps Node o Next.js.', url: 'https://trigger.dev' },
  { id: 'hatchet', name: 'Hatchet', categories: ['orchestration'], kind: 'open-core', description: 'Cola de tareas y motor de workflows duraderos sobre PostgreSQL, con control de concurrencia y reintentos.', url: 'https://hatchet.run' },
  { id: 'restate', name: 'Restate', categories: ['orchestration'], kind: 'open-core', description: 'Runtime ligero de ejecución duradera: funciones y workflows con estado que se reanudan tras un fallo.', url: 'https://restate.dev' },

  // ── Memoria ───────────────────────────────────────────────────────────
  { id: 'redis', name: 'Redis', categories: ['memory', 'infra'], kind: 'open-source', description: 'Base de datos en memoria: caché, colas, sesiones y memoria de corto plazo; también ofrece búsqueda vectorial.', url: 'https://redis.io' },
  { id: 'postgresql', name: 'PostgreSQL', categories: ['memory', 'infra'], kind: 'open-source', description: 'La base de datos relacional de referencia. Con pgvector también guarda embeddings; sirve para memoria, checkpoints y trazas.', url: 'https://www.postgresql.org' },
  { id: 'sqlite', name: 'SQLite', categories: ['memory'], kind: 'open-source', description: 'Base de datos embebida en un fichero: ideal para prototipos, apps locales y checkpoints de agentes.', url: 'https://sqlite.org' },
  { id: 'mongodb', name: 'MongoDB', categories: ['memory', 'vector-db'], kind: 'open-core', description: 'Base de datos de documentos con búsqueda vectorial integrada.', url: 'https://www.mongodb.com' },
  { id: 'mem0', name: 'Mem0', categories: ['memory'], kind: 'open-core', description: 'Capa de memoria que extrae, actualiza y recupera hechos relevantes de las conversaciones, por usuario, sesión o agente.', url: 'https://mem0.ai', concepts: ['agent-memory'] },
  { id: 'zep', name: 'Zep', categories: ['memory'], kind: 'managed', description: 'Memoria basada en un grafo de conocimiento temporal (su motor, Graphiti, es open source): recuerda hechos y cómo cambian con el tiempo.', url: 'https://www.getzep.com', concepts: ['agent-memory'] },
  { id: 'letta', name: 'Letta', categories: ['memory'], kind: 'open-core', description: 'Agentes con estado cuya memoria gestiona el propio agente (antes MemGPT): memoria de trabajo editable y archivo a largo plazo.', url: 'https://www.letta.com', concepts: ['agent-memory'] },
  { id: 'langgraph-memory', name: 'LangGraph Memory', categories: ['memory'], kind: 'open-source', description: 'Checkpointers (memoria de corto plazo por hilo) y stores (memoria de largo plazo entre hilos) integrados en LangGraph.', url: 'https://www.langchain.com/langgraph', concepts: ['agent-memory', 'stateful-graphs'] },

  // ── Bases de datos vectoriales ────────────────────────────────────────
  { id: 'pinecone', name: 'Pinecone', categories: ['vector-db'], kind: 'managed', description: 'Base de datos vectorial serverless y gestionada, con búsqueda híbrida y filtros por metadatos.', choose: 'Si no quieres operar nada.', url: 'https://www.pinecone.io', concepts: ['vector-databases'] },
  { id: 'weaviate', name: 'Weaviate', categories: ['vector-db'], kind: 'open-core', description: 'Base de datos vectorial con búsqueda híbrida nativa, vectorización integrada y multi-tenancy.', url: 'https://weaviate.io', concepts: ['vector-databases', 'hybrid-search'] },
  { id: 'qdrant', name: 'Qdrant', categories: ['vector-db'], kind: 'open-core', description: 'Motor vectorial escrito en Rust, rápido y con filtros potentes; autoalojado o en la nube.', url: 'https://qdrant.tech', concepts: ['vector-databases'] },
  { id: 'milvus', name: 'Milvus', categories: ['vector-db'], kind: 'open-core', description: 'Base de datos vectorial distribuida para volúmenes de miles de millones de vectores.', url: 'https://milvus.io', concepts: ['vector-databases', 'ann-indexes'] },
  { id: 'chroma', name: 'Chroma', categories: ['vector-db'], kind: 'open-core', description: 'Base de datos vectorial sencilla y embebible, muy usada en prototipos y desarrollo local.', url: 'https://www.trychroma.com', concepts: ['vector-databases'] },
  { id: 'pgvector', name: 'pgvector', categories: ['vector-db'], kind: 'open-source', description: 'Extensión de PostgreSQL para guardar y buscar vectores (índices HNSW e IVFFlat) junto al resto de tus datos.', choose: 'Si ya usas Postgres y hablamos de hasta unos millones de vectores.', url: 'https://github.com/pgvector/pgvector', concepts: ['vector-databases'] },
  { id: 'elasticsearch', name: 'Elasticsearch', categories: ['vector-db', 'rag'], kind: 'open-core', description: 'Motor de búsqueda con BM25 de primera clase y búsqueda vectorial: la base natural para la búsqueda híbrida.', url: 'https://www.elastic.co/elasticsearch', concepts: ['hybrid-search'] },
  { id: 'opensearch', name: 'OpenSearch', categories: ['vector-db', 'rag'], kind: 'open-source', description: 'Fork open source de Elasticsearch con búsqueda léxica, vectorial e híbrida.', url: 'https://opensearch.org', concepts: ['hybrid-search'] },

  // ── RAG ───────────────────────────────────────────────────────────────
  { id: 'unstructured', name: 'Unstructured', categories: ['rag'], kind: 'open-core', description: 'Convierte PDFs, Word, HTML, emails e imágenes en elementos limpios (títulos, tablas, texto) listos para trocear.', url: 'https://unstructured.io', concepts: ['chunking'] },
  { id: 'llamaparse', name: 'LlamaParse', categories: ['rag'], kind: 'managed', description: 'Parsing de documentos complejos (tablas, gráficos, maquetación) de LlamaIndex, pensado para RAG.', url: 'https://www.llamaindex.ai/llamaparse', concepts: ['chunking', 'multimodality'] },
  { id: 'cohere-rerank', name: 'Cohere Rerank', categories: ['rag'], kind: 'managed', description: 'Re-ranking multilingüe por API con un cross-encoder: reordena los candidatos por relevancia real.', url: 'https://cohere.com/rerank', concepts: ['reranking'] },
  { id: 'jina', name: 'Jina AI', categories: ['rag'], kind: 'managed', description: 'Modelos de embeddings, rerankers y lectura de webs orientados a búsqueda, con versiones de pesos abiertos.', url: 'https://jina.ai', concepts: ['embedding-models', 'reranking'] },
  { id: 'voyage', name: 'Voyage AI', categories: ['rag'], kind: 'managed', description: 'Embeddings y rerankers de alta calidad, con variantes por dominio (código, finanzas, derecho). Parte de MongoDB desde 2025.', url: 'https://www.voyageai.com', concepts: ['embedding-models', 'reranking'] },

  // ── Navegador ─────────────────────────────────────────────────────────
  { id: 'playwright', name: 'Playwright', categories: ['browser'], kind: 'open-source', description: 'Automatización de Chromium, Firefox y WebKit con esperas automáticas; la base de muchos agentes de navegador.', url: 'https://playwright.dev', concepts: ['computer-use'] },
  { id: 'puppeteer', name: 'Puppeteer', categories: ['browser'], kind: 'open-source', description: 'Librería para controlar Chrome desde Node a través del Chrome DevTools Protocol.', url: 'https://pptr.dev', concepts: ['computer-use'] },
  { id: 'browserbase', name: 'Browserbase', categories: ['browser'], kind: 'managed', description: 'Navegadores headless en la nube para agentes: sesiones aisladas, grabación y depuración.', url: 'https://www.browserbase.com', concepts: ['computer-use'] },
  { id: 'browser-use', name: 'Browser Use', categories: ['browser'], kind: 'open-core', description: 'Librería de Python con la que un LLM controla un navegador: lee la página y ejecuta clics, escritura y navegación.', url: 'https://browser-use.com', concepts: ['computer-use'] },
  { id: 'selenium', name: 'Selenium', categories: ['browser'], kind: 'open-source', description: 'El veterano de la automatización web (WebDriver), muy extendido en testing.', url: 'https://www.selenium.dev' },
  { id: 'cdp', name: 'Chrome DevTools Protocol', categories: ['browser'], kind: 'protocol', description: 'Protocolo de bajo nivel para inspeccionar y controlar Chrome; lo usan Puppeteer, Playwright y muchos agentes.', url: 'https://chromedevtools.github.io/devtools-protocol/' },
  { id: 'computer-use', name: 'Computer use', categories: ['browser'], kind: 'building-block', description: 'Capacidad de algunos modelos de operar un escritorio o un navegador a partir de capturas, emitiendo clics y pulsaciones de teclado.', concepts: ['computer-use'] },

  // ── Ejecución de código ───────────────────────────────────────────────
  { id: 'e2b', name: 'E2B', categories: ['code-exec'], kind: 'open-core', description: 'Sandboxes en la nube (microVMs) que arrancan en milisegundos para que un agente ejecute código y comandos con seguridad.', url: 'https://e2b.dev', concepts: ['code-sandboxes'] },
  { id: 'modal', name: 'Modal', categories: ['code-exec'], kind: 'managed', description: 'Plataforma serverless para ejecutar Python en contenedores, con GPU y sandboxes para código generado.', url: 'https://modal.com', concepts: ['code-sandboxes'] },
  { id: 'daytona', name: 'Daytona', categories: ['code-exec'], kind: 'open-core', description: 'Infraestructura de sandboxes rápidos y aislados para ejecutar código generado por IA.', url: 'https://www.daytona.io', concepts: ['code-sandboxes'] },
  { id: 'docker', name: 'Docker', categories: ['code-exec', 'infra'], kind: 'open-source', description: 'Contenedores: la forma más común de aislar la ejecución de código y de empaquetar servicios.', url: 'https://www.docker.com', concepts: ['code-sandboxes'] },
  { id: 'kubernetes', name: 'Kubernetes', categories: ['code-exec', 'infra'], kind: 'open-source', description: 'Orquestador de contenedores para desplegar y escalar servicios, incluidos servidores de inferencia y sandboxes.', url: 'https://kubernetes.io' },
  { id: 'pyodide', name: 'Pyodide', categories: ['code-exec'], kind: 'open-source', description: 'Python compilado a WebAssembly: ejecuta código Python dentro del navegador, aislado del sistema.', url: 'https://pyodide.org', concepts: ['code-sandboxes'] },

  // ── Observabilidad ────────────────────────────────────────────────────
  { id: 'langsmith', name: 'LangSmith', categories: ['observability', 'evals'], kind: 'managed', description: 'Trazas, evaluación, datasets y monitorización de apps con LLM (funciona también sin LangChain).', url: 'https://www.langchain.com/langsmith', concepts: ['observability', 'evals'] },
  { id: 'langfuse', name: 'Langfuse', categories: ['observability', 'evals'], kind: 'open-core', description: 'Observabilidad open source para LLMs: trazas, costes, gestión de prompts, datasets y evaluaciones; autoalojable.', url: 'https://langfuse.com', concepts: ['observability', 'evals'] },
  { id: 'phoenix', name: 'Arize Phoenix', categories: ['observability', 'evals'], kind: 'open-source', description: 'Trazas y evaluación open source sobre OpenTelemetry (convenciones OpenInference).', url: 'https://phoenix.arize.com', concepts: ['observability'] },
  { id: 'wandb', name: 'Weights & Biases (Weave)', categories: ['observability', 'evals'], kind: 'managed', description: 'Clásico del seguimiento de experimentos de ML; Weave es su módulo de trazas y evals para apps con LLM.', url: 'https://wandb.ai/site/weave', concepts: ['observability'] },
  { id: 'helicone', name: 'Helicone', categories: ['observability', 'gateways'], kind: 'open-core', description: 'Proxy de observabilidad: cambias la URL base de la API y obtienes logs, costes, caché y límites de uso.', url: 'https://www.helicone.ai', concepts: ['observability', 'cost-latency-optimization'] },
  { id: 'opentelemetry', name: 'OpenTelemetry', categories: ['observability'], kind: 'standard', description: 'Estándar abierto de trazas, métricas y logs; sus convenciones GenAI definen cómo registrar llamadas a modelos y herramientas.', url: 'https://opentelemetry.io', concepts: ['observability'] },

  // ── Evaluación ────────────────────────────────────────────────────────
  { id: 'deepeval', name: 'DeepEval', categories: ['evals'], kind: 'open-core', description: 'Evaluación al estilo pytest con métricas listas para RAG y agentes (faithfulness, relevancia, alucinación…).', url: 'https://deepeval.com', concepts: ['evals', 'llm-as-judge'] },
  { id: 'ragas', name: 'Ragas', categories: ['evals'], kind: 'open-source', description: 'Métricas y generación de datasets para evaluar RAG: faithfulness, context precision y recall, relevancia.', url: 'https://www.ragas.io', concepts: ['evals', 'rag'] },
  { id: 'braintrust', name: 'Braintrust', categories: ['evals', 'observability'], kind: 'managed', description: 'Plataforma de evals y observabilidad: experimentos, puntuadores, datasets y comparación entre versiones.', url: 'https://www.braintrust.dev', concepts: ['evals'] },
  { id: 'promptfoo', name: 'Promptfoo', categories: ['evals'], kind: 'open-source', description: 'CLI para probar prompts y modelos con casos y aserciones, y para hacer red teaming (inyecciones, jailbreaks).', url: 'https://www.promptfoo.dev', concepts: ['evals', 'prompt-injection'] },
  { id: 'openai-evals', name: 'OpenAI Evals', categories: ['evals'], kind: 'open-source', description: 'Framework y registro de evals de OpenAI; su plataforma también ofrece evals gestionadas.', url: 'https://github.com/openai/evals', concepts: ['evals'] },
  { id: 'inspect', name: 'Inspect AI', categories: ['evals'], kind: 'open-source', description: 'Framework del UK AI Security Institute con tareas, solvers y puntuadores; muy usado para evaluar agentes y seguridad.', url: 'https://inspect.aisi.org.uk', concepts: ['evals'] },
  { id: 'lm-eval-harness', name: 'LM Evaluation Harness', categories: ['evals'], kind: 'open-source', description: 'Ejecuta benchmarks académicos sobre modelos (EleutherAI). Mide el modelo, no tu aplicación.', url: 'https://github.com/EleutherAI/lm-evaluation-harness', concepts: ['benchmarks'] },

  // ── Guardrails ────────────────────────────────────────────────────────
  { id: 'nemo-guardrails', name: 'NeMo Guardrails', categories: ['guardrails'], kind: 'open-source', description: 'Toolkit de NVIDIA para añadir raíles programables (temas permitidos, seguridad, formato) alrededor de un LLM.', url: 'https://github.com/NVIDIA/NeMo-Guardrails', concepts: ['guardrails'] },
  { id: 'llama-guard', name: 'Llama Guard', categories: ['guardrails'], kind: 'open-source', description: 'Modelo de pesos abiertos de Meta que clasifica entradas y salidas según una taxonomía de riesgos.', url: 'https://github.com/meta-llama/PurpleLlama', concepts: ['guardrails'] },
  { id: 'guardrails-ai', name: 'Guardrails AI', categories: ['guardrails'], kind: 'open-core', description: 'Validadores composables para entradas y salidas (datos personales, toxicidad, formato) con reintentos.', url: 'https://www.guardrailsai.com', concepts: ['guardrails'] },

  // ── Gateways ──────────────────────────────────────────────────────────
  { id: 'litellm', name: 'LiteLLM', categories: ['gateways'], kind: 'open-core', description: 'Librería y proxy que exponen más de 100 proveedores con la API de OpenAI, con fallbacks, presupuestos y control de costes.', url: 'https://www.litellm.ai', concepts: ['cost-latency-optimization', 'llm-apis'] },
  { id: 'openrouter', name: 'OpenRouter', categories: ['gateways'], kind: 'managed', description: 'Una sola API y una sola factura para cientos de modelos de muchos proveedores, con routing y fallbacks.', url: 'https://openrouter.ai', concepts: ['model-selection'] },
  { id: 'portkey', name: 'Portkey', categories: ['gateways'], kind: 'open-core', description: 'Gateway de IA para producción: routing, fallbacks, caché, guardrails, presupuestos y observabilidad.', url: 'https://portkey.ai', concepts: ['cost-latency-optimization'] },

  // ── Infraestructura ───────────────────────────────────────────────────
  { id: 'kafka', name: 'Apache Kafka', categories: ['infra'], kind: 'open-source', description: 'Streaming de eventos distribuido y duradero; la columna vertebral de muchas arquitecturas dirigidas por eventos.', url: 'https://kafka.apache.org' },
  { id: 'rabbitmq', name: 'RabbitMQ', categories: ['infra'], kind: 'open-source', description: 'Broker de mensajes clásico (AMQP) para colas de trabajo y enrutado.', url: 'https://www.rabbitmq.com' },
  { id: 'nats', name: 'NATS', categories: ['infra'], kind: 'open-source', description: 'Mensajería ligera y muy rápida (pub/sub y colas); con JetStream añade persistencia.', url: 'https://nats.io' },

  // ── Interfaces ────────────────────────────────────────────────────────
  { id: 'copilotkit', name: 'CopilotKit', categories: ['ui'], kind: 'open-core', description: 'Componentes de React para meter copilotos en tu app: chat, acciones en el frontend y estado compartido con el agente. Impulsores de AG-UI.', url: 'https://www.copilotkit.ai' },
  { id: 'streamlit', name: 'Streamlit', categories: ['ui'], kind: 'open-source', description: 'Apps de datos e IA en Python puro; ideal para prototipos internos y demos.', url: 'https://streamlit.io' },
  { id: 'gradio', name: 'Gradio', categories: ['ui'], kind: 'open-source', description: 'Interfaces web para modelos en pocas líneas de Python; el estándar de las demos en Hugging Face Spaces.', url: 'https://www.gradio.app' },
  { id: 'chainlit', name: 'Chainlit', categories: ['ui'], kind: 'open-source', description: 'Interfaces de chat en Python que muestran los pasos intermedios del agente, ficheros y feedback.', url: 'https://chainlit.io' },

  // ── Humano en el bucle ────────────────────────────────────────────────
  { id: 'slack', name: 'Slack', categories: ['hitl', 'saas'], kind: 'saas', description: 'Canal habitual para pedir aprobaciones con botones y avisar al equipo; también se conecta como servidor MCP.', url: 'https://slack.com' },
  { id: 'teams', name: 'Microsoft Teams', categories: ['hitl'], kind: 'saas', description: 'El equivalente en entornos Microsoft: tarjetas para aprobar o rechazar desde el chat.', url: 'https://www.microsoft.com/microsoft-teams' },
  { id: 'discord', name: 'Discord', categories: ['hitl'], kind: 'saas', description: 'Útil en comunidades y equipos pequeños: bots que piden confirmación o recogen feedback.', url: 'https://discord.com' },
  { id: 'gmail', name: 'Gmail', categories: ['hitl', 'saas'], kind: 'saas', description: 'Fuente de trabajo (emails entrantes) y canal de respuesta; conectable por API o MCP.', url: 'https://mail.google.com' },
  { id: 'linear', name: 'Linear', categories: ['hitl', 'saas'], kind: 'saas', description: 'Gestión de issues con servidor MCP oficial: el agente crea o actualiza tareas y una persona las prioriza.', url: 'https://linear.app' },
  { id: 'jira', name: 'Jira', categories: ['hitl', 'saas'], kind: 'saas', description: 'Issues y flujos de aprobación en empresas; Atlassian ofrece un servidor MCP oficial.', url: 'https://www.atlassian.com/software/jira' },
  { id: 'zendesk', name: 'Zendesk', categories: ['hitl'], kind: 'saas', description: 'Plataforma de soporte: el bot escala la conversación a una persona con todo el contexto.', url: 'https://www.zendesk.com' },

  // ── SaaS vía MCP ──────────────────────────────────────────────────────
  { id: 'github', name: 'GitHub', categories: ['saas'], kind: 'saas', description: 'Repos, issues, pull requests y Actions. Tiene servidor MCP oficial y es la pieza central de los agentes de código.', url: 'https://github.com', concepts: ['coding-agents', 'mcp'] },
  { id: 'gitlab', name: 'GitLab', categories: ['saas'], kind: 'saas', description: 'Alternativa a GitHub con CI/CD integrado, también conectable a agentes.', url: 'https://gitlab.com' },
  { id: 'notion', name: 'Notion', categories: ['saas'], kind: 'saas', description: 'Documentación y bases de conocimiento del equipo; servidor MCP oficial para leer y escribir páginas.', url: 'https://www.notion.com' },
  { id: 'google-drive', name: 'Google Drive', categories: ['saas'], kind: 'saas', description: 'Documentos y ficheros: fuente típica de contexto para copilotos internos.', url: 'https://drive.google.com' },
  { id: 'google-calendar', name: 'Google Calendar', categories: ['saas'], kind: 'saas', description: 'Agenda: consultar disponibilidad y crear eventos, una acción de escritura que conviene confirmar.', url: 'https://calendar.google.com' },
  { id: 'salesforce', name: 'Salesforce', categories: ['saas'], kind: 'saas', description: 'CRM empresarial (cuentas, oportunidades, casos); objetivo habitual de agentes comerciales y de soporte.', url: 'https://www.salesforce.com' },
  { id: 'hubspot', name: 'HubSpot', categories: ['saas'], kind: 'saas', description: 'CRM y marketing para pymes: contactos, oportunidades y tickets accesibles para agentes.', url: 'https://www.hubspot.com' },
  { id: 'stripe', name: 'Stripe', categories: ['saas'], kind: 'saas', description: 'Pagos: clientes, facturas y reembolsos. Tiene servidor MCP oficial; sus acciones de escritura requieren mucho cuidado.', url: 'https://stripe.com' },
  { id: 'sentry', name: 'Sentry', categories: ['saas'], kind: 'saas', description: 'Errores y rendimiento de tus apps; con su servidor MCP un agente de código lee el stack trace real de un fallo.', url: 'https://sentry.io' },
]

export const TOOL_BY_ID: ReadonlyMap<string, Tool> = new Map(TOOLS.map((t) => [t.id, t]))

export function toolsInCategory(id: ToolCategoryId): Tool[] {
  return TOOLS.filter((t) => t.categories.includes(id))
}
