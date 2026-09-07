import { Link } from 'react-router-dom'
import { caseOrder, type CaseName } from '../data/caseOrder'

/** Sends the reader to the next case rather than back to the index. */
export function CaseFooter({ current }: { current: CaseName }) {
  const index = caseOrder.findIndex((entry) => entry.name === current)
  const next = caseOrder[(Math.max(index, 0) + 1) % caseOrder.length]

  return (
    <footer className="case-end section-shell">
      <Link className="case-next" to={next.path}>
        <span className="case-next__label">Next project</span>
        <span className="case-next__row">
          <span className="case-next__name">{next.name}</span>
          <span className="case-next__arrow" aria-hidden="true">↗</span>
        </span>
        <span className="case-next__category">{next.category}</span>
      </Link>
      <nav className="case-links" aria-label="Project navigation">
        <Link className="back-link" to="/#works">← All works</Link>
        <Link className="back-link" to="/#contact">Get in touch →</Link>
      </nav>
    </footer>
  )
}
