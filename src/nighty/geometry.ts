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
