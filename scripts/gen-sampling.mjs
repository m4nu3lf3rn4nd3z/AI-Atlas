// Captures real next-token distributions from a small LLM for the sampling
// lab: for each prompt, the logits of the next token and of each step of the
// greedy continuation. Uses Qwen2.5-0.5B-Instruct (4-bit, MatMulNBits) with onnxruntime-web:
// the naive int8 export degrades this small model noticeably.
//
//   node scripts/gen-sampling.mjs
//
// The first run downloads the model (~786 MB) into .cache/.
//
// Stored per step: the top 60 logits exactly, plus a histogram of the rest of
// the vocabulary (count of logits per 0.25-wide bin). That is enough to
// recompute the softmax at any temperature with negligible error.

import { writeFileSync } from 'node:fs'
import { PROMPTS } from '../src/labs/sampling/prompts.ts'
import { loadModel, ort } from './onnx-helpers.mjs'

const MODEL = 'onnx-community/Qwen2.5-0.5B-Instruct'
const TOP = 60
const BIN = 0.25
const STEPS = 12
const END_TOKENS = new Set(['<|im_end|>', '<|endoftext|>'])

const FILE = process.env.MODEL_FILE ?? 'onnx/model_q4.onnx'
const { tokenizer, session } = await loadModel(MODEL, FILE)
const cfg = await (await fetch(`https://huggingface.co/${MODEL}/resolve/main/config.json`)).json()
const layers = cfg.num_hidden_layers
const kvHeads = cfg.num_key_value_heads
const headDim = cfg.hidden_size / cfg.num_attention_heads

/** Logits of the next token after `ids` (a full forward pass, no cache). */
async function nextLogits(ids) {
  const n = ids.length
  const f = {
    input_ids: new ort.Tensor('int64', BigInt64Array.from(ids.map(BigInt)), [1, n]),
    attention_mask: new ort.Tensor('int64', new BigInt64Array(n).fill(1n), [1, n]),
  }
  if (session.inputNames.includes('position_ids')) {
    f.position_ids = new ort.Tensor('int64', BigInt64Array.from({ length: n }, (_, i) => BigInt(i)), [1, n])
  }
  for (let l = 0; l < layers; l++) {
    for (const kind of ['key', 'value']) {
      const name = `past_key_values.${l}.${kind}`
      if (session.inputNames.includes(name)) f[name] = new ort.Tensor('float32', new Float32Array(0), [1, kvHeads, 0, headDim])
    }
  }
  const out = await session.run(f)
  const logits = out.logits
  const vocab = logits.dims[2]
  return logits.data.slice((n - 1) * vocab, n * vocab)
}

function tokenText(id) {
  return tokenizer.decode([id], { skip_special_tokens: false })
}

function summarize(logits) {
  const order = Array.from(logits.keys()).sort((a, b) => logits[b] - logits[a])
  const top = order.slice(0, TOP).map((id) => ({ id, t: tokenText(id), l: Number(logits[id].toFixed(3)) }))
  const bins = new Map()
  for (const id of order.slice(TOP)) {
    const b = Math.floor(logits[id] / BIN)
    bins.set(b, (bins.get(b) ?? 0) + 1)
  }
  return { top, tail: [...bins].sort((a, b) => b[0] - a[0]).map(([b, c]) => [Number(((b + 0.5) * BIN).toFixed(3)), c]) }
}

const out = []
for (const p of PROMPTS) {
  // The instruct model's own chat template, with the start of the answer appended.
  const chat = tokenizer.apply_chat_template([{ role: 'user', content: p.user }], { tokenize: false, add_generation_prompt: true })
  const ids = Array.from(tokenizer.encode(chat + p.prefix, { add_special_tokens: false }))
  const steps = []
  for (let s = 0; s < STEPS; s++) {
    const logits = await nextLogits(ids)
    const sum = summarize(logits)
    steps.push(sum)
    ids.push(sum.top[0].id)
    if (END_TOKENS.has(sum.top[0].t)) break // the model ends its turn
  }
  const greedy = steps.map((s) => s.top[0].t).join('')
  console.log(p.id, JSON.stringify(p.prefix), '→', JSON.stringify(greedy), '| top1', steps[0].top.slice(0, 3).map((t) => t.t).join(' '))
  out.push({ id: p.id, steps })
}

writeFileSync(new URL('../src/labs/sampling/distributions.json', import.meta.url), JSON.stringify({ model: MODEL, dtype: FILE.includes('q4') ? 'q4' : 'q8', bin: BIN, prompts: out }) + '\n')
