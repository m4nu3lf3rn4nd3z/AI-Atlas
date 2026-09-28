/* Data model of the security review module. */

export const OWASP_LLM = [
  { id: 'LLM01', title: 'Prompt Injection', es: 'Inyección de prompt', text: 'Entradas (directas o dentro de datos) que alteran el comportamiento del modelo contra la intención del sistema.' },
  { id: 'LLM02', title: 'Sensitive Information Disclosure', es: 'Divulgación de información sensible', text: 'El sistema revela datos personales, secretos, datos de otros usuarios o información propietaria.' },
  { id: 'LLM03', title: 'Supply Chain', es: 'Cadena de suministro', text: 'Modelos, datasets, dependencias, plugins o servicios de terceros comprometidos o vulnerables.' },
  { id: 'LLM04', title: 'Data and Model Poisoning', es: 'Envenenamiento de datos y modelos', text: 'Datos de entrenamiento, fine-tuning o embeddings manipulados para introducir sesgos, puertas traseras o fallos.' },
  { id: 'LLM05', title: 'Improper Output Handling', es: 'Manejo inadecuado de la salida', text: 'La salida del modelo se usa sin validar en navegadores, shells, bases de datos o APIs.' },
  { id: 'LLM06', title: 'Excessive Agency', es: 'Agencia excesiva', text: 'El sistema tiene más funciones, permisos o autonomía de los necesarios.' },
  { id: 'LLM07', title: 'System Prompt Leakage', es: 'Fuga del system prompt', text: 'El prompt de sistema se filtra y con él reglas, lógica o secretos que no deberían estar ahí.' },
  { id: 'LLM08', title: 'Vector and Embedding Weaknesses', es: 'Debilidades de vectores y embeddings', text: 'Fallos en la generación, almacenamiento o recuperación de embeddings: fugas entre tenants, envenenamiento, inversión.' },
  { id: 'LLM09', title: 'Misinformation', es: 'Desinformación', text: 'Contenido falso o engañoso presentado con autoridad, y la sobreconfianza que provoca.' },
  { id: 'LLM10', title: 'Unbounded Consumption', es: 'Consumo ilimitado', text: 'Uso sin límites que causa denegación de servicio, costes desbocados o extracción del modelo.' },
] as const

export type OwaspId = (typeof OWASP_LLM)[number]['id']

export const ZONES = [
  { id: 'untrusted', title: 'Entradas no confiables', text: 'Todo lo que llega de fuera: el usuario y cualquier contenido que el modelo lea.' },
  { id: 'app', title: 'Aplicación y orquestación', text: 'Tu código: prompts, bucle del agente, memoria, aprobaciones.' },
  { id: 'model', title: 'Modelo', text: 'El LLM y su proveedor. No es una frontera de seguridad.' },
  { id: 'action', title: 'Herramientas y acción', text: 'Donde el sistema produce efectos en el mundo.' },
  { id: 'data', title: 'Datos e identidad', text: 'Índices, credenciales, logs y trazas.' },
  { id: 'platform', title: 'Plataforma y suministro', text: 'Pesos, dependencias, entrenamiento, infraestructura y costes.' },
] as const

export type ZoneId = (typeof ZONES)[number]['id']

export type Severity = 'critical' | 'high' | 'medium'

export const SEVERITY: Record<Severity, { label: string; color: string; rank: number }> = {
  critical: { label: 'Crítica', color: 'var(--bad)', rank: 0 },
  high: { label: 'Alta', color: 'var(--warn)', rank: 1 },
  medium: { label: 'Media', color: 'var(--l2)', rank: 2 },
}

export const ATTACK_CATEGORIES = [
  { id: 'injection', title: 'Inyección de instrucciones' },
  { id: 'jailbreak', title: 'Evasión de salvaguardas' },
  { id: 'exfiltration', title: 'Exfiltración y fugas' },
  { id: 'agency', title: 'Abuso de herramientas y agentes' },
  { id: 'output', title: 'Manejo inseguro de salidas' },
  { id: 'poisoning', title: 'Envenenamiento' },
  { id: 'supply-chain', title: 'Cadena de suministro' },
  { id: 'identity', title: 'Identidad y sesiones' },
  { id: 'infra', title: 'Infraestructura y canales laterales' },
  { id: 'availability', title: 'Consumo y disponibilidad' },
  { id: 'trust', title: 'Confianza y desinformación' },
] as const

export type AttackCategoryId = (typeof ATTACK_CATEGORIES)[number]['id']

export interface Reference {
  title: string
  url?: string
}

export interface Attack {
  id: string
  title: string
  category: AttackCategoryId
  severity: Severity
  /** Mechanism, in technical terms. */
  how: string
  /** A concrete, realistic example. */
  example: string
  impact: string
  surfaces: string[]
  owasp: OwaspId[]
  mitigations: string[]
  refs?: Reference[]
}

export type ControlKind = 'prevent' | 'detect' | 'respond'

export interface Surface {
  id: string
  n: number
  zone: ZoneId
  title: string
  short: string
  /** What lives on this surface in a real system. */
  includes: string[]
  /** Why it is exposed. */
  exposure: string
  controls: { kind: ControlKind; text: string }[]
  /** Questions a security architect must be able to answer. */
  review: string[]
  concepts: string[]
  cases: string[]
}

export interface ChecklistSection {
  id: string
  title: string
  items: { id: string; text: string; critical?: boolean }[]
}
