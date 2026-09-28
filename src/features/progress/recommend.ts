import { CONCEPT_BY_ID, hasContent } from '@/content'
import { topologicalOrder } from '@/content/graph'
import type { ConceptMeta } from '@/content/schema'
import type { ConceptProgress } from '@/stores/progress'

const ORDER = topologicalOrder()

/**
 * Next concept to study: the first published, not-yet-learned concept (in
 * prerequisite order) whose published prerequisites are all learned.
 */
export function recommendNext(progress: Record<string, ConceptProgress>): ConceptMeta | undefined {
  const learned = (id: string) => !!progress[id]?.learnedAt
  for (const id of ORDER) {
    if (!hasContent(id) || learned(id)) continue
    const c = CONCEPT_BY_ID.get(id)!
    if (c.prerequisites.every((p) => learned(p) || !hasContent(p))) return c
  }
  return undefined
}
