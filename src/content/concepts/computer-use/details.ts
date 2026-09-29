import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Bucle básico de computer use con Anthropic',
      lang: 'python',
      code: `import anthropic
import base64
from PIL import ImageGrab  # pip install pillow
import pyautogui           # pip install pyautogui

client = anthropic.Anthropic()

def take_screenshot() -> str:
    """Captura pantalla y devuelve en base64."""
    screenshot = ImageGrab.grab()
    screenshot.save("/tmp/screen.png")
    with open("/tmp/screen.png", "rb") as f:
        return base64.standard_b64encode(f.read()).decode("utf-8")

def execute_action(action: dict) -> str:
    """Ejecuta la acción indicada por el modelo."""
    match action.get("action"):
        case "screenshot":
            return ""  # La siguiente llamada incluirá el screenshot
        case "left_click":
            x, y = action["coordinate"]
            pyautogui.click(x, y)
            return f"Clic en ({x}, {y})"
        case "type":
            pyautogui.typewrite(action["text"], interval=0.05)
            return f"Texto escrito: {action['text'][:50]}..."
        case "key":
            pyautogui.hotkey(*action["key"].split("+"))
            return f"Tecla: {action['key']}"
        case "scroll":
            x, y = action["coordinate"]
            direction = action.get("direction", "down")
            amount = action.get("scroll_direction", 3)
            pyautogui.scroll(amount if direction == "up" else -amount, x=x, y=y)
            return f"Scroll {direction} en ({x}, {y})"
        case _:
            return f"Acción desconocida: {action}"

def run_computer_agent(task: str, max_steps: int = 20) -> str:
    # ⚠️ SOLO EJECUTAR EN ENTORNO SANDBOXED
    messages = [{"role": "user", "content": task}]
    tools = [{"type": "computer_20241022", "name": "computer", "display_width_px": 1920, "display_height_px": 1080}]

    for step in range(max_steps):
        # Incluir screenshot del estado actual
        screenshot_b64 = take_screenshot()
        messages.append({
            "role": "user",
            "content": [{"type": "image", "source": {"type": "base64", "media_type": "image/png", "data": screenshot_b64}}],
        })

        response = client.messages.create(model="claude-opus-5-5", max_tokens=1024, tools=tools, messages=messages)

        if response.stop_reason == "end_turn":
            return response.content[0].text

        tool_results = []
        for block in response.content:
            if block.type == "tool_use" and block.name == "computer":
                result = execute_action(block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": result})

        messages.extend([{"role": "assistant", "content": response.content}, {"role": "user", "content": tool_results}])

    return "Máximo de pasos alcanzado"
`,
      deps: { anthropic: '>=0.40', pillow: '>=10.0', pyautogui: '>=0.9' },
      verifiedAt: '2026-09',
      note: '⚠️ IMPORTANTE: Ejecutar este código solo en un entorno sandboxed (VM, Docker con display virtual). Nunca en una máquina de producción. El agente tiene control completo del ratón y teclado.',
    },
  ],
  quiz: [
    {
      q: '¿Cuál es el ciclo básico de computer use?',
      options: [
        'Screenshot → modelo analiza la imagen y decide la acción → acción se ejecuta → nuevo screenshot → repetir.',

        'El modelo modifica directamente los archivos del sistema.',

        'El modelo escribe código que se ejecuta automáticamente.',
        'El modelo accede a la API del sistema operativo.',
      ],
      answer: 0,
      explain:
        'Computer use es esencialmente un bucle visual: el modelo ve la pantalla (imagen), decide qué hacer (clic, escritura, etc.), el código ejecuta esa acción, toma una nueva captura, y el modelo la analiza para decidir el siguiente paso. Es exactamente como lo haría un humano, pero automatizado.',
    },
    {
      q: '¿Por qué es CRÍTICO ejecutar computer use en un entorno sandboxed?',
      options: [
        'Porque el modelo necesita más memoria.',
        'Porque el agente tiene control total del ratón y teclado y puede hacer cualquier cosa que haría un humano en esa máquina — incluyendo borrar archivos, enviar emails, hacer compras o acceder a cuentas.',
        'Por limitaciones técnicas del modelo.',
        'Para mejorar la velocidad.',
      ],
      answer: 1,
      explain:
        'Un agente de computer use con acceso a tu máquina principal puede hacer cualquier cosa que tú puedes hacer. Si es inyectado (una página web con instrucciones maliciosas), puede exfiltrar datos, enviar emails, hacer transacciones. Sandbox en VM o Docker con permisos mínimos es no negociable.',
    },
    {
      q: '¿Cuál es la diferencia entre computer use y tool calling convencional?',
      options: [
        'Computer use es más lento.',
        'Son idénticos.',

        'Tool calling llama a funciones/APIs definidas por el desarrollador; computer use controla directamente la interfaz gráfica (GUI) de cualquier aplicación sin necesidad de API, igual que lo haría un humano.',

        'Computer use solo funciona en Windows.',
      ],
      answer: 2,
      explain:
        'Tool calling requiere que el desarrollador defina explícitamente qué herramientas existen. Computer use no necesita esto: puede usar cualquier aplicación instalada, cualquier sitio web, cualquier interfaz gráfica. Es más flexible pero también más impredecible y peligroso.',
    },
    {
      q: '¿Para qué tipos de aplicaciones es especialmente valioso computer use?',
      options: [
        'Para todas las aplicaciones.',
        'Para aplicaciones legadas o sistemas que no tienen API pero sí interfaz gráfica — sistemas ERP empresariales, aplicaciones desktop antiguas, portales web que no exponen APIs.',
        'Solo para aplicaciones web.',
        'Solo para aplicaciones de Microsoft.',
      ],
      answer: 1,
      explain:
        'El mayor valor de computer use está en la automatización de sistemas que no tienen API. Una empresa puede tener un sistema de gestión de 1990 sin API pero con interfaz gráfica — computer use puede automatizar operaciones en él sin necesidad de integración técnica.',
    },
  ],
  misconceptions: [
    {
      myth: 'Computer use es completamente confiable para tareas autónomas de producción.',
      reality:
        'En 2026, computer use tiene tasas de error no triviales, especialmente en tareas de múltiples pasos con interfaces complejas. Es más adecuado para automatización con supervisión humana o para casos donde los errores son recuperables. Para flujos críticos o irreversibles, siempre incluye puntos de control humano.',
    },
    {
      myth: 'Computer use no tiene riesgo de prompt injection.',
      reality:
        'El contenido visual en pantalla (texto en páginas web, documentos) puede contener instrucciones que el modelo interpreta como comandos. Una página web maliciosa puede intentar hacer que el agente tome acciones no autorizadas. El sandboxing y el mínimo privilegio son esenciales.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Computer use documentation',
      url: 'https://docs.anthropic.com/en/docs/build-with-claude/computer-use',
      kind: 'docs',
    },
    {
      title: 'Anthropic · Computer use research',
      url: 'https://www.anthropic.com/news/3-5-models-and-computer-use',
      kind: 'blog',
    },
  ],
}

export default details
