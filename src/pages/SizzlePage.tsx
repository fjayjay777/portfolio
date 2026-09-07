import { Link } from 'react-router-dom'
import { MobileDemoFrame } from '../components/MobileDemoFrame'
import { CaseFooter } from '../components/CaseFooter'
import { SiteNav } from '../components/SiteNav'

const facts = [
  { label: 'Role', value: 'UX/UI designer — research through UI' },
  { label: 'Timeline', value: 'Dec 2023 — Apr 2024 · 5 months' },
  { label: 'Team', value: 'Solo design, built with developers' },
  { label: 'Scope', value: 'Discovery, meal plans, fridge, community' },
]

const walkthrough = [
  {
    title: 'Swipe to find something to cook',
    figure: 'Recommendation',
    note: 'The home screen recommends by swipe rather than by list. It was the one interaction testers volunteered praise for in the first round — easy and creative, in their words — so it survived every later revision untouched.',
  },
  {
    title: 'Cook from what is already in the fridge',
    figure: 'Fridge',
    note: 'The fridge holds what you actually have and matches recipes against it. Testers connected it to two different things I had treated separately: fitting recipes to a daily routine, and not wasting food. One tester also could not find it — placement, not concept, was the problem.',
  },
  {
    title: 'Keep meal plans apart from saved recipes',
    figure: 'Meal plans',
    note: 'Saved recipes and meal plans live in separate places. A tester named this as the reason he did not mix them up, which settled a structure I had been unsure about — though the same round showed in-progress plans were still missing from the saved view.',
  },
]

const decisions = [
  {
    title: 'A social platform, not a bigger database',
    note: 'Competitor analysis split cleanly: Kitchen Stories, Yummly, and Tasty hold millions of professional recipes but little user-generated content and weak feedback loops; TikTok and Instagram have the engagement and the personalization but no recipe management at all. Sizzle takes the second group\'s social model and gives it the first group\'s structure.',
  },
  {
    title: 'Icons carry the guidance, text gets shorter',
    note: 'Round one found the directional copy excessively verbose and taking up real space. Replacing it with icons tested well immediately — but the spacing was tight enough that people kept landing on the wrong screen, so the fix needed a second pass before it counted as one.',
  },
  {
    title: 'Designed for beginners, not just cooks',
    note: 'Two of the three personas were not confident cooks — a college student with a small budget and limited equipment, and a first-time cook who wanted to stop relying on takeout. "Rarely beginner-friendly" was one of the six pain points, so step clarity was a requirement rather than a nice-to-have.',
  },
]

export function SizzlePage() {
  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Food discovery</p>
          <h1>Sizzle</h1>
          <p className="case-lead">
            A recipe-sharing social platform where people create, record, and share their own cooking — with the
            fridge, the meal plan, and the recipe held in one place.
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
                The prototype runs live in the frame — swipe the recommendation home, open a recipe, build a meal plan,
                and check the fridge. The three things worth trying are the swipe home, the fridge, and how meal plans
                stay separate from saved recipes, since those are the decisions testing turned on.
              </p>
              <p>
                Scope: front-end only. Saving, liking, shopping-list additions, and fridge updates live in memory and
                reset on reload — there is no account or backend behind them.
              </p>
            </div>
            <MobileDemoFrame title="Sizzle" url="/demos/sizzle/" canvas="#fef9f0" />
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="overview-title">
          <div className="section-label"><span>/</span><h2 id="overview-title">Overview</h2></div>
          <div className="case-body">
            <p>
              Recipe platforms are built as libraries. They hold enormous professional catalogues, but the people using
              them cannot contribute, cannot find what fits their week, and cannot talk to each other — the interfaces
              are cluttered and the feedback loops are thin. Cooking has an active community; it just lives somewhere
              else, on platforms with no way to organize a recipe.
            </p>
            <p>
              Sizzle is the platform for the gap between the two: somewhere to create, record, and share your own
              recipes with people who cook, with the organization a library gets right and the social life it does not.
              Design ran from December 2023 to April 2024 across three iterations, and a first edition shipped with
              developers.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="research-title">
          <div className="section-label"><span>/</span><h2 id="research-title">Research</h2></div>
          <div className="case-body">
            <p>
              Twenty-five interviews produced three personas and six pain points, alongside a competitor analysis
              covering direct platforms (Kitchen Stories, Yummly, Tasty) and the indirect ones people actually cook from
              (TikTok, Instagram). Fifteen participants later took the designs through two rounds of usability testing.
            </p>
            <ul className="finding-list">
              <li>
                <strong>The problem is organization before it is content.</strong> Recipes are poorly tagged and
                category boundaries are vague, so a large catalogue does not translate into finding the thing you want.
              </li>
              <li>
                <strong>Nothing adapts to how a week actually runs.</strong> All three personas asked for this from
                different directions — family dinners for four, a student budget and one hotplate, a beginner who needs
                the technique explained.
              </li>
              <li>
                <strong>Ingredients fail silently.</strong> Recipes assume availability and offer no substitutions when
                something is missing, which is where a home cook actually stops.
              </li>
              <li>
                <strong>Community is the missing feature, not a bonus one.</strong> Existing platforms leave users
                unable to contribute or respond to each other, which is exactly what draws cooking content onto social
                apps that cannot organize it.
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
                <div className="step-figure placeholder-figure" aria-hidden="true">
                  <span>{step.figure}</span>
                </div>
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
              <div><strong>25</strong><span>Interviews</span></div>
              <div><strong>15</strong><span>Usability test participants</span></div>
              <div><strong>v1.0</strong><span>Shipped with developers</span></div>
            </div>
            <p>
              Round one was mostly a list of things that were wrong: buttons too small to hit reliably, directional copy
              long enough to crowd the screen, a rating section whose layout and wording raised questions, and icon
              spacing tight enough to send people to the wrong screen. The swipe home was the exception — testers liked
              it unprompted.
            </p>
            <p>
              Round two confirmed the repairs. Repositioned icons and pinch-to-zoom on images registered as a clear
              improvement, and tighter UX writing got first-time users oriented faster. The larger result was
              structural: prioritizing the layout and giving the app a consistent logic did more for the experience than
              any single screen fix, and that version is what shipped.
            </p>
          </div>
        </section>

        <section className="case-section section-shell" aria-labelledby="reflection-title">
          <div className="section-label"><span>/</span><h2 id="reflection-title">Reflection</h2></div>
          <div className="case-body">
            <p>
              Three notes from the last round did not make it into v1.0. A tester found the threads and groups sections
              overwhelming — the community half of the product, the part the whole premise depends on, was the part
              that read as too complex. Another could not locate the fridge, a feature two other testers described as
              the reason they would use the app. A third asked why an in-progress meal plan does not appear alongside
              the saved ones, which is a fair question I still do not have a good answer to.
            </p>
            <p>
              What I would take differently into the next project: I tested whether individual screens worked before I
              had tested whether people could find things. The fixes in round one were nearly all local — button size,
              copy length, icon spacing — and the finding that mattered was the one about the app's overall logic, which
              arrived last and would have been cheaper to learn first.
            </p>
          </div>
        </section>

        <CaseFooter current="Sizzle" />
      </main>
    </div>
  )
}
