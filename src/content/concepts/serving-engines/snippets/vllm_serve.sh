# vLLM: servidor compatible con OpenAI para un modelo abierto
#   --max-model-len             contexto máximo por secuencia (limita el KV cache reservado)
#   --gpu-memory-utilization    fracción de la VRAM que vLLM puede usar (pesos + KV cache)
#   --tensor-parallel-size      GPUs entre las que se reparte cada capa
vllm serve Qwen/Qwen3-8B --max-model-len 32768 --gpu-memory-utilization 0.90 --tensor-parallel-size 1 --port 8000

# O con Docker
docker run --gpus all -p 8000:8000 --ipc=host vllm/vllm-openai:latest \
  --model Qwen/Qwen3-8B --max-model-len 32768
