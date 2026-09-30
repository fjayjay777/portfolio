import { Link } from 'react-router-dom'
import searchShot from '../assets/medisync/md-01-search.jpg'
import pricesShot from '../assets/medisync/md-02-prices.jpg'
import confirmShot from '../assets/medisync/md-03-confirm.jpg'
import { FlowCanvas } from '../components/FlowCanvas'
import { MedisyncFlow, medisyncFlowSize } from '../components/MedisyncFlow'
import { MedisyncIA, medisyncIASize } from '../components/MedisyncIA'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { CaseFooter } from '../components/CaseFooter'
import { PhoneShot } from '../components/PhoneShot'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'UX/UI designer · research through UI' },
  { label: 'Timeline', value: '2022 concept · 2026 web prototype' },
  { label: 'Team', value: 'Solo' },
  { label: 'Scope', value: 'Patient app, watch widget, provider system' },
]

const walkthrough = [
  {
    title: 'Compare clinics on terms you can act on',
    shot: searchShot,
    alt: 'Dental search results listing remaining appointments this month, distance and specialty for each clinic, with an out-of-network toggle',
    note: 'Search results lead with the three things that decide whether a clinic is usable: appointments left this month, distance, and network status. Out-of-network clinics are hidden by default and one tap away.',
  },
  {
    title: 'See the cost before committing',
    shot: pricesShot,
    alt: 'The price review tab listing in-network estimates with the caveat attached to each service',
    note: 'Each provider has a price tab with in-network estimates, each with its caveat attached. A root canal, for example, reads "final cost depends on tooth." Naming the uncertainty is more useful than a precise number I would have to invent.',
  },
  {
    title: 'Confirm with your records already attached',
    shot: confirmShot,
    alt: 'The booking confirmation with the appointment summary, insurance details and previous dental records already attached',
    note: 'At the final step the insurance plan and prior dental records are already attached, with the member ID masked. The visit is added to Upcoming without asking for anything the system already has. This is the flow to try in the frame above.',
  },
]

const decisions = [
  {
    title: 'Three systems, one record',
    note: 'Patients, wearables, and clinic staff do different work, so each gets its own interface: a patient app, a watch widget, and a provider office system. What they share is the record.',
  },
  {
    title: 'Cost shown with its uncertainty',
    note: 'Estimates appear before booking, and each one states what it depends on. A number without its caveat would cost trust the first time a bill disagreed with it.',
  },
  {
    title: 'The patient releases the data',
    note: 'In the wearable concept, an abnormal heart-rate reading alerts the patient first and asks permission before anything reaches the doctor. Testing showed the tension: people asked for remote monitoring of family, then named privacy as the reason they might never switch it on.',
  },
]

export function MedisyncPage() {
  return (
    <div className="site-shell case-study-layout">
      <SiteNav autoHide />
      <main className="case-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Healthcare access</p>
          <h1>Medisync</h1>
          <p className="case-lead">
            A medical management system that connects patients and providers through one shared record, so a first visit
            to a new clinic does not start from a blank form.
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
                The prototype runs live in the frame, with search, provider detail, pricing, booking, records, and
                insurance working as they would on a phone. Book an appointment at National Central Hospital to see the
                main flow.
              </p>
              <p>
                Scope: this is the patient app. The watch widget and the provider office system exist only as designs.
                Every name, record, and insurance value in it is fictional.
              </p>
            </div>
            <MobileDemoFrame title="Medisync" url="/demos/medisync/" canvas="#f4f5f2" />
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="problem-title">
          <div className="section-label"><span>/</span><h2 id="problem-title">Problem statement</h2></div>
          <div className="case-body">
            <p>
              Healthcare runs on platforms that do not talk to each other, so patients carry their history from one
              clinic to the next themselves. Every new provider starts with a blank intake form: the same insurance
              details, conditions, and medications, entered again. Records move between departments only when the
              patient brings them, and continuity breaks the moment someone moves, switches providers, or is referred.
            </p>
            <p>
              Clinicians sit on the other side of the same gap. Staff spend time hunting for a referral patient’s
              history, and between visits no one can see how a patient is recovering. For someone managing a chronic
              condition, or a parent keeping several children’s records straight, a record that only appears on
              appointment day arrives too late to act on.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="goal-title">
          <div className="section-label"><span>/</span><h2 id="goal-title">Design goal</h2></div>
          <div className="case-body">
            <p className="case-goal">
              How might we connect patients and providers through one shared health record, so care does not restart
              at every new clinic or stop between visits, while patients stay in control of what is shared?
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-body">
            <p>
              Medisync closes the gap from both ends with three parts that share one record: a patient app for
              discovery, cost, and booking, a watch widget for continuous health data, and an office system for
              providers. Insurance and history travel with the appointment, so patients stop repeating the same intake
              at the front desk.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body">
            <p>
              Market research and interviews produced three personas: a patient managing a chronic condition, a parent
              tracking several children's records, and a nurse handling referrals. After the low-fidelity prototypes, 30
              participants tested the work, first through questionnaires on the mobile app and the office system, then
              in moderated sessions that measured task completion and time on task alongside what people said while
              using it.
            </p>
            <ul className="finding-list">
              <li>
                <strong>Chronic conditions need daily visibility.</strong> For the patient persona, a record seen only
                on appointment day, in a waiting room, arrives too late to act on. The wearable exists for this.
              </li>
              <li>
                <strong>Records are disorganized across family members as well as clinics.</strong> The parent persona
                cannot keep several children's histories straight, so the family is the unit of organization.
              </li>
              <li>
                <strong>Providers lose time searching for records.</strong> The nurse persona described hunting for
                referral patients' historical records as the main friction in her day.
              </li>
            </ul>
          </div>
        </section>

        <section className="case-section section-shell flow-section flow-section--medisync" aria-labelledby="ia-title">
          <div className="flow-section-copy">
            <div className="section-label"><span>/</span><h2 id="ia-title">Information architecture</h2></div>
            <div className="case-body">
              <p>
                The patient app is organized around five bottom-navigation tabs. The booking path sits under Explore and
                runs four screens deep; insurance details and the next appointment are one tap from Home. The clinic
                system and the watch widget are covered in the interaction flow below.
              </p>
            </div>
          </div>
          <FlowCanvas {...medisyncIASize} label="Medisync information architecture" focusX={560}>
            <MedisyncIA />
          </FlowCanvas>
        </section>

        <section className="case-section section-shell flow-section flow-section--medisync" aria-labelledby="flow-title">
          <div className="flow-section-copy">
            <div className="section-label"><span>/</span><h2 id="flow-title">Interaction flow</h2></div>
            <div className="case-body">
              <p>
                The full flow across all three parts, with the shared record between patient and clinic. Only the
                patient app is in the demo above; the clinic system and the watch widget exist as designs.
              </p>
            </div>
          </div>
          {/* Phones open on the patient lane; the watch lane is empty until the last phase. */}
          <FlowCanvas {...medisyncFlowSize} label="Medisync interaction flow" focusX={420}>
            <MedisyncFlow />
          </FlowCanvas>
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
              This was a self-directed project, so there are no adoption or conversion numbers. What I have are the
              testing results. Booking with records attached tested as easy, and family health monitoring was the
              feature participants asked to keep. Three things broke: the office system flattened three clinical roles
              into one, a green calendar marker carried meaning nobody could decode, and patient profiles held more than
              any single task needed. Each drove a round of revision, traceable in the before-and-after screens.
            </p>
            <p>
              For the next version I would track what testing already measured: completion rate and time on task for
              booking, and whether a first visit at a new provider can be finished without re-entering anything.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body">
            <p>
              The sharpest criticism in testing came from a medical student: the office system mixed nurse, doctor, and
              administrator functions together, though the three roles need different things. One of my personas was a
              nurse, so I had researched the role and still designed a single interface for all three. Another
              participant said the patient profiles held more information than any one task needed.
            </p>
            <p>
              Neither is fixed yet. The 2026 rebuild covers only the patient app, so both remain open on the provider
              side. A smaller open issue is visible in the demo above: a participant asked to book with a specific
              doctor rather than a clinic, and the prototype still assigns one after the booking is confirmed. That is
              the next thing I would change.
            </p>
          </div>
        </section>

        <CaseFooter current="Medisync" />
      </main>
    </div>
  )
}
