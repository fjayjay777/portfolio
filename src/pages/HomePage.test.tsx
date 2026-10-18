import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import { HomePage } from './HomePage'

afterEach(cleanup)

test('does not repeat About content or show a Skills navigation link', () => {
  Element.prototype.scrollIntoView = vi.fn()

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  expect(screen.queryByRole('heading', { name: 'About' })).not.toBeInTheDocument()
  expect(screen.queryByRole('list', { name: 'Skills' })).not.toBeInTheDocument()
  expect(screen.queryByRole('link', { name: 'Skills' })).not.toBeInTheDocument()
})

test('lists Nighty as the fourth work', () => {
  Element.prototype.scrollIntoView = vi.fn()

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Nighty case study' })).toHaveAttribute('href', '/work/nighty')
  expect(screen.getByText('04', { selector: '.count' })).toBeInTheDocument()
})

test('shows the four works as cards, in order, each with its index and category', () => {
  Element.prototype.scrollIntoView = vi.fn()

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  const cards = screen.getAllByRole('link', { name: /case study$/ })
  expect(cards.map((card) => card.getAttribute('aria-label'))).toEqual([
    'Claimly case study',
    'Medisync case study',
    'Sizzle case study',
    'Nighty case study',
  ])
  expect(cards[0]).toHaveTextContent('01')
  expect(cards[0]).toHaveTextContent('Financial clarity')
  expect(cards[3]).toHaveTextContent('04')
  expect(cards[3]).toHaveTextContent('Sleep technology')
})

test('copies the email from the contact section and confirms it', async () => {
  Element.prototype.scrollIntoView = vi.fn()
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  // The heading is split into letters for its animation but still reads as one name.
  expect(screen.getByRole('heading', { name: 'Let’s Talk' })).toBeInTheDocument()
  expect(screen.getByText(/Local time in Ann Arbor/)).toBeInTheDocument()

  fireEvent.click(screen.getByRole('button', { name: 'Copy' }))
  expect(writeText).toHaveBeenCalledWith('huangjn35@gmail.com')
  expect(await screen.findByRole('button', { name: 'Copied ✓' })).toHaveClass('is-copied')
})
