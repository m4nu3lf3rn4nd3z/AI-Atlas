/// <reference lib="webworker" />
/* Runs the embedding model off the main thread. The model is downloaded
   from Hugging Face the first time and kept in the browser cache. */
import { env, pipeline, type FeatureExtractionPipeline } from '@huggingface/transformers'

export const EMBEDDING_MODEL = 'Xenova/multilingual-e5-small'

env.allowLocalModels = false

export type EmbedRequest = { id: number; type: 'load' } | { id: number; type: 'embed'; texts: string[] }

export type EmbedResponse =
  | { type: 'progress'; file: string; loaded: number; total: number }
  | { id: number; type: 'ready' }
  | { id: number; type: 'result'; vectors: number[][] }
  | { id: number; type: 'error'; message: string }

let extractor: Promise<FeatureExtractionPipeline> | null = null

const post = (msg: EmbedResponse) => self.postMessage(msg)

function load(): Promise<FeatureExtractionPipeline> {
  extractor ??= pipeline('feature-extraction', EMBEDDING_MODEL, {
    dtype: 'q8',
    device: 'wasm',
    progress_callback: (p) => {
      if (p.status === 'progress') post({ type: 'progress', file: p.file, loaded: p.loaded, total: p.total })
    },
  }) as Promise<FeatureExtractionPipeline>
  extractor.catch(() => (extractor = null))
  return extractor
}

self.onmessage = async (e: MessageEvent<EmbedRequest>) => {
  const msg = e.data
  try {
    const ex = await load()
    if (msg.type === 'load') return post({ id: msg.id, type: 'ready' })
    const out = await ex(msg.texts, { pooling: 'mean', normalize: true })
    post({ id: msg.id, type: 'result', vectors: out.tolist() as number[][] })
  } catch (err) {
    post({ id: msg.id, type: 'error', message: err instanceof Error ? err.message : String(err) })
  }
}
