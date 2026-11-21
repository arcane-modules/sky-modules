/**
 * Type-only stub at the three.js path so that copied math typings resolve unchanged.
 * Structural subset of the three.js type: only members read by the copied math code.
 */

import type { Matrix4 } from '../math/Matrix4.js'
import type { Vector2 } from '../math/Vector2.js'

export interface Sprite {
    center: Vector2
    matrixWorld: Matrix4
}
