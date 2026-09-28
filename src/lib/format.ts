const nf = (max: number) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: max })

/** 850 → «0,85 s», 12_400 → «12,4 s», 1_500_000 → «25 min», 7_200_000 → «2 h». */
export function formatDuration(ms: number): string {
  if (ms < 60_000) return `${nf(ms < 10_000 ? 2 : 1).format(ms / 1000)} s`
  if (ms < 3_600_000) return `${nf(0).format(ms / 60_000)} min`
  return `${nf(1).format(ms / 3_600_000)} h`
}

/** 950 → «950», 12_400 → «12,4 k», 1_200_000 → «1,2 M». */
export function formatTokens(n: number): string {
  if (n < 1000) return nf(0).format(n)
  if (n < 1_000_000) return `${nf(1).format(n / 1000)} k`
  return `${nf(2).format(n / 1_000_000)} M`
}

export function formatUsd(n: number): string {
  if (n === 0) return '0 $'
  const digits = n < 0.01 ? 4 : n < 1 ? 3 : 2
  return `${new Intl.NumberFormat('es-ES', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)} $`
}

const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })

/** «hace 5 minutos», «ayer»… */
export function formatAgo(timestamp: number, now = Date.now()): string {
  const s = Math.round((timestamp - now) / 1000)
  const abs = Math.abs(s)
  if (abs < 60) return rtf.format(s, 'second')
  if (abs < 3600) return rtf.format(Math.round(s / 60), 'minute')
  if (abs < 86_400) return rtf.format(Math.round(s / 3600), 'hour')
  return rtf.format(Math.round(s / 86_400), 'day')
}
