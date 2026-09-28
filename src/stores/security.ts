import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/* Progress of the architecture security review checklist (per browser). */

interface SecurityState {
  checked: Record<string, boolean>
  toggle: (id: string) => void
  reset: () => void
}

export const useSecurityReview = create<SecurityState>()(
  persist(
    (set) => ({
      checked: {},
      toggle: (id) => set((s) => ({ checked: { ...s.checked, [id]: !s.checked[id] } })),
      reset: () => set({ checked: {} }),
    }),
    { name: 'atlas-security-review', version: 1 },
  ),
)
