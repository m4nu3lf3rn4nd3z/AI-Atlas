# AI Atlas

Plataforma interactiva para aprender el stack moderno de IA. Pensada para desarrolladores que ya usan LLMs y APIs y quieren entender cómo funcionan por dentro.

**[→ Abrir la app](https://m4nu3lf3rn4nd3z.github.io/AI-Atlas/)**

---

## Qué hay dentro

### Mapa del ecosistema

Un grafo navegable con ~50 conceptos organizados en 8 capas, desde tokenización y embeddings hasta agentes, MCP y producción. Cada nodo resalta sus prerrequisitos y relaciones. Búsqueda rápida con `⌘K`.

### Inspector de conceptos

Para cada concepto: TL;DR, intuición, mecanismo, código (Python + TypeScript), lab interactivo y quiz. Todo enlazable por URL (`/c/<id>/theory`, `/c/<id>/lab`…).

### Labs interactivos

Los labs calculan con datos reales, no con sliders sobre texto guionizado.

| Lab | Qué hace |
|---|---|
| **Tokenizer** | Tokenización real con o200k y cl100k; coste por idioma y tipo de texto |
| **Sampling** | Distribuciones reales de Qwen2.5-0.5B sobre 151 936 tokens; temperature, top-k, top-p, min-p |
| **Embeddings** | Vectores reales con multilingual-e5-small; proyección PCA, similitud coseno, búsqueda semántica vs BM25 |
| **Chunking** | Estrategias fija, recursiva, por frases y por cabeceras; BM25 en vivo; diagnóstico de fallos |
| **RAG pipeline** | BM25 + dense + híbrido RRF; filtro de metadatos; reranker bge-v2-m3; umbral de abstención; Recall\@k y MRR |
| **VRAM y cuantización** | Memoria real (pesos + KV cache) para 16 modelos; cuantización interactiva sobre pesos reales de Qwen2.5 |

### Contenido por capas

```
Capa 0 · Fundamentos      tokenización, embeddings, attention, sampling, KV cache, MoE…
Capa 1 · Modelos          open vs closed, panorama, benchmarks, multimodalidad…
Capa 2 · Inferencia       cuantización, formatos, runtimes, serving, latencia y coste…
Capa 3 · Adaptar          prompt engineering, structured outputs, fine-tuning…
Capa 4 · Conocimiento     RAG, chunking, ANN, bases vectoriales, híbrida, re-ranking…
Capa 5 · Herramientas     tool calling, MCP, A2A, computer use…
Capa 6 · Agentes          ReAct, workflows, grafos con estado, multi-agente…
Capa 7 · Producción       evals, observabilidad, prompt injection, guardrails, OWASP LLM…
```

---

## Stack técnico

| | |
|---|---|
| Build | Vite 8 + TypeScript 6 |
| UI | React 19 + React Router 7 |
| Estilos | Tailwind CSS 4 (tokens CSS, dark/light) |
| Componentes | Radix UI + lucide-react + Motion |
| Estado | Zustand 5 (persistido en localStorage) |
| Contenido | MDX 3 + Shiki 4 (code highlighting) |
| ML en browser | @huggingface/transformers (Web Worker + WASM) |
| Tests | Vitest 5 (296 tests) |
| Deploy | GitHub Pages via GitHub Actions |

SPA estática, sin backend. Los modelos ML (embeddings, reranker, sampling) se ejecutan en el navegador o están precomputados como fixtures. Todo funciona offline.

---

## Desarrollo local

```bash
git clone https://github.com/m4nu3lf3rn4nd3z/AI-Atlas.git
cd AI-Atlas
npm install
npm run dev        # http://localhost:5173
npm test           # 296 tests
npm run build      # build de producción
```

Requiere Node.js ≥ 20.

---

## Fases

- **Fase 1** ✓ — Mapa, inspector, rutas, sistema de diseño, contenido capa 0
- **Fase 1b** ✓ — Mapa v2, progreso, casos de uso, catálogo de herramientas, seguridad
- **Fase 2** (en curso) — Labs (tokenizer, sampling, embeddings, chunking, RAG, VRAM) + contenido capas 1–4
- **Fase 3** — Tool calling, MCP Inspector, Agent Graph, Anatomía de una petición
- **Fase 4** — Evals, prompt injection, producción, rutas de aprendizaje completas
- **Fase 5** — Modo Live con Ollama, a11y, Playwright e2e

---

## Honestidad

Lo que calcula la app usa datos reales (distribuciones de un modelo real, vectores de un modelo real, pesos reales). Lo que está simulado o precomputado está etiquetado. Los snippets de código tienen versiones fijadas y fecha de verificación.
