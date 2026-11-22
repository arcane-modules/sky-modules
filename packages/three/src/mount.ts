import { type JSX, render } from '@sky-modules/jsx'
import type { Object3D } from 'three'
import { ThreeNode } from './ThreeNode'

/** Renders a JSX view into `parent` (a scene or a group); returns the dispose function. */
export function mountThree(view: () => JSX.Element, parent: Object3D): () => void {
    return render(view, ThreeNode.wrap(parent))
}
