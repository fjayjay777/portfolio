import type { ReactNode } from 'react'
import type { Fragment } from './sentence'

// Sticker sheet for the playground. Every sticker is drawn the way a
// risograph prints: a few flat spot inks laid over each other with multiply,
// the black plate knocked slightly out of register, and halftone dots for
// mixed tones. Paper-cut comes from the white die-cut edge in RisoDefs.
//
// To swap in your own art (an AI-generated PNG, say), replace a sticker's
// `art` with <image href={url} width="120" height="120" />; the board, tray
// and sentence keep working unchanged.

// A bright, toy-box set of inks. Riso shops stock dozens of spot colors; this
// picks eight that stay cheerful where they overprint each other.
export const ink = {
  blue: '#6f8cff',
  sky: '#5cc4ff',
  pink: '#ff86c2',
  coral: '#ff7b6b',
  orange: '#ffa23a',
  yellow: '#ffd84a',
  mint: '#5fd6a8',
  lavender: '#b48cff',
  black: '#5a534c',
  paper: '#fffcf5',
} as const

export type InkName = Exclude<keyof typeof ink, 'black' | 'paper'>

const { blue: B, sky: S, pink: P, coral: C, orange: O, yellow: Y, mint: M, lavender: L, black: K, paper: W } = ink

const confetti: [number, number, number, string][] = [
  [26, 30, 12, C], [64, 20, 9, Y], [98, 34, 13, M], [42, 68, 10, L],
  [82, 74, 14, P], [20, 100, 8, S], [108, 98, 9, O], [60, 104, 7, B],
]

/* One pass of ink. `offset` nudges the black plate out of register. */
function Ink({ children, offset = false }: { children: ReactNode; offset?: boolean }) {
  return (
    <g style={{ mixBlendMode: 'multiply' }} transform={offset ? 'translate(1.8 1.3)' : undefined}>
      {children}
    </g>
  )
}

export type Group = 'work' | 'life' | 'bits'

export type StickerDef = {
  id: string
  label: string
  group: Group
  fragment: Fragment
  /** The ink a sticker's words borrow in the sentence. */
  tint: InkName
  /** Width on the board, as a percent of the board's width. */
  size?: number
  viewBox?: string
  /** Die-cut stickers get the white paper edge; tape and dot screens don't. */
  cut?: boolean
  art: ReactNode
}

function burstPath(points: number, outer: number, inner: number, cx = 60, cy = 60) {
  return Array.from({ length: points * 2 }, (_, index) => {
    const radius = index % 2 ? inner : outer
    const angle = (Math.PI * index) / points - Math.PI / 2
    return `${index ? 'L' : 'M'}${(cx + radius * Math.cos(angle)).toFixed(1)} ${(cy + radius * Math.sin(angle)).toFixed(1)}`
  }).join(' ') + ' Z'
}

const asteriskArms = [0, 60, 120]
const frameShape = 'M12 6 H128 Q134 6 134 12 V108 Q134 114 128 114 H12 Q6 114 6 108 V12 Q6 6 12 6 Z M30 30 V90 H110 V30 Z'
const sparkle = 'M60 6 C64 44 76 56 114 60 C76 64 64 76 60 114 C56 76 44 64 6 60 C44 56 56 44 60 6 Z'

export const stickers: StickerDef[] = [
  /* Work ---------------------------------------------------------------- */
  {
    id: 'ux', label: 'UX designer', group: 'work', tint: 'coral', cut: true,
    fragment: { slot: 'who', text: 'a UX designer' },
    art: (
      <>
        <Ink><circle cx="60" cy="60" r="44" fill={Y} /></Ink>
        <Ink><path d="M20 84 C38 18 82 102 100 36" fill="none" stroke={C} strokeWidth="9" strokeLinecap="round" /></Ink>
        <Ink offset>
          <g stroke={K} strokeWidth="2.5"><path d="M20 84 L38 24" /><path d="M100 36 L82 96" /></g>
          <circle cx="38" cy="24" r="4.5" fill={K} /><circle cx="82" cy="96" r="4.5" fill={K} />
        </Ink>
        <g fill={W} stroke={K} strokeWidth="2.5">
          <rect x="14" y="78" width="12" height="12" /><rect x="94" y="30" width="12" height="12" />
        </g>
      </>
    ),
  },
  {
    id: 'grad', label: 'UMich grad student', group: 'work', tint: 'sky', cut: true,
    fragment: { slot: 'who', text: 'a grad student at the University of Michigan' },
    art: (
      <>
        <Ink><path d="M32 52 V78 C32 92 88 92 88 78 V52 Z" fill={S} /></Ink>
        <Ink><path d="M60 22 L112 46 L60 70 L8 46 Z" fill={B} /></Ink>
        <Ink offset>
          <path d="M60 46 L96 58 V84" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="60" cy="46" r="4" fill={K} />
        </Ink>
        <Ink><path d="M90 84 H102 L100 100 H92 Z" fill={Y} /></Ink>
      </>
    ),
  },
  {
    id: 'code', label: 'Front-end code', group: 'work', tint: 'mint', cut: true,
    fragment: { slot: 'who', text: 'a designer fluent in front-end code' },
    art: (
      <>
        <Ink><rect x="12" y="24" width="96" height="72" rx="12" fill={M} transform="rotate(-6 60 60)" /></Ink>
        <Ink><rect x="22" y="34" width="76" height="52" rx="8" fill="url(#riso-dots-yellow)" /></Ink>
        <Ink offset>
          <g stroke={K} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d="M44 44 L28 60 L44 76" /><path d="M76 44 L92 60 L76 76" />
          </g>
        </Ink>
        <Ink><path d="M67 38 L53 82" stroke={C} strokeWidth="8" strokeLinecap="round" /></Ink>
      </>
    ),
  },
  {
    id: 'claimly', label: 'Claimly', group: 'work', tint: 'yellow', cut: true,
    fragment: { slot: 'does', text: 'designed an app that spots wrong charges on medical bills' },
    art: (
      <>
        <g transform="rotate(-5 60 60)">
          <path d="M28 12 H92 V104 L84 98 L76 104 L68 98 L60 104 L52 98 L44 104 L36 98 L28 104 Z" fill={W} />
          <Ink><rect x="34" y="51" width="52" height="12" fill={Y} /></Ink>
          <Ink offset>
            <path d="M28 12 H92 V104 L84 98 L76 104 L68 98 L60 104 L52 98 L44 104 L36 98 L28 104 Z" fill="none" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
            <g stroke={K} strokeWidth="3.5" strokeLinecap="round">
              <path d="M38 26 H70" /><path d="M38 40 H82" /><path d="M38 57 H76" /><path d="M38 72 H64" /><path d="M38 84 H74" />
            </g>
          </Ink>
        </g>
        <Ink><circle cx="94" cy="84" r="17" fill={M} /></Ink>
        <path d="M86 84 L92 90 L103 78" stroke={W} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'medisync', label: 'Medisync', group: 'work', tint: 'coral', cut: true,
    fragment: { slot: 'does', text: 'designed a way to compare clinics before booking care' },
    art: (
      <>
        <rect x="16" y="26" width="88" height="80" rx="10" fill={W} />
        <Ink><path d="M16 36 Q16 26 26 26 H94 Q104 26 104 36 V48 H16 Z" fill={C} /></Ink>
        <Ink offset>
          <rect x="16" y="26" width="88" height="80" rx="10" fill="none" stroke={K} strokeWidth="3" />
          <path d="M38 16 V34 M82 16 V34" stroke={K} strokeWidth="5" strokeLinecap="round" />
          <g fill={K}>
            {[62, 78, 94].flatMap((y) => [32, 50, 68, 86].filter((x) => !(x === 68 && y === 78)).map((x) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
            )))}
          </g>
        </Ink>
        <Ink><path d="M68 67 V89 M57 78 H79" stroke={M} strokeWidth="8" strokeLinecap="round" /></Ink>
      </>
    ),
  },
  {
    id: 'sizzle', label: 'Sizzle', group: 'work', tint: 'orange', cut: true,
    fragment: { slot: 'does', text: 'designed a recipe app that starts from what’s in the fridge' },
    art: (
      <>
        <Ink>
          <g fill={S} stroke={S}>
            <circle cx="54" cy="60" r="42" stroke="none" />
            <path d="M88 82 L110 104" strokeWidth="12" strokeLinecap="round" />
          </g>
        </Ink>
        <path d="M30 56 C26 38 46 30 58 36 C70 26 86 40 78 56 C88 70 72 86 58 80 C44 90 26 78 30 56 Z" fill={W} />
        <Ink><circle cx="56" cy="57" r="13" fill={O} /></Ink>
        <Ink offset>
          <path d="M30 56 C26 38 46 30 58 36 C70 26 86 40 78 56 C88 70 72 86 58 80 C44 90 26 78 30 56 Z" fill="none" stroke={K} strokeWidth="2.5" />
          <path d="M51 51 Q54 48 58 49" stroke={K} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </Ink>
      </>
    ),
  },
  {
    id: 'nighty', label: 'Nighty', group: 'work', tint: 'lavender', cut: true,
    fragment: { slot: 'does', text: 'designed a pillow that adjusts to the room and tracks sleep' },
    art: (
      <>
        <Ink><path d="M14 50 C10 32 30 32 60 36 C90 32 110 32 106 50 C112 68 112 82 106 94 C110 108 90 106 60 102 C30 106 10 108 14 94 C8 82 8 66 14 50 Z" fill={L} /></Ink>
        <Ink><path d="M70 46 A22 22 0 1 0 92 76 A16 16 0 1 1 70 46 Z" fill={Y} /></Ink>
        <Ink><path d={burstPath(5, 10, 4.5, 98, 22)} fill={P} /><path d={burstPath(5, 6, 2.8, 22, 104)} fill={M} /></Ink>
        <Ink offset>
          <g stroke={K} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 14 H34 L20 28 H34" /><path d="M42 6 H50 L42 14 H50" />
          </g>
        </Ink>
      </>
    ),
  },
  {
    id: 'museum', label: 'Hands-On Museum', group: 'work', tint: 'coral', cut: true,
    fragment: { slot: 'does', text: 'is designing a physics exhibit for the Ann Arbor Hands-On Museum' },
    art: (
      <>
        <Ink><circle cx="60" cy="64" r="46" fill="url(#riso-dots-yellow)" /></Ink>
        <Ink><path d="M34 34 V66 A26 26 0 0 0 86 66 V34" fill="none" stroke={C} strokeWidth="20" /></Ink>
        <Ink offset><path d="M24 22 H44 V36 H24 Z M76 22 H96 V36 H76 Z" fill={K} /></Ink>
        <Ink>
          <g stroke={S} strokeWidth="4" strokeLinecap="round">
            <path d="M14 10 L22 16" /><path d="M60 4 V16" /><path d="M106 10 L98 16" />
          </g>
        </Ink>
      </>
    ),
  },
  {
    id: 'feast', label: 'FEAST lessons', group: 'work', tint: 'sky', cut: true,
    fragment: { slot: 'does', text: 'makes bilingual biomedical lessons for middle schoolers' },
    art: (
      <>
        <Ink><path d="M18 20 H70 Q78 20 78 28 V58 Q78 66 70 66 H36 L20 80 V66 H18 Q10 66 10 58 V28 Q10 20 18 20 Z" fill={S} /></Ink>
        <Ink><path d="M52 48 H102 Q110 48 110 56 V86 Q110 94 102 94 H100 V108 L86 94 H52 Q44 94 44 86 V56 Q44 48 52 48 Z" fill={P} /></Ink>
        <text x="22" y="50" fill={K} fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="22">Hi</text>
        <Ink offset>
          <text x="53" y="80" fill={K} fontFamily="Poppins, sans-serif" fontWeight="700" fontSize="20">Hola</text>
        </Ink>
      </>
    ),
  },
  {
    id: 'consult', label: 'Project consultant', group: 'work', tint: 'orange', cut: true,
    fragment: { slot: 'does', text: 'keeps university and client projects on track' },
    art: (
      <>
        <Ink><rect x="22" y="16" width="76" height="96" rx="8" fill={O} /></Ink>
        <rect x="30" y="30" width="60" height="74" fill={W} />
        <Ink offset>
          <rect x="44" y="9" width="32" height="15" rx="4" fill={K} />
          <g stroke={K} strokeWidth="3.5" strokeLinecap="round"><path d="M54 46 H80" /><path d="M54 64 H80" /><path d="M54 82 H74" /></g>
        </Ink>
        <Ink>
          <g stroke={M} strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M36 46 L40 50 L47 41" /><path d="M36 64 L40 68 L47 59" />
          </g>
          <rect x="36" y="77" width="10" height="10" fill="none" stroke={L} strokeWidth="3" />
        </Ink>
      </>
    ),
  },

  /* Life ---------------------------------------------------------------- */
  {
    // A tabby/calico: warm coat, a darker patch, and striped markings.
    id: 'cat', label: 'My cat', group: 'life', tint: 'orange', cut: true,
    fragment: { slot: 'about', text: 'with a cat never far away' },
    art: (
      <>
        <Ink>
          <g fill={Y}>
            <path d="M34 112 C26 88 34 66 48 60 L72 60 C86 66 94 88 86 112 Z" />
            <circle cx="60" cy="44" r="24" />
            <path d="M38 34 L36 10 L54 24 Z" /><path d="M82 34 L84 10 L66 24 Z" />
            <path d="M84 106 C104 106 110 88 100 78" stroke={Y} strokeWidth="9" fill="none" strokeLinecap="round" />
          </g>
        </Ink>
        <Ink>
          <path d="M62 112 C70 96 66 78 54 64 L72 60 C86 66 94 88 86 112 Z" fill={O} />
          <path d="M66 24 L84 10 L82 34 C78 28 72 24 66 24 Z" fill={O} />
          <path d="M100 78 C108 88 104 106 84 106" stroke={O} strokeWidth="9" fill="none" strokeLinecap="round" />
        </Ink>
        <Ink><path d="M41 28 L40 16 L50 24 Z M56 51 H64 L60 56 Z" fill={P} /></Ink>
        <Ink><circle cx="50" cy="42" r="5.5" fill={M} /><circle cx="70" cy="42" r="5.5" fill={M} /></Ink>
        <Ink offset>
          <g stroke={K} strokeWidth="2.5" strokeLinecap="round" fill="none">
            <path d="M54 22 L55 30 M60 20 V30 M66 22 L65 30" />
            <path d="M38 78 C44 81 48 81 52 78 M36 90 C42 93 48 93 52 90 M38 102 C42 104 46 104 50 102" />
            <path d="M101 86 L94 88 M98 98 L91 97" />
            <path d="M50 39 V45" /><path d="M70 39 V45" />
            <path d="M44 53 L33 51 M44 57 L34 60 M76 53 L87 51 M76 57 L86 60" />
            <path d="M60 56 V59 C57 63 53 62 52 60 M60 59 C63 63 67 62 68 60" />
          </g>
        </Ink>
      </>
    ),
  },
  {
    id: 'oil', label: 'Oil paint', group: 'life', tint: 'coral', cut: true,
    fragment: { slot: 'who', text: 'an oil painter' },
    art: (
      <g transform="rotate(-28 60 60)">
        <Ink><path d="M8 46 H64 L74 52 V68 L64 74 H8 Z" fill={S} /></Ink>
        <Ink><rect x="18" y="52" width="32" height="16" fill={Y} /></Ink>
        <Ink offset>
          <rect x="74" y="54" width="10" height="12" rx="2" fill={K} />
          <path d="M8 43 V77" stroke={K} strokeWidth="4" />
        </Ink>
        <Ink><path d="M84 60 C92 48 112 50 112 62 C112 74 96 76 94 66 C93 60 100 58 102 62" fill="none" stroke={C} strokeWidth="9" strokeLinecap="round" /></Ink>
      </g>
    ),
  },
  {
    id: 'canvas', label: 'My paintings', group: 'life', tint: 'orange', cut: true,
    fragment: { slot: 'does', text: 'keeps a painting practice going between projects' },
    art: (
      <>
        <Ink offset>
          <g stroke={K} strokeWidth="5" strokeLinecap="round"><path d="M40 70 L26 112" /><path d="M80 70 L94 112" /><path d="M60 70 V108" /></g>
        </Ink>
        <Ink><rect x="16" y="12" width="88" height="68" fill={O} /></Ink>
        <rect x="25" y="21" width="70" height="50" fill={W} />
        <Ink><path d="M25 54 C40 44 52 60 66 50 C76 44 86 48 95 52 V71 H25 Z" fill={M} /></Ink>
        <Ink><circle cx="74" cy="36" r="10" fill={C} /><path d="M32 34 C38 27 46 36 52 29" stroke={P} strokeWidth="4" fill="none" strokeLinecap="round" /></Ink>
      </>
    ),
  },
  {
    id: 'camera', label: 'Photography', group: 'life', tint: 'coral', cut: true,
    fragment: { slot: 'who', text: 'a photographer on the side' },
    art: (
      <>
        <Ink><rect x="12" y="36" width="96" height="62" rx="10" fill={C} /></Ink>
        <Ink><rect x="24" y="25" width="26" height="15" rx="3" fill={Y} /></Ink>
        <Ink><circle cx="62" cy="67" r="24" fill={S} /></Ink>
        <Ink offset>
          <circle cx="62" cy="67" r="15" fill="none" stroke={K} strokeWidth="5" />
          <circle cx="62" cy="67" r="5" fill={K} />
          <rect x="86" y="44" width="13" height="8" rx="2" fill={K} />
        </Ink>
      </>
    ),
  },
  {
    id: 'laptop', label: 'Work–life', group: 'life', tint: 'blue', cut: true,
    fragment: { slot: 'about', text: 'splitting the week between a laptop and an easel' },
    art: (
      <>
        <Ink><rect x="20" y="20" width="80" height="58" rx="6" fill={B} /></Ink>
        <Ink><rect x="30" y="30" width="42" height="30" rx="3" fill={P} /></Ink>
        <Ink offset><path d="M14 80 H106 L114 94 H6 Z" fill={K} /></Ink>
        <Ink><path d="M76 44 V66 L81 61 L86 71 L91 69 L86 59 L93 58 Z" fill={Y} /></Ink>
      </>
    ),
  },
  {
    id: 'annarbor', label: 'Ann Arbor', group: 'life', tint: 'mint', cut: true,
    fragment: { slot: 'about', text: 'based in Ann Arbor' },
    art: (
      <>
        <Ink><path d="M60 110 C30 98 14 68 20 28 C54 28 92 46 98 84 C90 100 76 108 60 110 Z" fill={M} /></Ink>
        <Ink><path d="M60 110 C30 98 14 68 20 28 C54 28 92 46 98 84 C90 100 76 108 60 110 Z" fill="url(#riso-dots-yellow)" /></Ink>
        <Ink offset><path d="M28 36 C46 56 56 78 62 108" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" /></Ink>
        <Ink><path d="M88 6 C76 6 68 15 68 26 C68 40 88 56 88 56 C88 56 108 40 108 26 C108 15 100 6 88 6 Z" fill={C} /></Ink>
        <circle cx="88" cy="26" r="7" fill={W} />
      </>
    ),
  },
  {
    id: 'utah', label: 'BFA, Utah', group: 'life', tint: 'orange', cut: true,
    fragment: { slot: 'who', text: 'a BFA graduate from the University of Utah' },
    art: (
      <>
        <Ink><circle cx="84" cy="36" r="20" fill={Y} /></Ink>
        <Ink><path d="M8 98 L46 34 L84 98 Z" fill={O} /></Ink>
        <Ink><path d="M40 98 L76 50 L112 98 Z" fill={B} /></Ink>
        <path d="M37 49 L46 34 L55 49 L50 46 L46 50 L42 46 Z" fill={W} />
        <Ink offset><path d="M8 98 H112" stroke={K} strokeWidth="4" strokeLinecap="round" /></Ink>
      </>
    ),
  },
  {
    id: 'stilllife', label: 'What I paint & shoot', group: 'life', tint: 'pink', cut: true,
    fragment: { slot: 'does', text: 'paints and photographs people, cities, still lifes, and animals' },
    art: (
      <>
        <Ink offset>
          <path d="M60 68 V40 M60 68 C56 54 44 46 36 40 M60 68 C64 54 76 46 84 38" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" />
        </Ink>
        <Ink><circle cx="60" cy="30" r="14" fill={P} /><circle cx="33" cy="36" r="12" fill={O} /><circle cx="87" cy="34" r="12" fill={Y} /></Ink>
        <Ink offset><circle cx="60" cy="30" r="4" fill={K} /><circle cx="33" cy="36" r="3.5" fill={K} /><circle cx="87" cy="34" r="3.5" fill={K} /></Ink>
        <Ink><path d="M44 66 H76 C78 78 90 84 88 96 C86 110 34 110 32 96 C30 84 42 78 44 66 Z" fill={S} /></Ink>
        <Ink><path d="M36 88 H84" stroke={Y} strokeWidth="6" /></Ink>
      </>
    ),
  },
  {
    id: 'bake', label: 'Cooking & baking', group: 'life', tint: 'mint', cut: true,
    fragment: { slot: 'does', text: 'cooks and bakes for fun' },
    art: (
      <>
        <Ink><path d="M28 62 H92 L84 108 H36 Z" fill={M} /></Ink>
        <Ink offset><path d="M44 62 L48 108 M60 62 V108 M76 62 L72 108" stroke={K} strokeWidth="3" /></Ink>
        <path d="M22 64 C14 52 26 40 36 44 C36 28 56 22 62 34 C70 22 92 28 88 44 C100 42 106 58 96 64 Z" fill={W} />
        <Ink><path d="M22 64 C14 52 26 40 36 44 C36 28 56 22 62 34 C70 22 92 28 88 44 C100 42 106 58 96 64 Z" fill="url(#riso-dots-pink)" /></Ink>
        <Ink offset>
          <path d="M22 64 C14 52 26 40 36 44 C36 28 56 22 62 34 C70 22 92 28 88 44 C100 42 106 58 96 64 Z" fill="none" stroke={K} strokeWidth="2.5" />
          <path d="M62 14 C63 8 68 5 74 5" stroke={K} strokeWidth="3" fill="none" strokeLinecap="round" />
        </Ink>
        <Ink><circle cx="62" cy="22" r="9" fill={C} /></Ink>
      </>
    ),
  },
  {
    id: 'milktea', label: 'Coffee & milk tea', group: 'life', tint: 'pink', cut: true,
    fragment: { slot: 'about', text: 'with coffee or milk tea within reach' },
    art: (
      <>
        <Ink><path d="M50 4 L58 40" stroke={C} strokeWidth="8" strokeLinecap="round" /></Ink>
        <path d="M30 34 H90 L82 110 H38 Z" fill={W} />
        <Ink><path d="M32 52 H88 L82 110 H38 Z" fill={Y} /></Ink>
        <Ink offset>
          <path d="M30 34 H90 L82 110 H38 Z" fill="none" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
          <g fill={K}>
            <circle cx="48" cy="99" r="5" /><circle cx="60" cy="102" r="5" /><circle cx="72" cy="98" r="5" />
            <circle cx="54" cy="89" r="5" /><circle cx="67" cy="88" r="5" />
          </g>
        </Ink>
        <Ink><path d="M24 37 C24 22 96 22 96 37 Z" fill={P} /></Ink>
      </>
    ),
  },
  {
    id: 'travel', label: 'Travel', group: 'life', tint: 'orange', cut: true,
    fragment: { slot: 'does', text: 'loves to travel' },
    art: (
      <>
        <Ink offset><path d="M46 32 V20 Q46 13 53 13 H67 Q74 13 74 20 V32" stroke={K} strokeWidth="6" fill="none" /></Ink>
        <Ink><rect x="16" y="30" width="88" height="72" rx="10" fill={O} /></Ink>
        <Ink>
          <rect x="26" y="42" width="30" height="20" rx="3" fill={M} transform="rotate(-10 41 52)" />
          <circle cx="82" cy="76" r="12" fill={S} />
        </Ink>
        <Ink offset>
          <path d="M16 66 H104" stroke={K} strokeWidth="2.5" />
          <circle cx="32" cy="108" r="5" fill={K} /><circle cx="88" cy="108" r="5" fill={K} />
        </Ink>
        <path d="M76 76 L80 80 L88 71" stroke={W} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    id: 'play', label: 'Music, sports, games', group: 'life', tint: 'mint', cut: true,
    fragment: { slot: 'does', text: 'unwinds with music, sports, and games' },
    art: (
      <>
        <Ink offset><path d="M21 66 V56 C21 30 38 14 60 14 C82 14 99 30 99 56 V66" stroke={K} strokeWidth="7" fill="none" strokeLinecap="round" /></Ink>
        <Ink><rect x="10" y="54" width="22" height="34" rx="8" fill={C} /><rect x="88" y="54" width="22" height="34" rx="8" fill={C} /></Ink>
        <Ink><path d="M36 76 C36 66 46 62 60 62 C74 62 84 66 84 76 L88 98 C90 106 80 110 74 102 L70 96 H50 L46 102 C40 110 30 106 32 98 Z" fill={M} /></Ink>
        <Ink offset>
          <path d="M47 74 V84 M42 79 H52" stroke={K} strokeWidth="3.5" strokeLinecap="round" />
          <circle cx="71" cy="76" r="3.5" fill={K} /><circle cx="77" cy="83" r="3.5" fill={K} />
        </Ink>
      </>
    ),
  },
  {
    id: 'lang', label: 'Languages', group: 'life', tint: 'yellow', cut: true,
    fragment: { slot: 'does', text: 'speaks Chinese and English' },
    art: (
      <>
        <Ink><rect x="10" y="20" width="58" height="58" rx="9" fill={Y} transform="rotate(-8 39 49)" /></Ink>
        <Ink><rect x="52" y="44" width="58" height="58" rx="9" fill={S} transform="rotate(6 81 73)" /></Ink>
        <Ink offset>
          <text x="39" y="61" textAnchor="middle" fontSize="34" fontWeight="700" fill={K} transform="rotate(-8 39 49)" fontFamily="'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', sans-serif">中</text>
          <text x="81" y="84" textAnchor="middle" fontSize="28" fontWeight="700" fill={K} transform="rotate(6 81 73)" fontFamily="Poppins, sans-serif">En</text>
        </Ink>
      </>
    ),
  },
  {
    id: 'tools', label: 'Tools', group: 'life', tint: 'sky', cut: true,
    fragment: { slot: 'does', text: 'moves between Figma, code, and a paintbrush' },
    art: (
      <>
        <g transform="rotate(45 60 60)">
          <Ink><rect x="14" y="54" width="62" height="12" rx="6" fill={S} /></Ink>
          <Ink offset><rect x="76" y="52" width="10" height="16" fill={K} /></Ink>
          <Ink><path d="M86 52 C98 52 108 58 112 60 C108 62 98 68 86 68 Z" fill={C} /></Ink>
        </g>
        <g transform="rotate(-45 60 60)">
          <Ink><rect x="18" y="50" width="66" height="20" fill={Y} /></Ink>
          <Ink><rect x="10" y="50" width="10" height="20" rx="3" fill={P} /></Ink>
          <path d="M84 50 L104 60 L84 70 Z" fill={W} />
          <Ink offset>
            <path d="M84 50 L104 60 L84 70 Z M18 50 H84 V70 H18" fill="none" stroke={K} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M97 56.5 L104 60 L97 63.5 Z" fill={K} />
          </Ink>
        </g>
      </>
    ),
  },

  /* Bits: decoration, plus two that change punctuation ------------------ */
  {
    id: 'asterisk', label: 'Footnote', group: 'bits', tint: 'pink', cut: true,
    fragment: { slot: 'mark', text: '', mark: 'footnote' },
    art: (
      <>
        <Ink>
          <g stroke={P} strokeWidth="12" strokeLinecap="round" transform="translate(64 64)">
            {asteriskArms.map((angle) => <line key={angle} y1="-42" y2="42" transform={`rotate(${angle})`} />)}
          </g>
        </Ink>
        <Ink>
          <g stroke={K} strokeWidth="12" strokeLinecap="round" transform="translate(57 57)">
            {asteriskArms.map((angle) => <line key={angle} y1="-42" y2="42" transform={`rotate(${angle})`} />)}
          </g>
        </Ink>
      </>
    ),
  },
  {
    id: 'burst', label: 'Exclaim', group: 'bits', tint: 'yellow', cut: true,
    fragment: { slot: 'mark', text: '', mark: 'exclaim' },
    art: (
      <>
        <Ink><path d={burstPath(12, 54, 36, 63, 63)} fill={P} /></Ink>
        <Ink><path d={burstPath(12, 54, 36)} fill={Y} /></Ink>
        <Ink offset><path d="M60 34 V68" stroke={K} strokeWidth="10" strokeLinecap="round" /><circle cx="60" cy="86" r="6" fill={K} /></Ink>
      </>
    ),
  },
  {
    id: 'tape', label: 'Tape', group: 'bits', tint: 'mint', size: 22, viewBox: '0 0 160 56',
    fragment: { slot: 'none', text: '' },
    art: (
      <Ink>
        <path d="M6 10 L14 6 L20 12 L28 6 H132 L140 12 L146 6 L154 10 L150 18 L156 28 L150 38 L154 48 L146 50 L140 44 L132 50 H28 L20 44 L14 50 L6 46 L10 38 L4 28 L10 18 Z" fill={M} fillOpacity=".7" />
        <path d="M30 6 V50 M70 6 V50 M110 6 V50" stroke={W} strokeOpacity=".35" strokeWidth="10" />
      </Ink>
    ),
  },
  {
    id: 'dots', label: 'Dot screen', group: 'bits', tint: 'pink',
    fragment: { slot: 'none', text: '' },
    art: (
      <Ink>
        <circle cx="60" cy="60" r="50" fill="url(#riso-dots-pink)" />
        <circle cx="66" cy="54" r="30" fill="url(#riso-dots-yellow)" />
      </Ink>
    ),
  },
  // Ditsy florals: one small blossom each, so they can be scattered.
  {
    id: 'blossom-pink', label: 'Pink blossom', group: 'bits', tint: 'pink', cut: true, size: 10,
    fragment: { slot: 'none', text: '' },
    art: <Blossom petal={P} middle={Y} />,
  },
  {
    id: 'blossom-lilac', label: 'Lilac blossom', group: 'bits', tint: 'lavender', cut: true, size: 9,
    fragment: { slot: 'none', text: '' },
    art: <Blossom petal={L} middle={O} />,
  },
  {
    id: 'blossom-sky', label: 'Sky blossom', group: 'bits', tint: 'sky', cut: true, size: 8,
    fragment: { slot: 'none', text: '' },
    art: <Blossom petal={S} middle={Y} />,
  },
  {
    id: 'blossom-coral', label: 'Coral blossom', group: 'bits', tint: 'coral', cut: true, size: 9,
    fragment: { slot: 'none', text: '' },
    art: <Blossom petal={C} middle={Y} />,
  },
  {
    id: 'gingham', label: 'Gingham heart', group: 'bits', tint: 'pink', cut: true,
    fragment: { slot: 'none', text: '' },
    art: <path d="M60 106 C20 80 8 58 14 38 C20 20 44 14 60 34 C76 14 100 20 106 38 C112 58 100 80 60 106 Z" fill="url(#riso-gingham)" />,
  },
  {
    id: 'confetti', label: 'Color dots', group: 'bits', tint: 'yellow', cut: true,
    fragment: { slot: 'none', text: '' },
    art: (
      <Ink>
        {confetti.map(([cx, cy, r, color]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={color} />)}
      </Ink>
    ),
  },
  {
    id: 'frame', label: 'Picture frame', group: 'bits', tint: 'yellow', cut: true, size: 26, viewBox: '0 0 140 120',
    fragment: { slot: 'none', text: '' },
    art: (
      <>
        <Ink><path d={frameShape} fillRule="evenodd" fill={Y} /></Ink>
        <Ink><path d={frameShape} fillRule="evenodd" fill="url(#riso-dots-pink)" /></Ink>
        <Ink offset>
          <rect x="25" y="25" width="90" height="70" fill="none" stroke={K} strokeWidth="2.5" />
          <rect x="13" y="13" width="114" height="94" rx="3" fill="none" stroke={K} strokeWidth="1.5" strokeDasharray="4 4" />
        </Ink>
        <Ink>{[[11, 11], [129, 11], [11, 109], [129, 109]].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="9" fill={C} />)}</Ink>
        <Ink><path d="M70 10 L56 2 V18 Z M70 10 L84 2 V18 Z" fill={M} /></Ink>
      </>
    ),
  },
  {
    id: 'daisy', label: 'Daisy', group: 'bits', tint: 'pink', cut: true,
    fragment: { slot: 'none', text: '' },
    art: (
      <>
        <Ink>
          <g fill={P}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => <ellipse key={angle} cx="60" cy="32" rx="11" ry="22" transform={`rotate(${angle} 60 60)`} />)}
          </g>
        </Ink>
        <circle cx="60" cy="60" r="17" fill={W} />
        <Ink><circle cx="60" cy="60" r="17" fill={Y} /></Ink>
        <Ink offset><g fill={K}><circle cx="55" cy="56" r="2.4" /><circle cx="65" cy="57" r="2.4" /><circle cx="60" cy="65" r="2.4" /></g></Ink>
      </>
    ),
  },
  {
    id: 'rainbow', label: 'Rainbow', group: 'bits', tint: 'coral', cut: true, size: 17, viewBox: '0 0 120 100',
    fragment: { slot: 'none', text: '' },
    art: (
      <>
        <g fill="none" strokeWidth="10">
          {[[46, C], [36, Y], [26, M], [16, S]].map(([r, color]) => (
            <Ink key={r}><path d={`M${60 - Number(r)} 80 A${r} ${r} 0 0 1 ${60 + Number(r)} 80`} stroke={String(color)} /></Ink>
          ))}
        </g>
        {[14, 106].map((cx) => (
          <g key={cx}>
            <path d={`M${cx - 16} 90 C${cx - 22} 80 ${cx - 10} 72 ${cx - 4} 78 C${cx} 68 ${cx + 16} 70 ${cx + 14} 82 C${cx + 22} 84 ${cx + 20} 94 ${cx + 12} 94 H${cx - 12} C${cx - 18} 94 ${cx - 18} 90 ${cx - 16} 90 Z`} fill={W} />
            <Ink offset><path d={`M${cx - 16} 90 C${cx - 22} 80 ${cx - 10} 72 ${cx - 4} 78 C${cx} 68 ${cx + 16} 70 ${cx + 14} 82 C${cx + 22} 84 ${cx + 20} 94 ${cx + 12} 94 H${cx - 12} C${cx - 18} 94 ${cx - 18} 90 ${cx - 16} 90 Z`} fill="none" stroke={K} strokeWidth="2.5" /></Ink>
          </g>
        ))}
      </>
    ),
  },
  {
    id: 'squiggle', label: 'Squiggle', group: 'bits', tint: 'mint', cut: true, size: 18,
    fragment: { slot: 'none', text: '' },
    art: (
      <>
        <Ink><path d="M10 72 C22 40 34 40 40 60 S58 82 64 60 S82 38 88 60 S104 82 110 48" stroke={M} strokeWidth="11" fill="none" strokeLinecap="round" /></Ink>
        <Ink><path d="M14 50 C26 18 38 18 44 38 S62 60 68 38 S86 16 92 38 S108 60 114 26" stroke={P} strokeWidth="5" fill="none" strokeLinecap="round" /></Ink>
      </>
    ),
  },
  {
    id: 'sparkle', label: 'Sparkle', group: 'bits', tint: 'sky', cut: true,
    fragment: { slot: 'none', text: '' },
    art: (
      <>
        <Ink><path d={sparkle} fill={Y} /></Ink>
        <Ink><path d={sparkle} fill={S} transform="translate(80 4) scale(.32)" /></Ink>
        <Ink><path d={sparkle} fill={P} transform="translate(8 82) scale(.24)" /></Ink>
      </>
    ),
  },
]

export const stickerById = new Map(stickers.map((sticker) => [sticker.id, sticker]))

/** Bits can be stuck down any number of times; everything else once. */
export const isRepeatable = (sticker: StickerDef) => sticker.group === 'bits'

export function StickerArt({ sticker }: { sticker: StickerDef }) {
  return (
    <svg className="sticker-svg" viewBox={sticker.viewBox ?? '0 0 120 120'} aria-hidden="true" focusable="false">
      <g filter={sticker.cut ? 'url(#riso-cut)' : 'url(#riso-grain)'}>{sticker.art}</g>
    </svg>
  )
}

/* Centers of five petals around a flower's middle. */
function petals(cx: number, cy: number, distance: number) {
  return Array.from({ length: 5 }, (_, index) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2
    return [+(cx + distance * Math.cos(angle)).toFixed(2), +(cy + distance * Math.sin(angle)).toFixed(2)]
  })
}

/* A five-petal blossom with a leaf. Petals share one ink pass so they don't
   darken where they touch; the middle sits on paper so it stays clean. */
function Blossom({ petal, middle }: { petal: string; middle: string }) {
  return (
    <>
      <Ink><path d="M60 78 C70 92 88 98 104 92 C96 78 78 72 60 78 Z" fill={M} /></Ink>
      <Ink><g fill={petal}>{petals(60, 56, 24).map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="19" />)}</g></Ink>
      <circle cx="60" cy="56" r="13" fill={W} />
      <Ink><circle cx="60" cy="56" r="13" fill={middle} /></Ink>
      <Ink offset><g fill={K}><circle cx="56" cy="53" r="2.2" /><circle cx="64" cy="54" r="2.2" /><circle cx="60" cy="61" r="2.2" /></g></Ink>
    </>
  )
}

export function RisoDefs() {
  const dots = { yellow: Y, blue: B, pink: P, mint: M }

  return (
    <svg className="riso-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs>
        {Object.entries(dots).map(([name, color]) => (
          <pattern key={name} id={`riso-dots-${name}`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
            <circle cx="2.5" cy="2.5" r="1.7" fill={color} />
          </pattern>
        ))}

        {/* Gingham, for the heart. */}
        <pattern id="riso-gingham" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill={W} />
          <rect width="6" height="12" fill={P} fillOpacity=".5" />
          <rect width="12" height="6" fill={P} fillOpacity=".5" />
        </pattern>

        {/* Grain knocks small specks out of the ink, like a drum that ran a
            little dry. The die-cut variant also grows a white paper edge. */}
        <filter id="riso-grain" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.85" result="speckle" />
          <feComposite in="SourceGraphic" in2="speckle" operator="in" />
        </filter>
        <filter id="riso-cut" x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="dilate" radius="4.5" result="grown" />
          <feFlood floodColor={W} />
          <feComposite in2="grown" operator="in" result="edge" />
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.85" result="speckle" />
          <feComposite in="SourceGraphic" in2="speckle" operator="in" result="print" />
          <feMerge><feMergeNode in="edge" /><feMergeNode in="print" /></feMerge>
        </filter>
      </defs>
    </svg>
  )
}
