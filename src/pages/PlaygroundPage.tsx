import { SiteNav } from '../components/SiteNav'
import { Collage } from '../play/Collage'
import '../play/playground.css'

export function PlaygroundPage() {
  return (
    <div className="site-shell playground-shell">
      <SiteNav />
      <main className="playground-page section-shell">
        <header className="playground-head">
          <h1>Collage me</h1>
          <p className="playground-lead">
            Stick pieces of my work and life onto the board. Whatever you put together gets read left to right and
            turned into a sentence about me!
          </p>
        </header>
        <Collage />
      </main>
    </div>
  )
}
