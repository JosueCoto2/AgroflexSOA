import { useEffect, useRef, useState } from 'react'

/**
 * Hook para revelar elementos al hacer scroll usando IntersectionObserver.
 * @param {number} threshold - Porcentaje del elemento visible para disparar (0.0 - 1.0)
 * @returns {[React.RefObject, boolean]} - [ref para el elemento, isVisible]
 */
export function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    const el = ref.current
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, isVisible]
}
