import { AttentionDiagram } from './Attention'
import { EmbeddingSpaceDiagram } from './EmbeddingSpace'
import { HnswDiagram } from './Hnsw'
import { KvCacheDiagram } from './KvCache'
import { LostInMiddleDiagram } from './LostInMiddle'
import { MoeDiagram } from './Moe'
import { PipelineDiagram } from './Pipeline'
import { QuantGridDiagram } from './QuantGrid'
import { RagPipelineDiagram } from './RagPipeline'
import { ReasoningDiagram } from './Reasoning'
import { TrainingDiagram } from './Training'

export const DIAGRAMS = {
  pipeline: PipelineDiagram,
  attention: AttentionDiagram,
  'kv-cache': KvCacheDiagram,
  'lost-in-middle': LostInMiddleDiagram,
  training: TrainingDiagram,
  moe: MoeDiagram,
  reasoning: ReasoningDiagram,
  'embedding-space': EmbeddingSpaceDiagram,
  'quant-grid': QuantGridDiagram,
  'rag-pipeline': RagPipelineDiagram,
  hnsw: HnswDiagram,
}
