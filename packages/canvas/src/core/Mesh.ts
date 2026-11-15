/**
 * 2D mesh with geometry and material.
 *
 * @module
 */

import type { Geometry } from '../geometries/Geometry'
import type { Material } from '../materials/Material'
import { Object2D } from './Object2D'

/**
 * Mesh combines geometry and material for rendering.
 *
 * @global
 */
export class Mesh extends Object2D {
    /**
     * @param geometry - Geometry to render.
     * @param material - Material to apply.
     */
    constructor(
        public geometry: Geometry,
        public material: Material
    ) {
        super()
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.material.apply(ctx)
        this.geometry.draw(ctx)
    }
}

export default Mesh
