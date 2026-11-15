/**
 * 2D Canvas renderer.
 *
 * @module
 */

import type { Scene } from './Scene'

/**
 * Parameters for CanvasRenderer.
 *
 * @global
 */
export interface CanvasRendererParameters {
    /** Optional existing canvas element. */
    canvas?: HTMLCanvasElement
    /** Function returning canvas size [width, height]. */
    size(): [number, number]
    /** Optional pixel ratio. Defaults to 1 in non-browser. */
    pixelRatio?: number
}

/**
 * High-level 2D canvas renderer.
 *
 * @global
 * @example
 * ```ts
 * const renderer = new CanvasRenderer({
 *   size: () => [800, 600],
 *   pixelRatio: 2,
 * })
 *
 * renderer.render(scene)
 * ```
 */
export class CanvasRenderer {
    /** Canvas element. */
    readonly domElement: HTMLCanvasElement
    /** 2D rendering context. */
    readonly drawContext: CanvasRenderingContext2D
    /** Pixel ratio. */
    readonly pixelRatio: number
    /** Size function. */
    size: () => [number, number]

    /**
     * @param parameters - Renderer parameters.
     */
    constructor(parameters: CanvasRendererParameters) {
        this.size = parameters.size
        this.pixelRatio = parameters.pixelRatio ?? 1

        if (parameters.canvas) {
            this.domElement = parameters.canvas
        } else if (typeof document !== 'undefined') {
            this.domElement = document.createElement('canvas')
        } else {
            throw new Error('CanvasRenderer: no canvas provided and document is not available')
        }

        const context = this.domElement.getContext('2d')
        if (!context) {
            throw new Error('CanvasRenderer: unable to get 2d context')
        }

        this.drawContext = context
        this.onResize()
    }

    /**
     * Resize canvas to current size.
     *
     * @returns This renderer.
     */
    onResize(): this {
        const [w, h] = this.size()
        this.domElement.width = w * this.pixelRatio
        this.domElement.height = h * this.pixelRatio
        this.domElement.style.width = `${w}px`
        this.domElement.style.height = `${h}px`
        this.drawContext.resetTransform()
        this.drawContext.scale(this.pixelRatio, this.pixelRatio)
        return this
    }

    /**
     * Clear canvas.
     *
     * @returns This renderer.
     */
    clear(): this {
        this.drawContext.clearRect(0, 0, this.domElement.width, this.domElement.height)
        return this
    }

    /**
     * Render a scene.
     *
     * @param scene - Scene to render.
     * @returns This renderer.
     */
    render(scene: Scene): this {
        this.onResize()
        this.clear()

        if (scene.background) {
            this.drawContext.fillStyle = scene.background
            this.drawContext.fillRect(0, 0, ...this.size())
        }

        for (const child of scene.children) {
            child.render(this.drawContext)
        }

        return this
    }
}

export default CanvasRenderer
