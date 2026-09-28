# Arquitectura

SPA estática (Vite + React 19 + TypeScript). No hay backend: todo el cálculo de los labs ocurre
en el navegador, y el modo Live (fase 5) hablará directamente con Ollama en `localhost`.

## Stack

| Área | Elección | Motivo |
|---|---|---|
| Build | Vite 8 | Arranque instantáneo, code-splitting sencillo |
| UI | React 19, Tailwind CSS 4, Radix (vía `radix-ui`), lucide, motion | Componentes accesibles y estilo con tokens |
| Rutas | React Router 7 | La URL es la fuente de verdad de la selección |
| Mapa | DOM + SVG propio (bandas por capa, conexiones medidas) | Legible, accesible y sin dependencia de un motor de grafos |
| Estado | Zustand (+ `persist`) | UI efímera, preferencias y progreso |
| Contenido | TS (metadatos) + MDX (teoría) + Zod (validación en tests) | Una sola fuente para el grafo, la búsqueda y las rutas |
| Código | Shiki (motor JS, gramáticas bajo demanda) | Resaltado de calidad sin WASM |
| Búsqueda | cmdk | Paleta ⌘K |
| Tokenizadores | gpt-tokenizer (bajo demanda) | BPE reales en el navegador |
| Tests | Vitest | Lógica de labs e integridad del contenido |

## Mapa de carpetas

```
src/
  app/          router, AppShell (cabecera, ⌘K), errores
  components/   ui/ (primitivas), CodeBlock, mdx (Callout, Term…), diagrams/, widgets/
  content/      schema.ts, layers.ts, meta/<capa>.ts, concepts/<id>/, glossary.ts, paths.ts, graph.ts
  features/     map, concept, labs, paths, glossary, progress, search, home, cases, tools, security
  labs/         registry.ts + un directorio por lab (Lab.tsx + logic.ts + logic.test.ts)
  cases/        motor de casos de uso (engine.ts), bloques de arquitectura y data/<caso>.ts
  security/     superficies, ataques, checklist, patrones e incidentes (datos tipados + tests)
  lib/          sampling, tokenizers, hooks, cn
  stores/       ui.ts, progress.ts, security.ts
```

## Decisiones clave

- **URL como fuente de verdad**: `/map?c=<id>&tab=<tab>`, `/c/<id>/<tab>`, `/labs/<id>`,
  `/paths/<id>`, `/cases/<id>`, `/tools#<id>`, `/security`. Deep-links y botón atrás funcionan.
- **Metadatos eager, contenido lazy**: `meta/*.ts` se carga al inicio (mapa, búsqueda);
  `theory.mdx` y `details.ts` se cargan por concepto con `import.meta.glob`.
- **Layout del mapa**: una banda por capa, de Fundamentos (arriba) a Producción; las tarjetas
  fluyen con CSS grid. Las conexiones solo se dibujan para el concepto señalado: se miden las
  tarjetas con `getBoundingClientRect` y se trazan curvas SVG bajo ellas.
- **Resaltado sin re-render global**: un store (`features/map/highlight.ts`) guarda los conjuntos
  resaltados; cada tarjeta se suscribe con un selector booleano.
- **Motor de casos de uso**: cada caso declara pasos, componentes y resultados con condiciones sobre
  interruptores (`{on}`, `{off}`, `{all}`, `{any}`). Un test recorre las 2ⁿ configuraciones de cada
  caso y comprueba invariantes (siempre hay resultado, métricas finitas, pasos coherentes).
- **Dirección de aristas**: siempre hacia la dependencia (el prerrequisito, lo que se usa).
- **Presupuesto de bundle**: JS inicial ≈ 160 KB gzip. Vocabularios BPE, Shiki, MDX y labs van
  en chunks bajo demanda.
