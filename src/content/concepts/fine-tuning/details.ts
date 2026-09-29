import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Fine-tuning con Unsloth (QLoRA, 4-bit)',
      lang: 'python',
      code: `from unsloth import FastLanguageModel
from trl import SFTTrainer
from transformers import TrainingArguments
from datasets import load_dataset

# Cargar modelo base con QLoRA (4-bit + LoRA)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-7B-Instruct",
    max_seq_length=2048,
    load_in_4bit=True,   # QLoRA
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,              # rango del adapter LoRA
    lora_alpha=32,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    use_gradient_checkpointing="unsloth",
)

# Dataset en formato ShareGPT / chat
dataset = load_dataset("json", data_files="mi_dataset.jsonl", split="train")

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    args=TrainingArguments(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        max_steps=100,          # para una prueba rápida
        learning_rate=2e-4,
        fp16=not torch.cuda.is_bf16_supported(),
        bf16=torch.cuda.is_bf16_supported(),
        output_dir="outputs",
    ),
)

trainer.train()

# Guardar el adapter LoRA
model.save_pretrained("mi_adapter_lora")
tokenizer.save_pretrained("mi_adapter_lora")
`,
      deps: { unsloth: '>=2024.12', trl: '>=0.12', transformers: '>=4.45' },
      verifiedAt: '2026-09',
      note: 'Unsloth es 2x más rápido que Hugging Face + PEFT estándar y requiere menos VRAM. El adapter guardado (~40 MB) se puede distribuir por separado del modelo base.',
    },
    {
      title: 'Formato de dataset SFT (ShareGPT)',
      lang: 'python',
      code: `import json

# Formato ShareGPT para datasets de fine-tuning
# Cada línea del JSONL es una conversación completa

examples = [
    {
        "conversations": [
            {"from": "system", "value": "Eres un experto en derecho laboral español."},
            {"from": "human", "value": "¿Cuántos días de vacaciones corresponden por convenio general?"},
            {"from": "gpt", "value": "El Estatuto de los Trabajadores establece un mínimo de 30 días naturales de vacaciones anuales (artículo 38). Los convenios colectivos pueden ampliar este mínimo, pero nunca reducirlo."},
        ]
    },
    {
        "conversations": [
            {"from": "system", "value": "Eres un experto en derecho laboral español."},
            {"from": "human", "value": "¿Qué es un ERTE?"},
            {"from": "gpt", "value": "Un ERTE (Expediente de Regulación Temporal de Empleo) es una medida temporal que permite a las empresas suspender contratos o reducir jornadas..."},
        ]
    },
]

# Guardar como JSONL
with open("mi_dataset.jsonl", "w", encoding="utf-8") as f:
    for example in examples:
        f.write(json.dumps(example, ensure_ascii=False) + "\\n")

print(f"Dataset guardado: {len(examples)} ejemplos")
`,
      deps: {},
      verifiedAt: '2026-09',
      note: 'La calidad del dataset es más importante que la cantidad. 100 ejemplos bien redactados y revisados superan a 10.000 generados automáticamente sin revisión.',
    },
  ],
  quiz: [
    {
      q: '¿Qué problema resuelve LoRA respecto al fine-tuning completo?',
      options: [
        'LoRA reduce drásticamente los parámetros entrenables (0.1–1% del total) congelando el modelo base y entrenando solo matrices de adaptación de rango bajo, reduciendo el coste de VRAM y cómputo.',

        'LoRA es más preciso.',

        'LoRA permite usar modelos más grandes.',
        'LoRA elimina la necesidad de un dataset.',
      ],
      answer: 0,
      explain:
        'LoRA (Low-Rank Adaptation) añade matrices A×B de rango bajo a capas del modelo. Solo estas matrices se entrenan. El modelo base permanece congelado. Esto reduce los parámetros entrenables de miles de millones a solo decenas de millones, haciendo el fine-tuning viable en GPUs de consumo.',
    },
    {
      q: '¿Cuál es la diferencia entre SFT y DPO?',
      options: [
        'SFT es más nuevo que DPO.',
        'SFT enseña "qué responder" (aprendizaje supervisado de pares input-output); DPO enseña "cuál de dos respuestas es mejor" usando pares (elegida, rechazada) para alinear el comportamiento.',
        'DPO solo funciona para modelos grandes.',
        'No hay diferencia práctica.',
      ],
      answer: 1,
      explain:
        'SFT (Supervised Fine-Tuning) entrena el modelo para generar outputs correctos dado un input. DPO (Direct Preference Optimization) entrena el modelo para preferir una respuesta sobre otra, usando pares {chosen, rejected} — es más eficiente que RLHF y produce mejor alineamiento.',
    },
    {
      q: '¿Cuándo NO tiene sentido hacer fine-tuning?',
      options: [
        'Cuando se necesita un formato de output muy específico.',
        'Cuando el dataset tiene más de 1.000 ejemplos.',

        'Cuando se necesita añadir conocimiento que cambia frecuentemente o que el modelo base no tiene (como datos de tu empresa). Para eso, RAG es mejor.',

        'Cuando el modelo base es de open-weights.',
      ],
      answer: 2,
      explain:
        'Fine-tuning no "inyecta conocimiento" de forma actualizable. Si necesitas que el modelo conozca datos que cambian (precios, noticias, políticas internas), RAG es mejor: recuperas la información actualizada en el momento de la consulta.',
    },
    {
      q: '¿Qué es QLoRA?',
      options: [
        'Un modelo cuantizado listo para usar.',
        'LoRA + cuantización del modelo base a 4-bit con NF4, lo que permite hacer fine-tuning de modelos de 7B+ en GPUs de 16 GB de VRAM.',
        'Un dataset de fine-tuning curado.',
        'Un método de evaluación de modelos.',
      ],
      answer: 1,
      explain:
        'QLoRA (Quantized LoRA) combina LoRA con cuantización en 4-bit del modelo base. El modelo base se carga cuantizado (menos VRAM), y solo el adapter LoRA se entrena en FP16/BF16. Esto hace posible fine-tunear Llama 3 8B en una GPU de consumo con 16 GB.',
    },
  ],
  misconceptions: [
    {
      myth: 'Fine-tuning siempre mejora el rendimiento del modelo base.',
      reality:
        'Fine-tuning en un dataset de mala calidad o demasiado pequeño puede degradar el rendimiento general del modelo (catastrofic forgetting) sin mejorar el dominio objetivo. La calidad del dataset es más importante que el método.',
    },
    {
      myth: 'Con fine-tuning puedo usar un modelo pequeño para cualquier tarea.',
      reality:
        'Fine-tuning no puede añadir capacidades que el modelo base no tiene. Un modelo de 7B fine-tuneado no alcanzará a un 70B en razonamiento complejo. Fine-tuning mejora el comportamiento en dominio, no las capacidades cognitivas del modelo.',
    },
    {
      myth: 'Necesito decenas de miles de ejemplos para hacer fine-tuning.',
      reality:
        'Para adaptar el estilo o formato, 50–200 ejemplos pueden ser suficientes. Para enseñar conocimiento de dominio especializado se necesitan más. La clave es la calidad y diversidad, no la cantidad raw.',
    },
  ],
  sources: [
    {
      title: 'Hu et al. (2021) · LoRA: Low-Rank Adaptation of Large Language Models',
      url: 'https://arxiv.org/abs/2106.09685',
      kind: 'paper',
    },
    {
      title: 'Dettmers et al. (2023) · QLoRA: Efficient Finetuning of Quantized LLMs',
      url: 'https://arxiv.org/abs/2305.14314',
      kind: 'paper',
    },
    {
      title: 'Unsloth · Documentación y ejemplos de fine-tuning',
      url: 'https://docs.unsloth.ai/',
      kind: 'docs',
    },
  ],
}

export default details
