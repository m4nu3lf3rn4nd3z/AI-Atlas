# pip install anthropic   ·   requiere Docker
import subprocess

import anthropic

REPO = "/ruta/a/tu/repo"
client = anthropic.Anthropic()

TOOLS = [{
    "name": "run_command",
    "description": "Ejecuta un comando de shell en un contenedor aislado con el repositorio en /repo. No hay red.",
    "input_schema": {
        "type": "object",
        "properties": {"command": {"type": "string", "description": "Comando a ejecutar"}},
        "required": ["command"],
        "additionalProperties": False,
    },
}]

# Comandos que no necesitan confirmación (todo lo demás, sí)
SAFE_PREFIXES = ("pytest", "python -m pytest", "ls", "cat ", "grep ", "git diff", "git status")


def run_in_sandbox(command: str) -> str:
    """Contenedor efímero: sin red, sin tus credenciales, solo el repositorio."""
    result = subprocess.run(
        ["docker", "run", "--rm", "--network", "none", "-v", f"{REPO}:/repo", "-w", "/repo",
         "python:3.12-slim", "sh", "-c", command],
        capture_output=True, text=True, timeout=300,
    )
    return (result.stdout + result.stderr)[-8000:]  # solo el final: el contexto es limitado


def approved(command: str) -> bool:
    if command.startswith(SAFE_PREFIXES):
        return True
    return input(f"¿Permitir `{command}`? [s/N] ").strip().lower() == "s"


messages = [{"role": "user", "content": "Arregla el issue #482 y comprueba que pasan todos los tests."}]
while True:
    response = client.beta.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        output_config={"effort": "high"},
        tools=TOOLS,
        messages=messages,
        # Si un filtro de seguridad rechaza la petición, se reintenta en otro modelo
        betas=["server-side-fallback-2026-07-01"],
        fallbacks="default",
    )
    if response.stop_reason != "tool_use":
        break  # terminado (o rechazado, o sin espacio): no hay herramientas que ejecutar

    messages.append({"role": "assistant", "content": response.content})
    results = []
    for block in response.content:
        if block.type != "tool_use":
            continue
        command = block.input["command"]
        if approved(command):
            output = run_in_sandbox(command)
            results.append({"type": "tool_result", "tool_use_id": block.id, "content": output})
        else:
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": "El usuario ha rechazado este comando.", "is_error": True})
    messages.append({"role": "user", "content": results})  # todos los resultados en un mensaje

print(next((b.text for b in response.content if b.type == "text"), f"Fin: {response.stop_reason}"))
