// Downloads a small slice of real model weights for the quantization lab.
//
// safetensors files start with an 8-byte header length followed by a JSON
// header that gives each tensor's dtype, shape and byte range. With HTTP
// range requests we fetch only the header and the bytes we need (~8 KB)
// instead of the whole ~1 GB file.
//
//   node scripts/extract-weights.mjs
//
// Writes src/labs/vram/weights.json.

import { writeFileSync } from 'node:fs'

const REPO = 'Qwen/Qwen2.5-0.5B-Instruct'
const TENSOR = process.argv[2] ?? 'model.layers.12.mlp.down_proj.weight'
const COUNT = 4096
const FILE_URL = `https://huggingface.co/${REPO}/resolve/main/model.safetensors`

async function range(start, end) {
  const res = await fetch(FILE_URL, { headers: { Range: `bytes=${start}-${end}` } })
  if (res.status !== 206) throw new Error(`HTTP ${res.status}: el servidor no aceptó el rango`)
  return new Uint8Array(await res.arrayBuffer())
}

const lenBytes = await range(0, 7)
const headerLen = Number(new DataView(lenBytes.buffer).getBigUint64(0, true))
const header = JSON.parse(new TextDecoder().decode(await range(8, 8 + headerLen - 1)))
const info = header[TENSOR]
if (!info) throw new Error(`No existe ${TENSOR}`)
if (info.dtype !== 'BF16') throw new Error(`dtype inesperado: ${info.dtype}`)

const base = 8 + headerLen + info.data_offsets[0]
const raw = await range(base, base + COUNT * 2 - 1)

// bfloat16 is the top half of a float32.
const view = new DataView(raw.buffer)
const out = new Float32Array(1)
const bits = new Uint32Array(out.buffer)
const values = []
for (let i = 0; i < COUNT; i++) {
  bits[0] = view.getUint16(i * 2, true) << 16
  values.push(Number(out[0].toPrecision(6)))
}

const abs = values.map(Math.abs)
const mean = values.reduce((a, b) => a + b, 0) / COUNT
const std = Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / COUNT)
console.log(TENSOR, info.shape, { max: Math.max(...abs), std, ratio: Math.max(...abs) / std })

writeFileSync(
  new URL('../src/labs/vram/weights.json', import.meta.url),
  JSON.stringify({ repo: REPO, tensor: TENSOR, shape: info.shape, dtype: info.dtype, values }) + '\n',
)
