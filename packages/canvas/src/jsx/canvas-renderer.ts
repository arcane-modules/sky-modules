/**
 * JSX renderer for 2D canvas.
 *
 * Maps element descriptions (`{ type, props }`) to canvas scene graph objects.
 *
 * @module
 */

import { Mesh } from '../core/Mesh'
import { Group } from '../core/Group'
import { RectGeometry } from '../geometries/RectGeometry'
import { CircleGeometry } from '../geometries/CircleGeometry'
import { BasicMaterial } from '../materials/BasicMaterial'
import { FillStrokeMaterial } from '../materials/FillStrokeMaterial'

/**
 * Component that returns a canvas element description.
 */
export type CanvasComponent = (props: Record<string, unknown>) => CanvasJSXNode

/**
 * Element description: an intrinsic tag (`rect`, `circle`, `group`) or a component, plus props.
 */
export interface CanvasElement {
    type: string | CanvasComponent
    props: Record<string, unknown>
}

/**
 * Node accepted by the canvas renderer.
 */
export type CanvasJSXNode = CanvasElement | CanvasJSXNode[] | null | undefined

/**
 * Create a canvas object from JSX element.
 *
 * @global
 * @param element - JSX element.
 * @returns Canvas object or null.
 */
export function createCanvasObject(element: CanvasJSXNode): unknown {
    if (!element || Array.isArray(element)) return null

    const { type, props } = element
    const children = (props.children ?? []) as CanvasJSXNode[]

    if (typeof type === 'function') {
        return createCanvasObject(type(props))
    }

    let object: Mesh | Group | null = null

    switch (type) {
        case 'rect': {
            const geometry = new RectGeometry({
                x: (props.x as number) ?? 0,
                y: (props.y as number) ?? 0,
                width: props.width as number,
                height: props.height as number,
                radius: props.radius as number,
            })
            const material = props.stroke
                ? new FillStrokeMaterial({
                      fill: props.fill as string,
                      stroke: props.stroke as string,
                      strokeWidth: props.strokeWidth as number,
                  })
                : new BasicMaterial({ color: (props.fill as string) ?? '#000000' })
            object = new Mesh(geometry, material)
            break
        }
        case 'circle': {
            const geometry = new CircleGeometry({
                x: (props.x as number) ?? 0,
                y: (props.y as number) ?? 0,
                radius: props.radius as number,
            })
            const material = props.stroke
                ? new FillStrokeMaterial({
                      fill: props.fill as string,
                      stroke: props.stroke as string,
                      strokeWidth: props.strokeWidth as number,
                  })
                : new BasicMaterial({ color: (props.fill as string) ?? '#000000' })
            object = new Mesh(geometry, material)
            break
        }
        case 'group':
            object = new Group()
            break
        default:
            return null
    }

    if (object) {
        if (props.x !== undefined) object.x = props.x as number
        if (props.y !== undefined) object.y = props.y as number
        if (props.rotation !== undefined) object.rotation = props.rotation as number
        if (props.scaleX !== undefined) object.scaleX = props.scaleX as number
        if (props.scaleY !== undefined) object.scaleY = props.scaleY as number
        if (props.visible !== undefined) object.visible = props.visible as boolean

        for (const child of children) {
            const childObject = createCanvasObject(child)
            if (childObject instanceof Mesh || childObject instanceof Group) {
                object.add(childObject)
            }
        }
    }

    return object
}
