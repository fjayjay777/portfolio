import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import { NightyPage } from './NightyPage'

// Pretend WebGL exists so the controls render; the scene itself never starts.
const createStage = vi.hoisted(() => vi.fn(() => ({ dispose: () => undefined })))
vi.mock('../nighty/stage', () => ({ hasWebGL: () => true, createStage }))

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

// On a phone the list sits below the model and the labels are hidden, so the stage names the part itself.
test('names the selected part inside the model stage', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: /Sleep-sensing strip/ }))
  expect(screen.getByText('05 · Sleep-sensing strip')).toBeInTheDocument()
})

test('keeps the page up and explains itself when the renderer cannot start', () => {
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  createStage.mockImplementationOnce(() => {
    throw new Error('Error creating WebGL context.')
  })
  renderPage()

  expect(screen.getByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByText(/3D model can’t load/)).toBeVisible()
})
