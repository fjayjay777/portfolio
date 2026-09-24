import { expect, test } from 'vitest'
import { partProgress } from './explode'
import { parts } from './parts'
import { BASE_THICKNESS, BOARD } from './shape'

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

test('gives every part its own place in the explode sequence', () => {
  expect(parts.map((part) => part.sequence).sort((a, b) => a - b)).toEqual(parts.map((_, index) => index))
})

test('drops the base panel out of the way before the board passes through its footprint', () => {
  const base = parts.find((part) => part.id === 'base')!
  const board = parts.find((part) => part.id === 'board')!
  for (let step = 0; step <= 200; step++) {
    const amount = step / 200
    const baseTop = BASE_THICKNESS + base.offset[1] * partProgress(amount, base.sequence, parts.length)
    const boardBottom = BOARD.y + board.offset[1] * partProgress(amount, board.sequence, parts.length)
    expect(boardBottom).toBeGreaterThanOrEqual(baseTop)
  }
})
