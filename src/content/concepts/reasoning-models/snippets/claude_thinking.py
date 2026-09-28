# pip install anthropic
import anthropic

client = anthropic.Anthropic()  # lee ANTHROPIC_API_KEY o un perfil de `ant auth login`

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=16000,
    # El modelo decide cuánto pensar; "summarized" devuelve un resumen legible
    thinking={"type": "adaptive", "display": "summarized"},
    output_config={"effort": "high"},  # low | medium | high | xhigh | max
    # Si un filtro de seguridad rechaza la petición, se reintenta en otro modelo
    betas=["server-side-fallback-2026-07-01"],
    fallbacks="default",
    messages=[{
        "role": "user",
        "content": "Un tren sale a las 9:40. Viaja 2 h 35 min y hace 3 paradas de 7 min. ¿A qué hora llega?",
    }],
)

if response.stop_reason == "refusal":
    print("Rechazada:", response.stop_details)
else:
    for block in response.content:
        if block.type == "thinking":
            print("RESUMEN DEL RAZONAMIENTO:\n", block.thinking)
        elif block.type == "text":
            print("RESPUESTA:\n", block.text)

# El razonamiento se factura como salida, aunque solo veas un resumen
print(response.usage.output_tokens, "tokens de salida")
