import { beforeAll, expect, test, vi } from 'vitest'
import { buildNightyModel } from './model'
import { parts } from './parts'

// jsdom has no 2D canvas; the model must still build, just without painted maps.
beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
})

test('builds one group per part, in order, each with something to pick', () => {
  const model = buildNightyModel()
  expect(model.parts.map((part) => part.id)).toEqual(parts.map((part) => part.id))

  for (const part of model.parts) {
    expect(part.group.children.length).toBeGreaterThan(0)
    expect(part.hitTargets.length).toBeGreaterThan(0)
    expect(part.hitTargets.every((target) => target.userData.partId === part.id)).toBe(true)
    expect([part.anchor.x, part.anchor.y, part.anchor.z, part.floor].every(Number.isFinite)).toBe(true)
    expect(part.materials.length).toBeGreaterThan(0)
  }

  model.dispose()
})

test('puts the speakers in both shoulder ends and the pod at the rear', () => {
  const model = buildNightyModel()
  const speakers = model.parts.find((part) => part.id === 'speakers')!
  const xs = speakers.group.children.map((child) => Math.sign(child.position.x)).sort()
  expect(xs).toEqual([-1, 1])
  const pod = model.parts.find((part) => part.id === 'pod')!
  expect(pod.anchor.z).toBeLessThan(-140)
  model.dispose()
})
