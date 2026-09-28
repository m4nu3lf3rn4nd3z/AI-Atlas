# AI Atlas: visión y análisis de la especificación original

> Documento de referencia del producto. Recoge la crítica a la especificación inicial
> («AI Ecosystem Explorer») y la visión con la que se está construyendo la app.
> Fecha: septiembre de 2026.

## 1. Objetivo

Una web app **muy útil y profesional para aprender IA de forma interactiva**, pensada para
alguien que ya usa LLMs y APIs y quiere entender a fondo cómo funcionan por dentro y cómo
encajan las piezas del stack moderno.

## 2. Qué se mantiene de la especificación original

- Aprender haciendo, con simuladores.
- Un grafo como vista global del ecosistema.
- Un panel inspector por concepto.
- Contenido separado de la UI con un esquema tipado.
- Estética oscura, developer-first, con transiciones fluidas.

## 3. Problemas de producto y pedagogía

| Problema | Por qué importa | Solución en AI Atlas |
|---|---|---|
| La arquitectura no cumple la visión | Se prometía entender la causa-efecto de introducir un componente en un flujo de producción, pero grafo + drawer + estado forman una enciclopedia con un grafo bonito | **Anatomía de una petición**: una pregunta real atraviesa todas las capas, con interruptores de arquitectura que cambian pasos, métricas y resultado |
| El grafo como única navegación | Con ~50 nodos es una maraña y no dice por dónde empezar | Mapa **por capas con layout determinista** + **rutas de aprendizaje** con prerrequisitos + vista índice |
| Aristas sin tipo | «Iluminar conexiones» no significa nada si no se sabe qué relación es | 9 tipos de relación (requiere, usa, implementa, alternativa, mejora, parte de, habilita, mitiga, evalúa), con etiqueta al resaltar |
| Sin verificación del aprendizaje | Leer no es aprender | Quiz por concepto con explicaciones, progreso persistente, «siguiente recomendado» |
| Público ambiguo | «Para aprender» frente a «orientado a arquitectos» | Divulgación progresiva: TL;DR → intuición → mecanismo → trade-offs → errores comunes |
| «Snippets listos para producción» | Las APIs de IA cambian cada pocos meses | Snippets mínimos, anotados, con versiones y fecha de revisión |
| Simuladores guionizados | Mover un slider sobre texto pregrabado enseña algo falso | Cálculo real en el navegador siempre que se puede; lo simulado se etiqueta |
| Solo modo oscuro, sin búsqueda, sin deep-links, sin móvil | Accesibilidad y usabilidad | Tema claro/oscuro, ⌘K, URL como fuente de verdad, vista índice en móvil |

## 4. Imprecisiones técnicas corregidas

- **LM Evaluation Harness** evalúa *modelos* en benchmarks académicos; no mide «perplejidad,
  precisión y coste de pipelines». Para pipelines, RAG y agentes: Ragas, DeepEval, promptfoo,
  Inspect, LangSmith/Braintrust, LLM-as-judge.
- **MCP «sobre stdio/SSE»**: el transporte HTTP+SSE quedó deprecado en la revisión 2025-03-26;
  hoy es stdio y Streamable HTTP. MCP conecta la **aplicación host** con servidores; el modelo
  nunca habla MCP. Primitivas: tools, resources y prompts (servidor); sampling, roots y
  elicitation (cliente). Mensajes JSON-RPC 2.0.
- **Tool calling como «JSON ejecutable»**: el modelo no ejecuta nada. Emite una petición
  estructurada; la aplicación la ejecuta y devuelve el resultado en otro turno.
- **«Modelos especializados en tool calling (Hermes)»**: categoría obsoleta; los modelos actuales
  tienen tool calling nativo. Los nombres de modelos concretos envejecen mal: van a un panorama
  fechado.
- **GGUF ≠ cuantización**: GGUF es un formato de fichero (llama.cpp); la cuantización
  (Q4_K_M, Q8_0, AWQ, GPTQ…) es otra cosa.
- **Búsqueda vectorial «K-NN»**: a escala se usan índices ANN (HNSW, IVF, PQ).
- **«Guardrails previenen alucinaciones tóxicas»**: mezcla dos problemas; los guardrails mitigan,
  no previenen. La prompt injection no tiene solución completa: defensa en profundidad.
- **Memoria corto/largo plazo**: simplificación excesiva (trabajo, episódica, semántica, resumen…).
- **LangGraph como concepto**: es un framework; el concepto es la orquestación con estado.

## 5. Lagunas de contenido cubiertas

Toda la capa de **fundamentos** (tokenización, embeddings, atención, logits y sampling, ventana de
contexto, KV cache, entrenamiento, modelos de razonamiento, MoE), prompt/context engineering,
structured outputs, fine-tuning (LoRA/QLoRA), búsqueda híbrida y re-ranking, observabilidad,
coste y latencia, OWASP LLM Top 10, A2A, computer use, agentes de código y los patrones de
*Building effective agents*.

## 6. Principios

1. **Honestidad**: lo real es real; lo simulado se etiqueta como simulado.
2. **Divulgación progresiva** en cada concepto.
3. **Todo enlazable por URL**.
4. **Funciona offline** (salvo descargas opcionales de modelos).
5. **Contenido fechado y con fuentes primarias**.

## 7. Estructura del contenido

8 capas y 53 conceptos. El grafo se deriva de los metadatos de cada concepto.

| Capa | Tema |
|---|---|
| 0 · Fundamentos | Cómo funciona un LLM por dentro |
| 1 · Modelos y ecosistema | Qué modelos existen y cómo elegir |
| 2 · Inferencia y despliegue | Local, servidor, rendimiento y coste |
| 3 · Adaptar el modelo | Prompting, salidas estructuradas, fine-tuning |
| 4 · Conocimiento y memoria | RAG, búsqueda vectorial, memoria |
| 5 · Herramientas y protocolos | Tool calling, MCP, A2A, computer use |
| 6 · Agentes y orquestación | Bucles, workflows, grafos con estado, multi-agente |
| 7 · Producción | Evals, observabilidad, seguridad, coste |

## 8. Labs

| Lab | Real / simulado | Fase |
|---|---|---|
| Tokenizer | Real (BPE o200k/cl100k en el navegador) | 1 ✓ |
| Sampling | Matemática real sobre distribuciones reales | 2 |
| Embeddings | Real (transformers.js en Web Worker) | 2 |
| Chunking | Real | 2 |
| RAG pipeline | Recuperación real; rerank precomputado | 2 |
| VRAM y cuantización | Real | 2 |
| Tool calling | Bucle real; salidas del modelo guionizadas | 3 |
| MCP Inspector | Simulación fiel al protocolo | 3 |
| Agent Graph | Motor de estado real; nodos guionizados | 3 |
| Prompt injection | Simulación basada en reglas | 4 |
| Evals | Métricas reales sobre salidas precomputadas | 4 |
| Contexto y caché | Conteo real; estrategias simuladas | 4 |
| Decisión Prompt/RAG/FT | Lógica real | 4 |

**Modo Live (fase 5)**: si Ollama está en marcha en `localhost:11434`, los labs de sampling,
embeddings, RAG y tool calling podrán usar inferencia real. Todo funciona sin Ollama.

## 9. Módulos añadidos tras la revisión de la fase 1

Tras probar la fase 1, el usuario pidió cuatro cambios que ya están construidos:

| Módulo | Qué es |
|---|---|
| **Mapa v2** | Capas de arriba abajo (0 = Fundamentos), plegables, con conexiones dibujadas solo para el concepto señalado. Sustituye al grafo de React Flow. |
| **Progreso** | Porcentaje global, KPIs, barra por capa con una celda por concepto, «lo que te has dejado», rutas, casos y actividad. |
| **Casos de uso** | 6 sistemas reales con laboratorio: decisiones de diseño, simulación paso a paso, resultado, coste y lección. Motor genérico en `src/cases`. |
| **Herramientas** | Catálogo de ~110 frameworks, protocolos, servicios y patrones del ecosistema, enlazado con conceptos y casos. |
| **Seguridad** | Revisión de arquitectura: 22 superficies en 6 zonas de confianza, 43 técnicas de ataque con mapeo OWASP LLM 2025, trifecta letal, patrones de diseño seguro, checklist de 86 controles, casos reales y marcos. En `src/security`. |

## 10. Fases

| Fase | Contenido | Estado |
|---|---|---|
| 0 | Entorno y scaffold | ✓ |
| 1 | Cimientos: design system, mapa, inspector, rutas, búsqueda, progreso, glosario, capa 0 completa, Tokenizer Lab | ✓ |
| 1b | Mapa v2, progreso, casos de uso, herramientas, seguridad | ✓ |
| 2 | Labs estrella I + contenido de las capas 1, 2 y 4 | en curso |
| 3 | Tool calling, MCP, Agent Graph, **Anatomía de una petición** + capas 3, 5 y 6 | |
| 4 | Prompt injection, Evals, Contexto, Decisión + capa 7, rutas y glosario completos | |
| 5 | Modo Live con Ollama, auditoría de a11y, móvil y rendimiento, e2e con Playwright | |
