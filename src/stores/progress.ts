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

export interface CaseProgress {
  visitedAt?: number
  /** First time a simulation was run to the end. */
  completedAt?: number
  /** Distinct design configurations run to the end. */
  configs?: string[]
}

/** Use cases count as explored once simulated with this many configurations. */
export const EXPLORED_CONFIGS = 2

interface ProgressState {
  concepts: Record<string, ConceptProgress>
  cases: Record<string, CaseProgress>
  labs: Record<string, { usedAt: number }>
  lastVisited?: string
  markVisited: (id: string) => void
  recordQuiz: (id: string, correct: number, total: number) => void
  toggleLearned: (id: string) => void
  markCaseVisited: (id: string) => void
  recordCaseRun: (id: string, config: string) => void
  markLabUsed: (id: string) => void
  reset: () => void
  importData: (data: unknown) => boolean
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      concepts: {},
      cases: {},
      labs: {},
      markVisited: (id) => {
        const prev = get().concepts[id]
        set((s) => ({
          lastVisited: id,
          concepts: prev?.visitedAt ? s.concepts : { ...s.concepts, [id]: { ...prev, visitedAt: Date.now() } },
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
          return { concepts: { ...s.concepts, [id]: { ...prev, learnedAt: prev.learnedAt ? undefined : Date.now() } } }
        }),
      markCaseVisited: (id) => {
        if (get().cases[id]?.visitedAt) return
        set((s) => ({ cases: { ...s.cases, [id]: { ...s.cases[id], visitedAt: Date.now() } } }))
      },
      recordCaseRun: (id, config) =>
        set((s) => {
          const prev = s.cases[id] ?? {}
          const configs = prev.configs?.includes(config) ? prev.configs : [...(prev.configs ?? []), config]
          return {
            cases: {
              ...s.cases,
              [id]: { ...prev, visitedAt: prev.visitedAt ?? Date.now(), completedAt: prev.completedAt ?? Date.now(), configs },
            },
          }
        }),
      markLabUsed: (id) => {
        if (get().labs[id]) return
        set((s) => ({ labs: { ...s.labs, [id]: { usedAt: Date.now() } } }))
      },
      reset: () => set({ concepts: {}, cases: {}, labs: {}, lastVisited: undefined }),
      importData: (data) => {
        if (!data || typeof data !== 'object' || !('concepts' in data)) return false
        const d = data as { concepts: unknown; cases?: unknown; labs?: unknown }
        if (!d.concepts || typeof d.concepts !== 'object') return false
        set({
          concepts: d.concepts as ProgressState['concepts'],
          cases: (d.cases && typeof d.cases === 'object' ? d.cases : {}) as ProgressState['cases'],
          labs: (d.labs && typeof d.labs === 'object' ? d.labs : {}) as ProgressState['labs'],
        })
        return true
      },
    }),
    {
      name: 'atlas-progress',
      version: 2,
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Partial<ProgressState>
        if (version < 2) return { ...p, cases: {}, labs: {} } as ProgressState
        return p as ProgressState
      },
    },
  ),
)

export type ConceptStatus = 'new' | 'visited' | 'learned'

export function statusOf(p: ConceptProgress | undefined): ConceptStatus {
  if (p?.learnedAt) return 'learned'
  if (p?.visitedAt) return 'visited'
  return 'new'
}

export type CaseStatus = 'new' | 'visited' | 'completed' | 'explored'

export function caseStatusOf(p: CaseProgress | undefined): CaseStatus {
  if ((p?.configs?.length ?? 0) >= EXPLORED_CONFIGS) return 'explored'
  if (p?.completedAt) return 'completed'
  if (p?.visitedAt) return 'visited'
  return 'new'
}
