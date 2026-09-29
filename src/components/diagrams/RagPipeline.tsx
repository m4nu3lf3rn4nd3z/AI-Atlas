import { Arrow, ArrowDefs, Box, Label, Svg } from './kit'

/** Offline indexing on top, online query path below. */
export function RagPipelineDiagram() {
  const top = 46
  const bottom = 176
  const w = 118
  const h = 50
  const xs = [20, 172, 324, 476, 628]
  return (
    <Svg viewBox="0 0 770 260" aria-label="Pipeline RAG: indexación y consulta">
      <ArrowDefs />
      <Label x={20} y={24} anchor="start" mono size={10.5} color="var(--fg-subtle)">
        INDEXACIÓN · UNA VEZ, OFFLINE
      </Label>
      <Box x={xs[0]!} y={top} w={w} h={h} label="Documentos" sub="PDF, web, tickets" />
      <Box x={xs[1]!} y={top} w={w} h={h} label="Extraer" sub="texto limpio" />
      <Box x={xs[2]!} y={top} w={w} h={h} label="Chunking" sub="+ metadatos" color="var(--l4)" />
      <Box x={xs[3]!} y={top} w={w} h={h} label="Embeddings" sub="+ índice BM25" color="var(--l4)" />
      <Box x={xs[4]!} y={top} w={w} h={h} label="Índice" sub="base vectorial" color="var(--l4)" strong />
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={xs[i]! + w} y1={top + h / 2} x2={xs[i + 1]! - 4} y2={top + h / 2} />
      ))}

      <Label x={20} y={154} anchor="start" mono size={10.5} color="var(--fg-subtle)">
        CONSULTA · EN CADA PETICIÓN
      </Label>
      <Box x={xs[0]!} y={bottom} w={w} h={h} label="Pregunta" sub="+ filtros" />
      <Box x={xs[1]!} y={bottom} w={w} h={h} label="Recuperar" sub="top 20–50" color="var(--l4)" />
      <Box x={xs[2]!} y={bottom} w={w} h={h} label="Re-ranking" sub="top 3–8" color="var(--l4)" />
      <Box x={xs[3]!} y={bottom} w={w} h={h} label="Prompt" sub="fuentes + pregunta" color="var(--l3)" />
      <Box x={xs[4]!} y={bottom} w={w} h={h} label="LLM" sub="respuesta citada" color="var(--l0)" strong />
      {[0, 1, 2, 3].map((i) => (
        <Arrow key={i} x1={xs[i]! + w} y1={bottom + h / 2} x2={xs[i + 1]! - 4} y2={bottom + h / 2} />
      ))}
      <Arrow x1={xs[4]! + w / 2} y1={top + h + 2} x2={xs[1]! + w / 2 + 20} y2={bottom - 4} dashed curve={-10} />
      <Label x={470} y={142} size={10.5} color="var(--fg-subtle)">
        búsqueda en el índice
      </Label>
    </Svg>
  )
}
