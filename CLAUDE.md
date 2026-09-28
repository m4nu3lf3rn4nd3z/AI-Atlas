# AI Atlas: notas para agentes

App de aprendizaje de IA en español (términos técnicos en inglés). Público: desarrolladores que ya
usan LLMs y APIs. Lee `docs/VISION.md` para el alcance y las fases, y `docs/CONTENT-GUIDE.md`
antes de tocar contenido.

## Entorno (Windows, PowerShell 5.1)

Node y Git están en `C:\Program Files\nodejs` y `C:\Program Files\Git\cmd`; si no están en el
PATH de la shell, antepón: `$env:Path = "C:\Program Files\nodejs;C:\Program Files\Git\cmd;" + $env:Path`.
No reescribas ficheros con `Set-Content` (rompe UTF-8): usa las herramientas de edición.

## Comandos

- `npm test` · `npm run typecheck` · `npm run lint` · `npm run build`
- Todos deben pasar antes de dar un cambio por terminado.

## Convenciones

- La URL es la fuente de verdad de la selección (`/map?c=`, `/c/:id/:tab`).
- Contenido: metadatos en `src/content/meta/<capa>.ts`; teoría y detalles en
  `src/content/concepts/<id>/`. El grafo se deriva de ahí; no se edita a mano.
- Honestidad: todo lo simulado o ilustrativo se etiqueta. Los números concretos de la teoría
  deben ser reales (hay tests que verifican ids de tokens).
- Lógica de los labs en funciones puras (`logic.ts`) con tests; componentes finos.
- Colores siempre con tokens CSS (`var(--l0)`…`var(--l7)` por capa, `--fg`, `--surface`…), para
  que funcionen en tema claro y oscuro. En SVG, colores vía `style`, no atributos.
- Snippets de Claude API: modelo `claude-opus-5-5`, `thinking: {type: "adaptive"}`,
  `output_config.effort`; sin `temperature`/`budget_tokens`.
