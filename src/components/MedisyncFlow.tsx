import { Branch, Decision, Edge, FlowSvg, Step, Terminal } from './flowParts'

/*
 * The full Medisync flow as swimlanes: watch, patient app, shared record and
 * clinic system, with time running down. The watch sits on the far side of the
 * patient from the clinic, so its data can only reach a doctor by crossing the
 * patient's lane — the consent rule, drawn as layout. All data between the
 * patient and the clinic goes through the record lane; the one dashed edge
 * that skips it is the patient arriving in person.
 */

export const medisyncFlowSize = { width: 1120, height: 1180 }

const medisyncFlowDesc =
  'Swimlanes for the watch, the patient app, the shared record and the clinic system. The patient finds a clinic, ' +
  'reviews prices, picks a service and time, and confirms; the booking goes into the shared record with insurance ' +
  'and history, so the clinic receives it without a blank intake form. After the visit the clinic writes a ' +
  'summary to the record and the patient sees it in Files. Between visits the watch measures heart rate; a normal ' +
  'reading is logged to Home, an abnormal one alerts the patient first, and only if the patient agrees is it ' +
  'shared to the record for the doctor to review.'

const lanes = [
  { label: 'Watch', x0: 20, x1: 250 },
  { label: 'Patient app', x0: 270, x1: 570 },
  { label: 'Shared record', x0: 590, x1: 790 },
  { label: 'Clinic system', x0: 810, x1: 1100 },
]

const phases = [
  { y: 66, label: '01 Find and book' },
  { y: 566, label: '02 Visit' },
  { y: 758, label: '03 Between visits' },
]

export function MedisyncFlow() {
  return (
    <FlowSvg {...medisyncFlowSize} title="Medisync interaction flow" desc={medisyncFlowDesc}>

      <rect className="flow-band" x={590} y={66} width={200} height={1062} rx={12} />
      {lanes.map((lane) => (
        <g className="flow-lane" key={lane.label}>
          <text x={(lane.x0 + lane.x1) / 2} y={42}>{lane.label}</text>
          <line x1={lane.x0} y1={56} x2={lane.x1} y2={56} />
        </g>
      ))}
      {[260, 580, 800].map((x) => <line className="flow-divider" key={x} x1={x} y1={28} x2={x} y2={1128} />)}
      {phases.map((phase, index) => (
        <g className="flow-phase" key={phase.label}>
          {index > 0 && <line x1={20} y1={phase.y} x2={1100} y2={phase.y} />}
          <text x={32} y={phase.y + 18}>{phase.label}</text>
        </g>
      ))}

      {/* 01 Find and book */}
      <Terminal cx={420} y={84} w={170} title="Open Medisync" />
      <Edge d="M420 128 L420 152" />
      <Step x={320} y={152} title="Find a clinic" note="Slots, distance, network" />
      <Edge d="M420 208 L420 232" />
      <Step x={320} y={232} title="Price review" note="Estimates with caveats" />
      <Edge d="M420 288 L420 312" />
      <Step x={320} y={312} title="Pick service and time" />
      <Edge d="M420 356 L420 380" />
      <Decision cx={420} cy={420} w={140} h={80} label="All chosen?" />
      <Edge d="M350 420 L292 420 L292 334 L320 334" />
      <Branch x={300} y={434}>No</Branch>
      <Edge d="M420 460 L420 484" />
      <Branch x={428} y={472}>Yes</Branch>
      <Step x={320} y={484} title="Confirm booking" note="Insurance, records attached" />
      <Edge d="M520 512 L605 512" />
      <Step x={605} y={484} w={170} title="Booking record" note="Insurance, history" kind="tint" />
      <Edge d="M775 512 L855 512" />
      <Step x={855} y={484} title="Booking arrives" note="No blank intake form" />

      {/* 02 Visit */}
      <Edge d="M420 540 L420 598" />
      <Step x={320} y={598} title="Upcoming visit" note="Forms, reschedule, cancel" />
      <Edge d="M955 540 L955 598" />
      <Edge d="M520 626 L855 626" dashed />
      <Branch x={656} y={616}>In person</Branch>
      <Step x={855} y={598} title="Care team reviews" note="History already there" />
      <Edge d="M955 654 L955 678" />
      <Step x={855} y={678} title="Write visit summary" note="After the visit" />
      <Edge d="M855 706 L775 706" />
      <Step x={605} y={678} w={170} title="Visit summary" note="Added to history" kind="tint" />
      <Edge d="M605 706 L520 706" />
      <Step x={320} y={678} title="Files" note="Summary, lab results" />

      {/* 03 Between visits */}
      <Step x={45} y={796} w={180} title="Heart-rate reading" note="Measured all day" />
      <Edge d="M135 852 L135 876" />
      <Decision cx={135} cy={916} w={140} h={80} label="Abnormal?" />
      <Edge d="M135 956 L135 980" />
      <Branch x={143} y={968}>No</Branch>
      <Step x={45} y={980} w={180} title="Logged to Home" />
      <Edge d="M205 916 L320 916" />
      <Branch x={217} y={906}>Yes</Branch>
      <Step x={320} y={888} title="Alert, patient first" note="Nothing sent yet" />
      <Edge d="M420 944 L420 968" />
      <Decision cx={420} cy={1008} w={170} h={80} label="Share with doctor?" />
      <Edge d="M420 1048 L420 1072" />
      <Branch x={428} y={1060}>No</Branch>
      <Terminal cx={420} y={1072} w={160} title="Stays private" />
      <Edge d="M505 1008 L605 1008" />
      <Branch x={517} y={998}>Yes</Branch>
      <Step x={605} y={980} w={170} title="Shared reading" note="Patient consented" kind="tint" />
      <Edge d="M775 1008 L855 1008" />
      <Step x={855} y={980} title="Doctor reviews" note="Tracks recovery" />

      <g className="flow-legend">
        <rect className="flow-legend__screen" x={40} y={1143} width={20} height={14} rx={4} />
        <text x={68} y={1150}>Screen or step</text>
        <rect className="flow-legend__tint" x={190} y={1143} width={20} height={14} rx={4} />
        <text x={218} y={1150}>Record entry</text>
        <polygon className="flow-legend__decision" points="330,1142 342,1150 330,1158 318,1150" />
        <text x={350} y={1150}>Decision</text>
        <rect className="flow-legend__terminal" x={430} y={1143} width={24} height={14} rx={7} />
        <text x={462} y={1150}>Start or end</text>
      </g>
    </FlowSvg>
  )
}
