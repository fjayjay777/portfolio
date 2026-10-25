import { Link } from 'react-router-dom'
import intakeShot from '../assets/claimly/01-intake.png'
import reportShot from '../assets/claimly/02-report.png'
import appealShot from '../assets/claimly/03-appeal.png'
import { claimlyFlow } from '../components/ClaimlyFlow'
import { type Finding, FindingsList } from '../components/Findings'
import { FlowPlayer } from '../components/FlowPlayer'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { PhoneShot } from '../components/PhoneShot'
import { CaseFooter } from '../components/CaseFooter'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'Founder · concept, design, front-end build' },
  { label: 'Timeline', value: 'Oct to mid-Nov 2025 · Tech Innovation Jam' },
  { label: 'Team', value: 'Cassie (Siyan) Chen, Jiayi Lu, Shuzhou Li, Yumeng Fang' },
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

const findings: Finding[] = [
  {
    title: 'People pay bills they cannot read.',
    chain: {
      evidence: [
        {
          source: 'Survey',
          text: 'Paying the bill anyway was the most common response, even when a charge looked wrong.',
        },
        {
          source: 'Interview',
          text: 'Participants saw disputing a charge as riskier and more time-consuming than paying it, and let small amounts go.',
        },
      ],
      insight: 'Uncertainty defaults to payment. Without a clear signal that something is wrong, people do not question the bill.',
      decision: 'The report opens on the flagged item and states the number of potential mistakes before any figures, so the reason to question the bill comes first.',
      open: 'Whether a flagged item leads people to question a bill before paying it.',
    },
  },
  {
    title: 'Knowing an appeal exists is not enough.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'Two interviewees described the appeal process as long and frustrating, and would rather pay than explain the bill to a series of customer-service agents.',
        },
        {
          source: 'Survey',
          text: '5 of 15+ respondents would rather pay than appeal when the amount was affordable.',
        },
      ],
      insight: 'The barrier is not only understanding the bill. It is also the time and communication an appeal requires.',
      decision: 'Added the appeal script after synthesizing the interviews and survey, to reduce the preparation needed before contacting the insurer.',
      open: 'Whether the appeal solution saves time, or makes users more willing to appeal.',
    },
  },
  {
    title: 'The document people are told to check is the one they cannot read.',
    chain: {
      evidence: [
        { source: 'Survey', text: '6 of 15+ respondents had never compared an EOB with their bill.' },
        { source: 'Survey', text: '9 of 15+ respondents were unclear on what an EOB is.' },
      ],
      insight: 'The EOB is the document that confirms or rules out an error, but many people cannot read it, so the comparison has to be done for them.',
      decision: 'Made EOB comparison a core function, and kept each CPT and reason code on screen with a plain-language translation beneath it.',
      open: 'Whether the plain-language translation lets people check a bill against its EOB on their own.',
    },
  },
]

// One row per core function: what the AI does, what the user controls, and the principle behind the split.
const aiWorkflow = [
  {
    step: 'Bill analysis',
    principle: 'Transparency',
    ai: 'Extracts line items, CPT codes, and amounts from PDF, photo, or manual input.',
    user: 'Extracted values are displayed as parsed, so users can verify them against the source document.',
  },
  {
    step: 'EOB comparison',
    principle: 'Calibrated confidence',
    ai: 'Cross-checks billed charges against the EOB and plan terms, and flags discrepancies.',
    user: 'Each flag states its rationale and is framed as a potential error, not a confirmed one.',
  },
  {
    step: 'Code explanation',
    principle: 'Explainability',
    ai: 'Translates CPT and reason codes into plain language.',
    user: 'Original codes remain visible for reference when contacting the insurer.',
  },
  {
    step: 'Appeal support',
    principle: 'Human-in-the-loop',
    ai: 'Generates an appeal script pre-filled with the claim number and EOB date.',
    user: 'Users decide whether to dispute, can regenerate the script, and contact the insurer themselves.',
  },
]

const aiOpen = [
  {
    title: 'Input quality',
    note: 'The prototype gives no confidence signal for low-quality scans. A readability check is required before analysis runs.',
  },
  {
    title: 'Data privacy',
    note: 'Storage, retention, and access policies for protected health information are not yet defined.',
  },
]

export function ClaimlyPage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page editorial-page">
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

        {/* Problem, goal, and approach in one section: the goal answers the problem beside it, and the
            approach underneath names the four functions the later sections refer back to. */}
        <section className="case-section section-shell editorial-section" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-framing">
            <div>
              <h3 className="case-framing__label">Problem</h3>
              <div className="case-body">
                <p>
                  When patients receive a medical bill, they see charges, billing codes, and insurance decisions without
                  a clear explanation of how they connect. It can be difficult to understand why insurance covers some
                  services, pays only part of others, or denies a claim altogether.
                </p>
                <p>
                  Patients are often left unsure how these decisions determine their final out-of-pocket cost, whether
                  the bill is correct, or what to do when something looks wrong. Many spend hours trying to get answers,
                  and some end up paying more than they owe.
                </p>
              </div>
            </div>
            <div>
              <h3 className="case-framing__label">Design goal</h3>
              <div className="case-body">
                <p className="case-goal">
                  How might we help patients understand how medical charges, insurance decisions, and out-of-pocket
                  costs connect, while helping them take action when a billing issue occurs?
                </p>
              </div>
            </div>
          </div>
          <div className="case-framing__approach">
            <h3 className="case-framing__label">Approach</h3>
            <div className="case-body editorial-body">
              <p>
                Claimly addresses the goal through four core functions: bill analysis, EOB comparison, code explanation,
                and appeal support. It reads the bill, compares it with the EOB, marks the lines that do not match,
                explains the codes behind them, and turns the finding into a script the user can read aloud.
              </p>
            </div>
          </div>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body editorial-body">
            <p>
              Before drawing a screen, I spoke with people about what they actually did with a medical bill they could
              not understand. Across 15+ survey responses and 4+ follow-up interviews, the problem extended beyond
              comprehension: people also lacked a safe next move.
            </p>
          </div>
          <FindingsList findings={findings} />
        </section>

        <section className="case-section section-shell flow-section" aria-labelledby="flow-title">
          <div className="flow-section-copy">
            <div className="section-label"><span>/</span><h2 id="flow-title">Interaction flow</h2></div>
            <div className="case-body editorial-body">
              <p>
                The full product flow, from bill intake to contacting the insurer. Select a scenario to trace its path.
                The demo above covers the main path; the other branches are not in the prototype.
              </p>
            </div>
          </div>
          <FlowPlayer spec={claimlyFlow} />
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

        <section className="case-section section-shell editorial-section" aria-labelledby="decisions-title">
          <div className="section-label"><span>/</span><h2 id="decisions-title">Design decisions</h2></div>
          <ol className="editorial-decisions">
            {decisions.map((decision, index) => (
              <li key={decision.title}>
                <span className="decision-index">0{index + 1}</span>
                <h3>{decision.title}</h3>
                <p>{decision.note}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="ai-title">
          <div className="section-label"><span>/</span><h2 id="ai-title">AI design considerations</h2></div>
          <div className="case-body editorial-body">
            <p>
              Claimly applies AI to extraction, comparison, explanation, and drafting. Because errors carry direct
              financial consequences for users, each function keeps a human in the loop: the AI generates, and the user
              verifies and decides.
            </p>
          </div>
          <ol className="ai-workflow" aria-label="AI role and user control for each core function">
            {aiWorkflow.map((row, index) => (
              <li key={row.step}>
                <span className="decision-index">0{index + 1}</span>
                <div className="ai-workflow__head">
                  <h3>{row.step}</h3>
                  <span className="ai-workflow__principle">{row.principle}</span>
                </div>
                <dl>
                  <div>
                    <dt>AI role</dt>
                    <dd>{row.ai}</dd>
                  </div>
                  <div>
                    <dt>User control</dt>
                    <dd>{row.user}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          <div className="ai-open">
            <h3>Open considerations</h3>
            <dl>
              {aiOpen.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.note}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="outcome-title">
          <div className="section-label"><span>/</span><h2 id="outcome-title">Outcome</h2></div>
          <div className="stat-row editorial-stat-row">
            <div><strong>15+</strong><span>Survey responses</span></div>
            <div><strong>4+</strong><span>Interviews</span></div>
            <div><strong>4</strong><span>Core functions</span></div>
          </div>
          <div className="case-body editorial-body">
            <p>
              Claimly went from problem framing to a working interface during the University of Michigan Tech
              Innovation Jam, between October and mid-November 2025. The concept, the design system, and the prototype
              are my own work. I led a five-person team through the user research, then pitched the result to a panel
              of four judges, all inside that six-week window.
            </p>
            <p>
              Since the Jam I have carried the concept forward myself. It has a working prototype but has not shipped.
              What I want to test next is whether the appeal script helps someone make the call they would otherwise
              skip.
            </p>
          </div>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body editorial-body">
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
