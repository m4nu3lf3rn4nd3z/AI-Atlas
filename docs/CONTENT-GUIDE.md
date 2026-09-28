# Guía de contenido

Cómo añadir o completar un concepto. Todo el contenido vive en `src/content/`.

## 1. Metadatos (siempre)

Cada concepto está declarado en `src/content/meta/<capa>.ts`. Esos metadatos alimentan el mapa,
la búsqueda, las rutas y las relaciones. Un concepto sin contenido escrito aparece en el mapa
como «pronto».

```ts
{
  id: 'hybrid-search',              // kebab-case, único
  title: 'Búsqueda híbrida',
  short: 'TL;DR de una línea (≤ 160 caracteres)',
  layer: 'knowledge',
  kind: 'technique',                // concept | technique | tool | protocol | pattern
  level: 2,                         // 1 base · 2 intermedio · 3 avanzado
  tags: ['BM25', 'RRF'],
  prerequisites: ['vector-databases'],             // lo que hay que saber antes
  relations: [{ to: 'rag', type: 'improves' }],    // relaciones tipadas
  labId: 'rag',                     // opcional: debe existir en src/labs/registry.ts
}
```

Las flechas del mapa apuntan a aquello de lo que depende o sobre lo que actúa el origen.

## 2. Contenido escrito

Crea `src/content/concepts/<id>/` con:

| Fichero | Qué contiene |
|---|---|
| `theory.mdx` | La teoría. Se carga bajo demanda. |
| `details.ts` | Snippets, quiz (≥ 3 preguntas), errores comunes (≥ 1), fuentes (≥ 2), `reviewedAt`. |
| `snippets/*.py`, `*.ts`, `*.json` | Código real, importado con `?raw`. Excluido del typecheck. |

Un concepto pasa a «publicado» en cuanto existen `theory.mdx` y `details.ts`.

### Estructura recomendada de `theory.mdx`

1. Párrafo inicial: por qué importa para alguien que ya usa LLMs.
2. `<Callout type="insight">` con la idea clave.
3. Secciones `##` con el mecanismo (diagramas, `<Steps>`, tablas).
4. «En la práctica» con trade-offs.
5. Cierre que enlaza al siguiente concepto con `<Concept id="…">`.

### Componentes disponibles en MDX (sin importar)

| Componente | Uso |
|---|---|
| `<Callout type="insight\|note\|warning\|tradeoff" title?>` | Recuadros destacados |
| `<Term id="kv-cache">texto</Term>` | Término del glosario con definición al pasar el ratón |
| `<Concept id="rag">texto</Concept>` | Enlace a otro concepto, con el color de su capa |
| `<Steps><Step title="…">…</Step></Steps>` | Pasos numerados |
| `<Diagram name="attention" caption?>` | Diagrama SVG de `src/components/diagrams` |
| `<TokenPreview text="…" />` | Tokenizador real incrustado |
| `<SoftmaxPlayground />` | Playground de temperatura y filtros |
| Bloques ```python / ```ts / ```text | Código resaltado con Shiki |

## 3. Reglas de calidad

- **Honestidad**: si algo es ilustrativo (pesos, posiciones), dilo en el pie o en el texto.
  Los números concretos deben ser reales y comprobables (los ids de tokens se verifican en tests).
- **Fuentes primarias**: papers, documentación oficial, repositorios. Blogs solo si son de
  referencia.
- **Datos volátiles** (modelos, precios): usa `asOf` en `details.ts`.
- **Quiz**: reparte la respuesta correcta entre posiciones y explica el porqué de cada una.
- **Snippets**: mínimos, comentados en español, con `deps` y fecha de revisión. Si un snippet
  TypeScript es ejecutable, compruébalo con `node ruta/al/snippet.ts`.

## 4. Validación

`npm test` comprueba, entre otras cosas:

- Esquemas Zod de metadatos, detalles, glosario y rutas.
- Relaciones y prerrequisitos que apuntan a conceptos existentes y sin ciclos.
- Que cada `<Term>`, `<Concept>` y `<Diagram>` de la teoría existe.
- Que cada fichero de `snippets/` se usa en `details.ts`.
- Que la teoría compila.
