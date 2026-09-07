import { Link, NavLink, useLocation } from 'react-router-dom'

const sectionLink = (section: string) => `/#${section}`

export function SiteNav({ autoHide = false }: { autoHide?: boolean }) {
  const location = useLocation()

  function scrollOnHomepage(event: React.MouseEvent<HTMLAnchorElement>, section: string) {
    if (location.pathname !== '/') return

    event.preventDefault()
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header className={autoHide ? 'site-header site-header--auto-hide' : 'site-header'}>
      <nav className="site-nav" aria-label="Primary navigation">
        <Link className="wordmark" aria-label="Jiani Huang home" to="/">JH</Link>
        <div className="nav-links">
          <Link to={sectionLink('works')} onClick={(event) => scrollOnHomepage(event, 'works')}>Works</Link>
          <NavLink to="/me">ME</NavLink>
          <Link to={sectionLink('contact')} onClick={(event) => scrollOnHomepage(event, 'contact')}>Contact</Link>
        </div>
      </nav>
    </header>
  )
}
