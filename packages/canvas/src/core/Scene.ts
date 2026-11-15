/**
 * 2D canvas scene.
 *
 * @module
 */

import { Object2D } from './Object2D'

/**
 * Scene root for 2D canvas rendering.
 *
 * @global
 */
export class Scene extends Object2D {
    /** Optional background color. */
    background?: string
}

export default Scene
