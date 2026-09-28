import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* Learning progress, persisted in localStorage. A concept counts as
   "learned" once its quiz is passed with at least PASS_RATIO correct. */

export const PASS_RATIO = 0.8

export interface ConceptProgress {
  visitedAt?: number
  learnedAt?: number
  /** Best quiz score as a ratio 0..1 */
  quizBest?: number
}

interface ProgressState {
  concepts: Record<string, ConceptProgress>
  lastVisited?: string
  markVisited: (id: string) => void
  recordQuiz: (id: string, correct: number, total: number) => void
  toggleLearned: (id: string) => void
  reset: () => void
  importData: (data: unknown) => boolean
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      concepts: {},
      markVisited: (id) => {
        const prev = get().concepts[id]
        set((s) => ({
          lastVisited: id,
          concepts: prev?.visitedAt
            ? s.concepts
            : { ...s.concepts, [id]: { ...prev, visitedAt: Date.now() } },
        }))
      },
      recordQuiz: (id, correct, total) => {
        const ratio = total ? correct / total : 0
        set((s) => {
          const prev = s.concepts[id] ?? {}
          const passed = ratio >= PASS_RATIO
          return {
            concepts: {
              ...s.concepts,
              [id]: {
                ...prev,
                quizBest: Math.max(prev.quizBest ?? 0, ratio),
                learnedAt: prev.learnedAt ?? (passed ? Date.now() : undefined),
              },
            },
          }
        })
      },
      toggleLearned: (id) =>
        set((s) => {
          const prev = s.concepts[id] ?? {}
          return {
            concepts: {
              ...s.concepts,
              [id]: { ...prev, learnedAt: prev.learnedAt ? undefined : Date.now() },
            },
          }
        }),
      reset: () => set({ concepts: {}, lastVisited: undefined }),
      importData: (data) => {
        if (!data || typeof data !== 'object' || !('concepts' in data)) return false
        const concepts = (data as { concepts: unknown }).concepts
        if (!concepts || typeof concepts !== 'object') return false
        set({ concepts: concepts as Record<string, ConceptProgress> })
        return true
      },
    }),
    { name: 'atlas-progress', version: 1 },
  ),
)

export type ConceptStatus = 'new' | 'visited' | 'learned'

export function statusOf(p: ConceptProgress | undefined): ConceptStatus {
  if (p?.learnedAt) return 'learned'
  if (p?.visitedAt) return 'visited'
  return 'new'
}
