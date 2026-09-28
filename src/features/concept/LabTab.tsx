import { FlaskConical, Maximize2 } from 'lucide-react'
import { Suspense } from 'react'
import { Link } from 'react-router'
import { Badge } from '@/components/ui/primitives'
import { LAB_BY_ID, REALITY_LABELS, type LabInfo } from '@/labs/registry'

export function RealityBadge({ lab }: { lab: LabInfo }) {
  const color = lab.reality === 'real' ? 'var(--ok)' : lab.reality === 'mixed' ? 'var(--l2)' : 'var(--warn)'
  return (
    <Badge color={color} title={lab.realityNote}>
      {REALITY_LABELS[lab.reality]}
    </Badge>
  )
}

export function LabTab({ labId, embedded = true }: { labId?: string; embedded?: boolean }) {
  const lab = labId ? LAB_BY_ID.get(labId) : undefined

  if (!lab) {
    return (
      <div className="rounded-2xl border border-dashed border-border-strong p-6 text-center text-[13.5px] text-muted">
        Este concepto no tiene lab propio. Los conceptos relacionados sí pueden tenerlo: revisa
        «Cómo se conecta» en la pestaña Entender.
      </div>
    )
  }

  const { Component } = lab
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FlaskConical className="size-4 text-subtle" />
        <span className="text-[14px] font-semibold">{lab.title}</span>
        <RealityBadge lab={lab} />
        {embedded && Component && (
          <Link
            to={`/labs/${lab.id}`}
            className="ml-auto flex items-center gap-1 text-[12px] text-subtle hover:text-fg"
          >
            <Maximize2 className="size-3.5" /> Pantalla completa
          </Link>
        )}
      </div>
      <p className="text-[12.5px] text-subtle">{lab.realityNote}</p>
      {Component ? (
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-surface-2" />}>
          <Component />
        </Suspense>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong p-6">
          <p className="text-[14px] font-medium">En construcción · fase {lab.phase}</p>
          <p className="mt-1 text-[13px] text-muted">{lab.short}</p>
        </div>
      )}
    </div>
  )
}
