import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test } from 'vitest'
import { MePage } from './MePage'

afterEach(cleanup)

test('shows all three current experience entries', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  const experience = screen.getByRole('region', { name: 'Experience' })

  expect(within(experience).getAllByRole('article')).toHaveLength(3)
  expect(within(experience).getByText('User Experience Project Consultant')).toBeVisible()
  expect(within(experience).getByText('Ann Arbor Hands-On Museum')).toBeVisible()
  expect(
    within(experience).getByText('University of Michigan FEAST Research Program, Abriendo Caminos'),
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

test('shows the biography and skill tags', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  expect(screen.getByText(/making complex information easier and more intuitive/)).toBeVisible()
  expect(screen.getByText(/medical bills full of reason codes/)).toBeVisible()

  const skills = screen.getByRole('list', { name: 'Skills' })
  expect(within(skills).getAllByRole('listitem')).toHaveLength(4)
  expect(within(skills).getByText('Product design')).toBeVisible()
  expect(within(skills).getByText('UX research')).toBeVisible()
  expect(within(skills).getByText('Prototyping')).toBeVisible()
  expect(within(skills).getByText('Front-end development')).toBeVisible()
})

test('closes the page with a footer offering both exits', () => {
  render(
    <MemoryRouter>
      <MePage />
    </MemoryRouter>,
  )

  const footer = screen.getByRole('contentinfo')

  expect(within(footer).getByRole('link', { name: /Selected works/ })).toHaveAttribute('href', '/#works')
  expect(within(footer).getByText('Claimly · Medisync · Sizzle')).toBeVisible()
  expect(within(footer).getByRole('link', { name: /Huangjn35@gmail.com/ })).toHaveAttribute(
    'href',
    'mailto:huangjn35@gmail.com',
  )

  const linkedin = within(footer).getByRole('link', { name: /LinkedIn/ })
  expect(linkedin).toHaveAttribute('target', '_blank')
  expect(linkedin).toHaveAttribute('rel', 'noreferrer')
})
