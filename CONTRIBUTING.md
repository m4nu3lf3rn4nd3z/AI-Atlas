# Contribuir a AI Atlas

¡Gracias por tu interés! Estas guías aplican tanto si abres un issue como si envías una PR.

---

## Antes de contribuir

- Busca en los [issues abiertos](https://github.com/m4nu3lf3rn4nd3z/AI-Atlas/issues) por si ya existe algo similar.
- Para cambios grandes (nuevos labs, nuevas capas de contenido, refactors de arquitectura), abre primero un issue para discutir el enfoque.

## Configurar el entorno

```bash
git clone https://github.com/m4nu3lf3rn4nd3z/AI-Atlas.git
cd AI-Atlas
npm install
npm run dev
```

Requiere **Node.js ≥ 20**.

## Antes de hacer push

```bash
npm test          # todos los tests deben pasar
npm run typecheck # sin errores de TypeScript
npm run lint      # sin warnings de ESLint
npm run build     # build de producción sin errores
```

Los cuatro deben pasar. El CI los ejecuta automáticamente.

## Convenciones

### Código
- TypeScript estricto; sin `any` explícito.
- Lógica de labs en funciones puras (`logic.ts`) con tests; componentes finos.
- Sin comentarios que expliquen el *qué* (los nombres ya lo hacen). Solo si el *por qué* es no obvio.

### Contenido
- La app está en **español**, con términos técnicos en inglés.
- Los números concretos (IDs de tokens, precios, parámetros de modelos) deben ser reales y verificados.
- Todo lo simulado o precomputado se etiqueta como tal.
- Los snippets llevan versiones fijadas (`deps`) y `verifiedAt`.
- Añade `reviewedAt` en el `details.ts` del concepto.

### Estilos
- Colores siempre con tokens CSS (`var(--l0)`…`var(--l7)`, `--fg`, `--surface`…). Nunca valores hex en línea.
- En SVG, colores vía `style`, no atributos.
- El tema claro y el oscuro deben funcionar.

### Commits
Formato: `tipo: descripción corta en español`

```
feat: añade lab de tool calling
fix: corrige cálculo de KV cache en GQA
docs: actualiza teoría de RAG con HyDE
refactor: extrae lógica BM25 a retrieval.ts
test: cubre chunking recursivo con solapamiento
ci: actualiza Node.js a 22 en el workflow
```

## Tipos de contribución bienvenidos

| Tipo | Descripción |
|---|---|
| 🐛 Bug | Algo no funciona como debería |
| 📚 Contenido | Mejoras a teoría, snippets, quiz o fuentes |
| 🔬 Lab | Nuevo lab o mejora a uno existente |
| ♿ A11y | Mejoras de accesibilidad |
| 🌐 i18n | Mejoras a la versión en inglés |
| ⚡ Perf | Optimizaciones de rendimiento |

## Proceso de PR

1. Crea una rama desde `main`: `git checkout -b feat/nombre-descriptivo`
2. Haz tus cambios con commits atómicos.
3. Asegúrate de que los cuatro checks pasan.
4. Abre la PR con la plantilla — rellena todas las secciones.
5. El CI corre automáticamente; si falla, arréglalo antes de pedir revisión.

## Código de conducta

Sé respetuoso. Las críticas técnicas son bienvenidas; los ataques personales no.
