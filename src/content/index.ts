import type { ComponentType } from 'react'
import { LAYERS } from './layers'
import { adaptation } from './meta/adaptation'
import { agents } from './meta/agents'
import { fundamentals } from './meta/fundamentals'
import { inference } from './meta/inference'
import { knowledge } from './meta/knowledge'
import { models } from './meta/models'
import { production } from './meta/production'
import { tools } from './meta/tools'
import type { ConceptDetails, ConceptMeta, LayerId } from './schema'

/* Single entry point for content. Metadata is eager (it drives the map,
   search and paths); theory and details are code-split per concept. */

export const CONCEPTS: readonly ConceptMeta[] = [
  ...fundamentals,
  ...models,
  ...inference,
  ...adaptation,
  ...knowledge,
  ...tools,
  ...agents,
  ...production,
]

export const CONCEPT_BY_ID: ReadonlyMap<string, ConceptMeta> = new Map(
  CONCEPTS.map((c) => [c.id, c]),
)

export function getConcept(id: string | null | undefined): ConceptMeta | undefined {
  return id ? CONCEPT_BY_ID.get(id) : undefined
}

export function conceptsInLayer(layer: LayerId): ConceptMeta[] {
  return CONCEPTS.filter((c) => c.layer === layer)
}

const idFromPath = (path: string) => path.split('/').at(-2) ?? ''

const detailLoaders = Object.fromEntries(
  Object.entries(
    import.meta.glob<{ default: ConceptDetails }>('./concepts/*/details.ts'),
  ).map(([path, load]) => [idFromPath(path), load]),
)

const theoryLoaders = Object.fromEntries(
  Object.entries(import.meta.glob<{ default: ComponentType }>('./concepts/*/theory.mdx')).map(
    ([path, load]) => [idFromPath(path), load],
  ),
)

/** A concept is "written" when both its theory and its details exist. */
export function hasContent(id: string): boolean {
  return id in detailLoaders && id in theoryLoaders
}

export const WRITTEN_COUNT = CONCEPTS.filter((c) => hasContent(c.id)).length

export async function loadDetails(id: string): Promise<ConceptDetails | null> {
  const load = detailLoaders[id]
  return load ? (await load()).default : null
}

export async function loadTheory(id: string): Promise<ComponentType | null> {
  const load = theoryLoaders[id]
  return load ? (await load()).default : null
}

/** Ids that have content folders — used by the integrity tests. */
export const CONTENT_FOLDER_IDS = [
  ...new Set([...Object.keys(detailLoaders), ...Object.keys(theoryLoaders)]),
]

export { LAYERS }
