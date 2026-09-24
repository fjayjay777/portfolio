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
/** Height of the explode controls laid over the bottom of the interactive stage, in CSS pixels. */
const CONTROLS_INSET = 72

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
  scene.environmentIntensity = 0.5

  const key = new DirectionalLight('#fff6ec', 1.7)
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

  const floor = new Mesh(new PlaneGeometry(4000, 4000), new ShadowMaterial({ opacity: 0.12 }))
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
    const contentHeight = lerp(240, 1080, amount)
    const contentWidth = lerp(760, 940, amount)
    const distance = Math.max(contentHeight / 2 / half, contentWidth / 2 / (half * camera.aspect)) * 1.08
    return { y: lerp(55, 340, amount), distance }
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
    // The interactive stage has its controls along the bottom, so centre the model in the space above them.
    if (interactive) camera.setViewOffset(width, height, 0, CONTROLS_INSET / 2, width, height)
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
