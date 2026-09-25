import { useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'

type FlowCanvasProps = {
  /** Intrinsic size of the diagram, in the units of its viewBox. */
  width: number
  height: number
  label: string
  children: ReactNode
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.5
const ZOOM_STEP = 0.25
// Below this the node labels stop being readable, so narrow screens start
// zoomed in and pan sideways instead of shrinking the whole diagram.
const MIN_READABLE = 0.75

/** The next step up or down, landing on whole steps even from a fitted 96%. */
function snap(scale: number, direction: 1 | -1) {
  const steps = scale / ZOOM_STEP
  const current = direction === 1 ? Math.floor(steps + 1e-6) : Math.ceil(steps - 1e-6)
  return (current + direction) * ZOOM_STEP
}

/**
 * A dotted board that holds a diagram. It grows in height with the zoom
 * instead of panning vertically, so a swipe over it still scrolls the page;
 * only the horizontal overflow pans, by drag, trackpad or touch.
 */
export function FlowCanvas({ width, height, label, children }: FlowCanvasProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; scrollLeft: number } | null>(null)
  // Where the view was centred before a zoom, in diagram units.
  const pendingCenter = useRef<number | null>(null)
  const [viewportWidth, setViewportWidth] = useState(0)
  const [zoom, setZoom] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(([entry]) => setViewportWidth(entry.contentRect.width))
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  const fit = viewportWidth ? Math.min(1, viewportWidth / width) : 1
  const scale = zoom ?? Math.max(fit, MIN_READABLE)
  const overflowing = viewportWidth > 0 && width * scale > viewportWidth + 1

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || pendingCenter.current === null) return
    viewport.scrollLeft = pendingCenter.current * scale - viewport.clientWidth / 2
    pendingCenter.current = null
  }, [scale])

  function zoomTo(next: number | null) {
    const viewport = viewportRef.current
    if (viewport) pendingCenter.current = (viewport.scrollLeft + viewport.clientWidth / 2) / scale
    setZoom(next === null ? null : Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, next)))
  }

  // Touch and trackpads already scroll natively; a mouse needs drag-to-pan.
  function startDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || event.button !== 0 || !overflowing) return
    drag.current = { x: event.clientX, scrollLeft: event.currentTarget.scrollLeft }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function moveDrag(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    event.currentTarget.scrollLeft = drag.current.scrollLeft - (event.clientX - drag.current.x)
  }

  function endDrag() {
    drag.current = null
    setDragging(false)
  }

  return (
    <figure className="flow-canvas">
      <div
        className={`flow-canvas__viewport${overflowing ? ' is-pannable' : ''}${dragging ? ' is-dragging' : ''}`}
        ref={viewportRef}
        role="group"
        aria-label={`${label} canvas`}
        tabIndex={0}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="flow-canvas__stage" style={{ width: width * scale, height: height * scale }}>
          {children}
        </div>
      </div>

      <div className="flow-canvas__controls">
        {overflowing && <span className="flow-canvas__hint">Drag to pan</span>}
        <button type="button" aria-label="Zoom out" disabled={scale <= MIN_ZOOM} onClick={() => zoomTo(snap(scale, -1))}>−</button>
        <output aria-live="polite">{Math.round(scale * 100)}%</output>
        <button type="button" aria-label="Zoom in" disabled={scale >= MAX_ZOOM} onClick={() => zoomTo(snap(scale, 1))}>+</button>
        <button type="button" className="flow-canvas__fit" onClick={() => zoomTo(null)}>Fit</button>
      </div>
    </figure>
  )
}
