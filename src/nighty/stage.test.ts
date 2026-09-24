import { afterEach, beforeAll, beforeEach, expect, test, vi } from 'vitest'
import { createStage, type StageInput } from './stage'

/*
 * jsdom has no WebGL, so the renderer and the environment baker are replaced
 * with recorders. Everything else (scene, camera, controls, model) is real.
 */
const fakes = vi.hoisted(() => [] as {
  options: unknown
  domElement: HTMLCanvasElement
  setPixelRatio: ReturnType<typeof vi.fn>
  render: ReturnType<typeof vi.fn>
  dispose: ReturnType<typeof vi.fn>
  forceContextLoss: ReturnType<typeof vi.fn>
}[])

vi.mock('three', async (importOriginal) => {
  const three = await importOriginal<typeof import('three')>()
  class FakeRenderer {
    domElement = document.createElement('canvas')
    shadowMap = { enabled: false, type: 0 }
    toneMapping = 0
    setPixelRatio = vi.fn()
    setSize = vi.fn()
    render = vi.fn()
    dispose = vi.fn()
    forceContextLoss = vi.fn()
    constructor(public options: unknown) {
      fakes.push(this)
    }
  }
  class FakePMREMGenerator {
    fromScene() {
      return { texture: { dispose() {} } }
    }
    dispose() {}
  }
  return { ...three, WebGLRenderer: FakeRenderer, PMREMGenerator: FakePMREMGenerator }
})

let frames: FrameRequestCallback[] = []
let reveal: (visible: boolean) => void = () => undefined
let clock = 0

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => null)
})

beforeEach(() => {
  frames = []
  clock = performance.now()
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
  vi.stubGlobal('cancelAnimationFrame', () => undefined)
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: IntersectionObserverCallback) {
      reveal = (visible) => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    observe() {}
    disconnect() {}
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
  document.body.innerHTML = ''
})

function mount(interactive = true) {
  const host = document.createElement('div')
  document.body.append(host)
  const input: StageInput = { explode: 0, activeId: null }
  const stage = createStage(host, { interactive, labels: [], read: () => input })
  const renderer = fakes[fakes.length - 1]
  reveal(true)
  return { host, input, stage, renderer }
}

function frame(count = 1) {
  for (let i = 0; i < count; i++) {
    clock += 16
    frames.shift()?.(clock)
  }
}

test('lets a finger scroll the page on every device, not only phones', () => {
  const { renderer } = mount()
  expect(renderer.domElement.style.touchAction).toBe('pan-y')
})

test('redraws at the new pixel ratio when the page moves to a sharper display', () => {
  const { renderer } = mount()
  frame()
  Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
  frame()
  expect(renderer.setPixelRatio).toHaveBeenLastCalledWith(2)
})

test('stops drawing once the scene is still, and draws again when it changes', () => {
  const { renderer, input } = mount()
  frame(3)
  const settled = renderer.render.mock.calls.length
  frame(5)
  expect(renderer.render.mock.calls.length).toBe(settled)
  input.explode = 1
  frame()
  expect(renderer.render.mock.calls.length).toBeGreaterThan(settled)
})

test('does not ask for the high-performance GPU', () => {
  const { renderer } = mount()
  expect(renderer.options).not.toMatchObject({ powerPreference: 'high-performance' })
})

test('releases the renderer, its context and its canvas', () => {
  const { host, renderer, stage } = mount()
  stage.dispose()
  expect(renderer.dispose).toHaveBeenCalled()
  expect(renderer.forceContextLoss).toHaveBeenCalled()
  expect(host.querySelector('canvas')).toBeNull()
})
