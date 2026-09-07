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

export function ClaimlyPage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page">
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
          <div className="case-body">
            <p>
              An explanation of benefits is written for the people who process it. It gives you a CPT number, a set of
              reason codes, and three dollar amounts that do not visibly reconcile. Someone who suspects an error is
              stuck twice over: they cannot confirm it from the document, and they do not have the vocabulary to
              challenge it — the codes that would let them argue are the same codes that make the document unreadable.
            </p>
            <p>
              Claimly closes both gaps in one pass. It reads the bill, decodes it line by line against the plan's own
              terms, marks the lines that do not match, and turns the finding into a script the person can read out
              loud. The intent is an AI product: a model does the reading and the drafting. What that buys is not speed
              so much as nerve — the difference between suspecting a bill is wrong and being able to say why.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body">
            <p>
              The problem was checked before it was designed for: 15+ survey responses on how people handle a medical
              bill they do not understand, and 4+ follow-up interviews going through the experience in detail.
            </p>
            <ul className="finding-list">
              <li>
                <strong>People pay bills they cannot read.</strong> The most common response to an incomprehensible
                medical bill was to pay it anyway — not because it looked correct, but because disputing it felt like a
                risk to their credit. Paying is the safe option even when it is the wrong one.
              </li>
              <li>
                <strong>Knowing an appeal exists is not enough.</strong> Two interviewees knew they were entitled to
                appeal and dropped it anyway. The process was unfamiliar and troublesome enough that abandoning a
                legitimate claim was the easier path.
              </li>
              <li>
                <strong>The document people are told to check is the one they cannot read.</strong> Six respondents had
                never compared their EOB against the bill, and nine were not clear on what an EOB is. The reconciliation
                that would catch an error is the step nobody is equipped to take.
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
                  canvas="#f4f4f4"
                  viewport={{ width: 402, height: 874 }}
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
              <div><strong>15+</strong><span>Survey responses</span></div>
              <div><strong>4+</strong><span>Interviews</span></div>
              <div><strong>9</strong><span>Unclear what an EOB is</span></div>
            </div>
            <p>
              Claimly was founded as a product concept and taken through the University of Michigan Tech Innovation Jam
              between October and mid-November 2025 — roughly six weeks from the problem to a working interface, with
              the research, the design system, and the prototype all inside that window.
            </p>
            <p>
              Since the Jam I have carried it on myself. It is a founded concept with a working prototype rather than a
              shipped product, and the thing I would want to know next is whether the appeal script actually gets used —
              whether someone holding it makes the call they would otherwise have skipped.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body">
            <p>
              The surprise was not that people cannot read their bills. It was that many of them already know something
              is wrong, and know tools exist to help them dispute it, and pay anyway. Complexity closes the case, not
              ignorance. Two of the four interviews were exactly that: an appeal they were entitled to, understood, and
              abandoned because the process was more than they wanted to take on.
            </p>
            <p>
              That reframes what the product is for. If awareness were the bottleneck, decoding the bill would be
              enough — and Claimly does decode it. But the honest read of my own prototype is that it still ends by
              handing someone a phone call to make. It shortens the distance between suspecting something is wrong and
              acting on it: the script is written, the claim number is already in it, the evidence is listed. It does not
              close that distance. What to do about the last step is the question I am working on now.
            </p>
          </div>
        </section>

        <CaseFooter current="Claimly" />
      </main>
    </div>
  )
}
