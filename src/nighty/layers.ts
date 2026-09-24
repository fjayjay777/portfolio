import type { BufferGeometry } from 'three'
import { contouredSlab, type SlabOptions } from './geometry'
import { BASE_THICKNESS, DEPTH, GEL_ZONE, HEATER_ZONE, PILLOW, SENSOR_ZONE, coreBottom, coreTop, topHeight, type Zone } from './shape'

export type LayerId = 'cover' | 'comfort' | 'gel' | 'heater' | 'sensor' | 'core' | 'base'

export const LAYER_IDS: readonly LayerId[] = ['cover', 'comfort', 'gel', 'heater', 'sensor', 'core', 'base']

const below = (depth: number) => (x: number, z: number) => topHeight(x, z) - depth

function footprint(zone: Zone) {
  return { width: zone.halfX * 2, depth: zone.halfZ * 2, center: [zone.cx, zone.cz] as const, radius: zone.radius }
}

/*
 * Inner layers are inset from the cover far enough to clear its rounded edges,
 * so nothing shows through when the pillow is assembled. Grid spacing is about
 * 2 to 2.5 mm on the large parts, fine enough for the core's pockets.
 */
const SPECS: Record<LayerId, SlabOptions> = {
  cover: {
    width: PILLOW.width, depth: PILLOW.depth, thickness: 90, radius: 40, radiusY: 24,
    segments: [240, 36, 144], bottom: () => 0, top: topHeight,
  },
  comfort: {
    width: 540, depth: 300, thickness: 20, radius: 30, radiusY: 6,
    segments: [216, 8, 120], bottom: below(DEPTH.comfort), top: below(DEPTH.cover),
  },
  gel: { ...footprint(GEL_ZONE), thickness: 6, radiusY: 2.6, segments: [150, 4, 90], bottom: below(DEPTH.gel), top: below(DEPTH.comfort) },
  heater: { ...footprint(HEATER_ZONE), thickness: 1.2, radiusY: 0.6, segments: [140, 2, 80], bottom: below(DEPTH.heater), top: below(DEPTH.gel) },
  sensor: { ...footprint(SENSOR_ZONE), thickness: 1, radiusY: 0.5, segments: [128, 2, 24], bottom: below(DEPTH.sensor), top: below(DEPTH.heater) },
  core: {
    width: 560, depth: 320, thickness: 60, radius: 34, radiusY: 16, segments: [280, 24, 160],
    bottom: (x, z) => Math.min(coreBottom(x, z), coreTop(x, z) - 0.5), top: coreTop,
  },
  base: {
    width: 540, depth: 300, thickness: 2.6, radius: 30, radiusY: 1.3,
    segments: [108, 2, 60], bottom: () => 0.4, top: () => BASE_THICKNESS,
  },
}

const cache = new Map<string, BufferGeometry>()

/**
 * The geometry for one layer, built on first use and shared from then on, by
 * both viewers and across remounts. `proxy` is a coarse copy used for picking.
 */
export function layerGeometry(id: LayerId, detail: 'full' | 'proxy' = 'full'): BufferGeometry {
  const key = `${id}:${detail}`
  let geometry = cache.get(key)
  if (!geometry) {
    const spec = SPECS[id]
    const [sx, , sz] = spec.segments
    const segments = detail === 'full' ? spec.segments : ([Math.max(4, Math.round(sx / 10)), 2, Math.max(4, Math.round(sz / 10))] as const)
    geometry = contouredSlab({ ...spec, segments })
    cache.set(key, geometry)
  }
  return geometry
}
