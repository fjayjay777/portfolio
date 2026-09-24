import { useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { parts } from './parts'
import { createStage, hasWebGL, type StageInput } from './stage'

type NightyViewerProps = {
  /** Read out in place of the canvas. */
  label: string
  /** 0 is assembled and 1 fully exploded; the model eases toward it. */
  explode: number
  /** The part to highlight; the others fade back. */
  activeId?: string | null
  /** Number labels and picking. The hero model leaves them off. */
  interactive?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string | null) => void
}

const fallback = (
  <p className="nighty-fallback">This browser can’t run WebGL, so the 3D model can’t load. Every part is still listed on this page.</p>
)

/** The 3D model, or a short notice when WebGL is off or the renderer fails to start. */
export function NightyViewer(props: NightyViewerProps) {
  const [supported] = useState(hasWebGL)
  if (!supported) return fallback
  return (
    <ErrorBoundary fallback={fallback}>
      <ViewerStage {...props} />
    </ErrorBoundary>
  )
}

function ViewerStage({ label, explode, activeId = null, interactive = false, onHover, onSelect }: NightyViewerProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const input = useRef<StageInput>({ explode, activeId, onHover, onSelect })

  useEffect(() => {
    input.current = { explode, activeId, onHover, onSelect }
  })

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const stage = createStage(host, { interactive, labels: labelRefs.current, read: () => input.current })
    return stage.dispose
  }, [interactive])

  return (
    <div className="nighty-viewer" ref={hostRef} role="img" aria-label={label}>
      {/* Pointer shortcuts only; the parts list is the accessible way to pick a part. */}
      {interactive && parts.map((part, index) => (
        <button
          key={part.id}
          ref={(element) => { labelRefs.current[index] = element }}
          className="nighty-label"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => input.current.onSelect?.(part.id)}
        >
          <span>{part.number}</span>
        </button>
      ))}
    </div>
  )
}
