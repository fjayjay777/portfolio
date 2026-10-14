import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, expect, test } from 'vitest'
import { PlaygroundPage } from './PlaygroundPage'

beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

afterEach(cleanup)

function renderPage() {
  render(<MemoryRouter initialEntries={['/playground']}><PlaygroundPage /></MemoryRouter>)
  return screen.getByRole('region', { name: 'Collage board' })
}

const said = () => screen.getByText((_, element) => element?.getAttribute('aria-live') === 'polite').textContent

test('starts with a collage that already reads as a sentence', () => {
  const board = renderPage()
  expect(screen.getByRole('link', { name: 'Playground' })).toHaveAttribute('aria-current', 'page')
  expect(within(board).getByRole('button', { name: 'UX designer sticker' })).toBeInTheDocument()
  expect(said()).toBe('Jiani is a UX designer, based in Ann Arbor, with four cats never far away.')
})

test('adding and removing stickers rewrites the sentence', () => {
  const board = renderPage()

  fireEvent.click(screen.getByRole('button', { name: 'Add Claimly' }))
  expect(within(board).getByRole('button', { name: 'Claimly sticker' })).toBeInTheDocument()
  expect(said()).toContain('who designed an app that spots wrong charges on medical bills')

  fireEvent.keyDown(within(board).getByRole('button', { name: 'Claimly sticker' }), { key: 'Delete' })
  expect(within(board).queryByRole('button', { name: 'Claimly sticker' })).not.toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Clear' }))
  expect(said()).toBe('')
})
