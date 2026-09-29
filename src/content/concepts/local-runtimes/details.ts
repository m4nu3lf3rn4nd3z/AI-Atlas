import type { ConceptDetails } from '../../schema'
import llamaServer from './snippets/llama_server.sh?raw'
import ollamaChat from './snippets/ollama_chat.py?raw'

const details: ConceptDetails = {
  reviewedAt: '2026-09',
  snippets: [
    {
      title: 'Ollama desde Python con contexto ampliado',
      lang: 'python',
      code: ollamaChat,
      deps: { ollama: '>=0.4' },
      verifiedAt: '2026-09',
    },
    {
      title: 'llama-server y Modelfile de Ollama',
      lang: 'bash',
      code: llamaServer,
      deps: { 'llama.cpp': 'master (2026)', ollama: '>=0.5' },
      verifiedAt: '2026-09',
    },
  ],
  quiz: [
    {
      q: 'Tu RAG funciona bien con la API, pero en Ollama ignora los documentos del final del prompt. ¿Qué revisas primero?',
      options: [
        'La temperatura.',
        'El tamaño de contexto (num_ctx): por defecto es corto y lo que no cabe se trunca sin avisar.',
        'La versión de Python.',
        'Si el modelo está en GGUF.',
      ],
      answer: 1,
      explain: 'Ollama arranca con 4.096 tokens de contexto por defecto. Un prompt de RAG largo se trunca y el modelo nunca ve parte de los documentos.',
    },
    {
      q: 'El modelo no cabe entero en tu GPU y llama.cpp deja 10 de 40 capas en la CPU. ¿Qué esperas?',
      options: [
        'Que funcione, pero bastante más lento: cada token tiene que pasar por las capas de la CPU, limitadas por la memoria del sistema.',
        'Que no arranque.',
        'Que funcione igual de rápido.',
        'Que la calidad baje.',
      ],
      answer: 0,
      explain: 'La descarga parcial mantiene la calidad, pero la velocidad la marca la parte más lenta. A menudo compensa más un modelo más pequeño o más cuantizado que quepa entero.',
    },
    {
      q: '¿Qué ventaja tiene que el runtime local exponga una API compatible con OpenAI?',
      options: [
        'Que el modelo local se vuelve tan capaz como los de OpenAI.',
        'Que no hace falta cuantizar.',
        'Que el mismo código cliente sirve para el modelo local y para uno en la nube cambiando la URL base.',
        'Que añade autenticación.',
      ],
      answer: 2,
      explain: 'La compatibilidad de API permite prototipar en local y desplegar con otro proveedor, o usar un gateway que reparta entre ambos.',
    },
    {
      q: '¿Qué pasa si arrancas Ollama con OLLAMA_HOST=0.0.0.0 en un servidor con IP pública?',
      options: [
        'Nada: Ollama pide contraseña.',
        'Solo se puede consultar la lista de modelos.',
        'Mejora el rendimiento.',
        'Cualquiera que alcance el puerto puede usar, descargar o borrar modelos: Ollama no tiene autenticación.',
      ],
      answer: 3,
      explain: 'Por defecto escucha solo en 127.0.0.1. Para compartirlo, ponlo detrás de un proxy con autenticación o una VPN.',
    },
  ],
  misconceptions: [
    {
      myth: 'Ollama es un modelo.',
      reality: 'Es un runtime: descarga y ejecuta modelos de otros (Qwen, Llama, Gemma, gpt-oss…) sobre la base de llama.cpp.',
    },
    {
      myth: 'En local el modelo usa todo el contexto que anuncia.',
      reality: 'Usa el que configures. Muchos runtimes arrancan con un contexto corto para ahorrar memoria.',
    },
  ],
  sources: [
    {
      title: 'Ollama · FAQ (contexto, host, keep_alive)',
      url: 'https://docs.ollama.com/faq',
      kind: 'docs',
    },
    {
      title: 'Ollama · OpenAI compatibility',
      url: 'https://docs.ollama.com/openai',
      kind: 'docs',
    },
    {
      title: 'llama.cpp · llama-server',
      url: 'https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md',
      kind: 'repo',
    },
    {
      title: 'MLX LM · Run LLMs with MLX',
      url: 'https://github.com/ml-explore/mlx-lm',
      kind: 'repo',
    },
  ],
}

export default details
