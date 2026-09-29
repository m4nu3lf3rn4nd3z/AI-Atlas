import { create } from 'zustand'
import type { EmbedRequest, EmbedResponse } from '@/workers/embeddings.worker'

/* Client for the embeddings worker. The model only downloads when the
   user asks for it (load), never implicitly. */

export const MODEL_LABEL = 'multilingual-e5-small (int8)'
export const MODEL_MB = 118

type Status = 'idle' | 'loading' | 'ready' | 'error'

interface EmbedderState {
  status: Status
  /** Bytes downloaded / expected, summed over the model files. */
  loaded: number
  total: number
  error?: string
}

export const useEmbedder = create<EmbedderState>(() => ({ status: 'idle', loaded: 0, total: 0 }))

let worker: Worker | null = null
let nextId = 1
const pending = new Map<number, { resolve: (v: unknown) => void; reject: (e: Error) => void }>()
const files = new Map<string, { loaded: number; total: number }>()

function getWorker(): Worker {
  if (worker) return worker
  worker = new Worker(new URL('../workers/embeddings.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (e: MessageEvent<EmbedResponse>) => {
    const msg = e.data
    if (msg.type === 'progress') {
      files.set(msg.file, { loaded: msg.loaded, total: msg.total })
      let loaded = 0
      let total = 0
      for (const f of files.values()) {
        loaded += f.loaded
        total += f.total
      }
      useEmbedder.setState({ loaded, total })
      return
    }
    const p = pending.get(msg.id)
    if (!p) return
    pending.delete(msg.id)
    if (msg.type === 'error') p.reject(new Error(msg.message))
    else p.resolve(msg.type === 'result' ? msg.vectors : undefined)
  }
  return worker
}

type WithoutId<T> = T extends unknown ? Omit<T, 'id'> : never

function request(msg: WithoutId<EmbedRequest>): Promise<unknown> {
  const id = nextId++
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    getWorker().postMessage({ ...msg, id } as EmbedRequest)
  })
}

export async function loadEmbedder(): Promise<void> {
  const { status } = useEmbedder.getState()
  if (status === 'ready' || status === 'loading') return
  useEmbedder.setState({ status: 'loading', error: undefined })
  try {
    await request({ type: 'load' })
    useEmbedder.setState({ status: 'ready' })
  } catch (e) {
    useEmbedder.setState({ status: 'error', error: (e as Error).message })
  }
}

/** Unit-length embeddings. Texts must carry the E5 prefix ("query: " / "passage: "). */
export async function embed(texts: string[]): Promise<Float32Array[]> {
  const vectors = (await request({ type: 'embed', texts })) as number[][]
  return vectors.map((v) => Float32Array.from(v))
}
