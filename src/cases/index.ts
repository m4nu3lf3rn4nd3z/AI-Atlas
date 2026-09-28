import { codingAgent } from './data/coding-agent'
import { deepResearch } from './data/deep-research'
import { invoiceAutomation } from './data/invoice-automation'
import { mcpCopilot } from './data/mcp-copilot'
import { supportRag } from './data/support-rag'
import { textToSql } from './data/text-to-sql'
import type { UseCase } from './types'

export const CASES: readonly UseCase[] = [supportRag, codingAgent, invoiceAutomation, mcpCopilot, textToSql, deepResearch]

export const CASE_BY_ID: ReadonlyMap<string, UseCase> = new Map(CASES.map((c) => [c.id, c]))

/** Use cases that teach a given atlas concept. */
export function casesForConcept(conceptId: string): UseCase[] {
  return CASES.filter((c) => c.concepts.includes(conceptId))
}

/** Use cases whose architecture or stacks use a given tool. */
export function casesUsingTool(toolId: string): UseCase[] {
  return CASES.filter(
    (c) =>
      c.patterns.includes(toolId) ||
      c.components.some((comp) => comp.tools.includes(toolId)) ||
      c.stacks.some((s) => s.picks.some((p) => p.tools.includes(toolId))),
  )
}
