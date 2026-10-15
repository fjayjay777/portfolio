import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaseFooter } from '../components/CaseFooter'
import { type Finding, FindingsList } from '../components/Findings'
import { SiteNav } from '../components/SiteNav'
import { NightyViewer } from '../nighty/NightyViewer'
import { parts } from '../nighty/parts'
import { hasWebGL } from '../nighty/stage'

const facts = [
  { label: 'Role', value: 'Product design' },
  { label: 'Timeline', value: 'June 2024' },
  { label: 'Team', value: 'Team of four' },
  { label: 'Scope', value: 'Temperature, sound, sleep tracking' },
]

// Each finding with the evidence behind it: interviews and surveys (25) and the smart-pillow comparison.
const findings: Finding[] = [
  {
    title: 'Sleepers rely on remedies they do not trust.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'Participants took melatonin or prescribed sleep aids for long periods and said the tablets did not always work.',
        },
        {
          source: 'Interview',
          text: 'Some drank wine to fall asleep; one said it kept waking them through the night.',
        },
      ],
      insight: 'Sleepers are open to an alternative that works on the room rather than the body.',
      decision: 'Nighty changes two conditions without medication: the temperature at the head and the noise around it.',
      open: 'Whether temperature and sound control reduce reliance on sleep aids.',
    },
  },
  {
    title: 'Sound already helps, but it plays into the room.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'One participant could not fall asleep without audio and played it from under the pillow.',
        },
        {
          source: 'Competitor analysis',
          text: 'Avantree Slumber builds speakers into a pillow but has no sleep tracking.',
        },
      ],
      insight: 'The pillow is already where people put sound. It should reach the ear without filling the room.',
      decision: 'Two flat speakers sit in the shoulder ends, next to the ear on the pillow.',
      open: 'Whether sound through the foam stays clear at a volume that does not disturb sleep.',
    },
  },
  {
    title: 'Tracking has to cost nothing at bedtime.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'A participant asked for simple features rather than "too many fancy functions."',
        },
        {
          source: 'Competitor analysis',
          text: 'Nitetronic tracks sleep and adjusts automatically, but depends on an app, a complex setup, and a high price.',
        },
      ],
      insight: 'Sleep data is worth having only if collecting it asks nothing of the sleeper: no wearable, no setup, no screen.',
      decision: 'A sensing strip under the neck roll reads breathing, heartbeat, and movement through the foam. The pod has one button and a status light.',
      open: 'Whether the strip tells light from deep sleep as reliably as a wearable.',
    },
  },
]

const decisions = [
  {
    title: 'Everything inside the foam',
    note: 'Outside, Nighty is a standard contoured pillow, and only the rear pod shows. A pillow that looks and feels like a pillow asks nothing new at bedtime.',
  },
  {
    title: 'Read the room, not the pillow',
    note: 'The temperature sensor sits in the rear pod, outside the foam, so it measures the air rather than the head’s own heat. Gel and a fan cool; the heating film runs only when the room is cold.',
  },
  {
    title: 'Shaped for the neck',
    note: 'One persona had neck and back pain from long hours at a desk. A 110 mm neck roll supports the neck, and the shoulder ends rise for side sleepers.',
  },
]

export function NightyPage() {
  const [webgl] = useState(hasWebGL)
  /** 0 to 100, the slider's own scale. */
  const [explode, setExplode] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const active = hovered ?? selected
  const activePart = parts.find((part) => part.id === active)
  const exploded = explode >= 50

  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page nighty-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Sleep technology</p>
          <h1>Nighty</h1>
          <p className="case-lead">
            A pillow that responds to the room. Nighty warms or cools the head zone, plays white noise from inside the
            foam, and tracks light and deep sleep.
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

        <section className="nighty-model" aria-labelledby="model-title">
          <div className="section-shell nighty-model-inner">
            <div className="nighty-copy">
              <div className="section-label"><span>/</span><h2 id="model-title">The pillow</h2></div>
              <p>
                A contoured memory-foam pillow, 600 by 360 mm, with a neck roll, a head cradle, and a rear roll.
              </p>
              <p>
                The electronics stay inside the foam. Only the control pod shows, with its vent, button, status light,
                and charging port.
              </p>
              <p className="nighty-hint">Drag to turn it</p>
            </div>
            <div className="nighty-stage nighty-stage--hero">
              <NightyViewer label="The Nighty pillow, assembled" explode={0} />
            </div>
          </div>
        </section>

        {/* Problem beside its design goal, with the approach underneath: the same opening as the other cases. */}
        <section className="nighty-overview section-shell" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-framing">
            <div>
              <h3 className="case-framing__label">Problem</h3>
              <div className="case-body">
                <p>
                  About one in three adults has symptoms of insomnia, and around 10% meet the criteria for chronic
                  insomnia disorder. Poor sleep raises the risk of depression and anxiety.
                </p>
                <p>
                  Temperature and noise, two conditions a sleeper can change, are handled by separate devices: a
                  thermostat for the whole room and a white-noise machine on the nightstand. Tracking sleep means
                  wearing a watch or ring to bed. None of these respond to each other, and the pillow stays passive.
                </p>
              </div>
            </div>
            <div>
              <h3 className="case-framing__label">Design goal</h3>
              <div className="case-body">
                <p className="case-goal">
                  How might we help people with sleep difficulties rest better by making the pillow sense and adjust
                  their sleep environment, and track their sleep without a device worn to bed?
                </p>
              </div>
            </div>
          </div>
          <div className="case-framing__approach">
            <h3 className="case-framing__label">Approach</h3>
            <div className="case-body">
              <p>
                Nighty builds temperature control, white noise, and sleep tracking into a contoured memory-foam pillow.
                The exploded view below shows where each part sits.
              </p>
            </div>
          </div>
        </section>

        <section className="nighty-section section-shell" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body">
            <p>
              The team interviewed and surveyed 25 people aged 20 to 70, including people with insomnia, ADHD, and
              disabilities, and compared three smart pillows on the market. Synthesis produced two personas: a student
              too tired from insomnia to focus, and a remote software engineer with neck pain who plays audio to fall
              asleep.
            </p>
          </div>
          <FindingsList findings={findings} />
        </section>

        <section className="nighty-exploded section-shell" aria-labelledby="exploded-title">
          <div className="section-label"><span>/</span><h2 id="exploded-title">Exploded view</h2></div>
          <div className="nighty-exploded-grid">
            <div className="nighty-stage nighty-stage--exploded">
              <NightyViewer
                label="The Nighty pillow, taken apart into its ten parts"
                explode={explode / 100}
                activeId={active}
                interactive
                onHover={setHovered}
                onSelect={setSelected}
              />
              {/* The list states the selection for screen readers; this names it where the eye already is. */}
              {webgl && activePart && (
                <p className="nighty-caption" aria-hidden="true">{activePart.number} · {activePart.name}</p>
              )}
              {webgl && (
                <div className="nighty-controls">
                  <button className="nighty-toggle" type="button" onClick={() => setExplode(exploded ? 0 : 100)}>
                    {exploded ? 'Assemble' : 'Explode'}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={explode}
                    aria-label="Explode amount"
                    onChange={(event) => setExplode(Number(event.target.value))}
                  />
                  <output className="nighty-readout">{explode}%</output>
                </div>
              )}
            </div>

            <div className="nighty-parts-panel">
              <p className="nighty-intro">
                Ten parts, from the knit cover to the base panel. Drag the slider to take the pillow apart, then pick a
                part to see where it sits.
              </p>
              <ol className="nighty-parts" aria-label="Parts">
                {parts.map((part) => (
                  <li key={part.id}>
                    <button
                      className={`nighty-part${part.id === active ? ' is-active' : ''}`}
                      type="button"
                      aria-pressed={part.id === selected}
                      onClick={() => setSelected(part.id === selected ? null : part.id)}
                      onMouseEnter={() => setHovered(part.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(part.id)}
                      onBlur={() => setHovered(null)}
                    >
                      <span className="nighty-part__number">{part.number}</span>
                      <span className="nighty-part__name">{part.name}</span>
                      <span className="nighty-part__role">{part.role}</span>
                      <span className="nighty-part__description">{part.description}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="nighty-section section-shell" aria-labelledby="decisions-title">
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

        <section className="nighty-section section-shell" aria-labelledby="outcome-title">
          <div className="section-label"><span>/</span><h2 id="outcome-title">Outcome</h2></div>
          <div className="case-body">
            <div className="stat-row">
              <div><strong>25</strong><span>Research participants</span></div>
              <div><strong>3</strong><span>Functions in one pillow</span></div>
              <div><strong>10</strong><span>Components modeled</span></div>
            </div>
            <p>
              Nighty is a team concept, shown here as an interactive 3D model. The internal parts were modeled for this
              case study from the team’s research.
            </p>
            <p>
              The next step is testing with sleepers: time to fall asleep, night wakings, and how the pillow’s tracking
              compares with a wearable.
            </p>
          </div>
        </section>

        <section className="nighty-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body">
            <p>
              The strongest pain points were not about the room. Participants described anxiety about sleep, no one to
              talk to about it, and trouble getting an appointment with a psychologist. A pillow can improve the
              conditions for sleep, but it does not treat that anxiety.
            </p>
            <p>
              The persona who asked for fewer features is the one Nighty most needs to convince. Three functions in one
              pillow have to feel like one.
            </p>
          </div>
        </section>

        <CaseFooter current="Nighty" />
      </main>
    </div>
  )
}
