import { Link } from 'react-router-dom'
import intakeShot from '../assets/claimly/01-intake.png'
import reportShot from '../assets/claimly/02-report.png'
import appealShot from '../assets/claimly/03-appeal.png'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { PhoneShot } from '../components/PhoneShot'
import { CaseFooter } from '../components/CaseFooter'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'Founder · design and front-end build' },
  { label: 'Timeline', value: 'Oct to mid-Nov 2025 · Tech Innovation Jam' },
  { label: 'Team', value: 'Solo founder; research with Jam teammates' },
  { label: 'Scope', value: 'Bill intake, claim report, appeal guidance' },
]

const walkthrough = [
  {
    title: 'Get the bill in, however it arrived',
    shot: intakeShot,
    alt: 'Claimly home screen offering Upload PDF, Use Camera and Fill Information Manually as equal options',
    note: 'Photo, PDF, and manual entry sit as equal options on the home screen. Medical bills reach people in all three forms (an envelope, a patient-portal download, a number read over the phone), so none of them is the secondary path.',
  },
  {
    title: 'Read the line that is wrong',
    shot: reportShot,
    alt: 'The expanded Chest X-ray row showing the insurance and patient split, a plain-English summary, and the decoded reason codes',
    note: 'The report opens with one flagged item and the rest collapsed. Expanding the Chest X-ray shows the split as a bar and as one plain-English sentence ($120 billed, $45 covered, $75 left to you, 62.5% of the item), followed by the decoded reason codes and what specifically looks off.',
  },
  {
    title: 'Know what to say',
    shot: appealShot,
    alt: 'The appeal script card with the claim number and EOB date filled in, above Re-generate and Copy buttons',
    note: 'The appeal screen produces a script with the claim number and EOB date already in it, a Re-generate button for different wording, a copy button, and a checklist of documents to have ready. It also states the deadline, because appeal windows close in 60 to 180 days.',
  },
]

const decisions = [
  {
    title: 'One line expanded, the rest closed',
    note: 'The report lists three charges and opens only the flagged one. Three equal rows would leave the triage to the reader. The interface has already done it, and says so at the top with "1 potential mistake" before any numbers.',
  },
  {
    title: 'Plain language beside the codes',
    note: 'Every panel keeps CPT 71045 and PR-1 / PR-2 / CO-45 on screen and translates them underneath. Hiding the codes would look friendlier, but they are what a person has to quote to get a claim reprocessed.',
  },
  {
    title: 'A script, carefully hedged',
    note: 'Claimly never says you were overcharged. It reports one potential mistake, says in-network pricing may not have been applied, and suggests what to ask. A confident wrong answer would cost the user their credibility on the phone, so the hedging is deliberate.',
  },
]

const findings = [
  {
    title: 'People pay bills they cannot read.',
    note: 'The most common response was to pay anyway. The bill did not look correct, but disputing it felt like the greater risk.',
  },
  {
    title: 'Knowing an appeal exists is not enough.',
    note: 'Two interviewees knew they could appeal and still stopped. The legitimate path asked for more time and confidence than they had.',
  },
  {
    title: 'The document people are told to check is the one they cannot read.',
    note: 'Six respondents had never compared an EOB with the bill, and nine were unclear on what an EOB was.',
  },
]

export function ClaimlyPage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page claimly-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Financial clarity</p>
          <h1>Claimly</h1>
          <p className="case-lead">
            Medical bills arrive as codes. Claimly reads one, checks it against your plan, flags the line that does
            not add up, and tells you what to say on the phone.
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
                The prototype runs live in the frame. Tap any intake option, then the shutter, and the claim report
                appears. Expand the Chest X-ray row, the part of the interface the product is built around, then open
                Appeal solution.
              </p>
              <p>
                Scope: four screens, front end only. The scan is simulated, the secondary tabs are placeholders, and the
                claim data is fictional. In the real product an AI model reads the bill and drafts the appeal. Here that
                output is fixed, so the interface can be judged on its own.
              </p>
            </div>
            <MobileDemoFrame title="Claimly" url="/demos/claimly/" canvas="#f4f4f4" viewport={{ width: 402, height: 874 }} />
          </div>
        </section>

        <section className="case-section section-shell claimly-text-section" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-body claimly-centered-body">
            <p>
              An explanation of benefits is written for the people who process it. It gives you a CPT number, a set
              of reason codes, and three dollar amounts that do not visibly reconcile. Someone who suspects an error
              gets stuck twice: the document cannot confirm the suspicion, and its language makes the problem hard
              to challenge.
            </p>
            <p>
              Claimly closes both gaps in one pass. It reads the bill against the plan's own terms, marks the lines that
              do not match, and turns the finding into a script the person can read aloud. A model does the reading and
              drafting, so that someone who suspects a bill is wrong can say why.
            </p>
          </div>
        </section>

        <section className="case-section section-shell claimly-text-section" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body claimly-centered-body">
            <p>
              Before drawing a screen, I spoke with people about what they actually did with a medical bill they could
              not understand. Across 15+ survey responses and 4+ follow-up interviews, the problem extended beyond
              comprehension: people also lacked a safe next move.
            </p>
          </div>
          <ol className="claimly-findings" aria-label="Research findings">
            {findings.map((finding, index) => (
              <li key={finding.title}>
                <span className="finding-index">0{index + 1}</span>
                <h3>{finding.title}</h3>
                <p>{finding.note}</p>
              </li>
            ))}
          </ol>
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
                  canvas="#f4f4f4"
                  viewport={{ width: 402, height: 874 }}
                />
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section section-shell claimly-text-section" aria-labelledby="decisions-title">
          <div className="section-label"><span>/</span><h2 id="decisions-title">Design decisions</h2></div>
          <ol className="claimly-decisions">
            {decisions.map((decision, index) => (
              <li key={decision.title}>
                <span className="decision-index">0{index + 1}</span>
                <h3>{decision.title}</h3>
                <p>{decision.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section section-shell claimly-text-section" aria-labelledby="outcome-title">
          <div className="section-label"><span>/</span><h2 id="outcome-title">Outcome</h2></div>
          <div className="stat-row claimly-stat-row">
            <div><strong>15+</strong><span>Survey responses</span></div>
            <div><strong>4+</strong><span>Interviews</span></div>
            <div><strong>9</strong><span>Unclear what an EOB is</span></div>
          </div>
          <div className="case-body claimly-centered-body">
            <p>
              Claimly went from problem framing to a working interface during the University of Michigan Tech
              Innovation Jam, between October and mid-November 2025. Research, the design system, and the prototype all
              fit inside that six-week window.
            </p>
            <p>
              Since the Jam I have carried the concept forward myself. It has a working prototype but has not shipped.
              What I want to test next is whether the appeal script helps someone make the call they would otherwise
              skip.
            </p>
          </div>
        </section>

        <section className="case-section section-shell claimly-text-section" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body claimly-centered-body">
            <p>
              What surprised me was that many people already believed something was wrong, knew an appeal was possible,
              and paid anyway. The complexity of the process is what stopped them. Two of four interviewees had
              abandoned an appeal they understood and were entitled to pursue.
            </p>
            <p>
              Decoding the bill is necessary, but my prototype still ends by handing someone a phone call to make. It
              shortens the distance to action, since the script is written, the claim number is filled in, and the
              evidence is listed. It does not close that distance, and what happens at that last step is what I would
              test next.
            </p>
          </div>
        </section>

        <CaseFooter current="Claimly" />
      </main>
    </div>
  )
}
