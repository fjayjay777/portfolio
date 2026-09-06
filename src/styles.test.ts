import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from 'vitest'

const styles = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), 'styles.css'), 'utf8')

test('adds a bounded ultrawide layout layer without changing smaller breakpoints', () => {
  const ultrawideStart = styles.indexOf('@media (min-width: 1440px)')
  const tabletStart = styles.indexOf('@media (max-width: 900px)')

  expect(ultrawideStart).toBeGreaterThan(-1)
  expect(tabletStart).toBeGreaterThan(ultrawideStart)

  const ultrawide = styles.slice(ultrawideStart, tabletStart)

  expect(ultrawide).toContain('clamp(1080px, 75vw, 1440px)')
  expect(ultrawide).toContain('min-height: calc(100svh - var(--nav-height))')
  expect(ultrawide).toContain('.case-body { max-width: 74ch; }')
  expect(ultrawide).toContain('.mobile-demo { width: min(100%, 340px); }')
})
