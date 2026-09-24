import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import { NightyPage } from './NightyPage'

// Pretend WebGL exists so the controls render; the scene itself never starts.
vi.mock('../nighty/stage', () => ({ hasWebGL: () => true, createStage: () => ({ dispose: () => undefined }) }))

afterEach(cleanup)

function renderPage() {
  return render(<MemoryRouter><NightyPage /></MemoryRouter>)
}

test('explodes and reassembles from the toggle', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Explode' }))
  expect(screen.getByRole('slider', { name: 'Explode amount' })).toHaveValue('100')
  await user.click(screen.getByRole('button', { name: 'Assemble' }))
  expect(screen.getByRole('slider', { name: 'Explode amount' })).toHaveValue('0')
})

test('selects a part from the list and clears it on a second press', async () => {
  const user = userEvent.setup()
  renderPage()

  const core = screen.getByRole('button', { name: /Contoured support core/ })
  await user.click(core)
  expect(core).toHaveAttribute('aria-pressed', 'true')
  await user.click(core)
  expect(core).toHaveAttribute('aria-pressed', 'false')
})
