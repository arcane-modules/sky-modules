/**
 * Base geometry interface for 2D canvas.
 *
 * @module
 */

/**
 * Geometry defines shape to render.
 *
 * @global
 */
export interface Geometry {
    /** Draw geometry into canvas context. */
    draw(ctx: CanvasRenderingContext2D): void
}
