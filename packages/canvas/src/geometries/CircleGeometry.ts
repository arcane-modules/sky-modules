/**
 * Circle geometry.
 *
 * @module
 */

import type { Geometry } from './Geometry'

/**
 * Circle geometry parameters.
 *
 * @global
 */
export interface CircleGeometryParameters {
    x?: number
    y?: number
    radius: number
}

/**
 * Circle geometry for 2D canvas.
 *
 * @global
 */
export class CircleGeometry implements Geometry {
    /**
     * @param parameters - Circle parameters.
     */
    constructor(private parameters: CircleGeometryParameters) {}

    draw(ctx: CanvasRenderingContext2D): void {
        const { x = 0, y = 0, radius } = this.parameters

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.closePath()
    }
}

export default CircleGeometry
