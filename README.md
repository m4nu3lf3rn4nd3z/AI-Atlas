# AI Atlas

Plataforma interactiva para aprender el stack moderno de IA: un mapa por capas del ecosistema,
teoría con divulgación progresiva, código real, quizzes y labs que calculan de verdad en tu
navegador.

## Arrancar

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:5173.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Tests de lógica e integridad del contenido |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Qué hay dentro

- **Mapa**: 53 conceptos en 8 capas, con relaciones tipadas. Pasa el ratón para ver conexiones;
  «¿Qué necesito antes?» muestra la cadena de prerrequisitos.
- **Inspector**: Entender · Código · Lab · Comprueba, en un panel lateral o a página completa.
- **Rutas**: recorridos guiados por prerrequisitos.
- **Labs**: Tokenizer (disponible); el resto llega por fases.
- **Glosario**, **búsqueda** (Ctrl K) y **progreso** (se guarda en tu navegador).

## Documentación

- [docs/VISION.md](docs/VISION.md): análisis de la especificación original y visión del producto.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): stack y decisiones técnicas.
- [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md): cómo añadir conceptos.
