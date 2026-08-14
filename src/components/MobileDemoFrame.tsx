import { useState } from 'react'

type MobileDemoFrameProps = {
  title: string
  url: string
}

export function MobileDemoFrame({ title, url }: MobileDemoFrameProps) {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <section className="mobile-demo" aria-label={`${title} demo`}>
      <div className="mobile-demo__frame">
        {isLoading && <p className="mobile-demo__status">Loading interactive prototype…</p>}
        <iframe
          className="mobile-demo__iframe"
          title={`${title} interactive prototype`}
          src={url}
          onLoad={() => setIsLoading(false)}
        />
      </div>
      <a className="mobile-demo__link" href={url} target="_blank" rel="noreferrer">
        Open {title} demo <span aria-hidden="true">↗</span>
      </a>
    </section>
  )
}
