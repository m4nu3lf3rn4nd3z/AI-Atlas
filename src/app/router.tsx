import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import { AppShell } from './AppShell'
import { RouteError } from './RouteError'

const HomePage = lazy(() => import('@/features/home/HomePage'))
const MapPage = lazy(() => import('@/features/map/MapPage'))
const ConceptPage = lazy(() => import('@/features/concept/ConceptPage'))
const LabsPage = lazy(() => import('@/features/labs/LabsPage'))
const LabPage = lazy(() => import('@/features/labs/LabPage'))
const PathsPage = lazy(() => import('@/features/paths/PathsPage'))
const PathPage = lazy(() => import('@/features/paths/PathPage'))
const JourneyPage = lazy(() => import('@/features/journey/JourneyPage'))
const CasesPage = lazy(() => import('@/features/cases/CasesPage'))
const CasePage = lazy(() => import('@/features/cases/CasePage'))
const ToolsPage = lazy(() => import('@/features/tools/ToolsPage'))
const SecurityPage = lazy(() => import('@/features/security/SecurityPage'))
const GlossaryPage = lazy(() => import('@/features/glossary/GlossaryPage'))
const ProgressPage = lazy(() => import('@/features/progress/ProgressPage'))
const NotFound = lazy(() => import('./NotFound'))

/* The URL is the source of truth for what is selected:
   /map?c=<concept>&tab=<tab>  ·  /c/<concept>/<tab>  ·  /labs/<lab>
   BASE_URL = Vite 'base' option: '/ai-atlas/' on GitHub Pages, '/' in dev */
export const router = createBrowserRouter(
  [
    {
      element: <AppShell />,
      errorElement: <RouteError />,
      children: [
        { index: true, element: <HomePage /> },
        { path: 'map', element: <MapPage /> },
        { path: 'c/:id/:tab?', element: <ConceptPage /> },
        { path: 'labs', element: <LabsPage /> },
        { path: 'labs/:labId', element: <LabPage /> },
        { path: 'paths', element: <PathsPage /> },
        { path: 'paths/:pathId', element: <PathPage /> },
        { path: 'journey', element: <JourneyPage /> },
        { path: 'cases', element: <CasesPage /> },
        { path: 'cases/:caseId', element: <CasePage /> },
        { path: 'tools', element: <ToolsPage /> },
        { path: 'security', element: <SecurityPage /> },
        { path: 'glossary', element: <GlossaryPage /> },
        { path: 'progress', element: <ProgressPage /> },
        { path: '*', element: <NotFound /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
