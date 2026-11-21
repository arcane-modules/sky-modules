/**
 * Type-only stub at the three.js path so that copied math typings resolve unchanged.
 * Structural subset of the three.js type: only members read by the copied math code.
 */

import type { Box3 } from '../math/Box3.js'
import type { Matrix4 } from '../math/Matrix4.js'
import type { Sphere } from '../math/Sphere.js'
import type { Vector3 } from '../math/Vector3.js'
import type { BufferAttribute } from './BufferAttribute.js'

export interface Object3DGeometry {
    boundingBox: Box3 | null
    boundingSphere: Sphere | null
    computeBoundingBox(): void
    computeBoundingSphere(): void
    getAttribute(name: 'position'): BufferAttribute | undefined
}

export interface Object3D {
    matrixWorld: Matrix4
    children: Object3D[]
    geometry?: Object3DGeometry
    boundingBox?: Box3 | null
    boundingSphere?: Sphere | null
    isMesh?: boolean
    isInstancedMesh?: boolean
    isBatchedMesh?: boolean
    computeBoundingBox?(): void
    computeBoundingSphere?(): void
    getVertexPosition?(index: number, target: Vector3): Vector3
    updateWorldMatrix(updateParents: boolean, updateChildren: boolean): void
}
