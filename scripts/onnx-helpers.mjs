// Shared helpers for the fixture scripts: download a model file once into
// .cache/ and open it with onnxruntime-web (WASM), the same runtime the
// browser uses. The native onnxruntime-node crashes on Windows when it picks
// up the older onnxruntime.dll that ships in System32.

import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { AutoTokenizer, env } from '@huggingface/transformers'
import * as ort from 'onnxruntime-web'

export const CACHE = fileURLToPath(new URL('../.cache/transformers/', import.meta.url))
env.cacheDir = CACHE

export { ort }

export async function loadModel(repo, file = 'onnx/model_quantized.onnx') {
  const tokenizer = await AutoTokenizer.from_pretrained(repo)
  const path = `${CACHE}${repo}/${file}`
  if (!existsSync(path)) {
    console.log('Descargando', repo, file, '…')
    const res = await fetch(`https://huggingface.co/${repo}/resolve/main/${file}`)
    if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${file}`)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, Buffer.from(await res.arrayBuffer()))
  }
  const session = await ort.InferenceSession.create(path, { executionProviders: ['wasm'] })
  return { tokenizer, session }
}

/** Feeds for a BERT/XLM-R style encoder, adding token_type_ids when the model expects them. */
export function feeds(session, enc) {
  const dims = enc.input_ids.dims
  const out = {
    input_ids: new ort.Tensor('int64', enc.input_ids.data, dims),
    attention_mask: new ort.Tensor('int64', enc.attention_mask.data, dims),
  }
  if (session.inputNames.includes('token_type_ids')) {
    out.token_type_ids = new ort.Tensor('int64', new BigInt64Array(enc.input_ids.data.length), dims)
  }
  return out
}

/** int8 with one scale per vector (absmax), base64: ~4× smaller than float32 JSON. */
export function packVector(vec) {
  const scale = Math.max(...vec.map(Math.abs)) / 127
  const q = Int8Array.from(vec, (v) => Math.round(v / scale))
  return { s: Number(scale.toPrecision(6)), v: Buffer.from(q.buffer).toString('base64') }
}
