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
  const gradient = context.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.15)
  gradient.addColorStop(0, hole)
  gradient.addColorStop(0.8, hole)
  gradient.addColorStop(1, face)
  context.fillStyle = gradient
  context.beginPath()
  context.arc(width / 2, height / 2, width * 0.15, 0, Math.PI * 2)
  context.fill()
}

/** The comfort layer's ventilation holes, one per 14 mm cell: colour multiplier and height map. */
export function perforationMap() {
  return once('perforation-map', () => tiled(paint(128, 128, (context, width, height) => perforation(context, width, height, '#a3aaae', '#ffffff')), 14, true))
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
