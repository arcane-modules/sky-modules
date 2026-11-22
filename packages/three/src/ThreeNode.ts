import type { JSXNode } from '@sky-modules/jsx'
import {
    BufferGeometry,
    Color,
    type ColorRepresentation,
    Euler,
    type EulerOrder,
    Material,
    Object3D,
    Vector2,
    Vector3,
} from 'three'

/** Object a `ThreeNode` can hold. */
export type ThreeObject = Object3D | BufferGeometry | Material

/** Creates the three object for a tag from constructor arguments. */
export type ThreeFactory<T extends ThreeObject> = (args: readonly unknown[]) => T

/**
 * Structural vector types: any compatible math (three.js, @sky-modules/math) is accepted,
 * not only the classes of the `three` instance this package resolves.
 */
export interface Vector3Like {
    readonly x: number
    readonly y: number
    readonly z: number
}

export interface Vector2Like {
    readonly x: number
    readonly y: number
}

export interface EulerLike extends Vector3Like {
    readonly order: EulerOrder
}

/** Object that can hold a geometry and a material: `Mesh`, `Line`, `Points`. */
interface Renderable {
    geometry: BufferGeometry
    material: Material | Material[]
}

function isRenderable(object: ThreeObject): object is Object3D & Renderable {
    return object instanceof Object3D && 'geometry' in object && 'material' in object
}

function isNumberArray(value: unknown): value is readonly number[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'number')
}

function hasNumbers<K extends string>(value: unknown, keys: readonly K[]): value is Record<K, number> {
    if (value === null || typeof value !== 'object') return false
    const record = value as Record<string, unknown>
    return keys.every((key) => typeof record[key] === 'number')
}

function isVector3Like(value: unknown): value is Vector3Like {
    return hasNumbers(value, ['x', 'y', 'z'])
}

function isVector2Like(value: unknown): value is Vector2Like {
    return hasNumbers(value, ['x', 'y'])
}

function isEulerLike(value: unknown): value is EulerLike {
    return isVector3Like(value) && typeof (value as { order?: unknown }).order === 'string'
}

function setVector3(target: Vector3, value: unknown, name: string): void {
    if (isNumberArray(value) && value.length === 3) target.set(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0)
    else if (isVector3Like(value)) target.set(value.x, value.y, value.z)
    else throw new TypeError(`ThreeNode: "${name}" expects [x, y, z] or a vector`)
}

function setEuler(target: Euler, value: unknown, name: string): void {
    if (isNumberArray(value) && value.length === 3) target.set(value[0] ?? 0, value[1] ?? 0, value[2] ?? 0)
    else if (isEulerLike(value)) target.set(value.x, value.y, value.z, value.order)
    else throw new TypeError(`ThreeNode: "${name}" expects [x, y, z] or an Euler`)
}

function setVector2(target: Vector2, value: unknown, name: string): void {
    if (isNumberArray(value) && value.length === 2) target.set(value[0] ?? 0, value[1] ?? 0)
    else if (isVector2Like(value)) target.set(value.x, value.y)
    else throw new TypeError(`ThreeNode: "${name}" expects [x, y] or a vector`)
}

// Numeric material fields that select a different shader program; other numbers are uniforms
const PROGRAM_NUMBER_FIELDS: ReadonlySet<string> = new Set([
    'side',
    'alphaTest',
    'combine',
    'depthPacking',
    'normalMapType',
    'precision',
])

/**
 * Whether assigning \`value\` to a material field requires recompiling its program.
 * Colors and plain numbers (opacity, roughness, size…) are uniforms and update without it.
 */
export function requiresProgramUpdate(name: string, value: unknown): boolean {
    if (typeof value === 'number') return PROGRAM_NUMBER_FIELDS.has(name)
    return true
}

/** Writes `value` into an existing property, updating math objects in place. */
function assignProperty(target: ThreeObject, name: string, value: unknown): void {
    const record = target as unknown as Record<string, unknown>
    const current = record[name]

    if (current instanceof Color) {
        current.set(value as ColorRepresentation)
        return
    }

    if (current instanceof Vector3) setVector3(current, value, name)
    else if (current instanceof Vector2) setVector2(current, value, name)
    else if (current instanceof Euler) setEuler(current, value, name)
    else record[name] = value

    if (target instanceof Material && requiresProgramUpdate(name, value)) target.needsUpdate = true
}

/** `JSXNode` holding a three.js object. */
export class ThreeNode<T extends ThreeObject = ThreeObject> implements JSXNode {
    object: T
    private readonly children: JSXNode[] = []
    /** Renderable this geometry or material is attached to. */
    private holder: ThreeNode | undefined

    constructor(
        readonly tag: string,
        private readonly factory: ThreeFactory<T>
    ) {
        this.object = factory([])
    }

    /** Wraps an existing object (a scene or a group) as a mount root. */
    static wrap<T extends ThreeObject>(object: T): ThreeNode<T> {
        return new ThreeNode('root', () => object)
    }

    setJSXProperty(name: string, value: unknown): void {
        const { object } = this

        if (name === 'args') {
            this.recreate(Array.isArray(value) ? value : [])
            return
        }

        if (object instanceof Object3D) {
            if (name === 'position') {
                setVector3(object.position, value, name)
                return
            }
            if (name === 'scale') {
                if (typeof value === 'number') object.scale.setScalar(value)
                else setVector3(object.scale, value, name)
                return
            }
            if (name === 'rotation') {
                setEuler(object.rotation, value, name)
                return
            }
            if (name === 'lookAt') {
                const point = new Vector3()
                setVector3(point, value, name)
                object.lookAt(point)
                return
            }
        }

        assignProperty(object, name, value)
    }

    insertJSXChild(child: JSXNode, anchor: JSXNode | undefined): void {
        const index = anchor === undefined ? -1 : this.children.indexOf(anchor)
        if (index === -1) this.children.push(child)
        else this.children.splice(index, 0, child)

        if (child instanceof ThreeNode) this.attach(child)
    }

    removeJSXChild(child: JSXNode): void {
        const index = this.children.indexOf(child)
        if (index !== -1) this.children.splice(index, 1)

        if (child instanceof ThreeNode) this.detach(child)
    }

    getJSXChildren(): readonly JSXNode[] {
        return this.children
    }

    disposeJSX(): void {
        const { object } = this
        if (object instanceof BufferGeometry || object instanceof Material) object.dispose()
    }

    private attach(child: ThreeNode): void {
        const parent = this.object
        const value = child.object

        if (value instanceof Object3D) {
            if (!(parent instanceof Object3D))
                throw new TypeError(`ThreeNode: <${this.tag}> cannot hold <${child.tag}>`)
            parent.add(value)
            return
        }

        if (!isRenderable(parent)) throw new TypeError(`ThreeNode: <${child.tag}> needs a mesh, line or points parent`)
        if (value instanceof BufferGeometry) parent.geometry = value
        else parent.material = value
        child.holder = this
    }

    private detach(child: ThreeNode): void {
        if (child.object instanceof Object3D && this.object instanceof Object3D) this.object.remove(child.object)
        if (child.holder === this) child.holder = undefined
    }

    /** Rebuilds a geometry or material from new constructor arguments. */
    private recreate(args: readonly unknown[]): void {
        if (this.object instanceof Object3D) {
            throw new TypeError(`ThreeNode: "args" is not supported on <${this.tag}>; set its properties instead`)
        }

        const previous = this.object
        this.object = this.factory(args)
        previous.dispose()
        this.holder?.attach(this)
    }
}
