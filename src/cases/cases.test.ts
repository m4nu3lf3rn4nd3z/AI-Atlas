import { describe, expect, it } from 'vitest'
import { CONCEPT_BY_ID } from '@/content'
import { snippetSchema } from '@/content/schema'
import { TOOL_BY_ID, TOOL_CATEGORIES, TOOLS } from '@/content/tools'
import { BLOCK_KINDS, BLOCKS } from './blocks'
import {
  activeComponents,
  activeSteps,
  computeMetrics,
  configKey,
  evalCond,
  improvingToggles,
  pickOutcome,
} from './engine'
import { CASES } from './index'
import type { CaseStep, Cond, ToggleState, UseCase } from './types'

/** Every combination of the case's toggles. */
function allStates(uc: UseCase): ToggleState[] {
  const ids = uc.toggles.map((t) => t.id)
  return Array.from({ length: 2 ** ids.length }, (_, mask) =>
    Object.fromEntries(ids.map((id, i) => [id, !!(mask & (1 << i))])),
  )
}

function condToggles(c: Cond | undefined): string[] {
  if (!c) return []
  if ('on' in c) return [c.on]
  if ('off' in c) return [c.off]
  return ('all' in c ? c.all : c.any).flatMap(condToggles)
}

describe('engine', () => {
  it('evaluates conditions', () => {
    const s = { a: true, b: false }
    expect(evalCond({ on: 'a' }, s)).toBe(true)
    expect(evalCond({ off: 'b' }, s)).toBe(true)
    expect(evalCond({ all: [{ on: 'a' }, { on: 'b' }] }, s)).toBe(false)
    expect(evalCond({ any: [{ on: 'a' }, { on: 'b' }] }, s)).toBe(true)
    expect(evalCond(undefined, s)).toBe(true)
  })

  it('overlaps parallel steps and counts human time apart', () => {
    const steps: CaseStep[] = [
      { id: 'a', component: 'x', title: '', detail: '', ms: 100 },
      { id: 'b', component: 'x', title: '', detail: '', ms: 300, parallel: 'p' },
      { id: 'c', component: 'x', title: '', detail: '', ms: 500, parallel: 'p' },
      { id: 'd', component: 'x', title: '', detail: '', ms: 60_000, human: true },
      { id: 'e', component: 'x', title: '', detail: '', ms: 50, llm: { tier: 'large', input: 1_000_000, output: 0 } },
    ]
    const m = computeMetrics(steps)
    expect(m.ms).toBe(100 + 500 + 50)
    expect(m.humanMs).toBe(60_000)
    expect(m.costUsd).toBeCloseTo(4) // 1 M input tokens on the large tier
  })

  it('only overlaps when parallelWhen holds', () => {
    const steps: CaseStep[] = [
      { id: 'b', component: 'x', title: '', detail: '', ms: 300, parallel: 'p', parallelWhen: { on: 'par' } },
      { id: 'c', component: 'x', title: '', detail: '', ms: 500, parallel: 'p', parallelWhen: { on: 'par' } },
    ]
    expect(computeMetrics(steps, { par: true }).ms).toBe(500)
    expect(computeMetrics(steps, { par: false }).ms).toBe(800)
  })

  it('builds stable config keys', () => {
    expect(configKey({ b: true, a: true, c: false })).toBe('a+b')
    expect(configKey({ a: false })).toBe('ninguna')
  })
})

describe('tool catalogue', () => {
  it('has unique ids, valid categories and concepts', () => {
    const cats = new Set(TOOL_CATEGORIES.map((c) => c.id))
    expect(TOOL_BY_ID.size).toBe(TOOLS.length)
    for (const t of TOOLS) {
      expect(t.categories.length, t.id).toBeGreaterThan(0)
      for (const c of t.categories) expect(cats.has(c), `${t.id}: ${c}`).toBe(true)
      for (const c of t.concepts ?? []) expect(CONCEPT_BY_ID.has(c), `${t.id}: ${c}`).toBe(true)
      if (t.url) expect(t.url.startsWith('https://'), t.id).toBe(true)
    }
  })

  it('every category has tools', () => {
    for (const c of TOOL_CATEGORIES) expect(TOOLS.some((t) => t.categories.includes(c.id)), c.id).toBe(true)
  })

  it('building blocks reference existing tools and concepts', () => {
    for (const k of BLOCK_KINDS) {
      for (const t of BLOCKS[k].tools) expect(TOOL_BY_ID.has(t), `${k}: ${t}`).toBe(true)
      if (BLOCKS[k].concept) expect(CONCEPT_BY_ID.has(BLOCKS[k].concept!), k).toBe(true)
    }
  })
})

describe.each(CASES.map((uc) => [uc.id, uc] as const))('use case %s', (_, uc) => {
  const componentIds = new Set(uc.components.map((c) => c.id))
  const toggleIds = new Set(uc.toggles.map((t) => t.id))
  const states = allStates(uc)

  it('references existing components, toggles, tools and concepts', () => {
    expect(componentIds.size).toBe(uc.components.length)
    expect(new Set(uc.steps.map((s) => s.id)).size).toBe(uc.steps.length)
    for (const s of uc.steps) {
      expect(componentIds.has(s.component), `step ${s.id}`).toBe(true)
      for (const t of [...condToggles(s.when), ...condToggles(s.parallelWhen)]) expect(toggleIds.has(t), `step ${s.id}: ${t}`).toBe(true)
    }
    for (const f of uc.flows) {
      expect(componentIds.has(f.from) && componentIds.has(f.to), `${f.from}→${f.to}`).toBe(true)
      for (const t of condToggles(f.when)) expect(toggleIds.has(t)).toBe(true)
    }
    for (const c of uc.components) {
      for (const t of c.tools) expect(TOOL_BY_ID.has(t), `${c.id}: ${t}`).toBe(true)
      for (const t of condToggles(c.when)) expect(toggleIds.has(t)).toBe(true)
    }
    for (const s of uc.stacks) {
      for (const p of s.picks) {
        expect(componentIds.has(p.component), `stack ${s.name}: ${p.component}`).toBe(true)
        for (const t of p.tools) expect(TOOL_BY_ID.has(t), `stack ${s.name}: ${t}`).toBe(true)
      }
    }
    for (const p of uc.patterns) expect(TOOL_BY_ID.get(p)?.kind, p).toBe('pattern')
    for (const c of uc.concepts) expect(CONCEPT_BY_ID.has(c), c).toBe(true)
    for (const t of uc.toggles) if (t.concept) expect(CONCEPT_BY_ID.has(t.concept), t.id).toBe(true)
    for (const s of uc.snippets) expect(() => snippetSchema.parse(s)).not.toThrow()
  })

  it('ends its outcome list with an unconditional fallback', () => {
    expect(uc.outcomes.at(-1)?.when).toBeUndefined()
    for (const o of uc.outcomes) for (const t of condToggles(o.when)) expect(toggleIds.has(t)).toBe(true)
  })

  it('presets cover every toggle', () => {
    for (const p of uc.presets) expect(Object.keys(p.toggles).sort()).toEqual([...toggleIds].sort())
  })

  it('the minimal preset fails and the recommended one succeeds', () => {
    expect(pickOutcome(uc, uc.presets[0]!.toggles).verdict).not.toBe('success')
    const recommended = uc.presets.find((p) => p.id === 'recommended')!
    expect(pickOutcome(uc, recommended.toggles).verdict).toBe('success')
    expect(improvingToggles(uc, recommended.toggles)).toEqual([])
  })

  it('in every configuration, active steps run on active components', () => {
    for (const s of states) {
      const steps = activeSteps(uc, s)
      const comps = activeComponents(uc, s)
      expect(steps.length, configKey(s)).toBeGreaterThan(2)
      for (const step of steps) expect(comps.has(step.component), `${configKey(s)}: ${step.id} → ${step.component}`).toBe(true)
    }
  })

  it('every step and every toggle matters in some configuration', () => {
    const reachable = new Set(states.flatMap((s) => activeSteps(uc, s).map((st) => st.id)))
    for (const st of uc.steps) expect(reachable.has(st.id), `step ${st.id} never runs`).toBe(true)
    for (const t of uc.toggles) {
      const matters = states.some((s) => {
        const flipped = { ...s, [t.id]: !s[t.id] }
        const a = activeSteps(uc, s).map((x) => x.id).join()
        const b = activeSteps(uc, flipped).map((x) => x.id).join()
        return a !== b || pickOutcome(uc, s) !== pickOutcome(uc, flipped)
      })
      expect(matters, `toggle ${t.id} has no effect`).toBe(true)
    }
  })
})
