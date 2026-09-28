import type { Reference } from './types'

/* Principles, secure design patterns, real incidents and frameworks. */

export const PRINCIPLES = [
  { title: 'El modelo no es una frontera de seguridad', text: 'Cualquier texto que llegue al contexto puede cambiar su comportamiento. Diseña asumiendo que, a veces, obedecerá a un atacante, y que eso no debe tener consecuencias graves.' },
  { title: 'Todo contenido es no confiable', text: 'La entrada del usuario, pero también documentos, webs, emails, resultados de herramientas y mensajes de otros agentes.' },
  { title: 'La autorización vive fuera del modelo', text: 'El LLM propone; tu código decide si esa acción está permitida para ese usuario, con su identidad y sus permisos.' },
  { title: 'Mínimo privilegio y mínima agencia', text: 'Solo las herramientas, permisos y autonomía que necesita cada tarea, durante el tiempo que la necesita.' },
  { title: 'La salida del modelo también es no confiable', text: 'Antes de llegar a un navegador, una base de datos, una shell o una API, se valida y se codifica como cualquier entrada externa.' },
  { title: 'Personas en las decisiones irreversibles', text: 'Pagos, envíos, borrados y publicaciones requieren confirmación con los parámetros reales a la vista.' },
  { title: 'Aislar la ejecución y controlar la salida', text: 'Código y navegadores en entornos sin credenciales y con la red saliente cerrada por defecto.' },
  { title: 'Defensa en profundidad y trazabilidad', text: 'Varias capas independientes, cada una imperfecta, y trazas suficientes para reconstruir cualquier incidente.' },
]

export const PATTERNS: { id: string; title: string; text: string; tradeoff: string; refs?: Reference[] }[] = [
  {
    id: 'action-selector',
    title: 'Action-Selector',
    text: 'El modelo solo elige entre un conjunto fijo de acciones predefinidas, sin leer después los resultados. Una inyección no tiene dónde apoyarse.',
    tradeoff: 'Muy seguro, poco flexible: vale para asistentes que traducen una petición en una acción conocida.',
  },
  {
    id: 'plan-then-execute',
    title: 'Plan-Then-Execute',
    text: 'El agente fija el plan (qué herramientas y en qué orden) antes de leer cualquier contenido no confiable. Los datos pueden alterar los parámetros, pero no añadir acciones nuevas.',
    tradeoff: 'Evita que una inyección añada acciones como «enviar email», pero no que manipule los datos que se usan en el plan.',
  },
  {
    id: 'map-reduce',
    title: 'LLM Map-Reduce',
    text: 'Cada documento no confiable lo procesa una instancia aislada que devuelve una salida muy restringida (un número, un booleano, un JSON con esquema); un agente principal combina esos resultados sin ver el texto original.',
    tradeoff: 'Ideal para clasificar o extraer de muchos documentos; no sirve cuando hace falta razonar sobre el texto completo.',
  },
  {
    id: 'dual-llm',
    title: 'Dual LLM',
    text: 'Un LLM privilegiado, que tiene herramientas, nunca ve contenido no confiable; un LLM en cuarentena lo procesa y devuelve referencias simbólicas ($VAR1) que el privilegiado maneja sin leer su contenido.',
    tradeoff: 'Separa bien instrucciones y datos, pero complica el diseño y el contenido en cuarentena puede seguir engañando al usuario final.',
    refs: [{ title: 'Simon Willison (2023) · The Dual LLM pattern', url: 'https://simonwillison.net/2023/Apr/25/dual-llm-pattern/' }],
  },
  {
    id: 'code-then-execute',
    title: 'Code-Then-Execute (CaMeL)',
    text: 'El modelo escribe un programa a partir de la petición del usuario; un intérprete lo ejecuta siguiendo el flujo de datos y aplicando políticas de capacidades: un dato que viene de una fuente no confiable no puede acabar en un destino no autorizado.',
    tradeoff: 'Garantías fuertes y verificables, a cambio de un sistema más complejo y de menos flexibilidad.',
    refs: [{ title: 'Debenedetti et al. (2025) · Defeating Prompt Injections by Design (CaMeL)', url: 'https://arxiv.org/abs/2503.18813' }],
  },
  {
    id: 'context-minimization',
    title: 'Minimización del contexto',
    text: 'Eliminar del contexto la petición original del usuario, o el contenido no confiable, una vez usado, para que no pueda influir en pasos posteriores.',
    tradeoff: 'Barato y eficaz en flujos por etapas; reduce la información disponible para las etapas siguientes.',
  },
  {
    id: 'spotlighting',
    title: 'Spotlighting y jerarquía de instrucciones',
    text: 'Marcar el contenido externo (delimitadores, datamarking, codificación) y usar modelos entrenados para dar prioridad al sistema sobre el usuario y sobre los datos.',
    tradeoff: 'Reduce mucho la tasa de éxito de las inyecciones, pero es probabilístico: nunca como única defensa.',
    refs: [
      { title: 'Hines et al. (2024) · Spotlighting', url: 'https://arxiv.org/abs/2403.14720' },
      { title: 'Wallace et al. (2024) · The Instruction Hierarchy', url: 'https://arxiv.org/abs/2404.13208' },
    ],
  },
  {
    id: 'break-trifecta',
    title: 'Romper la trifecta',
    text: 'Separar en tareas o sesiones distintas el acceso a datos privados, la exposición a contenido no confiable y la capacidad de comunicar hacia fuera. La «regla de dos» de Meta formaliza lo mismo: como máximo dos de las tres propiedades sin supervisión humana.',
    tradeoff: 'La regla más simple de aplicar en revisión de arquitectura; exige renunciar a agentes «que lo hacen todo».',
    refs: [
      { title: 'Simon Willison (2025) · The lethal trifecta for AI agents', url: 'https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/' },
      { title: 'Meta AI (2025) · Agents Rule of Two', url: 'https://ai.meta.com/blog/practical-ai-agent-security/' },
    ],
  },
]

export const PATTERNS_SOURCE: Reference = {
  title: 'Beurer-Kellner et al. (2025) · Design Patterns for Securing LLM Agents against Prompt Injections',
  url: 'https://arxiv.org/abs/2506.08837',
}

export const INCIDENTS: { year: string; title: string; text: string; lesson: string; ref?: Reference }[] = [
  { year: '2023', title: 'Inyección indirecta en asistentes de búsqueda', text: 'Investigadores demostraron que páginas web podían controlar a asistentes con navegación (Bing Chat) mediante instrucciones ocultas.', lesson: 'Cualquier contenido que el modelo lea es un vector.', ref: { title: 'arXiv 2302.12173', url: 'https://arxiv.org/abs/2302.12173' } },
  { year: '2023', title: 'Código fuente pegado en un chatbot público', text: 'Empleados de una gran empresa tecnológica pegaron código y notas internas en ChatGPT; la empresa restringió el uso de IA generativa.', lesson: 'La fuga más común es la voluntaria: hacen falta políticas y alternativas aprobadas.' },
  { year: '2023', title: 'Ejecución de código en LangChain', text: 'Cadenas que evaluaban expresiones generadas por el modelo permitían ejecutar código arbitrario mediante prompts.', lesson: 'La salida del modelo nunca debe llegar a eval().', ref: { title: 'CVE-2023-29374', url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-29374' } },
  { year: '2024', title: 'Una política inventada, en los tribunales', text: 'Un tribunal canadiense obligó a una aerolínea a respetar una política de reembolso que había inventado su chatbot.', lesson: 'La empresa responde de lo que dice su IA.' },
  { year: '2024', title: 'Memoria GPU compartida (LeftoverLocals)', text: 'En varias GPUs, un proceso podía leer la memoria local que otro había dejado sin borrar, incluidas respuestas de un LLM.', lesson: 'La infraestructura compartida también es superficie de ataque.', ref: { title: 'CVE-2023-4969', url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-4969' } },
  { year: '2024', title: 'Plantillas de chat maliciosas en modelos GGUF', text: 'Una plantilla Jinja incrustada en el fichero de un modelo permitía ejecutar código al cargarlo con llama-cpp-python.', lesson: 'Cargar un modelo es ejecutar código de terceros.', ref: { title: 'CVE-2024-34359', url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-34359' } },
  { year: '2024', title: 'Spyware en la memoria de un asistente', text: 'Una inyección conseguía guardar instrucciones en la memoria a largo plazo del asistente y exfiltrar datos en todas las conversaciones posteriores.', lesson: 'La memoria persistente convierte una inyección puntual en permanente.', ref: { title: 'Embrace The Red', url: 'https://embracethered.com/blog/posts/2024/chatgpt-macos-app-persistent-data-exfiltration/' } },
  { year: '2025', title: 'Tool poisoning en MCP', text: 'Se demostró que las descripciones de herramientas de un servidor MCP malicioso podían hacer que el agente leyera y enviara ficheros privados.', lesson: 'Instalar un servidor MCP es darle voz en el prompt.', ref: { title: 'Invariant Labs', url: 'https://invariantlabs.ai/blog/mcp-security-notification-tool-poisoning-attacks' } },
  { year: '2025', title: 'Repositorios privados filtrados vía GitHub MCP', text: 'Un issue malicioso en un repositorio público hacía que un agente con acceso a repos privados publicara su contenido.', lesson: 'Datos privados + contenido no confiable + canal de salida = la trifecta.', ref: { title: 'Invariant Labs', url: 'https://invariantlabs.ai/blog/mcp-github-vulnerability' } },
  { year: '2025', title: 'EchoLeak: exfiltración «zero-click» en un copiloto', text: 'Un email con instrucciones ocultas hacía que el asistente incluyera datos internos en una URL de imagen que el cliente cargaba solo.', lesson: 'El renderizado de Markdown es un canal de exfiltración.', ref: { title: 'CVE-2025-32711', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-32711' } },
  { year: '2025', title: 'Inyección de comandos en un cliente MCP', text: 'Una herramienta muy usada para conectar clientes con servidores MCP remotos permitía que un servidor malicioso ejecutara comandos en la máquina del usuario.', lesson: 'Las integraciones jóvenes tienen vulnerabilidades clásicas.', ref: { title: 'CVE-2025-6514', url: 'https://nvd.nist.gov/vuln/detail/CVE-2025-6514' } },
]

export const FRAMEWORKS: { title: string; text: string; url: string }[] = [
  { title: 'OWASP Top 10 for LLM Applications (2025)', text: 'El catálogo de referencia de riesgos de aplicaciones con LLM, con escenarios y mitigaciones.', url: 'https://genai.owasp.org/llm-top-10/' },
  { title: 'OWASP GenAI Security Project', text: 'Guías complementarias, incluidas las específicas de aplicaciones agénticas y red teaming.', url: 'https://genai.owasp.org' },
  { title: 'MITRE ATLAS', text: 'Matriz de tácticas y técnicas adversarias contra sistemas de IA, al estilo ATT&CK, con casos reales.', url: 'https://atlas.mitre.org' },
  { title: 'NIST AI RMF y perfil de IA generativa (AI 600-1)', text: 'Marco de gestión de riesgos de IA y su perfil específico para IA generativa.', url: 'https://www.nist.gov/itl/ai-risk-management-framework' },
  { title: 'Google SAIF', text: 'Marco de Google para IA segura: controles por capas y mapa de riesgos.', url: 'https://saif.google' },
  { title: 'ISO/IEC 42001', text: 'Norma de sistemas de gestión de IA: gobierno, riesgos y controles certificables.', url: 'https://www.iso.org/standard/81230.html' },
  { title: 'Reglamento europeo de IA (AI Act)', text: 'Obligaciones por nivel de riesgo, con requisitos de ciberseguridad, robustez y documentación.', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj' },
  { title: 'MCP · Security Best Practices', text: 'Ataques y mitigaciones específicos de MCP: confused deputy, token passthrough, SSRF, sesiones, servidores locales.', url: 'https://modelcontextprotocol.io/specification/2025-06-18/basic/security_best_practices' },
]

export const REDTEAM_TOOLS: { name: string; text: string; url: string }[] = [
  { name: 'promptfoo', text: 'Red teaming automatizado con plugins para inyección, exfiltración, agencia excesiva y más; integrable en CI.', url: 'https://www.promptfoo.dev' },
  { name: 'garak', text: 'Escáner de vulnerabilidades de LLMs de NVIDIA: sondas para jailbreaks, fugas, alucinaciones y codificaciones.', url: 'https://github.com/NVIDIA/garak' },
  { name: 'PyRIT', text: 'Framework de Microsoft para automatizar ataques multi-turno y orquestar campañas de red teaming.', url: 'https://github.com/Azure/PyRIT' },
  { name: 'Inspect AI', text: 'Framework de evaluación del UK AI Security Institute, con suites de seguridad y agentes.', url: 'https://inspect.aisi.org.uk' },
]

export const THREAT_MODEL_STEPS = [
  { title: 'Inventario', text: 'Componentes, modelos, herramientas, servidores MCP, fuentes de datos y quién usa el sistema.' },
  { title: 'Flujos y fronteras', text: 'Diagrama de flujos de datos marcando dónde cambia el nivel de confianza.' },
  { title: 'Entradas no confiables', text: 'Todo texto, imagen o dato que llega al modelo y quién puede escribirlo.' },
  { title: 'Capacidades y radio de impacto', text: 'Qué puede hacer el sistema y lo peor que pasaría si el modelo obedeciera a un atacante.' },
  { title: 'Trifecta y regla de dos', text: 'Qué flujos combinan datos privados, contenido no confiable y salida externa; romperlos o añadir supervisión.' },
  { title: 'Controles y pruebas', text: 'Controles por superficie, red teaming y evals de seguridad en CI; revisión en cada cambio de modelo o herramienta.' },
]
