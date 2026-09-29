/* Sample documents for the chunking lab. Each question's `answer` is an
   exact substring of the document: the span a chunk must contain for a
   retriever to hand the model the full answer. The company is fictional. */

export interface Question {
  q: string
  answer: string
}

export interface SampleDoc {
  id: string
  title: string
  kind: string
  text: string
  questions: Question[]
}

const POLICY = `# Política de vacaciones y ausencias

Esta política se aplica a toda la plantilla de Nortia Logística con contrato indefinido o temporal. Resume los derechos básicos y el procedimiento para pedir días libres. Si algún punto contradice el convenio colectivo, prevalece siempre el convenio.

## 1. Días de vacaciones

Cada persona dispone de 23 días laborables de vacaciones al año. A partir del quinto año de antigüedad se suman 2 días más, y a partir del décimo, 4 días. Los días se generan de forma proporcional al tiempo trabajado: quien se incorpora en julio tiene derecho a la mitad del total ese año.

Al menos 10 de los días de vacaciones deben disfrutarse de forma consecutiva entre junio y septiembre, salvo que el equipo necesite otra organización por picos de actividad.

## 2. Cómo pedir vacaciones

Las solicitudes se registran en el portal del empleado con al menos 15 días naturales de antelación. La persona responsable del equipo debe aprobarlas o rechazarlas en un plazo máximo de 5 días laborables; si no responde, la solicitud se considera aprobada.

En los periodos de inventario (la primera quincena de enero y la segunda de junio) solo se aprueban vacaciones en casos justificados.

## 3. Días no disfrutados

Se pueden trasladar al año siguiente hasta 5 días no disfrutados, que deberán usarse antes del 31 de marzo. Los días que superen ese límite o no se usen a tiempo se pierden, salvo baja médica o permiso por nacimiento durante el año.

## 4. Ausencias retribuidas

Además de las vacaciones, la empresa concede permisos retribuidos en estas situaciones:

- Matrimonio o registro como pareja de hecho: 15 días naturales.
- Mudanza de domicilio habitual: 1 día.
- Fallecimiento, accidente u hospitalización de un familiar de primer grado: 3 días, o 5 si hay que desplazarse a más de 200 km.
- Exámenes oficiales: el tiempo necesario para asistir.

Estos permisos deben justificarse con documentación en los 10 días siguientes.

## 5. Teletrabajo y desconexión

Durante las vacaciones nadie está obligado a responder correos ni llamadas. Si una urgencia exige contactar con alguien de vacaciones, debe autorizarlo la dirección del área y el tiempo dedicado se compensa con el doble de horas libres.
`

const API = `# API de pedidos v2

La API de pedidos permite crear, consultar y cancelar pedidos de forma programática. Todas las peticiones usan HTTPS y JSON, y la URL base es https://api.nortia.example/v2.

## Autenticación

Cada petición debe llevar una cabecera Authorization con un token de acceso: Authorization: Bearer <token>. Los tokens de acceso caducan a los 60 minutos. Para obtener uno nuevo sin pedir la contraseña otra vez, envía el refresh token a POST /oauth/token con grant_type=refresh_token.

Guarda los tokens en el servidor. Nunca los incluyas en el código de una aplicación web o móvil.

## Límites de uso

Cada clave puede hacer 600 peticiones por minuto. Si superas el límite, la API responde con el código 429 y la cabecera Retry-After, que indica cuántos segundos debes esperar antes de reintentar. Los clientes deben reintentar con espera exponencial y no en bucle.

Las operaciones de escritura tienen además un límite de 50 pedidos creados por minuto.

## Crear un pedido

Envía un POST /orders con el cliente y las líneas del pedido:

\`\`\`json
{
  "customer_id": "cus_8431",
  "lines": [
    { "sku": "PAL-EUR-120", "quantity": 4 },
    { "sku": "FLM-STR-500", "quantity": 12 }
  ],
  "delivery": { "date": "2026-10-14", "slot": "morning" }
}
\`\`\`

La respuesta incluye el id del pedido y su estado inicial, pending. Para evitar pedidos duplicados si reintentas, envía la cabecera Idempotency-Key con un valor único por pedido: la API devolverá el mismo resultado durante 24 horas.

## Listar pedidos

Las listas devuelven como máximo 100 elementos por página. Para pedir la siguiente página, pasa el valor de next_cursor de la respuesta en el parámetro cursor. Cuando next_cursor es null no hay más resultados.

Puedes filtrar por estado (status=pending, shipped o cancelled) y por fecha de creación con created_after.

## Errores

Los errores devuelven un objeto con code y message. Los más habituales son 400 (petición mal formada), 401 (token ausente o caducado), 404 (el pedido no existe) y 409 (el pedido ya no se puede modificar porque ha salido del almacén).
`

const HISTORY = `Durante años, el procesamiento del lenguaje se apoyó en redes recurrentes. Una RNN lee el texto palabra a palabra y resume todo lo leído en un vector de estado que va actualizando. Funciona, pero tiene dos problemas serios: el entrenamiento no se puede paralelizar, porque cada paso depende del anterior, y la información de las primeras palabras se diluye a medida que el texto se alarga.

Las variantes LSTM y GRU alivian el segundo problema con puertas que deciden qué conservar, y los mecanismos de atención añadidos a los traductores automáticos a partir de 2014 permitían al modelo mirar directamente a cualquier palabra de la frase original. Aun así, la recurrencia seguía ahí.

En 2017, un equipo de Google publicó «Attention Is All You Need», que eliminaba la recurrencia por completo: el Transformer procesa todos los tokens a la vez y usa solo atención para relacionarlos entre sí. Eso permitía entrenar en paralelo sobre GPUs, con conjuntos de datos mucho mayores y en mucho menos tiempo.

La arquitectura se dividió pronto en dos familias. Los modelos de tipo codificador, como BERT (2018), leen el texto completo en ambas direcciones y destacan en clasificación y búsqueda. Los de tipo decodificador, como la serie GPT, solo miran hacia atrás y se entrenan para predecir el siguiente token, lo que los convierte en generadores de texto.

GPT-3, presentado en 2020 con 175.000 millones de parámetros, mostró que un decodificador lo bastante grande podía resolver tareas nuevas a partir de unos pocos ejemplos en el propio prompt, sin reentrenarlo. Ese mismo año, los trabajos sobre leyes de escala describieron cómo mejora la pérdida de forma predecible al aumentar parámetros, datos y cómputo.

Faltaba que siguieran instrucciones. El ajuste con ejemplos de conversaciones y el aprendizaje por refuerzo con preferencias humanas convirtieron a esos modelos en asistentes, y ChatGPT, lanzado a finales de 2022, llevó la idea al gran público.

Desde entonces el Transformer apenas ha cambiado en lo esencial. Las mejoras han llegado en los márgenes: atención más eficiente, ventanas de contexto más largas, mezclas de expertos que activan solo una parte de los parámetros y modelos que dedican más cómputo a razonar antes de responder.
`

export const DOCUMENTS: readonly SampleDoc[] = [
  {
    id: 'policy',
    title: 'Política de vacaciones',
    kind: 'Markdown con secciones y listas',
    text: POLICY,
    questions: [
      {
        q: '¿Cuántos días de vacaciones tiene alguien con 6 años de antigüedad?',
        answer:
          'Cada persona dispone de 23 días laborables de vacaciones al año. A partir del quinto año de antigüedad se suman 2 días más, y a partir del décimo, 4 días.',
      },
      {
        q: '¿Hasta cuándo puedo usar los días que no gasté el año pasado?',
        answer: 'Se pueden trasladar al año siguiente hasta 5 días no disfrutados, que deberán usarse antes del 31 de marzo.',
      },
      {
        q: '¿Cuántos días de permiso dan por el fallecimiento de un familiar si vive lejos?',
        answer: 'Fallecimiento, accidente u hospitalización de un familiar de primer grado: 3 días, o 5 si hay que desplazarse a más de 200 km.',
      },
    ],
  },
  {
    id: 'api',
    title: 'Documentación de una API',
    kind: 'Markdown técnico con código',
    text: API,
    questions: [
      {
        q: '¿Qué debo hacer si la API responde con un error 429?',
        answer:
          'Si superas el límite, la API responde con el código 429 y la cabecera Retry-After, que indica cuántos segundos debes esperar antes de reintentar. Los clientes deben reintentar con espera exponencial y no en bucle.',
      },
      {
        q: '¿Cuántos pedidos devuelve cada página del listado y cómo pido la siguiente?',
        answer:
          'Las listas devuelven como máximo 100 elementos por página. Para pedir la siguiente página, pasa el valor de next_cursor de la respuesta en el parámetro cursor.',
      },
      {
        q: '¿Cómo evito crear un pedido duplicado al reintentar?',
        answer:
          'Para evitar pedidos duplicados si reintentas, envía la cabecera Idempotency-Key con un valor único por pedido: la API devolverá el mismo resultado durante 24 horas.',
      },
    ],
  },
  {
    id: 'history',
    title: 'Historia del Transformer',
    kind: 'Prosa sin encabezados',
    text: HISTORY,
    questions: [
      {
        q: '¿Qué dos problemas tenían las redes recurrentes?',
        answer:
          'el entrenamiento no se puede paralelizar, porque cada paso depende del anterior, y la información de las primeras palabras se diluye a medida que el texto se alarga.',
      },
      {
        q: '¿Qué demostró GPT-3 y cuántos parámetros tenía?',
        answer:
          'GPT-3, presentado en 2020 con 175.000 millones de parámetros, mostró que un decodificador lo bastante grande podía resolver tareas nuevas a partir de unos pocos ejemplos en el propio prompt, sin reentrenarlo.',
      },
      {
        q: '¿En qué se diferencian los modelos tipo BERT de los tipo GPT?',
        answer:
          'Los modelos de tipo codificador, como BERT (2018), leen el texto completo en ambas direcciones y destacan en clasificación y búsqueda. Los de tipo decodificador, como la serie GPT, solo miran hacia atrás y se entrenan para predecir el siguiente token',
      },
    ],
  },
]

export const DOCUMENT_BY_ID: ReadonlyMap<string, SampleDoc> = new Map(DOCUMENTS.map((d) => [d.id, d]))
