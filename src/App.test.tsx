import { act, cleanup, render, screen, within } from '@testing-library/react'
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

test('shows the Claimly interaction flow on a zoomable canvas', async () => {
  const user = userEvent.setup()
  renderAt('/work/claimly')

  expect(screen.getByRole('img', { name: 'Claimly interaction flow' })).toBeInTheDocument()

  // jsdom has no layout, so the canvas starts at its full 100% size.
  const zoom = screen.getByRole('status')
  expect(zoom).toHaveTextContent('100%')
  await user.click(screen.getByRole('button', { name: 'Zoom in' }))
  expect(zoom).toHaveTextContent('125%')
  await user.click(screen.getByRole('button', { name: 'Fit' }))
  expect(zoom).toHaveTextContent('100%')
})

test('traces Claimly scenarios on the interaction flow', async () => {
  const user = userEvent.setup()
  renderAt('/work/claimly')

  // jsdom has no IntersectionObserver or SVG geometry, so the main path autoplays and shows whole.
  const scenarios = screen.getByRole('group', { name: 'Trace a scenario' })
  expect(within(scenarios).getByRole('button', { name: 'Dispute a charge' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('14 / 14 · Call the insurer')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'No errors found' }))
  expect(screen.getByText('08 / 08 · Add to spending')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Full flow' }))
  expect(screen.getByText('Pick a scenario to trace its path')).toBeInTheDocument()
  expect(within(scenarios).getByRole('button', { name: 'Full flow' })).toHaveAttribute('aria-pressed', 'true')
})

test('backs every Claimly finding with an evidence chain', () => {
  renderAt('/work/claimly')

  // Direct children only: each chain's own evidence list nests further list items.
  const findings = [...screen.getByRole('list', { name: 'Research findings' }).children] as HTMLElement[]
  expect(findings).toHaveLength(3)

  for (const finding of findings) {
    const chain = within(finding).getByLabelText('Evidence chain')
    expect([...chain.querySelectorAll('dt')].map((term) => term.textContent)).toEqual([
      'Evidence',
      'Insight',
      'Product decision',
      'Not yet validated',
    ])
  }

  expect(within(findings[1]).getByRole('heading')).toHaveTextContent('Knowing an appeal exists is not enough.')
  expect(within(findings[1]).getByText(/5 of 15\+ respondents/)).toBeInTheDocument()
  expect(within(findings[2]).getByText(/9 of 15\+ respondents/)).toBeInTheDocument()
})

test('splits each Claimly AI step between the model and the person', () => {
  renderAt('/work/claimly')

  const section = screen.getByRole('region', { name: 'AI design considerations' })
  const steps = within(within(section).getByRole('list', { name: /AI role and user control/ })).getAllByRole('listitem')
  expect(steps.map((step) => within(step).getByRole('heading').textContent)).toEqual([
    'Bill analysis',
    'EOB comparison',
    'Code explanation',
    'Appeal support',
  ])
  for (const step of steps) {
    expect(within(step).getByText('AI role')).toBeInTheDocument()
    expect(within(step).getByText('User control')).toBeInTheDocument()
  }
})

test('opens Claimly with one overview holding the problem, goal, and approach', () => {
  renderAt('/work/claimly')

  const sections = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
  expect(sections).toEqual([
    'Interactive demo',
    'Overview',
    'Research',
    'Interaction flow',
    'Product walkthrough',
    'Design decisions',
    'AI design considerations',
    'Outcome',
    'Reflection',
  ])

  const overview = screen.getByRole('region', { name: 'Overview' })
  expect(within(overview).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
    'Problem',
    'Design goal',
    'Approach',
  ])
  expect(within(overview).getByText(/How might we help patients/)).toHaveClass('case-goal')
})

test('centers Claimly text sections without oversized pull quotes', () => {
  renderAt('/work/claimly')

  expect(screen.getByRole('region', { name: 'Overview' })).toHaveClass('editorial-section')
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

// Every app case study opens the same way after its demo: one overview holding the problem, the
// design goal that answers it, and the approach.
test.each([
  ['/work/medisync', /How might we connect patients and providers/],
  ['/work/sizzle', /How might we give home cooks/],
])('opens %s with the shared overview', (path, goal) => {
  renderAt(path)

  const sections = screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent)
  expect(sections.slice(0, 3)).toEqual(['Interactive demo', 'Overview', 'Research'])

  const overview = screen.getByRole('region', { name: 'Overview' })
  expect(within(overview).getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent)).toEqual([
    'Problem',
    'Design goal',
    'Approach',
  ])
  expect(within(overview).getByText(goal)).toHaveClass('case-goal')
})

test('backs every Medisync finding with an evidence chain', () => {
  renderAt('/work/medisync')

  // Direct children only: each chain's own evidence list nests further list items.
  const findings = [...screen.getByRole('list', { name: 'Research findings' }).children] as HTMLElement[]
  expect(findings.map((finding) => within(finding).getByRole('heading').textContent)).toEqual([
    'Records live in too many places.',
    'Privacy is the barrier to sharing records.',
    'Care continues between visits and across a family.',
  ])
  for (const finding of findings) {
    expect(within(finding).getByLabelText('Evidence chain')).toBeInTheDocument()
  }
  expect(within(findings[0]).getByText(/56 of 70 respondents/)).toBeInTheDocument()
  expect(within(findings[1]).getByText(/59 of 70 respondents/)).toBeInTheDocument()
})

test('shows the Medisync swimlane flow on its case study page', () => {
  renderAt('/work/medisync')

  const flow = screen.getByRole('img', { name: 'Medisync interaction flow' })
  expect(flow).toBeInTheDocument()
  for (const lane of ['Watch', 'Patient app', 'Shared record', 'Clinic system']) {
    expect(within(flow).getByText(lane)).toBeInTheDocument()
  }
})

test('traces Medisync scenarios across the swimlanes', async () => {
  const user = userEvent.setup()
  renderAt('/work/medisync')

  // As on Claimly, jsdom shows the autoplayed path whole: booking to visit summary, then the one-tap rebook.
  const scenarios = screen.getByRole('group', { name: 'Trace a scenario' })
  expect(within(scenarios).getByRole('button', { name: 'Visit and rebook' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('13 / 13 · Upcoming visit')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Record round trip' }))
  expect(screen.getByText('11 / 11 · Read visit summary')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Keep a reading private' }))
  expect(screen.getByText('04 / 04 · Stays private')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Share an abnormal reading' }))
  expect(screen.getByText('05 / 05 · Doctor reviews')).toBeInTheDocument()
})

test('maps the Medisync information architecture beside the flow without clashing ids', () => {
  const { container } = renderAt('/work/medisync')

  const ia = screen.getByRole('img', { name: 'Medisync information architecture' })
  for (const tab of ['Home', 'Explore', 'Appointments', 'Files', 'Profile']) {
    expect(within(ia).getByText(tab)).toBeInTheDocument()
  }

  // Two diagrams share the page, so each needs its own arrow marker.
  expect(screen.getAllByRole('button', { name: 'Zoom in' })).toHaveLength(2)
  const markerIds = [...container.querySelectorAll('marker')].map((marker) => marker.id)
  expect(new Set(markerIds).size).toBe(2)
})

test('embeds the Medisync prototype on its case study page', () => {
  renderAt('/work/medisync')

  expect(screen.getByTitle('Medisync interactive prototype')).toHaveAttribute('src', '/demos/medisync/')
  expect(screen.getByRole('link', { name: 'Open Medisync demo' })).toHaveAttribute('href', '/demos/medisync/')
})

test('backs every Sizzle finding with an evidence chain', () => {
  renderAt('/work/sizzle')

  const findings = [...screen.getByRole('list', { name: 'Research findings' }).children] as HTMLElement[]
  expect(findings.map((finding) => within(finding).getByRole('heading').textContent)).toEqual([
    'Recipes are hard to find, not scarce.',
    'Cooking is planned around the week.',
    'Cooks want to contribute, not only browse.',
  ])
  for (const finding of findings) {
    expect(within(finding).getByLabelText('Evidence chain')).toBeInTheDocument()
  }
  expect(within(findings[1]).getByText(/85% found it within two minutes/)).toBeInTheDocument()
})

test('traces Sizzle scenarios across the app areas', async () => {
  const user = userEvent.setup()
  renderAt('/work/sizzle')

  const flow = screen.getByRole('img', { name: 'Sizzle interaction flow' })
  for (const lane of ['Explore', 'Recipe', 'Meal plans · History', 'Me · Kitchen']) {
    expect(within(flow).getByText(lane)).toBeInTheDocument()
  }

  const scenarios = screen.getByRole('group', { name: 'Trace a scenario' })
  expect(within(scenarios).getByRole('button', { name: 'Cook something new' })).toHaveAttribute('aria-pressed', 'true')
  expect(screen.getByText('06 / 06 · Rate the recipe')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Search and save' }))
  expect(screen.getByText('05 / 05 · Saved')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Plan the week' }))
  expect(screen.getByText('04 / 04 · Shopping list')).toBeInTheDocument()

  await user.click(within(scenarios).getByRole('button', { name: 'Stock the fridge' }))
  expect(screen.getByText('04 / 04 · Added to fridge')).toBeInTheDocument()
})

test('slides the case study nav away on scroll down and back on scroll up', () => {
  renderAt('/work/sizzle')
  const header = screen.getByRole('navigation', { name: 'Primary navigation' }).closest('header') as HTMLElement
  const scrollTo = (y: number) => {
    Object.defineProperty(window, 'scrollY', { configurable: true, value: y })
    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })
  }

  expect(header).not.toHaveClass('site-header--hidden')
  scrollTo(600)
  expect(header).toHaveClass('site-header--hidden')
  scrollTo(560)
  expect(header).not.toHaveClass('site-header--hidden')
  scrollTo(900)
  expect(header).toHaveClass('site-header--hidden')
  // Back at the top the bar always shows.
  scrollTo(0)
  expect(header).not.toHaveClass('site-header--hidden')
})

test('shows a back-to-top button on every case study once the reader scrolls', async () => {
  const user = userEvent.setup()
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)

  for (const path of ['/work/claimly', '/work/medisync', '/work/sizzle', '/work/nighty']) {
    renderAt(path)
    // Hidden at the top of the page, where the nav and hero are still in reach.
    expect(screen.queryByRole('button', { name: 'Back to top' })).not.toBeInTheDocument()

    Object.defineProperty(window, 'scrollY', { configurable: true, value: window.innerHeight * 2 })
    window.dispatchEvent(new Event('scroll'))
    const button = await screen.findByRole('button', { name: 'Back to top' })

    scrollTo.mockClear()
    await user.click(button)
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))

    Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
    cleanup()
  }
  scrollTo.mockRestore()
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
  expect(screen.getAllByText(/3D model can’t load/)).toHaveLength(2)
  expect(screen.queryByRole('slider', { name: 'Explode amount' })).not.toBeInTheDocument()
})

test('walks from Sizzle to Nighty and from Nighty back to Claimly', async () => {
  const user = userEvent.setup()
  renderAt('/work/sizzle')

  await user.click(screen.getByRole('link', { name: /Next project\s*Nighty/i }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByRole('link', { name: /Next project\s*Claimly/i })).toHaveAttribute('href', '/work/claimly')
})
