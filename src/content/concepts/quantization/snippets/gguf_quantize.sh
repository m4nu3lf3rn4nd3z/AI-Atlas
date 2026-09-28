# llama.cpp: convertir un modelo de Hugging Face a GGUF y cuantizarlo
python convert_hf_to_gguf.py ./Qwen3-8B --outtype bf16 --outfile qwen3-8b-bf16.gguf
./build/bin/llama-quantize qwen3-8b-bf16.gguf qwen3-8b-Q4_K_M.gguf Q4_K_M

# Ollama: la etiqueta elige la cuantización
ollama pull qwen3:8b-q4_K_M
ollama pull qwen3:8b-q8_0

# Ollama: KV cache en 8 bits (requiere flash attention)
OLLAMA_FLASH_ATTENTION=1 OLLAMA_KV_CACHE_TYPE=q8_0 ollama serve
