/**
 * Rectangle geometry.
 *
 * @module
 */

import type { Geometry } from './Geometry'

/**
 * Rectangle geometry parameters.
 *
 * @global
 */
export interface RectGeometryParameters {
    x?: number
    y?: number
    width: number
    height: number
    radius?: number
}

/**
 * Rectangle geometry for 2D canvas.
 *
 * @global
 */
export class RectGeometry implements Geometry {
    /**
     * @param parameters - Rectangle parameters.
     */
    constructor(private parameters: RectGeometryParameters) {}

    draw(ctx: CanvasRenderingContext2D): void {
        const { x = 0, y = 0, width, height, radius = 0 } = this.parameters

        if (radius > 0) {
            ctx.beginPath()
            ctx.roundRect(x, y, width, height, radius)
            ctx.closePath()
        } else {
            ctx.rect(x, y, width, height)
        }
    }
}

export default RectGeometry
