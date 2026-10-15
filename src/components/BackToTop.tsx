import { useEffect, useState } from 'react'

// Ring geometry in the button's own 48-unit viewBox.
const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function readScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  return {
    // Shown once the reader is past the first screen, where the nav and the hero are out of reach.
    visible: window.scrollY > window.innerHeight * 0.6,
    progress: max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0,
  }
}

/**
 * A floating button that returns to the top of a long case study. Its ring
 * fills as the reader scrolls, so it doubles as a sense of how far is left.
 */
export function BackToTop() {
  const [{ visible, progress }, setScroll] = useState({ visible: false, progress: 0 })

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScroll(readScroll()))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  function backToTop() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, left: 0, behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      aria-label="Back to top"
      title="Back to top"
      // Hidden off-screen state stays out of the tab order and the accessibility tree.
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={backToTop}
    >
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle className="back-to-top__track" cx="24" cy="24" r={RADIUS} />
        <circle
          className="back-to-top__progress"
          cx="24"
          cy="24"
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
        />
        <path className="back-to-top__arrow" d="M24 31V17M18 23l6-6 6 6" />
      </svg>
    </button>
  )
}
