import { useState } from 'react'
import { PhoneFrame, type DemoViewport } from './PhoneFrame'

export type { DemoViewport }

type MobileDemoFrameProps = {
  title: string
  url: string
  /** Background behind the status bar — set it to the demo's own canvas color. */
  canvas?: string
  /**
   * Logical phone size the demo was designed against. It must match the demo's
   * own shell width, or the app renders narrower than the frame and its chrome
   * (bottom nav, action tray) stops meeting the bezel.
   */
  viewport?: DemoViewport
}

// The demos lay out against a real phone viewport, so the iframe is given those
// exact dimensions and scaled down to whatever width the frame gets. Sizing the
// iframe to the frame instead would trip the demos' own min-width and clip them.
const defaultViewport: DemoViewport = { width: 430, height: 932 }

export function MobileDemoFrame({ title, url, canvas = '#ffffff', viewport = defaultViewport }: MobileDemoFrameProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <section className="mobile-demo" aria-label={`${title} demo`}>
      <PhoneFrame viewport={viewport} canvas={canvas}>
        {isLoading && <p className="mobile-demo__status">Loading interactive prototype…</p>}
        <iframe
          className="mobile-demo__iframe"
          title={`${title} interactive prototype`}
          src={url}
          onLoad={() => setIsLoading(false)}
        />
      </PhoneFrame>
      <a className="mobile-demo__link" href={url} target="_blank" rel="noreferrer">
        Open {title} demo <span aria-hidden="true">↗</span>
      </a>
    </section>
  )
}
