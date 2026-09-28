import type { CaseOutcome, CaseStep, Cond, ToggleState, UseCase, Verdict } from './types'

/* Pure logic of the use-case labs: which steps run for a given set of design
   decisions, what they cost and which outcome they lead to. */

/** Reference prices in USD per million tokens (approximate, Sept 2026). */
export const PRICES = {
  large: { input: 4, output: 20, label: 'modelo grande (tipo Claude Opus 5.5)' },
  small: { input: 1, output: 5, label: 'modelo pequeño (tipo Claude Haiku 4.5)' },
  embedPerMillion: 0.05,
  rerankPerCall: 0.002,
} as const

export function evalCond(cond: Cond | undefined, state: ToggleState): boolean {
  if (!cond) return true
  if ('on' in cond) return !!state[cond.on]
  if ('off' in cond) return !state[cond.off]
  if ('all' in cond) return cond.all.every((c) => evalCond(c, state))
  return cond.any.some((c) => evalCond(c, state))
}

export function defaultState(uc: UseCase): ToggleState {
  return { ...(uc.presets[0]?.toggles ?? Object.fromEntries(uc.toggles.map((t) => [t.id, false]))) }
}

export function activeSteps(uc: UseCase, state: ToggleState): CaseStep[] {
  return uc.steps.filter((s) => evalCond(s.when, state))
}

export function activeComponents(uc: UseCase, state: ToggleState): Set<string> {
  return new Set(uc.components.filter((c) => evalCond(c.when, state)).map((c) => c.id))
}

export interface RunMetrics {
  steps: number
  /** Machine time; human waiting time is counted apart. */
  ms: number
  humanMs: number
  inputTokens: number
  outputTokens: number
  costUsd: number
  llmCalls: number
  toolCalls: number
  humanSteps: number
}

export function stepCost(s: CaseStep): number {
  let cost = 0
  if (s.llm) {
    const p = PRICES[s.llm.tier]
    cost += (s.llm.input * p.input + s.llm.output * p.output) / 1_000_000
  }
  if (s.embedTokens) cost += (s.embedTokens * PRICES.embedPerMillion) / 1_000_000
  if (s.rerankDocs) cost += PRICES.rerankPerCall
  return cost
}

/**
 * Totals for a run. Consecutive steps with the same `parallel` key overlap in
 * time, so they contribute the slowest of the group to the latency.
 */
export function computeMetrics(steps: CaseStep[], state: ToggleState = {}): RunMetrics {
  const m: RunMetrics = {
    steps: steps.length,
    ms: 0,
    humanMs: 0,
    inputTokens: 0,
    outputTokens: 0,
    costUsd: 0,
    llmCalls: 0,
    toolCalls: 0,
    humanSteps: 0,
  }
  let group: string | undefined
  let groupMax = 0
  const flush = () => {
    m.ms += groupMax
    groupMax = 0
    group = undefined
  }
  for (const s of steps) {
    if (s.human) {
      flush()
      m.humanMs += s.ms
      m.humanSteps++
      continue
    }
    if (s.parallel && evalCond(s.parallelWhen, state)) {
      if (group !== s.parallel) flush()
      group = s.parallel
      groupMax = Math.max(groupMax, s.ms)
    } else {
      flush()
      m.ms += s.ms
    }
    if (s.llm) {
      m.llmCalls++
      m.inputTokens += s.llm.input
      m.outputTokens += s.llm.output
    }
    m.inputTokens += s.embedTokens ?? 0
    m.costUsd += stepCost(s)
    if (s.toolCall) m.toolCalls++
  }
  flush()
  return m
}

export function pickOutcome(uc: UseCase, state: ToggleState): CaseOutcome {
  return uc.outcomes.find((o) => evalCond(o.when, state)) ?? uc.outcomes[uc.outcomes.length - 1]!
}

export function notesFor(uc: UseCase, state: ToggleState): string[] {
  return uc.notes.filter((n) => evalCond(n.when, state)).map((n) => n.text)
}

const RANK: Record<Verdict, number> = { danger: 0, failure: 1, partial: 2, success: 3 }

/** Toggles that, flipped on their own, lead to a strictly better outcome. */
export function improvingToggles(uc: UseCase, state: ToggleState): string[] {
  const now = RANK[pickOutcome(uc, state).verdict]
  return uc.toggles
    .filter((t) => RANK[pickOutcome(uc, { ...state, [t.id]: !state[t.id] }).verdict] > now)
    .map((t) => t.id)
}

/** Stable key for a combination of decisions, used to track exploration. */
export function configKey(state: ToggleState): string {
  return Object.keys(state)
    .filter((k) => state[k])
    .sort()
    .join('+') || 'ninguna'
}
