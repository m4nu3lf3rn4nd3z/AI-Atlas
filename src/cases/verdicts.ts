import { CircleCheck, CircleX, ShieldAlert, TriangleAlert, type LucideIcon } from 'lucide-react'
import type { StepStatus, Verdict } from './types'

/* Status and verdict styling: always icon + label + colour, never colour alone. */

export const STATUS: Record<StepStatus, { icon: LucideIcon; label: string; color: string }> = {
  ok: { icon: CircleCheck, label: 'Correcto', color: 'var(--ok)' },
  warn: { icon: TriangleAlert, label: 'Atención', color: 'var(--warn)' },
  error: { icon: CircleX, label: 'Error', color: 'var(--bad)' },
  blocked: { icon: ShieldAlert, label: 'Bloqueado', color: 'var(--l2)' },
}

export const VERDICT: Record<Verdict, { icon: LucideIcon; label: string; color: string }> = {
  success: { icon: CircleCheck, label: 'Éxito', color: 'var(--ok)' },
  partial: { icon: TriangleAlert, label: 'A medias', color: 'var(--warn)' },
  failure: { icon: CircleX, label: 'Fallo', color: 'var(--bad)' },
  danger: { icon: ShieldAlert, label: 'Peligro', color: 'var(--bad)' },
}
