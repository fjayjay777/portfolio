import { expect, test } from 'vitest'
import { DEPTH, HEAD_ZONE, PILLOW, SPEAKER, coreBottom, coreTop, topHeight, zoneDistance } from './shape'

test('hits the three profile heights on the centre line', () => {
  expect(topHeight(0, 105)).toBeCloseTo(PILLOW.frontRoll)
  expect(topHeight(0, -112)).toBeCloseTo(PILLOW.rearRoll)
  expect(topHeight(0, -10)).toBeCloseTo(PILLOW.cradle)
})

test('raises the shoulder ends of the cradle for side sleepers but keeps the rolls level', () => {
  expect(topHeight(280, -10)).toBeGreaterThan(topHeight(0, -10) + 10)
  expect(topHeight(280, 105)).toBeCloseTo(PILLOW.frontRoll)
})

test('never rises above the neck roll', () => {
  for (let x = -300; x <= 300; x += 5) {
    for (let z = -180; z <= 180; z += 5) expect(topHeight(x, z)).toBeLessThanOrEqual(PILLOW.frontRoll + 1e-9)
  }
})

test('measures zones as negative inside, zero on the edge and positive outside', () => {
  expect(zoneDistance(HEAD_ZONE, HEAD_ZONE.cx, HEAD_ZONE.cz)).toBeLessThan(0)
  expect(zoneDistance(HEAD_ZONE, HEAD_ZONE.cx + HEAD_ZONE.halfX, HEAD_ZONE.cz)).toBeCloseTo(0)
  expect(zoneDistance(HEAD_ZONE, HEAD_ZONE.cx + HEAD_ZONE.halfX + 10, HEAD_ZONE.cz)).toBeCloseTo(10)
})

test('cuts the head-zone bed and the speaker pockets into the core', () => {
  expect(coreTop(0, 150)).toBeCloseTo(topHeight(0, 150) - DEPTH.comfort)
  expect(coreTop(0, 10)).toBeCloseTo(topHeight(0, 10) - DEPTH.sensor)
  expect(coreTop(SPEAKER.x, SPEAKER.z)).toBeCloseTo(topHeight(SPEAKER.x, SPEAKER.z) - DEPTH.comfort - SPEAKER.pocketDepth)
  expect(coreTop(-SPEAKER.x, SPEAKER.z)).toBeCloseTo(coreTop(SPEAKER.x, SPEAKER.z))
})

test('keeps the core at least half a millimetre thick everywhere', () => {
  for (let x = -280; x <= 280; x += 4) {
    for (let z = -160; z <= 160; z += 4) expect(coreTop(x, z) - coreBottom(x, z)).toBeGreaterThan(0.5)
  }
})
