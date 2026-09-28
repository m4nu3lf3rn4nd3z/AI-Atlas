# pip install temporalio anthropic pydantic
from datetime import timedelta

from pydantic import BaseModel
from temporalio import activity, workflow
from temporalio.common import RetryPolicy

with workflow.unsafe.imports_passed_through():
    import anthropic


class Factura(BaseModel):
    proveedor: str
    numero: str
    fecha: str
    total: float
    iban: str


@activity.defn
async def extraer(texto: str) -> dict:
    """Salida estructurada: la API garantiza que cumple el esquema de Factura."""
    client = anthropic.AsyncAnthropic()
    response = await client.messages.parse(
        model="claude-opus-5-5",
        max_tokens=2000,
        messages=[{"role": "user", "content": f"Extrae los datos de esta factura:\n\n{texto}"}],
        output_format=Factura,
    )
    return response.parsed_output.model_dump()


@activity.defn
async def registrar_pago(factura: dict, clave_idempotencia: str) -> None:
    # La API de pagos recibe la clave: si Temporal reintenta la activity, no se paga dos veces
    ...


@workflow.defn
class ProcesarFactura:
    def __init__(self) -> None:
        self.aprobada: bool | None = None

    @workflow.signal
    def decidir(self, aprobada: bool) -> None:
        """La envía el botón de Slack a través de tu backend."""
        self.aprobada = aprobada

    @workflow.run
    async def run(self, factura_id: str, texto: str, iban_registrado: str) -> str:
        datos = await workflow.execute_activity(
            extraer, texto,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=RetryPolicy(maximum_attempts=3),
        )
        if datos["total"] > 5_000 or datos["iban"] != iban_registrado:
            # (aquí otra activity publicaría el mensaje en Slack)
            # El workflow espera la señal sin ocupar un worker, aunque tarde días
            await workflow.wait_condition(lambda: self.aprobada is not None)
            if not self.aprobada:
                return "rechazada"

        await workflow.execute_activity(
            registrar_pago, args=[datos, f"{factura_id}-pago"],
            start_to_close_timeout=timedelta(minutes=1),
        )
        return "pagada"
