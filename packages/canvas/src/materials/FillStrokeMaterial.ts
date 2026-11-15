/**
 * Fill and stroke material.
 *
 * @module
 */

import type { Material } from './Material'

/**
 * Fill and stroke material parameters.
 *
 * @global
 */
export interface FillStrokeMaterialParameters {
    fill?: string
    stroke?: string
    strokeWidth?: number
}

/**
 * Material with optional fill and stroke.
 *
 * @global
 */
export class FillStrokeMaterial implements Material {
    /**
     * @param parameters - Material parameters.
     */
    constructor(private parameters: FillStrokeMaterialParameters) {}

    apply(ctx: CanvasRenderingContext2D): void {
        if (this.parameters.fill) {
            ctx.fillStyle = this.parameters.fill
        }
        if (this.parameters.stroke) {
            ctx.strokeStyle = this.parameters.stroke
            ctx.lineWidth = this.parameters.strokeWidth ?? 1
        }
    }
}

export default FillStrokeMaterial
