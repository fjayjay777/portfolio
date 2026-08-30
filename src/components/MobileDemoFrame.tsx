import { useEffect, useRef, useState } from 'react'

export type DemoViewport = { width: number; height: number }

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
const statusBarHeight = 48

export function MobileDemoFrame({ title, url, canvas = '#ffffff', viewport = defaultViewport }: MobileDemoFrameProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [scale, setScale] = useState(1)
  const screenRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const screen = screenRef.current
    if (!screen || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (width > 0) setScale(width / viewport.width)
    })

    observer.observe(screen)
    return () => observer.disconnect()
  }, [viewport.width])

  return (
    <section className="mobile-demo" aria-label={`${title} demo`}>
      <div
        className="mobile-demo__frame"
        style={{
          '--demo-width': `${viewport.width}px`,
          '--demo-height': `${viewport.height}px`,
          // aspect-ratio takes unitless numbers, so it needs its own token.
          '--demo-ratio': `${viewport.width} / ${viewport.height}`,
          '--demo-status': `${statusBarHeight}px`,
          '--demo-canvas': canvas,
          '--demo-scale': scale,
        } as React.CSSProperties}
      >
        <div className="mobile-demo__screen" ref={screenRef}>
          <div className="mobile-demo__statusbar" aria-hidden="true">
            <span className="mobile-demo__time">9:41</span>
            <svg className="mobile-demo__icons" viewBox="0 0 78 14" fill="none">
              <g fill="currentColor">
                <rect x="0" y="8" width="3.4" height="6" rx="1.1" />
                <rect x="5.8" y="5.8" width="3.4" height="8.2" rx="1.1" />
                <rect x="11.6" y="3.4" width="3.4" height="10.6" rx="1.1" />
                <rect x="17.4" y="1" width="3.4" height="13" rx="1.1" />
              </g>
              <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
                <path d="M27.4 5.6a11.6 11.6 0 0 1 14.8 0" />
                <path d="M30.4 8.9a7 7 0 0 1 8.8 0" />
              </g>
              <circle cx="34.8" cy="12.1" r="1.7" fill="currentColor" />
              <rect x="50.6" y="2.6" width="22" height="9.4" rx="3.1" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.2" />
              <rect x="52.2" y="4.2" width="15" height="6.2" rx="1.7" fill="currentColor" />
              <path d="M74.2 6.1v3.4a1.9 1.9 0 0 0 0-3.4Z" fill="currentColor" fillOpacity=".4" />
            </svg>
          </div>
          <span className="mobile-demo__island" aria-hidden="true" />
          {isLoading && <p className="mobile-demo__status">Loading interactive prototype…</p>}
          <iframe
            className="mobile-demo__iframe"
            title={`${title} interactive prototype`}
            src={url}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
      <a className="mobile-demo__link" href={url} target="_blank" rel="noreferrer">
        Open {title} demo <span aria-hidden="true">↗</span>
      </a>
    </section>
  )
}
