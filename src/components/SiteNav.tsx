import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const sectionLink = (section: string) => `/#${section}`

// Below this the bar is always shown: the reader is still at the top of the page.
const REVEAL_ZONE = 80
// Scroll movement smaller than this is jitter, not a change of direction.
const DIRECTION_THRESHOLD = 6

// True while the reader is scrolling down past the top of the page; any scroll back up clears it.
function useHiddenOnScrollDown(enabled: boolean) {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let last = window.scrollY
    const update = () => {
      const y = window.scrollY
      const delta = y - last
      if (Math.abs(delta) < DIRECTION_THRESHOLD && y > REVEAL_ZONE) return
      setHidden(delta > 0 && y > REVEAL_ZONE)
      last = y
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [enabled])

  return hidden
}

// `autoHide` slides the bar away while the reader scrolls down and brings it back on any scroll up.
export function SiteNav({ autoHide = false }: { autoHide?: boolean }) {
  const location = useLocation()
  const hidden = useHiddenOnScrollDown(autoHide)
  const classes = ['site-header', autoHide && 'site-header--auto-hide', hidden && 'site-header--hidden']

  function scrollOnHomepage(event: React.MouseEvent<HTMLAnchorElement>, section: string) {
    if (location.pathname !== '/') return

    event.preventDefault()
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={classes.filter(Boolean).join(' ')}>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" aria-label="Jiani Huang home" to="/">
          <svg className="brand-mark" viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
            <path className="brand-mark__h" d="M22 21H35M35 9V35" />
            <path className="brand-mark__j" d="M13 9H22V28C22 32.5 19.5 35 15 35C10.5 35 8 32.5 8 28" />
          </svg>
        </Link>
        <div className="nav-links">
          <Link to={sectionLink('works')} onClick={(event) => scrollOnHomepage(event, 'works')}>Works</Link>
          <NavLink to="/me">ME</NavLink>
          <NavLink to="/playground">Playground</NavLink>
          <Link to={sectionLink('contact')} onClick={(event) => scrollOnHomepage(event, 'contact')}>Contact</Link>
        </div>
      </nav>
    </header>
  )
}
