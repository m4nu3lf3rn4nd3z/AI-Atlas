import { Anchor, Callout, Concept, Diagram, Figure, Pre, Step, Steps, Term } from './mdx'
import { ToolChip } from './ToolChip'
import { SoftmaxPlayground } from './widgets/SoftmaxPlayground'
import { TokenPreview } from './widgets/TokenPreview'

/* Everything a theory.mdx can use without importing it. */
export const mdxComponents = {
  pre: Pre,
  a: Anchor,
  Callout,
  Term,
  Concept,
  Steps,
  Step,
  Figure,
  Diagram,
  Tool: ToolChip,
  TokenPreview,
  SoftmaxPlayground,
}
