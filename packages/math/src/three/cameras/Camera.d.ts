/**
 * Type-only stub at the three.js path so that copied math typings resolve unchanged.
 * Structural subset of the three.js type: only members read by the copied math code.
 */

import type { CoordinateSystem } from '../constants.js'
import type { Matrix4 } from '../math/Matrix4.js'

export interface Camera {
    matrixWorld: Matrix4
    matrixWorldInverse: Matrix4
    projectionMatrix: Matrix4
    projectionMatrixInverse: Matrix4
    coordinateSystem: CoordinateSystem
    reversedDepth: boolean
}
