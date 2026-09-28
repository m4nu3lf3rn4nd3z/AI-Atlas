import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import NotFound from '@/app/NotFound'
import { conceptsInLayer, getConcept } from '@/content'
import { LAYER_BY_ID } from '@/content/layers'
import { ConceptView } from './ConceptView'
import { isConceptTab } from './tabs'

export default function ConceptPage() {
  const { id, tab } = useParams()
  const navigate = useNavigate()
  const concept = getConcept(id)
  if (!concept) return <NotFound />

  const layer = LAYER_BY_ID[concept.layer]
  const siblings = conceptsInLayer(concept.layer)
  const i = siblings.findIndex((c) => c.id === concept.id)
  const prev = siblings[i - 1]
  const next = siblings[i + 1]

  return (
    <div className="mx-auto max-w-3xl px-5 pt-6 pb-20">
      <nav className="mb-4 flex items-center gap-1.5 text-[12.5px] text-subtle" aria-label="Migas">
        <Link to="/map" className="hover:text-fg">
          Mapa
        </Link>
        <span>/</span>
        <Link to={`/map#${layer.id}`} className="hover:text-fg" style={{ color: layer.color }}>
          {layer.title}
        </Link>
      </nav>
      <ConceptView
        key={concept.id}
        id={concept.id}
        tab={isConceptTab(tab) ? tab : 'learn'}
        onTabChange={(t) => navigate(`/c/${concept.id}/${t}`, { replace: true })}
        onNavigate={(n) => navigate(`/c/${n}`)}
        variant="page"
      />
      <div className="mt-12 grid grid-cols-2 gap-3 border-t border-border pt-6">
        {prev ? (
          <Link to={`/c/${prev.id}`} className="group rounded-xl border border-border p-3 hover:bg-surface">
            <span className="flex items-center gap-1 text-[11.5px] text-subtle">
              <ArrowLeft className="size-3" /> Anterior en la capa
            </span>
            <span className="mt-1 block text-[13.5px] font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/c/${next.id}`} className="group rounded-xl border border-border p-3 text-right hover:bg-surface">
            <span className="flex items-center justify-end gap-1 text-[11.5px] text-subtle">
              Siguiente en la capa <ArrowRight className="size-3" />
            </span>
            <span className="mt-1 block text-[13.5px] font-medium">{next.title}</span>
          </Link>
        )}
      </div>
    </div>
  )
}
