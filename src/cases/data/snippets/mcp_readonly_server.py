# pip install "mcp[cli]"
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("crm-lectura")

CLIENTES = {
    "acme": {"nombre": "ACME S.A.", "estado": "piloto", "responsable": "Laura Gómez"},
}


@mcp.tool()
def buscar_cliente(nombre: str) -> dict:
    """Busca un cliente por nombre. Solo lectura: no modifica nada."""
    return CLIENTES.get(nombre.lower(), {"error": "no encontrado"})


@mcp.resource("clientes://{cliente_id}/resumen")
def resumen_cliente(cliente_id: str) -> str:
    """Resumen del cliente que la app host puede añadir al contexto."""
    c = CLIENTES.get(cliente_id, {})
    return f"{c.get('nombre', '?')}: fase {c.get('estado', '?')}, responsable {c.get('responsable', '?')}"


@mcp.prompt()
def preparar_reunion(cliente: str) -> str:
    """Plantilla que el usuario elige, por ejemplo como comando /preparar_reunion."""
    return f"Prepara una agenda de 30 minutos para la reunión con {cliente}, usando solo datos del CRM."


if __name__ == "__main__":
    mcp.run()  # transporte stdio por defecto: el host lanza este proceso
