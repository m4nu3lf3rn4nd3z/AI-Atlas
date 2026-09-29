// Búsqueda híbrida: fusiona el ranking léxico y el denso con Reciprocal Rank Fusion.
// Solo usa posiciones, así que no hay que calibrar puntuaciones de escalas distintas.

type Ranking = string[] // ids de documentos, del más al menos relevante

export function reciprocalRankFusion(rankings: Ranking[], k = 60): { id: string; score: number }[] {
  const scores = new Map<string, number>()
  for (const ranking of rankings) {
    ranking.forEach((id, i) => scores.set(id, (scores.get(id) ?? 0) + 1 / (k + i + 1)))
  }
  return [...scores].map(([id, score]) => ({ id, score })).sort((a, b) => b.score - a.score)
}

const bm25: Ranking = ['dev-politica-2024', 'dev-politica', 'dev-excepciones']
const dense: Ranking = ['dev-politica', 'dev-politica-2024', 'env-incidencia']

console.log(reciprocalRankFusion([bm25, dense]))
// dev-politica y dev-politica-2024 empatan (1/61 + 1/62): por eso, además de fusionar,
// conviene filtrar por metadatos (la de 2024 está obsoleta) y reordenar con un reranker.
