import type { EdgeType } from '@/content/graph'

/** Dash pattern per relation type (solid when absent). */
export const EDGE_DASH: Partial<Record<EdgeType, string>> = {
  alternative: '6 5',
  'part-of': '2 4',
  mitigates: '8 4 2 4',
  evaluates: '2 4',
}
