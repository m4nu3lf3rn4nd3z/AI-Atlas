import { ReceiptText } from 'lucide-react'
import type { UseCase } from '../types'
import temporalSnippet from './snippets/invoice_workflow.py?raw'

const json = (v: unknown) => JSON.stringify(v, null, 2)

const OK_EXTRACT = { any: [{ on: 'structured' }, { on: 'retry' }] }
const STUCK = { all: [{ off: 'structured' }, { off: 'retry' }] }

export const invoiceAutomation: UseCase = {
  id: 'invoice-automation',
  title: 'Automatización de facturas con humano en el bucle',
  tagline: 'Procesa las facturas que llegan por email: extrae los datos, valida, pide aprobación cuando hay riesgo y registra el pago sin duplicados aunque algo falle.',
  icon: ReceiptText,
  level: 2,
  examples: ['Cuentas a pagar', 'Alta de clientes y KYC', 'Gestión de reclamaciones de seguros', 'Pedidos recibidos por email'],
  problem:
    'Cada factura llega en un formato distinto, pero hay que extraer siempre los mismos campos, validarlos y actuar en otros sistemas. Un LLM extrae muy bien de documentos desordenados; el reto es todo lo que lo rodea: garantizar el formato, repetir si falla, pedir permiso antes de mover dinero y no hacer nada dos veces.',
  whenNot:
    'Si recibes siempre la misma plantilla de pocos proveedores, una extracción con reglas o la factura electrónica estructurada es más barata y exacta.',
  concepts: ['structured-outputs', 'tool-calling', 'workflow-patterns', 'stateful-graphs', 'multimodality', 'guardrails', 'observability'],
  patterns: ['retry-loop', 'human-in-the-loop', 'router'],
  scenario: {
    title: 'FAC-2026-0917',
    input: 'Email de facturacion@suministros-norte.es con la factura FAC-2026-0917 en PDF: 12.400,00 €. El IBAN del pie no coincide con el que tenemos registrado para este proveedor.',
  },
  components: [
    { id: 'inbox', kind: 'api', label: 'Buzón de facturas', role: 'Recibe los emails con facturas adjuntas y genera un evento por cada una.', tools: ['gmail'], col: 0, row: 0 },
    { id: 'queue', kind: 'queue', label: 'Cola', role: 'Guarda los eventos hasta que alguien los procesa.', tools: ['rabbitmq', 'kafka', 'nats'], col: 1, row: 0 },
    { id: 'orchestrator', kind: 'workflow', label: 'Orquestador', role: 'Ejecuta los pasos. Con ejecución duradera guarda el progreso y lo reanuda tras un fallo.', tools: ['temporal', 'inngest', 'restate', 'hatchet'], col: 2, row: 0 },
    { id: 'parser', kind: 'parser', label: 'Parser de PDF', role: 'Convierte el PDF en texto con tablas.', tools: ['llamaparse', 'unstructured'], col: 3, row: 0 },
    { id: 'extractor', kind: 'llm', label: 'LLM extractor', role: 'Extrae proveedor, número, fechas, importes e IBAN.', tools: ['structured-outputs', 'pydantic-ai', 'json-schema'], col: 4, row: 0 },
    { id: 'validator', kind: 'evaluator', label: 'Validador', role: 'Comprueba el esquema y las reglas de negocio; si fallan, reintenta pasando el error.', tools: ['retry-loop', 'json-schema'], col: 4, row: 1, when: { on: 'retry' } },
    { id: 'rules', kind: 'router', label: 'Reglas de riesgo', role: 'Decide si la factura puede pagarse sola o necesita a una persona.', tools: ['router'], col: 3, row: 1 },
    { id: 'approval', kind: 'hitl', label: 'Aprobación en Slack', role: 'Una persona aprueba o rechaza, con los datos y las alertas a la vista.', tools: ['slack', 'teams'], col: 2, row: 1, when: { on: 'approval' } },
    { id: 'payments', kind: 'api', label: 'ERP y pagos', role: 'Registra la factura y ordena el pago.', tools: ['stripe', 'salesforce'], col: 1, row: 1 },
    { id: 'db', kind: 'database', label: 'Contabilidad', role: 'Estado de cada factura y registro de auditoría.', tools: ['postgresql'], col: 0, row: 1 },
    { id: 'tracer', kind: 'tracer', label: 'Trazas', role: 'Cada extracción, validación y decisión, con su coste.', tools: ['langfuse', 'helicone'], col: 4, row: 2 },
  ],
  flows: [
    { from: 'inbox', to: 'queue' },
    { from: 'queue', to: 'orchestrator' },
    { from: 'orchestrator', to: 'parser' },
    { from: 'parser', to: 'extractor' },
    { from: 'extractor', to: 'validator', when: { on: 'retry' } },
    { from: 'validator', to: 'rules', when: { on: 'retry' } },
    { from: 'extractor', to: 'rules', when: { off: 'retry' } },
    { from: 'rules', to: 'approval', when: { on: 'approval' } },
    { from: 'approval', to: 'payments', when: { on: 'approval' } },
    { from: 'rules', to: 'payments', when: { off: 'approval' } },
    { from: 'payments', to: 'db' },
  ],
  toggles: [
    { id: 'structured', label: 'Salidas estructuradas', description: 'La API garantiza que la respuesta cumple el JSON Schema de la factura, en lugar de pedir «responde en JSON» en el prompt.', concept: 'structured-outputs' },
    { id: 'retry', label: 'Validar y reintentar', description: 'Si el JSON o las reglas de negocio fallan, se reintenta pasando el error al modelo.', concept: 'structured-outputs' },
    { id: 'approval', label: 'Aprobación humana', description: 'Importes altos o cambios de IBAN esperan a que una persona apruebe en Slack.', concept: 'guardrails' },
    { id: 'durable', label: 'Ejecución duradera', description: 'Workflow con estado persistente y claves de idempotencia: un reinicio reanuda sin repetir pasos.', concept: 'stateful-graphs' },
  ],
  presets: [
    { id: 'script', label: 'Script rápido', description: 'Un worker, un prompt y a pagar.', toggles: { structured: false, retry: false, approval: false, durable: false } },
    { id: 'recommended', label: 'Recomendado', description: 'Estructurado, validado, aprobado y duradero.', toggles: { structured: true, retry: true, approval: true, durable: true } },
  ],
  steps: [
    { id: 'email', component: 'inbox', title: 'Llega una factura', detail: 'Un email con un PDF adjunto de un proveedor habitual.', payload: { lang: 'text', content: 'De: facturacion@suministros-norte.es\nAsunto: Factura FAC-2026-0917\nAdjunto: FAC-2026-0917.pdf (212 KB)' }, ms: 0 },
    { id: 'enqueue', component: 'queue', title: 'Evento en la cola', detail: 'El trabajo queda desacoplado del email: si el sistema está ocupado, espera.', payload: { lang: 'json', content: json({ evento: 'factura.recibida', id: 'inv_4821' }) }, ms: 20 },
    { id: 'start-durable', component: 'orchestrator', title: 'Inicio del workflow duradero', detail: 'Cada paso completado queda registrado; el id del workflow impide procesar dos veces la misma factura.', payload: { lang: 'json', content: json({ workflow_id: 'factura-inv_4821', estado: 'en curso', pasos_completados: [] }) }, ms: 40, when: { on: 'durable' } },
    { id: 'start-worker', component: 'orchestrator', title: 'Un worker toma el mensaje', detail: 'El worker procesa todo de corrido y confirma (ack) al final. Si se cae antes, el mensaje vuelve a la cola.', payload: { lang: 'json', content: json({ worker: 'w-3', mensaje: 'inv_4821', ack: 'al terminar' }) }, ms: 10, when: { off: 'durable' } },
    { id: 'parse', component: 'parser', title: 'PDF → texto', detail: 'Se conservan las tablas: líneas, base imponible, IVA y total.', payload: { lang: 'text', content: '| Concepto            | Cant. | Precio   | Importe    |\n| Tubería PEAD 90 mm  | 400   | 21,32 €  | 8.528,00 € |\n| Codos 90°           | 120   | 12,40 €  | 1.488,00 € |\nBase: 10.016,00 € · IVA 21 %: 2.103,36 € · Total: 12.119,36 €\n…(página 2) Portes: 280,64 € · TOTAL FACTURA: 12.400,00 €\nIBAN: ES76 **** **** **** **** 1332' }, ms: 2500 },
    { id: 'extract-structured', component: 'extractor', title: 'Extracción con salida estructurada', detail: 'La API obliga a cumplir el esquema: importes como números, fechas ISO, sin texto extra.', payload: { lang: 'json', content: json({ proveedor: 'Suministros Norte S.L.', numero: 'FAC-2026-0917', fecha: '2026-09-17', total: 12400.0, moneda: 'EUR', iban: 'ES76…1332' }) }, ms: 2800, llm: { tier: 'large', input: 3200, output: 180 }, status: 'ok', when: { on: 'structured' } },
    { id: 'extract-free', component: 'extractor', title: 'Extracción pidiendo «responde en JSON»', detail: 'El modelo responde casi en JSON: con un bloque de código, el importe como texto y un comentario. Casi.', payload: { lang: 'text', content: '```json\n{\n  "proveedor": "Suministros Norte S.L.",\n  "total": "12.400,00 €",   // total con portes\n  "iban": "ES76…1332"\n}\n```' }, ms: 2800, llm: { tier: 'large', input: 3100, output: 170 }, status: 'error', when: { off: 'structured' } },
    { id: 'validate-ok', component: 'validator', title: 'Validación de negocio', detail: 'El esquema es correcto y las cuentas cuadran: líneas + IVA + portes = total.', payload: { lang: 'json', content: json({ esquema: 'ok', suma_lineas: 'ok', fecha: 'ok', nif: 'ok' }) }, ms: 30, status: 'ok', when: { all: [{ on: 'retry' }, { on: 'structured' }] } },
    { id: 'validate-fail', component: 'validator', title: 'Validación: JSON inválido', detail: 'El parser falla por el bloque de código y el comentario. En lugar de romperse, se reintenta pasando el error al modelo.', payload: { lang: 'text', content: 'JSONDecodeError: Expecting value: line 1 column 1 (char 0)\n→ reintento 1/3 con el mensaje de error' }, ms: 20, status: 'warn', when: { all: [{ on: 'retry' }, { off: 'structured' }] } },
    { id: 'retry', component: 'extractor', title: 'Reintento con el error', detail: 'Con el error delante, el modelo devuelve JSON válido y el importe como número.', payload: { lang: 'json', content: json({ proveedor: 'Suministros Norte S.L.', total: 12400.0, iban: 'ES76…1332' }) }, ms: 2600, llm: { tier: 'large', input: 3500, output: 160 }, status: 'ok', when: { all: [{ on: 'retry' }, { off: 'structured' }] } },
    { id: 'crash-parse', component: 'orchestrator', title: 'Excepción al leer el JSON', detail: 'Sin validación ni reintento, el código revienta y el mensaje acaba en la cola de errores.', payload: { lang: 'text', content: 'Traceback (most recent call last):\n  …\njson.decoder.JSONDecodeError: Expecting value: line 1 column 1 (char 0)\n→ mensaje enviado a facturas.dead-letter' }, ms: 5, status: 'error', when: STUCK },
    { id: 'rules', component: 'rules', title: 'Reglas de riesgo', detail: 'Dos alertas: importe por encima del umbral y un IBAN distinto del registrado para este proveedor.', payload: { lang: 'json', content: json({ importe: 12400, umbral: 5000, supera_umbral: true, iban_registrado: '…7788', iban_factura: '…1332', iban_cambiado: true, decisión: 'requiere aprobación' }) }, ms: 15, status: 'warn', when: OK_EXTRACT },
    { id: 'ask-approval', component: 'approval', title: 'Solicitud en Slack', detail: 'El mensaje destaca el cambio de IBAN. Rebeca llama al proveedor al teléfono de siempre: no han cambiado de banco. Es un intento de fraude por suplantación (BEC).', payload: { lang: 'text', content: 'Factura FAC-2026-0917 · Suministros Norte S.L. · 12.400,00 €\n⚠ IBAN distinto del registrado (…7788 → …1332)\n[Aprobar]  [Rechazar]\n→ Rechazada por Rebeca: «confirmado por teléfono, no es su cuenta»' }, ms: 1_500_000, human: true, status: 'blocked', when: { all: [OK_EXTRACT, { on: 'approval' }] } },
    { id: 'redelivery', component: 'queue', title: 'La cola reentrega el mensaje', detail: 'El worker lleva 25 minutos esperando la aprobación sin confirmar el mensaje; el plazo de la cola expira y otro worker lo procesa de nuevo: segunda solicitud de aprobación.', ms: 20, status: 'warn', when: { all: [OK_EXTRACT, { on: 'approval' }, { off: 'durable' }] } },
    { id: 'pay', component: 'payments', title: 'Pago ordenado', detail: 'Nadie revisa el cambio de IBAN. Se pagan 12.400 € a la cuenta del estafador.', payload: { lang: 'json', content: json({ pago: 12400.0, iban: 'ES76…1332', estado: 'enviado' }) }, ms: 900, toolCall: true, status: 'error', when: { all: [OK_EXTRACT, { off: 'approval' }] } },
    { id: 'crash-resume', component: 'orchestrator', title: 'Reinicio y reanudación', detail: 'El proceso se reinicia tras un despliegue. El workflow retoma desde el último paso completado; la clave de idempotencia impide repetir el pago.', payload: { lang: 'json', content: json({ reanudado_en: 'registrar_contabilidad', 'registrar_pago': 'completado (clave inv_4821-pago)', repetido: false }) }, ms: 300, status: 'ok', when: { all: [OK_EXTRACT, { off: 'approval' }, { on: 'durable' }] } },
    { id: 'crash-dup', component: 'orchestrator', title: 'Reinicio antes de confirmar', detail: 'El worker se reinicia justo después de pagar y antes del ack. El mensaje vuelve a la cola y todo se repite.', payload: { lang: 'text', content: 'worker w-3 terminado (despliegue)\nmensaje inv_4821 sin ack → reentregado a w-5' }, ms: 300, status: 'error', when: { all: [OK_EXTRACT, { off: 'approval' }, { off: 'durable' }] } },
    { id: 'pay-again', component: 'payments', title: 'Segundo pago', detail: 'Otros 12.400 € a la misma cuenta. Nada en el sistema sabía que ya se había pagado.', payload: { lang: 'json', content: json({ pago: 12400.0, iban: 'ES76…1332', estado: 'enviado', nota: 'duplicado' }) }, ms: 900, toolCall: true, status: 'error', when: { all: [OK_EXTRACT, { off: 'approval' }, { off: 'durable' }] } },
    { id: 'record', component: 'db', title: 'Registro en contabilidad', detail: 'Estado final y registro de auditoría: quién decidió qué y cuándo.', payload: { lang: 'json', content: json({ factura: 'FAC-2026-0917', estado: 'según el resultado', auditoría: 'completa' }) }, ms: 40, when: OK_EXTRACT },
    { id: 'trace', component: 'tracer', title: 'Traza del proceso', detail: 'Extracciones, reintentos y decisiones quedan registrados para auditoría y evals.', ms: 5 },
  ],
  outcomes: [
    { when: STUCK, verdict: 'failure', title: 'La factura se queda atascada', text: 'El modelo devolvió «casi JSON» y, sin validación ni reintento, el proceso falló. Alguien la procesará a mano cuando vea la cola de errores.', lesson: 'Pedir «responde en JSON» no garantiza JSON. Usa salidas estructuradas y, además, valida las reglas de negocio con reintento.' },
    { when: { all: [{ off: 'approval' }, { off: 'durable' }] }, verdict: 'danger', title: 'Pago doble al estafador: 24.800 €', text: 'Nadie revisó el cambio de IBAN y, además, un reinicio hizo que el pago se repitiera.', lesson: 'Un IBAN cambiado es la estafa más común en cuentas a pagar. Y sin ejecución duradera ni idempotencia, un reinicio convierte un error en dos.' },
    { when: { off: 'approval' }, verdict: 'danger', title: 'Pago al IBAN fraudulento: 12.400 €', text: 'La ejecución duradera evitó el pago doble, pero no el fraude.', lesson: 'Las acciones irreversibles de importe alto necesitan a una persona, por muy bien que funcione la automatización.' },
    { when: { off: 'durable' }, verdict: 'partial', title: 'Fraude evitado, con aprobaciones duplicadas', text: 'La persona detectó el fraude, pero la espera dentro del worker hizo que la cola reentregara el mensaje y llegaran dos solicitudes.', lesson: 'Esperar a una persona dentro de un worker es frágil. Un workflow duradero espera una señal sin ocupar recursos ni reentregar mensajes.' },
    { verdict: 'success', title: 'Fraude detectado y nada duplicado', text: 'Extracción fiable, reglas de riesgo, una persona en el punto crítico y un workflow que no pierde ni repite pasos.', lesson: 'La IA hace la parte difícil (leer documentos desordenados); la ingeniería clásica (colas, workflows, idempotencia, aprobaciones) la hace segura.' },
  ],
  notes: [
    { when: { all: [{ off: 'structured' }, { on: 'retry' }] }, text: 'Hizo falta un reintento porque el primer JSON no era válido: una llamada más al modelo en cada factura con este problema.' },
  ],
  stacks: [
    {
      name: 'Open source autoalojado',
      description: 'Control total y datos en casa.',
      picks: [
        { component: 'orchestrator', tools: ['temporal'] },
        { component: 'queue', tools: ['rabbitmq'] },
        { component: 'parser', tools: ['unstructured'] },
        { component: 'extractor', tools: ['pydantic-ai', 'structured-outputs'] },
        { component: 'approval', tools: ['slack'] },
        { component: 'db', tools: ['postgresql'] },
        { component: 'tracer', tools: ['langfuse'] },
      ],
    },
    {
      name: 'Serverless',
      description: 'Sin servidores que mantener; pagas por ejecución.',
      picks: [
        { component: 'orchestrator', tools: ['inngest', 'trigger-dev'], note: 'eventos, pasos y esperas incluidos' },
        { component: 'parser', tools: ['llamaparse'] },
        { component: 'extractor', tools: ['structured-outputs'] },
        { component: 'approval', tools: ['teams', 'slack'] },
        { component: 'tracer', tools: ['helicone'] },
      ],
    },
  ],
  risks: [
    { title: 'Fraude por suplantación (BEC)', text: 'Emails que imitan a un proveedor para cambiar el IBAN.', mitigation: 'Regla dura: cualquier cambio de datos bancarios requiere verificación por un canal distinto.' },
    { title: 'Duplicados', text: 'Reintentos y reentregas pueden repetir acciones con dinero de por medio.', mitigation: 'Ejecución duradera y claves de idempotencia en cada llamada con efectos.' },
    { title: 'Datos personales', text: 'Facturas y emails contienen datos protegidos por el RGPD.', mitigation: 'Minimizar lo que se envía al modelo, contratos con el proveedor y retención limitada de trazas.' },
    { title: 'La extracción cambia con el modelo', text: 'Actualizar el modelo o el prompt puede empeorar campos concretos sin que nadie lo note.', mitigation: 'Un conjunto de facturas de referencia con sus valores correctos, evaluado en cada cambio.' },
    { title: 'Fatiga de aprobaciones', text: 'Si todo pide aprobación, la gente aprueba sin mirar.', mitigation: 'Umbrales calibrados y alertas específicas («IBAN cambiado») en lugar de «¿aprobar?».' },
  ],
  metrics: [
    { name: 'Facturas procesadas sin intervención', why: 'El ahorro real del sistema.' },
    { name: 'Exactitud por campo', why: 'Sobre un conjunto de referencia; el importe y el IBAN pesan más que la fecha.' },
    { name: 'Tiempo de ciclo', why: 'Desde que llega el email hasta que se registra.' },
    { name: 'Rechazos en la aprobación y su motivo', why: 'Si nunca se rechaza nada, sobran aprobaciones.' },
    { name: 'Duplicados', why: 'El objetivo es cero.' },
  ],
  snippets: [
    { title: 'Workflow duradero con Temporal + extracción estructurada', lang: 'python', code: temporalSnippet, deps: { temporalio: '>=1.7', anthropic: 'latest', pydantic: '>=2.0' }, verifiedAt: '2026-09', note: 'Faltan el worker y el cliente que arranca el workflow; el objetivo es mostrar la espera de la aprobación y la idempotencia.' },
  ],
}
