import { compose } from '@sky-modules/core'
import { describe, expect, it } from 'vitest'
import {
    Box2,
    Box3,
    Color,
    Cylindrical,
    Euler,
    Frustum,
    Line3,
    Matrix2,
    Matrix3,
    Matrix4,
    Plane,
    Quaternion,
    Ray,
    Sphere,
    Spherical,
    SphericalHarmonics3,
    Triangle,
    Vector2,
    Vector3,
    Vector4,
} from './index'

class Label {
    text: string

    constructor(text = '') {
        this.text = text
    }

    set(text: string): this {
        this.text = text
        return this
    }

    copy(other: Label): this {
        this.text = other.text
        return this
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this)
    }
}

describe('three.js math classes as traits', () => {
    it('pass the compose trait check', () => {
        const traits = [
            compose(Box2),
            compose(Box3),
            compose(Color),
            compose(Cylindrical),
            compose(Euler),
            compose(Frustum),
            compose(Line3),
            compose(Matrix3),
            compose(Matrix4),
            compose(Plane),
            compose(Quaternion),
            compose(Ray),
            compose(Sphere),
            compose(Spherical),
            compose(SphericalHarmonics3),
            compose(Triangle),
            compose(Vector2),
            compose(Vector3),
            compose(Vector4),
        ]

        expect(traits).toHaveLength(19)
    })

    it('rejects Matrix2 because three.js 0.187.0 defines no copy and clone for it', () => {
        // @ts-expect-error Matrix2 has no copy and clone
        compose(Matrix2)
    })

    it('allocates nested state of a three.js class inside a composition', () => {
        class LabeledBox extends compose(Box3, Label) {
            constructor(min?: Vector3, max?: Vector3, text?: string) {
                super()
                if (min !== undefined && max !== undefined && text !== undefined) this.set(min, max, text)
            }

            set(min: Vector3, max: Vector3, text: string): this {
                Box3.prototype.set.call(this, min, max)
                Label.prototype.set.call(this, text)
                return this
            }
        }

        const box = new LabeledBox(new Vector3(0, 0, 0), new Vector3(1, 2, 3), 'crate')
        const clone = box.clone()

        expect(clone).toBeInstanceOf(LabeledBox)
        expect(clone.min).not.toBe(box.min)
        expect(clone.max.toArray()).toEqual([1, 2, 3])
        expect(clone.text).toBe('crate')
        expect(clone.getSize(new Vector3()).toArray()).toEqual([1, 2, 3])
    })

    it('keeps internal callbacks of Euler working inside a composition', () => {
        class LabeledEuler extends compose(Euler, Label) {
            set(x: number, y: number, z: number, text: string): this {
                Euler.prototype.set.call(this, x, y, z)
                Label.prototype.set.call(this, text)
                return this
            }
        }

        const euler = new LabeledEuler().set(1, 2, 3, 'turn')
        let changes = 0
        euler._onChange(() => {
            changes += 1
        })
        euler.y = 7

        expect(changes).toBe(1)
        expect(euler.toArray()).toEqual([1, 7, 3, 'XYZ'])
        expect(euler.clone().toArray()).toEqual([1, 7, 3, 'XYZ'])
        expect(euler.clone().text).toBe('turn')
    })

    it('copies a Matrix4 composition through generated copy', () => {
        class NamedMatrix extends compose(Matrix4, Label) {
            set(...args: [...Parameters<Matrix4['set']>, text: string]): this {
                const text = args.pop() as string
                Matrix4.prototype.set.apply(this, args as unknown as Parameters<Matrix4['set']>)
                Label.prototype.set.call(this, text)
                return this
            }
        }

        const source = new NamedMatrix()
        source.makeTranslation(1, 2, 3)
        source.text = 'move'

        const target = new NamedMatrix().copy(source)

        expect(target.elements).not.toBe(source.elements)
        expect(target.elements).toEqual(source.elements)
        expect(target.text).toBe('move')
    })
})
