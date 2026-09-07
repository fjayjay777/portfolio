import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroFigure } from '../components/HeroFigure'
import { ProjectDialog, type Project } from '../components/ProjectDialog'
import { SiteNav } from '../components/SiteNav'
import { useHashScroll } from '../hooks/useHashScroll'
import { useInView } from '../hooks/useInView'

const projects: Project[] = [
  {
    name: 'Claimly',
    category: 'Financial clarity',
    chip: '#7fa895',
    summary: 'A concept that helps people understand claims and make confident decisions with information that is easy to act on.',
    caseStudy: '/work/claimly',
    // Claimly's shell is 402 wide (iPhone 16 Pro), not the 430 the frame defaults to.
    demo: { url: '/demos/claimly/', canvas: '#f4f4f4', viewport: { width: 402, height: 874 } },
  },
  {
    name: 'Medisync',
    category: 'Healthcare access',
    chip: '#7d97bb',
    summary: 'A patient-centered booking experience that makes it easier to compare care options and coordinate appointments.',
    caseStudy: '/work/medisync',
    demo: { url: '/demos/medisync/', canvas: '#f4f5f2' },
  },
  {
    name: 'Sizzle',
    category: 'Food discovery',
    chip: '#c79553',
    summary: 'A warm, mobile-first cooking experience for finding recipes, planning meals, and keeping a personal kitchen organized.',
    caseStudy: '/work/sizzle',
    // Sizzle's landing header is a translucent cream over the page color, so the
    // status bar has to match the composited result, not the page token.
    demo: { url: '/demos/sizzle/', canvas: '#fef9f0' },
  },
]

export function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [lastTrigger, setLastTrigger] = useState<HTMLButtonElement | null>(null)
  const [contactRef, contactInView] = useInView<HTMLElement>()
  useHashScroll()

  function openProject(project: Project, trigger: HTMLButtonElement) {
    setLastTrigger(trigger)
    setSelectedProject(project)
  }

  return (
    <div className="site-shell">
      <SiteNav />
      <main>
        <section className="hero section-shell" aria-labelledby="home-title">
          <HeroFigure />
          <p className="eyebrow">Designer &amp; Researcher</p>
          <h1 id="home-title">Jiani Huang</h1>
          <p className="hero-lead">I design human-centered products that bridge user needs, intelligent technology, and thoughtful interaction.</p>
          <div className="hero-detail">
            <p className="meta-label">University of Michigan School of Information</p>
            <p className="location">Based in Ann Arbor</p>
          </div>
        </section>

        <section className="works section-shell" id="works" aria-labelledby="works-title">
          <div className="section-label">
            <span>/</span><h2 id="works-title">Selected works</h2>
            <span className="count">0{projects.length}</span>
          </div>
          <div className="work-list">
            {projects.map((project, index) => {
              const rowContent = (
                <>
                  <span className="work-index">0{index + 1}</span>
                  <span className="work-chip" style={{ '--chip': project.chip } as React.CSSProperties} />
                  <span className="work-name">{project.name}</span>
                  <span className="work-meta">
                    <span className="work-category">{project.category}</span>
                    {project.demo && <span className="work-tag">Interactive demo</span>}
                  </span>
                  <span className="work-arrow" aria-hidden="true">↗</span>
                </>
              )

              return project.caseStudy ? (
                <Link
                  className="work-row"
                  key={project.name}
                  to={project.caseStudy}
                  aria-label={`${project.name} case study`}
                >
                  {rowContent}
                </Link>
              ) : (
                <button
                  className="work-row"
                  key={project.name}
                  type="button"
                  aria-label={`${project.name} project`}
                  onClick={(event) => openProject(project, event.currentTarget)}
                >
                  {rowContent}
                </button>
              )
            })}
          </div>
        </section>

        <section
          className={`contact contact-reveal${contactInView ? ' is-visible' : ''}`}
          ref={contactRef}
          id="contact"
          aria-labelledby="contact-title"
        >
          <div className="contact-inner">
            <div className="contact-head">
              <h2 id="contact-title">Let’s Talk</h2>
            </div>
            <div className="contact-list">
              <a href="mailto:huangjn35@gmail.com"><span>Email</span><strong>Huangjn35@gmail.com</strong></a>
              <a href="tel:+13855384176"><span>Phone</span><strong>385-528-4176</strong></a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Jiani Huang</strong></a>
            </div>
            <p className="footer-note">Design and built by Jiani @2026</p>
          </div>
        </section>
      </main>

      {selectedProject && (
        <ProjectDialog
          project={selectedProject}
          returnFocus={lastTrigger}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  )
}
