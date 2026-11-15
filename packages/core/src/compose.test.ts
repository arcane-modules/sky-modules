import { describe, expect, expectTypeOf, it } from 'vitest'
import { compose, defineTrait } from './index'

interface PositionFields {
    x: number
    y: number
}

const Position = defineTrait<'Position', PositionFields, object, [x: number, y: number]>({
    name: 'Position',
    init(x, y) {
        this.x = x
        this.y = y
    },
})

const Point = defineTrait<'Point', PositionFields, { move(dx: number, dy: number): void }, []>({
    name: 'Point',
    move(dx, dy) {
        this.x += dx
        this.y += dy
    },
})

const Rect = defineTrait<
    'Rect',
    { width: number; height: number },
    { area(): number },
    [width: number, height: number]
>({
    name: 'Rect',
    init(width, height) {
        this.width = width
        this.height = height
    },
    area() {
        return this.width * this.height
    },
})

describe('compose', () => {
    it('combines init of each trait on the same instance', () => {
        class Shape extends compose(Position, Point, Rect) {}

        const shape = new Shape({ Position: [10, 20], Rect: [100, 50] })

        expect(shape.x).toBe(10)
        expect(shape.y).toBe(20)
        expect(shape.width).toBe(100)
        expect(shape.height).toBe(50)
    })

    it('keeps stateless methods on the prototype once', () => {
        class Shape extends compose(Position, Point, Rect) {}

        const a = new Shape({ Position: [0, 0], Rect: [1, 1] })
        const b = new Shape({ Position: [0, 0], Rect: [1, 1] })

        expect(Object.hasOwn(a, 'move')).toBe(false)
        expect(Object.hasOwn(Shape.prototype, 'move')).toBe(false)
        expect(Object.hasOwn(Object.getPrototypeOf(Shape.prototype), 'move')).toBe(true)
        expect(a.move).toBe(b.move)
    })

    it('works with traits that have no init arguments', () => {
        class Movable extends compose(Position, Point) {}

        const m = new Movable({ Position: [1, 2] })
        m.move(5, 10)

        expect(m.x).toBe(6)
        expect(m.y).toBe(12)
    })

    it('runs init once when the same trait is passed twice', () => {
        let calls = 0
        const Counter = defineTrait<'Counter', { count: number }, object, []>({
            name: 'Counter',
            init() {
                calls += 1
                this.count = 0
            },
        })

        class Once extends compose(Counter, Counter) {}
        new Once()

        expect(calls).toBe(1)
    })

    it('throws at runtime when two different traits share a name', () => {
        const First = defineTrait<'Same', object, object, []>({ name: 'Same' })
        const Second = defineTrait<'Same', object, object, []>({ name: 'Same' })

        expect(() => compose(First, Second)).toThrow(/share the name "Same"/)
    })

    it('throws at runtime when two traits define the same method differently', () => {
        const A = defineTrait<'A', object, { run(): number }, []>({
            name: 'A',
            run() {
                return 1
            },
        })
        const B = defineTrait<'B', object, { run(): number }, []>({
            name: 'B',
            run() {
                return 2
            },
        })

        expect(() => compose(A, B)).toThrow(/method "run" is defined by both "A" and "B"/)
    })

    it('infers instance type from merged traits', () => {
        class Shape extends compose(Position, Point, Rect) {}
        const shape = new Shape({ Position: [0, 0], Rect: [1, 1] })

        expectTypeOf(shape.x).toEqualTypeOf<number>()
        expectTypeOf(shape.move).parameters.toEqualTypeOf<[dx: number, dy: number]>()
        expectTypeOf(shape.area()).toEqualTypeOf<number>()
    })

    it('requires init arguments of traits that have them', () => {
        class Only extends compose(Rect) {}
        // @ts-expect-error Rect requires its init arguments
        new Only({})
        new Only({ Rect: [1, 1] })
    })

    it('rejects incompatible field types at compile time', () => {
        const Named = defineTrait<'Named', { x: string }, object, []>({ name: 'Named' })

        // @ts-expect-error field "x" is number in Position and string in Named
        compose(Position, Named)
    })

    it('rejects conflicting methods at compile time', () => {
        const Other = defineTrait<'Other', object, { move(dx: string): void }, []>({
            name: 'Other',
            move() {},
        })

        // @ts-expect-error method "move" has different signatures in Point and Other
        expect(() => compose(Point, Other)).toThrow(/method "move"/)
    })
})
