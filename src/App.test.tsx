import { cleanup, render, screen, within } from '@testing-library/react'
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

test('centers Claimly text sections without oversized pull quotes', () => {
  renderAt('/work/claimly')

  expect(screen.getByRole('region', { name: 'Overview' })).toHaveClass('claimly-text-section')
  expect(screen.getByLabelText('Research findings')).toBeVisible()
  expect(screen.getByText('01', { selector: '.finding-index' })).toBeVisible()
  expect(screen.queryByText('The document creates the doubt. Claimly gives the user enough evidence to act on it.')).not.toBeInTheDocument()
  expect(screen.queryByText('The last mile is still a phone call.')).not.toBeInTheDocument()
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
  expect(screen.getByText(/second-year graduate student/i)).toBeVisible()
  expect(screen.getByRole('link', { name: 'ME' })).toHaveAttribute('aria-current', 'page')
  expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/#contact')
})

test('renders the Nighty case study, its facts and every part without WebGL', async () => {
  renderAt('/work/nighty')

  expect(await screen.findByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByText('June 2024')).toBeVisible()
  expect(screen.getByText('Product design')).toBeVisible()
  expect(within(screen.getByRole('list', { name: 'Parts' })).getAllByRole('button')).toHaveLength(10)
  // Both viewers fall back to a notice, and the controls that need a model are left out.
  expect(screen.getAllByText(/WebGL turned off/)).toHaveLength(2)
  expect(screen.queryByRole('slider', { name: 'Explode amount' })).not.toBeInTheDocument()
})

test('walks from Sizzle to Nighty and from Nighty back to Claimly', async () => {
  const user = userEvent.setup()
  renderAt('/work/sizzle')

  await user.click(screen.getByRole('link', { name: /Next project\s*Nighty/i }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByRole('link', { name: /Next project\s*Claimly/i })).toHaveAttribute('href', '/work/claimly')
})
