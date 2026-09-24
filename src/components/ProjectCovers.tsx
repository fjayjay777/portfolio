import doctor from '../assets/medisync/brand/booking-guide.png'
import hospital from '../assets/medisync/brand/national-central-hospital.jpg'
import banana from '../assets/sizzle/brand/banana.svg'
import blueberries from '../assets/sizzle/brand/blueberries.svg'
import egg from '../assets/sizzle/brand/egg.svg'
import waffles from '../assets/sizzle/brand/blueberry-banana-waffles.jpg'
import { PILLOW, profileHeight } from '../nighty/shape'

/*
 * Homepage cover art. Each one tells the product's idea with pieces of its own
 * brand (palette, type, mascot or imagery) rather than a screenshot of a screen.
 * Colors are lifted from each app's theme tokens, so they are hard-coded here.
 */

type EdgeProps = { x: number; y: number; w: number; h: number; r: number; tint: string }

/**
 * A one-pixel ring drawn just outside a card, so white cards read against the
 * tinted panel without a drop shadow; the homepage is deliberately flat.
 */
function Edge({ x, y, w, h, r, tint }: EdgeProps) {
  return <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} rx={r + 1} fill={tint} opacity=".12" />
}

const coverProps = {
  viewBox: '0 0 560 320',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
  focusable: false,
} as const

/* Claimly ---------------------------------------------------------------- */

const claimly = {
  blue: '#3F85FF',
  blueSoft: '#AFCBFF',
  risk: '#FF6268',
  riskSoft: '#FFC0B9',
  ink: '#151718',
  body: '#313538',
  rule: '#ECECEC',
  shadow: '#1d3a6e',
  font: 'Poppins, sans-serif',
}

/** Claimly's flower mascot: blue when all is well, coral when it spots a risk. */
function ClaimlyMascot({ cx, cy, r, tone }: { cx: number; cy: number; r: number; tone: 'welcome' | 'warning' }) {
  const lobes = tone === 'welcome' ? 6 : 5
  const fill = tone === 'welcome' ? claimly.blue : claimly.risk
  const eye = r * 0.15
  return (
    <g>
      {Array.from({ length: lobes }, (_, i) => {
        const angle = (-90 + (360 / lobes) * i) * (Math.PI / 180)
        return <circle key={i} cx={cx + Math.cos(angle) * r * 0.5} cy={cy + Math.sin(angle) * r * 0.5} r={r * 0.52} fill={fill} />
      })}
      <circle cx={cx} cy={cy} r={r * 0.62} fill={fill} />
      {[-1, 1].map((side) => (
        <g key={side}>
          <circle cx={cx + side * r * 0.2} cy={cy - r * 0.04} r={eye} fill="#fff" />
          <circle cx={cx + side * r * 0.2 + eye * 0.25} cy={cy - r * 0.04 - eye * 0.2} r={eye * 0.62} fill={claimly.ink} />
        </g>
      ))}
      {tone === 'welcome' ? (
        <path d={`M${cx - r * 0.07} ${cy + r * 0.16}q${r * 0.07} ${r * 0.08} ${r * 0.14} 0`} stroke={claimly.ink} strokeWidth={r * 0.045} strokeLinecap="round" />
      ) : (
        <ellipse cx={cx} cy={cy + r * 0.2} rx={r * 0.05} ry={r * 0.065} fill={claimly.ink} />
      )}
    </g>
  )
}

export function ClaimlyCover() {
  const text = { fontFamily: claimly.font }
  const lines: [string, string][] = [['Office visit', '$85.00'], ['Lab panel', '$42.00']]
  return (
    <svg className="project-cover" {...coverProps}>
      <circle cx="280" cy="160" r="142" fill="#fff" fillOpacity=".5" />

      {/* The drafted appeal, ready to send */}
      <g transform="rotate(6 405 135)">
        <Edge x={330} y={40} w={150} h={186} r={16} tint={claimly.shadow} />
        <rect x="330" y="40" width="150" height="186" rx="16" fill="#fff" />
        <text x="348" y="70" {...text} fontSize="12" fontWeight="700" fill={claimly.ink}>Appeal letter</text>
        {[112, 96, 118, 84, 106].map((width, i) => (
          <rect key={i} x="348" y={86 + i * 14} width={width} height="6" rx="3" fill={claimly.rule} />
        ))}
        <rect x="348" y="180" width="114" height="28" rx="14" fill={claimly.blue} />
        <text x="405" y="198" {...text} fontSize="11" fontWeight="600" fill="#fff" textAnchor="middle">Send appeal</text>
      </g>

      {/* The bill, with the charge Claimly flagged */}
      <g transform="rotate(-4 220 160)">
        <Edge x={120} y={36} w={200} h={236} r={18} tint={claimly.shadow} />
        <rect x="120" y="36" width="200" height="236" rx="18" fill="#fff" />
        <text x="140" y="68" {...text} fontSize="15" fontWeight="700" fill={claimly.ink}>Medical bill</text>
        <rect x="140" y="78" width="72" height="6" rx="3" fill={claimly.rule} />
        {lines.map(([item, amount], i) => (
          <g key={item} {...text} fontSize="11" fill={claimly.body}>
            <text x="140" y={108 + i * 24}>{item}</text>
            <text x="300" y={108 + i * 24} textAnchor="end">{amount}</text>
          </g>
        ))}
        <rect x="130" y="144" width="180" height="56" rx="12" fill="#FFF3F1" stroke={claimly.riskSoft} />
        <text x="140" y="165" {...text} fontSize="11" fontWeight="600" fill={claimly.ink}>Chest X-ray</text>
        <text x="300" y="165" {...text} fontSize="11" fontWeight="600" fill={claimly.ink} textAnchor="end">$120.00</text>
        <rect x="140" y="174" width="92" height="18" rx="9" fill={claimly.riskSoft} />
        <text x="186" y="186.5" {...text} fontSize="9" fontWeight="600" fill={claimly.ink} textAnchor="middle">1 risk detected</text>
        <text x="140" y="222" {...text} fontSize="11" fill={claimly.body}>Pharmacy</text>
        <text x="300" y="222" {...text} fontSize="11" fill={claimly.body} textAnchor="end">$18.00</text>
        <path d="M140 234h160" stroke={claimly.rule} strokeWidth="1.5" />
        <text x="140" y="256" {...text} fontSize="12" fontWeight="700" fill={claimly.ink}>Total</text>
        <text x="300" y="256" {...text} fontSize="12" fontWeight="700" fill={claimly.ink} textAnchor="end">$265.00</text>
      </g>

      {/* Who pays what, in Claimly's two-tone portion bar */}
      <g>
        <Edge x={52} y={198} w={150} h={74} r={16} tint={claimly.shadow} />
        <rect x="52" y="198" width="150" height="74" rx="16" fill="#fff" />
        <text x="68" y="220" {...text} fontSize="10" fontWeight="600" fill={claimly.ink}>Your portion</text>
        <rect x="68" y="230" width="118" height="10" rx="5" fill={claimly.blueSoft} />
        <rect x="112" y="230" width="74" height="10" rx="5" fill={claimly.blue} />
        <circle cx="72" cy="256" r="4" fill={claimly.blueSoft} />
        <text x="80" y="259" {...text} fontSize="9" fill={claimly.body}>Insurance</text>
        <circle cx="138" cy="256" r="4" fill={claimly.blue} />
        <text x="146" y="259" {...text} fontSize="9" fill={claimly.body}>You</text>
      </g>

      <ClaimlyMascot cx={318} cy={136} r={24} tone="warning" />
      <ClaimlyMascot cx={462} cy={256} r={40} tone="welcome" />
    </svg>
  )
}

/* Medisync --------------------------------------------------------------- */

const medisync = {
  sage: '#7f9062',
  sageDark: '#586b3b',
  lime: '#e4eeb3',
  limeStrong: '#dbeaa0',
  ink: '#171a17',
  muted: '#687068',
  line: '#e9ece7',
  shadow: '#27331a',
  font: 'Inter, sans-serif',
}

export function MedisyncCover() {
  const text = { fontFamily: medisync.font }
  return (
    <svg className="project-cover" {...coverProps}>
      <defs>
        <clipPath id="medisync-clinic"><rect x="110" y="44" width="58" height="58" rx="12" /></clipPath>
      </defs>
      <circle cx="444" cy="182" r="100" fill={medisync.limeStrong} />
      <circle cx="444" cy="182" r="128" stroke="#fff" strokeOpacity=".9" />

      {/* Medisync's guide, the doctor from the booking flow */}
      <image href={doctor} x="350" y="72" width="189" height="249" />

      {/* A care option being compared, with a second one stacked behind */}
      <g transform="rotate(-4 200 80)">
        <rect x="112" y="24" width="200" height="84" rx="18" fill="#fff" fillOpacity=".55" transform="rotate(-5 212 66)" />
        <g>
          <Edge x={98} y={32} w={214} h={82} r={18} tint={medisync.shadow} />
          <rect x="98" y="32" width="214" height="82" rx="18" fill="#fff" />
          <image href={hospital} x="110" y="44" width="87" height="58" preserveAspectRatio="xMidYMid slice" clipPath="url(#medisync-clinic)" />
          <text x="182" y="64" {...text} fontSize="12" fontWeight="600" fill={medisync.ink}>National Central</text>
          <text x="182" y="80" {...text} fontSize="10" fill={medisync.muted}>Hospital · 1.2 mi</text>
          <rect x="182" y="88" width="50" height="18" rx="9" fill="#f4f5f2" />
          <text x="207" y="100.5" {...text} fontSize="10" fontWeight="600" fill={medisync.ink} textAnchor="middle">$120</text>
          <rect x="238" y="88" width="62" height="18" rx="9" fill={medisync.lime} />
          <text x="269" y="100.5" {...text} fontSize="9" fontWeight="600" fill={medisync.sageDark} textAnchor="middle">In network</text>
        </g>
      </g>

      {/* The booked appointment */}
      <g>
        <Edge x={64} y={128} w={258} h={152} r={22} tint={medisync.shadow} />
        <rect x="64" y="128" width="258" height="152" rx="22" fill="#fff" />
        <text x="86" y="156" {...text} fontSize="9" fontWeight="700" letterSpacing="1.4" fill={medisync.sageDark}>NEXT APPOINTMENT</text>
        <text x="86" y="182" {...text} fontSize="17" fontWeight="700" letterSpacing="-.3" fill={medisync.ink}>Annual Check-up</text>
        <text x="86" y="204" {...text} fontSize="12" fontWeight="600" fill={medisync.ink}>Aug 28 · 10:30 AM</text>
        <text x="86" y="222" {...text} fontSize="11" fill={medisync.muted}>at City General Hospital</text>
        <rect x="86" y="238" width="112" height="26" rx="13" fill={medisync.lime} />
        <path d="M102 256h10m-8.5 0v-4.5a3.5 3.5 0 0 1 7 0v4.5m-4.8 2.2a1.4 1.4 0 0 0 2.6 0" stroke="#2c3a1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="118" y="255" {...text} fontSize="11" fontWeight="600" fill="#2c3a1c">Reminder on</text>
        <circle cx="294" cy="154" r="14" fill={medisync.sageDark} />
        <path d="m287.5 154 4.5 4.5 8.5-9" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* What insurance still covers */}
      <g>
        <Edge x={336} y={258} w={164} h={44} r={14} tint={medisync.shadow} />
        <rect x="336" y="258" width="164" height="44" rx="14" fill="#fff" />
        <text x="350" y="276" {...text} fontSize="10" fontWeight="600" fill={medisync.ink}>Coverage left</text>
        <text x="486" y="276" {...text} fontSize="10" fontWeight="700" fill={medisync.ink} textAnchor="end">$1,650</text>
        <rect x="350" y="284" width="136" height="6" rx="3" fill={medisync.line} />
        <rect x="350" y="284" width="80" height="6" rx="3" fill="#c7d98a" />
      </g>
    </svg>
  )
}

/* Sizzle ----------------------------------------------------------------- */

const sizzle = {
  apricot: '#f7c59f',
  apricotSoft: '#fde3cf',
  sage: '#a7b9a0',
  sageSoft: '#e5ece1',
  sageText: '#3e5238',
  charcoal: '#282621',
  brown: '#875332',
  star: '#e59343',
  muted: '#756f66',
  border: '#e6ddd0',
  shadow: '#3e3022',
  font: 'Inter, sans-serif',
}

function Star({ x, y }: { x: number; y: number }) {
  return <path transform={`translate(${x} ${y})`} d="m5 0 1.5 3.2 3.5.4-2.6 2.4.7 3.5L5 7.8 1.9 9.5l.7-3.5L0 3.6l3.5-.4z" fill={sizzle.star} />
}

export function SizzleCover() {
  const text = { fontFamily: sizzle.font }
  // What's in the fridge, flowing into one recipe.
  const fridge = [
    { src: egg, cx: 108, cy: 92, w: 44, h: 24 },
    { src: banana, cx: 72, cy: 176, w: 36, h: 31 },
    { src: blueberries, cx: 122, cy: 250, w: 32, h: 29 },
  ]
  return (
    <svg className="project-cover" {...coverProps}>
      <defs>
        <clipPath id="sizzle-photo"><rect x="222" y="36" width="164" height="132" rx="16" /></clipPath>
      </defs>
      <circle cx="290" cy="160" r="142" fill="#fff" fillOpacity=".45" />

      <text x="52" y="46" {...text} fontSize="9" fontWeight="700" letterSpacing="1.6" fill={sizzle.brown}>IN YOUR FRIDGE</text>
      {fridge.map(({ src, cx, cy, w, h }) => (
        <g key={src}>
          <path d={`M${cx + 30} ${cy}C${cx + 70} ${cy} 180 160 214 160`} stroke={sizzle.star} strokeWidth="2.2" strokeLinecap="round" strokeDasharray="1 7" />
          <Edge x={cx - 30} y={cy - 30} w={60} h={60} r={30} tint={sizzle.shadow} />
          <circle cx={cx} cy={cy} r="30" fill="#fff" stroke={sizzle.border} />
          <image href={src} x={cx - w / 2} y={cy - h / 2} width={w} height={h} />
        </g>
      ))}

      {/* The recipe it adds up to */}
      <g transform="rotate(3 304 156)">
        <Edge x={214} y={28} w={180} h={258} r={22} tint={sizzle.shadow} />
        <rect x="214" y="28" width="180" height="258" rx="22" fill="#fff" stroke={sizzle.border} />
        <image href={waffles} x="222" y="36" width="164" height="132" preserveAspectRatio="xMidYMid slice" clipPath="url(#sizzle-photo)" />
        <rect x="232" y="46" width="72" height="22" rx="11" fill="#fffaf1" />
        <text x="268" y="61" {...text} fontSize="10" fontWeight="700" fill={sizzle.charcoal} textAnchor="middle">Breakfast</text>
        <text x="232" y="194" {...text} fontSize="15" fontWeight="700" letterSpacing="-.4" fill={sizzle.charcoal}>Blueberry Banana</text>
        <text x="232" y="212" {...text} fontSize="15" fontWeight="700" letterSpacing="-.4" fill={sizzle.charcoal}>Waffles</text>
        <circle cx="237" cy="231" r="5" stroke={sizzle.muted} strokeWidth="1.2" />
        <path d="M237 228.5v2.5l1.6 1.2" stroke={sizzle.muted} strokeWidth="1.2" strokeLinecap="round" />
        <text x="247" y="234.5" {...text} fontSize="10" fill={sizzle.muted}>25 min</text>
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} x={232 + i * 13} y={250} />)}
        <text x="300" y="259" {...text} fontSize="10" fontWeight="600" fill={sizzle.charcoal}>4.8</text>
        <circle cx="366" cy="254" r="15" fill="#fff0e8" />
        <path d="M361.5 247.5h9v14l-4.5-3.2-4.5 3.2z" fill="#a84c1e" />
      </g>

      {/* Picked for your taste */}
      <g>
        <Edge x={392} y={40} w={124} h={32} r={16} tint={sizzle.shadow} />
        <rect x="392" y="40" width="124" height="32" rx="16" fill={sizzle.sageSoft} />
        <circle cx="412" cy="56" r="7" stroke={sizzle.sageText} strokeWidth="1.5" />
        <path d="m408.8 56 2.2 2.2 4-4.2" stroke={sizzle.sageText} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="426" y="60" {...text} fontSize="12" fontWeight="700" fill={sizzle.sageText}>92% match</text>
      </g>

      {/* Planned into the week */}
      <g>
        <Edge x={416} y={100} w={112} h={124} r={18} tint={sizzle.shadow} />
        <rect x="416" y="100" width="112" height="124" rx="18" fill="#fffaf1" stroke={sizzle.border} />
        <text x="430" y="124" {...text} fontSize="11" fontWeight="700" fill={sizzle.charcoal}>Meal plan</text>
        {[
          ['Mon', sizzle.apricot, 52],
          ['Tue', sizzle.sage, 40],
          ['Wed', sizzle.apricotSoft, 46],
        ].map(([day, fill, width], i) => (
          <g key={day}>
            <text x="430" y={150 + i * 24} {...text} fontSize="9" fontWeight="600" fill={sizzle.muted}>{day}</text>
            <rect x="454" y={140 + i * 24} width="14" height="14" rx="4" fill={fill as string} />
            <rect x="474" y={145 + i * 24} width={width as number} height="5" rx="2.5" fill={sizzle.border} />
          </g>
        ))}
      </g>
      <Edge x={430} y={240} w={92} h={38} r={19} tint={sizzle.shadow} />
      <rect x="430" y="240" width="92" height="38" rx="19" fill={sizzle.charcoal} />
      <rect x="448" y="251" width="12" height="16" rx="3" stroke="#fff" strokeWidth="1.6" />
      <path d="M448 257h12m-3-3.5v-1" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
      <text x="468" y="263.5" {...text} fontSize="12" fontWeight="600" fill="#fff">Create</text>
    </svg>
  )
}

/* Nighty ----------------------------------------------------------------- */

const nighty = {
  navy: '#26324a',
  ink: '#1b2233',
  muted: '#667085',
  blueSoft: '#c9d3ef',
  moon: '#f1d9a6',
  cover: '#efebe3',
  gusset: '#56606b',
  surface: '#e7eaf2',
  shadow: '#1d2740',
  font: 'Inter, sans-serif',
}

/** The pillow's side profile, traced from the same height curve the 3D model uses. */
function pillowProfile(left: number, base: number, scale: number) {
  const half = PILLOW.depth / 2
  const bandX = 40, bandY = 24
  const top: string[] = []
  for (let z = -half; z <= half; z += 6) {
    const edge = Math.min(1, Math.max(0, (Math.abs(z) - (half - bandX)) / bandX))
    const height = profileHeight(z) - bandY * (1 - Math.sqrt(1 - edge * edge))
    top.push(`${(left + (z + half) * scale).toFixed(1)} ${(base - height * scale).toFixed(1)}`)
  }
  const right = left + PILLOW.depth * scale
  return [
    `M${left} ${base - bandY * scale}`,
    `L${top.join(' L')}`,
    `L${right} ${base - bandY * scale}`,
    `Q${right} ${base} ${right - bandX * scale} ${base}`,
    `L${left + bandX * scale} ${base}`,
    `Q${left} ${base} ${left} ${base - bandY * scale}Z`,
  ].join(' ')
}

export function NightyCover() {
  const text = { fontFamily: nighty.font }
  const left = 145, base = 262, scale = 0.75
  const profile = pillowProfile(left, base, scale)
  // A night's sleep stages, deepest tallest.
  const stages = [14, 22, 30, 18, 12, 26, 30, 16, 12, 20, 14, 10]
  return (
    <svg className="project-cover" {...coverProps}>
      <circle cx="280" cy="170" r="140" fill="#fff" fillOpacity=".5" />

      {/* The pillow in profile: neck roll, head cradle, rear roll, pod at the back */}
      <path d={profile} fill={nighty.gusset} />
      <path d={profile} fill="none" stroke={nighty.cover} strokeWidth="9" strokeLinejoin="round" clipPath="url(#nighty-top)" />
      <defs>
        <clipPath id="nighty-top"><rect x={left - 10} y="150" width={PILLOW.depth * scale + 20} height="70" /></clipPath>
      </defs>
      <rect x={left - 5} y={base - 42 * scale} width="8" height={30 * scale} rx="3" fill="#b9bcc1" />
      <circle cx={left - 1} cy={base - 27 * scale} r="1.8" fill="#8fbfff" />

      {/* The room it is reading */}
      <g>
        <Edge x={52} y={40} w={150} h={92} r={16} tint={nighty.shadow} />
        <rect x="52" y="40" width="150" height="92" rx="16" fill="#fff" />
        <text x="70" y="64" {...text} fontSize="9" fontWeight="700" letterSpacing="1.4" fill={nighty.muted}>ROOM</text>
        <text x="70" y="96" {...text} fontSize="26" fontWeight="700" letterSpacing="-.6" fill={nighty.ink}>27.0°</text>
        <rect x="70" y="106" width="76" height="18" rx="9" fill={nighty.blueSoft} />
        <text x="108" y="118.5" {...text} fontSize="9" fontWeight="600" fill={nighty.navy} textAnchor="middle">Cooling on</text>
      </g>

      {/* White noise playing from inside the foam */}
      <g>
        <rect x="214" y="70" width="132" height="34" rx="17" fill={nighty.navy} />
        {[6, 12, 18, 10, 5].map((h, i) => (
          <rect key={i} x={232 + i * 5} y={87 - h / 2} width="2.4" height={h} rx="1.2" fill="#fff" />
        ))}
        <text x="264" y="91" {...text} fontSize="11" fontWeight="600" fill="#fff">White noise</text>
      </g>

      {/* Last night, in light and deep sleep */}
      <g>
        <Edge x={370} y={34} w={150} h={112} r={16} tint={nighty.shadow} />
        <rect x="370" y="34" width="150" height="112" rx="16" fill="#fff" />
        <text x="386" y="58" {...text} fontSize="9" fontWeight="700" letterSpacing="1.4" fill={nighty.muted}>LAST NIGHT</text>
        <text x="386" y="84" {...text} fontSize="18" fontWeight="700" letterSpacing="-.4" fill={nighty.ink}>7h 42m</text>
        {stages.map((h, i) => (
          <rect key={i} x={386 + i * 10} y={132 - h} width="7" height={h} rx="2" fill={h >= 26 ? nighty.navy : nighty.blueSoft} />
        ))}
      </g>
      <circle cx="506" cy="42" r="12" fill={nighty.moon} />
      <circle cx="512" cy="37" r="10" fill={nighty.surface} />
    </svg>
  )
}
