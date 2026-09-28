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
  collapsedLayers: LayerId[]
  showLines: boolean
  prereqMode: boolean
  paletteOpen: boolean
  /** True once the palette has been opened (it is loaded lazily). */
  paletteLoaded: boolean
  setTheme: (t: Theme) => void
  setDrawerWidth: (w: number) => void
  setHovered: (id: string | null) => void
  toggleEdgeType: (t: EdgeType) => void
  toggleCollapsed: (l: LayerId) => void
  setCollapsed: (layers: LayerId[]) => void
  setShowLines: (v: boolean) => void
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
      collapsedLayers: [],
      showLines: true,
      prereqMode: false,
      paletteOpen: false,
      paletteLoaded: false,
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
      toggleCollapsed: (l) =>
        set((s) => ({
          collapsedLayers: s.collapsedLayers.includes(l)
            ? s.collapsedLayers.filter((x) => x !== l)
            : [...s.collapsedLayers, l],
        })),
      setCollapsed: (collapsedLayers) => set({ collapsedLayers }),
      setShowLines: (showLines) => set({ showLines }),
      setPrereqMode: (prereqMode) => set({ prereqMode }),
      setPaletteOpen: (paletteOpen) => set((s) => ({ paletteOpen, paletteLoaded: s.paletteLoaded || paletteOpen })),
    }),
    {
      name: 'atlas-ui',
      version: 2,
      partialize: (s) => ({
        theme: s.theme,
        drawerWidth: s.drawerWidth,
        hiddenEdgeTypes: s.hiddenEdgeTypes,
        collapsedLayers: s.collapsedLayers,
        showLines: s.showLines,
        prereqMode: s.prereqMode,
      }),
      migrate: (persisted) => persisted as UiState,
    },
  ),
)
