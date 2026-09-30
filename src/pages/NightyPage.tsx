import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaseFooter } from '../components/CaseFooter'
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
            A pillow that pays attention to the room. Nighty warms or cools the head zone to suit the air around it,
            plays white noise from inside the foam, and tracks light and deep sleep through the night.
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
                On the outside it is a standard contoured memory-foam pillow, 600 by 360 mm, with a 110 mm neck roll, a
                70 mm head cradle and a 90 mm rear roll. The shoulder ends of the cradle rise slightly for side sleepers.
              </p>
              <p>
                Everything electronic stays inside the foam. The only part that shows is the control pod in the rear
                panel, with its vent, button, status light and charging port.
              </p>
              <p className="nighty-hint">Drag to turn it</p>
            </div>
            <div className="nighty-stage nighty-stage--hero">
              <NightyViewer label="The Nighty pillow, assembled" explode={0} />
            </div>
          </div>
        </section>

        {/* Problem and goal side by side: the goal answers the problem, so they read as a pair. */}
        <div className="nighty-framing section-shell">
          <section aria-labelledby="problem-title">
            <div className="section-label"><span>/</span><h2 id="problem-title">Problem statement</h2></div>
            <div className="case-body">
              <p>
                About one in three adults experiences symptoms of insomnia, and around 10% meet the criteria for chronic
                insomnia disorder. Poor sleep is linked to alcohol misuse and to anxiety about sleep itself, and it raises
                the risk of depression and anxiety disorders.
              </p>
              <p>
                Two conditions a sleeper can change, room temperature and noise, are managed by separate products: a
                thermostat set for the whole room and a white-noise machine on the nightstand. Tracking whether sleep is
                improving usually means wearing a watch or ring to bed. None of these respond to one another, and the
                pillow, the one surface in contact with the sleeper all night, stays passive.
              </p>
            </div>
          </section>
          <section aria-labelledby="goal-title">
            <div className="section-label"><span>/</span><h2 id="goal-title">Design goal</h2></div>
            <div className="case-body">
              <p className="case-goal">
                How might we help people with sleep difficulties rest better by making the pillow sense and adjust their
                sleep environment, and track their sleep without a device worn to bed?
              </p>
            </div>
          </section>
        </div>

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
                Ten parts, from the knit cover down to the base panel. Drag the slider to take the pillow apart, then
                pick a part here or in the model to see where it sits.
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
              <div className="nighty-note">
                <h3>How it holds temperature</h3>
                <p>
                  When the room is warm, the gel layer and the fan move heat away from the head. When it is cold, the
                  heating film warms the cradle. The pod’s sensor sits outside the foam, so it reads the room rather
                  than the pillow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CaseFooter current="Nighty" />
      </main>
    </div>
  )
}
