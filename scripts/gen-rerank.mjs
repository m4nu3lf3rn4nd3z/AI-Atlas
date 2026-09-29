// Precomputes real cross-encoder scores for the RAG lab: every sample
// question against every passage, with bge-reranker-v2-m3 (int8). The
// reranker is too heavy (571 MB) to download in the browser, so the lab
// only reranks the sample questions.
//
//   node scripts/gen-rerank.mjs

import { writeFileSync } from 'node:fs'
import { PASSAGES, QUESTIONS, passageText } from '../src/labs/rag/corpus.ts'
import { feeds, loadModel } from './onnx-helpers.mjs'

const MODEL = 'onnx-community/bge-reranker-v2-m3-ONNX'
const { tokenizer, session } = await loadModel(MODEL)

const sigmoid = (x) => 1 / (1 + Math.exp(-x))
const scores = {}
for (const [qi, q] of QUESTIONS.entries()) {
  const texts = PASSAGES.map(passageText)
  const enc = tokenizer(Array(texts.length).fill(q.q), { text_pair: texts, padding: true, truncation: true, max_length: 512 })
  const { logits } = await session.run(feeds(session, enc))
  scores[qi] = Object.fromEntries(PASSAGES.map((p, i) => [p.id, Number(sigmoid(logits.data[i]).toFixed(4))]))
  const best = Object.entries(scores[qi]).sort((a, b) => b[1] - a[1])[0]
  console.log(qi, q.q.slice(0, 50), '→', best[0], best[1])
}

writeFileSync(new URL('../src/labs/rag/rerank.json', import.meta.url), JSON.stringify({ model: MODEL, scores }) + '\n')
