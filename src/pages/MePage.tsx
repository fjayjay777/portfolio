import portrait from '../assets/jiani-huang.jpeg'
import { SiteNav } from '../components/SiteNav'

export function MePage() {
  return (
    <div className="site-shell">
      <SiteNav />
      <main className="me-page section-shell">
        <p className="eyebrow">/ Me</p>
        <h1>Jiani Huang</h1>
        <div className="profile-layout">
          <figure className="portrait"><img src={portrait} alt="Jiani Huang" /></figure>
          <div className="profile-copy">
            <p>I’m a designer and developer with eight years of experience turning complex problems into thoughtful, human-centered digital products.</p>
            <p>I’m currently a graduate student at the University of Michigan School of Information, where I bring research, visual craft, and code together to make technology feel clearer and more useful.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
