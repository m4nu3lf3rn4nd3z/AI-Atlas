import { Check, ClipboardCopy, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { copyText } from '@/lib/clipboard'
import { cn } from '@/lib/cn'
import { CHECKLIST, CHECKLIST_ITEMS } from '@/security/checklist'
import { useSecurityReview } from '@/stores/security'

/* Architecture review checklist with progress, a critical-only filter and a
   Markdown export to paste into a ticket or a review document. */
export function ReviewChecklist() {
  const checked = useSecurityReview((s) => s.checked)
  const toggle = useSecurityReview((s) => s.toggle)
  const reset = useSecurityReview((s) => s.reset)
  const [criticalOnly, setCriticalOnly] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const done = CHECKLIST_ITEMS.filter((i) => checked[i.id]).length
  const critical = CHECKLIST_ITEMS.filter((i) => i.critical)
  const criticalDone = critical.filter((i) => checked[i.id]).length

  const markdown = () =>
    [
      '# Revisión de seguridad de arquitectura de IA',
      '',
      `Progreso: ${done}/${CHECKLIST_ITEMS.length} · críticos ${criticalDone}/${critical.length}`,
      '',
      ...CHECKLIST.flatMap((s) => [
        `## ${s.title}`,
        ...s.items.map((i) => `- [${checked[i.id] ? 'x' : ' '}] ${i.critical ? '**[crítico]** ' : ''}${i.text}`),
        '',
      ]),
    ].join('\n')

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Progress label="Controles revisados" value={done} total={CHECKLIST_ITEMS.length} />
        <Progress label="Controles críticos" value={criticalDone} total={critical.length} critical />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setCriticalOnly(!criticalOnly)}
          aria-pressed={criticalOnly}
          className={cn('h-8 cursor-pointer rounded-lg border px-2.5 text-[12.5px]', criticalOnly ? 'border-bad/50 bg-bad/10 text-fg' : 'border-border text-muted hover:text-fg')}
        >
          Solo críticos
        </button>
        <Button
          size="sm"
          variant="outline"
          onClick={async () => setMessage((await copyText(markdown())) ? 'Checklist copiada como Markdown.' : 'No se pudo copiar en este navegador.')}
        >
          <ClipboardCopy /> Copiar como Markdown
        </Button>
        {confirming ? (
          <span className="flex items-center gap-2 text-[12.5px]">
            ¿Desmarcar todo?
            <Button size="sm" variant="outline" className="border-bad/50 text-bad" onClick={() => { reset(); setConfirming(false) }}>
              Sí
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
              No
            </Button>
          </span>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
            <RotateCcw /> Reiniciar
          </Button>
        )}
        {message && <span className="text-[12px] text-subtle">{message}</span>}
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {CHECKLIST.map((section) => {
          const items = section.items.filter((i) => !criticalOnly || i.critical)
          if (items.length === 0) return null
          const sectionDone = section.items.filter((i) => checked[i.id]).length
          return (
            <section key={section.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[14.5px] font-semibold">{section.title}</h3>
                <span className="font-mono text-[11px] text-subtle">
                  {sectionDone}/{section.items.length}
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {items.map((i) => (
                  <li key={i.id}>
                    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-surface-2">
                      <input type="checkbox" checked={!!checked[i.id]} onChange={() => toggle(i.id)} className="sr-only" />
                      <span
                        aria-hidden
                        className={cn(
                          'mt-0.5 flex size-4.5 shrink-0 items-center justify-center rounded border',
                          checked[i.id] ? 'border-ok bg-ok text-white' : 'border-border-strong',
                        )}
                      >
                        {checked[i.id] && <Check className="size-3" strokeWidth={3} />}
                      </span>
                      <span className={cn('text-[13px] leading-relaxed', checked[i.id] && 'text-subtle line-through decoration-border-strong')}>
                        {i.critical && (
                          <span className="mr-1.5 rounded bg-bad/10 px-1 py-px text-[10.5px] font-semibold text-bad">CRÍTICO</span>
                        )}
                        {i.text}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <p className="mt-3 text-[11.5px] text-subtle">El estado de la checklist se guarda solo en este navegador.</p>
    </div>
  )
}

function Progress({ label, value, total, critical }: { label: string; value: number; total: number; critical?: boolean }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-baseline justify-between text-[12.5px]">
        <span className="text-muted">{label}</span>
        <span className="font-semibold">
          {value}/{total} · {pct} %
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-3">
        <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: critical ? 'var(--bad)' : 'var(--prog-2)' }} />
      </div>
    </div>
  )
}
