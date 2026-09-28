# pip install anthropic pydantic
import sqlite3

import anthropic
from pydantic import BaseModel

client = anthropic.Anthropic()

# Conexión de SOLO LECTURA: aunque el modelo genere un UPDATE, la base de datos lo rechaza
db = sqlite3.connect("file:tienda.db?mode=ro", uri=True)

ESQUEMA = """orders(id, customer_email, created_at, status, is_test, total)
order_items(order_id, product_id, qty, price)
products(id, category_id, name)
categories(id, category_name)"""


class Consulta(BaseModel):
    sql: str
    explicacion: str


def preguntar(pregunta: str, max_intentos: int = 3) -> list[tuple]:
    mensajes = [{
        "role": "user",
        "content": f"Esquema:\n{ESQUEMA}\n\nEscribe UNA consulta SQLite de solo lectura para: {pregunta}",
    }]
    for _ in range(max_intentos):
        respuesta = client.messages.parse(
            model="claude-opus-5-5",
            max_tokens=2000,
            messages=mensajes,
            output_format=Consulta,  # salida estructurada: siempre {sql, explicacion}
        )
        consulta = respuesta.parsed_output
        if not consulta.sql.lstrip().lower().startswith(("select", "with")):
            error = "Solo se permiten consultas de lectura (SELECT)."
        else:
            try:
                return db.execute(consulta.sql).fetchmany(500)
            except sqlite3.Error as e:
                error = str(e)
        # Reintento: el modelo ve su propia consulta y el error exacto
        mensajes += [
            {"role": "assistant", "content": consulta.model_dump_json()},
            {"role": "user", "content": f"La consulta falló: {error}. Corrígela."},
        ]
    raise RuntimeError(f"Sin consulta válida tras {max_intentos} intentos")


print(preguntar("las 5 categorías con más ventas del último trimestre"))
