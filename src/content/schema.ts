import { z } from 'zod'

/* The content model. Everything the UI renders about a concept is
   described here; the graph, search and paths are derived from it. */

export const LAYER_IDS = [
  'fundamentals',
  'models',
  'inference',
  'adaptation',
  'knowledge',
  'tools',
  'agents',
  'production',
] as const
export const layerIdSchema = z.enum(LAYER_IDS)
export type LayerId = z.infer<typeof layerIdSchema>

export const RELATION_TYPES = [
  'uses',
  'implements',
  'alternative',
  'improves',
  'part-of',
  'enables',
  'mitigates',
  'evaluates',
] as const
export const relationTypeSchema = z.enum(RELATION_TYPES)
export type RelationType = z.infer<typeof relationTypeSchema>

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id en kebab-case')

export const relationSchema = z.object({
  to: slug,
  type: relationTypeSchema,
  note: z.string().optional(),
})
export type Relation = z.infer<typeof relationSchema>

export const conceptMetaSchema = z.object({
  id: slug,
  title: z.string().min(2),
  /** One-line TL;DR shown on nodes, search results and cards. */
  short: z.string().min(10).max(160),
  layer: layerIdSchema,
  kind: z.enum(['concept', 'technique', 'tool', 'protocol', 'pattern']),
  /** 1 = base, 2 = intermedio, 3 = avanzado */
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  tags: z.array(z.string()),
  prerequisites: z.array(slug),
  relations: z.array(relationSchema),
  labId: slug.optional(),
})
export type ConceptMeta = z.infer<typeof conceptMetaSchema>

export const snippetSchema = z.object({
  title: z.string(),
  lang: z.enum(['python', 'typescript', 'bash', 'json']),
  code: z.string().min(1),
  /** Pinned versions the snippet was written against. */
  deps: z.record(z.string(), z.string()),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}$/),
  note: z.string().optional(),
})
export type Snippet = z.infer<typeof snippetSchema>

export const quizQuestionSchema = z
  .object({
    q: z.string(),
    options: z.array(z.string()).min(2).max(5),
    answer: z.number().int().min(0),
    explain: z.string(),
  })
  .refine((v) => v.answer < v.options.length, 'answer fuera de rango')
export type QuizQuestion = z.infer<typeof quizQuestionSchema>

export const sourceSchema = z.object({
  title: z.string(),
  url: z.url(),
  kind: z.enum(['paper', 'docs', 'blog', 'video', 'repo']),
})
export type Source = z.infer<typeof sourceSchema>

export const conceptDetailsSchema = z.object({
  snippets: z.array(snippetSchema).min(1),
  quiz: z.array(quizQuestionSchema).min(3),
  misconceptions: z.array(z.object({ myth: z.string(), reality: z.string() })).min(1),
  sources: z.array(sourceSchema).min(2),
  /** When the content was last reviewed (YYYY-MM). */
  reviewedAt: z.string().regex(/^\d{4}-\d{2}$/),
  /** For volatile data (models, prices): the date it describes. */
  asOf: z.string().optional(),
})
export type ConceptDetails = z.infer<typeof conceptDetailsSchema>

export const glossaryTermSchema = z.object({
  id: slug,
  term: z.string(),
  definition: z.string().max(320),
  concept: slug.optional(),
})
export type GlossaryTerm = z.infer<typeof glossaryTermSchema>

export const learningPathSchema = z.object({
  id: slug,
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({ concept: slug, why: z.string() })).min(2),
})
export type LearningPath = z.infer<typeof learningPathSchema>
