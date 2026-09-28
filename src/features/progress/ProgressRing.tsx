import { Link } from 'react-router'
import { Tooltip } from '@/components/ui/primitives'
import { CONCEPTS, WRITTEN_COUNT } from '@/content'
import { useProgress } from '@/stores/progress'

export function ProgressRing() {
  const concepts = useProgress((s) => s.concepts)
  const learned = CONCEPTS.filter((c) => concepts[c.id]?.learnedAt).length
  const ratio = WRITTEN_COUNT ? learned / WRITTEN_COUNT : 0
  const r = 9
  const circ = 2 * Math.PI * r

  return (
    <Tooltip
      content={
        <span>
          <b>{learned}</b> de {WRITTEN_COUNT} conceptos publicados aprendidos
          <br />
          <span className="text-muted">
            {CONCEPTS.length} en el mapa · {CONCEPTS.length - WRITTEN_COUNT} en preparación
          </span>
        </span>
      }
    >
      <Link
        to="/progress"
        className="flex h-8 items-center gap-1.5 rounded-md px-1.5 text-[12px] tabular-nums text-muted hover:bg-surface-2 hover:text-fg"
        aria-label={`Progreso: ${learned} de ${WRITTEN_COUNT}`}
      >
        <svg viewBox="0 0 24 24" className="size-5 -rotate-90">
          <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2.5" />
          <circle
            cx="12"
            cy="12"
            r={r}
            fill="none"
            stroke="var(--ok)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - ratio)}
            className="transition-[stroke-dashoffset] duration-700"
          />
        </svg>
        <span className="hidden sm:inline">
          {learned}/{WRITTEN_COUNT}
        </span>
      </Link>
    </Tooltip>
  )
}
