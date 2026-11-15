import { vi } from 'vitest'

/**
 * @global
 * Mock implementation of CanvasRenderingContext2D for testing.
 */
export class MockCanvasRenderingContext2D {
    fillStyle: string | CanvasGradient | CanvasPattern = '#000000'
    strokeStyle: string | CanvasGradient | CanvasPattern = '#000000'
    globalAlpha = 1
    lineWidth = 1
    lineCap: CanvasLineCap = 'butt'
    lineJoin: CanvasLineJoin = 'miter'
    lineDashOffset = 0
    shadowBlur = 0
    shadowColor = 'transparent'
    shadowOffsetX = 0
    shadowOffsetY = 0
    globalCompositeOperation: GlobalCompositeOperation = 'source-over'
    font = '10px sans-serif'
    textAlign: CanvasTextAlign = 'start'
    textBaseline: CanvasTextBaseline = 'alphabetic'
    canvas: HTMLCanvasElement | null = null

    rect = vi.fn()
    arc = vi.fn()
    ellipse = vi.fn()
    moveTo = vi.fn()
    lineTo = vi.fn()
    bezierCurveTo = vi.fn()
    quadraticCurveTo = vi.fn()
    arcTo = vi.fn()
    closePath = vi.fn()
    fill = vi.fn()
    stroke = vi.fn()
    setLineDash = vi.fn()
    clearRect = vi.fn()
    fillRect = vi.fn()
    strokeRect = vi.fn()
    beginPath = vi.fn()
    clip = vi.fn()

    save = vi.fn()
    restore = vi.fn()
    scale = vi.fn()
    rotate = vi.fn()
    translate = vi.fn()
    transform = vi.fn()
    setTransform = vi.fn()
    resetTransform = vi.fn()

    fillText = vi.fn()
    strokeText = vi.fn()
    measureText = vi.fn((_text: string) => ({ width: 100 }) as unknown as TextMetrics)

    createLinearGradient = vi.fn((_x0: number, _y0: number, _x1: number, _y1: number) => ({
        addColorStop: vi.fn(),
    }))
    createRadialGradient = vi.fn((_x0: number, _y0: number, _r0: number, _x1: number, _y1: number, _r1: number) => ({
        addColorStop: vi.fn(),
    }))
    createPattern = vi.fn((): CanvasPattern | null => null)

    getImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
        colorSpace: 'srgb' as PredefinedColorSpace,
    }))
    putImageData = vi.fn()
    createImageData = vi.fn(() => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
        colorSpace: 'srgb' as PredefinedColorSpace,
    }))

    drawImage = vi.fn()
    isPointInPath = vi.fn(() => false)
    isPointInStroke = vi.fn(() => false)
}

/**
 * Mock implementation of HTMLCanvasElement for testing.
 */
export class MockHTMLCanvasElement {
    private _width = 300
    private _height = 150

    get width(): number {
        return this._width
    }
    set width(value: number) {
        this._width = value
    }

    get height(): number {
        return this._height
    }
    set height(value: number) {
        this._height = value
    }

    style: Partial<CSSStyleDeclaration> = {}
    tagName = 'CANVAS' as const
    nodeName = 'CANVAS' as const
    nodeType = 1
    ownerDocument: Document | null = null
    parentNode: Node | null = null
    childNodes: Array<Node> = []
    firstChild: Node | null = null
    lastChild: Node | null = null
    nextSibling: Node | null = null
    previousSibling: Node | null = null

    getContext(contextId: string): MockCanvasRenderingContext2D | null {
        if (contextId === '2d') {
            return new MockCanvasRenderingContext2D()
        }

        return null
    }

    appendChild(child: Node): Node {
        return child
    }

    removeChild(child: Node): Node {
        return child
    }

    insertBefore(newNode: Node, _referenceNode: Node | null): Node {
        return newNode
    }

    cloneNode(_deep?: boolean): MockHTMLCanvasElement {
        return new MockHTMLCanvasElement()
    }

    contains(_other: Node | null): boolean {
        return false
    }

    hasChildNodes(): boolean {
        return false
    }

    addEventListener = vi.fn()
    removeEventListener = vi.fn()
    dispatchEvent = vi.fn(() => true)

    getBoundingClientRect = vi.fn(() => ({
        x: 0,
        y: 0,
        width: this._width,
        height: this._height,
        top: 0,
        right: this._width,
        bottom: this._height,
        left: 0,
        toJSON: () => {},
    }))

    getClientRects = vi.fn(() => [])
    scrollIntoView = vi.fn()
    scrollTo = vi.fn()
    setAttribute = vi.fn()
    getAttribute = vi.fn(() => null)
    removeAttribute = vi.fn()
    hasAttribute = vi.fn(() => false)
}

/**
 * Setup Canvas mocks in global scope.
 * Call in test setup or at the start of test suites.
 *
 * @example
 * ```typescript
 * import { setupCanvasMocks } from '@sky-modules/testing'
 *
 * setupCanvasMocks()
 * ```
 */
export function setupCanvasMocks(): void {
    if (typeof document !== 'undefined') {
        const originalCreateElement = document.createElement.bind(document)
        document.createElement = <K extends keyof HTMLElementTagNameMap>(
            tagName: K,
            options?: ElementCreationOptions
        ): HTMLElementTagNameMap[K] => {
            if (tagName === 'canvas') {
                return new MockHTMLCanvasElement() as unknown as HTMLElementTagNameMap[K]
            }

            return originalCreateElement(tagName, options)
        }
    }

    if (typeof window !== 'undefined') {
        Object.defineProperty(window, 'devicePixelRatio', {
            writable: true,
            configurable: true,
            value: 1,
        })
    }

    let rafId = 0
    const mockRaf = (_callback: FrameRequestCallback): number => ++rafId
    const mockCancelRaf = (_id: number): void => {}

    const w = globalThis as unknown as Record<string, unknown>
    w.requestAnimationFrame = mockRaf
    w.cancelAnimationFrame = mockCancelRaf

    if (typeof window !== 'undefined') {
        const win = window as unknown as Record<string, unknown>
        win.requestAnimationFrame = mockRaf
        win.cancelAnimationFrame = mockCancelRaf
    }
}
