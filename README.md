<div align="center">

# 🗺️ AI Atlas

**Plataforma interactiva para aprender el stack moderno de IA**

[![Deploy](https://github.com/m4nu3lf3rn4nd3z/AI-Atlas/actions/workflows/deploy.yml/badge.svg)](https://github.com/m4nu3lf3rn4nd3z/AI-Atlas/actions/workflows/deploy.yml)
[![Version](https://img.shields.io/github/v/tag/m4nu3lf3rn4nd3z/AI-Atlas?label=version&color=6366f1)](https://github.com/m4nu3lf3rn4nd3z/AI-Atlas/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-22c55e.svg)](LICENSE)
[![Node.js ≥20](https://img.shields.io/badge/node-%E2%89%A520-3b82f6.svg)](https://nodejs.org)
[![Tests](https://img.shields.io/badge/tests-296%20passing-22c55e.svg)](#desarrollo-local)

<br/>

[🇪🇸 Español](#español) · [🇬🇧 English](#english)

<br/>

**[→ Abrir la app en vivo](https://m4nu3lf3rn4nd3z.github.io/AI-Atlas/)**

</div>

---

<a id="español"></a>

## 🇪🇸 Español

AI Atlas es una aplicación web interactiva pensada para **desarrolladores que ya usan LLMs y APIs** y quieren entender cómo funcionan por dentro — desde la tokenización hasta los agentes en producción.

Sin backends, sin cuentas, sin instalaciones. Todo corre en el navegador.

### ¿Qué lo hace diferente?

Los labs no simulan con sliders sobre texto guionizado: **calculan con datos reales**.

- Las distribuciones de probabilidad del sampling vienen de un modelo Qwen2.5-0.5B real (151 936 tokens).
- Los embeddings los genera multilingual-e5-small directamente en tu navegador (WASM).
- Los scores del reranker de RAG los calculó bge-reranker-v2-m3 (571 MB, offline).
- La cuantización opera sobre pesos reales extraídos de Qwen2.5.

### Labs

| Lab | Qué hace | Datos |
|---|---|:---:|
| **Tokenizer** | o200k y cl100k; coste por idioma, código y emojis | Real |
| **Sampling** | Temperature · top-k · top-p · min-p sobre 151 k tokens | Real |
| **Embeddings** | PCA · similitud coseno · semántica vs BM25 · descarga opcional del modelo | Real |
| **Chunking** | Fija · recursiva · frases · cabeceras; BM25 en vivo; diagnóstico | Real |
| **RAG pipeline** | BM25 + denso + híbrido RRF · reranker · filtros · Recall@k · MRR | Real |
| **VRAM & Quant** | 16 modelos · 9 formatos · KV cache · cuantización interactiva | Real |

### Mapa del ecosistema

~50 conceptos en 8 capas con relaciones tipadas (`usa`, `implementa`, `alternativa`, `mejora`…). Cada nodo resalta prerrequisitos, filtra por capa y enlaza al inspector.

```
Capa 0 · Fundamentos    tokenización · embeddings · attention · sampling · KV cache · MoE
Capa 1 · Modelos        open vs closed · panorama · benchmarks · multimodalidad
Capa 2 · Inferencia     cuantización · formatos · runtimes · serving · latencia · APIs
Capa 3 · Adaptar        prompt engineering · structured outputs · fine-tuning
Capa 4 · Conocimiento   RAG · chunking · ANN · vectoriales · híbrida · re-ranking
Capa 5 · Herramientas   tool calling · MCP · A2A · computer use
Capa 6 · Agentes        ReAct · workflows · grafos · multi-agente
Capa 7 · Producción     evals · observabilidad · prompt injection · guardrails · OWASP LLM
```

### Inspector de conceptos

Para cada concepto: **TL;DR → intuición → mecanismo → código → lab → quiz**. Todo enlazable por URL (`/c/<id>/theory`, `/c/<id>/lab`, `/c/<id>/quiz`…).

### Desarrollo local

```bash
git clone https://github.com/m4nu3lf3rn4nd3z/AI-Atlas.git
cd AI-Atlas
npm install
npm run dev       # → http://localhost:5173
npm test          # → 296 tests
npm run build     # → dist/ listo para deploy
```

Requiere **Node.js ≥ 20**.

### Roadmap

| Fase | Estado | Contenido |
|---|:---:|---|
| **1** Cimientos | ✅ | Mapa, inspector, rutas, sistema de diseño, capa 0 |
| **1b** Módulos extra | ✅ | Mapa v2, progreso, casos de uso, herramientas, seguridad |
| **2** Labs | 🔄 | 6 labs con datos reales · capas 1–4 |
| **3** Agentes | ⏳ | Tool calling · MCP Inspector · Agent Graph · Anatomía de una petición |
| **4** Producción | ⏳ | Evals · prompt injection · rutas de aprendizaje completas |
| **5** Live mode | ⏳ | Ollama · a11y · Playwright e2e |

### Stack

| | |
|---|---|
| Build | Vite 8 + TypeScript 6 |
| UI | React 19 + React Router 7 |
| Estilos | Tailwind CSS 4 · tokens CSS · dark/light |
| Componentes | Radix UI · lucide-react · Motion 13 |
| Estado | Zustand 5 (localStorage) |
| Contenido | MDX 3 · Shiki 4 |
| ML en browser | @huggingface/transformers · Web Worker · WASM |
| Tests | Vitest 5 · 296 tests |
| Deploy | GitHub Pages · GitHub Actions |

SPA estática sin backend. Funciona offline tras la primera carga.

### Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir una PR. Para bugs o ideas usa las [plantillas de issues](.github/ISSUE_TEMPLATE/).

### Licencia

MIT © [MFG](https://github.com/m4nu3lf3rn4nd3z) — ver [LICENSE](LICENSE).

---

<a id="english"></a>

## 🇬🇧 English

AI Atlas is an interactive web application for **developers who already use LLMs and APIs** and want to understand how they work under the hood — from tokenization to production agents.

No backend, no accounts, no installs. Everything runs in the browser.

### What makes it different?

Labs don't fake it with sliders over scripted text: **they compute with real data**.

- Sampling probability distributions come from a real Qwen2.5-0.5B model (151,936 tokens).
- Embeddings are generated by multilingual-e5-small directly in your browser (WASM).
- RAG reranker scores were computed by bge-reranker-v2-m3 (571 MB, offline).
- Quantization operates on real weights extracted from Qwen2.5.

### Labs

| Lab | What it does | Data |
|---|---|:---:|
| **Tokenizer** | o200k & cl100k; cost by language, code and emojis | Real |
| **Sampling** | Temperature · top-k · top-p · min-p over 151k tokens | Real |
| **Embeddings** | PCA · cosine similarity · semantic vs BM25 · optional model download | Real |
| **Chunking** | Fixed · recursive · sentence · heading; live BM25; failure diagnosis | Real |
| **RAG pipeline** | BM25 + dense + hybrid RRF · reranker · filters · Recall@k · MRR | Real |
| **VRAM & Quant** | 16 models · 9 formats · KV cache · interactive quantization | Real |

### Ecosystem Map

~50 concepts across 8 layers with typed relations (`uses`, `implements`, `alternative`, `improves`…). Each node highlights prerequisites, filters by layer, and links to the inspector.

### Concept Inspector

For each concept: **TL;DR → intuition → mechanism → code → lab → quiz**. Every view is URL-addressable (`/c/<id>/theory`, `/c/<id>/lab`, `/c/<id>/quiz`…).

### Quick start

```bash
git clone https://github.com/m4nu3lf3rn4nd3z/AI-Atlas.git
cd AI-Atlas
npm install
npm run dev       # → http://localhost:5173
npm test          # → 296 tests
npm run build     # → dist/ ready to deploy
```

Requires **Node.js ≥ 20**.

### Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR. For bugs or ideas use the [issue templates](.github/ISSUE_TEMPLATE/).

### License

MIT © [MFG](https://github.com/m4nu3lf3rn4nd3z) — see [LICENSE](LICENSE).
