# pip install trl datasets
# DPO: aprende de pares (respuesta preferida, rechazada) sin modelo de recompensa.
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import DPOConfig, DPOTrainer

name = "Qwen/Qwen2.5-0.5B-Instruct"      # se parte de un modelo ya ajustado con SFT
model = AutoModelForCausalLM.from_pretrained(name)
tokenizer = AutoTokenizer.from_pretrained(name)

# Cada fila tiene "prompt", "chosen" y "rejected"
dataset = load_dataset("trl-lib/ultrafeedback_binarized", split="train[:1%]")

trainer = DPOTrainer(
    model=model,
    args=DPOConfig(output_dir="qwen-dpo", max_steps=100, logging_steps=10),
    processing_class=tokenizer,
    train_dataset=dataset,
)
trainer.train()
