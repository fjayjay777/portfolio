import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { NightyViewer } from './NightyViewer'

afterEach(cleanup)

test('explains itself instead of rendering when WebGL is unavailable', () => {
  render(<NightyViewer label="Nighty pillow" explode={0} />)
  expect(screen.getByText(/WebGL/)).toBeVisible()
  expect(document.querySelector('canvas')).toBeNull()
})
