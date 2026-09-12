import { Link } from 'react-router-dom'
import intakeShot from '../assets/claimly/01-intake.png'
import reportShot from '../assets/claimly/02-report.png'
import appealShot from '../assets/claimly/03-appeal.png'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { PhoneShot } from '../components/PhoneShot'
import { CaseFooter } from '../components/CaseFooter'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'Founder — design and front-end build' },
  { label: 'Timeline', value: 'Oct — mid-Nov 2025 · Tech Innovation Jam' },
  { label: 'Team', value: 'Solo founder; research with Jam teammates' },
  { label: 'Scope', value: 'Bill intake, claim report, appeal guidance' },
]

const walkthrough = [
  {
    title: 'Get the bill in, however it arrived',
    shot: intakeShot,
    alt: 'Claimly home screen offering Upload PDF, Use Camera and Fill Information Manually as equal options',
    note: 'Photo, PDF, or manual entry sit as equal options on the home screen. Medical bills reach people in all three forms — a envelope, a patient-portal download, a number read over the phone — so none of them is the secondary path.',
  },
  {
    title: 'Read the line that is wrong',
    shot: reportShot,
    alt: 'The expanded Chest X-ray row showing the insurance and patient split, a plain-English summary, and the decoded reason codes',
    note: 'The report opens with one flagged item and the rest collapsed. Expanding the Chest X-ray gives the split as a bar, a sentence in plain English — $120 billed, $45 covered, $75 left to you, 62.5% of the item — then the decoded reason codes and what specifically looks off.',
  },
  {
    title: 'Know what to say',
    shot: appealShot,
    alt: 'The appeal script card with the claim number and EOB date filled in, above Re-generate and Copy buttons',
    note: 'The appeal screen produces a script with the claim number and EOB date already in it, a Re-generate for different wording, a copy button, and a checklist of documents to have ready. It also states the deadline, because appeal windows close in 60 to 180 days.',
  },
]

const decisions = [
  {
    title: 'One line expanded, the rest closed',
    note: 'Three charges appear in the report and only the flagged one opens. Presenting them as three equal rows would make the reader do the triage; the interface has already done it and says so — "1 potential mistake" at the top, before any numbers.',
  },
  {
    title: 'Plain language beside the codes, not instead of them',
    note: 'Every panel keeps CPT 71045 and PR-1 / PR-2 / CO-45 on screen and translates them underneath. Hiding the codes would be friendlier and useless: those codes are exactly what a person has to quote to get a claim reprocessed.',
  },
  {
    title: 'The output is a script, not a verdict',
    note: 'Claimly never says you were overcharged. It says one potential mistake, that in-network pricing may not have been applied, and here is what to ask. In a domain where a confident wrong answer costs the user their credibility on the phone, the hedge is the feature.',
  },
]

const findings = [
  {
    title: 'People pay bills they cannot read.',
    note: 'The most common response was to pay anyway. The bill did not look correct; disputing it simply felt like the greater risk. Paying became the safe option even when it might be the wrong one.',
  },
  {
    title: 'Knowing an appeal exists is not enough.',
    note: 'Two interviewees knew they could appeal and still stopped. The legitimate path asked for more time and confidence than they had, so abandoning the claim became easier than pursuing it.',
  },
  {
    title: 'The document people are told to check is the one they cannot read.',
    note: 'Six respondents had never compared an EOB with the bill, and nine were unclear on what an EOB was. The step most likely to reveal an error was also the least accessible one.',
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
                generates — expand the Chest X-ray row to see the part of the interface the whole product is built
                around, then open Appeal solution.
              </p>
              <p>
                Scope: four screens, front-end only. The scan is simulated, the secondary tabs are affordances, and the
                claim data is fictional. In the real product an AI model reads the bill and drafts the appeal; here that
                output is fixed so the interface can be judged on its own.
              </p>
            </div>
            <MobileDemoFrame title="Claimly" url="/demos/claimly/" canvas="#f4f4f4" viewport={{ width: 402, height: 874 }} />
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-body claimly-centered-body">
            <p>
              An explanation of benefits is written for the people who process it. It gives you a CPT number, a set
              of reason codes, and three dollar amounts that do not visibly reconcile. Someone who suspects an error
              gets stuck twice: the document cannot confirm the suspicion, and its language makes the problem hard
              to challenge.
            </p>
            <p>
              Claimly closes both gaps in one pass. It reads the bill against the plan's own terms, marks the lines
              that do not match, and turns the finding into a script the person can read aloud. The AI does the
              reading and drafting, but speed is not the main value. The product gives someone the difference between
              thinking a bill may be wrong and being able to say why.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="research-title">
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

        <section className="case-section section-shell" aria-labelledby="decisions-title">
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

        <section className="case-section section-shell" aria-labelledby="outcome-title">
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
              Since the Jam I have carried the concept forward myself. It is a working prototype, not a shipped
              product. The next useful test is not whether someone understands the report. It is whether the appeal
              script helps them make the call they would otherwise skip.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body claimly-centered-body">
            <p>
              The surprise was not that people could not read their bills. Many already believed something was wrong,
              knew an appeal was possible, and paid anyway. Complexity closed the case, not ignorance. Two of four
              interviewees had abandoned an appeal they understood and were entitled to pursue.
            </p>
            <p>
              That changed what I thought the product had to do. Decoding the bill is necessary, but my prototype still
              ends by handing someone a phone call to make. It shortens the distance to action: the script is written,
              the claim number is filled in, and the evidence is listed. It does not close that distance. What happens
              at that last step is the question I would test next.
            </p>
          </div>
        </section>

        <CaseFooter current="Claimly" />
      </main>
    </div>
  )
}
