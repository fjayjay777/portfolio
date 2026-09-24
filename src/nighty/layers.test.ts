import { expect, test } from 'vitest'
import { LAYER_IDS, layerGeometry } from './layers'
import { PILLOW, topHeight } from './shape'

const inner = LAYER_IDS.filter((id) => id !== 'cover')

test('the cover matches the pillow outline', () => {
  const box = layerGeometry('cover').boundingBox!
  expect(box.min.x).toBeCloseTo(-PILLOW.width / 2, 1)
  expect(box.max.x).toBeCloseTo(PILLOW.width / 2, 1)
  expect(box.min.z).toBeCloseTo(-PILLOW.depth / 2, 1)
  expect(box.max.z).toBeCloseTo(PILLOW.depth / 2, 1)
  expect(box.min.y).toBeCloseTo(0, 3)
  expect(box.max.y).toBeCloseTo(PILLOW.frontRoll, 1)
})

test.each(inner)('%s sits inside the cover and under its top surface', (id) => {
  const geometry = layerGeometry(id)
  expect(layerGeometry('cover').boundingBox!.containsBox(geometry.boundingBox!)).toBe(true)

  const position = geometry.getAttribute('position')
  for (let i = 0; i < position.count; i += 7) {
    expect(position.getY(i)).toBeLessThanOrEqual(topHeight(position.getX(i), position.getZ(i)) + 1e-6)
  }
})

test.each(LAYER_IDS)('%s has finite positions at both levels of detail', (id) => {
  for (const detail of ['full', 'proxy'] as const) {
    const values = layerGeometry(id, detail).getAttribute('position').array
    expect(values.every(Number.isFinite)).toBe(true)
  }
})

test('proxies are much lighter than the meshes they stand in for', () => {
  for (const id of LAYER_IDS) {
    expect(layerGeometry(id, 'proxy').getAttribute('position').count * 20).toBeLessThan(layerGeometry(id).getAttribute('position').count)
  }
})

test('builds each geometry once', () => {
  expect(layerGeometry('core')).toBe(layerGeometry('core'))
})
