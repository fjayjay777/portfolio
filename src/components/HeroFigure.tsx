// A typographic asterisk drawn as `arms` lines through a shared center, so the
// shape stays symmetrical at any arm count and rotates cleanly about itself.
export function Asterisk({ arms }: { arms: number }) {
  const angles = Array.from({ length: arms }, (_, index) => (index * 180) / arms)

  return (
    <svg className="asterisk" viewBox="-50 -50 100 100" aria-hidden="true" focusable="false">
      {angles.map((angle) => (
        <line key={angle} x1="0" y1="-46" x2="0" y2="46" transform={`rotate(${angle})`} />
      ))}
    </svg>
  )
}

export function HeroFigure() {
  return (
    <div className="hero-marks" aria-hidden="true">
      <span className="hero-mark hero-mark--lead"><Asterisk arms={3} /></span>
      <span className="hero-mark hero-mark--echo"><Asterisk arms={3} /></span>
      <span className="hero-mark hero-mark--accent"><Asterisk arms={3} /></span>
    </div>
  )
}
