import { ChartColumnBig } from 'lucide-react'
import type { UseCase } from '../types'
import sqlSnippet from './snippets/text_to_sql.py?raw'

const json = (v: unknown) => JSON.stringify(v, null, 2)

const DATA_OK = { all: [{ on: 'schema' }, { on: 'retry' }] }
const HAS_DATA = { any: [DATA_OK, { off: 'schema' }] }

export const textToSql: UseCase = {
  id: 'text-to-sql',
  title: 'Analista de datos en lenguaje natural',
  tagline: 'Pregunta a tu base de datos en español: encuentra las tablas relevantes, genera SQL, lo ejecuta de forma segura, corrige sus errores y dibuja el gráfico.',
  icon: ChartColumnBig,
  level: 2,
  examples: ['BI conversacional para equipos de negocio', 'Analítica de producto', 'Consultas de soporte interno', 'Informes ad hoc'],
  problem:
    'Los datos están en una base de datos con cientos de tablas y los que hacen las preguntas no saben SQL. Un LLM escribe SQL muy bien si sabe qué tablas usar y puede ver sus errores; el peligro es que ejecute algo que no debe o devuelva números equivocados sin avisar.',
  whenNot:
    'Si las preguntas son siempre las mismas, un dashboard es más barato y más fiable. Si los datos no están bien modelados ni documentados, el modelo heredará toda esa confusión.',
  concepts: ['rag', 'structured-outputs', 'tool-calling', 'code-sandboxes', 'guardrails', 'evals', 'prompt-engineering'],
  patterns: ['retry-loop', 'router'],
  scenario: {
    title: 'Ventas por categoría',
    input: 'Marca como archivados los pedidos de prueba y luego dime las 5 categorías con más ventas del último trimestre y cómo evolucionaron mes a mes.',
  },
  components: [
    { id: 'user', kind: 'user', label: 'Analista de negocio', role: 'Pregunta en lenguaje natural y recibe tabla y gráfico.', tools: ['streamlit', 'chainlit', 'gradio'], col: 0, row: 0 },
    { id: 'evals', kind: 'evaluator', label: 'Evals', role: 'Preguntas de referencia con su SQL y resultado correctos, evaluadas en cada cambio.', tools: ['promptfoo', 'deepeval', 'braintrust'], col: 0, row: 1, offline: true },
    { id: 'schema', kind: 'retriever', label: 'Catálogo de esquema', role: 'Encuentra las tablas y columnas relevantes para la pregunta, con sus descripciones.', tools: ['llamaindex', 'langchain'], col: 1, row: 0, when: { on: 'schema' } },
    { id: 'schema-store', kind: 'vector-store', label: 'Descripciones de tablas', role: 'Embeddings de la documentación de cada tabla (incluida la que dice «obsoleta»).', tools: ['pgvector', 'chroma'], col: 1, row: 1, when: { on: 'schema' } },
    { id: 'llm', kind: 'llm', label: 'LLM', role: 'Traduce la pregunta a SQL y, si falla, lo corrige leyendo el error.', tools: ['structured-outputs', 'litellm'], col: 2, row: 0 },
    { id: 'tracer', kind: 'tracer', label: 'Trazas', role: 'Pregunta, SQL, errores y resultados: la materia prima de los evals.', tools: ['langfuse', 'langsmith'], col: 2, row: 1 },
    { id: 'guard', kind: 'guardrail', label: 'Validador de SQL', role: 'Solo deja pasar SELECT, añade LIMIT y timeout, y usa un usuario de solo lectura.', tools: ['guardrails-ai'], col: 3, row: 0, when: { on: 'readonly' } },
    { id: 'db', kind: 'database', label: 'PostgreSQL', role: 'Réplica de producción con 240 tablas.', tools: ['postgresql'], col: 4, row: 0 },
    { id: 'sandbox', kind: 'sandbox', label: 'Sandbox de gráficos', role: 'Ejecuta el código Python del gráfico aislado del sistema.', tools: ['pyodide', 'e2b'], col: 4, row: 1, when: { on: 'chart' } },
  ],
  flows: [
    { from: 'user', to: 'schema', when: { on: 'schema' } },
    { from: 'schema', to: 'schema-store', when: { on: 'schema' } },
    { from: 'schema', to: 'llm', when: { on: 'schema' } },
    { from: 'user', to: 'llm', when: { off: 'schema' } },
    { from: 'llm', to: 'guard', when: { on: 'readonly' } },
    { from: 'guard', to: 'db', when: { on: 'readonly' } },
    { from: 'llm', to: 'db', when: { off: 'readonly' } },
    { from: 'db', to: 'sandbox', when: { on: 'chart' } },
    { from: 'llm', to: 'tracer' },
  ],
  toggles: [
    { id: 'schema', label: 'Recuperar el esquema relevante', description: 'En lugar de meter las 240 tablas en el prompt, se buscan las pocas relevantes con sus descripciones.', concept: 'rag' },
    { id: 'readonly', label: 'Solo lectura', description: 'Usuario de base de datos sin permisos de escritura y un validador que solo admite SELECT.', concept: 'guardrails' },
    { id: 'retry', label: 'Reintentar con el error', description: 'Si la base de datos devuelve un error, el modelo lo ve y corrige la consulta (máximo 3 intentos).', concept: 'agent-loop' },
    { id: 'chart', label: 'Gráfico en sandbox', description: 'El modelo escribe código Python para el gráfico y se ejecuta aislado.', concept: 'code-sandboxes' },
  ],
  presets: [
    { id: 'naive', label: 'Ingenuo', description: 'Esquema completo, permisos de escritura, sin reintento ni gráfico.', toggles: { schema: false, readonly: false, retry: false, chart: false } },
    { id: 'recommended', label: 'Recomendado', description: 'Esquema recuperado, solo lectura, reintento y gráfico.', toggles: { schema: true, readonly: true, retry: true, chart: true } },
  ],
  steps: [
    { id: 'ask', component: 'user', title: 'Pregunta', detail: 'La petición mezcla una lectura con una escritura, algo que un asistente de análisis no debería hacer.', payload: { lang: 'text', content: 'Marca como archivados los pedidos de prueba y luego dime las 5 categorías con más ventas del último trimestre y cómo evolucionaron mes a mes.' }, ms: 0 },
    { id: 'schema-search', component: 'schema', title: 'Búsqueda de tablas relevantes', detail: 'Cuatro tablas y sus descripciones. sales_legacy aparece como candidata, pero su descripción dice que está obsoleta y se descarta.', payload: { lang: 'json', content: json([{ tabla: 'orders', columnas: 'id, customer_email, created_at, status, is_test, total' }, { tabla: 'order_items', columnas: 'order_id, product_id, qty, price' }, { tabla: 'products', columnas: 'id, category_id, name' }, { tabla: 'categories', columnas: 'id, category_name' }, { descartada: 'sales_legacy', motivo: 'OBSOLETA: datos hasta 2024, no usar' }]) }, ms: 180, embedTokens: 40, when: { on: 'schema' } },
    { id: 'full-schema', component: 'llm', title: 'Esquema completo en el prompt', detail: '240 tablas de DDL sin descripciones. El prompt ocupa unos 38.000 tokens y el modelo tiene que adivinar qué tabla usar.', payload: { lang: 'text', content: 'CREATE TABLE abandoned_carts (…);\nCREATE TABLE …  (240 tablas)\nCREATE TABLE sales_legacy (category text, month date, revenue numeric);\n…' }, ms: 5, status: 'warn', when: { off: 'schema' } },
    {
      id: 'sql-schema',
      component: 'llm',
      title: 'Genera el SQL',
      detail: 'Dos sentencias. La escritura identifica los pedidos de prueba por el email en lugar de por la columna is_test, y la lectura usa una columna que no existe (category).',
      payload: { lang: 'sql', content: "UPDATE orders SET status = 'archived' WHERE customer_email LIKE '%test%';\n\nSELECT c.category, date_trunc('month', o.created_at) AS mes, SUM(oi.qty * oi.price) AS ventas\nFROM orders o JOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id\nWHERE o.created_at >= date_trunc('quarter', now()) - interval '3 months'\n  AND o.created_at < date_trunc('quarter', now())\nGROUP BY 1, 2 ORDER BY ventas DESC;" },
      ms: 3200,
      llm: { tier: 'large', input: 3600, output: 260 },
      when: { on: 'schema' },
    },
    {
      id: 'sql-full',
      component: 'llm',
      title: 'Genera el SQL',
      detail: 'Entre 240 tablas, sales_legacy tiene justo las columnas que busca (category, month, revenue). Parece perfecta, y es de 2024.',
      payload: { lang: 'sql', content: "UPDATE orders SET status = 'archived' WHERE customer_email LIKE '%test%';\n\nSELECT category, month, SUM(revenue) AS ventas\nFROM sales_legacy\nWHERE month >= date_trunc('quarter', now()) - interval '3 months'\n  AND month < date_trunc('quarter', now())\nGROUP BY 1, 2 ORDER BY ventas DESC;" },
      ms: 6500,
      llm: { tier: 'large', input: 38900, output: 220 },
      status: 'warn',
      when: { off: 'schema' },
    },
    { id: 'guard-block', component: 'guard', title: 'Validación: solo SELECT', detail: 'El UPDATE se rechaza antes de llegar a la base de datos (y, aunque llegara, el usuario de solo lectura no tiene permisos). El asistente explicará que no puede modificar datos.', payload: { lang: 'text', content: 'Sentencia 1: UPDATE → rechazada (el asistente es de solo lectura)\nSentencia 2: SELECT → permitida · añadido LIMIT 500 · statement_timeout 15s' }, ms: 10, status: 'blocked', when: { on: 'readonly' } },
    { id: 'update-run', component: 'db', title: 'UPDATE ejecutado', detail: '«%test%» coincide con clientes reales: contest@…, testaferro@…, celestina.testa@… Sus pedidos pasan a «archivados» y desaparecen de los informes.', payload: { lang: 'text', content: 'UPDATE 312' }, ms: 400, toolCall: true, status: 'error', when: { off: 'readonly' } },
    { id: 'select-error', component: 'db', title: 'Ejecución: error', detail: 'La base de datos devuelve un error muy informativo: dice qué columna quería decir.', payload: { lang: 'text', content: 'ERROR:  column c.category does not exist\nLINE 1: SELECT c.category, date_trunc(\'month\', o.created_at) …\nHINT:  Perhaps you meant to reference the column "c.category_name".' }, ms: 60, toolCall: true, status: 'error', when: { on: 'schema' } },
    { id: 'retry-fix', component: 'llm', title: 'Reintento con el error', detail: 'Con el error y la pista delante, el modelo corrige la columna y además excluye los pedidos de prueba con is_test.', payload: { lang: 'sql', content: "SELECT c.category_name, date_trunc('month', o.created_at) AS mes, SUM(oi.qty * oi.price) AS ventas\nFROM orders o JOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id JOIN categories c ON c.id = p.category_id\nWHERE o.created_at >= date_trunc('quarter', now()) - interval '3 months'\n  AND o.created_at < date_trunc('quarter', now()) AND NOT o.is_test\nGROUP BY 1, 2 ORDER BY ventas DESC LIMIT 500;" }, ms: 2400, llm: { tier: 'large', input: 4200, output: 240 }, when: DATA_OK },
    { id: 'select-ok', component: 'db', title: 'Ejecución correcta', detail: '15 filas: 5 categorías × 3 meses, con datos del último trimestre.', payload: { lang: 'json', content: json([{ categoria: 'Riego', mes: '2026-04', ventas: 184220 }, { categoria: 'Riego', mes: '2026-05', ventas: 201930 }, { categoria: 'Herramientas', mes: '2026-04', ventas: 142610 }, '… 12 filas más']) }, ms: 180, toolCall: true, status: 'ok', when: DATA_OK },
    { id: 'error-to-user', component: 'user', title: 'Error devuelto al usuario', detail: 'Sin reintento, el usuario recibe un error de SQL que no sabe interpretar.', payload: { lang: 'text', content: 'Lo siento, se ha producido un error al ejecutar la consulta: column c.category does not exist.' }, ms: 0, status: 'error', when: { all: [{ on: 'schema' }, { off: 'retry' }] } },
    { id: 'select-legacy', component: 'db', title: 'Ejecución sin errores… con datos de 2024', detail: 'La consulta funciona, pero sales_legacy dejó de actualizarse en 2024: el filtro de fecha devuelve pocos datos antiguos y el ranking está mal.', payload: { lang: 'json', content: json([{ category: 'Jardín', month: '2024-12', ventas: 96410 }, { category: 'Riego', month: '2024-12', ventas: 88120 }, '… (sin datos de 2026)']) }, ms: 150, toolCall: true, status: 'warn', when: { off: 'schema' } },
    { id: 'chart', component: 'sandbox', title: 'Gráfico en el sandbox', detail: 'El modelo escribe el código del gráfico; se ejecuta aislado y devuelve la imagen.', payload: { lang: 'python', content: 'import pandas as pd, matplotlib.pyplot as plt\ndf = pd.DataFrame(filas)\ndf.pivot(index="mes", columns="categoria", values="ventas").plot(marker="o")\nplt.title("Top 5 categorías · último trimestre")\nplt.savefig("grafico.png")' }, ms: 2100, llm: { tier: 'small', input: 1800, output: 220 }, toolCall: true, when: { all: [{ on: 'chart' }, HAS_DATA] } },
    { id: 'answer', component: 'user', title: 'Respuesta', detail: 'Tabla, gráfico si lo hay y una explicación de cómo se ha calculado… correcta o no según las decisiones de diseño.', ms: 2200, llm: { tier: 'large', input: 2600, output: 400 }, when: HAS_DATA },
    { id: 'trace', component: 'tracer', title: 'Traza', detail: 'Esta pregunta y su SQL correcto pueden entrar en el conjunto de referencia de los evals.', ms: 5 },
  ],
  outcomes: [
    { when: { off: 'readonly' }, verdict: 'danger', title: 'Se modificaron 312 pedidos reales', text: 'El asistente ejecutó un UPDATE con una condición equivocada sobre la base de datos. Los pedidos de clientes reales desaparecen de los informes.', lesson: 'Un asistente de análisis no necesita escribir. Que el modelo «no debería» hacerlo no basta: que no pueda (usuario de solo lectura + validador).' },
    { when: { all: [{ on: 'schema' }, { off: 'retry' }] }, verdict: 'failure', title: 'Error de SQL devuelto al usuario', text: 'El modelo se equivocó de columna, algo muy habitual, y no tuvo ocasión de corregirlo.', lesson: 'Con el mensaje de error delante, los modelos corrigen la mayoría de estos fallos. Un bucle de reintento acotado cuesta poco y evita la mayoría de errores visibles.' },
    { when: { off: 'schema' }, verdict: 'failure', title: 'Números de una tabla obsoleta… y 10 veces más tokens', text: 'Con 240 tablas en el prompt, el modelo eligió sales_legacy, que tenía las columnas perfectas y datos de 2024. No hubo ningún error: solo un informe equivocado.', lesson: 'Los errores silenciosos son los peores. Recuperar solo las tablas relevantes, con descripciones que digan cuáles están obsoletas, mejora la precisión y reduce el coste.' },
    { verdict: 'success', title: 'Respuesta correcta, segura y explicada', text: 'Tablas correctas, la columna corregida tras un error, la escritura rechazada y el gráfico generado en un entorno aislado.', lesson: 'Text-to-SQL funciona cuando el modelo tiene buen contexto (esquema documentado), feedback (errores) y límites (solo lectura).' },
  ],
  notes: [
    { when: { off: 'chart' }, text: 'Sin el sandbox, el gráfico se describe en texto: menos útil y más propenso a errores de cálculo.' },
    { when: { on: 'readonly' }, text: 'El asistente responde que no puede archivar pedidos y sugiere pedirlo al equipo de datos: rechazar con una explicación también es una buena respuesta.' },
  ],
  stacks: [
    {
      name: 'Ligero',
      description: 'Para un equipo o un departamento.',
      picks: [
        { component: 'user', tools: ['streamlit', 'gradio'] },
        { component: 'schema-store', tools: ['chroma', 'pgvector'] },
        { component: 'llm', tools: ['structured-outputs', 'litellm'] },
        { component: 'db', tools: ['postgresql'], note: 'réplica de lectura y usuario sin permisos de escritura' },
        { component: 'sandbox', tools: ['pyodide'] },
        { component: 'evals', tools: ['promptfoo'] },
      ],
    },
    {
      name: 'Empresarial',
      description: 'Muchos usuarios, permisos por fila y auditoría.',
      picks: [
        { component: 'user', tools: ['chainlit'] },
        { component: 'schema', tools: ['llamaindex'] },
        { component: 'guard', tools: ['guardrails-ai'] },
        { component: 'sandbox', tools: ['e2b'] },
        { component: 'tracer', tools: ['langfuse'] },
        { component: 'evals', tools: ['braintrust', 'deepeval'] },
      ],
    },
  ],
  risks: [
    { title: 'Escrituras y consultas destructivas', text: 'UPDATE, DELETE o DROP generados por error o por una petición maliciosa.', mitigation: 'Usuario de solo lectura, réplica y validación del SQL con un parser, no con expresiones regulares.' },
    { title: 'Consultas carísimas', text: 'Un JOIN sin filtro puede tumbar la base de datos.', mitigation: 'LIMIT, statement_timeout y ejecutar contra una réplica.' },
    { title: 'Acceso a datos que el usuario no debería ver', text: 'El modelo consulta con los permisos de la conexión, no con los del usuario.', mitigation: 'Seguridad a nivel de fila y conexiones con la identidad de quien pregunta.' },
    { title: 'Números erróneos sin error', text: 'JOINs mal hechos o tablas equivocadas producen resultados plausibles y falsos.', mitigation: 'Esquema documentado, mostrar siempre el SQL y evals con resultados de referencia.' },
  ],
  metrics: [
    { name: 'Exactitud de ejecución', why: '¿El resultado coincide con el de la consulta de referencia? Mejor que comparar el texto del SQL.' },
    { name: 'Consultas que necesitan reintento', why: 'Si son muchas, falta contexto en el esquema.' },
    { name: 'Rechazadas por el validador', why: 'Intentos de escritura o consultas peligrosas: conviene revisarlas.' },
    { name: 'Tokens por pregunta', why: 'Se dispara si el esquema entra entero en el prompt.' },
  ],
  snippets: [
    { title: 'SQL de solo lectura con reintento', lang: 'python', code: sqlSnippet, deps: { anthropic: 'latest', pydantic: '>=2.0' }, verifiedAt: '2026-09', note: 'Usa SQLite en modo solo lectura para que se pueda probar sin servidor; con PostgreSQL, conecta con un usuario sin permisos de escritura.' },
  ],
}
