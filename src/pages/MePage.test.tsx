import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test } from 'vitest'
import { MePage } from './MePage'

afterEach(cleanup)

test('shows only the two selected experience entries', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  const experience = screen.getByRole('region', { name: 'Experience' })

  expect(within(experience).getAllByRole('article')).toHaveLength(2)
  expect(within(experience).getByText('Ann Arbor Hands-On Museum')).toBeVisible()
  expect(
    within(experience).getByText('University of Michigan FEAST Research Program — Abriendo Caminos'),
  ).toBeVisible()
})

test('does not render the Skills & tools section', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  expect(screen.queryByRole('heading', { name: 'Skills & tools' })).not.toBeInTheDocument()
})

test('shows the merged biography and migrated skill tags', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  expect(
    screen.getByText('making complex information easier to understand and technology easier to use'),
  ).toHaveProperty('tagName', 'STRONG')
  expect(
    screen.getByText('product design, UX research, and front-end development'),
  ).toHaveProperty('tagName', 'STRONG')

  const skills = screen.getByRole('list', { name: 'Skills' })
  expect(within(skills).getAllByRole('listitem')).toHaveLength(4)
  expect(within(skills).getByText('Product design')).toBeVisible()
  expect(within(skills).getByText('UX research')).toBeVisible()
  expect(within(skills).getByText('Prototyping')).toBeVisible()
  expect(within(skills).getByText('Front-end development')).toBeVisible()
})
