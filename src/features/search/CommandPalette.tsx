import { Command } from 'cmdk'
import { ArrowRight, BookText, FlaskConical, Hash, Route } from 'lucide-react'
import { Dialog, VisuallyHidden } from 'radix-ui'
import type { ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { CONCEPTS, hasContent } from '@/content'
import { GLOSSARY } from '@/content/glossary'
import { LAYER_BY_ID } from '@/content/layers'
import { PATHS } from '@/content/paths'
import { LABS } from '@/labs/registry'
import { useUi } from '@/stores/ui'

const PAGES = [
  { to: '/map', label: 'Mapa del ecosistema' },
  { to: '/paths', label: 'Rutas de aprendizaje' },
  { to: '/labs', label: 'Labs' },
  { to: '/journey', label: 'Anatomía de una petición' },
  { to: '/glossary', label: 'Glosario' },
  { to: '/progress', label: 'Mi progreso' },
]

const itemClass =
  'flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg'

export function CommandPalette() {
  const open = useUi((s) => s.paletteOpen)
  const setOpen = useUi((s) => s.setPaletteOpen)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }
  const openConcept = (id: string) => go(pathname.startsWith('/map') ? `/map?c=${id}` : `/c/${id}`)

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className="fixed top-[12vh] left-1/2 z-50 w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40"
          aria-describedby={undefined}
        >
          <VisuallyHidden.Root>
            <Dialog.Title>Buscar</Dialog.Title>
          </VisuallyHidden.Root>
          <Command loop>
            <Command.Input
              autoFocus
              placeholder="Busca un concepto, lab, término…"
              className="h-12 w-full border-b border-border bg-transparent px-4 text-[14px] text-fg outline-none placeholder:text-subtle"
            />
            <Command.List className="max-h-[60vh] overflow-y-auto p-2">
              <Command.Empty className="px-3 py-8 text-center text-[13px] text-subtle">
                Sin resultados
              </Command.Empty>
              <Group heading="Conceptos">
                {CONCEPTS.map((c) => (
                  <Command.Item
                    key={c.id}
                    value={`concept:${c.id}`}
                    keywords={[c.title, c.short, ...c.tags]}
                    onSelect={() => openConcept(c.id)}
                    className={itemClass}
                  >
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ background: LAYER_BY_ID[c.layer].color }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-fg">{c.title}</span>
                      <span className="block truncate text-[12px] text-subtle">{c.short}</span>
                    </span>
                    {!hasContent(c.id) && (
                      <span className="shrink-0 font-mono text-[10px] text-subtle">pronto</span>
                    )}
                  </Command.Item>
                ))}
              </Group>
              <Group heading="Labs">
                {LABS.map((l) => (
                  <Command.Item
                    key={l.id}
                    value={`lab:${l.id}`}
                    keywords={[l.title, l.short]}
                    onSelect={() => go(`/labs/${l.id}`)}
                    className={itemClass}
                  >
                    <FlaskConical className="size-4 shrink-0" />
                    <span className="flex-1 truncate text-fg">{l.title}</span>
                    {!l.Component && (
                      <span className="font-mono text-[10px] text-subtle">fase {l.phase}</span>
                    )}
                  </Command.Item>
                ))}
              </Group>
              <Group heading="Rutas">
                {PATHS.map((p) => (
                  <Command.Item
                    key={p.id}
                    value={`path:${p.id}`}
                    keywords={[p.title]}
                    onSelect={() => go(`/paths/${p.id}`)}
                    className={itemClass}
                  >
                    <Route className="size-4 shrink-0" />
                    <span className="truncate text-fg">{p.title}</span>
                  </Command.Item>
                ))}
              </Group>
              <Group heading="Glosario">
                {GLOSSARY.map((g) => (
                  <Command.Item
                    key={g.id}
                    value={`term:${g.id}`}
                    keywords={[g.term, g.definition]}
                    onSelect={() => go(`/glossary#${g.id}`)}
                    className={itemClass}
                  >
                    <Hash className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-fg">{g.term}</span>
                      <span className="block truncate text-[12px] text-subtle">{g.definition}</span>
                    </span>
                  </Command.Item>
                ))}
              </Group>
              <Group heading="Ir a">
                {PAGES.map((p) => (
                  <Command.Item
                    key={p.to}
                    value={`page:${p.to}`}
                    keywords={[p.label]}
                    onSelect={() => go(p.to)}
                    className={itemClass}
                  >
                    {p.to === '/glossary' ? (
                      <BookText className="size-4 shrink-0" />
                    ) : (
                      <ArrowRight className="size-4 shrink-0" />
                    )}
                    <span className="text-fg">{p.label}</span>
                  </Command.Item>
                ))}
              </Group>
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function Group({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10.5px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle"
    >
      {children}
    </Command.Group>
  )
}
