/* Knowledge base for the RAG lab: the help center of a fictional logistics
   company. Pure data, imported by the scripts that precompute embeddings
   and reranker scores. Some passages are deliberate traps: an outdated
   policy, codes that only lexical search matches well, paraphrases that
   only semantic search matches well. */

export interface Passage {
  id: string
  section: string
  title: string
  /** Last update (YYYY-MM). */
  updated: string
  /** Outdated documents stay in the index unless a metadata filter removes them. */
  outdated?: boolean
  text: string
}

export const PASSAGES: readonly Passage[] = [
  {
    id: 'env-plazos',
    section: 'Envíos',
    title: 'Plazos de entrega',
    updated: '2026-02',
    text: 'Los envíos a la Península se entregan en 24–48 horas laborables. A Baleares tardan de 3 a 4 días laborables y a Canarias, Ceuta y Melilla de 5 a 7, porque requieren un trámite aduanero (DUA) que gestionamos nosotros. Los envíos creados antes de las 14:00 salen del almacén el mismo día.',
  },
  {
    id: 'env-seguimiento',
    section: 'Envíos',
    title: 'Seguir un envío',
    updated: '2025-11',
    text: 'Cada envío tiene un número de seguimiento que empieza por NRT- seguido de 10 dígitos. Puedes consultarlo en la web o en la app, y el destinatario recibe un SMS o un correo cada vez que cambia el estado: recogido, en tránsito, en reparto y entregado.',
  },
  {
    id: 'env-incidencia',
    section: 'Envíos',
    title: 'Paquete dañado o perdido',
    updated: '2026-01',
    text: 'Si un paquete llega dañado, comunícalo en los 7 días naturales siguientes a la entrega, con fotos del embalaje y del contenido. Si no ha llegado 5 días laborables después de la fecha prevista, se considera extraviado. En ambos casos abrimos un expediente que se resuelve en un máximo de 10 días laborables, con una indemnización de hasta el valor declarado (3.000 € como máximo).',
  },
  {
    id: 'env-medidas',
    section: 'Envíos',
    title: 'Peso y medidas máximos',
    updated: '2025-06',
    text: 'Cada bulto puede pesar hasta 40 kg y medir hasta 180 cm de largo, con una suma de largo, ancho y alto de 300 cm como máximo. La mercancía que supere esos límites debe enviarse con el servicio de palé.',
  },
  {
    id: 'env-prohibidos',
    section: 'Envíos',
    title: 'Mercancías no admitidas',
    updated: '2025-09',
    text: 'No transportamos baterías de litio sueltas, líquidos inflamables, armas ni animales vivos. Los aparatos con la batería instalada, como móviles, portátiles o patinetes eléctricos, sí se admiten si el paquete lleva la etiqueta UN3481 y la batería no supera los 100 Wh.',
  },
  {
    id: 'env-internacional',
    section: 'Envíos',
    title: 'Envíos internacionales',
    updated: '2025-10',
    text: 'Dentro de la Unión Europea no hay trámites de aduana y la entrega tarda de 3 a 5 días laborables. Fuera de la UE hay que adjuntar una factura comercial con el código arancelario (HS) de cada producto. Los aranceles e impuestos los paga el destinatario, salvo que contrates la modalidad DDP.',
  },
  {
    id: 'dev-politica',
    section: 'Devoluciones',
    title: 'Política de devoluciones',
    updated: '2026-01',
    text: 'Tus clientes pueden devolver un pedido en los 14 días naturales siguientes a la recepción, siempre que el producto esté sin usar y con su etiqueta. La recogida a domicilio es gratuita. El reembolso se hace al mismo medio de pago en los 5 días laborables siguientes a la revisión del producto en el almacén.',
  },
  {
    id: 'dev-politica-2024',
    section: 'Devoluciones',
    title: 'Política de devoluciones (versión 2024)',
    updated: '2024-03',
    outdated: true,
    text: 'Los clientes disponen de 30 días naturales desde la recepción para devolver un pedido. El envío de vuelta corre a cargo del cliente, con una tarifa fija de 4,95 €. El reembolso se realiza en un plazo de 10 días laborables.',
  },
  {
    id: 'dev-cambio',
    section: 'Devoluciones',
    title: 'Cambios de talla o modelo',
    updated: '2025-12',
    text: 'Los cambios de talla, color o modelo no tienen coste si se piden dentro del plazo de devolución. Enviamos el artículo nuevo cuando recibimos el antiguo. Si hay prisa, puedes pedir un cambio anticipado: enviamos primero el nuevo y retenemos el importe en la tarjeta hasta recibir el original.',
  },
  {
    id: 'dev-excepciones',
    section: 'Devoluciones',
    title: 'Productos que no se pueden devolver',
    updated: '2025-12',
    text: 'No se aceptan devoluciones de productos personalizados, alimentos perecederos, software o videojuegos desprecintados ni artículos de higiene personal abiertos, como auriculares intraurales o cepillos de dientes.',
  },
  {
    id: 'fac-planes',
    section: 'Facturación',
    title: 'Planes y precios',
    updated: '2026-03',
    text: 'El plan Básico cuesta 49 € al mes e incluye hasta 300 envíos. El plan Pro cuesta 149 € al mes, incluye hasta 1.500 envíos y da acceso a la API y a los webhooks. El plan Empresa tiene precio a medida y un acuerdo de nivel de servicio (SLA) del 99,9 %. Los precios no incluyen IVA.',
  },
  {
    id: 'fac-facturas',
    section: 'Facturación',
    title: 'Descargar facturas',
    updated: '2025-07',
    text: 'Las facturas se emiten el día 1 de cada mes y se descargan en Ajustes › Facturación, en PDF o en formato Facturae para administraciones públicas.',
  },
  {
    id: 'fac-impago',
    section: 'Facturación',
    title: 'Pagos fallidos',
    updated: '2026-02',
    text: 'Si el cobro de la cuota falla, lo reintentamos a los 3 y a los 7 días y te avisamos por correo. Si a los 15 días sigue pendiente, la cuenta pasa a modo de solo lectura: no se pueden crear envíos nuevos, pero los que ya están en curso se entregan con normalidad.',
  },
  {
    id: 'fac-cambio-plan',
    section: 'Facturación',
    title: 'Cambiar de plan',
    updated: '2025-07',
    text: 'Puedes subir de plan en cualquier momento y el cambio es inmediato: solo pagas la parte proporcional del mes. Las bajadas de plan se aplican al comienzo del siguiente ciclo de facturación.',
  },
  {
    id: 'seg-2fa',
    section: 'Cuenta y seguridad',
    title: 'Verificación en dos pasos',
    updated: '2025-04',
    text: 'Desde 2025, la verificación en dos pasos es obligatoria para las cuentas con rol de administrador. Se puede usar una aplicación de códigos temporales (TOTP) o una llave de seguridad FIDO2. Los códigos por SMS no se admiten.',
  },
  {
    id: 'seg-roles',
    section: 'Cuenta y seguridad',
    title: 'Roles y permisos',
    updated: '2025-04',
    text: 'Hay cuatro roles: Administrador, Operador (crea y gestiona envíos), Finanzas (ve y descarga facturas) y Solo lectura. Asigna a cada persona el rol mínimo que necesite para su trabajo.',
  },
  {
    id: 'seg-acceso',
    section: 'Cuenta y seguridad',
    title: 'Recuperar el acceso',
    updated: '2025-08',
    text: 'El enlace para restablecer la contraseña caduca a los 30 minutos. Si has perdido el segundo factor de verificación, el equipo de soporte confirma tu identidad por videollamada antes de desactivarlo.',
  },
  {
    id: 'seg-datos',
    section: 'Cuenta y seguridad',
    title: 'Dónde se guardan los datos',
    updated: '2026-01',
    text: 'Los datos se alojan en centros de datos de Fráncfort y Madrid, dentro de la Unión Europea. Se cifran con AES-256 en reposo y con TLS 1.3 en tránsito, y la plataforma tiene la certificación ISO 27001. Los datos de los envíos se conservan 5 años por obligación fiscal.',
  },
  {
    id: 'api-errores',
    section: 'API e integraciones',
    title: 'Códigos de error de la API',
    updated: '2026-02',
    text: 'E-4001: la dirección está incompleta. E-4012: el código postal no corresponde a la provincia indicada. E-4090: el envío ya ha sido recogido y no se puede modificar. E-4290: se ha superado el límite de peticiones; espera los segundos que indica la cabecera Retry-After.',
  },
  {
    id: 'api-webhooks',
    section: 'API e integraciones',
    title: 'Webhooks',
    updated: '2025-10',
    text: 'Los webhooks notifican los eventos shipment.created, shipment.delivered y shipment.exception. Cada llamada incluye una firma HMAC-SHA256 del cuerpo en la cabecera X-Nortia-Signature, que debes verificar con tu secreto antes de procesarla. Si tu servidor no responde con 2xx, reintentamos durante 24 horas.',
  },
  {
    id: 'api-limites',
    section: 'API e integraciones',
    title: 'Límites de la API',
    updated: '2025-10',
    text: 'Cada clave de API puede hacer 600 peticiones por minuto. Al superar el límite, la API responde con el código 429 y la cabecera Retry-After.',
  },
  {
    id: 'api-shopify',
    section: 'API e integraciones',
    title: 'Integración con Shopify',
    updated: '2026-03',
    text: 'La aplicación oficial para Shopify importa los pedidos cada 5 minutos, genera las etiquetas automáticamente y te deja asociar cada método de envío de tu tienda a un servicio de Nortia.',
  },
  {
    id: 'api-sandbox',
    section: 'API e integraciones',
    title: 'Entorno de pruebas',
    updated: '2025-10',
    text: 'El entorno sandbox (sandbox.nortia.example) funciona igual que producción, pero no genera recogidas reales ni cobros. Sus claves empiezan por sk_test_.',
  },
  {
    id: 'alm-recepcion',
    section: 'Almacén',
    title: 'Enviar stock al almacén',
    updated: '2025-05',
    text: 'Para enviar mercancía a nuestro almacén hay que pedir cita con al menos 48 horas de antelación. Cada palé debe llevar una etiqueta SSCC. El inventario está disponible para vender en las 24 horas siguientes a la recepción.',
  },
  {
    id: 'alm-alertas',
    section: 'Almacén',
    title: 'Stock mínimo y alertas',
    updated: '2025-05',
    text: 'Puedes fijar un stock mínimo para cada referencia (SKU). Cuando las existencias bajan de ese umbral, te enviamos un aviso por correo para que repongas a tiempo.',
  },
  {
    id: 'alm-tarifas',
    section: 'Almacén',
    title: 'Tarifas de almacenaje',
    updated: '2026-03',
    text: 'El almacenaje cuesta 12 € por palé y mes. La preparación de pedidos (picking) cuesta 0,45 € por línea. En el plan Pro, el primer mes de almacenaje es gratis.',
  },
  {
    id: 'sop-horario',
    section: 'Soporte',
    title: 'Horario de atención',
    updated: '2025-09',
    text: 'El equipo de soporte atiende por el chat del panel de lunes a viernes de 8:00 a 20:00 y los sábados de 9:00 a 14:00. Las incidencias urgentes de los clientes del plan Empresa se atienden 24 horas.',
  },
]

export type QuestionKind = 'paraphrase' | 'exact' | 'trap' | 'unanswerable' | 'direct'

export const QUESTION_KINDS: Record<QuestionKind, string> = {
  direct: 'Directa',
  paraphrase: 'Con otras palabras',
  exact: 'Código exacto',
  trap: 'Documento obsoleto',
  unanswerable: 'Sin respuesta',
}

export interface RagQuestion {
  q: string
  kind: QuestionKind
  /** Passages that contain the answer. Empty when the knowledge base cannot answer. */
  gold: string[]
  /** Reference answer, written by hand. */
  answer: string
}

export const QUESTIONS: readonly RagQuestion[] = [
  {
    q: '¿Cuántos días tienen mis clientes para devolver un pedido?',
    kind: 'trap',
    gold: ['dev-politica'],
    answer: '14 días naturales desde la recepción, con el producto sin usar y con etiqueta. (La versión de 2024 decía 30 días: ya no está vigente.)',
  },
  {
    q: '¿Puedo mandar de vuelta algo que ya no quiero?',
    kind: 'paraphrase',
    gold: ['dev-politica'],
    answer: 'Sí: dentro de los 14 días naturales siguientes a la recepción, sin usar y con etiqueta. La recogida es gratuita.',
  },
  {
    q: '¿Qué significa el error E-4012?',
    kind: 'exact',
    gold: ['api-errores'],
    answer: 'Que el código postal no corresponde a la provincia indicada.',
  },
  {
    q: 'Me ha llegado la caja rota, ¿qué hago?',
    kind: 'paraphrase',
    gold: ['env-incidencia'],
    answer: 'Comunícalo en los 7 días naturales siguientes a la entrega, con fotos del embalaje y del contenido. Se abre un expediente que se resuelve en 10 días laborables como máximo.',
  },
  {
    q: '¿Cuánto tarda un paquete en llegar a Tenerife?',
    kind: 'paraphrase',
    gold: ['env-plazos'],
    answer: 'De 5 a 7 días laborables: Tenerife está en Canarias, que requiere trámite aduanero (DUA).',
  },
  {
    q: '¿Puedo enviar un patinete eléctrico con la batería puesta?',
    kind: 'direct',
    gold: ['env-prohibidos'],
    answer: 'Sí, si el paquete lleva la etiqueta UN3481 y la batería no supera los 100 Wh.',
  },
  {
    q: 'Me han rechazado la tarjeta, ¿se van a quedar parados mis envíos?',
    kind: 'paraphrase',
    gold: ['fac-impago'],
    answer: 'No de inmediato: el cobro se reintenta a los 3 y 7 días. A los 15 días la cuenta pasa a solo lectura, pero los envíos en curso se entregan igualmente.',
  },
  {
    q: '¿Cómo compruebo que un webhook viene realmente de Nortia?',
    kind: 'direct',
    gold: ['api-webhooks'],
    answer: 'Verificando con tu secreto la firma HMAC-SHA256 del cuerpo que llega en la cabecera X-Nortia-Signature.',
  },
  {
    q: '¿Es obligatorio activar el doble factor?',
    kind: 'paraphrase',
    gold: ['seg-2fa'],
    answer: 'Sí para las cuentas de administrador desde 2025, con una app TOTP o una llave FIDO2 (no por SMS).',
  },
  {
    q: '¿Mis datos salen de Europa?',
    kind: 'direct',
    gold: ['seg-datos'],
    answer: 'No: se alojan en Fráncfort y Madrid, dentro de la UE.',
  },
  {
    q: '¿Cuánto cuesta guardar un palé al mes?',
    kind: 'direct',
    gold: ['alm-tarifas'],
    answer: '12 € por palé y mes (el primer mes es gratis en el plan Pro).',
  },
  {
    q: '¿Puedo probar la integración sin generar envíos de verdad?',
    kind: 'paraphrase',
    gold: ['api-sandbox'],
    answer: 'Sí, con el entorno sandbox (sandbox.nortia.example) y claves que empiezan por sk_test_.',
  },
  {
    q: '¿Qué plan necesito para usar la API?',
    kind: 'direct',
    gold: ['fac-planes'],
    answer: 'El plan Pro (149 € al mes) o superior: el Básico no incluye la API.',
  },
  {
    q: 'Quiero cambiar unas zapatillas por una talla más',
    kind: 'paraphrase',
    gold: ['dev-cambio'],
    answer: 'El cambio es gratuito dentro del plazo de devolución; también puedes pedir un cambio anticipado.',
  },
  {
    q: '¿Qué indica el código E-4090?',
    kind: 'exact',
    gold: ['api-errores'],
    answer: 'Que el envío ya ha sido recogido y no se puede modificar.',
  },
  {
    q: '¿Hacéis entregas con drones?',
    kind: 'unanswerable',
    gold: [],
    answer: 'La base de conocimiento no dice nada sobre drones. Un buen sistema responde que no tiene esa información en lugar de inventarla.',
  },
]

/** Text indexed for each passage (title gives context to the body). */
export const passageText = (p: Passage) => `${p.title}. ${p.text}`
