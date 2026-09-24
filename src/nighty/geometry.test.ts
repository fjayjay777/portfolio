import { expect, test } from 'vitest'
import { contouredSlab, type SlabOptions } from './geometry'

const flat: SlabOptions = {
  width: 100,
  depth: 60,
  thickness: 10,
  radius: 8,
  radiusY: 4,
  segments: [20, 4, 12],
  bottom: () => 0,
  top: () => 10,
}

test('fills its footprint and spans the two height fields', () => {
  const box = contouredSlab(flat).boundingBox!
  expect(box.min.x).toBeCloseTo(-50, 3)
  expect(box.max.x).toBeCloseTo(50, 3)
  expect(box.min.z).toBeCloseTo(-30, 3)
  expect(box.max.z).toBeCloseTo(30, 3)
  expect(box.min.y).toBeCloseTo(0, 6)
  expect(box.max.y).toBeCloseTo(10, 6)
})

test('follows a sloped top at each vertex', () => {
  const box = contouredSlab({ ...flat, top: (x) => 10 + x / 10 }).boundingBox!
  expect(box.max.y).toBeGreaterThan(14)
  expect(box.max.y).toBeLessThan(15)
})

test('moves the footprint to its centre', () => {
  const box = contouredSlab({ ...flat, center: [30, -20] }).boundingBox!
  expect(box.min.x).toBeCloseTo(-20, 3)
  expect(box.max.z).toBeCloseTo(10, 3)
})

test('produces finite positions and unit normals, shared across the box seams', () => {
  const geometry = contouredSlab(flat)
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const seen = new Map<string, [number, number, number]>()

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    expect(Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)).toBe(true)
    const n: [number, number, number] = [normal.getX(i), normal.getY(i), normal.getZ(i)]
    expect(Math.hypot(...n)).toBeCloseTo(1, 4)

    const key = `${Math.round(x * 20)}|${Math.round(y * 20)}|${Math.round(z * 20)}`
    const other = seen.get(key)
    if (other) n.forEach((value, axis) => expect(value).toBeCloseTo(other[axis], 4))
    else seen.set(key, n)
  }
})

test('lays UVs out in millimetres of the flat slab', () => {
  const uv = contouredSlab(flat).getAttribute('uv')
  let min = Infinity, max = -Infinity
  for (let i = 0; i < uv.count; i++) {
    min = Math.min(min, uv.getX(i))
    max = Math.max(max, uv.getX(i))
  }
  expect(max - min).toBeCloseTo(100, 3)
})
