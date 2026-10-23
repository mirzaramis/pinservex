import { useEffect, useRef, useState } from 'react'

export function useIntersectionActive({ rootMargin = '120px', threshold = 0 } = {}) {
  const ref = useRef(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return undefined

    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin, threshold }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [rootMargin, threshold])

  return [ref, active]
}
