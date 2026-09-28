import { ArrowLeft, BookOpen } from 'lucide-react'
import { Link, useParams } from 'react-router'
import NotFound from '@/app/NotFound'
import { getConcept } from '@/content'
import { LAB_BY_ID } from '@/labs/registry'
import { LabTab } from '../concept/LabTab'

export default function LabPage() {
  const { labId } = useParams()
  const lab = labId ? LAB_BY_ID.get(labId) : undefined
  if (!lab) return <NotFound />
  const concept = getConcept(lab.concept)

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3 text-[12.5px] text-subtle">
        <Link to="/labs" className="flex items-center gap-1 hover:text-fg">
          <ArrowLeft className="size-3.5" /> Labs
        </Link>
        {concept && (
          <Link to={`/c/${concept.id}`} className="ml-auto flex items-center gap-1 hover:text-fg">
            <BookOpen className="size-3.5" /> Teoría: {concept.title}
          </Link>
        )}
      </div>
      <p className="mb-6 max-w-2xl text-[14.5px] leading-relaxed text-muted">{lab.short}</p>
      <LabTab labId={lab.id} embedded={false} />
    </div>
  )
}
