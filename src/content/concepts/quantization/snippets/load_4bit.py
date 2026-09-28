# Cargar un modelo en 4 bits (NF4) con transformers + bitsandbytes (GPU NVIDIA).
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig

model_id = "Qwen/Qwen3-8B"
bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",  # NormalFloat de 4 bits, el formato de QLoRA
    bnb_4bit_use_double_quant=True,  # cuantiza también las escalas
    bnb_4bit_compute_dtype=torch.bfloat16,  # las multiplicaciones se hacen en BF16
)
model = AutoModelForCausalLM.from_pretrained(model_id, quantization_config=bnb, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_id)

print(f"{model.get_memory_footprint() / 1024**3:.1f} GiB")  # ≈ 5,5–6 GiB en vez de ≈ 15 GiB

inputs = tokenizer.apply_chat_template(
    [{"role": "user", "content": "¿Qué es la cuantización?"}],
    add_generation_prompt=True,
    return_tensors="pt",
).to(model.device)
out = model.generate(inputs, max_new_tokens=200)
print(tokenizer.decode(out[0][inputs.shape[1] :], skip_special_tokens=True))
