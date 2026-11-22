/**
 * @sky-modules/three
 *
 * three.js elements for the Solid 2 universal renderer of @sky-modules/jsx.
 * Importing the package registers the tags (`mesh`, `group`, `boxGeometry`…).
 *
 * @module
 */

import type { ThreeIntrinsicElements } from './types'

export { GEOMETRY_ELEMENTS, MATERIAL_ELEMENTS, OBJECT_ELEMENTS, THREE_ELEMENTS, type ThreeTag } from './elements'
export { mountThree } from './mount'
export {
    type EulerLike,
    type ThreeFactory,
    ThreeNode,
    type ThreeObject,
    type Vector2Like,
    type Vector3Like,
} from './ThreeNode'
export type { EulerInput, ThreeIntrinsicElements, Vector3Input } from './types'

declare module '@sky-modules/jsx/jsx-runtime' {
    namespace JSX {
        interface IntrinsicElements extends ThreeIntrinsicElements {}
    }
}
