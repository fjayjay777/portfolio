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
  driver.add(
    solid(kit.geometry(lathe([[0, 0], [22, 0], [24.4, 0.5], [25, 1.6], [25, 8.4], [24.5, 9.6], [23.4, 10], [21.9, 10], [21.5, 9.2], [21.5, 8.6]])), basket),
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
