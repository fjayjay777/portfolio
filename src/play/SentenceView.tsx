import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import type { Sentence, Token } from './sentence'

/* Keys survive edits elsewhere in the sentence, so a word that was already
   showing keeps its element and can glide to its new spot. */
function keyTokens(tokens: Token[]) {
  const seen = new Map<string, number>()
  return tokens.map((token) => {
    const base = `${token.source ?? 'glue'}:${token.text}`
    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    return { ...token, key: `${base}:${count}` }
  })
}

const EASE = 'cubic-bezier(.2, .8, .2, 1)'

type Props = {
  sentence: Sentence | null
  emptyText: string
  lit: string | null
  onLight: (source: string | null) => void
  tintOf: (source: string) => string | undefined
  boxRef: RefObject<HTMLDivElement | null>
}

// The sentence sits in the middle of the board, set in three tones: brown for
// the name, charcoal and brown taking turns for each sticker's words, light
// gray for the words that only hold it together.
export function SentenceView({ sentence, emptyText, lit, onLight, tintOf, boxRef }: Props) {
  const tokens = useMemo(() => (sentence ? keyTokens(sentence.tokens) : []), [sentence])
  const nodes = useRef(new Map<string, HTMLSpanElement>())
  const placed = useRef(new Map<string, { x: number; y: number }>())

  // New words rise in from a blur one after another; words that were already
  // there slide from where they were (FLIP), so the line reflows instead of
  // jumping when a sticker is added or moved.
  useLayoutEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const next = new Map<string, { x: number; y: number }>()
    let fresh = 0

    for (const token of tokens) {
      const node = nodes.current.get(token.key)
      if (!node) continue
      const at = { x: node.offsetLeft, y: node.offsetTop }
      next.set(token.key, at)
      if (still || typeof node.animate !== 'function') continue

      const was = placed.current.get(token.key)
      if (!was) {
        node.animate(
          [
            { opacity: 0, transform: 'translateY(.55em) rotate(-4deg)', filter: 'blur(6px)' },
            { opacity: 1, transform: 'none', filter: 'blur(0)' },
          ],
          { duration: 560, delay: fresh++ * 55, easing: EASE, fill: 'backwards' },
        )
      } else if (was.x !== at.x || was.y !== at.y) {
        node.animate(
          [{ transform: `translate(${was.x - at.x}px, ${was.y - at.y}px)` }, { transform: 'none' }],
          { duration: 460, easing: EASE },
        )
      }
    }
    placed.current = next
  }, [tokens])

  const order = new Map<string, number>()
  for (const token of tokens) if (token.source && !order.has(token.source)) order.set(token.source, order.size)

  return (
    <div className="collage-sentence">
      <div ref={boxRef} className="collage-words">
        <p className="collage-words__label">The collage says</p>
        {sentence ? (
          <p className="collage-words__line" aria-hidden="true">
            {tokens.map((token) => {
              const source = token.source
              const tone = source ? (order.get(source)! % 2 ? 'word--b' : 'word--a') : token.text === 'Jiani' ? 'word--name' : 'word--glue'
              return (
                <span
                  key={token.key}
                  ref={(node) => {
                    if (node) nodes.current.set(token.key, node)
                    else nodes.current.delete(token.key)
                  }}
                  className={['word', tone, source && lit === source && 'is-lit'].filter(Boolean).join(' ')}
                  style={source ? { ['--chip' as string]: tintOf(source) } : undefined}
                  onPointerEnter={() => source && onLight(source)}
                  onPointerLeave={() => onLight(null)}
                >
                  {token.text}
                </span>
              )
            })}
          </p>
        ) : (
          <p className="collage-words__empty" aria-hidden="true">{emptyText}</p>
        )}
        {sentence?.footnote && <p className="collage-words__note" aria-hidden="true">{sentence.footnote}</p>}
      </div>
    </div>
  )
}
