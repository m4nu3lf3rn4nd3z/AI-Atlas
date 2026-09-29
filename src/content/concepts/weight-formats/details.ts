import type { ConceptDetails } from '../../schema'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Cargar safetensors con transformers',
      lang: 'python',
      code: `from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

model_id = "Qwen/Qwen2.5-7B-Instruct"

# Descarga automáticamente safetensors desde Hugging Face Hub
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(
    model_id,
    torch_dtype=torch.bfloat16,   # BF16 para GPUs modernas
    device_map="auto",             # distribuye automáticamente entre GPUs
)

inputs = tokenizer("El KV cache almacena", return_tensors="pt").to(model.device)
output = model.generate(**inputs, max_new_tokens=50)
print(tokenizer.decode(output[0], skip_special_tokens=True))
`,
      deps: { transformers: '>=4.45', torch: '>=2.2', accelerate: '>=0.34' },
      verifiedAt: '2026-09',
      note: 'Descarga ~15 GB para el 7B en BF16. device_map="auto" gestiona la distribución entre múltiples GPUs automáticamente.',
    },
    {
      title: 'Convertir a GGUF con llama.cpp',
      lang: 'bash',
      code: `# 1. Clonar llama.cpp
git clone https://github.com/ggml-org/llama.cpp
cd llama.cpp && cmake -B build && cmake --build build --config Release -j 8

# 2. Convertir de safetensors a GGUF (F16)
python convert_hf_to_gguf.py /ruta/al/modelo --outfile modelo-f16.gguf --outtype f16

# 3. Cuantizar a Q4_K_M (balance calidad/tamaño)
./build/bin/llama-quantize modelo-f16.gguf modelo-Q4_K_M.gguf Q4_K_M

# 4. Verificar el resultado
./build/bin/llama-cli -m modelo-Q4_K_M.gguf -p "Hola" -n 50
`,
      deps: { 'llama.cpp': 'build (2026)' },
      verifiedAt: '2026-09',
      note: 'La mayoría de usuarios descarga GGUF ya convertido desde Hugging Face. Solo necesitas este proceso para modelos que no tienen versión GGUF disponible.',
    },
  ],
  quiz: [
    {
      q: 'Ves un fichero llamado "Llama-3.3-70B-Q4_K_M.gguf". ¿Qué información te da el nombre?',
      options: [
        'Es un modelo de 4B parámetros.',
        'Es el modelo Llama 3.3 de 70B parámetros, en formato GGUF, cuantizado a ~4,9 bits con el método K_M de llama.cpp.',
        'El modelo usa Q4 bits de activaciones.',
        'K_M es el proveedor del modelo.',
      ],
      answer: 1,
      explain:
        'El nombre del fichero GGUF codifica: nombre del modelo (Llama-3.3-70B), formato (GGUF implícito), y cuantización (Q4_K_M = ~4,9 bits por peso con escala por grupos de tipo K, variante medium).',
    },
    {
      q: '¿Por qué safetensors es más seguro que los ficheros .pt (pickle) de PyTorch?',
      options: [
        'Porque está cifrado.',
        'Porque es más pequeño.',
        'Porque no ejecuta código Python arbitrario al deserializar, a diferencia de los pickles.',
        'Porque usa compresión.',
      ],
      answer: 2,
      explain:
        'Los ficheros pickle ejecutan código Python al deserializarse. Un fichero .pt malicioso puede ejecutar código arbitrario en tu máquina al cargarlo. safetensors solo contiene datos de tensores y metadatos JSON, sin ejecución de código.',
    },
    {
      q: '¿Cuál es el formato más adecuado para correr un modelo de 7B en un Mac con Apple Silicon M3?',
      options: [
        'safetensors en CUDA.',
        'GGUF con Ollama o GPTQ.',
        'MLX (Apple Silicon framework) o GGUF vía Ollama/llama.cpp.',
        'ONNX con Python.',
      ],
      answer: 2,
      explain:
        'Apple Silicon tiene memoria unificada que comparte CPU/GPU. MLX está optimizado para ello. Ollama también usa llama.cpp con Metal y funciona bien. No soporta CUDA (es tecnología NVIDIA).',
    },
    {
      q: '¿Cuál es la diferencia entre AWQ y GPTQ?',
      options: [
        'AWQ es más nuevo y GPTQ está obsoleto.',
        'AWQ protege pesos sensibles según las activaciones; GPTQ minimiza el error cuantizando columna a columna. Ambos usan calibración y son superiores al redondeo simple.',
        'AWQ es para GPU y GPTQ para CPU.',
        'No hay diferencia práctica.',
      ],
      answer: 1,
      explain:
        'Ambos son métodos de cuantización post-entrenamiento de alta calidad. AWQ identifica y protege los canales más importantes para las activaciones. GPTQ minimiza el error cuantizando columna a columna con datos de calibración. Ambos producen mejores resultados que el redondeo simple (RTN).',
    },
  ],
  misconceptions: [
    {
      myth: 'GGUF es un tipo de cuantización.',
      reality:
        'GGUF es un formato de fichero de llama.cpp que puede contener pesos en cualquier precisión: F16, Q8_0, Q4_K_M, etc. La cuantización es el tipo numérico de los pesos que van dentro del fichero.',
    },
    {
      myth: 'Solo puedo usar un modelo si está en el formato de mi runtime favorito.',
      reality:
        'La mayoría de modelos populares tienen versiones en múltiples formatos en Hugging Face Hub. Si no existe la versión que necesitas, puedes convertir tú mismo con las herramientas de llama.cpp, transformers o mlx-lm.',
    },
  ],
  sources: [
    {
      title: 'Hugging Face · safetensors documentation',
      url: 'https://huggingface.co/docs/safetensors/',
      kind: 'docs',
    },
    {
      title: 'llama.cpp · GGUF format specification',
      url: 'https://github.com/ggml-org/llama.cpp/blob/master/docs/gguf.md',
      kind: 'docs',
    },
    {
      title: 'Lin et al. (2023) · AWQ: Activation-aware Weight Quantization',
      url: 'https://arxiv.org/abs/2306.00978',
      kind: 'paper',
    },
  ],
}

export default details
