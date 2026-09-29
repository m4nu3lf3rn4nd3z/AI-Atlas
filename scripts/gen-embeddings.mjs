// Precomputes real embeddings for the labs, so they work instantly without
// downloading the model in the browser. Uses the same model file and the
// same WASM runtime the browser loads on demand (multilingual-e5-small, int8).
//
//   node scripts/gen-embeddings.mjs
//
// The first run downloads the model (~118 MB) into .cache/.
//
// It runs onnxruntime-web directly instead of the transformers.js pipeline:
// on Windows the native onnxruntime-node crashes when it picks up the older
// onnxruntime.dll that ships in System32.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AutoTokenizer, env } from '@huggingface/transformers'
import * as ort from 'onnxruntime-web'
import { E5_QUERY, QUERIES, SENTENCES } from '../src/labs/embeddings/data.ts'

export const MODEL = 'Xenova/multilingual-e5-small'
const MODEL_FILE = 'onnx/model_quantized.onnx'
const cache = fileURLToPath(new URL('../.cache/transformers/', import.meta.url))

env.cacheDir = cache
const tokenizer = await AutoTokenizer.from_pretrained(MODEL)

const modelPath = `${cache}${MODEL}/${MODEL_FILE}`
if (!existsSync(modelPath)) {
  console.log('Descargando', MODEL_FILE, '…')
  const res = await fetch(`https://huggingface.co/${MODEL}/resolve/main/${MODEL_FILE}`)
  mkdirSync(dirname(modelPath), { recursive: true })
  writeFileSync(modelPath, Buffer.from(await res.arrayBuffer()))
}
const session = await ort.InferenceSession.create(modelPath, { executionProviders: ['wasm'] })

/** Mean pooling over real tokens + L2 normalization, as in the E5 model card. */
async function embed(texts) {
  const out = []
  for (let i = 0; i < texts.length; i += 16) {
    const batch = texts.slice(i, i + 16)
    const enc = tokenizer(batch, { padding: true, truncation: true, max_length: 512 })
    const dims = enc.input_ids.dims
    const { last_hidden_state: h } = await session.run({
      input_ids: new ort.Tensor('int64', enc.input_ids.data, dims),
      attention_mask: new ort.Tensor('int64', enc.attention_mask.data, dims),
      token_type_ids: new ort.Tensor('int64', new BigInt64Array(enc.input_ids.data.length), dims),
    })
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

/** int8 with one scale per vector (absmax), base64: ~4× smaller than float32 JSON. */
function pack(vec) {
  const scale = Math.max(...vec.map(Math.abs)) / 127
  const q = Int8Array.from(vec, (v) => Math.round(v / scale))
  return { s: Number(scale.toPrecision(6)), v: Buffer.from(q.buffer).toString('base64') }
}

async function write(file, texts) {
  const vectors = await embed(texts)
  const items = Object.fromEntries(texts.map((t, i) => [t, pack(vectors[i])]))
  writeFileSync(new URL(file, import.meta.url), JSON.stringify({ model: MODEL, dtype: 'q8', dims: vectors[0].length, items }) + '\n')
  console.log(file, texts.length, 'vectores')
}

await write('../src/labs/embeddings/vectors.json', [...SENTENCES.map((s) => E5_QUERY + s.text), ...QUERIES.map((q) => E5_QUERY + q)])
