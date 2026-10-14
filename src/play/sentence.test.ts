import { describe, expect, test } from 'vitest'
import { FOOTNOTE, composeSentence, sentenceText, type Fragment, type Placed } from './sentence'

let n = 0
const at = (x: number, fragment: Fragment, y = 0.5): Placed => ({ uid: `u${++n}`, x, y, fragment })
const who = (text: string): Fragment => ({ slot: 'who', text })
const does = (text: string): Fragment => ({ slot: 'does', text })
const about = (text: string): Fragment => ({ slot: 'about', text })
const read = (items: Placed[]) => {
  const sentence = composeSentence(items)
  return sentence && sentenceText(sentence)
}

describe('composeSentence', () => {
  test('stays silent with nothing that has words', () => {
    expect(composeSentence([])).toBeNull()
    expect(composeSentence([at(0.5, { slot: 'none', text: '' }), at(0.2, { slot: 'mark', text: '', mark: 'exclaim' })])).toBeNull()
  })

  test('joins identity and action with who', () => {
    expect(read([at(0.1, who('a UX designer')), at(0.6, does('paints'))])).toBe('Jiani is a UX designer who paints.')
  })

  test('reads stickers left to right', () => {
    const items = [at(0.8, who('an oil painter')), at(0.2, who('a UX designer'))]
    expect(read(items)).toBe('Jiani is a UX designer and an oil painter.')
    items[0].x = 0.05
    expect(read(items)).toBe('Jiani is an oil painter and a UX designer.')
  })

  test('uses a serial comma for three or more', () => {
    expect(read([at(0.1, does('designs')), at(0.2, does('paints')), at(0.3, does('codes'))])).toBe('Jiani designs, paints, and codes.')
  })

  test('adds a comma when the first of two phrases already has an and', () => {
    expect(read([at(0.1, does('speaks Chinese and English')), at(0.2, does('cooks'))])).toBe('Jiani speaks Chinese and English, and cooks.')
  })

  test('hangs trailing phrases off the end with commas', () => {
    expect(read([at(0.1, who('a UX designer')), at(0.4, about('based in Ann Arbor')), at(0.9, about('with a cat'))]))
      .toBe('Jiani is a UX designer, based in Ann Arbor, with a cat.')
    expect(read([at(0.4, about('based in Ann Arbor'))])).toBe('Meet Jiani, based in Ann Arbor.')
  })

  test('marks change punctuation and add the footnote', () => {
    const sentence = composeSentence([
      at(0.1, who('a UX designer')),
      at(0.5, { slot: 'mark', text: '', mark: 'exclaim' }),
      at(0.6, { slot: 'mark', text: '', mark: 'footnote' }),
    ])
    expect(sentence?.tokens.at(-1)?.text).toBe('designer!*')
    expect(sentence?.footnote).toBe(FOOTNOTE)
  })

  test('tags each word with the sticker it came from', () => {
    const sticker = at(0.3, who('a UX designer'))
    const sources = composeSentence([sticker])!.tokens.map((token) => token.source)
    expect(sources).toEqual([undefined, undefined, sticker.uid, sticker.uid, sticker.uid])
  })
})
