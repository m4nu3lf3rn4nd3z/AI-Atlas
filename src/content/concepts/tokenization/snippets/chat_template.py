# pip install transformers
from transformers import AutoTokenizer

# Un modelo abierto trae su propio tokenizador (distinto del de OpenAI)
tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-0.5B-Instruct")

text = "La tokenización no es trivial"
print(tok.tokenize(text))                # los espacios aparecen como 'Ġ'
print(len(tok(text)["input_ids"]))

# La plantilla de chat envuelve cada mensaje con tokens especiales de rol.
# Esto es lo que el modelo recibe de verdad cuando usas `messages`.
messages = [
    {"role": "system", "content": "Eres un asistente conciso."},
    {"role": "user", "content": text},
]
prompt = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
print(prompt)
print(len(tok(prompt)["input_ids"]), "tokens en total, incluidos los especiales")
