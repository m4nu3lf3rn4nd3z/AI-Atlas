# Prompt caching con Claude: el prefijo estable se escribe una vez y se lee barato después.
import anthropic

client = anthropic.Anthropic()
manual = open("manual_soporte.md", encoding="utf-8").read()  # decenas de miles de tokens, estable


def ask(question: str):
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=1024,
        system=[
            {"type": "text", "text": "Eres el asistente de soporte. Responde con el manual y cita la sección."},
            # Todo hasta aquí (incluido) forma el prefijo cacheado
            {"type": "text", "text": manual, "cache_control": {"type": "ephemeral"}},
        ],
        messages=[{"role": "user", "content": question}],  # lo variable, al final
    )
    u = response.usage
    print(
        f"escritos en caché: {u.cache_creation_input_tokens} · leídos de caché: {u.cache_read_input_tokens} · "
        f"sin caché: {u.input_tokens}"
    )
    return response


ask("¿Cuántos días hay para devolver un pedido?")  # 1.ª vez: escribe la caché
ask("¿Qué hago si un paquete llega dañado?")  # dentro del TTL: lee la caché (10 % del precio)
