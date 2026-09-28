import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EdgeType } from '@/content/graph'
import type { LayerId } from '@/content/schema'

/* Ephemeral + preference UI state. Selection lives in the URL, not here. */

export type Theme = 'dark' | 'light'

interface UiState {
  theme: Theme
  drawerWidth: number
  /** Concept currently hovered or keyboard-focused on the map. */
  hovered: string | null
  hiddenEdgeTypes: EdgeType[]
  hiddenLayers: LayerId[]
  prereqMode: boolean
  paletteOpen: boolean
  setTheme: (t: Theme) => void
  setDrawerWidth: (w: number) => void
  setHovered: (id: string | null) => void
  toggleEdgeType: (t: EdgeType) => void
  toggleLayer: (l: LayerId) => void
  setPrereqMode: (v: boolean) => void
  setPaletteOpen: (v: boolean) => void
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      theme: 'dark',
      drawerWidth: 560,
      hovered: null,
      hiddenEdgeTypes: [],
      hiddenLayers: [],
      prereqMode: false,
      paletteOpen: false,
      setTheme: (theme) => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
        try {
          localStorage.setItem('atlas-theme', theme)
        } catch {
          /* storage unavailable: theme still applies for this session */
        }
        set({ theme })
      },
      setDrawerWidth: (drawerWidth) => set({ drawerWidth }),
      setHovered: (hovered) => set({ hovered }),
      toggleEdgeType: (t) =>
        set((s) => ({
          hiddenEdgeTypes: s.hiddenEdgeTypes.includes(t)
            ? s.hiddenEdgeTypes.filter((x) => x !== t)
            : [...s.hiddenEdgeTypes, t],
        })),
      toggleLayer: (l) =>
        set((s) => ({
          hiddenLayers: s.hiddenLayers.includes(l)
            ? s.hiddenLayers.filter((x) => x !== l)
            : [...s.hiddenLayers, l],
        })),
      setPrereqMode: (prereqMode) => set({ prereqMode }),
      setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
    }),
    {
      name: 'atlas-ui',
      partialize: (s) => ({
        theme: s.theme,
        drawerWidth: s.drawerWidth,
        hiddenEdgeTypes: s.hiddenEdgeTypes,
        prereqMode: s.prereqMode,
      }),
    },
  ),
)
