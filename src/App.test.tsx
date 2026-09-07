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

test('opens the Claimly case study from the work index', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(screen.getByRole('link', { name: /Claimly case study/i }))

  expect(await screen.findByRole('heading', { level: 1, name: 'Claimly' })).toBeInTheDocument()
})

// The prototype used to live in a homepage dialog; it now sits on the case page.
test('embeds the Claimly prototype and provides a direct demo link', () => {
  renderAt('/work/claimly')

  expect(screen.getByTitle('Claimly interactive prototype')).toHaveAttribute('src', '/demos/claimly/')
  expect(screen.getByRole('link', { name: 'Open Claimly demo' })).toHaveAttribute('href', '/demos/claimly/')
})

test('opens the Medisync case study from the work index', async () => {
  const user = userEvent.setup()
  renderAt('/')

  await user.click(screen.getByRole('link', { name: /Medisync case study/i }))

  expect(await screen.findByRole('heading', { level: 1, name: 'Medisync' })).toBeVisible()
  expect(screen.getByRole('heading', { name: 'Product walkthrough' })).toBeVisible()
})

test('embeds the Medisync prototype on its case study page', () => {
  renderAt('/work/medisync')

  expect(screen.getByTitle('Medisync interactive prototype')).toHaveAttribute('src', '/demos/medisync/')
  expect(screen.getByRole('link', { name: 'Open Medisync demo' })).toHaveAttribute('href', '/demos/medisync/')
})

test('renders the Me page profile and preserves Contact navigation', () => {
  renderAt('/me')

  expect(screen.getByRole('heading', { name: 'Jiani Huang' })).toBeVisible()
  expect(screen.getByText(/came to user experience from painting/i)).toBeVisible()
  expect(screen.getByRole('link', { name: 'ME' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact')
})
