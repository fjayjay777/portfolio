import { Fragment, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

const sectionLink = (section: string) => `/#${section}`

/** Homepage sections scroll in place; pages are routes, so they can mark themselves current. */
const navItems = [
  { label: 'Works', section: 'works' },
  { label: 'Me', to: '/me' },
  { label: 'Playground', to: '/playground' },
  { label: 'Contact', section: 'contact' },
] as const

// The width at which the links fold into the menu button; matches the phone breakpoint in styles.css.
const PHONE_QUERY = '(max-width: 680px)'

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
// On phones the links fold into a menu button that opens a full-screen list.
export function SiteNav({ autoHide = false }: { autoHide?: boolean }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  // The bar stays put while the menu is open, since its button is the way out.
  const hidden = useHiddenOnScrollDown(autoHide) && !menuOpen
  const classes = ['site-header', autoHide && 'site-header--auto-hide', hidden && 'site-header--hidden', menuOpen && 'site-header--menu-open']

  // Any navigation, back and forward included, closes the menu.
  const place = `${location.pathname}${location.hash}`
  const [menuPlace, setMenuPlace] = useState(place)
  if (menuPlace !== place) {
    setMenuPlace(place)
    setMenuOpen(false)
  }

  useEffect(() => {
    if (!menuOpen) return
    // The page behind the open menu holds still.
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    menuRef.current?.querySelector('a')?.focus()

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setMenuOpen(false)
      toggleRef.current?.focus()
    }
    // Growing past phone width brings the inline links back, so the menu has no reason to stay.
    const phone = window.matchMedia?.(PHONE_QUERY)
    const onWidth = (event: MediaQueryListEvent) => { if (!event.matches) setMenuOpen(false) }
    window.addEventListener('keydown', onKey)
    phone?.addEventListener('change', onWidth)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
      phone?.removeEventListener('change', onWidth)
    }
  }, [menuOpen])

  function scrollOnHomepage(event: React.MouseEvent<HTMLAnchorElement>, section: string) {
    setMenuOpen(false)
    if (location.pathname !== '/') return

    event.preventDefault()
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function renderLink(item: (typeof navItems)[number], content: React.ReactNode, className?: string) {
    if ('section' in item) {
      return (
        <Link className={className} to={sectionLink(item.section)} onClick={(event) => scrollOnHomepage(event, item.section)}>
          {content}
        </Link>
      )
    }
    return <NavLink className={className} to={item.to} onClick={() => setMenuOpen(false)}>{content}</NavLink>
  }

  return (
    <>
      <header className={classes.filter(Boolean).join(' ')}>
        <nav className="site-nav" aria-label="Primary navigation">
          <Link className="wordmark" aria-label="Jiani Huang home" to="/">
            <svg className="brand-mark" viewBox="0 0 44 44" fill="none" aria-hidden="true" focusable="false">
              <path className="brand-mark__h" d="M22 21H35M35 9V35" />
              <path className="brand-mark__j" d="M13 9H22V28C22 32.5 19.5 35 15 35C10.5 35 8 32.5 8 28" />
            </svg>
          </Link>
          <div className="nav-links">
            {navItems.map((item) => <Fragment key={item.label}>{renderLink(item, item.label === 'Me' ? 'ME' : item.label)}</Fragment>)}
          </div>
          <button
            ref={toggleRef}
            className="nav-toggle"
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="nav-toggle__bar" aria-hidden="true" />
            <span className="nav-toggle__bar" aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Outside the header: its backdrop blur would otherwise trap a fixed panel inside the bar. */}
      {menuOpen && (
        <div className="nav-menu surface-dark" id="site-menu" ref={menuRef}>
          <nav aria-label="Menu">
            <ol className="nav-menu__list">
              {navItems.map((item, index) => (
                <li key={item.label} style={{ '--i': index } as CSSProperties}>
                  {renderLink(item, (
                    <>
                      <span className="nav-menu__index">0{index + 1}</span>
                      <span className="nav-menu__label">{item.label}</span>
                      <span className="nav-menu__arrow" aria-hidden="true">↗</span>
                    </>
                  ), 'nav-menu__link')}
                </li>
              ))}
            </ol>
          </nav>
          <a className="nav-menu__email" href="mailto:huangjn35@gmail.com">huangjn35@gmail.com</a>
        </div>
      )}
    </>
  )
}
