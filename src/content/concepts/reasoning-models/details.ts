import type { ConceptDetails } from '../../schema'
import claudeThinking from './snippets/claude_thinking.py?raw'
import effortSweep from './snippets/effort_sweep.ts?raw'
import ollamaThink from './snippets/ollama_think.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Razonamiento adaptativo con Claude',
      lang: 'python',
      code: claudeThinking,
      deps: { anthropic: 'latest' },
      verifiedAt: '2026-09',
      note: 'Incluye el fallback de servidor recomendado para los modelos Claude actuales: si un filtro de seguridad rechaza la petición, la API la reintenta en otro modelo dentro de la misma llamada.',
    },
    {
      title: 'Comparar niveles de esfuerzo',
      lang: 'typescript',
      code: effortSweep,
      deps: { '@anthropic-ai/sdk': 'latest' },
      verifiedAt: '2026-09',
    },
    {
      title: 'Modelo de razonamiento local con Ollama',
      lang: 'python',
      code: ollamaThink,
      deps: { ollama: '>=0.5' },
      verifiedAt: '2026-09',
      note: 'Necesitas Ollama en marcha y el modelo descargado (unos 2,5 GB).',
    },
  ],
  quiz: [
    {
      q: '¿Qué técnica de entrenamiento está detrás de los modelos de razonamiento actuales?',
      options: [
        'Aprendizaje por refuerzo sobre problemas con respuesta verificable, que premia llegar a la solución correcta.',
        'Más datos de pre-training.',
        'Aumentar la temperatura durante el entrenamiento.',
        'Ampliar la ventana de contexto.',
      ],
      answer: 0,
      explain:
        'Con recompensas verificables (el resultado es correcto o no; los tests pasan o no), el modelo aprende estrategias de razonamiento que mejoran su tasa de acierto, sin que nadie le escriba ejemplos de cómo pensar.',
    },
    {
      q: 'Usas un modelo de razonamiento con esfuerzo alto para clasificar tickets en 5 categorías. ¿Qué es lo más probable?',
      options: [
        'Mucha más precisión, por lo que merece la pena.',
        'Más coste y latencia con poca o ninguna mejora: la tarea es simple.',
        'Error, porque no se puede clasificar con razonamiento.',
        'Menos tokens de salida.',
      ],
      answer: 1,
      explain:
        'El razonamiento extra ayuda en problemas de varios pasos. En tareas sencillas apenas mejora el resultado y sí multiplica tokens y tiempo. Un esfuerzo bajo o un modelo más pequeño suelen ser la mejor opción.',
    },
    {
      q: '¿Cómo se facturan los tokens de razonamiento de un modelo vía API?',
      options: [
        'Son gratis, porque no se muestran.',
        'Como tokens de entrada.',
        'Como tokens de salida, aunque solo recibas un resumen o nada del razonamiento.',
        'Con una tarifa fija por petición.',
      ],
      answer: 2,
      explain:
        'El modelo los genera igual que la respuesta, token a token, así que cuentan como salida (la parte cara). Mira el uso de tokens de la respuesta para ver el coste real.',
    },
    {
      q: '¿Qué significa «test-time compute» como eje de escala?',
      options: [
        'Hacer tests unitarios del modelo.',
        'Que el modelo se reentrena en cada petición.',
        'Usar más GPUs durante el entrenamiento.',
        'Mejorar resultados gastando más cómputo durante la inferencia: más tokens de razonamiento o varias soluciones que se verifican.',
      ],
      answer: 3,
      explain:
        'Antes, más calidad exigía entrenar modelos mayores. Ahora también se puede "comprar" calidad en cada respuesta dejando pensar más al modelo, con rendimientos decrecientes.',
    },
    {
      q: 'El razonamiento visible de un modelo dice que eligió la opción B «por el dato X». ¿Qué conclusión es la correcta?',
      options: [
        'Es una explicación útil pero no necesariamente fiel del cálculo interno: el modelo puede haberse apoyado en factores que no menciona.',
        'Es la prueba definitiva de por qué eligió B.',
        'Es texto aleatorio sin relación con la respuesta.',
        'Significa que el modelo buscó X en internet.',
      ],
      answer: 0,
      explain:
        'La cadena de pensamiento es texto generado. Suele estar relacionada con cómo llega a la respuesta, pero la investigación ha mostrado casos en los que omite factores que sí influyeron.',
    },
  ],
  misconceptions: [
    {
      myth: 'Los modelos de razonamiento son siempre mejores, así que conviene usarlos para todo.',
      reality:
        'Brillan en problemas de varios pasos. En tareas simples añaden coste y latencia sin mejorar, y a veces sobre-analizan.',
    },
    {
      myth: 'Pedir «piensa paso a paso» a cualquier modelo equivale a un modelo de razonamiento.',
      reality:
        'Ayuda, pero un modelo entrenado con RL sobre tareas verificables ha aprendido a comprobar y corregir su propio trabajo, algo que un prompt no enseña.',
    },
    {
      myth: 'Si no veo el razonamiento, no lo estoy pagando.',
      reality:
        'El razonamiento se genera y se factura igual; que la API devuelva un resumen o nada es solo una cuestión de visibilidad.',
    },
  ],
  sources: [
    {
      title: 'Wei et al. (2022) · Chain-of-Thought Prompting Elicits Reasoning in Large Language Models',
      url: 'https://arxiv.org/abs/2201.11903',
      kind: 'paper',
    },
    {
      title: 'DeepSeek-AI (2025) · DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via RL',
      url: 'https://arxiv.org/abs/2501.12948',
      kind: 'paper',
    },
    {
      title: 'Snell et al. (2024) · Scaling LLM Test-Time Compute Optimally',
      url: 'https://arxiv.org/abs/2408.03314',
      kind: 'paper',
    },
    {
      title: 'OpenAI (2024) · Learning to reason with LLMs',
      url: 'https://openai.com/index/learning-to-reason-with-llms/',
      kind: 'blog',
    },
    {
      title: "Anthropic (2025) · Reasoning models don't always say what they think",
      url: 'https://www.anthropic.com/research/reasoning-models-dont-say-think',
      kind: 'blog',
    },
    {
      title: 'Anthropic docs · Extended thinking',
      url: 'https://platform.claude.com/docs/en/build-with-claude/extended-thinking',
      kind: 'docs',
    },
  ],
}

export default details
