import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * React Router keeps the scroll position across route changes, so following
 * "Next project" from a page footer would land mid-page. Skips hash targets so
 * it never fights useHashScroll.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) return

    // Glide up by default; readers who asked for less motion get the jump.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'instant' : 'smooth' })
  }, [pathname, hash])

  return null
}
