import { useEffect, useRef, useState } from 'react'

/**
 * Flips to true the first time the node is meaningfully on screen, then stops
 * observing — reveals are one-shot, so re-entering must not replay them.
 * Returns a tuple so the ref stays a plain ref at the call site.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  // Without the API the content starts revealed rather than hidden forever.
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setInView(true)
        observer.disconnect()
      },
      { threshold: 0.2 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, inView] as const
}
