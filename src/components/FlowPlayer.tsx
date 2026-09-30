import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { FlowCanvas } from './FlowCanvas'
import { Branch, Decision, Edge, FlowSvg, Step, Terminal } from './flowParts'

/*
 * A flow diagram with scenario controls. Nodes and edges are data, so a
 * scenario is a list of edge ids: the player draws each edge in turn, moves a
 * dot along it, and lights the node it ends on while the rest steps back.
 */

export type FlowNodeSpec =
  | { id: string; type: 'step'; x: number; y: number; w?: number; title: string; note?: string; tint?: boolean }
  | { id: string; type: 'terminal'; cx: number; y: number; w?: number; title: string; note?: string; outside?: boolean }
  | { id: string; type: 'decision'; cx: number; cy: number; w?: number; h?: number; title: string }

export type FlowEdgeSpec = {
  id: string
  d: string
  to?: string
  end?: boolean
  dashed?: boolean
  branch?: { x: number; y: number; text: string }
}

/** A path through the flow. Its edges should chain end to start, so the dot never jumps. */
export type FlowScenario = { id: string; label: string; start: string; edges: string[] }

export type FlowSpec = {
  width: number
  height: number
  title: string
  desc: string
  nodes: FlowNodeSpec[]
  edges: FlowEdgeSpec[]
  /** The first scenario autoplays when the board scrolls into view. */
  scenarios: FlowScenario[]
  /** Drawn beneath the edges: stage headings, lanes, bands. */
  backdrop?: ReactNode
  legend?: ReactNode
}

// Pace of the trace: longer edges take longer to draw, within bounds, and each
// node holds for a moment so the eye can read it before the next edge starts.
const EDGE_MS_PER_UNIT = 3.5
const EDGE_MIN_MS = 600
const EDGE_MAX_MS = 1500
const NODE_DWELL_MS = 500

// Without the geometry API (tests, very old browsers) scenarios show their whole path at once.
const canAnimate = typeof SVGPathElement !== 'undefined' && 'getTotalLength' in SVGPathElement.prototype

const pad = (value: number) => String(value).padStart(2, '0')
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const edgeStart = (d: string) => {
  const [, cx, cy] = /^M(\S+) (\S+)/.exec(d) ?? []
  return { cx: Number(cx), cy: Number(cy) }
}

function FlowNode({ node }: { node: FlowNodeSpec }) {
  if (node.type === 'decision') return <Decision cx={node.cx} cy={node.cy} w={node.w} h={node.h} label={node.title} />
  if (node.type === 'terminal') {
    return <Terminal cx={node.cx} y={node.y} w={node.w} title={node.title} note={node.note} outside={node.outside} />
  }
  return <Step x={node.x} y={node.y} w={node.w} title={node.title} note={node.note} kind={node.tint ? 'tint' : 'screen'} />
}

/**
 * The flow on its canvas, with scenario controls above it. Reduced motion skips
 * the autoplay and shows any chosen path whole.
 */
export function FlowPlayer({ spec, focusX }: { spec: FlowSpec; focusX?: number }) {
  const [playerRef, inView] = useInView<HTMLDivElement>()
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches),
  )
  // undefined until the viewer picks something; null is the full, unhighlighted flow.
  const [choice, setChoice] = useState<string | null | undefined>(undefined)
  const [step, setStep] = useState(0)
  const [run, setRun] = useState(0)
  const currentRef = useRef<SVGPathElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  const edgeById = new Map(spec.edges.map((edge) => [edge.id, edge]))
  const nodeTitle = new Map(spec.nodes.map((node) => [node.id, node.title]))
  const autoplay = spec.scenarios[0]?.id
  const activeId = choice === undefined ? (inView && !reducedMotion ? autoplay : null) : choice
  const scenario = spec.scenarios.find((item) => item.id === activeId)
  const instant = reducedMotion || !canAnimate
  const sequence = scenario?.edges
  const shownStep = sequence ? (instant ? sequence.length : step) : 0
  const playing = Boolean(sequence && shownStep < sequence.length)

  useEffect(() => {
    const path = currentRef.current
    const dot = dotRef.current
    if (!playing || !path || !dot) return

    const length = path.getTotalLength()
    const duration = Math.min(EDGE_MAX_MS, Math.max(EDGE_MIN_MS, length * EDGE_MS_PER_UNIT))
    path.style.strokeDasharray = `${length}`
    path.style.strokeDashoffset = `${length}`

    let frame = 0
    let dwell = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = easeInOut(t)
      path.style.strokeDashoffset = `${length * (1 - eased)}`
      const point = path.getPointAtLength(length * eased)
      dot.setAttribute('cx', `${point.x}`)
      dot.setAttribute('cy', `${point.y}`)
      if (t < 1) frame = requestAnimationFrame(tick)
      else dwell = window.setTimeout(() => setStep((value) => value + 1), NODE_DWELL_MS)
    }
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(dwell)
    }
  }, [playing, step, run])

  function play(id: string | null) {
    setChoice(id)
    setStep(0)
    setRun((value) => value + 1)
  }

  const litEdges = sequence ? sequence.slice(0, shownStep) : []
  const litNodes = new Set(scenario ? [scenario.start, ...litEdges.map((id) => edgeById.get(id)?.to ?? '')] : [])
  const currentNode = scenario
    ? (litEdges.length ? edgeById.get(litEdges[litEdges.length - 1])?.to : scenario.start)
    : undefined
  const currentEdge = playing && sequence ? edgeById.get(sequence[shownStep]) : undefined

  return (
    <>
      <div className="flow-player" ref={playerRef}>
        <div className="flow-player__scenarios" role="group" aria-label="Trace a scenario">
          <button type="button" aria-pressed={!scenario} onClick={() => play(null)}>Full flow</button>
          {spec.scenarios.map((item) => (
            <button type="button" key={item.id} aria-pressed={item.id === activeId} onClick={() => play(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        {/* Its own row with a fixed height, so Replay appearing never pushes the board down. */}
        <div className="flow-player__meta">
          <p className="flow-player__status" aria-live="polite">
            {scenario && sequence
              ? `${pad(shownStep)} / ${pad(sequence.length)} · ${nodeTitle.get(currentNode ?? scenario.start)}`
              : 'Pick a scenario to trace its path'}
          </p>
          {scenario && !playing && !instant && (
            <button type="button" className="flow-player__replay" onClick={() => play(scenario.id)}>Replay</button>
          )}
        </div>
      </div>

      <FlowCanvas width={spec.width} height={spec.height} label={spec.title} focusX={focusX}>
        <FlowSvg
          width={spec.width}
          height={spec.height}
          title={spec.title}
          desc={spec.desc}
          className={scenario ? 'is-scenario' : undefined}
        >
          {spec.backdrop}

          {spec.edges.map((edge) => <Edge key={edge.id} d={edge.d} end={edge.end} dashed={edge.dashed} />)}
          {litEdges.map((id) => {
            const edge = edgeById.get(id)
            return edge && <Edge key={`lit-${id}`} d={edge.d} end={edge.end} dashed={edge.dashed} lit />
          })}
          {/* Starts hidden; the effect sets the real dash length before the first frame draws it in. */}
          {currentEdge && (
            <path
              key={`${run}-${shownStep}`}
              ref={currentRef}
              className="flow-edge flow-edge--lit"
              d={currentEdge.d}
              style={{ strokeDasharray: '0 10000' }}
            />
          )}
          {spec.edges.map((edge) => edge.branch && (
            <Branch key={`branch-${edge.id}`} x={edge.branch.x} y={edge.branch.y} lit={litEdges.includes(edge.id)}>
              {edge.branch.text}
            </Branch>
          ))}

          {spec.nodes.map((node) => (
            <g
              key={node.id}
              className={`flow-node${litNodes.has(node.id) ? ' is-lit' : ''}${node.id === currentNode ? ' is-current' : ''}`}
            >
              <FlowNode node={node} />
            </g>
          ))}
          {currentEdge && <circle ref={dotRef} className="flow-dot" r={6} {...edgeStart(currentEdge.d)} />}

          {spec.legend}
        </FlowSvg>
      </FlowCanvas>
    </>
  )
}
