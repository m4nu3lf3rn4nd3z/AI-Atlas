# llama.cpp: servidor con API compatible con OpenAI
#   -c    contexto en tokens     -ngl  capas en GPU (99 = todas)
./build/bin/llama-server -m qwen3-8b-Q4_K_M.gguf -c 16384 -ngl 99 --port 8080

# Cualquier cliente de Chat Completions sirve: solo cambia la URL base
curl http://localhost:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "¿Qué es GGUF?"}], "temperature": 0.7}'

# Ollama: fijar parámetros en un modelo derivado con un Modelfile
cat > Modelfile <<'EOF'
FROM qwen3:8b
PARAMETER num_ctx 16384
PARAMETER temperature 0.3
SYSTEM "Eres el asistente de soporte de Nortia. Responde en español y de forma breve."
EOF
ollama create soporte -f Modelfile
ollama run soporte "¿Cuánto tarda un envío a Canarias?"
