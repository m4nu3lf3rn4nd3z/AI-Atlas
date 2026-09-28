# pip install torch transformers
from transformers import AutoModelForCausalLM, AutoTokenizer

name = "Qwen/Qwen2.5-0.5B-Instruct"
tok = AutoTokenizer.from_pretrained(name)
model = AutoModelForCausalLM.from_pretrained(name)

messages = [{"role": "user", "content": "Escribe un eslogan de 8 palabras para una app de idiomas."}]
inputs = tok.apply_chat_template(
    messages, add_generation_prompt=True, return_tensors="pt", return_dict=True
)
prompt_len = inputs["input_ids"].shape[1]

# Greedy: determinista en local
greedy = model.generate(**inputs, max_new_tokens=30, do_sample=False)

# Muestreo con temperatura y filtros
creative = model.generate(
    **inputs,
    max_new_tokens=30,
    do_sample=True,
    temperature=0.9,
    top_p=0.95,
    min_p=0.05,
    num_return_sequences=3,   # tres muestras distintas del mismo prompt
)

print("greedy:", tok.decode(greedy[0, prompt_len:], skip_special_tokens=True))
for seq in creative:
    print("muestra:", tok.decode(seq[prompt_len:], skip_special_tokens=True))
