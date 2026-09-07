import { Link } from 'react-router-dom'
import searchShot from '../assets/medisync/md-01-search.jpg'
import pricesShot from '../assets/medisync/md-02-prices.jpg'
import confirmShot from '../assets/medisync/md-03-confirm.jpg'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { CaseFooter } from '../components/CaseFooter'
import { PhoneShot } from '../components/PhoneShot'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'UX/UI designer — research through UI' },
  { label: 'Timeline', value: '2022 concept · 2026 web prototype' },
  { label: 'Team', value: 'Solo' },
  { label: 'Scope', value: 'Patient app, watch widget, provider system' },
]

const walkthrough = [
  {
    title: 'Compare clinics on terms you can act on',
    shot: searchShot,
    alt: 'Dental search results listing remaining appointments this month, distance and specialty for each clinic, with an out-of-network toggle',
    note: 'Search results lead with the three things that decide whether a clinic is usable: appointments left this month, distance, and network status. Out-of-network clinics are hidden by default and one tap away — a filter, not a wall.',
  },
  {
    title: 'See the cost before committing',
    shot: pricesShot,
    alt: 'The price review tab listing in-network estimates with the caveat attached to each service',
    note: 'Each provider carries a price tab with in-network estimates and the caveat attached to each one — a root canal reads "final cost depends on tooth." Naming the uncertainty is more useful than a precise number I would have to invent.',
  },
  {
    title: 'Confirm with your records already attached',
    shot: confirmShot,
    alt: 'The booking confirmation with the appointment summary, insurance details and previous dental records already attached',
    note: 'At the final step the insurance plan and prior dental records are already present, member ID masked. The visit gets added to Upcoming without asking for anything the system already holds. This is the flow to try in the frame above.',
  },
]

const decisions = [
  {
    title: 'Three systems, one record',
    note: 'Patients, wearables, and clinic staff do different work, so I designed a patient app, a watch widget, and a provider office system rather than stretching one interface across all three. What they share is the record, not the interface.',
  },
  {
    title: 'Cost shown with its uncertainty',
    note: 'Estimates appear before booking instead of after treatment, and each one states what it depends on. A number without its caveat is the kind of clarity that erodes trust the first time a bill disagrees with it.',
  },
  {
    title: 'The patient releases the data',
    note: 'In the wearable concept, an abnormal heart-rate reading alerts the patient first and asks permission before anything reaches the doctor. Testing surfaced the tension directly: people asked for remote monitoring of family, then named privacy as the reason they might never switch it on.',
  },
]

export function MedisyncPage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Healthcare access</p>
          <h1>Medisync</h1>
          <p className="case-lead">
            A medical management system connecting patients and providers around one shared record — so a first visit
            to an unfamiliar clinic does not start from a blank form.
          </p>
          <dl className="case-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="case-demo" aria-labelledby="demo-title">
          <div className="section-shell case-demo-inner">
            <div className="case-demo-copy">
              <div className="section-label"><span>/</span><h2 id="demo-title">Interactive demo</h2></div>
              <p>
                The prototype runs live in the frame — search, provider detail, pricing, booking, records, and
                insurance, exactly as they work on a phone. Book an appointment at National Central Hospital to see the
                flow the whole product rests on.
              </p>
              <p>
                Scope: this is the patient app. The watch widget and the provider office system are design work, not
                part of the running prototype. Every name, record, and insurance value in it is fictional.
              </p>
            </div>
            <MobileDemoFrame title="Medisync" url="/demos/medisync/" canvas="#f4f5f2" />
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-body">
            <p>
              Healthcare runs on platforms that do not talk to each other. Patients re-enter the same insurance and
              history at every new clinic and carry their own records between departments; continuity breaks the moment
              they move or switch providers. Clinicians sit on the other side of the same gap, unable to pull the
              history of a referral patient or track recovery between visits.
            </p>
            <p>
              Medisync closes it from both ends: a patient app for discovery, cost, and booking, a watch widget for
              continuous health data, and an office system for providers — three surfaces over one record. The result
              a reader should keep: the redundant intake disappears, because insurance and history travel with the
              appointment instead of waiting at the front desk.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body">
            <p>
              Market research and interviews produced three personas — a patient managing a chronic condition, a parent
              tracking several children's records, and a nurse handling referrals. After the low-fidelity prototypes,
              30 participants tested the work: questionnaires for the mobile app and the office system, then moderated
              sessions measuring task completion and time on task alongside what people said while using it.
            </p>
            <ul className="finding-list">
              <li>
                <strong>Chronic conditions need daily visibility, not appointment-day snapshots.</strong> The patient
                persona wants status tracked every day; a record you only see in a waiting room arrives too late to act
                on. This is what the wearable exists to serve.
              </li>
              <li>
                <strong>Records are disorganized across people, not just across clinics.</strong> The parent persona
                cannot keep several children's histories straight, which makes the family — not the individual account
                — the unit of organization.
              </li>
              <li>
                <strong>Providers lose time searching, not treating.</strong> The nurse persona described hunting for
                referral patients' historical records as the friction in her day. Testers on the office system went
                further and named the real flaw: nurse, doctor, and administrator functions were mixed into one
                undifferentiated hierarchy.
              </li>
            </ul>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="walkthrough-title">
          <div className="section-label"><span>/</span><h2 id="walkthrough-title">Product walkthrough</h2></div>
          <ol className="step-list">
            {walkthrough.map((step, index) => (
              <li className="step" key={step.title}>
                <div className="step-copy">
                  <span className="step-index">0{index + 1}</span>
                  <h3>{step.title}</h3>
                  <p>{step.note}</p>
                </div>
                <PhoneShot
                  src={step.shot}
                  alt={step.alt}
                  canvas="#f4f5f2"
                  viewport={{ width: 430, height: 932 }}
                />
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section section-shell" aria-labelledby="decisions-title">
          <div className="section-label"><span>/</span><h2 id="decisions-title">Design decisions</h2></div>
          <div className="decision-grid">
            {decisions.map((decision) => (
              <article className="decision-card" key={decision.title}>
                <h3>{decision.title}</h3>
                <p>{decision.note}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="outcome-title">
          <div className="section-label"><span>/</span><h2 id="outcome-title">Outcome</h2></div>
          <div className="case-body">
            <div className="stat-row">
              <div><strong>30</strong><span>Participants tested</span></div>
              <div><strong>3</strong><span>Connected systems designed</span></div>
              <div><strong>13</strong><span>Patient screens shipped to prototype</span></div>
            </div>
            <p>
              This is a self-directed project, so there are no adoption or conversion numbers to report — what I have
              is what testing settled. Booking with records attached tested as easy, and family health monitoring was
              the feature participants asked to keep. Three things broke: the office system flattened three clinical
              roles into one, a green calendar marker carried meaning nobody could decode, and patient profiles held
              more than any single task needed. Each drove a round of revision, traceable in the before-and-after
              screens.
            </p>
            <p>
              The measures I would hold the next version to are the ones the testing already instruments: completion
              rate and time on task for booking, and whether a first visit at a new provider can be finished without
              re-entering anything.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body">
            <p>
              The sharpest criticism in testing came from a medical student: the office system mixed nurse, doctor, and
              administrator functions together, when what those three roles need is different. One of my personas was a
              nurse, so this was not a gap in who I had researched — I had the role and still designed a single
              undifferentiated interface for it. Another participant said the patient profiles held more information
              than any one task needed.
            </p>
            <p>
              Neither is fixed. The 2026 rebuild covers the patient app only, so both remain open on the provider side.
              The smallest unresolved note is the one visible in the demo above: a participant asked to book with a
              specific doctor rather than a clinic, and the prototype still assigns one after the booking is confirmed.
              That is the next thing I would change.
            </p>
          </div>
        </section>

        <CaseFooter current="Medisync" />
      </main>
    </div>
  )
}
