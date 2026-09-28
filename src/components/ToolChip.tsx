import { Link } from 'react-router'
import { Tooltip } from '@/components/ui/primitives'
import { TOOL_BY_ID, TOOL_KIND_LABELS } from '@/content/tools'
import { cn } from '@/lib/cn'

/** A tool from the catalogue, linking to its card in /tools. */
export function ToolChip({ id, className }: { id: string; className?: string }) {
  const tool = TOOL_BY_ID.get(id)
  if (!tool) return null
  return (
    <Tooltip
      content={
        <span>
          <b className="text-fg">{tool.name}</b>
          <span className="ml-2 font-mono text-[10px] text-subtle">{TOOL_KIND_LABELS[tool.kind]}</span>
          <br />
          <span className="text-muted">{tool.description}</span>
        </span>
      }
    >
      <Link
        to={`/tools#${tool.id}`}
        className={cn(
          'inline-flex items-center rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[11.5px] text-muted transition-colors hover:border-border-strong hover:text-fg',
          className,
        )}
      >
        {tool.name}
      </Link>
    </Tooltip>
  )
}
