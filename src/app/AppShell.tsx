import { BookText, Briefcase, FlaskConical, Gauge, Moon, Network, Route, Search, Sun, Wrench } from 'lucide-react'
import { lazy, Suspense, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { Kbd, Tooltip } from '@/components/ui/primitives'
import { ProgressRing } from '@/features/progress/ProgressRing'
import { cn } from '@/lib/cn'
import { useUi } from '@/stores/ui'
import { Logo } from './Logo'

const NAV = [
  { to: '/map', label: 'Mapa', icon: Network },
  { to: '/paths', label: 'Rutas', icon: Route },
  { to: '/labs', label: 'Labs', icon: FlaskConical },
  { to: '/cases', label: 'Casos', icon: Briefcase },
  { to: '/tools', label: 'Herramientas', icon: Wrench },
  { to: '/glossary', label: 'Glosario', icon: BookText },
  { to: '/progress', label: 'Progreso', icon: Gauge },
]

const CommandPalette = lazy(() =>
  import('@/features/search/CommandPalette').then((m) => ({ default: m.CommandPalette })),
)

export function AppShell() {
  const theme = useUi((s) => s.theme)
  const setTheme = useUi((s) => s.setTheme)
  const setPaletteOpen = useUi((s) => s.setPaletteOpen)
  // The palette (and its index of concepts, cases and tools) loads on first use.
  const paletteLoaded = useUi((s) => s.paletteLoaded)
  const { pathname } = useLocation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName ?? '')
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setPaletteOpen])

  const fullBleed = pathname.startsWith('/map')

  return (
    <div className="flex h-full flex-col">
      <header className="z-30 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-bg/80 px-3 backdrop-blur-md sm:px-4">
        <Link to="/" className="mr-2 flex items-center gap-2 rounded-md pr-1" aria-label="AI Atlas, inicio">
          <Logo className="size-6" />
          <span className="hidden text-[14px] font-semibold tracking-tight sm:inline">AI Atlas</span>
        </Link>
        <nav className="flex items-center gap-0.5" aria-label="Principal">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  'flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg lg:px-2.5',
                  isActive && 'bg-surface-2 text-fg',
                  // On phones the progress ring in the header already links there.
                  to === '/progress' && 'max-sm:hidden',
                )
              }
            >
              <Icon className="size-4" aria-hidden />
              <span className="hidden lg:inline">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Buscar"
            className="flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] whitespace-nowrap text-subtle transition-colors hover:border-border-strong hover:text-muted xl:w-60"
          >
            <Search className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden xl:inline">Buscar en el atlas…</span>
            <Kbd className="ml-auto hidden xl:inline-flex [@media(hover:none)]:!hidden">Ctrl K</Kbd>
          </button>
          <ProgressRing />
          <Tooltip content={theme === 'dark' ? 'Tema claro' : 'Tema oscuro'}>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-fg"
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </button>
          </Tooltip>
        </div>
      </header>
      <main className={cn('min-h-0 flex-1', fullBleed ? 'overflow-hidden' : 'overflow-y-auto')}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      {paletteLoaded && (
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
      )}
    </div>
  )
}

function PageFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="size-5 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  )
}
