# Inspeccionar un fichero GGUF: metadatos, plantilla de chat y tipo de cada tensor.
from collections import Counter

from gguf import GGUFReader

reader = GGUFReader("qwen3-8b-Q4_K_M.gguf")

for key in reader.fields:
    if key.startswith(("general.", "tokenizer.chat_template")) or key.endswith("context_length"):
        print(key)  # arquitectura, nombre, contexto, plantilla de chat…

# Una «Q4_K_M» mezcla tipos: los tensores más sensibles llevan más bits
print(Counter(t.tensor_type.name for t in reader.tensors))
for t in reader.tensors[:5]:
    print(f"{t.name:<32} {t.tensor_type.name:<6} {list(t.shape)}")
