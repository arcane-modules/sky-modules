/**
 * Base material interface for 2D canvas.
 *
 * @module
 */

/**
 * Material defines appearance for geometry.
 *
 * @global
 */
export interface Material {
    /** Apply material styles to canvas context. */
    apply(ctx: CanvasRenderingContext2D): void
}
