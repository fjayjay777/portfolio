import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HeroFigure } from '../components/HeroFigure'
import { ClaimlyCover, MedisyncCover, NightyCover, SizzleCover } from '../components/ProjectCovers'
import { ProjectDialog, type Project } from '../components/ProjectDialog'
import { SiteNav } from '../components/SiteNav'
import { useHashScroll } from '../hooks/useHashScroll'
import { useInView } from '../hooks/useInView'

const covers = [ClaimlyCover, MedisyncCover, SizzleCover, NightyCover]

const projects: Project[] = [
  {
    name: 'Claimly',
    category: 'Financial clarity',
    chip: '#3f85ff',
    summary: 'A concept app that reads a medical bill, flags the charge that looks wrong, and drafts the appeal.',
    caseStudy: '/work/claimly',
    // Claimly's shell is 402 wide (iPhone 16 Pro), not the 430 the frame defaults to.
    demo: { url: '/demos/claimly/', canvas: '#f4f4f4', viewport: { width: 402, height: 874 } },
  },
  {
    name: 'Medisync',
    category: 'Healthcare access',
    chip: '#7f9062',
    summary: 'A booking app that helps patients compare care options and coordinate appointments.',
    caseStudy: '/work/medisync',
    demo: { url: '/demos/medisync/', canvas: '#f4f5f2' },
  },
  {
    name: 'Sizzle',
    category: 'Food discovery',
    chip: '#e59343',
    summary: 'A mobile app for finding recipes, planning meals, and cooking from what’s already in your fridge.',
    caseStudy: '/work/sizzle',
    // Sizzle's landing header is a translucent cream over the page color, so the
    // status bar has to match the composited result, not the page token.
    demo: { url: '/demos/sizzle/', canvas: '#fef9f0' },
  },
  {
    name: 'Nighty',
    category: 'Sleep technology',
    chip: '#5b73b8',
    summary: 'A smart pillow that adjusts its temperature to the room, plays white noise, and tracks how deeply you sleep.',
    caseStudy: '/work/nighty',
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
    <div className="site-shell portfolio-home">
      <SiteNav />
      <main>
        <section className="hero section-shell" aria-labelledby="home-title">
          <HeroFigure />
          <p className="eyebrow">Designer &amp; Researcher</p>
          <h1 id="home-title">Jiani Huang</h1>
          <p className="hero-lead">I design products that make complex information easier to understand and technology easier to use.</p>
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
              const Cover = covers[index]
              const rowContent = (
                <>
                  <span className="work-preview" aria-hidden="true">
                    <Cover />
                  </span>
                  <span className="work-info">
                  <span className="work-index">0{index + 1}</span>
                  <span className="work-chip" style={{ '--chip': project.chip } as React.CSSProperties} />
                  <span className="work-name">{project.name}</span>
                  <span className="work-meta">
                    <span className="work-category">{project.category}</span>
                    {project.demo && <span className="work-tag">Interactive demo</span>}
                  </span>
                  <span className="work-summary">{project.summary}</span>
                  <span className="work-cta">Explore case study <span className="work-arrow" aria-hidden="true">↗</span></span>
                  </span>
                </>
              )

              return project.caseStudy ? (
                <Link
                  className={`work-tile work-tile--${project.name.toLowerCase()}`}
                  key={project.name}
                  to={project.caseStudy}
                  aria-label={`${project.name} case study`}
                >
                  {rowContent}
                </Link>
              ) : (
                <button
                  className={`work-tile work-tile--${project.name.toLowerCase()}`}
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
              <a href="tel:+13855284176"><span>Phone</span><strong>385-528-4176</strong></a>
              <a href="https://www.linkedin.com/in/jiani-huang-b22515365/" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Jiani Huang</strong></a>
            </div>
            <p className="footer-note">Designed and built by Jiani © 2026</p>
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
