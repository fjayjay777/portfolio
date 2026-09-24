import { expect, test } from 'vitest'
import { partProgress, scaleOffset } from './explode'

const count = 10

test('every part is home when assembled and has arrived when fully exploded', () => {
  for (let index = 0; index < count; index++) {
    expect(partProgress(0, index, count)).toBe(0)
    expect(partProgress(1, index, count)).toBe(1)
  }
})

test('progress never moves backwards as the slider advances', () => {
  for (let index = 0; index < count; index++) {
    let previous = 0
    for (let step = 0; step <= 100; step++) {
      const progress = partProgress(step / 100, index, count)
      expect(progress).toBeGreaterThanOrEqual(previous)
      previous = progress
    }
  }
})

test('outer parts leave before inner ones', () => {
  expect(partProgress(0.3, 0, count)).toBeGreaterThan(partProgress(0.3, count - 1, count))
})

test('clamps amounts outside 0 to 1', () => {
  expect(partProgress(-0.5, 3, count)).toBe(0)
  expect(partProgress(1.5, 3, count)).toBe(1)
})

test('scales an offset by progress', () => {
  expect(scaleOffset([10, -20, 30], 0.5)).toEqual([5, -10, 15])
})
