import { Link } from 'react-router-dom'
import portrait from '../assets/jiani-huang-portrait.jpg'
import { SiteNav } from '../components/SiteNav'
import { caseOrder } from '../data/caseOrder'

const experience = [
  {
    role: 'User Experience Project Consultant',
    org: 'University of Michigan School of Information, Engaged Learning Office',
    when: 'Since Sep 2026',
    note: 'I coordinate projects for the university and outside clients: agreeing on scope and expectations with faculty and stakeholders, then tracking priorities through delivery.',
  },
  {
    role: 'UX Designer',
    org: 'Ann Arbor Hands-On Museum',
    when: 'Since Jan 2026',
    note: 'I’m designing an interactive physics exhibit built for years of heavy public use, iterating on physical and digital prototypes based on hours of floor observation.',
  },
  {
    role: 'UX Designer',
    org: 'University of Michigan FEAST Research Program, Abriendo Caminos',
    when: 'Since Jan 2026',
    note: 'I design bilingual biomedical outreach modules for middle-school students, using feedback from twelve educators.',
  },
]

const contact = [
  { label: 'Email', value: 'Huangjn35@gmail.com', href: 'mailto:huangjn35@gmail.com' },
  { label: 'Phone', value: '385-528-4176', href: 'tel:+13855384176' },
  { label: 'LinkedIn', value: 'Jiani Huang', href: 'https://www.linkedin.com', external: true },
]

const education = [
  {
    role: 'MS in Information (UX Research & Design)',
    org: 'University of Michigan, School of Information',
    when: 'Expected May 2027',
  },
  {
    role: 'Bachelor of Fine Arts',
    org: 'University of Utah',
    when: 'Dec 2024',
  },
]

type CvEntry = { role: string; org: string; when: string; note?: string }

function CvList({ entries }: { entries: CvEntry[] }) {
  return (
    <div className="cv-list">
      {entries.map((entry) => (
        <article className="cv-row" key={`${entry.org}-${entry.role}`}>
          <div className="cv-main">
            <h3>{entry.role}</h3>
            <p className="cv-org">{entry.org}</p>
            {entry.note && <p className="cv-note">{entry.note}</p>}
          </div>
          <p className="cv-when">{entry.when}</p>
        </article>
      ))}
    </div>
  )
}

/* Ends the page with the two things a reader looks for after a bio: the work
   and a way to get in touch. Kept smaller than the home contact section, which
   stays the main contact point. */
function MeFooter() {
  return (
    <footer className="me-end">
      <div className="me-end-inner">
        <div className="me-end-grid">
          <section className="me-end-col" aria-labelledby="me-end-work-title">
            <div className="section-label"><span>/</span><h2 id="me-end-work-title">Work</h2></div>
            <Link className="me-end-link" to="/#works">
              <span className="me-end-link__row">
                <span className="me-end-link__name">Selected works</span>
                <span className="me-end-link__arrow" aria-hidden="true">↗</span>
              </span>
              <span className="me-end-link__cases">
                {caseOrder.map((entry) => entry.name).join(' · ')}
              </span>
            </Link>
          </section>

          <section className="me-end-col" aria-labelledby="me-end-contact-title">
            <div className="section-label"><span>/</span><h2 id="me-end-contact-title">Contact</h2></div>
            <div className="contact-list">
              {contact.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  {...(item.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                >
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </a>
              ))}
            </div>
          </section>
        </div>

        <p className="footer-note">Designed and built by Jiani © 2026</p>
      </div>
    </footer>
  )
}

export function MePage() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="me-page section-shell">
        <p className="eyebrow">About</p>
        <h1>Jiani Huang</h1>

        <div className="me-hero">
          <figure className="me-portrait">
            <img src={portrait} alt="Portrait of Jiani Huang" width={960} height={1200} />
            <figcaption>Based in Ann Arbor, MI</figcaption>
          </figure>

          <div className="me-intro">
            <p>
              Hi, welcome to my website. I’m Jiani, a second-year graduate student at the University of Michigan School
              of Information, specializing in UX research and design. Currently, I also work as a UX-focused project
              consultant for the school’s Engaged Learning Office.
            </p>
            <p>
              Most of my work so far has focused on making complex information easier and more intuitive for people to
              understand. My projects have covered medical bills full of reason codes, clinic prices and insurance
              options, and bilingual biomedical lessons for middle school students.
            </p>
            <p>
              I’m looking for full-time roles starting in 2027, as a UX researcher, AI product manager, or product
              designer.
            </p>
            <ul className="skill-list" aria-label="Skills">
              <li>Product design</li>
              <li>UX research</li>
              <li>Prototyping</li>
              <li>Front-end development</li>
            </ul>
          </div>
        </div>

        <section className="me-section" aria-labelledby="experience-title">
          <div className="section-label"><span>/</span><h2 id="experience-title">Experience</h2></div>
          <CvList entries={experience} />
        </section>

        <section className="me-section" aria-labelledby="education-title">
          <div className="section-label"><span>/</span><h2 id="education-title">Education</h2></div>
          <CvList entries={education} />
        </section>
      </main>

      <MeFooter />
    </div>
  )
}
