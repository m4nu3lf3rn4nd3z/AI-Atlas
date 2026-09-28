export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="var(--surface-2)" stroke="var(--border)" />
      <g fill="none" strokeWidth="2" strokeLinecap="round">
        <path d="M9 22 L16 9 L23 22" stroke="var(--l0)" />
        <path d="M12 17 H20" stroke="var(--l2)" />
      </g>
      <circle cx="16" cy="9" r="2.2" fill="var(--l0)" />
      <circle cx="9" cy="22" r="2.2" fill="var(--l4)" />
      <circle cx="23" cy="22" r="2.2" fill="var(--l6)" />
    </svg>
  )
}
