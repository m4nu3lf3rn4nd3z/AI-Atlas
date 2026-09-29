import type { ComponentType } from 'react'
import {
  ChatBasicDiagram,
  RagPipelineDiagram,
  AgentReactDiagram,
  MultiAgentDiagram,
  EvalPipelineDiagram,
  ProdGatewayDiagram,
} from './ArchDiagram'

export type ArchCategory = 'basic' | 'rag' | 'agent' | 'production'

export interface ArchComponent {
  name: string
  role: string
}

export interface Architecture {
  id: string
  title: string
  subtitle: string
  category: ArchCategory
  description: string
  components: ArchComponent[]
  useCases: string[]
  tradeoffs: string[]
  relatedConceptIds: string[]
  Diagram: ComponentType
}

export const ARCH_CATEGORIES: Record<ArchCategory, { label: string; color: string }> = {
  basic:      { label: 'Básico',      color: 'var(--l0)' },
  rag:        { label: 'RAG',         color: 'var(--l4)' },
  agent:      { label: 'Agentes',     color: 'var(--l6)' },
  production: { label: 'Producción',  color: 'var(--l7)' },
}

export const ARCHITECTURES: Architecture[] = [
  {
    id: 'chat-basic',
    title: 'Chat con LLM',
    subtitle: 'El patrón más simple: prompt → LLM → respuesta',
    category: 'basic',
    description:
      'El bloque fundamental de cualquier aplicación con LLMs. La aplicación envía un system prompt con instrucciones globales y el mensaje del usuario; el modelo devuelve un completion. Toda la inteligencia reside en el modelo, no en la infraestructura.',
    components: [
      { name: 'System Prompt',  role: 'Define el comportamiento, tono y restricciones del modelo para todas las conversaciones' },
      { name: 'LLM API',        role: 'Modelo fundacional (Claude, GPT-4o, Gemini…) que genera el completion a partir del contexto' },
      { name: 'Historial',      role: 'Conversaciones previas que se concatenan al prompt para mantener coherencia multi-turno' },
    ],
    useCases: [
      'Chatbots de soporte con instrucciones fijas',
      'Asistentes de escritura y edición',
      'Generación de contenido con guía de estilo',
      'Resúmenes y clasificación de texto',
    ],
    tradeoffs: [
      'Sencillez vs. conocimiento actualizado: el modelo no accede a datos en tiempo real',
      'La longitud del contexto es limitada: conversaciones largas requieren truncado o resumen',
      'Coste proporcional a tokens de entrada + salida en cada turno',
    ],
    relatedConceptIds: ['llm-sampling', 'context-window', 'prompt-engineering', 'structured-outputs'],
    Diagram: ChatBasicDiagram,
  },
  {
    id: 'rag-pipeline',
    title: 'RAG Pipeline',
    subtitle: 'Retrieval-Augmented Generation: LLM + base de conocimiento externa',
    category: 'rag',
    description:
      'Patrón estándar para dar al modelo acceso a información específica sin reentrenarlo. El corpus se indexa offline como vectores; en cada consulta se recuperan los fragmentos más relevantes y se inyectan en el prompt junto con la pregunta.',
    components: [
      { name: 'Chunker',       role: 'Divide documentos en fragmentos de tamaño óptimo para recuperación y ajuste al contexto' },
      { name: 'Embedder',      role: 'Convierte texto en vectores densos de alta dimensión que capturan significado semántico' },
      { name: 'Vector DB',     role: 'Índice ANN (HNSW, IVF) para búsqueda de fragmentos similares en milisegundos a escala' },
      { name: 'Context Builder', role: 'Ensambla los top-K fragmentos recuperados + la query en el prompt final para el LLM' },
      { name: 'LLM',           role: 'Genera una respuesta fundamentada solo en los fragmentos recuperados (con citas opcionales)' },
    ],
    useCases: [
      'QA sobre documentación interna o bases de conocimiento',
      'Asistente legal/médico con corpus especializado',
      'Chatbot de soporte técnico con knowledge base actualizada',
      'Búsqueda semántica aumentada con lenguaje natural',
    ],
    tradeoffs: [
      'Calidad del chunking y el modelo de embedding determinan el techo de rendimiento',
      'Búsqueda densa sola puede fallar con términos exactos: combinar con BM25 (híbrida + RRF)',
      'Latencia añadida por el paso de recuperación (~50-200 ms según el índice)',
    ],
    relatedConceptIds: ['rag-architecture', 'chunking', 'embedding-models', 'ann-indexes', 'vector-databases', 'hybrid-search'],
    Diagram: RagPipelineDiagram,
  },
  {
    id: 'agent-react',
    title: 'Agente ReAct',
    subtitle: 'LLM como motor de razonamiento en un bucle de herramientas',
    category: 'agent',
    description:
      'El modelo razona en pasos (Thought → Action → Observation) hasta completar la tarea. En cada paso puede llamar herramientas externas (APIs, bases de datos, intérprete de código) y observar sus resultados antes de decidir qué hacer a continuación.',
    components: [
      { name: 'LLM',           role: 'Razona sobre el estado actual, decide qué acción tomar y cuándo emitir la respuesta final' },
      { name: 'Ejecutor',      role: 'Recibe la llamada estructurada del modelo, la valida, ejecuta la herramienta y devuelve el resultado' },
      { name: 'API externa',   role: 'Herramienta que permite al agente obtener datos en tiempo real (búsqueda, calendario, clima…)' },
      { name: 'Base de datos', role: 'Herramienta de lectura/escritura para persistir estado o consultar información estructurada' },
      { name: 'Código / shell', role: 'Intérprete que ejecuta código generado por el modelo en un sandbox aislado' },
    ],
    useCases: [
      'Agente de investigación que busca, lee y sintetiza fuentes',
      'Copiloto de código que edita archivos, ejecuta tests y corrige errores',
      'Asistente de datos que escribe SQL, ejecuta consultas y explica resultados',
      'Agente de automatización de tareas (email, calendario, CRM)',
    ],
    tradeoffs: [
      'Los bucles largos acumulan tokens y coste: usar modelos pequeños para pasos intermedios',
      'Sin límite de pasos el agente puede quedar en bucles infinitos: imponer max_iterations',
      'La latencia crece con cada paso de herramienta: evaluar cuándo basta una sola llamada',
    ],
    relatedConceptIds: ['tool-calling', 'agentic-loop', 'mcp', 'code-agents', 'agent-frameworks'],
    Diagram: AgentReactDiagram,
  },
  {
    id: 'multi-agent',
    title: 'Sistema multi-agente',
    subtitle: 'Varios agentes especializados coordinados por un orquestador',
    category: 'agent',
    description:
      'El orquestador descompone la tarea en subtareas y las delega a agentes especializados que trabajan en paralelo o en secuencia. Un agregador sintetiza los outputs parciales en una respuesta coherente.',
    components: [
      { name: 'Orchestrator',  role: 'LLM que analiza la tarea, decide qué agentes invocar, en qué orden y cómo combinar sus outputs' },
      { name: 'Agente A/B/C',  role: 'Agente especializado con su propio prompt, herramientas y contexto limitado a su dominio' },
      { name: 'Agregador',     role: 'Combina y sintetiza los resultados parciales, resolviendo conflictos y asegurando coherencia' },
    ],
    useCases: [
      'Pipeline de investigación: agente de búsqueda + agente de análisis + agente de redacción',
      'Revisión de código: agente de seguridad + agente de estilo + agente de tests',
      'Generación de informes: agentes por sección trabajando en paralelo',
      'Sistemas de IA conversacional con especialidades (facturación, soporte, ventas)',
    ],
    tradeoffs: [
      'La latencia total es la suma de los pasos críticos, no de todos (paralelismo reduce)',
      'Más agentes = más puntos de fallo y más difícil de depurar: preferir pocos, bien definidos',
      'El orquestador puede volverse cuello de botella si tiene contexto demasiado grande',
    ],
    relatedConceptIds: ['multi-agent', 'agent-frameworks', 'agentic-loop', 'tool-calling'],
    Diagram: MultiAgentDiagram,
  },
  {
    id: 'eval-pipeline',
    title: 'Pipeline de evaluación',
    subtitle: 'LLM-as-judge + métricas para medir calidad del sistema',
    category: 'production',
    description:
      'Proceso sistemático para medir la calidad de un sistema LLM. Un conjunto de test inputs con respuestas de referencia se pasa al sistema; otro LLM actúa como juez comparando predicciones con el ground truth y asignando puntuaciones por criterio.',
    components: [
      { name: 'Test inputs',   role: 'Dataset de preguntas/tareas curado para cubrir casos representativos y casos límite' },
      { name: 'Ground truth',  role: 'Respuestas ideales anotadas por humanos o generadas con un modelo de referencia de alta calidad' },
      { name: 'LLM Pipeline',  role: 'El sistema bajo evaluación: puede ser un simple prompt, RAG, agente o cualquier combinación' },
      { name: 'LLM Judge',     role: 'Modelo separado (a veces más potente) que puntúa cada respuesta según criterios: fidelidad, relevancia, corrección' },
      { name: 'Score / Report', role: 'Métricas agregadas (precisión, recall, faithfulness) con ejemplos de fallos para guiar mejoras' },
    ],
    useCases: [
      'Comparar versiones de un sistema (A/B eval) antes de desplegar',
      'Detección de regresiones en CI/CD al cambiar prompts o modelos',
      'Benchmarking de modelos para elegir el más adecuado para el caso',
      'Monitorización continua de calidad en producción (online eval)',
    ],
    tradeoffs: [
      'El juez LLM introduce su propio sesgo: usar múltiples jueces o criterios explícitos',
      'Ground truth caro de construir: empezar con subset pequeño y crecer con casos fallidos',
      'Métricas automáticas nunca sustituyen la evaluación humana para casos críticos',
    ],
    relatedConceptIds: ['evals', 'llm-judge', 'observability'],
    Diagram: EvalPipelineDiagram,
  },
  {
    id: 'prod-gateway',
    title: 'Gateway de producción',
    subtitle: 'Infraestructura de borde: autenticación, caché, guardrails y observabilidad',
    category: 'production',
    description:
      'Capa de infraestructura que envuelve el LLM en producción. Controla quién puede llamar al modelo, filtra entradas y salidas peligrosas, reutiliza respuestas cacheadas para reducir coste y latencia, y emite trazas para observabilidad.',
    components: [
      { name: 'Auth / Rate Limiter', role: 'Autentica la solicitud y aplica cuotas por usuario/tenant para evitar abuso y gestionar costes' },
      { name: 'Input Guardrail',    role: 'Detecta y bloquea contenido nocivo, prompt injection, PII y solicitudes fuera de política antes de llegar al LLM' },
      { name: 'Semantic Cache',     role: 'Busca en caché por similitud semántica: si una pregunta parecida ya fue respondida, reutiliza el resultado' },
      { name: 'LLM Cluster',        role: 'Pool de instancias del modelo con load balancer, failover y escalado automático según demanda' },
      { name: 'Output Guardrail',   role: 'Filtra respuestas del modelo que contengan información sensible, alucinaciones detectables o contenido nocivo' },
      { name: 'OTel / Logs',        role: 'Emite spans con prompt, tokens, latencia, modelo y coste hacia tu plataforma de observabilidad (LangSmith, Arize…)' },
    ],
    useCases: [
      'API de LLM multi-tenant con billing por uso',
      'Aplicación de empresa con datos sensibles (PII, secretos comerciales)',
      'Servicio de alto tráfico donde la caché reduce coste >30%',
      'Plataforma regulada (salud, finanzas) que requiere auditoría completa',
    ],
    tradeoffs: [
      'Cada capa añade latencia (10-50 ms): evaluar qué guardrails son imprescindibles',
      'La caché semántica puede devolver respuestas obsoletas si el conocimiento cambia',
      'Los guardrails de ML tienen tasa de falsos positivos: ajustar umbrales por caso de uso',
    ],
    relatedConceptIds: ['guardrails', 'prompt-injection', 'observability', 'evals', 'owasp-llm'],
    Diagram: ProdGatewayDiagram,
  },
]

export const ARCH_BY_ID = Object.fromEntries(ARCHITECTURES.map((a) => [a.id, a]))
