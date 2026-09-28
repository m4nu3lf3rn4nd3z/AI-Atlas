# pip install trl datasets
# SFT mínimo con TRL: convierte un modelo base en uno que sigue instrucciones.
# Para experimentar necesitas GPU; en CPU funciona, pero muy despacio.
from datasets import load_dataset
from trl import SFTConfig, SFTTrainer

dataset = load_dataset("trl-lib/Capybara", split="train[:1%]")  # conversaciones en formato messages

trainer = SFTTrainer(
    model="Qwen/Qwen2.5-0.5B",            # modelo BASE (sin ajuste de chat)
    train_dataset=dataset,
    args=SFTConfig(output_dir="qwen-sft", max_steps=100, logging_steps=10),
)
trainer.train()
