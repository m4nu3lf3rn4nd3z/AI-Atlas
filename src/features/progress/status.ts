import { hasContent } from '@/content'
import { statusOf, type ConceptProgress } from '@/stores/progress'

/* One encoding of concept progress for the whole app: an ordinal single-hue
   ramp (validated for both themes) plus a dashed outline for unpublished
   concepts. Always paired with a legend or a label, never colour alone. */

export type ProgressState = 'learned' | 'visited' | 'pending' | 'unpublished'

export function progressState(id: string, p: ConceptProgress | undefined): ProgressState {
  if (!hasContent(id)) return 'unpublished'
  const s = statusOf(p)
  return s === 'learned' ? 'learned' : s === 'visited' ? 'visited' : 'pending'
}

export const PROGRESS_STYLE: Record<ProgressState, { label: string; background: string; border?: string }> = {
  learned: { label: 'Aprendido', background: 'var(--prog-2)' },
  visited: { label: 'En curso', background: 'var(--prog-1)' },
  pending: { label: 'Pendiente', background: 'var(--prog-0)' },
  unpublished: { label: 'En preparación', background: 'transparent', border: '1px dashed var(--border-strong)' },
}
