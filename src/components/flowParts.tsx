import { createContext, useContext, useId, type ReactNode } from 'react'

/*
 * Building blocks shared by the case-study flow diagrams. They draw in the
 * diagram's own viewBox units; colours come from the --flow-* properties that
 * FlowCanvas sets, so each case study can tint its board.
 */

type StepKind = 'screen' | 'tint'

export function Step({ x, y, title, note, kind = 'screen', w = 200 }: {
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

export function Terminal({ cx, y, title, note, w = 180, outside = false }: {
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

export function Decision({ cx, cy, label, w = 150, h = 84 }: { cx: number; cy: number; label: string; w?: number; h?: number }) {
  const points = `${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`
  return (
    <g className="flow-decision">
      <polygon points={points} />
      <text className="flow-title" x={cx} y={cy}>{label}</text>
    </g>
  )
}

// A page can hold several diagrams, so each one scopes its own marker id.
const MarkerId = createContext('flow-arrow')

/** The svg shell every diagram shares: accessible name and description, and its arrow marker. */
export function FlowSvg({ width, height, title, desc, className, children }: {
  width: number
  height: number
  title: string
  desc: string
  className?: string
  children: ReactNode
}) {
  // useId output contains characters that url(#…) references would need escaped.
  const id = `flow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <MarkerId.Provider value={`${id}-arrow`}>
      <svg
        className={`flow-diagram${className ? ` ${className}` : ''}`}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>{desc}</desc>
        <defs>
          <ArrowMarker />
        </defs>
        {children}
      </svg>
    </MarkerId.Provider>
  )
}

function ArrowMarker() {
  return (
    <marker
      id={useContext(MarkerId)}
      className="flow-arrow"
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
  )
}

/**
 * Dashed edges are for things that are not data moving, such as a visit in
 * person. Lit edges trace the path a scenario has taken.
 */
export function Edge({ d, end = true, dashed = false, lit = false }: {
  d: string
  end?: boolean
  dashed?: boolean
  lit?: boolean
}) {
  const marker = useContext(MarkerId)
  return (
    <path
      className={`flow-edge${dashed ? ' flow-edge--dashed' : ''}${lit ? ' flow-edge--lit' : ''}`}
      d={d}
      markerEnd={end ? `url(#${marker})` : undefined}
    />
  )
}

export function Branch({ x, y, lit = false, children }: { x: number; y: number; lit?: boolean; children: string }) {
  return <text className={`flow-branch${lit ? ' is-lit' : ''}`} x={x} y={y}>{children}</text>
}

/* Screen cards for information-architecture maps: a titled header over the
   content blocks of one screen. A chevron marks a block that opens a deeper
   screen. */

export type ScreenRow = { label: string; deeper?: boolean }

const CARD_HEADER = 40
const CARD_ROW = 24
const CARD_PAD = 8

export function screenCardHeight(rows: ScreenRow[]) {
  return CARD_HEADER + CARD_PAD * 2 + rows.length * CARD_ROW
}

export function ScreenCard({ x, y, w, title, index, rows, kind = 'detail' }: {
  x: number
  y: number
  w: number
  title: string
  index?: string
  rows: ScreenRow[]
  kind?: 'tab' | 'detail'
}) {
  const h = screenCardHeight(rows)
  const r = 10
  return (
    <g className={`ia-card ia-card--${kind}`}>
      <rect className="ia-card__fill" x={x} y={y} width={w} height={h} rx={r} />
      {kind === 'tab' && (
        <path
          className="ia-card__header"
          d={`M${x} ${y + CARD_HEADER} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + CARD_HEADER} Z`}
        />
      )}
      <rect className="ia-card__outline" x={x} y={y} width={w} height={h} rx={r} />
      <line className="ia-card__rule" x1={x} y1={y + CARD_HEADER} x2={x + w} y2={y + CARD_HEADER} />
      <text className="ia-card__title" x={x + 14} y={y + CARD_HEADER / 2}>{title}</text>
      {index && <text className="ia-card__index" x={x + w - 14} y={y + CARD_HEADER / 2}>{index}</text>}
      {rows.map((row, i) => {
        const rowY = y + CARD_HEADER + CARD_PAD + i * CARD_ROW + CARD_ROW / 2
        return (
          <g key={row.label}>
            <text className="ia-card__row" x={x + 14} y={rowY}>{row.label}</text>
            {row.deeper && <text className="ia-card__deeper" x={x + w - 14} y={rowY - 1}>›</text>}
          </g>
        )
      })}
    </g>
  )
}
