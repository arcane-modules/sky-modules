/**
 * Basic fill material.
 *
 * @module
 */

import type { Material } from './Material'

/**
 * Basic material parameters.
 *
 * @global
 */
export interface BasicMaterialParameters {
    color: string
}

/**
 * Basic fill material for 2D canvas.
 *
 * @global
 */
export class BasicMaterial implements Material {
    /**
     * @param parameters - Material parameters.
     */
    constructor(private parameters: BasicMaterialParameters) {}

    apply(ctx: CanvasRenderingContext2D): void {
        ctx.fillStyle = this.parameters.color
    }
}

export default BasicMaterial
