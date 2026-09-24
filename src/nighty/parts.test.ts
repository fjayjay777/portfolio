import { expect, test } from 'vitest'
import { parts } from './parts'

test('lists ten numbered parts in order', () => {
  expect(parts).toHaveLength(10)
  expect(parts.map((part) => part.number)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'])
})

test('gives every part a unique id, a name, a role and a description', () => {
  expect(new Set(parts.map((part) => part.id)).size).toBe(parts.length)
  for (const part of parts) {
    expect(part.name).not.toBe('')
    expect(part.role).not.toBe('')
    expect(part.description.length).toBeGreaterThan(40)
  }
})

test('keeps the support core fixed as the anchor of the exploded view', () => {
  expect(parts.find((part) => part.id === 'core')?.offset).toEqual([0, 0, 0])
})
