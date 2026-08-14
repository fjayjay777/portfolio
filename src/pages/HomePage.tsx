import { useState } from 'react'
import { ProjectDialog, type Project } from '../components/ProjectDialog'
import { SiteNav } from '../components/SiteNav'
import { useHashScroll } from '../hooks/useHashScroll'

const projects: Project[] = [
  {
    name: 'Claimly',
    category: 'Financial clarity',
    summary: 'A concept that helps people understand claims and make confident decisions with information that is easy to act on.',
    demo: { url: '/demos/claimly/' },
  },
  {
    name: 'Medisync',
    category: 'Healthcare access',
    summary: 'A patient-centered booking experience that makes it easier to compare care options and coordinate appointments.',
  },
  {
    name: 'Sizzle',
    category: 'Food discovery',
    summary: 'A warm, mobile-first cooking experience for finding recipes, planning meals, and keeping a personal kitchen organized.',
  },
]

const bio = 'I’m a product designer and UX researcher currently studying at the University of Michigan School of Information. I enjoy working on all kinds of products and figuring out how new technology can actually be useful to people. A lot of what I care about comes back to the same thing: making information easier to understand and technology easier to use.'

export function HomePage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [lastTrigger, setLastTrigger] = useState<HTMLButtonElement | null>(null)
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
          <p className="eyebrow">Designer &amp; Researcher</p>
          <h1 id="home-title">Jiani Huang</h1>
          <div className="hero-detail">
            <p>I design human-centered products that bridge user needs, intelligent technology, and thoughtful interaction.</p>
            <p className="location">Based in Ann Arbor</p>
          </div>
        </section>

        <section className="works section-shell" id="works" aria-labelledby="works-title">
          <div className="section-label"><span>/</span><h2 id="works-title">Selected works</h2></div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <button
                className={`project-card project-card-${index + 1}`}
                key={project.name}
                type="button"
                aria-label={`${project.name} project`}
                onClick={(event) => openProject(project, event.currentTarget)}
              >
                <span className="project-number">0{index + 1}</span>
                <span className="project-name">{project.name}</span>
                <span className="project-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="about" id="skills" aria-labelledby="about-title">
          <div className="section-shell about-layout">
            <div className="section-label"><span>/</span><h2 id="about-title">About</h2></div>
            <div>
              <p className="about-copy">{bio}</p>
              <ul className="skill-list" aria-label="Skills">
                <li>Product design</li><li>UX research</li><li>Prototyping</li><li>Front-end development</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="contact" id="contact" aria-labelledby="contact-title">
          <div className="contact-inner">
            <h2 id="contact-title">Let’s Talk</h2>
            <div className="contact-list">
              <a href="mailto:huangjn35@gmail.com"><span>Email</span><strong>Huangjn35@gmail.com</strong><b aria-hidden="true">→</b></a>
              <a href="tel:+13855384176"><span>Phone</span><strong>385-538-4176</strong><b aria-hidden="true">→</b></a>
              <a href="https://www.linkedin.com" target="_blank" rel="noreferrer"><span>LinkedIn</span><strong>Jiani Huang</strong><b aria-hidden="true">→</b></a>
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
