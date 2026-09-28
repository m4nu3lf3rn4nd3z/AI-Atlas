import type { ChecklistSection } from './types'

/* Architecture security review checklist for LLM applications and agents.
   Items marked critical are the ones that, if missing, usually lead to the
   worst incidents (data exfiltration, unauthorised actions, cross-tenant leaks). */

export const CHECKLIST: ChecklistSection[] = [
  {
    id: 'scope',
    title: 'Alcance y modelo de amenazas',
    items: [
      { id: 'scope-inventory', text: 'Existe un diagrama actualizado con componentes, flujos de datos y fronteras de confianza.', critical: true },
      { id: 'scope-inputs', text: 'Están enumeradas todas las fuentes de texto, imágenes o datos que llegan al modelo, y quién controla cada una.', critical: true },
      { id: 'scope-capabilities', text: 'Están enumeradas todas las capacidades con efectos (herramientas, envíos, escrituras, pagos, ejecución).', critical: true },
      { id: 'scope-trifecta', text: 'Se ha comprobado para cada flujo si combina datos privados, contenido no confiable y comunicación externa (trifecta letal).', critical: true },
      { id: 'scope-impact', text: 'Para cada capacidad está documentado el peor impacto si el modelo obedeciera a un atacante.' },
      { id: 'scope-data-class', text: 'Los datos que maneja el sistema están clasificados (públicos, internos, personales, sensibles).' },
      { id: 'scope-owner', text: 'Hay un responsable del riesgo y criterios de aceptación de riesgo residual.' },
    ],
  },
  {
    id: 'authz',
    title: 'Identidad y autorización',
    items: [
      { id: 'authz-outside', text: 'Todas las decisiones de autorización se toman en código, fuera del modelo.', critical: true },
      { id: 'authz-user-identity', text: 'Las herramientas actúan con la identidad y los permisos del usuario final (on-behalf-of), no con una cuenta de servicio omnipotente.', critical: true },
      { id: 'authz-no-passthrough', text: 'Ningún componente reenvía tokens que no fueron emitidos para él (sin token passthrough); se valida audiencia y emisor.', critical: true },
      { id: 'authz-scopes', text: 'Los scopes OAuth son mínimos y progresivos; nada de scopes comodín.' },
      { id: 'authz-short-lived', text: 'Los tokens son de corta duración y se pueden revocar de forma centralizada.' },
      { id: 'authz-sessions', text: 'Los IDs de sesión son aleatorios, ligados al usuario y no sustituyen a la autenticación.' },
      { id: 'authz-oauth-proxy', text: 'Los proxies OAuth piden consentimiento por cliente, validan redirect_uri de forma exacta y el parámetro state.' },
    ],
  },
  {
    id: 'prompts',
    title: 'Prompts, contexto y entradas',
    items: [
      { id: 'prompts-no-secrets', text: 'El system prompt no contiene secretos, credenciales ni lógica de autorización; se asume público.', critical: true },
      { id: 'prompts-untrusted-marked', text: 'El contenido externo entra marcado como datos (delimitado, con datamarking) y separado de las instrucciones.' },
      { id: 'prompts-sanitize', text: 'Las entradas se normalizan: se eliminan caracteres invisibles, Unicode tags, comentarios y metadatos.' },
      { id: 'prompts-min-context', text: 'Solo entra en el contexto la información necesaria para la tarea (minimización).' },
      { id: 'prompts-limits', text: 'Hay límites de longitud de entrada y de número de turnos acordes al caso de uso.' },
      { id: 'prompts-versioned', text: 'Los prompts están versionados, revisados y se despliegan como el código.' },
    ],
  },
  {
    id: 'tools',
    title: 'Herramientas y agencia',
    items: [
      { id: 'tools-least', text: 'Cada tarea expone solo las herramientas que necesita; se prefieren herramientas específicas a genéricas (shell, HTTP libre).', critical: true },
      { id: 'tools-hitl', text: 'Las acciones irreversibles o de alto impacto requieren confirmación humana con los parámetros reales.', critical: true },
      { id: 'tools-egress-allowlist', text: 'Las herramientas que comunican hacia fuera (email, HTTP, publicaciones) tienen allowlist de destinos.', critical: true },
      { id: 'tools-schema', text: 'Los argumentos se validan con esquemas estrictos antes de ejecutar; los errores no se ejecutan «a medias».' },
      { id: 'tools-idempotency', text: 'Las acciones con efectos son idempotentes (claves de idempotencia) y reversibles cuando es posible.' },
      { id: 'tools-results-minimal', text: 'Las herramientas devuelven solo los campos necesarios, sin datos sensibles de más.' },
      { id: 'tools-kill-switch', text: 'Se puede desactivar una herramienta o un agente al instante.' },
    ],
  },
  {
    id: 'agents',
    title: 'Agentes y orquestación',
    items: [
      { id: 'agents-control-flow', text: 'Donde es posible, el plan o flujo de control se fija antes de leer contenido no confiable (plan-then-execute, action-selector).', critical: true },
      { id: 'agents-budgets', text: 'Hay límites duros de pasos, tiempo, tokens y coste por tarea.' },
      { id: 'agents-inter-agent', text: 'La salida de otros agentes se trata como no confiable y se valida con esquema.' },
      { id: 'agents-privileges', text: 'Cada agente tiene privilegios distintos; ninguno que lea contenido externo tiene acceso directo a lo sensible.' },
      { id: 'agents-memory', text: 'La memoria persistente solo guarda hechos validados, con origen, visible y borrable por el usuario.' },
      { id: 'agents-a2a', text: 'Los agentes externos se autentican (Agent Cards firmadas, mTLS u OAuth).' },
    ],
  },
  {
    id: 'mcp',
    title: 'MCP y conectores',
    items: [
      { id: 'mcp-inventory', text: 'Hay inventario de servidores MCP por usuario o entorno, con origen y aprobador.', critical: true },
      { id: 'mcp-trusted', text: 'Solo se instalan servidores oficiales o revisados, con versiones fijadas y descripciones revisadas.', critical: true },
      { id: 'mcp-rugpull', text: 'Se detectan cambios en tools/list y se pide reaprobación.' },
      { id: 'mcp-local-consent', text: 'Configurar un servidor local muestra el comando completo y requiere consentimiento explícito; los servidores locales corren en sandbox.' },
      { id: 'mcp-transport', text: 'Los servidores locales usan stdio o, si usan HTTP, escuchan en loopback, validan Origin y exigen autenticación.' },
      { id: 'mcp-ssrf', text: 'Los clientes validan las URLs de OAuth (solo https, sin rangos privados ni javascript:) y no abren URLs mediante la shell.' },
      { id: 'mcp-namespaces', text: 'Las herramientas de distintos servidores están en espacios de nombres separados.' },
    ],
  },
  {
    id: 'rag',
    title: 'RAG y datos',
    items: [
      { id: 'rag-acl', text: 'La recuperación aplica los permisos del usuario en todos los caminos de consulta.', critical: true },
      { id: 'rag-tenant', text: 'El aislamiento entre tenants está impuesto en la capa de datos (colecciones separadas o row-level security) y probado.', critical: true },
      { id: 'rag-sources', text: 'Está controlado qué fuentes se indexan y quién puede escribir en ellas.' },
      { id: 'rag-provenance', text: 'Cada fragmento conserva procedencia, versión y fecha.' },
      { id: 'rag-vector-security', text: 'La base vectorial tiene autenticación, red privada y cifrado, como la base de datos original.' },
      { id: 'rag-deletion', text: 'Borrar un documento lo elimina también del índice, las cachés y las copias.' },
    ],
  },
  {
    id: 'output',
    title: 'Salidas',
    items: [
      { id: 'output-untrusted', text: 'La salida del modelo se trata como entrada no confiable en cada sistema que la consume.', critical: true },
      { id: 'output-no-remote-render', text: 'La interfaz no carga imágenes ni recursos remotos de las respuestas (o solo de dominios permitidos) y tiene CSP estricta.', critical: true },
      { id: 'output-parametrized', text: 'SQL parametrizado, comandos sin shell, rutas validadas, nada de eval() con texto generado.' },
      { id: 'output-structured', text: 'Donde se consume por máquinas, la salida es estructurada y se valida con esquema.' },
      { id: 'output-dlp', text: 'Hay detección de PII y secretos en las salidas.' },
      { id: 'output-links', text: 'Los enlaces muestran su destino real y no se generan vistas previas automáticas.' },
    ],
  },
  {
    id: 'exec',
    title: 'Ejecución de código y navegador',
    items: [
      { id: 'exec-sandbox', text: 'El código se ejecuta en microVMs o sandboxes sin privilegios, efímeros y sin credenciales.', critical: true },
      { id: 'exec-egress', text: 'La red saliente está denegada por defecto; sin acceso a metadatos de la nube ni a la red interna.', critical: true },
      { id: 'exec-limits', text: 'Hay límites de CPU, memoria, disco y tiempo.' },
      { id: 'exec-deps', text: 'Los agentes no instalan dependencias nuevas sin aprobación y usan registros internos.' },
      { id: 'exec-browser', text: 'El navegador del agente está aislado, sin sesiones personales, contraseñas ni autocompletado.' },
      { id: 'exec-browser-domains', text: 'Los agentes de navegador trabajan con listas de dominios permitidos por tarea.' },
    ],
  },
  {
    id: 'supply',
    title: 'Cadena de suministro',
    items: [
      { id: 'supply-formats', text: 'Solo se cargan modelos en formatos seguros (safetensors, GGUF de fuentes verificadas); nunca pickle de origen desconocido.', critical: true },
      { id: 'supply-remote-code', text: 'No se usa trust_remote_code, o se revisa y se fija el commit exacto.' },
      { id: 'supply-sbom', text: 'Hay SBOM de modelos, datasets, librerías y servidores, con hashes y versiones.' },
      { id: 'supply-scan', text: 'Se escanean dependencias y artefactos, y se siguen los avisos de seguridad de los frameworks.' },
      { id: 'supply-training-data', text: 'Los datos de fine-tuning tienen procedencia controlada y se evalúa el modelo resultante (seguridad y extracción).' },
    ],
  },
  {
    id: 'infra',
    title: 'Infraestructura',
    items: [
      { id: 'infra-endpoints', text: 'Ningún servidor de inferencia o base vectorial es accesible sin autenticación.', critical: true },
      { id: 'infra-keys-backend', text: 'Las claves de los proveedores solo existen en el backend o el gateway, nunca en el cliente.', critical: true },
      { id: 'infra-secrets-manager', text: 'Los secretos están en un gestor, con rotación y claves con presupuesto limitado.' },
      { id: 'infra-cache-isolation', text: 'Las cachés de prompts y los recursos de GPU están aislados por tenant.' },
      { id: 'infra-provider', text: 'Los proveedores de modelos tienen acuerdos de tratamiento, retención y región adecuados.' },
    ],
  },
  {
    id: 'availability',
    title: 'Consumo y disponibilidad',
    items: [
      { id: 'avail-limits', text: 'Hay límites por usuario de peticiones, tokens de entrada, max_tokens y coste.', critical: true },
      { id: 'avail-alerts', text: 'Hay alertas de gasto y cortes automáticos por presupuesto.' },
      { id: 'avail-loops', text: 'Los agentes y multi-agentes tienen protección contra bucles y reenvíos infinitos.' },
      { id: 'avail-fallbacks', text: 'Hay fallbacks ante caídas o rechazos del proveedor.' },
    ],
  },
  {
    id: 'observability',
    title: 'Observabilidad y privacidad',
    items: [
      { id: 'obs-traces', text: 'Se traza cada llamada al modelo y a herramientas con identidad, parámetros y resultado.', critical: true },
      { id: 'obs-masking', text: 'Las trazas enmascaran PII y secretos y tienen retención y acceso limitados.' },
      { id: 'obs-provenance', text: 'Se puede reconstruir qué contenido llevó al modelo a cada acción.' },
      { id: 'obs-alerts', text: 'Hay alertas por patrones de inyección, destinos externos nuevos y acciones inusuales.' },
      { id: 'obs-gdpr', text: 'Se cumplen los derechos de acceso y supresión en conversaciones, memoria, índices y trazas.' },
    ],
  },
  {
    id: 'testing',
    title: 'Pruebas y red teaming',
    items: [
      { id: 'test-redteam', text: 'Hay red teaming antes de cada lanzamiento, con inyección directa e indirecta, exfiltración y abuso de herramientas.', critical: true },
      { id: 'test-automated', text: 'Hay pruebas automáticas de seguridad en CI (promptfoo, garak, PyRIT o similares).' },
      { id: 'test-regression', text: 'Los evals de seguridad se repiten al cambiar modelo, prompt o herramientas.' },
      { id: 'test-tenant', text: 'Hay tests automáticos de aislamiento entre usuarios y tenants.' },
      { id: 'test-bounty', text: 'Hay un canal para reportar vulnerabilidades (y, si procede, bug bounty).' },
    ],
  },
  {
    id: 'response',
    title: 'Respuesta a incidentes y cumplimiento',
    items: [
      { id: 'resp-playbook', text: 'Hay un runbook para incidentes de IA: inyección explotada, fuga de datos, coste desbocado, respuesta dañina.', critical: true },
      { id: 'resp-revoke', text: 'Se pueden revocar tokens, desactivar herramientas y retirar fuentes del índice en minutos.' },
      { id: 'resp-notify', text: 'Está definido quién decide y cómo se notifica a usuarios y autoridades (RGPD).' },
      { id: 'resp-compliance', text: 'Se ha evaluado el encaje regulatorio (RGPD, AI Act, sectorial) y la documentación exigida.' },
    ],
  },
]

export const CHECKLIST_ITEMS = CHECKLIST.flatMap((s) => s.items.map((i) => ({ ...i, section: s.id })))
