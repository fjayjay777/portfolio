import type { FlowEdgeSpec, FlowNodeSpec, FlowScenario, FlowSpec } from './FlowPlayer'

/*
 * The full Claimly product flow, drawn in diagram units for FlowPlayer.
 * Four stage columns run left to right; every hand-off between stages leaves a
 * decision's right corner and enters the next column's first step, so the
 * connectors never cross a node. Coordinates are hand-placed on a 4px grid.
 */

const claimlyFlowDesc =
  'A bill comes in by PDF, camera or manual entry; an unreadable bill is retaken. Claimly reads the charges and ' +
  'codes, then checks them against the EOB and plan. With no mistake, the clean report ends in adding the bill to ' +
  'spending. With a mistake, the claim report opens on the flagged item, explains its codes, and offers an AI ' +
  'follow-up. A user who decides not to dispute pays and adds it to spending; one who disputes gets the appeal ' +
  'solution, copies the script, gathers evidence, and calls the insurer to ask for reprocessing.'

const stages = [
  { cx: 140, label: '01 Get the bill in' },
  { cx: 420, label: '02 Analyze' },
  { cx: 700, label: '03 Review' },
  { cx: 980, label: '04 Act' },
]

const nodes: FlowNodeSpec[] = [
  // 01 Get the bill in
  { id: 'start', type: 'terminal', cx: 140, y: 88, w: 160, title: 'Open Claimly' },
  { id: 'home', type: 'step', x: 40, y: 160, title: 'Home', note: 'Pick how the bill arrives' },
  { id: 'pdf', type: 'step', x: 30, y: 256, w: 68, title: 'PDF' },
  { id: 'camera', type: 'step', x: 106, y: 256, w: 68, title: 'Camera' },
  { id: 'manual', type: 'step', x: 182, y: 256, w: 68, title: 'Manual' },
  { id: 'readable', type: 'decision', cx: 140, cy: 372, w: 140, title: 'Readable?' },
  { id: 'retake', type: 'step', x: 40, y: 450, title: 'Retake or re-upload' },
  // 02 Analyze
  { id: 'bill', type: 'step', x: 320, y: 90, title: 'Bill analysis', note: 'Read charges and CPT codes', tint: true },
  { id: 'eob', type: 'step', x: 320, y: 186, title: 'EOB comparison', note: 'Match bill, EOB, and plan', tint: true },
  { id: 'mistake', type: 'decision', cx: 420, cy: 322, title: 'Mistake found?' },
  { id: 'clean', type: 'step', x: 320, y: 404, title: 'Clean report', note: 'Nothing looks off' },
  { id: 'spending', type: 'terminal', cx: 420, y: 500, title: 'Add to spending' },
  // 03 Review
  { id: 'report', type: 'step', x: 600, y: 90, title: 'Claim report', note: 'Flagged item listed first' },
  { id: 'explain', type: 'step', x: 600, y: 186, title: 'Code explanation', note: 'Split, codes, red flags' },
  { id: 'ask', type: 'step', x: 600, y: 282, title: 'Ask any question', note: 'Optional AI follow-up', tint: true },
  { id: 'dispute', type: 'decision', cx: 700, cy: 418, title: 'Dispute it?' },
  // 04 Act
  { id: 'appeal', type: 'step', x: 880, y: 90, title: 'Appeal solution', note: 'Script, evidence, deadline' },
  { id: 'copy', type: 'step', x: 880, y: 186, title: 'Copy the script', note: 'Or re-generate the wording' },
  { id: 'evidence', type: 'step', x: 880, y: 282, title: 'Gather evidence', note: 'From the checklist' },
  { id: 'call', type: 'terminal', cx: 980, y: 378, w: 200, title: 'Call the insurer', note: 'Ask for reprocessing', outside: true },
]

const edges: FlowEdgeSpec[] = [
  { id: 'start-home', d: 'M140 132 L140 160', to: 'home' },
  { id: 'home-pdf', d: 'M140 216 L140 236 L64 236 L64 256', to: 'pdf' },
  { id: 'home-camera', d: 'M140 216 L140 256', to: 'camera' },
  { id: 'home-manual', d: 'M140 236 L216 236 L216 256', to: 'manual' },
  { id: 'pdf-join', d: 'M64 300 L64 312 L140 312', end: false },
  { id: 'manual-join', d: 'M216 300 L216 312 L140 312', end: false },
  { id: 'camera-readable', d: 'M140 300 L140 330', to: 'readable' },
  { id: 'readable-yes', d: 'M210 372 L290 372 L290 118 L320 118', to: 'bill', branch: { x: 222, y: 362, text: 'Yes' } },
  { id: 'readable-no', d: 'M140 414 L140 450', to: 'retake', branch: { x: 150, y: 434, text: 'No' } },
  { id: 'retake-home', d: 'M40 472 L16 472 L16 188 L40 188', to: 'home' },
  { id: 'bill-eob', d: 'M420 146 L420 186', to: 'eob' },
  { id: 'eob-mistake', d: 'M420 242 L420 280', to: 'mistake' },
  { id: 'mistake-yes', d: 'M495 322 L570 322 L570 118 L600 118', to: 'report', branch: { x: 507, y: 312, text: 'Yes' } },
  { id: 'mistake-no', d: 'M420 364 L420 404', to: 'clean', branch: { x: 430, y: 386, text: 'No' } },
  { id: 'clean-spending', d: 'M420 460 L420 500', to: 'spending' },
  { id: 'report-explain', d: 'M700 146 L700 186', to: 'explain' },
  { id: 'explain-ask', d: 'M700 242 L700 282', to: 'ask' },
  { id: 'ask-dispute', d: 'M700 338 L700 376', to: 'dispute' },
  { id: 'dispute-yes', d: 'M775 418 L850 418 L850 118 L880 118', to: 'appeal', branch: { x: 787, y: 408, text: 'Yes' } },
  { id: 'dispute-no', d: 'M700 460 L700 522 L510 522', to: 'spending', branch: { x: 710, y: 482, text: 'No, pay it' } },
  { id: 'appeal-copy', d: 'M980 146 L980 186', to: 'copy' },
  { id: 'copy-evidence', d: 'M980 242 L980 282', to: 'evidence' },
  { id: 'evidence-call', d: 'M980 338 L980 378', to: 'call' },
]

// Scenarios share their opening edges; the camera stands in for all three intake options.
const intake = ['start-home', 'home-camera', 'camera-readable']
const analysis = [...intake, 'readable-yes', 'bill-eob', 'eob-mistake']
const review = [...analysis, 'mistake-yes', 'report-explain', 'explain-ask', 'ask-dispute']

const scenarios: FlowScenario[] = [
  { id: 'dispute', label: 'Dispute a charge', start: 'start', edges: [...review, 'dispute-yes', 'appeal-copy', 'copy-evidence', 'evidence-call'] },
  { id: 'clean', label: 'No errors found', start: 'start', edges: [...analysis, 'mistake-no', 'clean-spending'] },
  { id: 'pay', label: 'Pay without disputing', start: 'start', edges: [...review, 'dispute-no'] },
  { id: 'retake', label: 'Unreadable scan', start: 'start', edges: [...intake, 'readable-no', 'retake-home'] },
]

export const claimlyFlow: FlowSpec = {
  width: 1120,
  height: 640,
  title: 'Claimly interaction flow',
  desc: claimlyFlowDesc,
  nodes,
  edges,
  scenarios,
  backdrop: stages.map((stage) => (
    <g className="flow-stage" key={stage.label}>
      <text x={stage.cx - 120} y={46}>{stage.label}</text>
      <line x1={stage.cx - 120} y1={62} x2={stage.cx + 120} y2={62} />
    </g>
  )),
  legend: (
    <g className="flow-legend">
      <rect className="flow-legend__screen" x={40} y={593} width={20} height={14} rx={4} />
      <text x={68} y={600}>Screen</text>
      <rect className="flow-legend__tint" x={140} y={593} width={20} height={14} rx={4} />
      <text x={168} y={600}>AI step</text>
      <polygon className="flow-legend__decision" points="260,592 272,600 260,608 248,600" />
      <text x={280} y={600}>Decision</text>
      <rect className="flow-legend__terminal" x={368} y={593} width={24} height={14} rx={7} />
      <text x={400} y={600}>Start or end</text>
      <rect className="flow-legend__outside" x={500} y={593} width={24} height={14} rx={7} />
      <text x={532} y={600}>Outside the app</text>
    </g>
  ),
}
