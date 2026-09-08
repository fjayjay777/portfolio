import { SiteNav } from '../components/SiteNav'

const experience = [
  {
    role: 'User Experience Project Consultant',
    org: 'University of Michigan School of Information — Engaged Learning Office',
    when: 'Sep 2026 — Present',
    note: 'Cross-functional project coordination for university and external client engagements, working with faculty and stakeholders to define project scope, align expectations, track priorities, and support successful project delivery.',
  },
  {
    role: 'UX Designer',
    org: 'Ann Arbor Hands-On Museum',
    when: 'Jan 2026 — Present',
    note: 'An interactive physics exhibit engineered for years of high-frequency public use, iterated across physical and digital prototypes from hours of floor observation.',
  },
  {
    role: 'UX Designer',
    org: 'University of Michigan FEAST Research Program — Abriendo Caminos',
    when: 'Jan 2026 — Present',
    note: 'Bilingual biomedical outreach modules for middle-school students, shaped by feedback from twelve educators.',
  },
]

const education = [
  {
    role: 'MS in Information — UX Research & Design',
    org: 'University of Michigan, School of Information',
    when: 'Expected May 2027',
    note: 'GPA 4.0 / 4.0.',
  },
  {
    role: 'BFA — Painting & Drawing',
    org: 'University of Utah',
    when: 'Dec 2024',
    note: 'Major GPA 3.86 / 4.0. Dean’s List six times; top 10% of class, 2021—2024.',
  },
]

function CvList({ entries }: { entries: typeof experience }) {
  return (
    <div className="cv-list">
      {entries.map((entry) => (
        <article className="cv-row" key={`${entry.org}-${entry.role}`}>
          <div className="cv-main">
            <h3>{entry.role}</h3>
            <p className="cv-org">{entry.org}</p>
            <p className="cv-note">{entry.note}</p>
          </div>
          <p className="cv-when">{entry.when}</p>
        </article>
      ))}
    </div>
  )
}

export function MePage() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="me-page section-shell">
        <h1>Jiani Huang</h1>

        <div className="me-intro">
          <p>
            I came to user experience from painting. I finished a BFA in Painting and Drawing at the University of
            Utah, and I am now a Master of Science in Information candidate at the University of Michigan on the User
            Experience Research and Design track.
          </p>
          <p>
            Most of my work focuses on <strong>making complex information easier to understand and technology easier
            to use</strong>. I’m especially interested in products where the consequences are real: a medical bill
            written in reason codes, a clinic booking that starts from a blank form, or public health material that has
            to reach people who didn’t choose to study it. I combine <strong>product design, UX research, and front-end
            development</strong> to explore how new technology can be genuinely useful, and I like putting a working
            prototype in someone’s hands instead of only describing one.
          </p>
          <ul className="skill-list" aria-label="Skills">
            <li>Product design</li>
            <li>UX research</li>
            <li>Prototyping</li>
            <li>Front-end development</li>
          </ul>
        </div>

        <div className="me-columns">
          <section className="me-section" aria-labelledby="education-title">
            <div className="section-label"><span>/</span><h2 id="education-title">Education</h2></div>
            <CvList entries={education} />
          </section>

          <section className="me-section" aria-labelledby="experience-title">
            <div className="section-label"><span>/</span><h2 id="experience-title">Experience</h2></div>
            <CvList entries={experience} />
          </section>
        </div>

      </main>
    </div>
  )
}
