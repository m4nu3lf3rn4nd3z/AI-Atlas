import type { ComponentType } from 'react'
import type { Snippet } from '@/content/schema'
import type { BlockKind } from './blocks'

/* A use case is data: an architecture (components + flows), design
   decisions (toggles), a scripted run (steps) and what happens depending on
   the decisions (outcomes). One generic lab renders all of them. */

/** Condition over the toggles. */
export type Cond = { on: string } | { off: string } | { all: Cond[] } | { any: Cond[] }

export interface CaseComponent {
  id: string
  kind: BlockKind
  label: string
  /** What this component does in this particular system. */
  role: string
  tools: string[]
  /** Grid position in the architecture diagram. */
  col: number
  row: number
  when?: Cond
  /** Runs outside the request path (ingestion, nightly evals…). */
  offline?: boolean
}

export interface CaseFlow {
  from: string
  to: string
  when?: Cond
}

export interface CaseToggle {
  id: string
  label: string
  description: string
  concept?: string
}

export type StepStatus = 'ok' | 'warn' | 'error' | 'blocked'

export interface CaseStep {
  id: string
  component: string
  title: string
  detail: string
  payload?: { lang: 'json' | 'text' | 'python' | 'sql' | 'bash'; content: string; label?: string }
  /** Simulated latency of this step. */
  ms: number
  llm?: { tier: 'large' | 'small'; input: number; output: number }
  embedTokens?: number
  rerankDocs?: number
  toolCall?: boolean
  human?: boolean
  /** Consecutive steps sharing this key run in parallel (latency = max)… */
  parallel?: string
  /** …only when this condition holds (always, if absent). */
  parallelWhen?: Cond
  status?: StepStatus
  when?: Cond
}

export type Verdict = 'success' | 'partial' | 'failure' | 'danger'

export interface CaseOutcome {
  /** First matching outcome wins; the last one should have no condition. */
  when?: Cond
  verdict: Verdict
  title: string
  text: string
  lesson: string
}

export interface CasePreset {
  id: string
  label: string
  description: string
  toggles: Record<string, boolean>
}

export interface UseCase {
  id: string
  title: string
  tagline: string
  icon: ComponentType<{ className?: string }>
  level: 1 | 2 | 3
  examples: string[]
  problem: string
  whenNot: string
  concepts: string[]
  /** Pattern ids from the tool catalogue. */
  patterns: string[]
  scenario: { title: string; input: string }
  components: CaseComponent[]
  flows: CaseFlow[]
  toggles: CaseToggle[]
  presets: CasePreset[]
  steps: CaseStep[]
  outcomes: CaseOutcome[]
  notes: { when: Cond; text: string }[]
  stacks: { name: string; description: string; picks: { component: string; tools: string[]; note?: string }[] }[]
  risks: { title: string; text: string; mitigation: string }[]
  metrics: { name: string; why: string }[]
  snippets: Snippet[]
}

export type ToggleState = Record<string, boolean>
