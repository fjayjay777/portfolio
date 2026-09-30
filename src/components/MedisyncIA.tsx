import { Edge, FlowSvg, ScreenCard, screenCardHeight, Terminal, type ScreenRow } from './flowParts'

/*
 * Information architecture of the Medisync patient app, taken from the
 * prototype's routes: five bottom-navigation tabs, each with the detail
 * screens it opens stacked beneath it. Card heights come from their row
 * counts, so the layout below only fixes columns and starting rows.
 */

const CARD_W = 188
const column = (index: number) => 40 + index * 213
const center = (index: number) => column(index) + CARD_W / 2
const TAB_TOP = 116
const DETAIL_TOP = 346
const GAP = 28

type Screen = { title: string; index?: string; rows: ScreenRow[] }

const tabs: Screen[] = [
  {
    title: 'Home',
    index: '01',
    rows: [
      { label: 'Search' },
      { label: 'Next appointment', deeper: true },
      { label: 'Insurance amount left', deeper: true },
      { label: 'Health conditions' },
      { label: 'Medication taken' },
      { label: 'Heart rate monitor' },
    ],
  },
  {
    title: 'Explore',
    index: '02',
    rows: [{ label: 'Search services' }, { label: 'Specialties by category' }, { label: 'Dental', deeper: true }],
  },
  {
    title: 'Appointments',
    index: '03',
    rows: [{ label: 'Book new', deeper: true }, { label: 'Upcoming', deeper: true }, { label: 'Past' }],
  },
  {
    title: 'Files',
    index: '04',
    rows: [{ label: 'Filter by type' }, { label: 'Records list', deeper: true }],
  },
  {
    title: 'Profile',
    index: '05',
    rows: [{ label: 'Contact details' }, { label: 'Notifications' }, { label: 'Text size and motion' }],
  },
]

const insurance: Screen = {
  title: 'Insurance detail',
  rows: [
    { label: 'Plan and member ID' },
    { label: 'Balance and deductibles' },
    { label: 'Coverage details' },
    { label: 'Estimated remaining' },
    { label: 'Recent claims' },
  ],
}

// Explore's booking path runs four screens deep, so it stacks down its column.
const bookingPath: Screen[] = [
  {
    title: 'Dental search',
    rows: [{ label: 'Keyword, location, date' }, { label: 'Out-of-network toggle' }, { label: 'Search results', deeper: true }],
  },
  {
    title: 'Provider',
    index: '4 tabs',
    rows: [{ label: 'Overview' }, { label: 'Price review' }, { label: 'Appointment', deeper: true }, { label: 'Feedback' }],
  },
  { title: 'Book appointment', rows: [{ label: 'Service' }, { label: 'Date and time' }] },
  {
    title: 'Confirmation',
    rows: [{ label: 'Appointment summary' }, { label: 'Insurance information' }, { label: 'Previous records' }],
  },
]

const appointment: Screen = {
  title: 'Appointment detail',
  rows: [
    { label: 'Date, clinic, doctor' },
    { label: 'Message, call, directions' },
    { label: 'Pre-fill forms' },
    { label: 'Personal info, insurance' },
    { label: 'Reschedule or cancel' },
  ],
}

const file: Screen = { title: 'File detail', rows: [{ label: 'Category, date, provider' }] }

const bookingTops: number[] = [DETAIL_TOP]
const bookingBottom = (i: number) => bookingTops[i] + screenCardHeight(bookingPath[i].rows)
for (let i = 1; i < bookingPath.length; i++) bookingTops.push(bookingBottom(i - 1) + GAP)
const last = bookingPath.length - 1
const appointmentBottom = DETAIL_TOP + screenCardHeight(appointment.rows)
// The confirmed booking's cross-link leaves the confirmation card at its middle.
const linkY = (bookingTops[last] + bookingBottom(last)) / 2
const legendY = bookingBottom(last) + 44

export const medisyncIASize = { width: 1120, height: legendY + 30 }

const medisyncIADesc =
  'The patient app has five tabs in its bottom navigation: Home, Explore, Appointments, Files, and Profile. Home ' +
  'opens the insurance detail. Explore leads four screens deep, from dental search to a provider with overview, ' +
  'price review, appointment, and feedback tabs, then booking and confirmation; a confirmed booking lands in ' +
  'Upcoming under Appointments, which opens the appointment detail. Files opens a file detail.'

function Card({ screen, col, top, kind }: { screen: Screen; col: number; top: number; kind?: 'tab' | 'detail' }) {
  return <ScreenCard x={column(col)} y={top} w={CARD_W} kind={kind} {...screen} />
}

/** A tree connector from the bottom of one card to the top of the next in the same column. */
function Drop({ col, from, to }: { col: number; from: number; to: number }) {
  return <Edge d={`M${center(col)} ${from} L${center(col)} ${to}`} end={false} />
}

export function MedisyncIA() {
  const tabBottom = (col: number) => TAB_TOP + screenCardHeight(tabs[col].rows)

  return (
    <FlowSvg {...medisyncIASize} title="Medisync information architecture" desc={medisyncIADesc}>

      <Terminal cx={center(2)} y={36} w={220} title="Medisync patient app" />
      <g className="flow-phase">
        <text x={40} y={84}>Bottom navigation</text>
      </g>
      <Edge d={`M${center(2)} 80 L${center(2)} 96`} end={false} />
      <Edge d={`M${center(0)} 96 L${center(4)} 96`} end={false} />
      {tabs.map((tab, col) => (
        <g key={tab.title}>
          <Edge d={`M${center(col)} 96 L${center(col)} ${TAB_TOP}`} end={false} />
          <Card screen={tab} col={col} top={TAB_TOP} kind="tab" />
        </g>
      ))}

      <Drop col={0} from={tabBottom(0)} to={DETAIL_TOP} />
      <Card screen={insurance} col={0} top={DETAIL_TOP} />

      <Drop col={1} from={tabBottom(1)} to={DETAIL_TOP} />
      {bookingPath.map((screen, i) => (
        <g key={screen.title}>
          {i > 0 && <Drop col={1} from={bookingBottom(i - 1)} to={bookingTops[i]} />}
          <Card screen={screen} col={1} top={bookingTops[i]} />
        </g>
      ))}

      <Drop col={2} from={tabBottom(2)} to={DETAIL_TOP} />
      <Card screen={appointment} col={2} top={DETAIL_TOP} />
      <Edge d={`M${column(1) + CARD_W} ${linkY} L${center(2)} ${linkY} L${center(2)} ${appointmentBottom}`} dashed />
      <text className="flow-branch" x={center(2) + 10} y={(linkY + appointmentBottom) / 2}>Lands in Upcoming</text>

      <Drop col={3} from={tabBottom(3)} to={DETAIL_TOP} />
      <Card screen={file} col={3} top={DETAIL_TOP} />

      <g className="flow-legend">
        <rect className="flow-legend__tint" x={40} y={legendY - 7} width={20} height={14} rx={4} />
        <text x={68} y={legendY}>Tab screen</text>
        <rect className="flow-legend__screen" x={160} y={legendY - 7} width={20} height={14} rx={4} />
        <text x={188} y={legendY}>Detail screen</text>
        <text className="ia-card__deeper" x={296} y={legendY}>›</text>
        <text x={306} y={legendY}>Opens a deeper screen</text>
        <line className="flow-edge flow-edge--dashed" x1={470} y1={legendY} x2={500} y2={legendY} />
        <text x={510} y={legendY}>Cross-link</text>
      </g>
    </FlowSvg>
  )
}
