// Percentiles de latencia a partir de mediciones: el p95 cuenta lo que la media esconde.
function percentile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b)
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
  return sorted[Math.max(0, idx)]!
}

// TTFT medidos (s) en 20 peticiones: la mayoría rápidas, una cola lenta
const ttft = [0.42, 0.51, 0.47, 0.39, 0.55, 0.61, 0.44, 0.48, 0.52, 0.46, 0.5, 0.43, 0.58, 0.49, 0.41, 0.53, 0.47, 0.45, 3.9, 6.2]

const mean = ttft.reduce((a, b) => a + b, 0) / ttft.length
console.log(`media ${mean.toFixed(2)} s · p50 ${percentile(ttft, 50)} s · p95 ${percentile(ttft, 95)} s · p99 ${percentile(ttft, 99)} s`)
// media 0.94 s · p50 0.48 s · p95 3.9 s · p99 6.2 s
