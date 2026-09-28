import { Telescope } from 'lucide-react'
import type { UseCase } from '../types'
import fanoutSnippet from './snippets/deep_research_fanout.py?raw'

const json = (v: unknown) => JSON.stringify(v, null, 2)

export const deepResearch: UseCase = {
  id: 'deep-research',
  title: 'Investigación profunda multi-agente',
  tagline: 'Un agente planificador reparte la investigación entre subagentes que buscan y leen en paralelo; un crítico revisa el informe antes de entregarlo.',
  icon: Telescope,
  level: 3,
  examples: ['Informes de mercado y competencia', 'Due diligence técnica', 'Revisiones de literatura', 'Comparativas de proveedores'],
  problem:
    'Una pregunta abierta («¿qué nos conviene?») exige consultar decenas de fuentes, cruzar datos y detectar lo que está desactualizado. Un solo agente se queda sin contexto y tarda mucho; varios agentes en paralelo, cada uno con su subtarea y su contexto, cubren más en menos tiempo, a cambio de muchos más tokens.',
  whenNot:
    'Preguntas con una respuesta concreta y reciente (basta una búsqueda) o tareas muy acopladas donde los subagentes necesitarían hablar constantemente entre sí.',
  concepts: ['multi-agent', 'workflow-patterns', 'agent-loop', 'computer-use', 'context-window', 'llm-as-judge', 'cost-latency-optimization'],
  patterns: ['supervisor', 'planner', 'critic', 'reflection'],
  scenario: {
    title: 'Local vs API',
    input: 'Para 2 millones de peticiones al mes, ¿nos sale más barato ejecutar un modelo abierto de 70B en nuestros servidores o usar una API?',
  },
  components: [
    { id: 'user', kind: 'user', label: 'Analista', role: 'Plantea la pregunta y recibe el informe.', tools: ['chainlit', 'streamlit'], col: 0, row: 0 },
    { id: 'lead', kind: 'planner', label: 'Agente líder', role: 'Descompone la pregunta, lanza subagentes y sintetiza el informe.', tools: ['langgraph', 'openai-agents-sdk', 'claude-agent-sdk'], col: 1, row: 0 },
    { id: 'notes', kind: 'memory', label: 'Notas compartidas', role: 'Los subagentes guardan hallazgos con su fuente; el líder no carga páginas enteras en su contexto.', tools: ['redis', 'langgraph-memory'], col: 1, row: 1 },
    { id: 'sa-api', kind: 'subagent', label: 'Subagente: precios de APIs', role: 'Busca precios actuales por millón de tokens.', tools: ['supervisor'], col: 2, row: 0 },
    { id: 'sa-gpu', kind: 'subagent', label: 'Subagente: coste de GPUs', role: 'Busca coste de alquiler y rendimiento de GPUs para 70B.', tools: ['supervisor'], col: 2, row: 1 },
    { id: 'sa-ops', kind: 'subagent', label: 'Subagente: coste de operación', role: 'Estima personas, monitorización y energía.', tools: ['supervisor'], col: 2, row: 2 },
    { id: 'browser', kind: 'browser', label: 'Navegador', role: 'Abre las páginas completas en lugar de fiarse del resumen del buscador.', tools: ['browserbase', 'playwright', 'browser-use'], col: 3, row: 0, when: { on: 'browser' } },
    { id: 'sandbox', kind: 'sandbox', label: 'Cálculos', role: 'Ejecuta el cálculo de costes en Python en lugar de hacerlo «de cabeza».', tools: ['e2b', 'pyodide'], col: 3, row: 1 },
    { id: 'critic', kind: 'evaluator', label: 'Crítico', role: 'Revisa cada cifra: fuente, fecha y coherencia con el resto.', tools: ['critic', 'reflection'], col: 3, row: 2, when: { on: 'critic' } },
    { id: 'tracer', kind: 'tracer', label: 'Trazas', role: 'Muestra qué hizo cada subagente y cuánto costó.', tools: ['langfuse', 'phoenix'], col: 0, row: 2 },
  ],
  flows: [
    { from: 'user', to: 'lead' },
    { from: 'lead', to: 'sa-api' },
    { from: 'lead', to: 'sa-gpu' },
    { from: 'lead', to: 'sa-ops' },
    { from: 'sa-api', to: 'browser', when: { on: 'browser' } },
    { from: 'sa-gpu', to: 'sandbox' },
    { from: 'sa-api', to: 'notes' },
    { from: 'sa-gpu', to: 'notes' },
    { from: 'sa-ops', to: 'notes' },
    { from: 'lead', to: 'critic', when: { on: 'critic' } },
    { from: 'lead', to: 'tracer' },
  ],
  toggles: [
    { id: 'parallel', label: 'Subagentes en paralelo', description: 'Los tres subagentes trabajan a la vez en lugar de uno detrás de otro.', concept: 'multi-agent' },
    { id: 'browser', label: 'Leer las páginas completas', description: 'Los subagentes abren cada fuente con un navegador en lugar de quedarse con el fragmento del buscador.', concept: 'computer-use' },
    { id: 'critic', label: 'Crítico', description: 'Un agente revisa fuentes, fechas y cifras del borrador antes de entregarlo.', concept: 'llm-as-judge' },
    { id: 'budget', label: 'Presupuesto por subagente', description: 'Cada subagente tiene un límite de pasos y tokens y debe devolver lo que tenga al llegar a él.', concept: 'cost-latency-optimization' },
  ],
  presets: [
    { id: 'naive', label: 'Ingenuo', description: 'Secuencial, sin navegador, sin crítico ni límites.', toggles: { parallel: false, browser: false, critic: false, budget: false } },
    { id: 'recommended', label: 'Recomendado', description: 'Paralelo, lectura completa, crítico y presupuesto.', toggles: { parallel: true, browser: true, critic: true, budget: true } },
  ],
  steps: [
    { id: 'ask', component: 'user', title: 'Pregunta', detail: 'Una pregunta abierta con muchos factores y datos que cambian rápido.', payload: { lang: 'text', content: 'Para 2 millones de peticiones al mes, ¿nos sale más barato un modelo abierto de 70B en nuestros servidores o usar una API?' }, ms: 0 },
    { id: 'plan', component: 'lead', title: 'Plan y reparto', detail: 'El líder descompone la pregunta en tres líneas de investigación independientes.', payload: { lang: 'json', content: json([{ subagente: 'precios de APIs', objetivo: 'precio actual por millón de tokens (entrada y salida)' }, { subagente: 'coste de GPUs', objetivo: 'GPUs y horas necesarias para servir un 70B con esta carga' }, { subagente: 'coste de operación', objetivo: 'personas, monitorización y energía' }]) }, ms: 3500, llm: { tier: 'large', input: 1500, output: 600 } },
    { id: 'api-snippet', component: 'sa-api', title: 'Precios de APIs (fragmentos del buscador)', detail: 'El primer resultado es un artículo de 2024 con precios que ya no existen. El fragmento del buscador no muestra la fecha.', payload: { lang: 'text', content: 'Resultado 1 · «Comparativa de precios de LLMs» · …modelos grandes desde 15 $ por millón de tokens de entrada…' }, ms: 6000, llm: { tier: 'small', input: 9000, output: 500 }, toolCall: true, parallel: 'sub', parallelWhen: { on: 'parallel' }, status: 'warn', when: { off: 'browser' } },
    { id: 'api-browser', component: 'browser', title: 'Precios de APIs (páginas completas)', detail: 'Abre la página de precios del proveedor. El subagente anota el precio y la fecha, y marca como obsoleto el artículo de 2024.', payload: { lang: 'json', content: json([{ fuente: 'página oficial de precios', fecha: '2026-09', dato: 'precio actual por millón de tokens', fiable: true }, { fuente: 'artículo de blog', fecha: '2024-03', dato: 'precios antiguos', fiable: false, nota: 'desactualizado' }]) }, ms: 14000, llm: { tier: 'small', input: 26000, output: 900 }, toolCall: true, parallel: 'sub', parallelWhen: { on: 'parallel' }, when: { on: 'browser' } },
    { id: 'gpu', component: 'sa-gpu', title: 'Coste de GPUs', detail: 'Calcula en Python las GPUs necesarias para servir la carga con cuantización a 8 bits y un margen para picos.', payload: { lang: 'python', content: 'peticiones_mes = 2_000_000\ntokens_por_peticion = 1_500\ntokens_mes = peticiones_mes * tokens_por_peticion   # 3.000 M\n# → 2 GPUs de 80 GB en alquiler 24/7, con margen para picos' }, ms: 11000, llm: { tier: 'small', input: 14000, output: 800 }, toolCall: true, parallel: 'sub', parallelWhen: { on: 'parallel' } },
    { id: 'ops-tangent', component: 'sa-ops', title: 'Coste de operación… y una tangente', detail: 'Sin límites, el subagente se entretiene leyendo 14 páginas sobre refrigeración líquida de centros de datos.', payload: { lang: 'text', content: 'paso 23/∞ · leyendo «Refrigeración líquida directa al chip: guía completa»…' }, ms: 38000, llm: { tier: 'small', input: 120000, output: 3000 }, toolCall: true, parallel: 'sub', parallelWhen: { on: 'parallel' }, status: 'warn', when: { off: 'budget' } },
    { id: 'ops-budget', component: 'sa-ops', title: 'Coste de operación', detail: 'Con un límite de 8 pasos, el subagente se centra: personas, monitorización y energía, con fuentes.', payload: { lang: 'json', content: json({ pasos: '8/8', hallazgos: ['0,5 personas de plataforma', 'monitorización y guardias', 'energía incluida en el alquiler'] }) }, ms: 9000, llm: { tier: 'small', input: 16000, output: 900 }, toolCall: true, parallel: 'sub', parallelWhen: { on: 'parallel' }, when: { on: 'budget' } },
    { id: 'sequential-note', component: 'lead', title: 'Esperando a los subagentes', detail: 'En modo secuencial, cada subagente empieza cuando termina el anterior.', ms: 0, status: 'warn', when: { off: 'parallel' } },
    { id: 'draft', component: 'lead', title: 'Borrador del informe', detail: 'El líder sintetiza las notas. Si el precio de 2024 llegó a las notas, la conclusión se inclina hacia lo local.', payload: { lang: 'text', content: 'Conclusión preliminar: con 2 M de peticiones al mes, el despliegue propio es un 40 % más barato que la API…' }, ms: 5000, llm: { tier: 'large', input: 12000, output: 1500 } },
    { id: 'critic-stale', component: 'critic', title: 'Revisión crítica: dato sin verificar', detail: 'El crítico ve que el precio de la API sale de un fragmento sin fecha y no puede comprobarlo: lo marca como «no verificado» y rebaja la conclusión.', payload: { lang: 'json', content: json({ afirmación: 'precio de la API: 15 $/M', fuente: 'fragmento de buscador', fecha: 'desconocida', veredicto: 'no verificable', acción: 'marcar y suavizar la conclusión' }) }, ms: 4000, llm: { tier: 'large', input: 14000, output: 700 }, status: 'warn', when: { all: [{ on: 'critic' }, { off: 'browser' }] } },
    { id: 'critic-ok', component: 'critic', title: 'Revisión crítica', detail: 'Cruza cada cifra con su fuente y su fecha, y detecta que el borrador mezclaba un precio antiguo que el subagente ya había marcado como obsoleto. Pide corregirlo.', payload: { lang: 'json', content: json({ cifras_revisadas: 9, problemas: [{ afirmación: 'un 40 % más barato en local', causa: 'usa el precio de 2024 marcado como obsoleto', acción: 'recalcular con el precio actual' }] }) }, ms: 4000, llm: { tier: 'large', input: 16000, output: 800 }, when: { all: [{ on: 'critic' }, { on: 'browser' }] } },
    { id: 'rewrite', component: 'lead', title: 'Informe corregido', detail: 'Con el precio actual, la API resulta más barata a este volumen; el despliegue propio compensa a partir de otro volumen o por requisitos de privacidad.', payload: { lang: 'text', content: 'Conclusión: a 2 M de peticiones al mes, la API es más barata cuando se cuentan operación y márgenes. El despliegue propio compensa por privacidad o con más volumen (ver sensibilidad).' }, ms: 5000, llm: { tier: 'large', input: 15000, output: 1600 }, status: 'ok', when: { all: [{ on: 'critic' }, { on: 'browser' }] } },
    { id: 'deliver', component: 'user', title: 'Entrega del informe', detail: 'El informe llega con fuentes enlazadas… y con la calidad que hayan permitido las decisiones de diseño.', ms: 0 },
    { id: 'trace', component: 'tracer', title: 'Traza multi-agente', detail: 'Tokens y tiempo por subagente: aquí se ve si alguno se desvió.', ms: 5 },
  ],
  outcomes: [
    { when: { all: [{ on: 'critic' }, { on: 'browser' }] }, verdict: 'success', title: 'Informe correcto y con fuentes verificadas', text: 'Los subagentes leyeron las fuentes completas y anotaron las fechas; el crítico detectó la cifra antigua y el informe se corrigió.', lesson: 'Profundidad (leer de verdad) y verificación (un crítico con criterios) se complementan: el dato bueno sirve de poco si nadie comprueba el borrador.' },
    { when: { on: 'critic' }, verdict: 'partial', title: 'Conclusión prudente, pero sin respuesta', text: 'El crítico detectó que el precio no se podía verificar y suavizó la conclusión. No es un error, pero tampoco responde a la pregunta.', lesson: 'Un crítico no puede crear información que nadie recuperó. Con fragmentos del buscador, lo máximo que puede hacer es desconfiar.' },
    { when: { on: 'browser' }, verdict: 'failure', title: 'El dato bueno estaba en las notas… y nadie lo miró', text: 'El subagente marcó el artículo de 2024 como obsoleto, pero el líder usó igualmente su cifra al redactar. Sin revisión, el error llega al informe.', lesson: 'En sistemas multi-agente, la información se degrada al pasar de un agente a otro. Hace falta un paso explícito de verificación.' },
    { verdict: 'failure', title: 'Recomendación equivocada con un precio de 2024', text: 'El informe concluye que lo local es un 40 % más barato usando un precio que ya no existe. Está bien redactado, lo que lo hace más peligroso.', lesson: 'Los fragmentos del buscador no llevan fecha ni contexto. Para datos que cambian, lee la fuente y verifica.' },
  ],
  notes: [
    { when: { off: 'budget' }, text: 'Sin presupuesto, un subagente gastó 120.000 tokens en una tangente sobre refrigeración: casi la mitad del coste total.' },
    { when: { off: 'parallel' }, text: 'En secuencia, el tiempo total es la suma de los tres subagentes; en paralelo, el del más lento.' },
    { when: { all: [{ on: 'parallel' }, { on: 'browser' }] }, text: 'Los sistemas multi-agente gastan muchos más tokens que un chat, y leer páginas completas también tiene su coste. Compensa cuando la pregunta lo merece.' },
  ],
  stacks: [
    {
      name: 'Orquestación propia',
      description: 'Control total del grafo, el estado y los límites.',
      picks: [
        { component: 'lead', tools: ['langgraph'], note: 'fan-out con Send, estado compartido' },
        { component: 'browser', tools: ['browserbase', 'playwright'] },
        { component: 'sandbox', tools: ['e2b'] },
        { component: 'notes', tools: ['langgraph-memory', 'redis'] },
        { component: 'tracer', tools: ['langfuse'] },
      ],
    },
    {
      name: 'SDK de agentes',
      description: 'Menos código: subagentes y handoffs incluidos.',
      picks: [
        { component: 'lead', tools: ['openai-agents-sdk', 'claude-agent-sdk', 'crewai'] },
        { component: 'browser', tools: ['browser-use'] },
        { component: 'tracer', tools: ['phoenix', 'langsmith'] },
      ],
    },
  ],
  risks: [
    { title: 'Coste explosivo', text: 'Cada subagente consume su propio contexto; el total multiplica el de un chat normal.', mitigation: 'Presupuestos por subagente, modelos pequeños para leer y el grande solo para planificar y sintetizar.' },
    { title: 'Fuentes poco fiables o desactualizadas', text: 'Blogs antiguos, contenido generado por IA, páginas sin fecha.', mitigation: 'Registrar fuente y fecha de cada dato, priorizar fuentes primarias y un crítico que lo compruebe.' },
    { title: 'Inyección desde webs', text: 'Una página puede contener instrucciones para el agente que la lee.', mitigation: 'Navegador aislado, subagentes sin herramientas de escritura y el contenido web tratado como no confiable.' },
    { title: 'Trabajo duplicado o contradictorio', text: 'Subagentes con objetivos mal delimitados investigan lo mismo o se contradicen.', mitigation: 'Instrucciones de subtarea precisas, con objetivo, formato de salida y límites.' },
  ],
  metrics: [
    { name: 'Afirmaciones con fuente verificable', why: 'El indicador principal de fiabilidad del informe.' },
    { name: 'Cobertura de las subpreguntas', why: '¿Respondió el informe a todo lo que planteaba la pregunta?' },
    { name: 'Coste y tiempo por informe', why: 'Y su reparto por subagente, para detectar tangentes.' },
    { name: 'Correcciones del crítico', why: 'Si nunca corrige nada, el crítico no está aportando.' },
  ],
  snippets: [
    { title: 'Fan-out de subagentes con LangGraph (Send)', lang: 'python', code: fanoutSnippet, deps: { langgraph: '>=0.3' }, verifiedAt: '2026-09', note: 'Esqueleto del patrón: planificar, lanzar en paralelo y reunir resultados. Las funciones de investigación son ficticias.' },
  ],
}
