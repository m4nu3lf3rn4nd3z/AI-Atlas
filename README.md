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

### Probar desde otro dispositivo de tu red (iPad, móvil…)

```bash
npm run dev:lan
```

Vite muestra la dirección de red (por ejemplo `http://192.168.86.28:5173`). Ábrela en el otro
dispositivo, conectado a la misma Wi-Fi. Si no carga, revisa que el firewall de Windows permita
a Node.js conexiones entrantes. Para probar el build de producción: `npm run build` y luego
`npm run preview:lan` (puerto 4173).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run dev:lan` | Servidor de desarrollo accesible desde la red local |
| `npm run build` | Typecheck + build de producción en `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm test` | Tests de lógica e integridad del contenido |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Qué hay dentro

- **Mapa**: 53 conceptos en 8 capas, de Fundamentos (arriba) a Producción. Señala un concepto
  para ver sus conexiones; «¿Qué necesito antes?» muestra la cadena de prerrequisitos.
- **Inspector**: Entender · Código · Lab · Comprueba, en un panel lateral o a página completa.
- **Seguridad**: revisión de arquitectura con superficies de ataque, técnicas de ataque (OWASP LLM
  2025), patrones de diseño seguro y un checklist exportable.
- **Casos de uso**: 6 sistemas reales con laboratorio de decisiones de diseño, coste y latencia.
- **Herramientas**: catálogo del ecosistema (frameworks, protocolos, bases vectoriales, gateways…).
- **Labs**: calculan de verdad en tu navegador; se van añadiendo por fases.
- **Rutas**, **glosario**, **búsqueda** (Ctrl K) y **progreso** (se guarda en tu navegador).

## Documentación

- [docs/VISION.md](docs/VISION.md): análisis de la especificación original y visión del producto.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): stack y decisiones técnicas.
- [docs/CONTENT-GUIDE.md](docs/CONTENT-GUIDE.md): cómo añadir conceptos.
