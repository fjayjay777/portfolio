import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App'

const scrollIntoView = vi.fn()

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  scrollIntoView.mockReset()
  Element.prototype.scrollIntoView = scrollIntoView
})

afterEach(cleanup)

test('scrolls to works from Homepage navigation', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(screen.getByRole('link', { name: 'Works' }))

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
})

test('sends Contact from Me to the Homepage contact area', async () => {
  const user = userEvent.setup()
  renderAt('/me')

  await user.click(screen.getByRole('link', { name: 'Contact' }))

  expect(await screen.findByRole('heading', { name: 'Let’s Talk' })).toBeInTheDocument()
  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
})

test('opens Claimly project details and restores trigger focus after Escape', async () => {
  const user = userEvent.setup()
  renderAt('/')
  const trigger = screen.getByRole('button', { name: /Claimly project/i })

  await user.click(trigger)

  expect(screen.getByRole('dialog', { name: 'Claimly project details' })).toBeVisible()

  await user.keyboard('{Escape}')

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

test('renders the Me page profile and preserves Contact navigation', () => {
  renderAt('/me')

  expect(screen.getByRole('heading', { name: 'Jiani Huang' })).toBeVisible()
  expect(screen.getByText(/designer and developer with eight years/i)).toBeVisible()
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact')
})
