import type { Vec3 } from './parts'

/** Share of the slider between one part starting to move and the next. */
const STAGGER = 0.06

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)

/**
 * How far part `index` of `count` has travelled, 0 to 1, when the whole view
 * is `amount` exploded. Parts leave in list order, so the cover lifts first,
 * and every part has arrived by the time `amount` reaches 1.
 */
export function partProgress(amount: number, index: number, count: number): number {
  const stagger = count > 1 ? Math.min(STAGGER, 0.5 / (count - 1)) : 0
  const span = 1 - stagger * (count - 1)
  return easeInOutCubic(clamp01((clamp01(amount) - stagger * index) / span))
}

export function scaleOffset(offset: Vec3, progress: number): Vec3 {
  return [offset[0] * progress, offset[1] * progress, offset[2] * progress]
}
