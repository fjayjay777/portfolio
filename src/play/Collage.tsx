import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { composeSentence, sentenceText } from './sentence'
import { SentenceView } from './SentenceView'
import { RisoDefs, StickerArt, ink, isRepeatable, stickerById, stickers, type Group, type StickerDef } from './stickers'

type Item = { uid: string; id: string; x: number; y: number; rot: number; scale: number; z: number }

// Positions are fractions of the board, so a collage survives a resize.
type Drag =
  | { mode: 'move'; uid: string; dx: number; dy: number; moved: boolean }
  | { mode: 'turn'; uid: string; cx: number; cy: number; a0: number; d0: number; rot0: number; scale0: number }

type Pickup = { id: string; pointerId: number; startX: number; startY: number }
type Ghost = { id: string; x: number; y: number; overBoard: boolean }

const groups: { id: Group; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'life', label: 'Life' },
  { id: 'bits', label: 'Bits' },
]

const MIN_SCALE = 0.45
const MAX_SCALE = 2.6
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const randomBetween = (min: number, max: number) => min + Math.random() * (max - min)
const randomTilt = () => randomBetween(-14, 14)

let uidCounter = 0
const nextUid = () => `s${++uidCounter}`

// The starter collage frames the sentence instead of covering it.
const starter: Item[] = [
  { uid: nextUid(), id: 'ux', x: 0.13, y: 0.34, rot: -8, scale: 1.1, z: 1 },
  { uid: nextUid(), id: 'tape', x: 0.27, y: 0.12, rot: -14, scale: 0.9, z: 2 },
  { uid: nextUid(), id: 'annarbor', x: 0.85, y: 0.28, rot: 6, scale: 1, z: 3 },
  { uid: nextUid(), id: 'cat', x: 0.87, y: 0.74, rot: -4, scale: 1.05, z: 4 },
  { uid: nextUid(), id: 'blossom-pink', x: 0.2, y: 0.8, rot: 10, scale: 1, z: 5 },
]

const stickerWidth = (sticker: StickerDef, boardWidth: number) => clamp((boardWidth * (sticker.size ?? 15)) / 100, 68, 190)

// Shuffle: a couple of each kind of sticker, spaced evenly around a ring so
// the pieces frame the words.
function randomCollage(): Item[] {
  const pickFrom = (pool: StickerDef[], count: number) => [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  const bySlot = (slot: string) => stickers.filter((sticker) => sticker.fragment.slot === slot)
  const chosen = [
    ...pickFrom(bySlot('who'), 2),
    ...pickFrom(bySlot('does'), 1 + Math.round(Math.random())),
    ...pickFrom(bySlot('about'), 1 + Math.round(Math.random())),
    ...pickFrom(stickers.filter(isRepeatable), 2),
  ].sort(() => Math.random() - 0.5)

  const turn = Math.random() * Math.PI * 2
  return chosen.map((sticker, index) => {
    const angle = turn + (index / chosen.length) * Math.PI * 2 + randomBetween(-0.2, 0.2)
    return {
      uid: nextUid(), id: sticker.id,
      x: clamp(0.5 + Math.cos(angle) * 0.4, 0.08, 0.92),
      y: clamp(0.5 + Math.sin(angle) * 0.38, 0.1, 0.9),
      rot: randomTilt(), scale: randomBetween(0.9, 1.15), z: index + 1,
    }
  })
}

/* Stickers frame the sentence -------------------------------------------- */

type TextArea = { l: number; t: number; r: number; b: number; width: number; height: number }

// The words' box, in board fractions. Offsets rather than client rects, so the
// words' own entrance animation doesn't skew the measurement.
function measureText(board: HTMLElement, box: HTMLElement): TextArea | null {
  const width = board.clientWidth
  const height = board.clientHeight
  if (!width || !height || !box.offsetWidth) return null
  return {
    l: box.offsetLeft / width, r: (box.offsetLeft + box.offsetWidth) / width,
    t: box.offsetTop / height, b: (box.offsetTop + box.offsetHeight) / height,
    width, height,
  }
}

// Any sticker sitting on the words slides out to the nearest open side. A
// little overlap is allowed so stickers can tuck against the text.
function clearOfText(items: Item[], area: TextArea | null, held?: string): Item[] {
  if (!area) return items
  let moved = false
  const next = items.map((item) => {
    if (item.uid === held) return item
    const sticker = stickerById.get(item.id)!
    const [, , boxW, boxH] = (sticker.viewBox ?? '0 0 120 120').split(' ').map(Number)
    const px = stickerWidth(sticker, area.width) * item.scale * 0.4
    const halfW = px / area.width
    const halfH = (px * boxH) / boxW / area.height
    const l = area.l - halfW, r = area.r + halfW, t = area.t - halfH, b = area.b + halfH
    if (item.x <= l || item.x >= r || item.y <= t || item.y >= b) return item

    const spots = [{ x: l, y: item.y }, { x: r, y: item.y }, { x: item.x, y: t }, { x: item.x, y: b }]
      .filter((spot) => spot.x >= 0.03 && spot.x <= 0.97 && spot.y >= 0.04 && spot.y <= 0.96)
    if (!spots.length) return item
    const nearest = spots.reduce((best, spot) =>
      Math.hypot(spot.x - item.x, spot.y - item.y) < Math.hypot(best.x - item.x, best.y - item.y) ? spot : best)
    moved = true
    return { ...item, ...nearest }
  })
  return moved ? next : items
}

// A free spot on a loose ring around the words, as far from other stickers
// as a few tries can find.
function openSpot(existing: Item[]) {
  let best = { x: 0.5, y: 0.12 }
  let bestGap = -1
  for (let attempt = 0; attempt < 18; attempt++) {
    const angle = Math.random() * Math.PI * 2
    const x = clamp(0.5 + Math.cos(angle) * randomBetween(0.36, 0.44), 0.08, 0.92)
    const y = clamp(0.5 + Math.sin(angle) * randomBetween(0.34, 0.42), 0.1, 0.9)
    const gap = Math.min(1, ...existing.map((item) => Math.hypot(item.x - x, (item.y - y) * 0.6)))
    if (gap > bestGap) {
      best = { x, y }
      bestGap = gap
    }
  }
  return best
}

// `intro` (the page title and description) shares a row with the board's
// buttons, so the header stays one quiet line above the collage.
export function Collage({ intro }: { intro?: ReactNode }) {
  const boardRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const trayRef = useRef<HTMLDivElement>(null)
  const wordsRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<Drag | null>(null)
  const pickupRef = useRef<Pickup | null>(null)
  const suppressClick = useRef(false)

  const [items, setItems] = useState<Item[]>(starter)
  const [selected, setSelected] = useState<string | null>(null)
  const [lit, setLit] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [overTray, setOverTray] = useState(false)
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const [tab, setTab] = useState<Group>('work')
  const [boardWidth, setBoardWidth] = useState(800)
  const [wiggle, setWiggle] = useState<string | null>(null)

  useLayoutEffect(() => {
    const board = boardRef.current
    if (!board) return
    const observer = new ResizeObserver(([entry]) => setBoardWidth(entry.contentRect.width))
    observer.observe(board)
    return () => observer.disconnect()
  }, [])

  // Whenever the sentence grows or shrinks, it nudges stickers off itself.
  useLayoutEffect(() => {
    const board = boardRef.current
    const box = wordsRef.current
    if (!board || !box) return
    const observer = new ResizeObserver(() => {
      setItems((current) => clearOfText(current, measureText(board, box), dragRef.current?.uid))
    })
    observer.observe(box)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!wiggle) return
    const timer = window.setTimeout(() => setWiggle(null), 600)
    return () => window.clearTimeout(timer)
  }, [wiggle])

  const stickerPx = (sticker: StickerDef) => stickerWidth(sticker, boardWidth)

  const sentence = useMemo(
    () => composeSentence(items.map((item) => ({ uid: item.uid, x: item.x, y: item.y, fragment: stickerById.get(item.id)!.fragment }))),
    [items],
  )
  const placedIds = new Set(items.map((item) => item.id))
  const topZ = () => items.reduce((max, item) => Math.max(max, item.z), 0) + 1

  function boardPoint(clientX: number, clientY: number) {
    const rect = boardRef.current!.getBoundingClientRect()
    const frame = frameRef.current!.getBoundingClientRect()
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      inside: clientX >= frame.left && clientX <= frame.right && clientY >= frame.top && clientY <= frame.bottom,
    }
  }

  function isOverTray(clientX: number, clientY: number) {
    const rect = trayRef.current?.getBoundingClientRect()
    return !!rect && clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
  }

  function settle() {
    const board = boardRef.current
    const box = wordsRef.current
    if (board && box) setItems((current) => clearOfText(current, measureText(board, box), dragRef.current?.uid))
  }

  function update(uid: string, patch: Partial<Item>) {
    setItems((current) => current.map((item) => (item.uid === uid ? { ...item, ...patch } : item)))
  }

  function remove(uid: string) {
    setItems((current) => current.filter((item) => item.uid !== uid))
    setSelected((current) => (current === uid ? null : current))
    setLit(null)
  }

  function add(id: string, x: number, y: number) {
    const item: Item = { uid: nextUid(), id, x: clamp(x, 0.08, 0.9), y: clamp(y, 0.1, 0.9), rot: randomTilt(), scale: 1, z: topZ() }
    setItems((current) => [...current, item])
    setSelected(item.uid)
    settle()
  }

  /* Board stickers ------------------------------------------------------ */

  function startMove(event: PointerEvent<HTMLDivElement>, item: Item) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const point = boardPoint(event.clientX, event.clientY)
    dragRef.current = { mode: 'move', uid: item.uid, dx: point.x - item.x, dy: point.y - item.y, moved: false }
    setSelected(item.uid)
    setDragging(item.uid)
    update(item.uid, { z: topZ() })
  }

  function startTurn(event: PointerEvent<HTMLSpanElement>, item: Item) {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    const rect = boardRef.current!.getBoundingClientRect()
    const cx = rect.left + item.x * rect.width
    const cy = rect.top + item.y * rect.height
    dragRef.current = {
      mode: 'turn', uid: item.uid, cx, cy,
      a0: Math.atan2(event.clientY - cy, event.clientX - cx),
      d0: Math.hypot(event.clientX - cx, event.clientY - cy),
      rot0: item.rot, scale0: item.scale,
    }
    setDragging(item.uid)
  }

  function onDrag(event: PointerEvent) {
    const drag = dragRef.current
    if (!drag) return

    if (drag.mode === 'move') {
      const point = boardPoint(event.clientX, event.clientY)
      drag.moved = true
      update(drag.uid, { x: clamp(point.x - drag.dx, -0.02, 0.97), y: clamp(point.y - drag.dy, -0.02, 1.02) })
      setOverTray(isOverTray(event.clientX, event.clientY))
      return
    }

    const angle = Math.atan2(event.clientY - drag.cy, event.clientX - drag.cx)
    const distance = Math.hypot(event.clientX - drag.cx, event.clientY - drag.cy)
    update(drag.uid, {
      rot: drag.rot0 + ((angle - drag.a0) * 180) / Math.PI,
      scale: clamp((drag.scale0 * distance) / Math.max(drag.d0, 1), MIN_SCALE, MAX_SCALE),
    })
  }

  function endDrag(event: PointerEvent) {
    const drag = dragRef.current
    dragRef.current = null
    setDragging(null)
    setOverTray(false)
    if (drag?.mode === 'move' && drag.moved && isOverTray(event.clientX, event.clientY)) remove(drag.uid)
    else settle()
  }

  function onStickerKey(event: KeyboardEvent<HTMLDivElement>, item: Item) {
    const step = event.shiftKey ? 0.06 : 0.02
    const moves: Record<string, Partial<Item>> = {
      ArrowLeft: { x: clamp(item.x - step, 0, 1) },
      ArrowRight: { x: clamp(item.x + step, 0, 1) },
      ArrowUp: { y: clamp(item.y - step, 0, 1) },
      ArrowDown: { y: clamp(item.y + step, 0, 1) },
      '[': { rot: item.rot - 10 },
      ']': { rot: item.rot + 10 },
      '-': { scale: clamp(item.scale - 0.1, MIN_SCALE, MAX_SCALE) },
      '=': { scale: clamp(item.scale + 0.1, MIN_SCALE, MAX_SCALE) },
      '+': { scale: clamp(item.scale + 0.1, MIN_SCALE, MAX_SCALE) },
    }

    if (event.key in moves) {
      event.preventDefault()
      update(item.uid, moves[event.key])
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault()
      remove(item.uid)
      boardRef.current?.focus()
    } else if (event.key === 'Escape') {
      setSelected(null)
      event.currentTarget.blur()
    }
  }

  /* Tray: drag a sticker out, or click to drop it somewhere free --------- */

  function pickUp(event: PointerEvent<HTMLButtonElement>, sticker: StickerDef) {
    if (event.button !== 0) return
    if (!isRepeatable(sticker) && placedIds.has(sticker.id)) return
    event.currentTarget.setPointerCapture(event.pointerId)
    pickupRef.current = { id: sticker.id, pointerId: event.pointerId, startX: event.clientX, startY: event.clientY }
  }

  function carry(event: PointerEvent<HTMLButtonElement>) {
    const pickup = pickupRef.current
    if (!pickup || pickup.pointerId !== event.pointerId) return
    if (!ghost && Math.hypot(event.clientX - pickup.startX, event.clientY - pickup.startY) < 6) return
    const { inside } = boardPoint(event.clientX, event.clientY)
    setGhost({ id: pickup.id, x: event.clientX, y: event.clientY, overBoard: inside })
  }

  function drop(event: PointerEvent<HTMLButtonElement>) {
    const pickup = pickupRef.current
    pickupRef.current = null
    if (!pickup || !ghost) return
    suppressClick.current = true
    setGhost(null)
    const point = boardPoint(event.clientX, event.clientY)
    if (point.inside) add(pickup.id, point.x, point.y)
  }

  function cancelCarry() {
    pickupRef.current = null
    setGhost(null)
  }

  function onTrayClick(sticker: StickerDef) {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }

    const existing = !isRepeatable(sticker) && items.find((item) => item.id === sticker.id)
    if (existing) {
      setSelected(existing.uid)
      setWiggle(existing.uid)
      update(existing.uid, { z: topZ() })
      return
    }
    const spot = openSpot(items)
    add(sticker.id, spot.x, spot.y)
  }

  /* Whole-board actions ------------------------------------------------- */

  function shuffle() {
    setItems(randomCollage())
    setSelected(null)
    settle()
  }

  function clear() {
    setItems([])
    setSelected(null)
    setLit(null)
  }

  const visibleStickers = stickers.filter((sticker) => sticker.group === tab)
  const ghostSticker = ghost && stickerById.get(ghost.id)

  return (
    <div className={`collage${ghost || dragging ? ' collage--busy' : ''}`}>
      <RisoDefs />

      <div className="collage-stage">
        <div className="collage-toolbar">
          <div className="collage-intro">{intro}</div>
          <div className="collage-actions">
            <button type="button" className="collage-button" onClick={shuffle}>Shuffle</button>
            <button type="button" className="collage-button" onClick={clear} disabled={!items.length}>Clear</button>
          </div>
        </div>

        <div
          ref={frameRef}
          className={`collage-frame${ghost?.overBoard ? ' collage-frame--target' : ''}`}
          onPointerDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}
        >
          <div
            ref={boardRef}
            className="collage-board"
            role="region"
            aria-label="Collage board"
            aria-describedby="collage-keys"
            tabIndex={-1}
            onPointerDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}
          >
            {items.map((item) => {
              const sticker = stickerById.get(item.id)!
              const isSelected = selected === item.uid
              const classes = [
                'board-sticker',
                isSelected && 'is-selected',
                dragging === item.uid && 'is-dragging',
                lit === item.uid && 'is-lit',
                wiggle === item.uid && 'is-wiggling',
                dragging === item.uid && overTray && 'is-peeling',
              ].filter(Boolean).join(' ')

              return (
                <div
                  key={item.uid}
                  className={classes}
                  style={{
                    left: `${item.x * 100}%`,
                    top: `${item.y * 100}%`,
                    width: stickerPx(sticker),
                    zIndex: item.z,
                    transform: `translate(-50%, -50%) rotate(${item.rot}deg) scale(${item.scale})`,
                    ['--counter-scale' as string]: 1 / item.scale,
                  }}
                >
                  <div
                    className="board-sticker__body"
                    role="button"
                    tabIndex={0}
                    aria-label={`${sticker.label} sticker`}
                    aria-pressed={isSelected}
                    onPointerDown={(event) => startMove(event, item)}
                    onPointerMove={onDrag}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    onPointerEnter={() => setLit(item.uid)}
                    onPointerLeave={() => setLit((current) => (current === item.uid ? null : current))}
                    onFocus={() => setSelected(item.uid)}
                    onKeyDown={(event) => onStickerKey(event, item)}
                  >
                    <div className="board-sticker__art"><StickerArt sticker={sticker} /></div>
                  </div>
                  {isSelected && (
                    <>
                      <span
                        className="board-sticker__handle"
                        aria-hidden="true"
                        onPointerDown={(event) => startTurn(event, item)}
                        onPointerMove={onDrag}
                        onPointerUp={endDrag}
                        onPointerCancel={endDrag}
                      />
                      <button
                        type="button"
                        className="board-sticker__remove"
                        tabIndex={-1}
                        aria-label={`Remove ${sticker.label}`}
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={() => remove(item.uid)}
                      >
                        ×
                      </button>
                    </>
                  )}
                </div>
              )
            })}

            <SentenceView
              sentence={sentence}
              emptyText={items.length ? 'Decorations don’t talk. Add a sticker from Work or Life.' : 'Nothing yet. Stick something down.'}
              lit={lit}
              onLight={setLit}
              tintOf={(source) => {
                const item = items.find((entry) => entry.uid === source)
                return item && ink[stickerById.get(item.id)!.tint]
              }}
              boxRef={wordsRef}
            />
          </div>
          <p id="collage-keys" className="visually-hidden">
            Select a sticker, then use arrow keys to move it, square brackets to turn it, plus and minus to resize, and Delete to remove it.
          </p>
          <p className="visually-hidden" aria-live="polite">{sentence ? sentenceText(sentence) : ''}</p>

        </div>
      </div>

      <aside ref={trayRef} className={`sticker-sheet${overTray ? ' sticker-sheet--peel' : ''}`} aria-label="Sticker sheet">
        <div className="sticker-sheet__head">
          <div className="sticker-tabs" role="tablist" aria-label="Sticker groups">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                role="tab"
                id={`sticker-tab-${group.id}`}
                aria-selected={tab === group.id}
                aria-controls="sticker-panel"
                className="sticker-tab"
                onClick={() => setTab(group.id)}
              >
                {group.label}
              </button>
            ))}
          </div>
          <p className="collage-hint">
            {overTray ? 'Let go to peel it off' : 'Drag to move · pull the corner dot to turn and resize · drop back on the sheet to peel off'}
          </p>
        </div>

        <div className="sticker-grid" id="sticker-panel" role="tabpanel" aria-labelledby={`sticker-tab-${tab}`}>
          {visibleStickers.map((sticker) => {
            const used = !isRepeatable(sticker) && placedIds.has(sticker.id)
            return (
              <button
                key={sticker.id}
                type="button"
                className={`sheet-sticker${used ? ' is-used' : ''}`}
                aria-label={used ? `${sticker.label}, on the board. Select it.` : `Add ${sticker.label}`}
                onPointerDown={(event) => pickUp(event, sticker)}
                onPointerMove={carry}
                onPointerUp={drop}
                onPointerCancel={cancelCarry}
                onClick={() => onTrayClick(sticker)}
              >
                <span className="sheet-sticker__art"><StickerArt sticker={sticker} /></span>
                <span className="sheet-sticker__label">{sticker.label}</span>
              </button>
            )
          })}
        </div>
      </aside>

      {ghost && ghostSticker && (
        <div
          className={`sticker-ghost${ghost.overBoard ? ' is-over' : ''}`}
          style={{ left: ghost.x, top: ghost.y, width: stickerPx(ghostSticker) }}
          aria-hidden="true"
        >
          <StickerArt sticker={ghostSticker} />
        </div>
      )}
    </div>
  )
}
