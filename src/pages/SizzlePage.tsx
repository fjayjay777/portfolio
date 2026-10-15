import { Link } from 'react-router-dom'
import recommendShot from '../assets/sizzle/sz-01-recommend.jpg'
import fridgeShot from '../assets/sizzle/sz-02-fridge.jpg'
import mealplansShot from '../assets/sizzle/sz-03-mealplans.jpg'
import { CaseFooter } from '../components/CaseFooter'
import { type Finding, FindingsList } from '../components/Findings'
import { FlowPlayer } from '../components/FlowPlayer'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { PhoneShot } from '../components/PhoneShot'
import { SiteNav } from '../components/SiteNav'
import { sizzleFlow } from '../components/SizzleFlow'

const facts = [
  { label: 'Role', value: 'UX/UI designer · research through UI' },
  { label: 'Timeline', value: 'Dec 2023 to Apr 2024 · 5 months' },
  { label: 'Team', value: 'Solo design, built with developers' },
  { label: 'Scope', value: 'Discovery, meal plans, fridge, community' },
]

const walkthrough = [
  {
    title: 'One recommendation at a time',
    shot: recommendShot,
    alt: 'The recommendation channel showing one recipe card at a time',
    note: 'Recommendations lead with a single recipe. The swipe-based version was the only interaction testers praised unprompted, so it stayed through every revision.',
  },
  {
    title: 'Know what is in the fridge',
    shot: fridgeShot,
    alt: 'The fridge screen listing ingredients already on hand, grouped by category',
    note: 'The fridge lists what is on hand by category. Testers tied it to planning around their routine and to wasting less food.',
  },
  {
    title: 'Keep meal plans apart from saved recipes',
    shot: mealplansShot,
    alt: 'The meal plans screen, kept separate from saved recipes',
    note: 'Meal plans and saved recipes live in separate places. A tester said this kept the two from getting mixed up; another asked why an in-progress plan was missing from the saved view.',
  },
]

const decisions = [
  {
    title: 'Social model, library structure',
    note: 'Recipe platforms have structure but no community; social apps have community but no structure. Sizzle takes the social model and gives it a library\'s organization.',
  },
  {
    title: 'Icons over long copy',
    note: 'Round one found the directional copy too long. Icons replaced it and tested well, but were spaced so tightly that people landed on the wrong screen until round two.',
  },
  {
    title: 'Designed for beginners',
    note: 'Two of three personas were not confident cooks: a student on a budget and a first-time cook moving off takeout. Clear steps with a photo for each were a requirement.',
  },
]

// Each finding with the evidence behind it: interviews (25), the competitor analysis, and usability testing (15).
const findings: Finding[] = [
  {
    title: 'Recipes are hard to find, not scarce.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'Participants described recipes as poorly tagged, with vague category boundaries and scattered cooking details.',
        },
        {
          source: 'Competitor analysis',
          text: 'Kitchen Stories, Yummly, and Tasty hold millions of professional recipes, but their interfaces are cluttered and not personalized.',
        },
      ],
      insight: 'The problem is organization, not volume.',
      decision: 'Discovery is split into channels (Trending, Recommendation, Followed, Category, Meal plans), and recommendations show one recipe at a time.',
      open: 'Whether channels help people find a recipe faster than search.',
    },
  },
  {
    title: 'Cooking is planned around the week.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'Participants struggled to find recipes that fit their routine, and recipes offered no substitutes for missing ingredients.',
        },
        {
          source: 'Usability test',
          text: 'Testers linked the fridge to fitting recipes to their routine and wasting less food. 85% found it within two minutes; one called it hard to find.',
        },
      ],
      insight: 'Planning starts from the week and from what is already in the kitchen, not from a single recipe.',
      decision: 'Meal plans show today and every day and fill the shopping list, next to a fridge that records what is on hand.',
      open: 'Whether the fridge changes what people cook. Testing measured only whether they could find it.',
    },
  },
  {
    title: 'Cooks want to contribute, not only browse.',
    chain: {
      evidence: [
        {
          source: 'Interview',
          text: 'Most platforms gave participants no way to share their own recipes or talk to other cooks.',
        },
        {
          source: 'Competitor analysis',
          text: 'TikTok and Instagram have the audience and the personalization, but no way to manage a recipe.',
        },
        {
          source: 'Usability test',
          text: '55% of testers created and shared a recipe within 10 minutes; 38% took 10 to 20.',
        },
      ],
      insight: 'The community already exists on apps that cannot organize a recipe. Sharing has to be easy before one forms here.',
      decision: 'Cooks publish recipes to their profile, and every recipe carries ratings and feedback from other cooks.',
      open: 'Whether groups and threads hold up. One tester found them overwhelming, and they were not simplified before v1.0.',
    },
  },
]

export function SizzlePage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page editorial-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Food discovery</p>
          <h1>Sizzle</h1>
          <p className="case-lead">
            A recipe-sharing platform that keeps a cook's recipes, meal plans, and fridge in one place.
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
                The prototype runs live in the frame. Open a recipe, a meal plan, and the fridge, the areas testing
                turned on.
              </p>
              <p>Scope: front end only. Saves, likes, the shopping list, and the fridge reset on reload.</p>
            </div>
            <MobileDemoFrame title="Sizzle" url="/demos/sizzle/" canvas="#fef9f0" />
          </div>
        </section>

        {/* Problem beside its design goal, with the approach underneath: the same opening as the other cases. */}
        <section className="case-section section-shell editorial-section" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-framing">
            <div>
              <h3 className="case-framing__label">Problem</h3>
              <div className="case-body">
                <p>
                  Recipe platforms are built as libraries: large professional catalogues that users cannot add to or
                  discuss, and that do not fit a cook's week. The cooking community lives on social apps instead, which
                  cannot organize a recipe.
                </p>
              </div>
            </div>
            <div>
              <h3 className="case-framing__label">Design goal</h3>
              <div className="case-body">
                <p className="case-goal">
                  How might we give home cooks a library’s organization and a social platform’s community, so they can
                  find, plan, and cook what fits their week?
                </p>
              </div>
            </div>
          </div>
          <div className="case-framing__approach">
            <h3 className="case-framing__label">Approach</h3>
            <div className="case-body editorial-body">
              <p>
                Sizzle combines the two. Cooks share their own recipes, and the app organizes them alongside meal plans,
                a shopping list, and a fridge. Design ran over three iterations, and v1.0 shipped with developers.
              </p>
            </div>
          </div>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body editorial-body">
            <p>
              Twenty-five interviews produced three personas and six pain points. A competitor analysis covered recipe
              platforms (Kitchen Stories, Yummly, Tasty) and the social apps people cook from (TikTok, Instagram).
              Fifteen participants then tested the designs over two rounds, including timed tasks.
            </p>
          </div>
          <FindingsList findings={findings} />
        </section>

        <section className="case-section section-shell flow-section flow-section--sizzle" aria-labelledby="flow-title">
          <div className="flow-section-copy">
            <div className="section-label"><span>/</span><h2 id="flow-title">Interaction flow</h2></div>
            <div className="case-body editorial-body">
              <p>
                The app's four areas, from the sitemap. Select a scenario to trace its path. Swiping and rating are
                designed but not interactive in the demo.
              </p>
            </div>
          </div>
          <FlowPlayer spec={sizzleFlow} focusX={420} />
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
                  canvas="#fef9f0"
                  viewport={{ width: 430, height: 932 }}
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

        <section className="case-section section-shell editorial-section" aria-labelledby="outcome-title">
          <div className="section-label"><span>/</span><h2 id="outcome-title">Outcome</h2></div>
          <div className="stat-row editorial-stat-row">
            <div><strong>25</strong><span>Interviews</span></div>
            <div><strong>15</strong><span>Usability test participants</span></div>
            <div><strong>v1.0</strong><span>Shipped with developers</span></div>
          </div>
          <div className="case-body editorial-body">
            <p>
              Round one surfaced local problems: small tap targets, long directional copy, an unclear rating section,
              and cramped icons. The swipe home was the exception; testers liked it unprompted.
            </p>
            <p>
              Round two confirmed the fixes. Repositioned icons, pinch-to-zoom on images, and tighter copy got
              first-time users oriented faster. That version shipped as v1.0.
            </p>
          </div>
        </section>

        <section className="case-section section-shell editorial-section" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body editorial-body">
            <p>
              Three issues did not make v1.0: groups and threads read as overwhelming, one tester could not find the
              fridge, and in-progress meal plans were missing from the saved view.
            </p>
            <p>
              Next time I would test whether people can find features before testing individual screens. Most round-one
              fixes were local, and the finding that mattered most, about the app's overall structure, arrived last.
            </p>
          </div>
        </section>

        <CaseFooter current="Sizzle" />
      </main>
    </div>
  )
}
