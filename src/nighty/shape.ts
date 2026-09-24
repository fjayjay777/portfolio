/*
 * Nighty's form, in millimetres. x runs across the width, z from the rear
 * (negative) to the front neck roll (positive), and y is height above the bed.
 * Everything here is plain arithmetic so the geometry can be tested without a GPU.
 */

export const PILLOW = { width: 600, depth: 360, frontRoll: 110, rearRoll: 90, cradle: 70 } as const

/** How far below the top surface each layer's underside sits. */
export const DEPTH = { cover: 3, comfort: 23, gel: 29, heater: 30.2, sensor: 31.2 } as const

/** The base panel's thickness; the core rests on it. */
export const BASE_THICKNESS = 3

/** A rounded rectangle in plan: centre, half sizes and corner radius. */
export type Zone = { cx: number; cz: number; halfX: number; halfZ: number; radius: number }

/** The recess in the core where the gel, heating film and sensor strip stack. */
export const HEAD_ZONE: Zone = { cx: 0, cz: 10, halfX: 190, halfZ: 115, radius: 24 }
export const GEL_ZONE: Zone = { cx: 0, cz: 10, halfX: 186, halfZ: 111, radius: 22 }
export const HEATER_ZONE: Zone = { cx: 0, cz: 10, halfX: 172, halfZ: 100, radius: 16 }
/** Under the neck roll, where breathing and heartbeat come through the foam most clearly. */
export const SENSOR_ZONE: Zone = { cx: 0, cz: 75, halfX: 160, halfZ: 26, radius: 10 }
/** A pocket in the core's underside that holds the main board. */
export const BOARD_BAY: Zone = { cx: 0, cz: -110, halfX: 66, halfZ: 42, radius: 6 }
/** Runs out past the core's rear edge so the pod can sit in the cover's rear panel. */
export const POD_NOTCH: Zone = { cx: 0, cz: -172, halfX: 78, halfZ: 28, radius: 4 }
/** Grooves that carry air from the pod's fan forward into the head zone. */
export const CHANNELS: readonly Zone[] = [-60, 0, 60].map((cx) => ({ cx, cz: -126, halfX: 6, halfZ: 34, radius: 6 }))
/** NTC probe positions on the heating film, relative to its zone centre. */
export const HEATER_PROBES: readonly (readonly [number, number])[] = [[-110, -45], [110, -45], [-110, 45], [110, 45]]

export const SPEAKER = { x: 228, z: 0, radius: 25, height: 10.4, pocketRadius: 27, pocketDepth: 12 } as const
export const BOARD = { width: 120, depth: 76, thickness: 1.6, y: 6, cz: -110 } as const
export const POD = { width: 150, height: 30, depth: 34, y: 12, rearZ: -182 } as const

const BOARD_BAY_HEIGHT = 22
/** Just above the fan's blades, and still below the air channels' floor. */
const POD_NOTCH_HEIGHT = 45.5

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/**
 * Profile control points across the depth, as [z, height]. Each span eases in
 * and out, so every point is a flat crest or trough.
 */
const PROFILE: readonly (readonly [number, number])[] = [
  [-180, 84],
  [-112, PILLOW.rearRoll],
  [-10, PILLOW.cradle],
  [105, PILLOW.frontRoll],
  [180, 100],
]
const CRADLE_Z = -10
const WING_LIFT = 12

export function profileHeight(z: number): number {
  if (z <= PROFILE[0][0]) return PROFILE[0][1]
  for (let i = 1; i < PROFILE.length; i++) {
    const [z1, h1] = PROFILE[i]
    if (z <= z1) {
      const [z0, h0] = PROFILE[i - 1]
      return h0 + (h1 - h0) * smoothstep(z0, z1, z)
    }
  }
  return PROFILE[PROFILE.length - 1][1]
}

/** The top surface before its edges are rounded. The cradle's shoulder ends rise for side sleepers. */
export function topHeight(x: number, z: number): number {
  const wing = WING_LIFT * smoothstep(120, 250, Math.abs(x))
  const inCradle = 1 - smoothstep(40, 100, Math.abs(z - CRADLE_Z))
  return profileHeight(z) + wing * inCradle
}

/** Signed distance from (x, z) to a zone's edge; negative inside. */
export function zoneDistance(zone: Zone, x: number, z: number): number {
  const qx = Math.abs(x - zone.cx) - (zone.halfX - zone.radius)
  const qz = Math.abs(z - zone.cz) - (zone.halfZ - zone.radius)
  return Math.hypot(Math.max(qx, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qz), 0) - zone.radius
}

/** 1 inside a cut and 0 outside, eased across a wall `wall` mm wide so pockets read as cut foam, not stairs. */
export function cutMask(distance: number, wall = 3): number {
  return 1 - smoothstep(-wall / 2, wall / 2, distance)
}

/** The core's top: the bed for the thin layers, the speaker pockets and the air channels are cut into it. */
export function coreTop(x: number, z: number): number {
  let y = topHeight(x, z) - DEPTH.comfort
  y -= (DEPTH.sensor - DEPTH.comfort) * cutMask(zoneDistance(HEAD_ZONE, x, z))
  const speaker = Math.hypot(Math.abs(x) - SPEAKER.x, z - SPEAKER.z) - SPEAKER.pocketRadius
  y -= SPEAKER.pocketDepth * cutMask(speaker)
  // Deepest at the rear, where the grooves open into the pod's notch.
  const channelDepth = 16 - 10 * smoothstep(-150, -95, z)
  for (const channel of CHANNELS) y -= channelDepth * cutMask(zoneDistance(channel, x, z))
  return y
}

/** The core's underside, raised over the board bay and the pod notch. */
export function coreBottom(x: number, z: number): number {
  const bay = BASE_THICKNESS + (BOARD_BAY_HEIGHT - BASE_THICKNESS) * cutMask(zoneDistance(BOARD_BAY, x, z))
  const notch = BASE_THICKNESS + (POD_NOTCH_HEIGHT - BASE_THICKNESS) * cutMask(zoneDistance(POD_NOTCH, x, z))
  return Math.max(bay, notch)
}
