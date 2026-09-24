# Nighty Smart Pillow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/work/nighty` case study built around a procedurally modelled, interactive 3D smart pillow and a ten-part exploded view.

**Architecture:** Pure modules describe the pillow in millimetres (`shape.ts`), turn height fields into rounded slab meshes (`geometry.ts`, `layers.ts`), and hold the part data and explode maths (`parts.ts`, `explode.ts`). Browser-only modules paint canvas textures and assemble materials and small components (`textures.ts`, `model.ts`), and `stage.ts` owns the three.js renderer, camera, controls, picking and labels. `NightyViewer.tsx` wraps a stage for React, and the lazy-loaded `NightyPage.tsx` places two viewers (assembled hero and interactive exploded view) beside a parts list.

**Tech Stack:** React 19, React Router, Vite, Vitest + Testing Library (jsdom), three.js 0.186 (`three/addons` for OrbitControls, RoomEnvironment, RoundedBoxGeometry), `@types/three`.

**Spec:** `docs/superpowers/specs/2026-09-23-nighty-pillow-design.md`

## Global Constraints

- `three` is the only new runtime dependency; `@types/three` is added as a dev dependency for types only.
- All geometry is in millimetres: footprint 600 × 360 mm, front roll 110 mm, rear roll 90 mm, head cradle 70 mm.
- Project facts on the page are only: Nighty, June 2024, Product design, team of four. No research, results, quotes or other facts are invented.
- Page copy is in English and matches the existing case pages' tone.
- The Nighty route is lazy-loaded; the homepage bundle must not include three.js.
- Claimly, Medisync and Sizzle pages are not changed.
- `prefers-reduced-motion`: the explode change is immediate and nothing auto-rotates.
- Without WebGL each viewer shows a short notice and the parts list still renders in full.
- The canvas renders only while on screen; renderers are disposed and their contexts released on unmount.

## Review Focus

jsdom has no WebGL, so these are checked in a real browser in Task 9 (Step 3), each with a named check:

1. Scrolling the page with a mouse wheel or trackpad over either viewer scrolls the page; zoom only takes over after the user has pressed on the model.
2. On a phone, a vertical swipe that starts on a viewer scrolls the page instead of turning the model.
3. Resizing the window or rotating a phone keeps the canvas sharp and unstretched, and labels stay attached to their parts.
4. Leaving the page and coming back (and React StrictMode's double mount in dev) leaves no errors and no lost-context warnings, and both viewers render again.
5. Dragging the slider quickly back and forth, or pressing Explode mid-tween, never makes parts jump; with reduced motion on, changes apply immediately.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/nighty/parts.ts` | Part data: id, number, name, role, description, explode offset |
| `src/nighty/explode.ts` | Staggered, eased per-part progress; offset scaling |
| `src/nighty/shape.ts` | Pillow dimensions, top-surface height field, zones, core cuts |
| `src/nighty/geometry.ts` | `contouredSlab`: rounded slab stretched between height fields, mm UVs, welded normals |
| `src/nighty/layers.ts` | Specs and cached geometry for the seven slab layers, full and proxy detail |
| `src/nighty/textures.ts` | Canvas-painted, cached textures (browser only; returns `null` without a 2D context) |
| `src/nighty/model.ts` | Materials, small components (speakers, board, pod, probes), part groups, anchors |
| `src/nighty/stage.ts` | `hasWebGL`, `createStage`: renderer, lights, camera framing, controls, tween, fading, picking, labels, lifecycle |
| `src/nighty/NightyViewer.tsx` | React wrapper around a stage, label buttons, WebGL fallback |
| `src/pages/NightyPage.tsx` | The case study page |
| `src/components/ProjectCovers.tsx` | Adds `NightyCover` |
| `src/pages/HomePage.tsx`, `src/data/caseOrder.ts`, `src/App.tsx`, `src/styles.css` | Wiring and styles |

---

### Task 1: Dependencies, part data and explode maths

**Files:**
- Modify: `package.json` (via npm)
- Create: `src/nighty/parts.ts`, `src/nighty/explode.ts`
- Test: `src/nighty/parts.test.ts`, `src/nighty/explode.test.ts`

**Interfaces:**
- Produces: `type Vec3 = readonly [number, number, number]`; `type NightyPart = { id; number; name; role; description; offset: Vec3 }`; `const parts: readonly NightyPart[]` (ids in order: `cover, comfort, gel, heater, sensor, speakers, core, board, pod, base`); `partProgress(amount: number, index: number, count: number): number`; `scaleOffset(offset: Vec3, progress: number): Vec3`.

- [ ] **Step 1: Install three.js**

Run: `npm install three@^0.186.0 && npm install -D @types/three@^0.186.0`
Expected: both appear in `package.json`; `npm ls three` prints `three@0.186.x`.

- [ ] **Step 2: Write the failing tests**

`src/nighty/parts.test.ts`:

```ts
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
```

`src/nighty/explode.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run src/nighty`
Expected: FAIL, cannot resolve `./parts` and `./explode`.

- [ ] **Step 4: Implement `src/nighty/parts.ts`**

```ts
/** A point or displacement in the pillow's frame, in millimetres. */
export type Vec3 = readonly [number, number, number]

export type NightyPart = {
  id: string
  number: string
  name: string
  role: string
  description: string
  /** How far the part travels from its assembled place when fully exploded. */
  offset: Vec3
}

/**
 * Nighty's components from the top of the stack to the bottom. The support
 * core stays put and everything else moves away from it: the soft layers lift,
 * the board and base drop, and the pod slides out of the rear.
 */
export const parts: readonly NightyPart[] = [
  {
    id: 'cover',
    number: '01',
    name: '3D knit cover',
    role: 'Contact surface',
    description: 'A removable spacer-knit cover that zips along the rear edge. The open knit lets air from the channels below escape at the surface, and it comes off for washing.',
    offset: [0, 470, 0],
  },
  {
    id: 'comfort',
    number: '02',
    name: 'Perforated comfort foam',
    role: 'Comfort',
    description: '20 mm of slow-recovery memory foam, perforated on a grid so warmth from the head does not pool in the cradle.',
    offset: [0, 350, 0],
  },
  {
    id: 'gel',
    number: '03',
    name: 'Phase-change cooling layer',
    role: 'Passive cooling',
    description: 'A 6 mm gel sheet that absorbs heat as it melts near skin temperature, taking the edge off the warm first hour after lying down.',
    offset: [0, 265, 0],
  },
  {
    id: 'heater',
    number: '04',
    name: 'Carbon heating film',
    role: 'Active warming',
    description: 'A thin carbon-fibre film under the head zone with four NTC probes. It only runs when the room is cold, and the probes cap its surface temperature.',
    offset: [0, 205, 0],
  },
  {
    id: 'sensor',
    number: '05',
    name: 'Sleep-sensing strip',
    role: 'Sleep tracking',
    description: 'A piezoelectric strip under the neck roll picks up breathing, heartbeat and movement through the foam. Those signals are what the app turns into light and deep sleep.',
    offset: [0, 155, 0],
  },
  {
    id: 'speakers',
    number: '06',
    name: 'Flat speakers ×2',
    role: 'White noise',
    description: 'Two 50 mm flat drivers, one in each shoulder end, so the sound reaches the ear on the pillow without filling the room.',
    offset: [0, 110, 0],
  },
  {
    id: 'core',
    number: '07',
    name: 'Contoured support core',
    role: 'Support',
    description: 'High-density memory foam shaped to the neck roll, head cradle and rear roll. Pockets hold the speakers and the electronics, and three grooves carry air from the fan to the head zone.',
    offset: [0, 0, 0],
  },
  {
    id: 'board',
    number: '08',
    name: 'Main board',
    role: 'Control',
    description: 'The microcontroller, the Bluetooth and Wi-Fi radio, and the heater and fan drivers. It reads every sensor and decides when to warm, cool or play.',
    offset: [0, -120, 60],
  },
  {
    id: 'pod',
    number: '09',
    name: 'Rear control pod',
    role: 'Room sensing, airflow',
    description: 'Sits in the rear panel, outside the foam, so its temperature and humidity sensor reads the room rather than the pillow. It also holds the quiet fan, the button, the status light and the USB-C port.',
    offset: [0, 30, -150],
  },
  {
    id: 'base',
    number: '10',
    name: 'Anti-slip base panel',
    role: 'Grip',
    description: 'A silicone-dotted panel under the core that keeps the pillow from sliding on the sheet and closes the board bay.',
    offset: [0, -190, 0],
  },
]
```

- [ ] **Step 5: Implement `src/nighty/explode.ts`**

```ts
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
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run src/nighty`
Expected: PASS, 8 tests.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/nighty/parts.ts src/nighty/parts.test.ts src/nighty/explode.ts src/nighty/explode.test.ts
git commit -m "feat(nighty): add part data and staggered explode maths"
```

---

### Task 2: Pillow shape functions

**Files:**
- Create: `src/nighty/shape.ts`
- Test: `src/nighty/shape.test.ts`

**Interfaces:**
- Produces: `PILLOW`, `DEPTH` (`cover 3, comfort 23, gel 29, heater 30.2, sensor 31.2`), `BASE_THICKNESS = 3`, `type Zone = { cx; cz; halfX; halfZ; radius }`, zones `HEAD_ZONE, GEL_ZONE, HEATER_ZONE, SENSOR_ZONE, BOARD_BAY, POD_NOTCH`, `CHANNELS: readonly Zone[]`, `HEATER_PROBES: readonly (readonly [number, number])[]` (zone-local), constants `SPEAKER`, `BOARD`, `POD`; functions `smoothstep(e0, e1, x)`, `profileHeight(z)`, `topHeight(x, z)`, `zoneDistance(zone, x, z)`, `cutMask(distance, wall?)`, `coreTop(x, z)`, `coreBottom(x, z)`.

- [ ] **Step 1: Write the failing test**

`src/nighty/shape.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/nighty/shape.test.ts`
Expected: FAIL, cannot resolve `./shape`.

- [ ] **Step 3: Implement `src/nighty/shape.ts`**

```ts
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
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/nighty/shape.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add src/nighty/shape.ts src/nighty/shape.test.ts
git commit -m "feat(nighty): describe the contoured pillow and its internal cuts"
```

---

### Task 3: Contoured slab geometry

**Files:**
- Create: `src/nighty/geometry.ts`
- Test: `src/nighty/geometry.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `type HeightFn = (x: number, z: number) => number`; `type SlabOptions = { width; depth; center?: readonly [number, number]; thickness; radius; radiusY; segments: readonly [number, number, number]; bottom: HeightFn; top: HeightFn }`; `contouredSlab(options: SlabOptions): BufferGeometry` with material groups in BoxGeometry order (0 +x, 1 −x, 2 +y top, 3 −y bottom, 4 +z, 5 −z), UVs in millimetres, bounding box computed.

- [ ] **Step 1: Write the failing test**

`src/nighty/geometry.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/nighty/geometry.test.ts`
Expected: FAIL, cannot resolve `./geometry`.

- [ ] **Step 3: Implement `src/nighty/geometry.ts`**

```ts
import { BoxGeometry, BufferAttribute, type BufferGeometry } from 'three'

export type HeightFn = (x: number, z: number) => number

export type SlabOptions = {
  /** Footprint size in millimetres. */
  width: number
  depth: number
  /** Where the footprint's centre sits in the pillow's plan. */
  center?: readonly [number, number]
  /** The nominal thickness the rounding is drawn at, before the slab is stretched between `bottom` and `top`. */
  thickness: number
  /** Edge rounding across the footprint (which also rounds its corners) and through the thickness. */
  radius: number
  radiusY: number
  /** Grid resolution along x, y and z. */
  segments: readonly [number, number, number]
  bottom: HeightFn
  top: HeightFn
}

const clamp = (value: number, limit: number) => Math.min(limit, Math.max(-limit, value))

/**
 * A rounded slab whose underside and top follow height fields; every layer of
 * the pillow is one. A dense box has its edges pushed onto an ellipsoidal
 * profile, then each vertex is stretched vertically between `bottom` and `top`
 * at its own plan position, so a contour or a pocket in either field shows up
 * in the mesh.
 *
 * UVs are in millimetres of the flat slab, so tiled textures keep true scale.
 * Material groups follow BoxGeometry: 0 +x, 1 −x, 2 top, 3 bottom, 4 +z, 5 −z.
 */
export function contouredSlab(options: SlabOptions): BufferGeometry {
  const { width, depth, thickness, segments, bottom, top } = options
  const [cx, cz] = options.center ?? [0, 0]
  const hx = width / 2, hy = thickness / 2, hz = depth / 2
  const radius = Math.min(options.radius, hx, hz)
  const radiusY = Math.min(options.radiusY, hy)
  const ix = hx - radius, iy = hy - radiusY, iz = hz - radius

  const geometry = new BoxGeometry(width, thickness, depth, segments[0], segments[1], segments[2])
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const faceUv = geometry.getAttribute('uv')
  const uv = new Float32Array(position.count * 2)
  const seam = new Uint8Array(position.count)

  for (let i = 0; i < position.count; i++) {
    let x = position.getX(i), y = position.getY(i), z = position.getZ(i)
    const nx = normal.getX(i), ny = normal.getY(i), nz = normal.getZ(i)

    // Vertices on a face's border are duplicated by the neighbouring face.
    const u = faceUv.getX(i), v = faceUv.getY(i)
    seam[i] = u < 1e-6 || u > 1 - 1e-6 || v < 1e-6 || v > 1 - 1e-6 ? 1 : 0

    // UVs from the flat slab, so textures keep their scale after stretching.
    if (Math.abs(nx) > 0.5) uv.set([z * -Math.sign(nx), y], i * 2)
    else if (Math.abs(ny) > 0.5) uv.set([x, -z * Math.sign(ny)], i * 2)
    else uv.set([x * Math.sign(nz), y], i * 2)

    // Round the edges: anything outside the inner box moves onto an ellipsoid.
    const px = clamp(x, ix), py = clamp(y, iy), pz = clamp(z, iz)
    const dx = (x - px) / radius, dy = (y - py) / radiusY, dz = (z - pz) / radius
    const length = Math.hypot(dx, dy, dz)
    if (length > 0) {
      x = px + (dx / length) * radius
      y = py + (dy / length) * radiusY
      z = pz + (dz / length) * radius
    }

    const wx = x + cx, wz = z + cz
    const y0 = bottom(wx, wz), y1 = top(wx, wz)
    position.setXYZ(i, wx, y0 + ((y + hy) / thickness) * (y1 - y0), wz)
  }

  geometry.setAttribute('uv', new BufferAttribute(uv, 2))
  geometry.computeVertexNormals()
  weldSeams(geometry, seam)
  geometry.computeBoundingBox()
  geometry.computeBoundingSphere()
  return geometry
}

/** Averages the normals of coincident seam vertices so rounded edges shade as one surface. */
function weldSeams(geometry: BufferGeometry, seam: Uint8Array) {
  const position = geometry.getAttribute('position')
  const normal = geometry.getAttribute('normal')
  const groups = new Map<string, number[]>()

  for (let i = 0; i < position.count; i++) {
    if (!seam[i]) continue
    const key = `${Math.round(position.getX(i) * 20)}|${Math.round(position.getY(i) * 20)}|${Math.round(position.getZ(i) * 20)}`
    const group = groups.get(key)
    if (group) group.push(i)
    else groups.set(key, [i])
  }

  for (const group of groups.values()) {
    if (group.length < 2) continue
    let x = 0, y = 0, z = 0
    for (const i of group) {
      x += normal.getX(i)
      y += normal.getY(i)
      z += normal.getZ(i)
    }
    const length = Math.hypot(x, y, z) || 1
    for (const i of group) normal.setXYZ(i, x / length, y / length, z / length)
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/nighty/geometry.test.ts`
Expected: PASS, 5 tests. If the seam test fails on a handful of vertices, the key rounding split one pair across a boundary: change both `* 20` factors (test and implementation) to `* 10`.

- [ ] **Step 5: Commit**

```bash
git add src/nighty/geometry.ts src/nighty/geometry.test.ts
git commit -m "feat(nighty): build rounded slabs that follow height fields"
```

---

### Task 4: Layer geometries

**Files:**
- Create: `src/nighty/layers.ts`
- Test: `src/nighty/layers.test.ts`

**Interfaces:**
- Consumes: `contouredSlab`, `SlabOptions` (Task 3); `PILLOW, DEPTH, BASE_THICKNESS, GEL_ZONE, HEATER_ZONE, SENSOR_ZONE, coreTop, coreBottom, topHeight, Zone` (Task 2).
- Produces: `type LayerId = 'cover' | 'comfort' | 'gel' | 'heater' | 'sensor' | 'core' | 'base'`; `LAYER_IDS: readonly LayerId[]`; `layerGeometry(id: LayerId, detail?: 'full' | 'proxy'): BufferGeometry` (memoised; never dispose the result).

- [ ] **Step 1: Write the failing test**

`src/nighty/layers.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/nighty/layers.test.ts`
Expected: FAIL, cannot resolve `./layers`.

- [ ] **Step 3: Implement `src/nighty/layers.ts`**

```ts
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
    const [sx, sy, sz] = spec.segments
    const segments = detail === 'full' ? spec.segments : ([Math.max(4, Math.round(sx / 10)), 2, Math.max(4, Math.round(sz / 10))] as const)
    geometry = contouredSlab({ ...spec, segments })
    cache.set(key, geometry)
  }
  return geometry
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/nighty/layers.test.ts`
Expected: PASS, 16 tests. If a containment case fails, widen that layer's inset (reduce `width`/`depth` by 10) and re-run; the spec only fixes the cover's outer dimensions.

- [ ] **Step 5: Commit**

```bash
git add src/nighty/layers.ts src/nighty/layers.test.ts
git commit -m "feat(nighty): define the seven slab layers"
```

---

### Task 5: Textures and the assembled model

**Files:**
- Create: `src/nighty/textures.ts`, `src/nighty/model.ts`
- Test: `src/nighty/model.test.ts`

**Interfaces:**
- Consumes: `layerGeometry`, `LayerId` (Task 4); `parts` (Task 1); `BOARD, DEPTH, HEATER_PROBES, HEATER_ZONE, POD, SENSOR_ZONE, SPEAKER, coreTop, topHeight` (Task 2).
- Produces: `type PartModel = { id: string; group: Group; materials: Material[]; hitTargets: Mesh[]; anchor: Vector3; floor: number }`; `type NightyModel = { root: Group; parts: PartModel[]; dispose(): void }`; `buildNightyModel(): NightyModel`. `anchor` is where the part's label attaches and `floor` is the part's lowest y, both assembled. Every hit target has `userData.partId`.

- [ ] **Step 1: Write the failing test**

`src/nighty/model.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/nighty/model.test.ts`
Expected: FAIL, cannot resolve `./model`.

- [ ] **Step 3: Implement `src/nighty/textures.ts`**

```ts
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from 'three'

/*
 * Every texture is painted on a canvas at first use and cached, so both
 * viewers share them. Without a 2D context (jsdom) each returns null and the
 * materials fall back to flat colour.
 */

type Draw = (context: CanvasRenderingContext2D, width: number, height: number) => void
type Rect = { x: number; z: number; w: number; d: number }
export type BoardFootprint = Rect & { label?: string }

const cache = new Map<string, Texture | null>()

function once(key: string, make: () => Texture | null): Texture | null {
  if (!cache.has(key)) cache.set(key, make())
  return cache.get(key) ?? null
}

/** Seeded, so the foam and fabric look the same on every load. */
function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function paint(width: number, height: number, draw: Draw): HTMLCanvasElement | null {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) return null
  draw(context, width, height)
  return canvas
}

/** Tiles every `tile` millimetres, since the slabs' UVs are in millimetres. */
function tiled(canvas: HTMLCanvasElement | null, tile: number, color = false): Texture | null {
  if (!canvas) return null
  const texture = new CanvasTexture(canvas)
  texture.wrapS = texture.wrapT = RepeatWrapping
  texture.repeat.set(1 / tile, 1 / tile)
  texture.anisotropy = 8
  if (color) texture.colorSpace = SRGBColorSpace
  return texture
}

/** Stretches once across a part `width` × `depth` millimetres, centred on it. */
function fitted(canvas: HTMLCanvasElement | null, width: number, depth: number): Texture | null {
  if (!canvas) return null
  const texture = new CanvasTexture(canvas)
  texture.repeat.set(1 / width, 1 / depth)
  texture.offset.set(0.5, 0.5)
  texture.anisotropy = 8
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** Draws `shape` at (x, y) and again across any tile edge it overlaps, so the tile repeats without seams. */
function wrapped(width: number, height: number, x: number, y: number, reach: number, shape: (x: number, y: number) => void) {
  for (const ox of [-width, 0, width]) {
    for (const oy of [-height, 0, height]) {
      const px = x + ox, py = y + oy
      if (px > -reach && px < width + reach && py > -reach && py < height + reach) shape(px, py)
    }
  }
}

function grayscale(context: CanvasRenderingContext2D, width: number, height: number, value: (u: number, v: number) => number) {
  const image = context.createImageData(width, height)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const level = Math.round(255 * Math.min(1, Math.max(0, value(x / width, y / height))))
      const i = (y * width + x) * 4
      image.data[i] = image.data[i + 1] = image.data[i + 2] = level
      image.data[i + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
}

/** Knit ribs 6 mm apart, with chevron stitches along each rib. Height map. */
export function knitBump() {
  return once('knit', () => tiled(paint(512, 512, (context, width, height) => {
    grayscale(context, width, height, (u, v) => {
      const rib = 0.5 + 0.5 * Math.cos(u * Math.PI * 2 * 4)
      const chevron = v * 12 + Math.abs(((u * 8) % 1) - 0.5)
      const stitch = 0.5 + 0.5 * Math.cos(chevron * Math.PI * 2)
      return 0.2 + 0.55 * rib + 0.25 * stitch * rib
    })
  }), 24))
}

/** The side panel's open spacer mesh: rows of small holes. Height map. */
export function spacerBump() {
  return once('spacer', () => tiled(paint(256, 256, (context, width, height) => {
    context.fillStyle = '#d0d0d0'
    context.fillRect(0, 0, width, height)
    context.fillStyle = '#303030'
    const cell = width / 4
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const x = (col + (row % 2) * 0.5) * cell, y = (row + 0.5) * cell
        wrapped(width, height, x, y, cell, (px, py) => {
          context.beginPath()
          context.ellipse(px, py, cell * 0.28, cell * 0.34, 0, 0, Math.PI * 2)
          context.fill()
        })
      }
    }
  }), 12))
}

/** Open-cell foam: fine random pits and bumps. Height map. */
export function foamBump() {
  return once('foam', () => tiled(paint(256, 256, (context, width, height) => {
    const next = random(7)
    context.fillStyle = '#808080'
    context.fillRect(0, 0, width, height)
    for (let i = 0; i < 1400; i++) {
      const x = next() * width, y = next() * height, r = 0.6 + next() * 2
      context.fillStyle = next() > 0.5 ? 'rgba(0,0,0,.35)' : 'rgba(255,255,255,.3)'
      wrapped(width, height, x, y, r, (px, py) => {
        context.beginPath()
        context.arc(px, py, r, 0, Math.PI * 2)
        context.fill()
      })
    }
  }), 20))
}

function perforation(context: CanvasRenderingContext2D, width: number, height: number, hole: string, face: string) {
  context.fillStyle = face
  context.fillRect(0, 0, width, height)
  const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.19)
  gradient.addColorStop(0, hole)
  gradient.addColorStop(0.8, hole)
  gradient.addColorStop(1, face)
  context.fillStyle = gradient
  context.beginPath()
  context.arc(width / 2, height / 2, width * 0.19, 0, Math.PI * 2)
  context.fill()
}

/** The comfort layer's ventilation holes, one per 14 mm cell: colour multiplier and height map. */
export function perforationMap() {
  return once('perforation-map', () => tiled(paint(128, 128, (context, width, height) => perforation(context, width, height, '#5e6468', '#ffffff')), 14, true))
}

export function perforationBump() {
  return once('perforation-bump', () => tiled(paint(128, 128, (context, width, height) => perforation(context, width, height, '#000000', '#ffffff')), 14))
}

/** The gel sheet's moulded cells. Height map. */
export function gelBump() {
  return once('gel', () => tiled(paint(256, 256, (context, width, height) => {
    context.fillStyle = '#202020'
    context.fillRect(0, 0, width, height)
    const cell = width / 2
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        const x = (col + (row % 2) * 0.5 + 0.5) * cell, y = (row + 0.5) * cell
        wrapped(width, height, x, y, cell, (px, py) => {
          const gradient = context.createRadialGradient(px, py, 0, px, py, cell * 0.5)
          gradient.addColorStop(0, '#ffffff')
          gradient.addColorStop(0.75, '#b0b0b0')
          gradient.addColorStop(1, '#202020')
          context.fillStyle = gradient
          context.beginPath()
          context.arc(px, py, cell * 0.48, 0, Math.PI * 2)
          context.fill()
        })
      }
    }
  }), 18))
}

/** The heating film: graphite with a bronze serpentine element, busbar and probe pads. */
export function heaterMap(width: number, depth: number, probes: readonly (readonly [number, number])[]) {
  const scale = 4
  return once('heater', () => fitted(paint(width * scale, depth * scale, (context, w, h) => {
    const next = random(11)
    context.fillStyle = '#26282c'
    context.fillRect(0, 0, w, h)
    for (let i = 0; i < 3000; i++) {
      context.fillStyle = next() > 0.5 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.08)'
      context.fillRect(next() * w, next() * h, 2 + next() * 6, 1)
    }
    const margin = 14 * scale, pitch = 9 * scale
    context.strokeStyle = '#a8773f'
    context.lineWidth = 2.6 * scale
    context.lineJoin = 'round'
    context.beginPath()
    let y = margin, leftToRight = true
    context.moveTo(margin, y)
    while (y + pitch <= h - margin) {
      context.lineTo(leftToRight ? w - margin : margin, y)
      y += pitch
      context.lineTo(leftToRight ? w - margin : margin, y)
      leftToRight = !leftToRight
    }
    context.lineTo(leftToRight ? w - margin : margin, y)
    context.stroke()
    // Busbar along the rear edge, where the leads run to the board.
    context.fillStyle = '#c7c9cc'
    context.fillRect(margin, 4 * scale, w - margin * 2, 5 * scale)
    context.strokeStyle = '#e8e2d6'
    context.lineWidth = 0.6 * scale
    for (const [x, z] of probes) {
      context.strokeRect((x + width / 2 - 5) * scale, (z + depth / 2 - 5) * scale, 10 * scale, 10 * scale)
    }
  }), width, depth))
}

/** The sensor strip: amber polyimide with a silver interdigitated electrode. */
export function sensorMap(width: number, depth: number) {
  const scale = 4
  return once('sensor', () => fitted(paint(width * scale, depth * scale, (context, w, h) => {
    const gradient = context.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#b87620')
    gradient.addColorStop(0.5, '#d49a44')
    gradient.addColorStop(1, '#b87620')
    context.fillStyle = gradient
    context.fillRect(0, 0, w, h)
    const inset = 6 * scale, bar = 2.2 * scale
    context.fillStyle = '#d9dcdf'
    context.fillRect(inset, inset, w - inset * 2, bar)
    context.fillRect(inset, h - inset - bar, w - inset * 2, bar)
    for (let x = inset + 2 * scale, i = 0; x < w - inset - 2 * scale; x += 3 * scale, i++) {
      const fromTop = i % 2 === 0
      context.fillRect(x, fromTop ? inset : inset + 3 * scale, 1 * scale, h - inset * 2 - 3 * scale)
      if (!fromTop) context.fillRect(x, h - inset - bar, 1 * scale, bar)
    }
  }), width, depth))
}

/** The main board: solder mask, traces, gold pads under each part, silkscreen labels. */
export function pcbMap(width: number, depth: number, footprints: readonly BoardFootprint[]) {
  const scale = 8
  return once('pcb', () => {
    const canvas = paint(width * scale, depth * scale, (context, w, h) => {
      const next = random(23)
      const toX = (x: number) => (x + width / 2) * scale
      const toY = (z: number) => (z + depth / 2) * scale
      context.fillStyle = '#123023'
      context.fillRect(0, 0, w, h)
      context.strokeStyle = '#1d4a34'
      context.lineWidth = 0.35 * scale
      for (let i = 0; i < 70; i++) {
        let x = next() * w, y = next() * h
        context.beginPath()
        context.moveTo(x, y)
        for (let step = 0; step < 3; step++) {
          if (step % 2 === 0) x = next() * w
          else y = next() * h
          context.lineTo(x, y)
        }
        context.stroke()
      }
      for (const part of footprints) {
        context.fillStyle = '#c8a14b'
        context.fillRect(toX(part.x - part.w / 2 - 0.8), toY(part.z - part.d / 2 - 0.8), (part.w + 1.6) * scale, (part.d + 1.6) * scale)
        context.fillStyle = '#123023'
        context.fillRect(toX(part.x - part.w / 2 + 0.6), toY(part.z - part.d / 2 + 0.6), (part.w - 1.2) * scale, (part.d - 1.2) * scale)
        if (part.label) {
          context.fillStyle = '#e8ece6'
          context.font = `600 ${2.6 * scale}px Inter, sans-serif`
          context.textAlign = 'center'
          context.fillText(part.label, toX(part.x), toY(part.z - part.d / 2 - 1.8))
        }
      }
      for (const [x, z] of [[-54, -32], [54, -32], [-54, 32], [54, 32]]) {
        context.fillStyle = '#c8a14b'
        context.beginPath()
        context.arc(toX(x), toY(z), 2.6 * scale, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = '#0a0f0c'
        context.beginPath()
        context.arc(toX(x), toY(z), 1.5 * scale, 0, Math.PI * 2)
        context.fill()
      }
      context.fillStyle = '#e8ece6'
      context.font = `600 ${3 * scale}px Inter, sans-serif`
      context.textAlign = 'left'
      context.fillText('NIGHTY  MB-01', toX(-50), toY(-26))
    })
    if (!canvas) return null
    const texture = new CanvasTexture(canvas)
    texture.anisotropy = 8
    texture.colorSpace = SRGBColorSpace
    return texture
  })
}

/** The woven brand tag stitched into the front panel. */
export function tagMap() {
  return once('tag', () => {
    const canvas = paint(272, 96, (context, width, height) => {
      context.fillStyle = '#26324a'
      context.fillRect(0, 0, width, height)
      context.fillStyle = '#efe7d6'
      context.font = 'italic 52px "DM Serif Display", Georgia, serif'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText('nighty', width / 2, height / 2 + 2)
    })
    if (!canvas) return null
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  })
}
```

- [ ] **Step 4: Implement `src/nighty/model.ts`**

```ts
import {
  Box3, BoxGeometry, CylinderGeometry, DoubleSide, Group, LatheGeometry, Mesh, MeshPhysicalMaterial,
  MeshStandardMaterial, PlaneGeometry, SphereGeometry, TorusGeometry, Vector2, Vector3,
  type BufferGeometry, type Material, type MeshPhysicalMaterialParameters, type MeshStandardMaterialParameters, type Object3D,
} from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { layerGeometry, type LayerId } from './layers'
import { parts } from './parts'
import { BOARD, DEPTH, HEATER_PROBES, HEATER_ZONE, POD, SENSOR_ZONE, SPEAKER, coreTop, topHeight } from './shape'
import * as textures from './textures'

export type PartModel = {
  id: string
  group: Group
  materials: Material[]
  /** Meshes the pointer is tested against: coarse proxies for the big layers. */
  hitTargets: Mesh[]
  /** Where the part's number label attaches, assembled. */
  anchor: Vector3
  /** The part's lowest point, assembled. */
  floor: number
}

export type NightyModel = { root: Group; parts: PartModel[]; dispose: () => void }

type BoardPart = textures.BoardFootprint & { kind: 'chip' | 'shield' | 'fet' | 'mlcc' | 'crystal' | 'cap' | 'jst'; h: number }

/** Components on the main board, relative to its centre, in millimetres. */
const BOARD_PARTS: readonly BoardPart[] = [
  { kind: 'chip', x: -22, z: 4, w: 11, d: 11, h: 1.1, label: 'MCU' },
  { kind: 'shield', x: 26, z: -12, w: 18, d: 15, h: 2.6, label: 'RF' },
  { kind: 'fet', x: -48, z: -20, w: 6.5, d: 6, h: 1.8 },
  { kind: 'fet', x: -48, z: -8, w: 6.5, d: 6, h: 1.8 },
  { kind: 'chip', x: 0, z: 18, w: 5, d: 5, h: 1 },
  { kind: 'crystal', x: -22, z: -10, w: 3.2, d: 2.5, h: 0.8 },
  { kind: 'mlcc', x: -33, z: 0, w: 1.8, d: 1, h: 0.9 },
  { kind: 'mlcc', x: -33, z: 8, w: 1.8, d: 1, h: 0.9 },
  { kind: 'mlcc', x: -11, z: 12, w: 1.8, d: 1, h: 0.9 },
  { kind: 'mlcc', x: -11, z: -4, w: 1.8, d: 1, h: 0.9 },
  { kind: 'mlcc', x: 8, z: 22, w: 1.8, d: 1, h: 0.9 },
  { kind: 'mlcc', x: 8, z: 14, w: 1.8, d: 1, h: 0.9 },
  { kind: 'cap', x: 44, z: 14, w: 6.4, d: 6.4, h: 6.5 },
  { kind: 'cap', x: 52, z: 14, w: 6.4, d: 6.4, h: 6.5 },
  { kind: 'jst', x: -44, z: 31, w: 10, d: 6, h: 5.5, label: 'HEAT' },
  { kind: 'jst', x: -20, z: 31, w: 10, d: 6, h: 5.5, label: 'SENS' },
  { kind: 'jst', x: 4, z: 31, w: 10, d: 6, h: 5.5, label: 'SPK' },
  { kind: 'jst', x: 28, z: 31, w: 10, d: 6, h: 5.5, label: 'POD' },
]

type Built = { objects: Object3D[]; hit: Mesh[] }

/** Tracks what a model creates, so it can release it. Layer geometry and textures are shared and stay cached. */
function createKit() {
  const geometries: BufferGeometry[] = []
  return {
    geometry<T extends BufferGeometry>(geometry: T): T {
      geometries.push(geometry)
      return geometry
    },
    standard: (parameters: MeshStandardMaterialParameters) => new MeshStandardMaterial(parameters),
    physical: (parameters: MeshPhysicalMaterialParameters) => new MeshPhysicalMaterial(parameters),
    dispose: () => geometries.forEach((geometry) => geometry.dispose()),
  }
}

type Kit = ReturnType<typeof createKit>

function solid(geometry: BufferGeometry, material: Material | Material[], x = 0, y = 0, z = 0) {
  const mesh = new Mesh(geometry, material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

/** A layer's visible mesh plus the invisible coarse copy the pointer is tested against. */
function layer(id: LayerId, material: Material | Material[]): Built {
  const proxy = new Mesh(layerGeometry(id, 'proxy'))
  proxy.visible = false
  return { objects: [solid(layerGeometry(id), material), proxy], hit: [proxy] }
}

const lathe = (points: [number, number][]) => new LatheGeometry(points.map(([r, y]) => new Vector2(r, y)), 64)

function arc(cr: number, cy: number, rr: number, ry: number, from: number, to: number, steps: number): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const angle = from + ((to - from) * i) / steps
    return [cr + rr * Math.cos(angle), cy + ry * Math.sin(angle)]
  })
}

/** A 50 mm flat driver facing up: basket, rubber surround, cone and dust cap. */
function speakerDriver(kit: Kit): Group {
  const driver = new Group()
  const basket = kit.standard({ color: '#1d1f22', roughness: 0.5, side: DoubleSide })
  const rubber = kit.standard({ color: '#141516', roughness: 0.85, side: DoubleSide })
  const paper = kit.standard({ color: '#3a3d42', roughness: 0.75, side: DoubleSide })
  const cap = kit.standard({ color: '#8a8f96', roughness: 0.35, metalness: 0.6, side: DoubleSide })
  const frame = solid(kit.geometry(lathe([[0, 0], [22, 0], [24.4, 0.5], [25, 1.6], [25, 8.4], [24.5, 9.6], [23.4, 10], [21.9, 10], [21.5, 9.2], [21.5, 8.6]])), basket)
  driver.add(
    frame,
    solid(kit.geometry(lathe(arc(19.55, 8.8, 1.95, 1.6, 0, Math.PI, 12))), rubber),
    solid(kit.geometry(lathe([[17.6, 8.8], [15, 8.2], [12, 7.4], [8.2, 6.4]])), paper),
    solid(kit.geometry(lathe(arc(0, 6.4, 8.2, 2, 0, Math.PI / 2, 10))), cap),
  )
  return driver
}

const BUILDERS: Record<string, (kit: Kit) => Built> = {
  cover(kit) {
    const top = kit.physical({ color: '#e6e2d9', roughness: 0.9, sheen: 1, sheenRoughness: 0.7, sheenColor: '#ffffff', bumpMap: textures.knitBump(), bumpScale: 2.5 })
    const side = kit.physical({ color: '#56606b', roughness: 0.82, sheen: 1, sheenRoughness: 0.5, sheenColor: '#a8b2bd', bumpMap: textures.spacerBump(), bumpScale: 2 })
    const built = layer('cover', [side, side, top, side, side, side])
    const map = textures.tagMap()
    const tag = new Mesh(kit.geometry(new PlaneGeometry(34, 12)), kit.standard({ color: map ? '#ffffff' : '#26324a', map, roughness: 0.8 }))
    tag.position.set(200, 50, 180.4)
    built.objects.push(tag)
    return built
  },
  comfort: (kit) => layer('comfort', kit.standard({ color: '#d3dfe6', map: textures.perforationMap(), bumpMap: textures.perforationBump(), bumpScale: 2, roughness: 0.96 })),
  gel: (kit) => layer('gel', kit.physical({ color: '#76b3d6', roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.18, bumpMap: textures.gelBump(), bumpScale: 2.5 })),
  heater(kit) {
    const map = textures.heaterMap(HEATER_ZONE.halfX * 2, HEATER_ZONE.halfZ * 2, HEATER_PROBES)
    const built = layer('heater', kit.standard({ color: map ? '#ffffff' : '#2a2c30', map, roughness: 0.5, metalness: 0.15 }))
    const bead = kit.physical({ color: '#4a2f1d', roughness: 0.3, clearcoat: 1 })
    const geometry = kit.geometry(new SphereGeometry(1.8, 24, 16))
    for (const [lx, lz] of HEATER_PROBES) {
      const x = HEATER_ZONE.cx + lx, z = HEATER_ZONE.cz + lz
      const probe = solid(geometry, bead, x, topHeight(x, z) - DEPTH.gel + 0.6, z)
      probe.scale.set(1.3, 0.7, 1.3)
      built.objects.push(probe)
    }
    return built
  },
  sensor(kit) {
    const map = textures.sensorMap(SENSOR_ZONE.halfX * 2, SENSOR_ZONE.halfZ * 2)
    const built = layer('sensor', kit.physical({ color: map ? '#ffffff' : '#c8892f', map, roughness: 0.32, clearcoat: 0.7 }))
    const x = SENSOR_ZONE.cx + SENSOR_ZONE.halfX - 6, z = SENSOR_ZONE.cz
    built.objects.push(solid(kit.geometry(new BoxGeometry(8, 2.6, 10)), kit.standard({ color: '#efece4', roughness: 0.55 }), x, topHeight(x, z) - DEPTH.heater + 1.3, z))
    return built
  },
  speakers(kit) {
    const drivers = [-1, 1].map((side) => {
      const driver = speakerDriver(kit)
      const x = side * SPEAKER.x
      driver.position.set(x, coreTop(x, SPEAKER.z), SPEAKER.z)
      return driver
    })
    return { objects: drivers, hit: drivers.map((driver) => driver.children[0] as Mesh) }
  },
  core: (kit) => layer('core', kit.standard({ color: '#eee4cc', roughness: 0.97, bumpMap: textures.foamBump(), bumpScale: 1.5 })),
  board(kit) {
    const group = new Group()
    group.position.set(0, BOARD.y, BOARD.cz)
    const map = textures.pcbMap(BOARD.width, BOARD.depth, BOARD_PARTS)
    const pcb = solid(kit.geometry(new BoxGeometry(BOARD.width, BOARD.thickness, BOARD.depth)), kit.standard({ color: map ? '#ffffff' : '#123023', map, roughness: 0.45, metalness: 0.15 }), 0, BOARD.thickness / 2, 0)
    group.add(pcb)
    const black = kit.standard({ color: '#18191b', roughness: 0.45 })
    const metal = kit.standard({ color: '#c6cacf', roughness: 0.28, metalness: 1 })
    const materials: Record<BoardPart['kind'], Material> = {
      chip: black, fet: black, shield: metal, crystal: metal,
      mlcc: kit.standard({ color: '#b49a72', roughness: 0.5 }),
      jst: kit.standard({ color: '#f1eee6', roughness: 0.6 }),
      cap: kit.standard({ color: '#1e2c44', roughness: 0.4 }),
    }
    for (const part of BOARD_PARTS) {
      const y = BOARD.thickness + part.h / 2
      if (part.kind === 'cap') {
        group.add(solid(kit.geometry(new CylinderGeometry(part.w / 2, part.w / 2, part.h, 32)), [materials.cap, metal, materials.cap], part.x, y, part.z))
      } else {
        group.add(solid(kit.geometry(new BoxGeometry(part.w, part.h, part.d)), materials[part.kind], part.x, y, part.z))
      }
    }
    return { objects: [group], hit: [pcb] }
  },
  pod(kit) {
    const group = new Group()
    const centreZ = POD.rearZ + 1.2 + POD.depth / 2
    const faceY = POD.y + POD.height / 2
    const housing = solid(kit.geometry(new RoundedBoxGeometry(POD.width, POD.height, POD.depth, 4, 4)), kit.standard({ color: '#2d3237', roughness: 0.42 }), 0, faceY, centreZ)
    const aluminium = kit.standard({ color: '#b9bcc1', roughness: 0.3, metalness: 1 })
    const dark = kit.standard({ color: '#0e1012', roughness: 0.6 })
    group.add(housing, solid(kit.geometry(new RoundedBoxGeometry(POD.width - 8, POD.height - 6, 1.2, 2, 0.5)), aluminium, 0, faceY, POD.rearZ + 0.6))

    // The rear face: vent over the room sensor, button, status light, USB-C.
    const slot = kit.geometry(new BoxGeometry(1.8, 14, 0.4))
    for (let i = 0; i < 10; i++) group.add(solid(slot, dark, -60 + i * 4, faceY, POD.rearZ - 0.1))
    const button = solid(kit.geometry(new CylinderGeometry(6, 6, 1.4, 48)), kit.standard({ color: '#d0d3d6', roughness: 0.25, metalness: 0.9 }), 12, faceY, POD.rearZ - 0.6)
    button.rotation.x = Math.PI / 2
    const light = new Mesh(kit.geometry(new CylinderGeometry(1.3, 1.3, 0.5, 24)), kit.standard({ color: '#cfe4ff', emissive: '#7fb6ff', emissiveIntensity: 2.2 }))
    light.position.set(26, faceY, POD.rearZ - 0.3)
    light.rotation.x = Math.PI / 2
    group.add(button, light, solid(kit.geometry(new RoundedBoxGeometry(9, 3.4, 0.6, 2, 1.2)), dark, 46, faceY, POD.rearZ - 0.25))

    // The fan on top blows up into the core's air channels.
    const top = POD.y + POD.height
    const fanZ = centreZ
    const fanDark = kit.standard({ color: '#1f2327', roughness: 0.5 })
    const guard = solid(kit.geometry(new TorusGeometry(12.6, 0.6, 12, 64)), kit.standard({ color: '#3b4148', roughness: 0.4, metalness: 0.5 }), 0, top + 1.4, fanZ)
    guard.rotation.x = Math.PI / 2
    group.add(solid(kit.geometry(new CylinderGeometry(13, 13, 0.6, 48)), fanDark, 0, top + 0.3, fanZ), guard, solid(kit.geometry(new CylinderGeometry(4.4, 4.4, 2.4, 32)), fanDark, 0, top + 1.8, fanZ))
    const bladeGeometry = kit.geometry(new BoxGeometry(7.6, 0.45, 3.4))
    const bladeMaterial = kit.standard({ color: '#48505a', roughness: 0.45 })
    for (let i = 0; i < 7; i++) {
      const pivot = new Group()
      pivot.position.set(0, top + 1.8, fanZ)
      pivot.rotation.y = (i / 7) * Math.PI * 2
      const blade = solid(bladeGeometry, bladeMaterial, 8.4, 0, 0)
      blade.rotation.x = 0.42
      pivot.add(blade)
      group.add(pivot)
    }
    return { objects: [group], hit: [housing] }
  },
  base: (kit) => layer('base', kit.standard({ color: '#34373b', roughness: 0.95, bumpMap: textures.spacerBump(), bumpScale: 1 })),
}

/** Builds Nighty with one group per part, in `parts` order, all at their assembled positions. */
export function buildNightyModel(): NightyModel {
  const kit = createKit()
  const root = new Group()
  const models = parts.map((part): PartModel => {
    const build = BUILDERS[part.id]
    if (!build) throw new Error(`No builder for Nighty part "${part.id}"`)
    const { objects, hit } = build(kit)
    const group = new Group()
    group.name = part.id
    group.add(...objects)
    root.add(group)
    for (const target of hit) target.userData.partId = part.id

    const box = new Box3().setFromObject(group)
    const materials = new Set<Material>()
    group.traverse((object) => {
      if (object instanceof Mesh) for (const material of [object.material].flat()) materials.add(material)
    })
    return {
      id: part.id,
      group,
      materials: [...materials],
      hitTargets: hit,
      anchor: new Vector3(box.max.x, (box.min.y + box.max.y) / 2, (box.min.z + box.max.z) / 2),
      floor: box.min.y,
    }
  })

  return {
    root,
    parts: models,
    dispose() {
      kit.dispose()
      for (const part of models) for (const material of part.materials) material.dispose()
    },
  }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/nighty/model.test.ts`
Expected: PASS, 2 tests.

- [ ] **Step 6: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0. If `@types/three` rejects a material parameter (for example `sheenColor` as a string), pass `new Color('#…')` instead.

- [ ] **Step 7: Commit**

```bash
git add src/nighty/textures.ts src/nighty/model.ts src/nighty/model.test.ts
git commit -m "feat(nighty): paint textures and assemble the ten parts"
```

---

### Task 6: Stage and viewer

**Files:**
- Create: `src/nighty/stage.ts`, `src/nighty/NightyViewer.tsx`
- Test: `src/nighty/NightyViewer.test.tsx`

**Interfaces:**
- Consumes: `buildNightyModel`, `PartModel` (Task 5); `parts` (Task 1); `partProgress`, `scaleOffset` (Task 1).
- Produces: `hasWebGL(): boolean`; `type StageInput = { explode: number; activeId: string | null; onHover?: (id: string | null) => void; onSelect?: (id: string | null) => void }`; `createStage(host: HTMLElement, options: { interactive: boolean; labels: (HTMLElement | null)[]; read: () => StageInput }): { dispose(): void }`; `NightyViewer` props `{ label: string; explode: number; activeId?: string | null; interactive?: boolean; onHover?; onSelect? }`. The viewer root has class `nighty-viewer`; labels have class `nighty-label` and gain `is-visible` / `is-active`.

- [ ] **Step 1: Write the failing test**

`src/nighty/NightyViewer.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, test } from 'vitest'
import { NightyViewer } from './NightyViewer'

afterEach(cleanup)

test('explains itself instead of rendering when WebGL is unavailable', () => {
  render(<NightyViewer label="Nighty pillow" explode={0} />)
  expect(screen.getByText(/WebGL/)).toBeVisible()
  expect(document.querySelector('canvas')).toBeNull()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/nighty/NightyViewer.test.tsx`
Expected: FAIL, cannot resolve `./NightyViewer`.

- [ ] **Step 3: Implement `src/nighty/stage.ts`**

```ts
import {
  DirectionalLight, Mesh, NeutralToneMapping, PCFShadowMap, PerspectiveCamera, PlaneGeometry, PMREMGenerator,
  Raycaster, Scene, ShadowMaterial, TOUCH, Vector2, Vector3, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { partProgress, scaleOffset } from './explode'
import { buildNightyModel, type PartModel } from './model'
import { parts } from './parts'

export type StageInput = {
  explode: number
  activeId: string | null
  onHover?: (id: string | null) => void
  onSelect?: (id: string | null) => void
}

type StageOptions = { interactive: boolean; labels: (HTMLElement | null)[]; read: () => StageInput }

/** Opacity for parts that are not the active one, and for the cover once it has lifted away. */
const FADED = 0.14
const GHOST = 0.16
/** Default view: front right, a little above, like a product shot. */
const AZIMUTH = 0.66
const ELEVATION = 0.38
const FOV = 30
const LABEL_THRESHOLD = 0.6

export function hasWebGL(): boolean {
  if (typeof window === 'undefined' || typeof window.WebGL2RenderingContext === 'undefined') return false
  try {
    return document.createElement('canvas').getContext('webgl2') !== null
  } catch {
    return false
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * Mounts a Nighty scene in `host` and runs it while it is on screen. `read` is
 * polled every frame, so React can change the explode amount and the active
 * part without rebuilding anything.
 */
export function createStage(host: HTMLElement, { interactive, labels, read }: StageOptions) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.toneMapping = NeutralToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  const canvas = renderer.domElement
  host.prepend(canvas)

  const scene = new Scene()
  const pmrem = new PMREMGenerator(renderer)
  const room = new RoomEnvironment()
  const environment = pmrem.fromScene(room, 0.04).texture
  room.dispose()
  pmrem.dispose()
  scene.environment = environment
  scene.environmentIntensity = 0.55

  const key = new DirectionalLight('#fff6ec', 2.2)
  key.position.set(-420, 1100, 620)
  key.target.position.set(0, 200, 0)
  key.castShadow = true
  key.shadow.mapSize.set(2048, 2048)
  Object.assign(key.shadow.camera, { left: -700, right: 700, top: 700, bottom: -700, near: 100, far: 3000 })
  key.shadow.camera.updateProjectionMatrix()
  key.shadow.bias = -0.0004
  key.shadow.normalBias = 0.6
  key.shadow.radius = 4
  scene.add(key, key.target)

  const floor = new Mesh(new PlaneGeometry(4000, 4000), new ShadowMaterial({ opacity: 0.16 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const model = buildNightyModel()
  scene.add(model.root)
  const count = model.parts.length
  const opacity = model.parts.map(() => 1)
  const shadowed = model.parts.map(() => true)
  const targets = model.parts.flatMap((part) => part.hitTargets)

  const camera = new PerspectiveCamera(FOV, 1, 10, 12000)
  const direction = new Vector3(Math.sin(AZIMUTH) * Math.cos(ELEVATION), Math.sin(ELEVATION), Math.cos(AZIMUTH) * Math.cos(ELEVATION))
  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.enablePan = false
  // Wheel zoom waits until the user presses on the model, so scrolling past it still scrolls the page.
  controls.enableZoom = false
  controls.minPolarAngle = 0.08 * Math.PI
  controls.maxPolarAngle = 0.5 * Math.PI - 0.04
  controls.autoRotate = !interactive && !reducedMotion
  controls.autoRotateSpeed = 0.5
  if (coarsePointer) {
    // One finger scrolls the page; two fingers turn and zoom the model.
    controls.touches = { ONE: null, TWO: TOUCH.DOLLY_ROTATE }
    canvas.style.touchAction = 'pan-y'
  }

  let width = 1
  let height = 1
  let current = read().explode
  let framed = { y: 0, distance: 0 }

  /** Distance that fits the model at this explode amount into the current aspect ratio. */
  function framing(amount: number) {
    const half = Math.tan((FOV * Math.PI) / 360)
    const contentHeight = lerp(250, 900, amount)
    const contentWidth = lerp(760, 920, amount)
    const distance = Math.max(contentHeight / 2 / half, contentWidth / 2 / (half * camera.aspect)) * 1.08
    return { y: lerp(50, 385, amount), distance }
  }

  /** Re-aims the camera for a new frame, keeping the user's angle and relative zoom. */
  function reframe(amount: number) {
    const next = framing(amount)
    if (framed.distance === 0) {
      controls.target.set(0, next.y, 0)
      camera.position.copy(controls.target).addScaledVector(direction, next.distance)
    } else {
      const offset = camera.position.clone().sub(controls.target).multiplyScalar(next.distance / framed.distance)
      controls.target.set(0, next.y, 0)
      camera.position.copy(controls.target).add(offset)
    }
    controls.minDistance = next.distance * 0.5
    controls.maxDistance = next.distance * 1.7
    framed = next
  }

  function resize() {
    width = Math.max(1, host.clientWidth)
    height = Math.max(1, host.clientHeight)
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    reframe(current)
  }

  function setOpacity(index: number, part: PartModel, value: number) {
    opacity[index] = value
    const transparent = value < 0.995
    for (const material of part.materials) {
      material.opacity = value
      if (material.transparent !== transparent) {
        material.transparent = transparent
        material.depthWrite = !transparent
        material.needsUpdate = true
      }
    }
    const casts = value > 0.5
    if (casts !== shadowed[index]) {
      shadowed[index] = casts
      part.group.traverse((object) => {
        if (object instanceof Mesh) object.castShadow = casts
      })
    }
  }

  // Picking ----------------------------------------------------------------
  const raycaster = new Raycaster()
  const pointer = new Vector2()
  let pointerInside = false
  let hovered: string | null = null
  let pressed: { x: number; y: number } | null = null

  function setPointer(event: PointerEvent) {
    const rect = canvas.getBoundingClientRect()
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
  }

  /** The part under the pointer; a ghosted cover only counts when nothing solid is behind it. */
  function pick(): string | null {
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(targets, false)
    const solidHit = hits.find((hit) => opacity[parts.findIndex((part) => part.id === hit.object.userData.partId)] >= 0.5)
    return ((solidHit ?? hits[0])?.object.userData.partId as string | undefined) ?? null
  }

  function onPointerMove(event: PointerEvent) {
    setPointer(event)
    pointerInside = true
  }
  function onPointerLeave() {
    pointerInside = false
    controls.enableZoom = false
  }
  function onPointerDown(event: PointerEvent) {
    controls.enableZoom = true
    controls.autoRotate = false
    pressed = { x: event.clientX, y: event.clientY }
  }
  function onPointerUp(event: PointerEvent) {
    if (!interactive || !pressed) return
    const moved = Math.hypot(event.clientX - pressed.x, event.clientY - pressed.y)
    pressed = null
    if (moved > 5) return
    setPointer(event)
    read().onSelect?.(pick())
  }
  canvas.addEventListener('pointermove', onPointerMove)
  canvas.addEventListener('pointerleave', onPointerLeave)
  canvas.addEventListener('pointerdown', onPointerDown)
  canvas.addEventListener('pointerup', onPointerUp)

  // Frame loop ---------------------------------------------------------------
  const projected = new Vector3()
  let frame = 0
  let visible = false
  let last = 0

  function update(dt: number) {
    const input = read()
    const target = Math.min(1, Math.max(0, input.explode))
    current = reducedMotion ? target : current + (target - current) * (1 - Math.exp(-dt * 5))
    if (Math.abs(target - current) < 1e-4) current = target
    if (Math.abs(framing(current).y - framed.y) > 1e-3) reframe(current)

    if (interactive && pointerInside) {
      const next = pick()
      if (next !== hovered) {
        hovered = next
        canvas.style.cursor = next ? 'pointer' : ''
        input.onHover?.(next)
      }
    } else if (hovered !== null) {
      hovered = null
      canvas.style.cursor = ''
      input.onHover?.(null)
    }

    // Lift the whole model so its lowest part always rests on the floor.
    let lowest = 0
    const progress = model.parts.map((part, index) => {
      const value = partProgress(current, index, count)
      const [x, y, z] = scaleOffset(parts[index].offset, value)
      part.group.position.set(x, y, z)
      lowest = Math.min(lowest, part.floor + y)
      return value
    })
    model.root.position.y = -lowest

    const active = input.activeId
    const ease = reducedMotion ? 1 : 1 - Math.exp(-dt * 10)
    model.parts.forEach((part, index) => {
      const ghost = part.id === 'cover' ? lerp(1, GHOST, progress[index]) : 1
      const goal = active ? (part.id === active ? 1 : Math.min(ghost, FADED)) : ghost
      const value = Math.abs(goal - opacity[index]) < 0.002 ? goal : lerp(opacity[index], goal, ease)
      if (value !== opacity[index]) setOpacity(index, part, value)
    })

    controls.update(dt)
    renderer.render(scene, camera)

    labels.forEach((label, index) => {
      if (!label) return
      const part = model.parts[index]
      projected.copy(part.anchor).add(part.group.position).add(model.root.position).project(camera)
      const shown = interactive && progress[index] > LABEL_THRESHOLD && projected.z < 1
      label.classList.toggle('is-visible', shown)
      label.classList.toggle('is-active', part.id === active)
      label.style.transform = `translate3d(${((projected.x + 1) / 2) * width}px, ${((1 - projected.y) / 2) * height}px, 0)`
    })
  }

  function tick(now: number) {
    if (!visible) {
      frame = 0
      return
    }
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    update(dt)
    frame = requestAnimationFrame(tick)
  }

  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(host)
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible && !frame) {
      last = performance.now()
      frame = requestAnimationFrame(tick)
    }
  })
  visibility.observe(host)
  resize()

  return {
    dispose() {
      visible = false
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      visibility.disconnect()
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerleave', onPointerLeave)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      controls.dispose()
      model.dispose()
      floor.geometry.dispose()
      floor.material.dispose()
      environment.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      canvas.remove()
    },
  }
}
```

- [ ] **Step 4: Implement `src/nighty/NightyViewer.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react'
import { parts } from './parts'
import { createStage, hasWebGL, type StageInput } from './stage'

type NightyViewerProps = {
  /** Read out in place of the canvas. */
  label: string
  /** 0 is assembled and 1 fully exploded; the model eases toward it. */
  explode: number
  /** The part to highlight; the others fade back. */
  activeId?: string | null
  /** Number labels and picking. The hero model leaves them off. */
  interactive?: boolean
  onHover?: (id: string | null) => void
  onSelect?: (id: string | null) => void
}

export function NightyViewer({ label, explode, activeId = null, interactive = false, onHover, onSelect }: NightyViewerProps) {
  const [supported] = useState(hasWebGL)
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const input = useRef<StageInput>({ explode, activeId, onHover, onSelect })

  useEffect(() => {
    input.current = { explode, activeId, onHover, onSelect }
  })

  useEffect(() => {
    const host = hostRef.current
    if (!supported || !host) return
    const stage = createStage(host, { interactive, labels: labelRefs.current, read: () => input.current })
    return stage.dispose
  }, [supported, interactive])

  if (!supported) {
    return <p className="nighty-fallback">This browser has WebGL turned off, so the 3D model can’t load. Every part is still listed on this page.</p>
  }

  return (
    <div className="nighty-viewer" ref={hostRef} role="img" aria-label={label}>
      {/* Pointer shortcuts only; the parts list is the accessible way to pick a part. */}
      {interactive && parts.map((part, index) => (
        <button
          key={part.id}
          ref={(element) => { labelRefs.current[index] = element }}
          className="nighty-label"
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => input.current.onSelect?.(part.id)}
        >
          <span>{part.number}</span>
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/nighty/NightyViewer.test.tsx`
Expected: PASS, 1 test.

- [ ] **Step 6: Typecheck and lint**

Run: `npm run typecheck && npm run lint`
Expected: both exit 0. If `@types/three` does not accept `ONE: null` in `controls.touches`, write `ONE: -1 as TOUCH` with a comment that any value other than a TOUCH action disables one-finger input in OrbitControls.

- [ ] **Step 7: Commit**

```bash
git add src/nighty/stage.ts src/nighty/NightyViewer.tsx src/nighty/NightyViewer.test.tsx
git commit -m "feat(nighty): render the pillow with framing, fading, picking and labels"
```

---

### Task 7: Case study page, route and styles

**Files:**
- Create: `src/pages/NightyPage.tsx`, `src/pages/NightyPage.test.tsx`
- Modify: `src/App.tsx`, `src/data/caseOrder.ts`, `src/styles.css` (append), `src/App.test.tsx`, `src/pages/MePage.test.tsx:63`

**Interfaces:**
- Consumes: `NightyViewer` and `hasWebGL` (Task 6); `parts` (Task 1).
- Produces: route `/work/nighty`; `caseOrder` entry `{ name: 'Nighty', category: 'Sleep technology', path: '/work/nighty' }`; `NightyPage` (named export).

- [ ] **Step 1: Write the failing tests**

Append to `src/App.test.tsx` (add `within` to the `@testing-library/react` import):

```tsx
test('renders the Nighty case study, its facts and every part without WebGL', async () => {
  renderAt('/work/nighty')

  expect(await screen.findByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByText('June 2024')).toBeVisible()
  expect(screen.getByText('Product design')).toBeVisible()
  expect(within(screen.getByRole('list', { name: 'Parts' })).getAllByRole('button')).toHaveLength(10)
  // Both viewers fall back to a notice, and the controls that need a model are left out.
  expect(screen.getAllByText(/WebGL turned off/)).toHaveLength(2)
  expect(screen.queryByRole('slider', { name: 'Explode amount' })).not.toBeInTheDocument()
})

test('walks from Sizzle to Nighty and from Nighty back to Claimly', async () => {
  const user = userEvent.setup()
  renderAt('/work/sizzle')

  await user.click(screen.getByRole('link', { name: /Next project\s*Nighty/i }))
  expect(await screen.findByRole('heading', { level: 1, name: 'Nighty' })).toBeVisible()
  expect(screen.getByRole('link', { name: /Next project\s*Claimly/i })).toHaveAttribute('href', '/work/claimly')
})
```

Create `src/pages/NightyPage.test.tsx`:

```tsx
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, expect, test, vi } from 'vitest'
import { NightyPage } from './NightyPage'

// Pretend WebGL exists so the controls render; the scene itself never starts.
vi.mock('../nighty/stage', () => ({ hasWebGL: () => true, createStage: () => ({ dispose: () => undefined }) }))

afterEach(cleanup)

function renderPage() {
  return render(<MemoryRouter><NightyPage /></MemoryRouter>)
}

test('explodes and reassembles from the toggle', async () => {
  const user = userEvent.setup()
  renderPage()

  await user.click(screen.getByRole('button', { name: 'Explode' }))
  expect(screen.getByRole('slider', { name: 'Explode amount' })).toHaveValue('100')
  await user.click(screen.getByRole('button', { name: 'Assemble' }))
  expect(screen.getByRole('slider', { name: 'Explode amount' })).toHaveValue('0')
})

test('selects a part from the list and clears it on a second press', async () => {
  const user = userEvent.setup()
  renderPage()

  const core = screen.getByRole('button', { name: /Contoured support core/ })
  await user.click(core)
  expect(core).toHaveAttribute('aria-pressed', 'true')
  await user.click(core)
  expect(core).toHaveAttribute('aria-pressed', 'false')
})
```

Change `src/pages/MePage.test.tsx:63` to expect `'Claimly · Medisync · Sizzle · Nighty'`.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/App.test.tsx src/pages`
Expected: FAIL: the Nighty route redirects home, `./NightyPage` cannot be resolved, and the Me footer still lists three cases.

- [ ] **Step 3: Add Nighty to `src/data/caseOrder.ts`**

```ts
/** Case studies in display order; the footer walks this list to pick "next". */
export const caseOrder = [
  { name: 'Claimly', category: 'Financial clarity', path: '/work/claimly' },
  { name: 'Medisync', category: 'Healthcare access', path: '/work/medisync' },
  { name: 'Sizzle', category: 'Food discovery', path: '/work/sizzle' },
  { name: 'Nighty', category: 'Sleep technology', path: '/work/nighty' },
] as const
```

- [ ] **Step 4: Implement `src/pages/NightyPage.tsx`**

```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CaseFooter } from '../components/CaseFooter'
import { SiteNav } from '../components/SiteNav'
import { NightyViewer } from '../nighty/NightyViewer'
import { parts } from '../nighty/parts'
import { hasWebGL } from '../nighty/stage'

const facts = [
  { label: 'Role', value: 'Product design' },
  { label: 'Timeline', value: 'June 2024' },
  { label: 'Team', value: 'Team of four' },
  { label: 'Scope', value: 'Temperature, sound, sleep tracking' },
]

export function NightyPage() {
  const [webgl] = useState(hasWebGL)
  /** 0 to 100, the slider's own scale. */
  const [explode, setExplode] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)
  const active = hovered ?? selected
  const exploded = explode >= 50

  return (
    <div className="site-shell">
      <SiteNav autoHide />
      <main className="case-page nighty-page">
        <header className="case-hero section-shell">
          <Link className="back-link" to="/#works">← Selected works</Link>
          <p className="eyebrow">Sleep technology</p>
          <h1>Nighty</h1>
          <p className="case-lead">
            A pillow that pays attention to the room. Nighty warms or cools the head zone to suit the air around it,
            plays white noise from inside the foam, and tracks light and deep sleep through the night.
          </p>
          <dl className="case-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        <section className="nighty-model" aria-labelledby="model-title">
          <div className="section-shell nighty-model-inner">
            <div className="nighty-copy">
              <div className="section-label"><span>/</span><h2 id="model-title">The pillow</h2></div>
              <p>
                On the outside it is a standard contoured memory-foam pillow, 600 by 360 mm, with a 110 mm neck roll, a
                70 mm head cradle and a 90 mm rear roll. The shoulder ends of the cradle rise slightly for side sleepers.
              </p>
              <p>
                Everything electronic stays inside the foam. The only part that shows is the control pod in the rear
                panel, with its vent, button, status light and charging port.
              </p>
              <p className="nighty-hint">Drag to turn it</p>
            </div>
            <div className="nighty-stage nighty-stage--hero">
              <NightyViewer label="The Nighty pillow, assembled" explode={0} />
            </div>
          </div>
        </section>

        <section className="nighty-exploded section-shell" aria-labelledby="exploded-title">
          <div className="section-label"><span>/</span><h2 id="exploded-title">Exploded view</h2></div>
          <div className="nighty-exploded-grid">
            <div className="nighty-stage nighty-stage--exploded">
              <NightyViewer
                label="The Nighty pillow, taken apart into its ten parts"
                explode={explode / 100}
                activeId={active}
                interactive
                onHover={setHovered}
                onSelect={setSelected}
              />
              {webgl && (
                <div className="nighty-controls">
                  <button className="nighty-toggle" type="button" onClick={() => setExplode(exploded ? 0 : 100)}>
                    {exploded ? 'Assemble' : 'Explode'}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={explode}
                    aria-label="Explode amount"
                    onChange={(event) => setExplode(Number(event.target.value))}
                  />
                  <output className="nighty-readout">{explode}%</output>
                </div>
              )}
            </div>

            <div className="nighty-parts-panel">
              <p className="nighty-intro">
                Ten parts, from the knit cover down to the base panel. Drag the slider to take the pillow apart, then
                pick a part here or in the model to see where it sits.
              </p>
              <ol className="nighty-parts" aria-label="Parts">
                {parts.map((part) => (
                  <li key={part.id}>
                    <button
                      className={`nighty-part${part.id === active ? ' is-active' : ''}`}
                      type="button"
                      aria-pressed={part.id === selected}
                      onClick={() => setSelected(part.id === selected ? null : part.id)}
                      onMouseEnter={() => setHovered(part.id)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(part.id)}
                      onBlur={() => setHovered(null)}
                    >
                      <span className="nighty-part__number">{part.number}</span>
                      <span className="nighty-part__name">{part.name}</span>
                      <span className="nighty-part__role">{part.role}</span>
                      <span className="nighty-part__description">{part.description}</span>
                    </button>
                  </li>
                ))}
              </ol>
              <div className="nighty-note">
                <h3>How it holds temperature</h3>
                <p>
                  When the room is warm, the gel layer and the fan move heat away from the head. When it is cold, the
                  heating film warms the cradle. The pod’s sensor sits outside the foam, so it reads the room rather
                  than the pillow.
                </p>
              </div>
            </div>
          </div>
        </section>

        <CaseFooter current="Nighty" />
      </main>
    </div>
  )
}
```

- [ ] **Step 5: Add the lazy route in `src/App.tsx`**

```tsx
import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { MePage } from './pages/MePage'
import { ClaimlyPage } from './pages/ClaimlyPage'
import { MedisyncPage } from './pages/MedisyncPage'
import { SizzlePage } from './pages/SizzlePage'

// three.js is only downloaded when someone opens Nighty.
const NightyPage = lazy(() => import('./pages/NightyPage').then((module) => ({ default: module.NightyPage })))

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/me" element={<MePage />} />
        <Route path="/work/claimly" element={<ClaimlyPage />} />
        <Route path="/work/medisync" element={<MedisyncPage />} />
        <Route path="/work/sizzle" element={<SizzlePage />} />
        <Route path="/work/nighty" element={<Suspense fallback={null}><NightyPage /></Suspense>} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </>
  )
}
```

- [ ] **Step 6: Append the Nighty styles to the end of `src/styles.css`**

```css
/* Nighty ---------------------------------------------------------------- */
/* The model band mirrors .case-demo: a raised full-bleed strip with copy
   beside the stage. The canvas fills its stage absolutely, so the stage's
   height is what sizes the render. */
.nighty-model { border-block: 1px solid var(--rule); background: var(--raised); padding: var(--gap) 0; }
.nighty-model-inner { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.9fr); gap: clamp(32px, 5vw, 64px); align-items: center; }
.nighty-copy p, .nighty-intro, .nighty-note p { max-width: 44ch; margin: 0 0 16px; color: #35312b; font-size: 17px; line-height: 1.65; }
.nighty-copy .nighty-hint { margin: 24px 0 0; color: var(--soft); font: 400 12px/1.5 var(--mono); letter-spacing: .08em; text-transform: uppercase; }
.nighty-stage { position: relative; min-width: 0; }
.nighty-stage--hero { height: clamp(320px, 42vw, 560px); }
.nighty-viewer { position: absolute; inset: 0; overflow: hidden; }
.nighty-viewer canvas { display: block; width: 100%; height: 100%; outline: none; }
.nighty-fallback {
  display: grid; place-items: center; height: 100%; margin: 0; padding: 24px;
  border: 1px dashed var(--rule); border-radius: 14px;
  color: var(--soft); font: 400 12px/1.6 var(--mono); letter-spacing: .06em; text-align: center;
}

.nighty-exploded { padding-top: var(--gap); }
.nighty-exploded-grid { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(32px, 4vw, 56px); align-items: start; }
/* Stays in view while the parts list scrolls past it. */
.nighty-stage--exploded { position: sticky; top: 24px; height: min(84vh, 780px); overflow: hidden; border-radius: 14px; background: var(--raised); }

/* Labels are placed by the stage every frame; the rule reaches back to the part. */
.nighty-label {
  position: absolute; z-index: 1; top: 0; left: 0;
  display: flex; align-items: center;
  margin-top: -11px; border: 0; background: none; padding: 0 0 0 26px;
  color: var(--ink); font: 500 11px/1 var(--mono); letter-spacing: .06em;
  opacity: 0; pointer-events: none;
  transition: opacity .3s var(--ease);
}
.nighty-label::before { position: absolute; top: 50%; left: 0; width: 22px; height: 1px; background: currentColor; opacity: .45; content: ''; }
.nighty-label span { display: grid; place-items: center; min-width: 26px; height: 22px; padding: 0 6px; border: 1px solid var(--rule); border-radius: 999px; background: var(--ground); }
.nighty-label.is-visible { opacity: 1; pointer-events: auto; }
.nighty-label.is-active span { border-color: var(--accent); background: var(--accent); color: #fff; }

.nighty-controls {
  position: absolute; z-index: 2; right: 16px; bottom: 16px; left: 16px;
  display: flex; gap: 14px; align-items: center;
  border: 1px solid var(--rule); border-radius: 999px;
  background: rgb(250 248 244 / .92); backdrop-filter: blur(8px);
  padding: 8px 16px 8px 8px;
}
.nighty-toggle {
  flex-shrink: 0; min-width: 104px; min-height: 36px;
  border: 1px solid var(--ink); border-radius: 999px; background: var(--ink); color: var(--ground);
  padding: 0 16px; font: 400 11px/1 var(--mono); letter-spacing: .1em; text-transform: uppercase;
  transition: background .25s var(--ease), color .25s var(--ease);
}
.nighty-toggle:hover { background: transparent; color: var(--ink); }
.nighty-controls input[type='range'] { flex: 1; min-width: 0; accent-color: var(--accent); }
.nighty-readout { min-width: 4ch; color: var(--soft); font: 400 12px/1 var(--mono); text-align: right; }

.nighty-parts { margin: 8px 0 0; border-top: 1px solid var(--rule); padding: 0; list-style: none; }
.nighty-part {
  display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; gap: 4px 12px; align-items: baseline;
  width: 100%; border: 0; border-bottom: 1px solid var(--rule); background: transparent;
  padding: 16px 8px; color: var(--ink); text-align: left;
  transition: background .25s var(--ease);
}
.nighty-part:hover, .nighty-part.is-active { background: var(--raised); }
.nighty-part__number { color: var(--accent); font: 400 12px/1.5 var(--mono); }
.nighty-part__name { font-size: 16px; font-weight: 500; line-height: 1.4; }
.nighty-part[aria-pressed='true'] .nighty-part__name { color: var(--accent); }
.nighty-part__role { color: var(--soft); font: 400 11px/1.6 var(--mono); letter-spacing: .06em; text-align: right; text-transform: uppercase; }
.nighty-part__description { grid-column: 2 / -1; color: #4a443d; font-size: 15px; line-height: 1.6; }
.nighty-note { margin-top: 32px; border-top: 1px solid var(--rule); padding-top: 20px; }
.nighty-note h3 { margin: 0 0 10px; font: 500 16px/1.4 Inter, sans-serif; }

@media (max-width: 900px) {
  .nighty-model-inner, .nighty-exploded-grid { grid-template-columns: minmax(0, 1fr); }
  .nighty-stage--exploded { position: relative; top: 0; height: 520px; }
}
@media (max-width: 680px) {
  .nighty-stage--hero { height: 300px; }
  .nighty-stage--exploded { height: 460px; }
  /* Ten labels crowd a phone-width model; the list below does the naming. */
  .nighty-label { display: none; }
  .nighty-controls { right: 10px; bottom: 10px; left: 10px; gap: 10px; }
  .nighty-part { grid-template-columns: 28px minmax(0, 1fr); }
  .nighty-part__role { grid-column: 2; text-align: left; }
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx vitest run`
Expected: PASS for the whole suite, including the two new App tests, the two NightyPage tests and the updated Me footer test.

- [ ] **Step 8: Commit**

```bash
git add src/pages/NightyPage.tsx src/pages/NightyPage.test.tsx src/App.tsx src/App.test.tsx src/data/caseOrder.ts src/styles.css src/pages/MePage.test.tsx
git commit -m "feat(nighty): add the case study page with the model and exploded view"
```

---

### Task 8: Homepage entry and cover

**Files:**
- Modify: `src/components/ProjectCovers.tsx` (append `NightyCover`), `src/pages/HomePage.tsx`, `src/styles.css` (one rule), `src/pages/HomePage.test.tsx`

**Interfaces:**
- Consumes: `PILLOW`, `profileHeight` (Task 2).
- Produces: `NightyCover()` SVG; homepage work 04 linking to `/work/nighty` with the accessible name `Nighty case study`.

- [ ] **Step 1: Write the failing test**

Append to `src/pages/HomePage.test.tsx`:

```tsx
test('lists Nighty as the fourth work', () => {
  Element.prototype.scrollIntoView = vi.fn()

  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )

  expect(screen.getByRole('link', { name: 'Nighty case study' })).toHaveAttribute('href', '/work/nighty')
  expect(screen.getByText('04', { selector: '.count' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/pages/HomePage.test.tsx`
Expected: FAIL, no link named "Nighty case study".

- [ ] **Step 3: Append `NightyCover` to `src/components/ProjectCovers.tsx`**

Add `import { PILLOW, profileHeight } from '../nighty/shape'` beside the other imports, then append:

```tsx
/* Nighty ----------------------------------------------------------------- */

const nighty = {
  navy: '#26324a',
  ink: '#1b2233',
  muted: '#667085',
  blueSoft: '#c9d3ef',
  moon: '#f1d9a6',
  cover: '#efebe3',
  gusset: '#56606b',
  surface: '#e7eaf2',
  shadow: '#1d2740',
  font: 'Inter, sans-serif',
}

/** The pillow's side profile, traced from the same height curve the 3D model uses. */
function pillowProfile(left: number, base: number, scale: number) {
  const half = PILLOW.depth / 2
  const bandX = 40, bandY = 24
  const top: string[] = []
  for (let z = -half; z <= half; z += 6) {
    const edge = Math.min(1, Math.max(0, (Math.abs(z) - (half - bandX)) / bandX))
    const height = profileHeight(z) - bandY * (1 - Math.sqrt(1 - edge * edge))
    top.push(`${(left + (z + half) * scale).toFixed(1)} ${(base - height * scale).toFixed(1)}`)
  }
  const right = left + PILLOW.depth * scale
  return [
    `M${left} ${base - bandY * scale}`,
    `L${top.join(' L')}`,
    `L${right} ${base - bandY * scale}`,
    `Q${right} ${base} ${right - bandX * scale} ${base}`,
    `L${left + bandX * scale} ${base}`,
    `Q${left} ${base} ${left} ${base - bandY * scale}Z`,
  ].join(' ')
}

export function NightyCover() {
  const text = { fontFamily: nighty.font }
  const left = 145, base = 262, scale = 0.75
  const profile = pillowProfile(left, base, scale)
  // A night's sleep stages, deepest tallest.
  const stages = [14, 22, 30, 18, 12, 26, 30, 16, 12, 20, 14, 10]
  return (
    <svg className="project-cover" {...coverProps}>
      <circle cx="280" cy="170" r="140" fill="#fff" fillOpacity=".5" />

      {/* The pillow in profile: neck roll, head cradle, rear roll, pod at the back */}
      <path d={profile} fill={nighty.gusset} />
      <path d={profile} fill="none" stroke={nighty.cover} strokeWidth="9" strokeLinejoin="round" clipPath="url(#nighty-top)" />
      <defs>
        <clipPath id="nighty-top"><rect x={left - 10} y="150" width={PILLOW.depth * scale + 20} height="70" /></clipPath>
      </defs>
      <rect x={left - 5} y={base - 42 * scale} width="8" height={30 * scale} rx="3" fill="#b9bcc1" />
      <circle cx={left - 1} cy={base - 27 * scale} r="1.8" fill="#8fbfff" />

      {/* The room it is reading */}
      <g>
        <Edge x={52} y={40} w={150} h={92} r={16} tint={nighty.shadow} />
        <rect x="52" y="40" width="150" height="92" rx="16" fill="#fff" />
        <text x="70" y="64" {...text} fontSize="9" fontWeight="700" letterSpacing="1.4" fill={nighty.muted}>ROOM</text>
        <text x="70" y="96" {...text} fontSize="26" fontWeight="700" letterSpacing="-.6" fill={nighty.ink}>27.0°</text>
        <rect x="70" y="106" width="76" height="18" rx="9" fill={nighty.blueSoft} />
        <text x="108" y="118.5" {...text} fontSize="9" fontWeight="600" fill={nighty.navy} textAnchor="middle">Cooling on</text>
      </g>

      {/* White noise playing from inside the foam */}
      <g>
        <rect x="214" y="70" width="132" height="34" rx="17" fill={nighty.navy} />
        {[6, 12, 18, 10, 5].map((h, i) => (
          <rect key={i} x={232 + i * 5} y={87 - h / 2} width="2.4" height={h} rx="1.2" fill="#fff" />
        ))}
        <text x="264" y="91" {...text} fontSize="11" fontWeight="600" fill="#fff">White noise</text>
      </g>

      {/* Last night, in light and deep sleep */}
      <g>
        <Edge x={370} y={34} w={150} h={112} r={16} tint={nighty.shadow} />
        <rect x="370" y="34" width="150" height="112" rx="16" fill="#fff" />
        <text x="386" y="58" {...text} fontSize="9" fontWeight="700" letterSpacing="1.4" fill={nighty.muted}>LAST NIGHT</text>
        <text x="386" y="84" {...text} fontSize="18" fontWeight="700" letterSpacing="-.4" fill={nighty.ink}>7h 42m</text>
        {stages.map((h, i) => (
          <rect key={i} x={386 + i * 10} y={132 - h} width="7" height={h} rx="2" fill={h >= 26 ? nighty.navy : nighty.blueSoft} />
        ))}
      </g>
      <circle cx="506" cy="42" r="12" fill={nighty.moon} />
      <circle cx="512" cy="37" r="10" fill={nighty.surface} />
    </svg>
  )
}
```

- [ ] **Step 4: Add the project in `src/pages/HomePage.tsx`**

Change the cover import and list:

```tsx
import { ClaimlyCover, MedisyncCover, NightyCover, SizzleCover } from '../components/ProjectCovers'

const covers = [ClaimlyCover, MedisyncCover, SizzleCover, NightyCover]
```

Append to `projects`:

```tsx
  {
    name: 'Nighty',
    category: 'Sleep technology',
    chip: '#5b73b8',
    summary: 'A smart pillow that adjusts its temperature to the room, plays white noise, and tracks how deeply you sleep.',
    caseStudy: '/work/nighty',
  },
```

In `src/styles.css`, after `.work-tile--sizzle { --project-surface: #fbe9da; }`, add:

```css
.work-tile--nighty { --project-surface: #e7eaf2; }
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run`
Expected: PASS for the whole suite.

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectCovers.tsx src/pages/HomePage.tsx src/pages/HomePage.test.tsx src/styles.css
git commit -m "feat(nighty): add Nighty to the homepage with its cover"
```

---

### Task 9: Visual check, tuning and full verification

**Files:**
- Modify (tuning only, if the checks call for it): `src/nighty/parts.ts` offsets, `src/nighty/model.ts` materials, `src/nighty/stage.ts` framing and lights, `src/styles.css` Nighty block, `src/components/ProjectCovers.tsx` NightyCover.

- [ ] **Step 1: Start the dev server without the demo export step**

Run (background): `npx vite --port 5174`
Expected: Vite prints `Local: http://localhost:5174/`.

- [ ] **Step 2: Look at the model in Chrome at 1440 × 900**

Open `http://localhost:5174/work/nighty`. Check and fix until each is true:
- Assembled, the pillow reads as a contoured memory-foam pillow: neck roll higher than rear roll, cradle between them, raised shoulder ends, soft rounded edges, knit top and darker side panel, pod face visible only at the rear.
- No inner part pokes through the cover when assembled (orbit all the way round, including low angles).
- At 0%, 50% and 100%, parts leave in order without intersecting, the cover ghosts, the model stays framed and rests on its shadow, and every label sits beside its part.
- Hovering a part in the scene highlights its row; selecting a row fades the other parts; clicking empty space clears the selection.
- The console has no errors or warnings from three.js.

- [ ] **Step 3: Run the Review Focus checks**

1. Wheel over each viewer before clicking it: the page scrolls. Click the model, then wheel: it zooms. Move the pointer out: wheel scrolls the page again.
2. Emulate a phone (390 × 844, touch): a vertical swipe on either viewer scrolls the page; the slider still works.
3. Resize the window from 1440 to 700 wide and back: canvases stay sharp, labels stay attached.
4. Go Home, then back to Nighty, three times: no errors, no "Too many active WebGL contexts" warning, both viewers render.
5. Drag the slider quickly back and forth, and press Explode mid-tween: no jumps. With reduced motion emulated in DevTools, changes are immediate and the hero model does not auto-rotate.

- [ ] **Step 4: Check the homepage and the phone layout**

At 1440 and 390 wide: the Nighty cover sits in the flat blue-gray panel without clipping; the Nighty page has no horizontal scroll; the exploded stage and parts list stack below 900px.

- [ ] **Step 5: Run full verification**

Run: `npm test -- --run && npm run typecheck && npm run lint && npm run build`
Expected: all pass. The build lists a separate `NightyPage-*.js` chunk, and `grep -l WebGLRenderer dist/assets/*.js` names only that chunk, so the homepage bundle carries no three.js.

- [ ] **Step 6: Commit the tuning**

```bash
git add -A src
git commit -m "style(nighty): tune model framing, materials and layout from visual review"
```
