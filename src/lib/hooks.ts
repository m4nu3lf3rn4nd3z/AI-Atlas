import { useCallback, useState, useSyncExternalStore } from 'react'

/** Width of an element, kept up to date with a ResizeObserver. Use the returned ref callback. */
export function useElementWidth<T extends HTMLElement>(initial = 640): [(el: T | null) => void, number] {
  const [width, setWidth] = useState(initial)
  const ref = useCallback((el: T | null) => {
    if (!el) return
    setWidth(el.getBoundingClientRect().width || initial)
    const ro = new ResizeObserver(([entry]) => entry && setWidth(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [initial])
  return [ref, width]
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
