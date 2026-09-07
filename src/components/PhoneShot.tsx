import { PhoneFrame, type DemoViewport } from './PhoneFrame'

type PhoneShotProps = {
  src: string
  alt: string
  viewport: DemoViewport
  canvas?: string
}

/** A captured screen shown in the same device chrome as the live prototype. */
export function PhoneShot({ src, alt, viewport, canvas }: PhoneShotProps) {
  return (
    <figure className="phone-shot">
      <PhoneFrame viewport={viewport} canvas={canvas}>
        <img className="mobile-demo__shot" src={src} alt={alt} loading="lazy" />
      </PhoneFrame>
    </figure>
  )
}
