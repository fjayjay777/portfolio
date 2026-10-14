import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const sectionLink = (section: string) => `/#${section}`

// True while the page is scrolled to (or very near) the top.
function useAtTop(enabled: boolean) {
  const [atTop, setAtTop] = useState(() => typeof window === 'undefined' || window.scrollY < 8)

  useEffect(() => {
    if (!enabled) return
    const check = () => setAtTop(window.scrollY < 8)
    check()
    window.addEventListener('scroll', check, { passive: true })
    return () => window.removeEventListener('scroll', check)
  }, [enabled])

  return atTop
}

// `autoHide` keeps the bar tucked away until the pointer reaches the top edge.
// `showAtTop` also shows it whenever the page is scrolled all the way up.
export function SiteNav({ autoHide = false, showAtTop = false }: { autoHide?: boolean; showAtTop?: boolean }) {
  const location = useLocation()
  const atTop = useAtTop(autoHide && showAtTop)
  const classes = ['site-header', autoHide && 'site-header--auto-hide', autoHide && showAtTop && atTop && 'site-header--shown']

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
