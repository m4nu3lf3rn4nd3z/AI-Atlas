import { useEffect, useState, type ComponentType } from 'react'
import { loadDetails, loadTheory } from '@/content'
import type { ConceptDetails } from '@/content/schema'

interface Content {
  status: 'loading' | 'ready' | 'missing'
  details: ConceptDetails | null
  Theory: ComponentType | null
}

/** Lazily loads a concept's theory (MDX) and details (quiz, code, sources). */
export function useConceptContent(id: string): Content {
  const [state, setState] = useState<Content & { id: string }>({
    id,
    status: 'loading',
    details: null,
    Theory: null,
  })

  useEffect(() => {
    let alive = true
    Promise.all([loadDetails(id), loadTheory(id)]).then(([details, Theory]) => {
      if (!alive) return
      setState({
        id,
        details,
        Theory,
        status: details && Theory ? 'ready' : 'missing',
      })
    })
    return () => {
      alive = false
    }
  }, [id])

  // While a new id loads, never show the previous concept's content.
  return state.id === id ? state : { status: 'loading', details: null, Theory: null }
}
