export const CONCEPT_TABS = ['learn', 'code', 'lab', 'quiz'] as const
export type ConceptTab = (typeof CONCEPT_TABS)[number]

export function isConceptTab(t: string | null | undefined): t is ConceptTab {
  return !!t && (CONCEPT_TABS as readonly string[]).includes(t)
}
