/*
 * The full Claimly product flow, drawn in diagram units for FlowCanvas.
 * Four stage columns run left to right; every hand-off between stages leaves a
 * decision's right corner and enters the next column's first step, so the
 * connectors never cross a node. Coordinates are hand-placed on a 4px grid.
 */

export const claimlyFlowSize = { width: 1120, height: 640 }

type StepKind = 'screen' | 'ai' | 'outside'

function Step({ x, y, title, note, kind = 'screen', w = 200 }: {
  x: number
  y: number
  title: string
  note?: string
  kind?: StepKind
  w?: number
}) {
  const h = note ? 56 : 44
  const cx = x + w / 2
  return (
    <g className={`flow-step flow-step--${kind}`}>
      <rect x={x} y={y} width={w} height={h} rx={10} />
      <text className="flow-title" x={cx} y={note ? y + 20 : y + h / 2}>{title}</text>
      {note && <text className="flow-note" x={cx} y={y + 38}>{note}</text>}
    </g>
  )
}

function Terminal({ cx, y, title, note, w = 180, outside = false }: {
  cx: number
  y: number
  title: string
  note?: string
  w?: number
  outside?: boolean
}) {
  const h = note ? 56 : 44
  return (
    <g className={`flow-terminal${outside ? ' flow-terminal--outside' : ''}`}>
      <rect x={cx - w / 2} y={y} width={w} height={h} rx={h / 2} />
      <text className="flow-title" x={cx} y={note ? y + 20 : y + h / 2}>{title}</text>
      {note && <text className="flow-note" x={cx} y={y + 38}>{note}</text>}
    </g>
  )
}

function Decision({ cx, cy, label, w = 150, h = 84 }: { cx: number; cy: number; label: string; w?: number; h?: number }) {
  const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`
  return (
    <g className="flow-decision">
      <polygon points={points} />
      <text className="flow-title" x={cx} y={cy}>{label}</text>
    </g>
  )
}

function Edge({ d, end = true }: { d: string; end?: boolean }) {
  return <path className="flow-edge" d={d} markerEnd={end ? 'url(#claimly-flow-arrow)' : undefined} />
}

function Branch({ x, y, children }: { x: number; y: number; children: string }) {
  return <text className="flow-branch" x={x} y={y}>{children}</text>
}

const stages = [
  { cx: 140, label: '01 Get the bill in' },
  { cx: 420, label: '02 Analyze' },
  { cx: 700, label: '03 Review' },
  { cx: 980, label: '04 Act' },
]

export function ClaimlyFlow() {
  return (
    <svg
      className="claimly-flow"
      viewBox={`0 0 ${claimlyFlowSize.width} ${claimlyFlowSize.height}`}
      role="img"
      aria-labelledby="claimly-flow-title"
      aria-describedby="claimly-flow-desc"
    >
      <title id="claimly-flow-title">Claimly interaction flow</title>
      <desc id="claimly-flow-desc">
        A bill comes in by PDF, camera or manual entry; an unreadable bill is retaken. Claimly reads the charges and
        codes, then checks them against the EOB and plan. With no mistake, the clean report ends in adding the bill to
        spending. With a mistake, the claim report opens on the flagged item, explains its codes, and offers an AI
        follow-up. A user who decides not to dispute pays and adds it to spending; one who disputes gets the appeal
        solution, copies the script, gathers evidence, and calls the insurer to ask for reprocessing.
      </desc>
      <defs>
        <marker
          id="claimly-flow-arrow"
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <path d="M0 0 L10 5 L0 10 z" />
        </marker>
      </defs>

      {stages.map((stage) => (
        <g className="flow-stage" key={stage.label}>
          <text x={stage.cx - 120} y={46}>{stage.label}</text>
          <line x1={stage.cx - 120} y1={62} x2={stage.cx + 120} y2={62} />
        </g>
      ))}

      {/* 01 Get the bill in */}
      <Terminal cx={140} y={88} w={160} title="Open Claimly" />
      <Edge d="M140 132 L140 160" />
      <Step x={40} y={160} title="Home" note="Pick how the bill arrives" />
      <Edge d="M140 216 L140 236 L64 236 L64 256" />
      <Edge d="M140 216 L140 256" />
      <Edge d="M140 236 L216 236 L216 256" />
      <Step x={30} y={256} w={68} title="PDF" />
      <Step x={106} y={256} w={68} title="Camera" />
      <Step x={182} y={256} w={68} title="Manual" />
      <Edge d="M64 300 L64 312 L140 312" end={false} />
      <Edge d="M216 300 L216 312 L140 312" end={false} />
      <Edge d="M140 300 L140 330" />
      <Decision cx={140} cy={372} w={140} label="Readable?" />
      <Edge d="M210 372 L290 372 L290 118 L320 118" />
      <Branch x={222} y={362}>Yes</Branch>
      <Edge d="M140 414 L140 450" />
      <Branch x={150} y={434}>No</Branch>
      <Step x={40} y={450} title="Retake or re-upload" />
      <Edge d="M40 472 L16 472 L16 188 L40 188" />

      {/* 02 Analyze */}
      <Step x={320} y={90} title="Bill analysis" note="Read charges and CPT codes" kind="ai" />
      <Edge d="M420 146 L420 186" />
      <Step x={320} y={186} title="EOB comparison" note="Match bill, EOB, and plan" kind="ai" />
      <Edge d="M420 242 L420 280" />
      <Decision cx={420} cy={322} label="Mistake found?" />
      <Edge d="M495 322 L570 322 L570 118 L600 118" />
      <Branch x={507} y={312}>Yes</Branch>
      <Edge d="M420 364 L420 404" />
      <Branch x={430} y={386}>No</Branch>
      <Step x={320} y={404} title="Clean report" note="Nothing looks off" />
      <Edge d="M420 460 L420 500" />
      <Terminal cx={420} y={500} title="Add to spending" />

      {/* 03 Review */}
      <Step x={600} y={90} title="Claim report" note="Flagged item listed first" />
      <Edge d="M700 146 L700 186" />
      <Step x={600} y={186} title="Code explanation" note="Split, codes, red flags" />
      <Edge d="M700 242 L700 282" />
      <Step x={600} y={282} title="Ask any question" note="Optional AI follow-up" kind="ai" />
      <Edge d="M700 338 L700 376" />
      <Decision cx={700} cy={418} label="Dispute it?" />
      <Edge d="M775 418 L850 418 L850 118 L880 118" />
      <Branch x={787} y={408}>Yes</Branch>
      <Edge d="M700 460 L700 522 L510 522" />
      <Branch x={710} y={482}>No, pay it</Branch>

      {/* 04 Act */}
      <Step x={880} y={90} title="Appeal solution" note="Script, evidence, deadline" />
      <Edge d="M980 146 L980 186" />
      <Step x={880} y={186} title="Copy the script" note="Or re-generate the wording" />
      <Edge d="M980 242 L980 282" />
      <Step x={880} y={282} title="Gather evidence" note="From the checklist" />
      <Edge d="M980 338 L980 378" />
      <Terminal cx={980} y={378} w={200} title="Call the insurer" note="Ask for reprocessing" outside />

      <g className="flow-legend">
        <rect className="flow-legend__screen" x={40} y={593} width={20} height={14} rx={4} />
        <text x={68} y={600}>Screen</text>
        <rect className="flow-legend__ai" x={140} y={593} width={20} height={14} rx={4} />
        <text x={168} y={600}>AI step</text>
        <polygon className="flow-legend__decision" points="260,592 272,600 260,608 248,600" />
        <text x={280} y={600}>Decision</text>
        <rect className="flow-legend__terminal" x={368} y={593} width={24} height={14} rx={7} />
        <text x={400} y={600}>Start or end</text>
        <rect className="flow-legend__outside" x={500} y={593} width={24} height={14} rx={7} />
        <text x={532} y={600}>Outside the app</text>
      </g>
    </svg>
  )
}
