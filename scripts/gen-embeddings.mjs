// Precomputes real embeddings for the labs, so they work instantly without
// downloading the model in the browser. Uses the same model file and the
// same WASM runtime the browser loads on demand (multilingual-e5-small, int8).
//
//   node scripts/gen-embeddings.mjs
//
// The first run downloads the model (~118 MB) into .cache/.

import { writeFileSync } from 'node:fs'
import { E5_PASSAGE, E5_QUERY, QUERIES, SENTENCES } from '../src/labs/embeddings/data.ts'
import { PASSAGES, QUESTIONS, passageText } from '../src/labs/rag/corpus.ts'
import { feeds, loadModel, packVector } from './onnx-helpers.mjs'

export const MODEL = 'Xenova/multilingual-e5-small'
const { tokenizer, session } = await loadModel(MODEL)

/** Mean pooling over real tokens + L2 normalization, as in the E5 model card. */
async function embed(texts) {
  const out = []
  for (let i = 0; i < texts.length; i += 16) {
    const enc = tokenizer(texts.slice(i, i + 16), { padding: true, truncation: true, max_length: 512 })
    const { last_hidden_state: h } = await session.run(feeds(session, enc))
    const [b, s, d] = h.dims
    for (let r = 0; r < b; r++) {
      const v = new Float64Array(d)
      let n = 0
      for (let t = 0; t < s; t++) {
        if (!enc.attention_mask.data[r * s + t]) continue
        n++
        for (let k = 0; k < d; k++) v[k] += h.data[(r * s + t) * d + k]
      }
      const norm = Math.hypot(...v.map((x) => x / n))
      out.push(Array.from(v, (x) => x / n / norm))
    }
  }
  return out
}

async function write(file, texts) {
  const vectors = await embed(texts)
  const items = Object.fromEntries(texts.map((t, i) => [t, packVector(vectors[i])]))
  writeFileSync(new URL(file, import.meta.url), JSON.stringify({ model: MODEL, dtype: 'q8', dims: vectors[0].length, items }) + '\n')
  console.log(file, texts.length, 'vectores')
}

await write('../src/labs/embeddings/vectors.json', [...SENTENCES.map((s) => E5_QUERY + s.text), ...QUERIES.map((q) => E5_QUERY + q)])
await write('../src/labs/rag/vectors.json', [...PASSAGES.map((p) => E5_PASSAGE + passageText(p)), ...QUESTIONS.map((q) => E5_QUERY + q.q)])
