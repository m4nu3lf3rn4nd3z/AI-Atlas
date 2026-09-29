import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Agente de código básico con herramientas de filesystem',
      lang: 'python',
      code: `import anthropic
import os
import subprocess

client = anthropic.Anthropic()

# Directorio de trabajo del agente (aislado del sistema)
WORK_DIR = "/tmp/agent-workspace"
os.makedirs(WORK_DIR, exist_ok=True)

def read_file(path: str) -> str:
    """Lee un archivo del workspace del agente."""
    full_path = os.path.join(WORK_DIR, path.lstrip("/"))
    if not os.path.exists(full_path):
        return f"Error: archivo '{path}' no encontrado"
    with open(full_path) as f:
        return f.read()

def write_file(path: str, content: str) -> str:
    """Escribe un archivo en el workspace."""
    full_path = os.path.join(WORK_DIR, path.lstrip("/"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
    return f"Archivo escrito: {path} ({len(content)} chars)"

def run_tests(test_command: str = "python -m pytest") -> str:
    """Ejecuta tests en el workspace. Solo permite comandos de test."""
    safe_commands = ["python -m pytest", "npm test", "python -m unittest"]
    if not any(test_command.startswith(cmd) for cmd in safe_commands):
        return f"Error: comando '{test_command}' no permitido. Solo comandos de test."
    result = subprocess.run(
        test_command.split(), capture_output=True, text=True, cwd=WORK_DIR, timeout=30
    )
    return f"STDOUT:\\n{result.stdout}\\nSTDERR:\\n{result.stderr}\\nExitCode: {result.returncode}"

tools = [
    {"name": "read_file", "description": "Lee un archivo", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]}},
    {"name": "write_file", "description": "Escribe un archivo", "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]}},
    {"name": "run_tests", "description": "Ejecuta la suite de tests", "input_schema": {"type": "object", "properties": {"test_command": {"type": "string"}}, "required": []}},
]
executors = {"read_file": read_file, "write_file": write_file, "run_tests": run_tests}

def coding_agent(task: str) -> str:
    messages = [{"role": "user", "content": task}]
    for _ in range(15):
        response = client.messages.create(model="claude-opus-5-5", max_tokens=2048, tools=tools, messages=messages)
        if response.stop_reason == "end_turn":
            return response.content[0].text
        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                result = executors.get(block.name, lambda **kw: "Herramienta no disponible")(**block.input)
                tool_results.append({"type": "tool_result", "tool_use_id": block.id, "content": str(result)})
        messages.extend([{"role": "assistant", "content": response.content}, {"role": "user", "content": tool_results}])
    return "Límite de pasos alcanzado"
`,
      deps: { anthropic: '>=0.40' },
      verifiedAt: '2026-09',
      note: 'Este agente está intencionalmente limitado: solo puede leer/escribir en WORK_DIR y ejecutar comandos de test seguros. En producción, usa un sandbox completo (Docker o E2B) en lugar de restricciones en el código.',
    },
  ],
  quiz: [
    {
      q: '¿Qué hace que SWE-bench sea un mejor predictor del rendimiento real de un coding agent que HumanEval?',
      options: [
        'SWE-bench usa issues reales de GitHub que requieren navegar codebases existentes, entender contexto amplio, hacer cambios quirúrgicos y pasar tests preexistentes — todo lo que hace la ingeniería real, no completar funciones aisladas.',

        'SWE-bench tiene más preguntas.',

        'HumanEval es demasiado fácil.',
        'SWE-bench fue creado más recientemente.',
      ],
      answer: 0,
      explain:
        'HumanEval y MBPP miden "¿puede el modelo completar esta función Python dado este docstring?" — una tarea aislada sin contexto. SWE-bench mide "¿puede el modelo navegar el repo, entender el bug, hacer el fix correcto sin romper otros tests?" Esto último es lo que hacen los desarrolladores de verdad, y los modelos son mucho menos exitosos en ello.',
    },
    {
      q: '¿Cuál es la "paradoja" de los coding agents mencionada en este concepto?',
      options: [
        'Son más lentos que los humanos.',
        'Son más útiles exactamente donde es más difícil verificar sus cambios (codebases grandes y complejas), lo que hace que la suite de tests sea el contrato más importante — sin tests robustos, no hay forma de saber si el agente hizo lo correcto.',
        'Solo funcionan con Python.',
        'Requieren acceso a internet.',
      ],
      answer: 1,
      explain:
        'Un coding agent en un codebase de 2 líneas es fácil de verificar manualmente. Un coding agent en un codebase de 500.000 líneas es imposible de verificar manualmente — pero ahí es exactamente donde más valor aporta. Esta paradoja se resuelve con una buena suite de tests que actúa como verificador automático.',
    },
    {
      q: '¿Por qué un coding agent necesita herramienta de búsqueda en el codebase además de lectura de archivos?',
      options: [
        'Por rendimiento.',
        'Porque los LLMs no pueden leer archivos grandes.',

        'Para navegar codebases grandes, el agente necesita encontrar dónde está la función relevante sin leer miles de archivos. grep, búsqueda semántica o ast parsing permite llegar al contexto correcto en pocos pasos.',

        'Solo para proyectos con más de 100 archivos.',
      ],
      answer: 2,
      explain:
        'Leer archivos uno por uno en un codebase grande (1.000+ archivos) es ineficiente y costoso en tokens. Una herramienta de búsqueda (grep para símbolos, búsqueda semántica para conceptos) permite al agente navegar directamente al código relevante. Es la diferencia entre buscar en un índice y leer todo el libro.',
    },
    {
      q: '¿Qué información CRÍTICA debe darse a un coding agent para maximizar la calidad del resultado?',
      options: [
        'Solo el archivo a modificar.',
        'Contexto rico: comportamiento esperado vs comportamiento actual, archivos relevantes, tests que deben pasar, constraints de la arquitectura del proyecto, y cualquier decisión de diseño relevante.',
        'Solo el mensaje de error.',
        'Solo el nombre de la función a arreglar.',
      ],
      answer: 1,
      explain:
        'Los coding agents no tienen magia: si el contexto es ambiguo, el resultado será ambiguo. Describir el comportamiento esperado (no solo el bug), señalar los archivos relevantes, indicar los tests que deben pasar, y mencionar constraints de arquitectura multiplica la calidad del resultado.',
    },
  ],
  misconceptions: [
    {
      myth: 'Los coding agents actuales pueden reemplazar a desarrolladores para cualquier tarea.',
      reality:
        'Los mejores coding agents resuelven el 50-60% de los issues de SWE-bench (problemas de dificultad moderada, bien descritos). Para arquitectura de sistemas, decisiones de producto, debug de problemas complejos de concurrencia, o integración de sistemas legacy complicados, los desarrolladores humanos siguen siendo esenciales.',
    },
    {
      myth: 'Un coding agent con acceso completo al sistema es más útil que uno limitado.',
      reality:
        'Un coding agent con permisos mínimos (solo el directorio del proyecto, solo comandos de test) es mucho más seguro y casi igual de útil para las tareas habituales. Los permisos extra rara vez son necesarios y multiplican el riesgo de daño accidental o malicioso.',
    },
  ],
  sources: [
    {
      title: 'Anthropic · Claude Code documentation',
      url: 'https://docs.anthropic.com/en/docs/claude-code',
      kind: 'docs',
    },
    {
      title: 'Yang et al. (2024) · SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering',
      url: 'https://arxiv.org/abs/2405.15793',
      kind: 'paper',
    },
    {
      title: 'Jimenez et al. (2023) · SWE-bench: Can Language Models Resolve Real-World GitHub Issues?',
      url: 'https://arxiv.org/abs/2310.06770',
      kind: 'paper',
    },
  ],
}

export default details
