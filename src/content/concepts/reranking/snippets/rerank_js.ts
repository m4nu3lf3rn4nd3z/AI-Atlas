// El mismo reranker en JavaScript con Transformers.js (Node o navegador).
// Es como se calcularon las puntuaciones del lab de RAG (scripts/gen-rerank.mjs).
import { AutoModelForSequenceClassification, AutoTokenizer } from '@huggingface/transformers'

const id = 'onnx-community/bge-reranker-v2-m3-ONNX'
const tokenizer = await AutoTokenizer.from_pretrained(id)
const model = await AutoModelForSequenceClassification.from_pretrained(id, { dtype: 'q8' }) // 571 MB

const query = '¿Puedo probar la integración sin generar envíos de verdad?'
const docs = [
  'El entorno sandbox funciona igual que producción, pero no genera recogidas reales ni cobros.',
  'La aplicación oficial para Shopify importa los pedidos cada 5 minutos.',
]

// Cada documento se empareja con la pregunta: el modelo los lee juntos.
const inputs = tokenizer(new Array(docs.length).fill(query), { text_pair: docs, padding: true, truncation: true })
const { logits } = await model(inputs)
const scores = (logits.tolist() as number[][]).map(([x]) => 1 / (1 + Math.exp(-x!))) // sigmoide: 0–1

docs
  .map((d, i) => ({ d, s: scores[i]! }))
  .sort((a, b) => b.s - a.s)
  .forEach(({ d, s }) => console.log(s.toFixed(4), d))
