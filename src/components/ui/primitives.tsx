import { Select as SelectPrimitive, Tabs as TabsPrimitive, Tooltip as TooltipPrimitive } from 'radix-ui'
import { ChevronDown } from 'lucide-react'
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

/* ─── Select ─── */
export function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root {...props} />
}

export function SelectTrigger({
  className,
  active,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & { active?: boolean }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-[13px] text-fg outline-none transition-colors hover:border-border-strong focus:border-accent',
        active && 'border-accent/60 bg-accent-soft',
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="ml-auto size-3.5 text-subtle" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

export function SelectContent({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={4}
        className={cn(
          'z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-surface shadow-xl shadow-black/20',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md px-3 py-1.5 text-[13px] text-fg outline-none transition-colors data-[highlighted]:bg-surface-2 data-[state=checked]:text-accent',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

export const SelectValue = SelectPrimitive.Value

/* ─── Card ─── */
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
