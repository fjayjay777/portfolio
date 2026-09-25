import { cleanup, render, screen } from '@testing-library/react'
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
