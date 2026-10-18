import { useEffect, useRef, useState } from 'react'
import { useInView } from '../hooks/useInView'

const EMAIL = 'huangjn35@gmail.com'
const HEADING = 'Let’s Talk'

const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Detroit' })

/** The current time in Ann Arbor, refreshed often enough that the minute never looks stale. */
function useAnnArborTime() {
  const [time, setTime] = useState(() => timeFormat.format(new Date()))
  useEffect(() => {
    const timer = window.setInterval(() => setTime(timeFormat.format(new Date())), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return time
}

/** The older copy path, for browsers that refuse the clipboard API (embedded views, strict permissions). */
function copyWithSelection(text: string) {
  const field = document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  document.body.append(field)
  field.select()
  const copied = document.execCommand('copy')
  field.remove()
  return copied
}

/** Copies the address and says so for a moment. */
function CopyEmail() {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timer)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
    } catch {
      // Refused or missing; if the fallback fails too, the mailto link beside it still works.
      if (copyWithSelection(EMAIL)) setCopied(true)
    }
  }

  return (
    <button type="button" className={`contact-copy${copied ? ' is-copied' : ''}`} onClick={copy}>
      <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
    </button>
  )
}

// Marquee pace, in pixels per second: its idle drift, the most a fast scroll can add, and how
// quickly that extra speed dies away.
const DRIFT = 70
const MAX_BOOST = 1400
const BOOST_DECAY = 3
const HOVER_FACTOR = 0.25

/**
 * The heading as an endless band of type. It drifts on its own, picks up speed
 * from the page's scroll, turns round when the reader scrolls back up, and
 * slows under the pointer. Readers who ask for less motion get it standing still.
 */
function TalkMarquee() {
  const bandRef = useRef<HTMLHeadingElement>(null)
  const trackRef = useRef<HTMLSpanElement>(null)
  const groupRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const band = bandRef.current
    const track = trackRef.current
    const group = groupRef.current
    if (!band || !track || !group) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    let offset = 0
    let direction = 1
    let boost = 0
    let hovering = false
    let lastY = window.scrollY
    let last = performance.now()
    let frame = 0
    let visible = false

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const speed = (DRIFT + boost) * (hovering ? HOVER_FACTOR : 1)
      boost *= Math.exp(-dt * BOOST_DECAY)
      // The track holds two identical groups, so shifting by one group's width is seamless.
      const width = group.offsetWidth || 1
      offset = (((offset - direction * speed * dt) % width) - width) % width
      track.style.transform = `translate3d(${offset}px, 0, 0)`
      frame = visible ? requestAnimationFrame(tick) : 0
    }
    const start = () => {
      if (frame) return
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }

    const onScroll = () => {
      const delta = window.scrollY - lastY
      lastY = window.scrollY
      if (!delta) return
      direction = delta > 0 ? 1 : -1
      boost = Math.min(MAX_BOOST, boost + Math.abs(delta) * 8)
    }
    const onEnter = () => { hovering = true }
    const onLeave = () => { hovering = false }

    const observer = typeof IntersectionObserver === 'undefined'
      ? null
      : new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        if (visible) start()
      })
    if (observer) observer.observe(band)
    else {
      visible = true
      start()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    band.addEventListener('pointerenter', onEnter)
    band.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('scroll', onScroll)
      band.removeEventListener('pointerenter', onEnter)
      band.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  // Solid and outlined in turn, a star between each.
  const group = (copy: number) => (
    <span className="contact-marquee__group" ref={copy === 0 ? groupRef : undefined}>
      {[0, 1, 2, 3].map((index) => (
        <span className="contact-marquee__item" key={index}>
          <span className={index % 2 ? 'contact-marquee__word is-outline' : 'contact-marquee__word'}>{HEADING}</span>
          <span className="contact-marquee__star">✦</span>
        </span>
      ))}
    </span>
  )

  return (
    <h2 className="contact-marquee" id="contact-title" ref={bandRef} aria-label={HEADING}>
      <span className="contact-marquee__track" ref={trackRef} aria-hidden="true">
        {group(0)}
        {group(1)}
      </span>
    </h2>
  )
}

/** The homepage's closing section: a scrolling headline band, live local time, and the contact rows. */
export function HomeContact() {
  const [ref, inView] = useInView<HTMLElement>()
  const time = useAnnArborTime()

  return (
    <section
      className={`contact contact-reveal home-contact surface-dark${inView ? ' is-visible' : ''}`}
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
    >
      <TalkMarquee />
      <div className="contact-inner">
        <div className="contact-head">
          <p className="contact-time">
            <span className="contact-time__dot" aria-hidden="true" />
            Local time in Ann Arbor · <time>{time}</time>
          </p>
        </div>
        <div className="contact-list">
          <div className="contact-row">
            <a href={`mailto:${EMAIL}`}><span>Email</span><strong>Huangjn35@gmail.com</strong></a>
            <CopyEmail />
          </div>
          <a href="tel:+13855284176">
            <span>Phone</span><strong>385-528-4176</strong>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
          <a href="https://www.linkedin.com/in/jiani-huang-b22515365/" target="_blank" rel="noreferrer">
            <span>LinkedIn</span><strong>Jiani Huang</strong>
            <span className="contact-arrow" aria-hidden="true">↗</span>
          </a>
        </div>
        <p className="footer-note">Designed and built by Jiani © 2026</p>
      </div>
    </section>
  )
}
