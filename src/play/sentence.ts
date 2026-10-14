// Turns whatever is on the collage into one sentence about Jiani. Pure, so the
// rules can be tested without a board.
//
// Every sticker fills one slot of a fixed frame:
//   who   → "Jiani is a UX designer and an oil painter"
//   does  → "… who turns medical bills into plain language"
//   about → "…, based in Ann Arbor, with a cat never far away"
//   mark  → changes punctuation or adds a footnote, never words of its own
// Stickers are read left to right, so moving one changes the word order.

export type Slot = 'who' | 'does' | 'about' | 'mark' | 'none'

export type Fragment = { slot: Slot; text: string; mark?: 'exclaim' | 'footnote' }

export type Placed = { uid: string; x: number; y: number; fragment: Fragment }

export type Token = { text: string; source?: string }

export const FOOTNOTE = '*Open to full-time roles starting in 2027.'

function joinList(parts: Token[][]): Token[] {
  if (parts.length <= 1) return parts[0] ?? []
  if (parts.length === 2) {
    // "speaks Chinese and English, and cooks" reads better than a run of ands.
    const first = parts[0].some((token) => token.text === 'and') ? withTrailingComma(parts[0]) : parts[0]
    return [...first, { text: 'and' }, ...parts[1]]
  }

  return parts.flatMap((part, index) => {
    if (index === parts.length - 1) return [{ text: 'and' }, ...part]
    return withTrailingComma(part)
  })
}

// Punctuation rides on the last word instead of standing alone, so a comma
// never wraps onto a new line by itself.
function withTrailingComma(part: Token[]): Token[] {
  const last = part[part.length - 1]
  return [...part.slice(0, -1), { ...last, text: `${last.text},` }]
}

function words(fragment: Fragment, source: string): Token[] {
  return fragment.text.split(' ').map((text) => ({ text, source }))
}

export function readingOrder(items: Placed[]): Placed[] {
  return [...items].sort((a, b) => a.x - b.x || a.y - b.y)
}

export type Sentence = { tokens: Token[]; footnote: string | null }

export function composeSentence(items: Placed[]): Sentence | null {
  const ordered = readingOrder(items)
  const pick = (slot: Slot) => ordered.filter((item) => item.fragment.slot === slot).map((item) => words(item.fragment, item.uid))

  const who = pick('who')
  const does = pick('does')
  const about = pick('about')
  if (!who.length && !does.length && !about.length) return null

  const marks = ordered.filter((item) => item.fragment.slot === 'mark')
  const exclaim = marks.some((item) => item.fragment.mark === 'exclaim')
  const footnote = marks.some((item) => item.fragment.mark === 'footnote')

  let tokens: Token[]
  if (who.length && does.length) tokens = [{ text: 'Jiani' }, { text: 'is' }, ...joinList(who), { text: 'who' }, ...joinList(does)]
  else if (who.length) tokens = [{ text: 'Jiani' }, { text: 'is' }, ...joinList(who)]
  else if (does.length) tokens = [{ text: 'Jiani' }, ...joinList(does)]
  else tokens = [{ text: 'Meet' }, { text: 'Jiani' }]

  for (const part of about) tokens = [...withTrailingComma(tokens), ...part]

  const last = tokens[tokens.length - 1]
  const end = `${exclaim ? '!' : '.'}${footnote ? '*' : ''}`
  tokens = [...tokens.slice(0, -1), { ...last, text: `${last.text}${end}` }]

  return { tokens, footnote: footnote ? FOOTNOTE : null }
}

export function sentenceText(sentence: Sentence): string {
  const body = sentence.tokens.map((token) => token.text).join(' ')
  return sentence.footnote ? `${body} ${sentence.footnote}` : body
}
