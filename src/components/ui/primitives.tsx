import { Tabs as TabsPrimitive, Tooltip as TooltipPrimitive } from 'radix-ui'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/cn'

/* Small, styled wrappers over Radix primitives (shadcn-style). */

export function Kbd({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-surface-2 px-1 font-mono text-[10px] text-muted',
        className,
      )}
      {...props}
    />
  )
}

export function Badge({
  className,
  color,
  style,
  ...props
}: ComponentProps<'span'> & { color?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-medium leading-none',
        !color && 'border-border bg-surface-2 text-muted',
        className,
      )}
      style={
        color
          ? ({
              color,
              borderColor: `color-mix(in oklab, ${color} 35%, transparent)`,
              background: `color-mix(in oklab, ${color} 10%, transparent)`,
              ...style,
            } as CSSProperties)
          : style
      }
      {...props}
    />
  )
}

export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}) {
  return (
    <TooltipPrimitive.Root delayDuration={200}>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={6}
          className="z-50 max-w-xs rounded-lg border border-border bg-surface px-3 py-2 text-[12.5px] leading-relaxed text-fg shadow-xl shadow-black/20"
        >
          {content}
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export const TooltipProvider = TooltipPrimitive.Provider

export function Tabs(props: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />
}

export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('flex items-center gap-1 border-b border-border', className)}
      {...props}
    />
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'relative -mb-px inline-flex h-10 cursor-pointer items-center gap-2 border-b-2 border-transparent px-3 text-[13px] font-medium text-muted transition-colors hover:text-fg data-[state=active]:border-accent data-[state=active]:text-fg [&_svg]:size-3.5',
        className,
      )}
      {...props}
    />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn('outline-none', className)} {...props} />
}

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('rounded-xl border border-border bg-surface', className)} {...props} />
  )
}

export function SectionLabel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-subtle',
        className,
      )}
      {...props}
    />
  )
}
