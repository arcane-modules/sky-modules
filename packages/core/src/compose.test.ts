import { describe, expect, expectTypeOf, it } from 'vitest'
import { compose, type Trait } from './index'

class Vector2 {
    x!: number
    y!: number

    constructor()
    constructor(x: number, y: number)
    constructor(x?: number, y?: number) {
        if (x != null && y != null) {
            this.set(x, y)
        }
    }

    set(x: number, y: number): this {
        this.x = x
        this.y = y
        return this
    }

    copy(other: Vector2): this {
        this.x = other.x
        this.y = other.y
        return this
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this)
    }

    move(dx: number, dy: number): this {
        this.x += dx
        this.y += dy
        return this
    }
}

class Size {
    w!: number
    h!: number

    constructor()
    constructor(w: number, h: number)
    constructor(w?: number, h?: number) {
        if (w != null && h != null) {
            this.set(w, h)
        }
    }

    set(w: number, h: number): this {
        this.w = w
        this.h = h
        return this
    }

    copy(other: Size): this {
        this.w = other.w
        this.h = other.h
        return this
    }

    clone(): this {
        return new (this.constructor as new () => this)().copy(this)
    }

    area(): number {
        return this.w * this.h
    }
}

class Rect extends compose(Vector2, Vector2, Size) {
    constructor()
    constructor(x: number, y: number, w: number, h: number)
    constructor(x?: number, y?: number, w?: number, h?: number) {
        super()
        if (x != null && y != null && w != null && h != null) {
            this.set(x, y, w, h)
        }
    }

    set(x: number, y: number, width: number, height: number): this {
        Vector2.prototype.set.call(this, x, y)
        Size.prototype.set.call(this, width, height)
        return this
    }
}

describe('trait', () => {
    it('is a plain class satisfying the Trait interface', () => {
        expectTypeOf(Vector2).toExtend<Trait<[x: number, y: number]>>()

        const a = new Vector2(1, 2)
        const b = a.clone()

        expect(b).toBeInstanceOf(Vector2)
        expect(b).not.toBe(a)
        expect(b.x).toBe(1)
        expect(b.y).toBe(2)
    })
})

describe('compose', () => {
    it('initializes fields through the user-defined set', () => {
        const rect = new Rect(1, 2, 3, 4)

        expect(rect.x).toBe(1)
        expect(rect.y).toBe(2)
        expect(rect.w).toBe(3)
        expect(rect.h).toBe(4)
        expect(rect.area()).toBe(12)
    })

    it('generates copy that runs copy of every trait', () => {
        const target = new Rect(0, 0, 0, 0)
        const result = target.copy(new Rect(1, 2, 3, 4))

        expect(result).toBe(target)
        expect([target.x, target.y, target.w, target.h]).toEqual([1, 2, 3, 4])
    })

    it('generates clone through a zero-argument constructor and copy', () => {
        const source = new Rect(1, 2, 3, 4)
        const clone = source.clone()

        expect(clone).toBeInstanceOf(Rect)
        expect(clone).not.toBe(source)
        expect([clone.x, clone.y, clone.w, clone.h]).toEqual([1, 2, 3, 4])
        expectTypeOf(clone).toEqualTypeOf<Rect>()
    })

    it('keeps trait methods on the base prototype once', () => {
        const a = new Rect(0, 0, 1, 1)
        const b = new Rect(0, 0, 1, 1)
        const base: object = Object.getPrototypeOf(Rect.prototype)

        expect(Object.hasOwn(a, 'move')).toBe(false)
        expect(Object.hasOwn(Rect.prototype, 'move')).toBe(false)
        expect(Object.hasOwn(base, 'move')).toBe(true)
        expect(Object.hasOwn(base, 'set')).toBe(false)
        expect(a.move).toBe(b.move)
    })

    it('collects methods inherited by a trait', () => {
        class Vector2Named extends Vector2 {
            label(): string {
                return `${this.x},${this.y}`
            }
        }

        class Point extends compose(Vector2Named) {
            constructor(x: number, y: number) {
                super()
                this.set(x, y)
            }

            set(x: number, y: number): this {
                Vector2.prototype.set.call(this, x, y)
                return this
            }
        }

        const point = new Point(1, 2).move(1, 1)

        expect(point.label()).toBe('2,3')
    })

    it('allows a composition to be used as a trait', () => {
        class Depth {
            z!: number

            constructor(z = 0) {
                this.set(z)
            }

            set(z: number): this {
                this.z = z
                return this
            }

            copy(other: Depth): this {
                this.z = other.z
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        class Box extends compose(Rect, Depth) {
            constructor(x: number, y: number, width: number, height: number, z: number) {
                super()
                this.set(x, y, width, height, z)
            }

            set(x: number, y: number, width: number, height: number, z: number): this {
                Rect.prototype.set.call(this, x, y, width, height)
                Depth.prototype.set.call(this, z)
                return this
            }
        }

        const clone = new Box(1, 2, 3, 4, 5).clone()

        expect([clone.x, clone.y, clone.w, clone.h, clone.z]).toEqual([1, 2, 3, 4, 5])
        expect(clone.area()).toBe(12)
    })

    it('allocates nested state of every trait in the base constructor', () => {
        class Bounds {
            readonly min: Vector2
            readonly max: Vector2

            constructor(min = new Vector2(0, 0), max = new Vector2(0, 0)) {
                this.min = new Vector2()
                this.max = new Vector2()
                this.set(min, max)
            }

            set(min: Vector2, max: Vector2): this {
                this.min.copy(min)
                this.max.copy(max)
                return this
            }

            copy(other: Bounds): this {
                this.min.copy(other.min)
                this.max.copy(other.max)
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        class Sprite extends compose(Vector2, Bounds) {
            constructor(x = 0, y = 0, min = new Vector2(0, 0), max = new Vector2(0, 0)) {
                super()
                this.set(x, y, min, max)
            }

            set(x: number, y: number, min: Vector2, max: Vector2): this {
                Vector2.prototype.set.call(this, x, y)
                Bounds.prototype.set.call(this, min, max)
                return this
            }
        }

        const a = new Sprite(1, 2, new Vector2(3, 4), new Vector2(5, 6))
        const b = new Sprite()
        const clone = a.clone()

        expect(a.min).not.toBe(b.min)
        expect(clone.min).not.toBe(a.min)
        expect([clone.x, clone.y, clone.min.x, clone.min.y, clone.max.x, clone.max.y]).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('accepts traits constructible through default values', () => {
        class Scale {
            factor: number

            constructor(factor = 1) {
                this.factor = factor
            }

            set(factor: number): this {
                this.factor = factor
                return this
            }

            copy(other: Scale): this {
                this.factor = other.factor
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        expectTypeOf(Scale).toExtend<Trait<[factor: number]>>()

        class Scaled extends compose(Scale) {
            set(factor: number): this {
                Scale.prototype.set.call(this, factor)
                return this
            }
        }

        expect(new Scaled().factor).toBe(1)
        expect(new Scaled().set(3).clone().factor).toBe(3)
    })

    it('accepts set with a union of argument tuples matched by constructor overloads', () => {
        class Tint {
            value!: number

            constructor(hex?: string)
            constructor(r: number, g: number, b: number)
            constructor(...args: [hex?: string] | [r: number, g: number, b: number]) {
                this.value = 0
                if (args[0] !== undefined) this.set(...(args as [string] | [number, number, number]))
            }

            set(...args: [hex: string] | [r: number, g: number, b: number]): this {
                this.value =
                    args.length === 1 ? Number.parseInt(args[0], 16) : (args[0] << 16) | (args[1] << 8) | args[2]
                return this
            }

            copy(other: Tint): this {
                this.value = other.value
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        class Tinted extends compose(Tint) {
            set(...args: [hex: string] | [r: number, g: number, b: number]): this {
                Tint.prototype.set.apply(this, args)
                return this
            }
        }

        expect(new Tinted().set('ff0000').clone().value).toBe(0xff0000)
        expect(new Tinted().set(0, 0, 255).value).toBe(255)
    })

    it('rejects traits that cannot be constructed without arguments', () => {
        class Required {
            value: number

            constructor(value: number) {
                this.value = value
            }

            set(value: number): this {
                this.value = value
                return this
            }

            copy(other: Required): this {
                this.value = other.value
                return this
            }

            clone(): this {
                return new (this.constructor as new (value: number) => this)(this.value)
            }
        }

        // @ts-expect-error constructor requires arguments
        compose(Required)
    })

    it('applies the same trait passed twice once', () => {
        class Twice extends compose(Vector2, Vector2) {
            set(x: number, y: number): this {
                Vector2.prototype.set.call(this, x, y)
                return this
            }
        }

        const copied = new Twice().set(1, 2).clone()

        expect([copied.x, copied.y]).toEqual([1, 2])
    })

    it('throws at runtime when two traits define the same member differently', () => {
        class Other {
            constructor() {
                this.set()
            }

            set(): this {
                return this
            }

            copy(_other: Other): this {
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }

            move(dx: number, dy: number): this {
                void dx
                void dy
                return this
            }
        }

        // @ts-expect-error member "move" has different types in Vector2 and Other
        expect(() => compose(Vector2, Other)).toThrow(/member "move" is defined by both "Vector2" and "Other"/)
    })

    it('infers the merged instance type', () => {
        const rect = new Rect(0, 0, 1, 1)

        expectTypeOf(rect.x).toEqualTypeOf<number>()
        expectTypeOf(rect.move).parameters.toEqualTypeOf<[dx: number, dy: number]>()
        expectTypeOf(rect.area()).toEqualTypeOf<number>()
        expectTypeOf(rect.copy).parameters.toEqualTypeOf<[other: Rect]>()
        // Known limitation: `this` of trait methods is fixed to the trait class
        expectTypeOf(rect.move(0, 0)).toEqualTypeOf<Vector2>()
    })

    it('rejects classes without the trait API at compile time', () => {
        class NoCopy {
            set(): this {
                return this
            }

            clone(): this {
                return this
            }
        }

        // @ts-expect-error NoCopy has no copy
        compose(NoCopy)
    })

    it('rejects set arguments that the constructor does not accept', () => {
        class Mismatch {
            value!: number

            constructor(value = 0) {
                this.value = value
            }

            set(value: string): this {
                this.value = Number(value)
                return this
            }

            copy(other: Mismatch): this {
                this.value = other.value
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        // @ts-expect-error constructor takes a number, set takes a string
        compose(Mismatch)
    })

    it('rejects incompatible field types at compile time', () => {
        class Label {
            x!: string

            constructor(x = '') {
                this.set(x)
            }

            set(x: string): this {
                this.x = x
                return this
            }

            copy(other: Label): this {
                this.x = other.x
                return this
            }

            clone(): this {
                return new (this.constructor as new () => this)().copy(this)
            }
        }

        // @ts-expect-error field "x" is number in Vector2 and string in Label
        compose(Vector2, Label)
    })
})
