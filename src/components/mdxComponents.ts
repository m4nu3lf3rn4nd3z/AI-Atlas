import { Callout, Concept, Diagram, Figure, Pre, Step, Steps, Term } from './mdx'
import { SoftmaxPlayground } from './widgets/SoftmaxPlayground'
import { TokenPreview } from './widgets/TokenPreview'

/* Everything a theory.mdx can use without importing it. */
export const mdxComponents = {
  pre: Pre,
  Callout,
  Term,
  Concept,
  Steps,
  Step,
  Figure,
  Diagram,
  TokenPreview,
  SoftmaxPlayground,
}
